import { z } from "zod";

const MarketSchema = z.object({
  id: z.number(),
  site: z.enum(["manifold", "polymarket", "kalshi"]),
  market_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string(),
  open_time: z.date(),
  embedding: z.array(z.number()),
});

export type Market = z.infer<typeof MarketSchema>;

export const MarketInputSchema = MarketSchema.omit({
  id: true,
  embedding: true,
});

export type MarketInput = z.infer<typeof MarketInputSchema>;

export const MarketInputWithEmbeddingSchema = MarketSchema.omit({
  id: true,
});

export type MarketInputWithEmbedding = z.infer<
  typeof MarketInputWithEmbeddingSchema
>;

export function createMarket(market: MarketInput) {
  return market;
}

export function createMarketWithEmbedding(market: MarketInputWithEmbedding) {
  const result = MarketInputWithEmbeddingSchema.parse(market);
  return result;
}

// Date from which we will backfill markets
export const BACKFILL_DATE = new Date("2023-01-01");

export const EMBEDDING_SIZE = 1536; // OpenAI's default embedding size
