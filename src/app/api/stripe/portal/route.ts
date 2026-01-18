import { type NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/services/users/database-users";
import { stripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let stripeCustomerId: string | undefined;
    let userEmail = email;

    // Try to get data from Firestore (requires Admin SDK)
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        stripeCustomerId = (userProfile as any).stripeCustomerId;
        userEmail = userEmail || userProfile.email;
      }
    } catch (_error) {
      console.warn(
        "⚠️ Firestore access failed in portal route (missing Admin SDK?). Using fallbacks.",
      );
    }

    if (!stripeCustomerId && userEmail) {
      // Try to find the customer by email if not found in DB
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer found. Please make sure you have an active subscription or have started a checkout.",
        },
        { status: 404 },
      );
    }

    const appUrl = getAppUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/upgrade`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
