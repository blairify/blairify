import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

interface SubscriptionStatusResponse {
  status: "pending" | "active" | "failed";
  plan?: "free" | "pro";
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const userData = await DatabaseService.getUserProfile(userId);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscription = userData?.subscription;
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      const response: SubscriptionStatusResponse = {
        status: "pending",
        message: "Waiting for payment confirmation...",
      };
      return NextResponse.json(response);
    }

    if (subscription?.plan === "pro" && subscription?.status === "active") {
      const response: SubscriptionStatusResponse = {
        status: "active",
        plan: "pro",
        message: "Subscription activated successfully!",
      };
      return NextResponse.json(response);
    }

    if (
      subscription?.status === "cancelled" ||
      subscription?.status === "expired"
    ) {
      const response: SubscriptionStatusResponse = {
        status: "failed",
        plan: subscription?.plan,
        message: "Subscription activation failed. Please contact support.",
      };
      return NextResponse.json(response);
    }

    const response: SubscriptionStatusResponse = {
      status: "pending",
      plan: subscription?.plan,
      message: "Processing your subscription...",
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 },
    );
  }
}
