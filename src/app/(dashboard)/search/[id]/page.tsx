"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  profilePicUrl: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  isVerified: boolean;
  isBusinessAccount: boolean;
  category: string | null;
  followers: number;
  following: number;
  postsCount: number;
  engagementRate: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  city: string | null;
  country: string | null;
}

interface SearchResult {
  id: string;
  query: string;
  type: string;
  status: string;
  resultCount: number;
  creditsUsed: number;
  createdAt: string;
  results: Profile[];
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function downloadCSV(profiles: Profile[], query: string) {
  const headers = [
    "Username", "Full Name", "Email", "Phone", "Website", "Followers",
    "Following", "Posts", "Engagement Rate", "Avg Likes", "Avg Comments",
    "Verified", "Business", "Category", "Bio", "City", "Country",
  ];

  const rows = profiles.map((p) => [
    p.username, p.fullName || "", p.email || "", p.phone || "",
    p.website || "", p.followers, p.following, p.postsCount,
    p.engagementRate?.toFixed(2) || "", p.avgLikes?.toFixed(0) || "",
    p.avgComments?.toFixed(0) || "", p.isVerified ? "Yes" : "No",
    p.isBusinessAccount ? "Yes" : "No", p.category || "",
    (p.bio || "").replace(/"/g, '""'), p.city || "", p.country || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gramradar-${query.replace(/\s+/g, "-")}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SearchResultPage() {
  const params = useParams();
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"followers" | "engagementRate">("followers");
  const [pollCount, setPollCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/search/${params.id}`);
      const json = await res.json();
      setData(json);
      return json.status;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!data || data.status === "COMPLETED" || data.status === "FAILED") return;

    // Poll every 5 seconds while processing
    const interval = setInterval(async () => {
      const status = await fetchData();
      setPollCount((c) => c + 1);
      if (status === "COMPLETED" || status === "FAILED") {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.status, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 mx-auto text-purple-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.status === "FAILED") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="font-medium">Search failed</p>
          <p className="text-sm text-muted-foreground">Something went wrong. Your credits were not deducted.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Processing state
  if (data.status === "PROCESSING" || data.status === "PENDING") {
    const progressSteps = [
      "Searching Instagram...",
      "Finding matching profiles...",
      "Scraping profile details...",
      "Extracting contact info...",
      "Almost done...",
    ];
    const stepIndex = Math.min(Math.floor(pollCount / 3), progressSteps.length - 1);
    const progressPercent = Math.min(10 + pollCount * 5, 90);

    return (
      <div className="max-w-lg mx-auto py-20">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <svg className="animate-spin h-10 w-10 mx-auto text-purple-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Searching for &ldquo;{data.query}&rdquo;
              </h2>
              <p className="text-sm text-muted-foreground">
                {progressSteps[stepIndex]}
              </p>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              This typically takes 1-3 minutes. You can leave this page and check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed — show results
  const sortedProfiles = [...data.results].sort((a, b) => {
    if (sortBy === "engagementRate") {
      return (b.engagementRate || 0) - (a.engagementRate || 0);
    }
    return b.followers - a.followers;
  });

  const withEmail = data.results.filter((p) => p.email).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">&ldquo;{data.query}&rdquo;</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">
              {data.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {data.resultCount} profiles
            </span>
            <span className="text-sm text-muted-foreground">
              {withEmail} with email
            </span>
            <span className="text-sm text-muted-foreground">
              {data.creditsUsed} credits used
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortBy(sortBy === "followers" ? "engagementRate" : "followers")
            }
          >
            Sort: {sortBy === "followers" ? "Followers" : "Engagement"}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            onClick={() => downloadCSV(data.results, data.query)}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Followers</TableHead>
                  <TableHead className="text-right">Eng. Rate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.profilePicUrl && (
                          <img
                            src={profile.profilePicUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            <a
                              href={`https://instagram.com/${profile.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-purple-600 transition-colors"
                            >
                              @{profile.username}
                            </a>
                            {profile.isVerified && (
                              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {profile.fullName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{profile.category || "—"}</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(profile.followers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {profile.engagementRate ? (
                        <span className={profile.engagementRate > 3 ? "text-green-600 font-medium" : ""}>
                          {profile.engagementRate.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {profile.email ? (
                        <a
                          href={`mailto:${profile.email}`}
                          className="text-sm text-purple-600 hover:underline"
                        >
                          {profile.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline truncate max-w-[140px] block"
                        >
                          {profile.website.replace(/https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
