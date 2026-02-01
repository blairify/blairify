/**
 * Server-side User Profile Database Operations
 * Uses Firebase Admin SDK - only import from API routes, never from client components
 */

import { getAdminFirestore } from "@/lib/firebase-admin";

interface SubscriptionUpdate {
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
  paymentFailed?: boolean;
  lastPaymentFailedAt?: FirebaseFirestore.Timestamp;
  lastPaymentSucceededAt?: FirebaseFirestore.Timestamp;
}

interface UserProfileUpdate {
  subscription?: Partial<SubscriptionUpdate>;
  stripeCustomerId?: string;
  lastActiveAt?: Date;
  [key: string]: unknown;
}

export async function updateUserProfileAdmin(
  userId: string,
  updates: UserProfileUpdate,
): Promise<void> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is required for admin operations",
    );
  }

  try {
    const adminDb = getAdminFirestore();
    const userRef = adminDb.collection("users").doc(userId);

    const updateData: Record<string, unknown> = {
      lastActiveAt: new Date(),
    };

    // Handle subscription updates with dot notation for partial updates
    if (updates.subscription) {
      for (const [key, value] of Object.entries(updates.subscription)) {
        if (value !== undefined) {
          updateData[`subscription.${key}`] = value;
        }
      }
    }

    // Handle other top-level updates
    if (updates.stripeCustomerId) {
      updateData.stripeCustomerId = updates.stripeCustomerId;
    }

    await userRef.update(updateData);
    console.log(`✅ [Admin] Updated user profile for ${userId}`);
  } catch (error) {
    console.error(
      `❌ [Admin] Error updating user profile for ${userId}:`,
      error,
    );
    throw error;
  }
}

export async function getUserProfileAdmin(
  userId: string,
): Promise<FirebaseFirestore.DocumentData | null> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is required for admin operations",
    );
  }

  try {
    const adminDb = getAdminFirestore();
    const userRef = adminDb.collection("users").doc(userId);
    const doc = await userRef.get();

    if (doc.exists) {
      return doc.data() || null;
    }
    return null;
  } catch (error) {
    console.error(
      `❌ [Admin] Error getting user profile for ${userId}:`,
      error,
    );
    throw error;
  }
}

export async function findUserByStripeCustomerIdAdmin(
  customerId: string,
): Promise<string | null> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is required for admin operations",
    );
  }

  try {
    const adminDb = getAdminFirestore();
    const usersRef = adminDb.collection("users");
    const querySnapshot = await usersRef
      .where("stripeCustomerId", "==", customerId)
      .get();

    if (querySnapshot.empty) {
      console.warn(
        `⚠️ [Admin] No user found with stripeCustomerId: ${customerId}`,
      );
      return null;
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error(`❌ [Admin] Error finding user by stripeCustomerId:`, error);
    return null;
  }
}
