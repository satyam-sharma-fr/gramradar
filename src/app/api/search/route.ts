import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  searchInstagram,
  scrapeProfiles,
  scrapeContactInfo,
  normalizeProfile,
} from "@/lib/apify";
import { hasEnoughCredits } from "@/lib/credits";
import { SearchType } from "@/generated/prisma/enums";

// Apify actors can take 60-120s to complete
export const maxDuration = 300;

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

    // Check credits
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

    try {
      // Step 1: Search Instagram for matching profiles
      const searchType =
        type === "HASHTAG"
          ? "hashtag"
          : type === "LOCATION"
          ? "place"
          : "user";

      console.log(`[Search ${search.id}] Starting Instagram search: "${query}" (${searchType})`);

      const searchResults = await searchInstagram({
        search: query,
        searchType,
        resultsLimit,
      });

      console.log(`[Search ${search.id}] Found ${searchResults.length} search results`);

      // Step 2: Get usernames from search results and scrape full profiles
      const usernames = searchResults
        .map(
          (r: Record<string, unknown>) =>
            (r.username as string) || (r.ownerUsername as string)
        )
        .filter(Boolean) as string[];

      let profileData: Record<string, unknown>[] = [];
      if (usernames.length > 0) {
        console.log(`[Search ${search.id}] Scraping ${usernames.length} profiles`);
        profileData = (await scrapeProfiles(
          usernames
        )) as Record<string, unknown>[];
      }

      console.log(`[Search ${search.id}] Got ${profileData.length} profile details`);

      // Step 3: Extract contact info from websites found in profiles
      const websiteUrls = profileData
        .map((p) => (p.externalUrl as string) || (p.website as string))
        .filter(Boolean) as string[];

      let contactData: Record<string, unknown>[] = [];
      if (websiteUrls.length > 0) {
        console.log(`[Search ${search.id}] Scraping ${websiteUrls.length} websites for contacts`);
        try {
          contactData = (await scrapeContactInfo(
            websiteUrls
          )) as Record<string, unknown>[];
        } catch (contactErr) {
          // Contact scraping is optional — don't fail the whole search
          console.warn(`[Search ${search.id}] Contact scraping failed:`, contactErr);
        }
      }

      // Merge contact data into profiles
      const contactByUrl = new Map<string, Record<string, unknown>>();
      for (const contact of contactData) {
        const url = contact.url as string;
        if (url) contactByUrl.set(url, contact);
      }

      const normalizedProfiles = profileData.map((raw) => {
        const profile = normalizeProfile(raw);
        const website =
          (raw.externalUrl as string) || (raw.website as string);
        if (website && contactByUrl.has(website)) {
          const contact = contactByUrl.get(website)!;
          if (!profile.email && contact.email) {
            profile.email = contact.email as string;
          }
          if (!profile.phone && contact.phone) {
            profile.phone = contact.phone as string;
          }
        }
        return profile;
      });

      // Save profiles to DB
      const createdProfiles = await Promise.all(
        normalizedProfiles.map((p) =>
          prisma.profile.create({
            data: {
              searchId: search.id,
              ...p,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rawData: p.rawData as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              externalUrls: p.externalUrls as any,
            },
          })
        )
      );

      // Deduct credits
      const creditsUsed = createdProfiles.length;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: creditsUsed } },
        }),
        prisma.search.update({
          where: { id: search.id },
          data: {
            status: "COMPLETED",
            resultCount: createdProfiles.length,
            creditsUsed,
          },
        }),
      ]);

      console.log(`[Search ${search.id}] Completed: ${createdProfiles.length} profiles, ${creditsUsed} credits`);

      return NextResponse.json({
        searchId: search.id,
        resultCount: createdProfiles.length,
        creditsUsed,
        profiles: createdProfiles,
      });
    } catch (innerError) {
      // Mark search as failed
      console.error(`[Search ${search.id}] Failed:`, innerError);
      await prisma.search.update({
        where: { id: search.id },
        data: { status: "FAILED" },
      });
      throw innerError;
    }
  } catch (error) {
    console.error("Search error:", error);
    const message =
      error instanceof Error ? error.message : "Search failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
