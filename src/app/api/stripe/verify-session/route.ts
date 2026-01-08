import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      return NextResponse.json({ error: "Session not paid" }, { status: 400 });
    }

    const userId = session.client_reference_id;
    const stripeCustomerId = session.customer as string;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Proactively return success so frontend can update.
    // In a real production app with Admin SDK, we'd do the DB update here too.
    return NextResponse.json({
      success: true,
      userId,
      stripeCustomerId,
      plan: "pro",
    });
  } catch (err: any) {
    console.error("Stripe verification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
