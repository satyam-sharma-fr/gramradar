"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    "Username",
    "Full Name",
    "Email",
    "Phone",
    "Website",
    "Followers",
    "Following",
    "Posts",
    "Engagement Rate",
    "Avg Likes",
    "Avg Comments",
    "Verified",
    "Business",
    "Category",
    "Bio",
    "City",
    "Country",
  ];

  const rows = profiles.map((p) => [
    p.username,
    p.fullName || "",
    p.email || "",
    p.phone || "",
    p.website || "",
    p.followers,
    p.following,
    p.postsCount,
    p.engagementRate?.toFixed(2) || "",
    p.avgLikes?.toFixed(0) || "",
    p.avgComments?.toFixed(0) || "",
    p.isVerified ? "Yes" : "No",
    p.isBusinessAccount ? "Yes" : "No",
    p.category || "",
    (p.bio || "").replace(/"/g, '""'),
    p.city || "",
    p.country || "",
  ]);

  const csv =
    [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join(
      "\n"
    );

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
  const [sortBy, setSortBy] = useState<"followers" | "engagementRate">(
    "followers"
  );

  useEffect(() => {
    fetch(`/api/search/${params.id}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Search not found</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{data.type}</Badge>
            <span className="text-sm text-muted-foreground">
              {data.resultCount} profiles found
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
            Sort by: {sortBy === "followers" ? "Followers" : "Engagement"}
          </Button>
          <Button
            size="sm"
            onClick={() => downloadCSV(data.results, data.query)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
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
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            <a
                              href={`https://instagram.com/${profile.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              @{profile.username}
                            </a>
                            {profile.isVerified && (
                              <Badge variant="default" className="text-[10px] px-1 py-0">
                                V
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {profile.fullName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {profile.category || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(profile.followers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {profile.engagementRate
                        ? `${profile.engagementRate.toFixed(1)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {profile.email ? (
                        <a
                          href={`mailto:${profile.email}`}
                          className="text-sm text-primary hover:underline"
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
                          className="text-sm text-primary hover:underline truncate max-w-[150px] block"
                        >
                          {profile.website.replace(/https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {[profile.city, profile.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
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
