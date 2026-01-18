import { type NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";

interface SubscriptionStatusResponse {
  status: "pending" | "active" | "failed";
  plan?: "free" | "pro";
  message?: string;
}

type SubscriptionUpdate = {
  plan: "free" | "pro";
  status: "active" | "cancelled" | "expired";
  features: string[];
  limits: {
    sessionsPerMonth: number;
    skillsTracking: number;
    analyticsRetention: number;
  };
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
};

const PRO_SUBSCRIPTION: SubscriptionUpdate = {
  plan: "pro",
  status: "active",
  features: ["unlimited_interviews", "advanced_analytics", "skill_roadmaps"],
  limits: {
    sessionsPerMonth: 9999,
    skillsTracking: 9999,
    analyticsRetention: 365,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId } = (await req.json()) as {
      userId?: string;
      sessionId?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription as
      | { plan?: "free" | "pro"; status?: string }
      | undefined;
    const stripeCustomerId = userData?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      if (!sessionId) {
        const response: SubscriptionStatusResponse = {
          status: "pending",
          message: "Waiting for payment confirmation...",
        };
        return NextResponse.json(response);
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const status = session.status;
      const paymentStatus = session.payment_status;

      if (status !== "complete" || paymentStatus !== "paid") {
        const response: SubscriptionStatusResponse = {
          status: "pending",
          message: "Processing your subscription...",
        };
        return NextResponse.json(response);
      }

      const customer = session.customer;
      const stripeSubscriptionId = session.subscription;

      if (typeof customer !== "string") {
        const response: SubscriptionStatusResponse = {
          status: "pending",
          message: "Finalizing payment confirmation...",
        };
        return NextResponse.json(response);
      }

      let currentPeriodEnd: Date | undefined;
      let cancelAtPeriodEnd: boolean | undefined;

      if (typeof stripeSubscriptionId === "string") {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subData = sub as unknown as {
          status: string;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };
        const subStatus = subData.status;

        if (
          subStatus !== "active" &&
          subStatus !== "trialing" &&
          subStatus !== "past_due"
        ) {
          const response: SubscriptionStatusResponse = {
            status: "failed",
            plan: "free",
            message: "Subscription activation failed. Please contact support.",
          };
          return NextResponse.json(response);
        }

        currentPeriodEnd = new Date(subData.current_period_end * 1000);
        cancelAtPeriodEnd = subData.cancel_at_period_end;
      }

      await adminDb
        .collection("users")
        .doc(userId)
        .set(
          {
            stripeCustomerId: customer,
            subscription: {
              ...PRO_SUBSCRIPTION,
              ...(typeof stripeSubscriptionId === "string"
                ? { stripeSubscriptionId }
                : {}),
              ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
              ...(cancelAtPeriodEnd !== undefined ? { cancelAtPeriodEnd } : {}),
            },
            lastActiveAt: new Date(),
          },
          { merge: true },
        );

      const response: SubscriptionStatusResponse = {
        status: "active",
        plan: "pro",
        message: "Subscription activated successfully!",
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
