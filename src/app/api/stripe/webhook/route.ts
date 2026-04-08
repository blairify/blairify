import { FieldValue } from "firebase-admin/firestore";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  FREE_SUBSCRIPTION,
  PRO_SUBSCRIPTION,
} from "@/lib/services/subscriptions/subscription-constants";
import {
  findUserByStripeCustomerIdAdmin,
  mergeSubscriptionIfNotPartner,
  type SubscriptionUpdate,
  updateSubscriptionIfNotPartner,
} from "@/lib/services/users/database-users.server";
import { stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  console.log("🔍 handleCheckoutCompleted called with session:", {
    id: session.id,
    client_reference_id: session.client_reference_id,
    customer: session.customer,
    subscription: session.subscription,
    payment_status: session.payment_status,
  });

  const userId = session.client_reference_id;
  const stripeCustomerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error("❌ No userId in checkout session");
    return;
  }

  console.log(`🎉 Checkout completed for user ${userId}`);
  console.log(
    `📋 Customer ID: ${stripeCustomerId}, Subscription ID: ${subscriptionId}`,
  );

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

  const updated = await updateSubscriptionIfNotPartner(
    userId,
    {
      ...PRO_SUBSCRIPTION,
      subscriptionSource: "stripe",
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
    { stripeCustomerId },
  );

  if (updated) {
    console.log(`✅ Updated subscription for user ${userId}`);
  } else {
    console.log(`⏭️ Skipping Stripe checkout update for partner user ${userId}`);
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;
  const userId = await findUserByStripeCustomerIdAdmin(customerId);

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

  let subscriptionStatus: SubscriptionUpdate["status"] = "active";
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

  const updated = await updateSubscriptionIfNotPartner(userId, {
    ...baseSubscription,
    subscriptionSource: "stripe",
    status: subscriptionStatus,
    stripeSubscriptionId: subData.id,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  });

  if (updated) {
    console.log(`✅ Updated subscription for user ${userId}`);
  } else {
    console.log(
      `⏭️ Skipping Stripe subscription update for partner user ${userId}`,
    );
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string;
  const userId = await findUserByStripeCustomerIdAdmin(customerId);

  if (!userId) {
    console.error(
      `❌ Cannot delete subscription: no user found for customer ${customerId}`,
    );
    return;
  }

  console.log(`🗑️ Subscription deleted for user ${userId}`);

  const updated = await updateSubscriptionIfNotPartner(userId, {
    ...FREE_SUBSCRIPTION,
    stripeSubscriptionId: FieldValue.delete() as unknown as string,
    currentPeriodEnd: FieldValue.delete() as unknown as Date,
    cancelAtPeriodEnd: FieldValue.delete() as unknown as boolean,
  });

  if (updated) {
    console.log(`✅ Subscription cleared for user ${userId}`);
  } else {
    console.log(
      `⏭️ Skipping Stripe subscription deletion for partner user ${userId}`,
    );
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomerIdAdmin(customerId);

  if (!userId) {
    console.error(
      `❌ Cannot handle failed payment: no user found for customer ${customerId}`,
    );
    return;
  }

  console.log(`⚠️ Invoice payment failed for user ${userId}`);

  const updated = await mergeSubscriptionIfNotPartner(userId, {
    paymentFailed: true,
    lastPaymentFailedAt: FieldValue.serverTimestamp(),
  });

  if (updated) {
    console.log(`✅ Marked payment failed for user ${userId}`);
  } else {
    console.log(
      `⏭️ Skipping Stripe invoice failure update for partner user ${userId}`,
    );
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = invoice.customer as string;
  const userId = await findUserByStripeCustomerIdAdmin(customerId);

  if (!userId) {
    return;
  }

  console.log(`✅ Invoice payment succeeded for user ${userId}`);

  const updated = await mergeSubscriptionIfNotPartner(userId, {
    paymentFailed: false,
    lastPaymentSucceededAt: FieldValue.serverTimestamp(),
  });

  if (updated) {
    console.log(`✅ Marked payment succeeded for user ${userId}`);
  } else {
    console.log(
      `⏭️ Skipping Stripe invoice success update for partner user ${userId}`,
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("🔔 Stripe webhook endpoint hit!");
  console.log(
    `🔑 Webhook secret configured: ${endpointSecret ? `Yes (starts with ${endpointSecret.substring(0, 10)}...)` : "NO - MISSING!"}`,
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  console.log(`📝 Signature present: ${sig ? "Yes" : "No"}`);
  console.log(`📦 Body length: ${body.length} chars`);

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.error(
        "❌ Webhook rejected: missing signature or endpoint secret",
      );
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 },
      );
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      console.log("✅ Signature verification passed!");
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
