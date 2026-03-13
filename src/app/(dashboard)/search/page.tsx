"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const searchTypes = [
  {
    value: "KEYWORD",
    label: "Keyword Search",
    placeholder: "fitness coaches in NYC",
    description: "Find influencers by niche, industry, or topic",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
  {
    value: "HASHTAG",
    label: "Hashtag Search",
    placeholder: "veganrecipes",
    description: "Discover creators using specific hashtags",
    icon: "M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5",
  },
  {
    value: "LOCATION",
    label: "Location Search",
    placeholder: "Mumbai, India",
    description: "Find influencers in a specific area",
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  },
  {
    value: "USERNAME",
    label: "Username Lookup",
    placeholder: "johndoe",
    description: "Get detailed info on a specific account",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("KEYWORD");
  const [resultsLimit, setResultsLimit] = useState("20");
  const [loading, setLoading] = useState(false);

  const selectedType = searchTypes.find((t) => t.value === type)!;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          type,
          resultsLimit: parseInt(resultsLimit),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error(`Not enough credits. You have ${data.credits} left.`);
        } else {
          toast.error(data.error || "Search failed");
        }
        return;
      }

      toast.success("Search started! We're finding influencers for you...");
      router.push(`/search/${data.searchId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Search Influencers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find Instagram influencers with verified contact info
        </p>
      </div>

      {/* Search type selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {searchTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              type === t.value
                ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 shadow-md shadow-purple-500/10"
                : "border-border hover:border-purple-200 dark:hover:border-purple-800 hover:bg-muted/50"
            }`}
          >
            <svg
              className={`w-5 h-5 mb-2 ${
                type === t.value
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-muted-foreground"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            <p
              className={`text-sm font-medium ${
                type === t.value
                  ? "text-purple-700 dark:text-purple-300"
                  : ""
              }`}
            >
              {t.label}
            </p>
          </button>
        ))}
      </div>

      {/* Search form */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{selectedType.label}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedType.description}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="query">
                {type === "HASHTAG"
                  ? "Hashtag (without #)"
                  : type === "LOCATION"
                  ? "Location"
                  : type === "USERNAME"
                  ? "Username"
                  : "Search Query"}
              </Label>
              <Input
                id="query"
                placeholder={selectedType.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Results</Label>
              <Select
                value={resultsLimit}
                onValueChange={(v) => v && setResultsLimit(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 profiles (10 credits)</SelectItem>
                  <SelectItem value="20">20 profiles (20 credits)</SelectItem>
                  <SelectItem value="50">50 profiles (50 credits)</SelectItem>
                  <SelectItem value="100">
                    100 profiles (100 credits)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching... this may take a minute
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  Search — uses {resultsLimit} credits
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <p className="text-sm text-muted-foreground">
          Each search discovers profiles, scrapes full profile data (bio,
          followers, engagement), and extracts contact info from linked websites.{" "}
          <strong>1 credit = 1 enriched profile.</strong>
        </p>
      </div>
    </div>
  );
}
