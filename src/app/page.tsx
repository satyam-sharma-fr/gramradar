import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_CONFIG } from "@/lib/credits";
import { Plan } from "@/generated/prisma/enums";

const features = [
  {
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    title: "Smart Search",
    desc: "Search by niche keywords, hashtags, or locations. Find influencers in any category instantly.",
  },
  {
    icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    title: "Contact Discovery",
    desc: "We auto-extract emails from bios, websites, and link-in-bio pages. No manual work.",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "Engagement Analytics",
    desc: "Real follower counts, engagement rates, avg likes & comments. Filter out fake influencers.",
  },
  {
    icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
    title: "Export to CSV",
    desc: "Download results as CSV and import into your CRM or outreach tool instantly.",
  },
  {
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Search History",
    desc: "All past searches saved. Come back anytime to revisit or re-export results.",
  },
  {
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    title: "Pay Per Use",
    desc: "No expensive subscriptions. Use credits only when you search. Start free with 25 credits.",
  },
];

const comparisons = [
  { name: "Modash", price: "$299/mo", profiles: "300/mo" },
  { name: "Heepsy", price: "€69/mo", profiles: "15K results" },
  { name: "GramRadar", price: "Free to start", profiles: "Pay per profile", highlight: true },
];

function HeroIcon({ d }: { d: string }) {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl tracking-tight">GramRadar</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20" />
        <div className="relative px-6 pt-20 pb-28 text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">
            10x cheaper than Modash & Heepsy
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Find Instagram Influencers
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Ready for Outreach
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Search by keyword, hashtag, or location. Get verified emails,
            engagement rates, and follower stats. Export and start your outreach
            in minutes — not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-xl shadow-purple-500/25">
                Start Free — 25 Credits Included
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Why switch from expensive tools?
            </p>
            <div className="flex gap-4">
              {comparisons.map((c) => (
                <div
                  key={c.name}
                  className={`px-5 py-3 rounded-xl border text-center ${
                    c.highlight
                      ? "border-purple-300 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-700"
                      : "bg-muted/50"
                  }`}
                >
                  <p className={`font-semibold text-sm ${c.highlight ? "text-purple-700 dark:text-purple-300" : ""}`}>
                    {c.name}
                  </p>
                  <p className={`text-lg font-bold ${c.highlight ? "text-purple-700 dark:text-purple-300" : ""}`}>
                    {c.price}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.profiles}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          How it works
        </h2>
        <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto">
          Three simple steps to find influencers with verified contact info
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Search",
              desc: "Enter a keyword like \"fitness coach NYC\" or a hashtag like \"veganrecipes\"",
            },
            {
              step: "2",
              title: "Discover",
              desc: "We scrape profiles, extract emails, and calculate engagement metrics automatically",
            },
            {
              step: "3",
              title: "Export",
              desc: "Download a CSV with usernames, emails, follower counts, and engagement rates",
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need for influencer outreach
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto">
            Built for marketers who want results, not complexity
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="bg-background hover:shadow-lg transition-shadow border-border/50">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                    <HeroIcon d={f.icon} />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-muted-foreground text-center mb-14">
          1 credit = 1 influencer profile discovered & enriched with contact info
        </p>
        <div className="grid md:grid-cols-4 gap-5">
          {(Object.keys(PLAN_CONFIG) as Plan[]).map((plan) => {
            const config = PLAN_CONFIG[plan];
            const isPopular = plan === "GROWTH";
            return (
              <Card
                key={plan}
                className={`relative ${
                  isPopular
                    ? "border-purple-400 shadow-xl shadow-purple-500/10 scale-[1.02]"
                    : "border-border/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <div>
                    <span className="text-3xl font-bold">{config.priceLabel.split("/")[0]}</span>
                    {plan !== "FREE" && (
                      <span className="text-muted-foreground text-sm">/mo</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground mb-6">
                    <span className="font-semibold text-foreground">{config.credits}</span> credits per month
                  </div>
                  <Link href="/register" className="block">
                    <Button
                      className={`w-full ${
                        isPopular
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : ""
                      }`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      {plan === "FREE" ? "Start Free" : "Get Started"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need more? Buy top-up credit packs anytime. No commitment required.
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-12 shadow-2xl shadow-purple-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your next brand ambassador?
          </h2>
          <p className="text-purple-100 mb-8 text-lg">
            Start with 25 free credits. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-12 px-8 bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="font-semibold">GramRadar</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GramRadar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
