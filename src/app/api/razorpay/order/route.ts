import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { PLAN_CONFIG, TOPUP_PACKS } from "@/lib/credits";
import { Plan } from "@/generated/prisma/enums";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, plan, topupIndex } = await req.json();

    let amount: number;
    let credits: number;
    let selectedPlan: Plan | null = null;

    if (type === "subscription" && plan) {
      const config = PLAN_CONFIG[plan as Plan];
      if (!config || config.price === 0) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      amount = config.price;
      credits = config.credits;
      selectedPlan = plan as Plan;
    } else if (type === "topup" && topupIndex !== undefined) {
      const pack = TOPUP_PACKS[topupIndex];
      if (!pack) {
        return NextResponse.json({ error: "Invalid topup pack" }, { status: 400 });
      }
      amount = pack.price;
      credits = pack.credits;
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `gramradar_${Date.now()}`,
    });

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: type === "subscription" ? "SUBSCRIPTION" : "TOPUP",
        amount,
        credits,
        razorpayOrderId: order.id,
        plan: selectedPlan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
