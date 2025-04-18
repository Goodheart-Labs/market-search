/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useState, useEffect } from "react";
import type { Market, MarketStatus } from "@/lib/types";
import { SearchInput } from "@/components/SearchInput";
import { MarketCard } from "@/components/MarketCard";
import { MarketStatusFilter } from "@/components/MarketStatusFilter";
import { SourceFilter, type MarketSource } from "@/components/SourceFilter";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { throttle } from "lodash";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

type SearchResponse = {
  markets: Omit<Market, "embedding" | "open_time">[];
  nextCursor: string | null;
};

type SearchParams = {
  searchQuery: string;
  embedding?: number[];
  cursor?: string | null;
  status: MarketStatus;
  sources?: MarketSource[];
};

export default function Home() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query");
  const statusParam = (searchParams.get("status") as MarketStatus) || "open";
  const sourcesParam = (searchParams
    .get("sources")
    ?.split(",") as MarketSource[]) || ["manifold", "polymarket", "kalshi"];
  const [query, setQuery] = useState(queryParam || "");
  const [throttledQuery, setThrottledQuery] = useState(queryParam || "");
  const [status, setStatus] = useState<MarketStatus>(statusParam);
  const [sources, setSources] = useState<MarketSource[]>(sourcesParam);
  const { replace } = useRouter();
  const throttledSearch = useCallback(
    throttle((searchQuery: string) => {
      setThrottledQuery(searchQuery);
    }, 300),
    []
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    throttledSearch(query);
  }, [query, throttledSearch]);

  const embeddingQuery = useQuery({
    queryKey: ["embedding", throttledQuery],
    queryFn: ({ queryKey }) => getEmbedding(queryKey[1]),
    enabled: !!throttledQuery,
  });

  const queryEmbedding = queryClient.getQueryData<number[]>([
    "embedding",
    queryParam,
  ]);

  const searchMarketsQuery = useInfiniteQuery({
    queryKey: ["searchMarkets", queryParam, queryEmbedding, status, sources],
    queryFn: async ({ pageParam }) => {
      const result = await searchMarkets({
        searchQuery: queryParam as string,
        embedding: queryEmbedding,
        cursor: pageParam,
        status,
        sources: sources.length > 0 ? sources : undefined,
      });
      if (!result) {
        throw new Error("Search failed");
      }
      return result;
    },
    placeholderData: (data) => data,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    enabled:
      !!queryParam && !!embeddingQuery.data && queryParam === throttledQuery,
  });

  const setSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", query);
      params.set("status", status);
      if (sources.length > 0) {
        params.set("sources", sources.join(","));
      } else {
        params.delete("sources");
      }
      replace(`?${params.toString()}`);
    },
    [searchParams, replace, status, sources]
  );

  const handleStatusChange = useCallback(
    (newStatus: MarketStatus) => {
      setStatus(newStatus);
      const params = new URLSearchParams(searchParams);
      if (queryParam) {
        params.set("query", queryParam);
      }
      params.set("status", newStatus);
      if (sources.length > 0) {
        params.set("sources", sources.join(","));
      }
      replace(`?${params.toString()}`);
    },
    [searchParams, replace, queryParam, sources]
  );

  const handleSourcesChange = useCallback(
    (newSources: MarketSource[]) => {
      setSources(newSources);
      const params = new URLSearchParams(searchParams);
      if (queryParam) {
        params.set("query", queryParam);
      }
      params.set("status", status);
      if (newSources.length > 0) {
        params.set("sources", newSources.join(","));
      } else {
        params.delete("sources");
      }
      replace(`?${params.toString()}`);
    },
    [searchParams, replace, queryParam, status]
  );

  // if we're fetching the embedding for the queryParam
  const isFetchingEmbedding =
    searchMarketsQuery.isFetching &&
    searchMarketsQuery.fetchStatus !== "idle" &&
    queryParam === throttledQuery;

  const isLoadingStale = searchMarketsQuery.isFetching || isFetchingEmbedding;

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Market Search" className="w-12 h-12" />
            <h1 className="font-serif text-5xl font-medium tracking-tighter">
              Market Search
            </h1>
          </div>
          <p className="text-base text-zinc-600 max-w-xl mx-auto leading-normal font-light text-balance">
            Search across Manifold, Polymarket, and Kalshi using natural
            language
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative flex items-start gap-2">
            <div className="flex-1">
              <SearchInput
                value={query}
                onChange={setQuery}
                onSearch={setSearchParams}
                isLoading={isLoadingStale}
              />
            </div>
            <MarketStatusFilter value={status} onChange={handleStatusChange} />
            <Button size="icon" className="h-12 w-12" variant="outline">
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
          <SourceFilter
            selectedSources={sources}
            onChange={handleSourcesChange}
          />
        </div>

        <div
          className={cn("grid transition-opacity duration-300", {
            "opacity-50": isLoadingStale,
          })}
        >
          {!queryParam ? (
            <p className="text-center text-zinc-600">
              Search for markets by name, description, or keywords
            </p>
          ) : searchMarketsQuery.status === "pending" ? (
            <p className="text-center text-zinc-600">Loading...</p>
          ) : searchMarketsQuery.status === "error" ? (
            <p className="text-center text-red-500">
              Error: {searchMarketsQuery.error.message}
            </p>
          ) : (
            <>
              {searchMarketsQuery.data.pages.some(
                (page) => page.markets.length === 0
              ) &&
                query && (
                  <p className="text-center text-zinc-600 text-base">
                    No markets found for &quot;{query}&quot;
                  </p>
                )}

              {searchMarketsQuery.data.pages.some(
                (page) => page.markets.length > 0
              ) && (
                <>
                  <div className="border-b border-zinc-200 pb-1">
                    <h2 className="text-2xl font-serif tracking-tight">
                      Results for{" "}
                      <span className="italic text-zinc-500">
                        &#8220;
                        {searchMarketsQuery.data.pages[0].searchQuery}
                        &#8221;
                      </span>
                    </h2>
                  </div>

                  {searchMarketsQuery.data.pages.map((page, i) => (
                    <div key={i}>
                      {page.markets.map((market, marketIndex) => (
                        <MarketCard
                          key={`${market.site}-${market.market_id}`}
                          market={market}
                          index={marketIndex + i * page.markets.length}
                        />
                      ))}
                    </div>
                  ))}

                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => searchMarketsQuery.fetchNextPage()}
                      disabled={
                        !searchMarketsQuery.hasNextPage ||
                        searchMarketsQuery.isFetchingNextPage
                      }
                      className="px-5 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {searchMarketsQuery.isFetchingNextPage
                        ? "Loading more..."
                        : searchMarketsQuery.hasNextPage
                        ? "Load More"
                        : "No more results"}
                    </button>
                  </div>
                </>
              )}

              {searchMarketsQuery.isFetching &&
                !searchMarketsQuery.isFetchingNextPage && (
                  <p className="text-center text-zinc-600">Fetching...</p>
                )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

async function getEmbedding(searchQuery: string) {
  if (!searchQuery.trim()) {
    return;
  }

  try {
    const response = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });

    if (!response.ok) {
      throw new Error("Embedding generation failed");
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Embedding error:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DebugView({
  query,
  throttledQuery,
  embeddingData,
}: {
  query: string;
  throttledQuery: string;
  embeddingData?: number[];
}) {
  return (
    <div>
      <p>{query}</p>
      <p>{throttledQuery}</p>
      <p>Embedding Size: {embeddingData ? embeddingData.length : "null"}</p>
    </div>
  );
}

async function searchMarkets({
  searchQuery,
  embedding,
  cursor,
  status,
  sources,
}: SearchParams) {
  if (!searchQuery.trim()) return;
  if (!embedding) return;

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        embedding,
        ...(cursor ? { cursor } : {}),
        status,
        sources,
      }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = (await response.json()) as SearchResponse;
    return { ...data, searchQuery };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
