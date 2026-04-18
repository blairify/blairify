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
  periodStart?: Date | { toDate?: () => Date } | null;
  lastInterviewAt?: Date | { toDate?: () => Date } | null;
}

interface UserData {
  subscription?: UserSubscription;
  usage?: UserUsage;
}

const DAILY_LIMIT = 2;
const RESET_PERIOD_HOURS = 24;

export interface UsageStatusResult {
  canStart: boolean;
  currentCount: number;
  maxCount: number;
  isPro: boolean;
  resetAtMs: number | null;
}

export async function getUsageStatus(
  userId: string,
): Promise<UsageStatusResult> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return {
      canStart: true,
      currentCount: 0,
      maxCount: DAILY_LIMIT,
      isPro: false,
      resetAtMs: null,
    };
  }

  try {
    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        canStart: true,
        currentCount: 0,
        maxCount: DAILY_LIMIT,
        isPro: false,
        resetAtMs: null,
      };
    }

    const userData = userDoc.data() as UserData;
    const subscription = userData?.subscription;
    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";

    if (isPro) {
      return {
        canStart: true,
        currentCount: 0,
        maxCount: DAILY_LIMIT,
        isPro: true,
        resetAtMs: null,
      };
    }

    const usage = userData?.usage || {
      interviewCount: 0,
      periodStart: null,
      lastInterviewAt: null,
    };
    const now = new Date();

    const toDate = (v: unknown): Date | null => {
      if (!v) return null;
      if (v instanceof Date) return v;
      if (typeof (v as { toDate?: () => Date }).toDate === "function")
        return (v as { toDate: () => Date }).toDate();
      return null;
    };

    const periodStart =
      toDate(usage.periodStart) ??
      toDate((usage as { lastInterviewAt?: unknown }).lastInterviewAt) ??
      now;

    const diffHours =
      (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60);
    const currentCount =
      diffHours >= RESET_PERIOD_HOURS ? 0 : usage.interviewCount;
    const canStart = currentCount < DAILY_LIMIT;
    const resetAtMs =
      periodStart.getTime() + RESET_PERIOD_HOURS * 60 * 60 * 1000;

    return {
      canStart,
      currentCount,
      maxCount: DAILY_LIMIT,
      isPro: false,
      resetAtMs: canStart ? null : resetAtMs,
    };
  } catch (error) {
    console.error("Error getting usage status:", error);
    return {
      canStart: true,
      currentCount: 0,
      maxCount: DAILY_LIMIT,
      isPro: false,
      resetAtMs: null,
    };
  }
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
        transaction.set(
          userRef,
          {
            usage: {
              interviewCount: 1,
              lastInterviewAt: FieldValue.serverTimestamp(),
              periodStart: FieldValue.serverTimestamp(),
            },
          },
          { merge: true },
        );
        return true;
      }

      const userData = userDoc.data() as UserData;
      const subscription = userData?.subscription;

      // Default usage if missing (migration/safety)
      const usage = userData?.usage || {
        interviewCount: 0,
        periodStart: null,
        lastInterviewAt: null,
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

      // 2. CHECK 24-HOUR RESET
      const now = new Date();

      const toDateInc = (v: unknown): Date | null => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (typeof (v as { toDate?: () => Date }).toDate === "function")
          return (v as { toDate: () => Date }).toDate();
        return null;
      };

      const periodStart =
        toDateInc(usage.periodStart) ?? toDateInc(usage.lastInterviewAt) ?? now;

      const diffMs = now.getTime() - periodStart.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const RESET_PERIOD_HOURS_INC = 24;
      let currentCount = usage.interviewCount;

      if (diffHours >= RESET_PERIOD_HOURS_INC) {
        console.log("🔄 24-hour reset period passed, resetting count");
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
      // Write periodStart when starting a new window (count was 0) OR if the
      // field was never written (migration: old users without periodStart).
      const periodStartMissing = !usage.periodStart;
      const shouldWritePeriodStart = currentCount === 0 || periodStartMissing;
      transaction.update(userRef, {
        "usage.interviewCount": currentCount + 1,
        "usage.lastInterviewAt": FieldValue.serverTimestamp(),
        ...(shouldWritePeriodStart
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
