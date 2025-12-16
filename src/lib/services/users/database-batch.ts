/**
 * Batch Database Operations
 */

import { doc, Timestamp, writeBatch } from "firebase/firestore";
import type { UserProfile } from "../../../types/firestore";
import { COLLECTIONS, ensureDatabase } from "../common/database-common";
import { getDefaultSkills } from "../skills/database-skills";

// ================================
// BATCH OPERATIONS
// ================================

export async function createUserWithCompleteProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const database = ensureDatabase();
    const batch = writeBatch(database);

    // Create user profile
    const userRef = doc(database, COLLECTIONS.USERS, userId);
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
        features: ["practice_questions", "basic_analytics"],
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
    };

    batch.set(userRef, profile);

    // Add default skills
    const defaultSkills = getDefaultSkills();
    defaultSkills.forEach((skill) => {
      const skillRef = doc(
        database,
        COLLECTIONS.USERS,
        userId,
        COLLECTIONS.SKILLS,
        skill.skillId,
      );
      batch.set(skillRef, skill);
    });

    await batch.commit();
    return profile;
  } catch (error) {
    console.error("Error creating user with complete profile:", error);
    throw error;
  }
}
