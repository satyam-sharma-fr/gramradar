import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface InstagramSearchInput {
  search: string;
  searchType: "user" | "hashtag" | "place";
  resultsLimit: number;
}

export interface InstagramProfileInput {
  usernames: string[];
}

export interface ContactScraperInput {
  startUrls: { url: string }[];
  maxRequestsPerStartUrl: number;
}

export async function searchInstagram(input: InstagramSearchInput) {
  const run = await client.actor("apify/instagram-search-scraper").call({
    search: input.search,
    searchType: input.searchType,
    resultsLimit: input.resultsLimit,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

export async function scrapeProfiles(usernames: string[]) {
  const run = await client.actor("apify/instagram-profile-scraper").call({
    usernames,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

export async function scrapeHashtag(hashtags: string[], resultsLimit: number = 50) {
  const run = await client.actor("apify/instagram-hashtag-scraper").call({
    hashtags,
    resultsLimit,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

export async function scrapeContactInfo(urls: string[]) {
  const startUrls = urls.map((url) => ({ url }));

  const run = await client.actor("vdrmota/contact-info-scraper").call({
    startUrls,
    maxRequestsPerStartUrl: 3,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

// Normalize raw Apify data into our Profile shape
export function normalizeProfile(raw: Record<string, unknown>) {
  return {
    username: (raw.username as string) || (raw.ownerUsername as string) || "",
    fullName: (raw.fullName as string) || (raw.name as string) || null,
    bio: (raw.biography as string) || (raw.bio as string) || null,
    profilePicUrl: (raw.profilePicUrl as string) || (raw.profilePicUrlHD as string) || null,
    website: (raw.externalUrl as string) || (raw.website as string) || null,
    email: (raw.email as string) || (raw.businessEmail as string) || null,
    phone: (raw.phone as string) || (raw.businessPhoneNumber as string) || null,
    isVerified: (raw.verified as boolean) || (raw.isVerified as boolean) || false,
    isBusinessAccount: (raw.isBusinessAccount as boolean) || false,
    category: (raw.businessCategoryName as string) || (raw.category as string) || null,
    followers: (raw.followersCount as number) || (raw.followers as number) || 0,
    following: (raw.followingCount as number) || (raw.following as number) || 0,
    postsCount: (raw.postsCount as number) || (raw.mediaCount as number) || 0,
    engagementRate: (raw.engagementRate as number) || null,
    avgLikes: (raw.avgLikes as number) || null,
    avgComments: (raw.avgComments as number) || null,
    city: (raw.city as string) || null,
    country: (raw.country as string) || null,
    externalUrls: raw.externalUrls || undefined,
    rawData: raw,
  };
}
