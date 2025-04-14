"use client";

import { useCallback, useState, useEffect } from "react";
import type { Market } from "@/lib/types";
import { SearchInput } from "@/components/SearchInput";
import { MarketCard } from "@/components/MarketCard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { throttle } from "lodash";
import { useSearchParams, useRouter } from "next/navigation";

type SearchResponse = {
  markets: Omit<Market, "embedding" | "created_at">[];
  nextCursor: string | null;
};

type SearchParams = {
  searchQuery: string;
  embedding?: number[];
  cursor?: string | null;
};

export default function Home() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query");
  const [query, setQuery] = useState(queryParam || "");
  const [throttledQuery, setThrottledQuery] = useState(queryParam || "");
  const { replace } = useRouter();
  const throttledSearch = useCallback(
    throttle((searchQuery: string) => {
      setThrottledQuery(searchQuery);
    }, 300),
    []
  );

  useEffect(() => {
    throttledSearch(query);
  }, [query, throttledSearch]);

  const embeddingQuery = useQuery({
    queryKey: ["embedding", throttledQuery],
    queryFn: ({ queryKey }) => getEmbedding(queryKey[1]),
    enabled: !!throttledQuery,
  });

  const searchMarketsQuery = useInfiniteQuery({
    queryKey: ["searchMarkets", queryParam, embeddingQuery.data],
    queryFn: async ({ pageParam }) => {
      const result = await searchMarkets({
        searchQuery: queryParam as string,
        embedding: embeddingQuery.data,
        cursor: pageParam,
      });
      return result as SearchResponse;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    enabled: !!queryParam && !!embeddingQuery.data,
  });

  const setSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", query);
      replace(`?${params.toString()}`);
    },
    [searchParams, replace]
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Search Prediction Markets
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search across Manifold, Polymarket, and Kalshi using natural
            language
          </p>
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={setSearchParams}
          isLoading={searchMarketsQuery.isLoading}
        />

        <div className="space-y-4">
          {searchMarketsQuery.status === "pending" ? (
            <p className="text-center text-muted-foreground">Loading...</p>
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
                  <p className="text-center text-muted-foreground">
                    No markets found for &quot;{query}&quot;
                  </p>
                )}

              {searchMarketsQuery.data.pages.some(
                (page) => page.markets.length > 0
              ) && (
                <>
                  <h2 className="text-2xl font-semibold">
                    Search Results:{" "}
                    <em className="text-muted-foreground">{queryParam}</em>
                  </h2>

                  {searchMarketsQuery.data.pages.map((page, i) => (
                    <div key={i} className="space-y-4">
                      {page.markets.map((market) => (
                        <MarketCard
                          key={`${market.site}-${market.market_id}`}
                          market={market}
                        />
                      ))}
                    </div>
                  ))}

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => searchMarketsQuery.fetchNextPage()}
                      disabled={
                        !searchMarketsQuery.hasNextPage ||
                        searchMarketsQuery.isFetchingNextPage
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <p className="text-center text-muted-foreground">
                    Fetching...
                  </p>
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

async function searchMarkets({ searchQuery, embedding, cursor }: SearchParams) {
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
      }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data as SearchResponse;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
