/**
 * Simplified Database Service for Blairify Application
 * Core Firestore operations with proper error handling
 */

import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import type {
  InterviewSession,
  UserProfile,
  UserSkill,
} from "../types/firestore";
import { db } from "./firebase";
import {
  safeGetDoc,
  safeGetDocs,
  safeSetDoc,
  safeUpdateDoc,
} from "./firestore-utils";

// ================================
// DATABASE HELPER FUNCTIONS
// ================================

const ensureDatabase = () => {
  if (!db) {
    throw new Error("Firestore database is not initialized");
  }
  return db;
};

// ================================
// COLLECTION REFERENCES
// ================================

const COLLECTIONS = {
  USERS: "users",
  SKILLS: "skills",
  SESSIONS: "sessions",
  ANALYTICS: "analytics",
  PROGRESS: "progress",
  ACTIVITIES: "activities",
  ACHIEVEMENTS: "achievements",
} as const;

// ================================
// CORE USER OPERATIONS
// ================================

export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const docSnap = await safeGetDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const createUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<void> => {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);

    const profile: UserProfile = {
      uid: userId,
      email: profileData.email || "",
      displayName: profileData.displayName || "",
      photoURL: profileData.photoURL,
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
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> => {
  try {
    const database = ensureDatabase();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const updateData = {
      ...updates,
      lastActiveAt: Timestamp.now(),
    };

    await safeUpdateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateLastLogin = async (userId: string): Promise<void> => {
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
};

// ================================
// SKILLS OPERATIONS
// ================================

export const getUserSkills = async (userId: string): Promise<UserSkill[]> => {
  try {
    const database = ensureDatabase();
    const skillsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SKILLS,
    );
    const q = query(skillsRef, orderBy("category"), orderBy("name"));
    const snapshot = await safeGetDocs(q);

    return snapshot.docs.map(
      (docSnap) =>
        ({
          skillId: docSnap.id,
          ...docSnap.data(),
        }) as UserSkill,
    );
  } catch (error) {
    console.error("Error getting user skills:", error);
    throw error;
  }
};

export const createOrUpdateSkill = async (
  userId: string,
  skillData: UserSkill,
): Promise<void> => {
  try {
    const database = ensureDatabase();
    const skillRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SKILLS,
      skillData.skillId,
    );
    const skillDoc = {
      ...skillData,
      updatedAt: Timestamp.now(),
    };

    await safeSetDoc(skillRef, skillDoc, { merge: true });
  } catch (error) {
    console.error("Error creating/updating skill:", error);
    throw error;
  }
};

// ================================
// SESSION OPERATIONS
// ================================

export const createSession = async (
  userId: string,
  sessionData: Omit<InterviewSession, "sessionId" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    const database = ensureDatabase();
    const sessionsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
    );
    const sessionDoc = doc(sessionsRef);

    const session: InterviewSession = {
      ...sessionData,
      sessionId: sessionDoc.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await safeSetDoc(sessionDoc, session);
    return sessionDoc.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const getSession = async (
  userId: string,
  sessionId: string,
): Promise<InterviewSession | null> => {
  try {
    const database = ensureDatabase();
    const sessionRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
      sessionId,
    );
    const sessionDoc = await safeGetDoc(sessionRef);

    if (sessionDoc.exists()) {
      return sessionDoc.data() as InterviewSession;
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    throw error;
  }
};

export const getUserSessions = async (
  userId: string,
  limitCount: number = 10,
): Promise<InterviewSession[]> => {
  try {
    const database = ensureDatabase();
    const sessionsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
    );
    const q = query(
      sessionsRef,
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const snapshot = await safeGetDocs(q);

    return snapshot.docs.map((docSnap) => docSnap.data() as InterviewSession);
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

export const updateSession = async (
  userId: string,
  sessionId: string,
  updates: Partial<InterviewSession>,
): Promise<void> => {
  try {
    const database = ensureDatabase();
    const sessionRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
      sessionId,
    );
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await safeUpdateDoc(sessionRef, updateData);
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

// ================================
// BATCH OPERATIONS
// ================================

export const createUserWithInitialData = async (
  userId: string,
  profileData: Partial<UserProfile>,
  initialSkills: UserSkill[] = [],
): Promise<void> => {
  try {
    const database = ensureDatabase();
    const batch = writeBatch(database);

    // Create user profile
    const userRef = doc(database, COLLECTIONS.USERS, userId);
    const profile: UserProfile = {
      uid: userId,
      email: profileData.email || "",
      displayName: profileData.displayName || "",
      photoURL: profileData.photoURL,
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

    batch.set(userRef, profile);

    // Add initial skills
    initialSkills.forEach((skill) => {
      const skillRef = doc(
        database,
        COLLECTIONS.USERS,
        userId,
        COLLECTIONS.SKILLS,
        skill.skillId,
      );
      batch.set(skillRef, {
        ...skill,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error creating user with initial data:", error);
    throw error;
  }
};

// ================================
// SAMPLE DATA HELPERS
// ================================

export const getDefaultSkills = (): UserSkill[] => {
  return [
    {
      skillId: "javascript",
      category: "technical",
      name: "JavaScript",
      currentLevel: 5,
      targetLevel: 8,
      confidence: 6,
      progressHistory: [],
      strengths: ["ES6+", "Async/Await", "DOM Manipulation"],
      weaknesses: ["Memory Management", "Performance Optimization"],
      recommendations: [
        "Practice more complex algorithms",
        "Learn about V8 engine",
      ],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      skillId: "react",
      category: "technical",
      name: "React",
      currentLevel: 6,
      targetLevel: 9,
      confidence: 7,
      progressHistory: [],
      strengths: ["Hooks", "Component Design", "State Management"],
      weaknesses: ["Performance Optimization", "Testing"],
      recommendations: [
        "Learn React Testing Library",
        "Practice with React.memo and useMemo",
      ],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      skillId: "communication",
      category: "bullet",
      name: "Communication",
      currentLevel: 7,
      targetLevel: 9,
      confidence: 8,
      progressHistory: [],
      strengths: ["Clear explanations", "Active listening"],
      weaknesses: ["Technical presentation", "Handling difficult questions"],
      recommendations: [
        "Practice explaining complex concepts simply",
        "Record yourself answering questions",
      ],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];
};

// ================================
// EXPORT CORE FUNCTIONS
// ================================

export const DatabaseService = {
  // User Operations
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateLastLogin,

  // Skills Operations
  getUserSkills,
  createOrUpdateSkill,

  // Session Operations
  createSession,
  getSession,
  getUserSessions,
  updateSession,

  // Batch Operations
  createUserWithInitialData,

  // Helpers
  getDefaultSkills,
};
