"use client";

import { useCallback, useState } from "react";
import type { Market } from "@/lib/types";
import { SearchInput } from "@/components/SearchInput";
import { MarketCard } from "@/components/MarketCard";

type SearchResponse = {
  markets: Omit<Market, "embedding" | "created_at">[];
  nextCursor: string | null;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const searchMarkets = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          onSearch={searchMarkets}
          isLoading={isLoading}
        />

        <div className="space-y-4">
          {results?.markets.length === 0 && query && !isLoading && (
            <p className="text-center text-muted-foreground">
              No markets found for &quot;{query}&quot;
            </p>
          )}

          {results?.markets.map((market) => (
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
