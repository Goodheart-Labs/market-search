"use client";

import { useCallback, useState, useEffect } from "react";
import type { Market } from "@/lib/types";
import { SearchInput } from "@/components/SearchInput";
import { MarketCard } from "@/components/MarketCard";
import { useQuery } from "@tanstack/react-query";
import { throttle } from "lodash";
import { useSearchParams, useRouter } from "next/navigation";

type SearchResponse = {
  markets: Omit<Market, "embedding" | "created_at">[];
  nextCursor: string | null;
};

type EmbeddingResponse = {
  embedding: number[];
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

  const setSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", query);
      replace(`?${params.toString()}`);
    },
    [searchParams, replace]
  );

  const searchMarketsQuery = useQuery({
    queryKey: ["searchMarkets", queryParam, embeddingQuery.data] as const,
    queryFn: ({ queryKey }) =>
      searchMarkets({
        searchQuery: queryKey[1] as string,
        embedding: queryKey[2],
      }),
    enabled: !!queryParam && !!embeddingQuery.data,
  });

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
          {searchMarketsQuery.data?.markets.length === 0 &&
            query &&
            !searchMarketsQuery.isLoading && (
              <p className="text-center text-muted-foreground">
                No markets found for &quot;{query}&quot;
              </p>
            )}

          {searchMarketsQuery.data?.markets.map((market) => (
            <MarketCard
              key={`${market.site}-${market.market_id}`}
              market={market}
            />
          ))}
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

    const data: EmbeddingResponse = await response.json();

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

type SearchParams = {
  searchQuery: string;
  embedding?: number[];
};

async function searchMarkets({ searchQuery, embedding }: SearchParams) {
  if (!searchQuery.trim()) return;
  if (!embedding) return;

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        embedding,
      }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data as SearchResponse;
  } catch (error) {
    console.error("Search error:", error);
  }
}
