/**
 * Server-side usage limit enforcement
 * This file should ONLY be imported from API routes, never from client components
 */

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";

interface UserSubscription {
  plan: "free" | "pro";
  status: "active" | "cancelled" | "expired";
}

interface UserUsage {
  interviewCount: number;
  periodStart: Date | { toDate?: () => Date };
  lastInterviewAt: Date | { toDate?: () => Date };
}

interface UserData {
  subscription?: UserSubscription;
  usage?: UserUsage;
}

export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  // Check if Firebase Admin is properly configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn(
      "⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing. Usage limits are NOT being enforced on the server.",
    );
    return true; // Fail open
  }

  try {
    const adminDb = getAdminFirestore();
    const userRef = adminDb.collection("users").doc(userId);

    return await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as UserData;
      const subscription = userData?.subscription;

      // Default usage if missing (migration/safety)
      const usage = userData?.usage || {
        interviewCount: 0,
        periodStart: new Date(),
        lastInterviewAt: new Date(),
      };

      console.log("📊 Usage data:", {
        userId,
        plan: subscription?.plan,
        status: subscription?.status,
        interviewCount: usage.interviewCount,
      });

      // 1. SKIP LIMITS FOR PRO
      if (subscription?.plan === "pro" && subscription?.status === "active") {
        console.log("✅ Pro user, skipping limits");
        return true;
      }

      // 2. CHECK 1-HOUR RESET
      const now = new Date();
      const lastInterviewAt =
        usage.lastInterviewAt instanceof Date
          ? usage.lastInterviewAt
          : (usage.lastInterviewAt as { toDate?: () => Date })?.toDate?.() ||
            new Date();

      const diffMs = now.getTime() - lastInterviewAt.getTime();
      const diffMin = diffMs / (1000 * 60);

      // Reset period: 60 minutes (1 hour)
      const RESET_PERIOD_MINUTES = 60;
      let currentCount = usage.interviewCount;

      if (diffMin >= RESET_PERIOD_MINUTES) {
        console.log("🔄 1-hour reset period passed, resetting count");
        currentCount = 0;
      }

      // 3. ENFORCE LIMITS
      const DAILY_LIMIT = 2;
      console.log("📈 Limit check:", {
        currentCount,
        DAILY_LIMIT,
        wouldBlock: currentCount >= DAILY_LIMIT,
      });
      if (currentCount >= DAILY_LIMIT) {
        return false;
      }

      // 4. INCREMENT USAGE
      // Reset periodStart when the count was reset (new period started)
      const shouldResetPeriod = diffMin >= RESET_PERIOD_MINUTES;
      transaction.update(userRef, {
        "usage.interviewCount": currentCount + 1,
        "usage.lastInterviewAt": FieldValue.serverTimestamp(),
        ...(shouldResetPeriod
          ? { "usage.periodStart": FieldValue.serverTimestamp() }
          : {}),
      });

      return true;
    });
  } catch (error) {
    console.error("Error checking usage limits:", error);
    throw error;
  }
}
