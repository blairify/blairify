/**
 * User Profile Database Operations
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";
import { safeGetDoc, safeSetDoc, safeUpdateDoc } from "@/lib/firestore-utils";
import {
  COLLECTIONS,
  ensureDatabase,
} from "@/lib/services/common/database-common";
import type { UserProfile } from "@/types/firestore";

// ================================
// USER PROFILE OPERATIONS
// ================================

export async function findUserByStripeCustomerId(
  customerId: string,
): Promise<string | null> {
  try {
    const database = ensureDatabase();
    const usersRef = collection(database, COLLECTIONS.USERS);
    const q = query(usersRef, where("stripeCustomerId", "==", customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`⚠️ No user found with stripeCustomerId: ${customerId}`);
      return null;
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error("Error finding user by stripeCustomerId:", error);
    return null;
  }
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const docSnap = await safeGetDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

export async function createUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);

    const profile: UserProfile = {
      uid: userId,
      email: profileData.email || "",
      displayName: profileData.displayName || "",
      ...(profileData.photoURL && { photoURL: profileData.photoURL }),
      ...(profileData.role && { role: profileData.role }),
      ...(profileData.experience && { experience: profileData.experience }),
      ...(profileData.cookieConsent && {
        cookieConsent: profileData.cookieConsent,
      }),
      ...(profileData.gdprData && { gdprData: profileData.gdprData }),
      preferences: {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical"],
        targetCompanies: [],
        notificationsEnabled: true,
        language: "en",
        ...profileData.preferences,
      },
      subscription: {
        plan: "free",
        status: "active",
        features: ["basic-interviews", "progress-tracking"],
        limits: {
          sessionsPerMonth: 10,
          skillsTracking: 5,
          analyticsRetention: 30,
        },
        ...profileData.subscription,
      },
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
      isActive: true,
      usage: {
        interviewCount: 0,
        lastInterviewAt: Timestamp.now(),
        periodStart: Timestamp.now(),
      },
    };

    await safeSetDoc(docRef, profile);
    return profile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const updateData = {
      ...updates,
      lastActiveAt: Timestamp.now(),
    };

    await safeUpdateDoc(docRef, updateData);

    // Get and return the updated profile
    const updatedDoc = await safeGetDoc(docRef);
    if (updatedDoc.exists()) {
      return updatedDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return false;
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await safeUpdateDoc(docRef, {
      lastLoginAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}

export async function checkUsageStatus(userId: string): Promise<{
  canStart: boolean;
  currentCount: number;
  isPro: boolean;
  remainingMinutes: number;
  resetAtMs: number | null;
}> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const userDoc = await safeGetDoc(docRef);

    if (!userDoc.exists()) {
      return {
        canStart: true,
        currentCount: 0,
        isPro: false,
        remainingMinutes: 0,
        resetAtMs: null,
      };
    }

    const userData = userDoc.data() as UserProfile;
    const subscription = userData.subscription;

    // Safely extract usage — do NOT default periodStart to now() inside the
    // spread, because that would silently hide missing-periodStart bugs.
    const rawUsage = userData.usage;
    const interviewCount = rawUsage?.interviewCount ?? 0;

    // Helper to coerce a Firestore Timestamp or Date to a JS Date.
    const toJsDate = (v: unknown): Date | null => {
      if (!v) return null;
      if (v instanceof Date) return v;
      if (typeof (v as Timestamp).toDate === "function")
        return (v as Timestamp).toDate();
      return null;
    };

    // Prefer periodStart. Fall back to lastInterviewAt for users whose
    // documents pre-date the periodStart field (they hit their limit, so
    // lastInterviewAt is the closest anchor we have). Only use `now` as a
    // last resort when no usage record exists at all.
    const periodStartDate: Date =
      toJsDate(rawUsage?.periodStart) ??
      toJsDate(rawUsage?.lastInterviewAt) ??
      new Date();

    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";

    if (isPro) {
      return {
        canStart: true,
        currentCount: interviewCount,
        isPro: true,
        remainingMinutes: 0,
        resetAtMs: null,
      };
    }

    const now = new Date();
    const diffMs = now.getTime() - periodStartDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Reset period: 24 hours
    const RESET_PERIOD_HOURS = 24;
    let currentCount = interviewCount;
    if (diffHours >= RESET_PERIOD_HOURS) {
      currentCount = 0;
    }

    const DAILY_LIMIT = 2;
    const canStart = currentCount < DAILY_LIMIT;

    // Absolute epoch ms when the current 24-h window resets.
    const resetAtMs =
      periodStartDate.getTime() + RESET_PERIOD_HOURS * 60 * 60 * 1000;
    const remainingMs = resetAtMs - now.getTime();
    const remainingMinutes = canStart
      ? 0
      : Math.max(0, Math.ceil(remainingMs / (1000 * 60)));

    return {
      canStart,
      currentCount,
      isPro: false,
      remainingMinutes,
      resetAtMs: canStart ? null : resetAtMs,
    };
  } catch (error) {
    console.error("Error checking usage status:", error);
    return {
      canStart: true,
      currentCount: 0,
      isPro: false,
      remainingMinutes: 0,
      resetAtMs: null,
    };
  }
}

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  isPro: boolean;
  lastInterviewAt?: Date;
}> {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);

    return await runTransaction(database, async (transaction) => {
      const userDoc = await transaction.get(docRef);
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as UserProfile;
      const subscription = userData.subscription;

      const usage = {
        interviewCount: 0,
        periodStart: Timestamp.now(),
        lastInterviewAt: Timestamp.now(),
        ...(userData.usage ?? {}),
      };

      const isPro =
        subscription?.plan === "pro" && subscription?.status === "active";

      const now = new Date();
      const lastInterviewAtDate =
        usage.lastInterviewAt instanceof Date
          ? usage.lastInterviewAt
          : typeof (usage.lastInterviewAt as Timestamp | undefined)?.toDate ===
              "function"
            ? (usage.lastInterviewAt as Timestamp).toDate()
            : now;

      const periodStartDate =
        usage.periodStart instanceof Date
          ? usage.periodStart
          : typeof (usage.periodStart as Timestamp | undefined)?.toDate ===
              "function"
            ? (usage.periodStart as Timestamp).toDate()
            : now;

      // 1. SKIP LIMITS FOR PRO
      if (isPro) {
        return {
          allowed: true,
          currentCount: usage.interviewCount,
          isPro: true,
          lastInterviewAt: lastInterviewAtDate,
        };
      }

      // 2. CHECK 24-HOUR RESET
      const diffMs = now.getTime() - periodStartDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Reset period: 24 hours
      const RESET_PERIOD_HOURS = 24;
      let currentCount = usage.interviewCount;

      if (diffHours >= RESET_PERIOD_HOURS) {
        currentCount = 0;
      }

      // 3. ENFORCE LIMITS
      const DAILY_LIMIT = 2;
      if (currentCount >= DAILY_LIMIT) {
        return {
          allowed: false,
          currentCount,
          isPro: false,
          lastInterviewAt: lastInterviewAtDate,
        };
      }

      // 4. INCREMENT USAGE
      const updatedTimestamp = Timestamp.now();
      const newPeriodStart =
        currentCount === 0 ? updatedTimestamp : usage.periodStart;

      transaction.update(docRef, {
        usage: {
          interviewCount: currentCount + 1,
          lastInterviewAt: updatedTimestamp,
          periodStart: newPeriodStart,
        },
      });

      return {
        allowed: true,
        currentCount: currentCount + 1,
        isPro: false,
        lastInterviewAt: updatedTimestamp.toDate(),
      };
    });
  } catch (error) {
    console.error("Error checking usage limits:", error);
    // On client side error, we might want to let them through or block.
    // Let's return allowed: true to avoid blocking users if Firestore is flaky,
    // but the transaction usually works fine.
    return { allowed: true, currentCount: 0, isPro: false };
  }
}
