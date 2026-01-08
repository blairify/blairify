import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateUserProfile } from "@/lib/services/users/database-users";
import { stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      // For local development without a webhook secret, we skip verification
      // BUT in production this is a security risk.
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;

        if (userId) {
          await updateUserProfile(userId, {
            subscription: {
              plan: "pro",
              status: "active",
              // You might want to add more fields here like stripeSubscriptionId
            },
            // We store the customer ID for future portal access
            ...({ stripeCustomerId } as any),
          } as any);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const _subscription = event.data.object as Stripe.Subscription;
        // In a real scenario, you'd lookup the user by stripeCustomerId
        // For simplicity, we search for the user who bears this customer ID
        // (This might require a database index or a different service)
        // For now, we'll assume we have a way to find them or just wait for the user to store it.
        break;
      }

      case "customer.subscription.updated": {
        const _subscription = event.data.object as Stripe.Subscription;
        // Handle renewal, cancellation, etc.
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
