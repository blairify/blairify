import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  getPartnerDomain,
  isPartnerEmail,
} from "@/lib/services/subscriptions/partner-domains";
import { PRO_SUBSCRIPTION } from "@/lib/services/subscriptions/subscription-constants";
import {
  getUserProfileAdmin,
  updateUserProfileAdmin,
} from "@/lib/services/users/database-users.server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const idToken = authHeader.slice(7);
    const adminAuth = getAdminAuth();

    let decodedToken: { uid: string };
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    const firebaseUser = await adminAuth.getUser(userId);

    if (!firebaseUser.email) {
      return NextResponse.json(
        { error: "No email associated with this account" },
        { status: 400 },
      );
    }

    if (!isPartnerEmail(firebaseUser.email)) {
      return NextResponse.json(
        { error: "Email domain is not a recognised partner" },
        { status: 403 },
      );
    }

    if (!firebaseUser.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Email must be verified before activating partner subscription",
          requiresVerification: true,
        },
        { status: 403 },
      );
    }

    const userProfile = await getUserProfileAdmin(userId);

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const existingSubscription = userProfile.subscription as
      | { subscriptionSource?: string; plan?: string }
      | undefined;

    if (
      existingSubscription?.subscriptionSource === "partner" &&
      existingSubscription?.plan === "pro"
    ) {
      return NextResponse.json({
        status: "already_active",
        plan: "pro",
        message: "Partner subscription is already active.",
      });
    }

    const partnerDomain = getPartnerDomain(firebaseUser.email);

    await updateUserProfileAdmin(userId, {
      subscription: {
        ...PRO_SUBSCRIPTION,
        subscriptionSource: "partner",
        partnerDomain: partnerDomain ?? undefined,
      },
    });

    return NextResponse.json({
      status: "activated",
      plan: "pro",
      message: "Partner subscription activated successfully.",
    });
  } catch (error) {
    console.error("Partner verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify partner subscription" },
      { status: 500 },
    );
  }
}
