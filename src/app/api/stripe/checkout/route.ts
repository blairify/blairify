import { type NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/services/users/database-users";
import { stripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      lookupKey,
      email,
      priceId: providedPriceId,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let userEmail = email;

    // Try to get email from Firestore if possible (requires Admin SDK)
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile?.email) {
        userEmail = userProfile.email;
      }
    } catch (_error) {
      console.warn(
        "⚠️ Firestore access failed (missing Admin SDK?). Using client-provided email fallback.",
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 },
      );
    }

    let priceId: string;

    // Use provided price ID or lookup by key
    if (providedPriceId) {
      priceId = providedPriceId;
      console.log(`🔑 Using provided price ID: ${priceId}`);
    } else {
      // Find the price using the lookup key
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        expand: ["data.product"],
      });

      if (prices.data.length === 0) {
        return NextResponse.json(
          { error: "Price not found for lookup key" },
          { status: 404 },
        );
      }

      priceId = prices.data[0].id;
      console.log(`🔍 Found price ID via lookup key: ${priceId}`);
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/settings?tab=subscription&success=true`,
      cancel_url: `${appUrl}/settings?tab=subscription&canceled=true`,
      customer_email: userEmail,
      client_reference_id: userId, // This is crucial for the webhook
      allow_promotion_codes: true,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
