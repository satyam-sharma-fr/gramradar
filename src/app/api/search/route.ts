import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasEnoughCredits } from "@/lib/credits";
import { SearchType } from "@/generated/prisma/enums";
import { ApifyClient } from "apify-client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, type, resultsLimit = 20 } = await req.json();

    if (!query || !type) {
      return NextResponse.json(
        { error: "Query and type are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !hasEnoughCredits(user.credits, resultsLimit)) {
      return NextResponse.json(
        { error: "Not enough credits", credits: user?.credits ?? 0 },
        { status: 402 }
      );
    }

    // Create search record
    const search = await prisma.search.create({
      data: {
        userId: session.user.id,
        query,
        type: type as SearchType,
        status: "PROCESSING",
        filters: { resultsLimit },
      },
    });

    // Start the Apify actor asynchronously (don't wait for it)
    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
    const searchType =
      type === "HASHTAG" ? "hashtag" : type === "LOCATION" ? "place" : "user";

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    // Start the actor run without waiting
    await client.actor("apify/instagram-search-scraper").start(
      {
        search: query,
        searchType,
        resultsLimit,
      },
      {
        webhooks: [
          {
            eventTypes: ["ACTOR.RUN.SUCCEEDED"],
            requestUrl: `${baseUrl}/api/search/webhook?searchId=${search.id}&userId=${user.id}`,
          },
          {
            eventTypes: ["ACTOR.RUN.FAILED", "ACTOR.RUN.ABORTED", "ACTOR.RUN.TIMED_OUT"],
            requestUrl: `${baseUrl}/api/search/webhook?searchId=${search.id}&userId=${user.id}&failed=1`,
          },
        ],
      }
    );

    // Return immediately — frontend will poll for status
    return NextResponse.json({
      searchId: search.id,
      status: "PROCESSING",
    });
  } catch (error) {
    console.error("Search error:", error);
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
