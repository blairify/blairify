import { Timestamp } from "firebase/firestore";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { DatabaseService } from "@/lib/database";
import { findUserByStripeCustomerId } from "@/lib/services/users/database-users";
import { stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

type SubscriptionStatus = "active" | "cancelled" | "expired";

interface SubscriptionUpdate {
  plan: "free" | "pro";
  status: SubscriptionStatus;
  features: string[];
  limits: {
    sessionsPerMonth: number;
    skillsTracking: number;
    analyticsRetention: number;
  };
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

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

const FREE_SUBSCRIPTION: SubscriptionUpdate = {
  plan: "free",
  status: "active",
  features: ["basic-interviews", "progress-tracking"],
  limits: {
    sessionsPerMonth: 10,
    skillsTracking: 5,
    analyticsRetention: 30,
  },
};

async function updateUserSubscription(
  userId: string,
  subscription: Partial<SubscriptionUpdate>,
  additionalData?: Record<string, unknown>,
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      subscription,
      lastActiveAt: new Date(),
    };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    await DatabaseService.updateUserProfile(userId, updateData);
    console.log(`✅ Updated subscription for user ${userId}:`, subscription);
  } catch (error) {
    console.error(`Error updating subscription for user ${userId}:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id;
  const stripeCustomerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error("❌ No userId in checkout session");
    return;
  }

  console.log(`🎉 Checkout completed for user ${userId}`);

  let currentPeriodEnd: Date | undefined;
  let cancelAtPeriodEnd = false;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subData = subscription as unknown as {
      current_period_end: number;
      cancel_at_period_end: boolean;
    };
    currentPeriodEnd = new Date(subData.current_period_end * 1000);
    cancelAtPeriodEnd = subData.cancel_at_period_end;
  }

  await updateUserSubscription(
    userId,
    {
      ...PRO_SUBSCRIPTION,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
    { stripeCustomerId },
  );
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;
  const userId = await findUserByStripeCustomerId(customerId);

  if (!userId) {
    console.error(
      `❌ Cannot update subscription: no user found for customer ${customerId}`,
    );
    return;
  }

  console.log(`🔄 Subscription updated for user ${userId}`);

  const subData = subscription as unknown as {
    status: Stripe.Subscription.Status;
    cancel_at_period_end: boolean;
    current_period_end: number;
    id: string;
  };
  const status = subData.status;
  const cancelAtPeriodEnd = subData.cancel_at_period_end;
  const currentPeriodEnd = new Date(subData.current_period_end * 1000);

  let subscriptionStatus: SubscriptionStatus = "active";
  let plan: "free" | "pro" = "pro";

  switch (status) {
    case "active":
    case "trialing":
      subscriptionStatus = "active";
      plan = "pro";
      break;
    case "canceled":
    case "unpaid":
      subscriptionStatus = "cancelled";
      plan = "free";
      break;
    case "past_due":
      subscriptionStatus = "active";
      plan = "pro";
      break;
    case "incomplete":
    case "incomplete_expired":
      subscriptionStatus = "expired";
      plan = "free";
      break;
    case "paused":
      subscriptionStatus = "cancelled";
      plan = "free";
      break;
    default: {
      const _exhaustive: never = status;
      console.warn(`Unknown subscription status: ${status}`);
    }
  }

  const baseSubscription =
    plan === "pro" ? PRO_SUBSCRIPTION : FREE_SUBSCRIPTION;

  await updateUserSubscription(userId, {
    ...baseSubscription,
    status: subscriptionStatus,
    stripeSubscriptionId: subData.id,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;
  const userId = await findUserByStripeCustomerId(customerId);

  if (!userId) {
    console.error(
      `❌ Cannot delete subscription: no user found for customer ${customerId}`,
    );
    return;
  }

  console.log(`🗑️ Subscription deleted for user ${userId}`);

  await updateUserSubscription(userId, {
    ...FREE_SUBSCRIPTION,
    stripeSubscriptionId: undefined,
    currentPeriodEnd: undefined,
    cancelAtPeriodEnd: undefined,
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomerId(customerId);

  if (!userId) {
    console.error(
      `❌ Cannot handle failed payment: no user found for customer ${customerId}`,
    );
    return;
  }

  console.log(`⚠️ Invoice payment failed for user ${userId}`);

  // Get current user profile to preserve existing subscription data
  const currentProfile = await DatabaseService.getUserProfile(userId);
  if (!currentProfile?.subscription) {
    console.error(`❌ No subscription found for user ${userId}`);
    return;
  }

  await DatabaseService.updateUserProfile(userId, {
    subscription: {
      ...currentProfile.subscription,
      paymentFailed: true,
      lastPaymentFailedAt: Timestamp.now(),
    },
    lastActiveAt: Timestamp.now(),
  });
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomerId(customerId);

  if (!userId) {
    return;
  }

  console.log(`✅ Invoice payment succeeded for user ${userId}`);

  // Get current user profile to preserve existing subscription data
  const currentProfile = await DatabaseService.getUserProfile(userId);
  if (!currentProfile?.subscription) {
    console.error(`❌ No subscription found for user ${userId}`);
    return;
  }

  await DatabaseService.updateUserProfile(userId, {
    subscription: {
      ...currentProfile.subscription,
      paymentFailed: false,
      lastPaymentSucceededAt: Timestamp.now(),
    },
    lastActiveAt: Timestamp.now(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.warn(
        "⚠️ Webhook signature verification skipped (missing secret or signature)",
      );
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  console.log(`📥 Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Webhook handler error: ${message}`);
    return NextResponse.json(
      { error: "Webhook handler failed", details: message },
      { status: 500 },
    );
  }
}
