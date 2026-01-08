/**
 * User Profile Database Operations
 */

import { deleteDoc, doc, runTransaction, Timestamp } from "firebase/firestore";
import { safeGetDoc, safeSetDoc, safeUpdateDoc } from "@/lib/firestore-utils";
import {
  COLLECTIONS,
  ensureDatabase,
} from "@/lib/services/common/database-common";
import type { UserProfile } from "@/types/firestore";

// ================================
// USER PROFILE OPERATIONS
// ================================

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

      // Default usage if missing
      const usage = userData.usage || {
        interviewCount: 0,
        periodStart: Timestamp.now(),
        lastInterviewAt: Timestamp.now(),
      };

      const isPro =
        subscription?.plan === "pro" && subscription?.status === "active";

      const now = new Date();
      const lastInterviewAtDate = usage.lastInterviewAt.toDate();

      // 1. SKIP LIMITS FOR PRO
      if (isPro) {
        return {
          allowed: true,
          currentCount: usage.interviewCount,
          isPro: true,
          lastInterviewAt: lastInterviewAtDate,
        };
      }

      // 2. CHECK 15-MINUTE RESET
      const diffMs = now.getTime() - lastInterviewAtDate.getTime();
      const diffMin = diffMs / (1000 * 60);

      let currentCount = usage.interviewCount;

      if (diffMin >= 15) {
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
      transaction.update(docRef, {
        usage: {
          interviewCount: currentCount + 1,
          lastInterviewAt: updatedTimestamp,
          periodStart: usage.periodStart, // Keep existing periodStart
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
