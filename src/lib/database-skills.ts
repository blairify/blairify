/**
 * Skills Database Operations
 */

import {
  collection,
  type DocumentData,
  doc,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import type { UserSkill } from "../types/firestore";
import { COLLECTIONS, ensureDatabase } from "./database-common";
import { safeGetDocs, safeSetDoc } from "./firestore-utils";

// ================================
// SKILLS OPERATIONS
// ================================

export async function getUserSkills(userId: string): Promise<UserSkill[]> {
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

    // Handle empty collection gracefully
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) =>
        ({
          skillId: doc.id,
          ...doc.data(),
        }) as UserSkill,
    );
  } catch (error) {
    console.error("Error getting user skills:", error);
    // Return empty array for new users rather than throwing
    if (error instanceof Error && error.message.includes("collection")) {
      console.log("Skills collection doesn't exist yet for user:", userId);
      return [];
    }
    throw error;
  }
}

export async function getSkillsByCategory(
  userId: string,
  category: string,
): Promise<UserSkill[]> {
  try {
    const database = ensureDatabase();
    const skillsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SKILLS,
    );
    const q = query(
      skillsRef,
      where("category", "==", category),
      orderBy("name"),
    );
    const snapshot = await safeGetDocs(q);

    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) =>
        ({
          skillId: doc.id,
          ...doc.data(),
        }) as UserSkill,
    );
  } catch (error) {
    console.error("Error getting skills by category:", error);
    throw error;
  }
}

export async function createOrUpdateSkill(
  userId: string,
  skillData: Omit<UserSkill, "createdAt" | "updatedAt">,
): Promise<UserSkill> {
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

    // Return the created/updated skill
    return skillDoc as UserSkill;
  } catch (error) {
    console.error("Error creating/updating skill:", error);
    throw error;
  }
}

// Default skills to create for new users
export function getDefaultSkills(): UserSkill[] {
  return [
    {
      skillId: "technical-communication",
      category: "communication",
      name: "Technical Communication",
      currentLevel: 5,
      targetLevel: 8,
      confidence: 5,
      progressHistory: [
        {
          date: Timestamp.now(),
          level: 5,
          confidence: 5,
          assessmentSource: "self-assessment",
        },
      ],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      skillId: "problem-solving",
      category: "problem-solving",
      name: "Problem Solving",
      currentLevel: 5,
      targetLevel: 8,
      confidence: 5,
      progressHistory: [
        {
          date: Timestamp.now(),
          level: 5,
          confidence: 5,
          assessmentSource: "self-assessment",
        },
      ],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      skillId: "technical-knowledge",
      category: "technical",
      name: "Technical Knowledge",
      currentLevel: 5,
      targetLevel: 8,
      confidence: 5,
      progressHistory: [
        {
          date: Timestamp.now(),
          level: 5,
          confidence: 5,
          assessmentSource: "self-assessment",
        },
      ],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      totalPracticeTime: 0,
      practiceCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];
}
