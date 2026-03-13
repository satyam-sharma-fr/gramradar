import { Plan } from "@/generated/prisma/enums";

export const PLAN_CONFIG = {
  [Plan.FREE]: {
    name: "Free",
    price: 0,
    credits: 25,
    priceLabel: "Free",
  },
  [Plan.STARTER]: {
    name: "Starter",
    price: 99900, // paise = ₹999
    credits: 300,
    priceLabel: "₹999/mo",
  },
  [Plan.GROWTH]: {
    name: "Growth",
    price: 299900, // paise = ₹2,999
    credits: 1500,
    priceLabel: "₹2,999/mo",
  },
  [Plan.PRO]: {
    name: "Pro",
    price: 699900, // paise = ₹6,999
    credits: 5000,
    priceLabel: "₹6,999/mo",
  },
} as const;

export const TOPUP_PACKS = [
  { credits: 50, price: 24900, label: "50 credits — ₹249" },
  { credits: 200, price: 49900, label: "200 credits — ₹499" },
  { credits: 500, price: 99900, label: "500 credits — ₹999" },
] as const;

export function getMonthlyCredits(plan: Plan): number {
  return PLAN_CONFIG[plan].credits;
}

export function hasEnoughCredits(currentCredits: number, required: number): boolean {
  return currentCredits >= required;
}
