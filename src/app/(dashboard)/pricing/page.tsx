"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Script from "next/script";

const plans = [
  {
    key: "FREE",
    name: "Free",
    price: "₹0",
    credits: 25,
    perCredit: "—",
    features: [
      "25 credits/month",
      "All search types",
      "CSV export",
      "Search history",
    ],
  },
  {
    key: "STARTER",
    name: "Starter",
    price: "₹999",
    credits: 300,
    perCredit: "₹3.3",
    features: [
      "300 credits/month",
      "All search types",
      "CSV export",
      "Search history",
      "Email support",
    ],
  },
  {
    key: "GROWTH",
    name: "Growth",
    price: "₹2,999",
    credits: 1500,
    perCredit: "₹2.0",
    popular: true,
    features: [
      "1,500 credits/month",
      "All search types",
      "CSV export",
      "Search history",
      "Priority support",
      "Bulk export",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: "₹6,999",
    credits: 5000,
    perCredit: "₹1.4",
    features: [
      "5,000 credits/month",
      "All search types",
      "CSV export",
      "Search history",
      "Priority support",
      "Bulk export",
      "API access (coming soon)",
    ],
  },
];

const topups = [
  { index: 0, credits: 50, price: "₹249" },
  { index: 1, credits: 200, price: "₹499" },
  { index: 2, credits: 500, price: "₹999" },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePayment(
    type: "subscription" | "topup",
    plan?: string,
    topupIndex?: number
  ) {
    const key = plan || `topup-${topupIndex}`;
    setLoading(key);

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, plan, topupIndex }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create order");
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "GramRadar",
        description: plan ? `${plan} Plan` : "Credit Top-up",
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful! Credits added.");
            window.location.reload();
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#9333ea" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="space-y-12 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plans & Pricing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            1 credit = 1 influencer profile discovered & enriched with contact
            info
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative ${
                plan.popular
                  ? "border-purple-400 shadow-xl shadow-purple-500/10"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.key !== "FREE" && (
                    <span className="text-muted-foreground text-sm">/mo</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan.credits} credits &middot;{" "}
                  {plan.perCredit !== "—"
                    ? `${plan.perCredit}/credit`
                    : "Free forever"}
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.key === "FREE" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    disabled={loading === plan.key}
                    onClick={() => handlePayment("subscription", plan.key)}
                  >
                    {loading === plan.key ? "Processing..." : "Subscribe"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top-up packs */}
        <div>
          <h2 className="text-lg font-semibold text-center mb-2">
            Credit Top-ups
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Need more credits? Buy a one-time top-up pack
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {topups.map((pack) => (
              <Card key={pack.index} className="border-border/50">
                <CardContent className="pt-6 text-center space-y-3">
                  <p className="text-2xl font-bold">{pack.credits}</p>
                  <p className="text-sm text-muted-foreground">credits</p>
                  <p className="text-lg font-semibold">{pack.price}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={loading === `topup-${pack.index}`}
                    onClick={() =>
                      handlePayment("topup", undefined, pack.index)
                    }
                  >
                    {loading === `topup-${pack.index}`
                      ? "Processing..."
                      : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
