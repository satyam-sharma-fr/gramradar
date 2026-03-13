import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLAN_CONFIG } from "@/lib/credits";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const recentSearches = await prisma.search.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalSearches = await prisma.search.count({
    where: { userId: session.user.id },
  });

  const totalProfiles = await prisma.search.aggregate({
    where: { userId: session.user.id },
    _sum: { resultCount: true },
  });

  if (!user) redirect("/login");

  const planConfig = PLAN_CONFIG[user.plan];
  const creditPercent = Math.min(
    (user.credits / planConfig.credits) * 100,
    100
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your account overview
          </p>
        </div>
        <Link href="/search">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25">
            <svg
              className="w-4 h-4 mr-2"
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
            New Search
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/30">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Credits Remaining
            </p>
            <p className="text-3xl font-bold mt-1">{user.credits}</p>
            <Progress value={creditPercent} className="mt-3 h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              of {planConfig.credits} monthly credits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Current Plan
            </p>
            <p className="text-3xl font-bold mt-1">{planConfig.name}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {planConfig.priceLabel}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Total Searches
            </p>
            <p className="text-3xl font-bold mt-1">{totalSearches}</p>
            <p className="text-xs text-muted-foreground mt-2">all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Profiles Found
            </p>
            <p className="text-3xl font-bold mt-1">
              {totalProfiles._sum.resultCount || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Low credits warning */}
      {user.credits <= 5 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                Low credits
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                You have {user.credits} credits left. Top up to keep searching.
              </p>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="border-amber-300">
              Buy Credits
            </Button>
          </Link>
        </div>
      )}

      {/* Recent searches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Searches</h2>
          {recentSearches.length > 0 && (
            <Link
              href="/search"
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        {recentSearches.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <p className="font-medium mb-1">No searches yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first search to find influencers
              </p>
              <Link href="/search">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                >
                  Start Searching
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <Link key={search.id} href={`/search/${search.id}`}>
                <Card className="hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
                      </div>
                      <div>
                        <p className="font-medium text-sm">{search.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0"
                      >
                        {search.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {search.resultCount} profiles
                      </span>
                      <Badge
                        variant={
                          search.status === "COMPLETED"
                            ? "default"
                            : search.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          search.status === "COMPLETED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0"
                            : ""
                        }
                      >
                        {search.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
