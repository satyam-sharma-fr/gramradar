import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApifyClient } from "apify-client";
import {
  scrapeProfiles,
  scrapeContactInfo,
  normalizeProfile,
} from "@/lib/apify";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const searchId = url.searchParams.get("searchId");
    const userId = url.searchParams.get("userId");
    const failed = url.searchParams.get("failed");

    if (!searchId || !userId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // If the actor failed, mark search as failed
    if (failed) {
      await prisma.search.update({
        where: { id: searchId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ ok: true });
    }

    // Parse webhook body to get the dataset ID
    const body = await req.json();
    const datasetId = body?.resource?.defaultDatasetId;

    if (!datasetId) {
      console.error("[Webhook] No datasetId in body:", JSON.stringify(body));
      await prisma.search.update({
        where: { id: searchId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "No dataset" }, { status: 400 });
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    // Step 1: Get search results from the completed actor run
    const { items: searchResults } = await client
      .dataset(datasetId)
      .listItems();

    console.log(`[Webhook ${searchId}] Got ${searchResults.length} search results`);

    // Step 2: Extract usernames and scrape full profiles
    const usernames = searchResults
      .map(
        (r: Record<string, unknown>) =>
          (r.username as string) || (r.ownerUsername as string)
      )
      .filter(Boolean) as string[];

    let profileData: Record<string, unknown>[] = [];
    if (usernames.length > 0) {
      console.log(`[Webhook ${searchId}] Scraping ${usernames.length} profiles`);
      profileData = (await scrapeProfiles(usernames)) as Record<string, unknown>[];
    }

    // Step 3: Extract contact info from websites (non-blocking)
    const websiteUrls = profileData
      .map((p) => (p.externalUrl as string) || (p.website as string))
      .filter(Boolean) as string[];

    let contactData: Record<string, unknown>[] = [];
    if (websiteUrls.length > 0) {
      try {
        console.log(`[Webhook ${searchId}] Scraping ${websiteUrls.length} websites`);
        contactData = (await scrapeContactInfo(websiteUrls)) as Record<string, unknown>[];
      } catch (err) {
        console.warn(`[Webhook ${searchId}] Contact scraping failed:`, err);
      }
    }

    // Merge contact data
    const contactByUrl = new Map<string, Record<string, unknown>>();
    for (const contact of contactData) {
      const contactUrl = contact.url as string;
      if (contactUrl) contactByUrl.set(contactUrl, contact);
    }

    const normalizedProfiles = profileData.map((raw) => {
      const profile = normalizeProfile(raw);
      const website = (raw.externalUrl as string) || (raw.website as string);
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
            searchId,
            ...p,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rawData: p.rawData as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            externalUrls: p.externalUrls as any,
          },
        })
      )
    );

    // Deduct credits and update search status
    const creditsUsed = createdProfiles.length;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: creditsUsed } },
      }),
      prisma.search.update({
        where: { id: searchId },
        data: {
          status: "COMPLETED",
          resultCount: createdProfiles.length,
          creditsUsed,
        },
      }),
    ]);

    console.log(`[Webhook ${searchId}] Done: ${createdProfiles.length} profiles, ${creditsUsed} credits`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
