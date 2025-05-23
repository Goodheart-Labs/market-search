import { NextResponse } from "next/server";
import { Client } from "pg";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { EMBEDDING_SIZE, type Market } from "@/lib/types";

// Constants
const MAX_RESULTS = 10;

// Initialize Postgres client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect();

// Input validation schema
const searchSchema = z.object({
  query: z.string().min(1).max(1000),
  cursor: z.string().optional(),
  embedding: z.array(z.number()).length(EMBEDDING_SIZE).optional(),
  status: z.enum(["open", "closed", "all"]).optional().default("open"),
  sources: z.array(z.enum(["manifold", "polymarket", "kalshi"])).optional(),
});

// Define types for our database results
type SearchResult = Omit<Market, "embedding" | "open_time"> & {
  similarity: number;
  details: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const {
      query,
      cursor,
      embedding: providedEmbedding,
      status,
      sources,
    } = searchSchema.parse(body);

    // Generate embedding if not provided
    let vectorQuery;
    if (providedEmbedding) {
      vectorQuery = `[${providedEmbedding.join(",")}]`;
    } else {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-large"),
        value: query,
      });
      vectorQuery = `[${embedding.slice(0, EMBEDDING_SIZE).join(",")}]`;
    }

    // Build SQL query with cursor-based pagination
    let sql = `
      SELECT 
        id,
        site,
        market_id,
        title,
        description,
        url,
        details,
        1 - (embedding <=> $1) as similarity
      FROM markets
      WHERE 1=1
    `;

    const params: (number[] | number | string | string[])[] = [vectorQuery];

    // Add status filter condition
    if (status !== "all") {
      const now = new Date().toISOString();
      if (status === "open") {
        sql += ` AND close_time > $${params.length + 1}`;
        params.push(now);
      } else {
        sql += ` AND close_time <= $${params.length + 1}`;
        params.push(now);
      }
    }

    // Add sources filter condition
    if (sources && sources.length > 0) {
      sql += ` AND site = ANY($${params.length + 1})`;
      params.push(sources);
    }

    // Add cursor condition if provided
    if (cursor) {
      const [lastSimilarity, lastId] = cursor.split("_");
      sql += ` AND (
        (1 - (embedding <=> $1)) < $${params.length + 1}
        OR ((1 - (embedding <=> $1)) = $${params.length + 1} AND id > $${
        params.length + 2
      })
      )`;
      params.push(parseFloat(lastSimilarity), lastId);
    }

    // Add ordering and limit
    sql += `
      ORDER BY similarity DESC, id
      LIMIT ${MAX_RESULTS + 1}
    `;

    // Execute query
    const result = await client.query<SearchResult>(sql, params);
    const hasMore = result.rows.length > MAX_RESULTS;
    const markets = result.rows.slice(0, MAX_RESULTS);

    // Generate next cursor
    let nextCursor = null;
    if (hasMore && markets.length > 0) {
      const lastItem = markets[markets.length - 1];
      nextCursor = `${lastItem.similarity}_${lastItem.id}`;
    }

    // Remove similarity from returned results
    return NextResponse.json({
      markets: markets.map(({ similarity: _similarity, ...market }) => market), // eslint-disable-line @typescript-eslint/no-unused-vars
      nextCursor,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to process search request" },
      { status: 500 }
    );
  }
}
