/**
 * User Profile Database Operations
 */

import { deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { UserProfile } from "../types/firestore";
import { COLLECTIONS, ensureDatabase } from "./database-common";
import { safeGetDoc, safeSetDoc, safeUpdateDoc } from "./firestore-utils";

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
      role: profileData.role,
      experience: profileData.experience,
      howDidYouHear: profileData.howDidYouHear,
      preferences: {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical"],
        targetCompanies: [],
        notificationsEnabled: true,
        darkMode: false,
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
