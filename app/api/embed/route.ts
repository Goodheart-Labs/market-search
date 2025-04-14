import { NextResponse } from "next/server";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { EMBEDDING_SIZE } from "@/lib/types";

// Input validation schema
const embedSchema = z.object({
  query: z.string().min(1).max(1000),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { query } = embedSchema.parse(body);

    // Generate embedding using ai SDK and slice to match our database embedding size
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-large"),
      value: query,
    });

    return NextResponse.json({
      embedding: embedding.slice(0, EMBEDDING_SIZE),
    });
  } catch (error) {
    console.error("Embedding error:", error);
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
