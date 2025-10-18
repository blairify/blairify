/**
 * Practice Questions Service
 * Handles CRUD operations for practice questions in Firestore
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  APIArchitecture,
  BackendLanguage,
  CachingTech,
  CICD,
  CloudProvider,
  ContainerTech,
  CSSFramework,
  FrontendFramework,
  LLMProvider,
  MessageQueue,
  MLFramework,
  MobileDevelopment,
  Monitoring,
  NoSQLDatabase,
  ORM,
  SecurityTool,
  SQLDatabase,
  StateManagement,
  TechStack,
  TestingFramework,
} from "@/types/tech-stack";
import { db } from "./firebase";

export type QuestionCategory =
  | "algorithms"
  | "data-structures"
  | "system-design"
  | "behavioral"
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "security"
  | "testing"
  | "architecture"
  | "api-design"
  | "cloud"
  | "mobile"
  | "ml-ai"
  | "performance"
  | "scalability"
  | "debugging"
  | "code-review"
  | "leadership"
  | "communication"
  | "problem-solving";

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system-design"
  | "coding"
  | "architecture"
  | "case-study"
  | "take-home"
  | "pair-programming"
  | "whiteboard"
  | "live-coding";

export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "principal"
  | "architect";

export type CompanySize =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise"
  | "faang"
  | "unicorn";

export interface PracticeQuestion {
  id?: string;

  // Core Question Info
  category: QuestionCategory;
  subcategory?: string;
  difficulty: "easy" | "medium" | "hard";
  interviewType: InterviewType;
  experienceLevel?: ExperienceLevel[];

  // Company & Industry
  companies: string[];
  companySize?: CompanySize[];
  industries?: string[];

  // Tech Stack - Using comprehensive types
  primaryTechStack: TechStack[];
  secondaryTechStack?: TechStack[];

  // Specific Tech Categories
  languages?: BackendLanguage[];
  frontendFrameworks?: FrontendFramework[];
  backendFrameworks?: string[];
  databases?: (SQLDatabase | NoSQLDatabase)[];
  cloudProviders?: CloudProvider[];
  containers?: ContainerTech[];
  cicd?: CICD[];
  testing?: TestingFramework[];
  apiTypes?: APIArchitecture[];
  orms?: ORM[];
  cssFrameworks?: CSSFramework[];
  stateManagement?: StateManagement[];
  mobile?: MobileDevelopment[];
  messageQueues?: MessageQueue[];
  caching?: CachingTech[];
  monitoring?: Monitoring[];
  security?: SecurityTool[];
  mlFrameworks?: MLFramework[];
  llmProviders?: LLMProvider[];

  // Question Content
  question: string;
  context?: string;
  followUpQuestions?: string[];
  hints?: string[];
  commonMistakes?: string[];

  // Answer
  answer: {
    content: string;
    keyPoints: string[];
    codeExamples?: {
      language: string;
      code: string;
      explanation?: string;
    }[];
    diagrams?: string[];
    starFramework?: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
    tradeoffs?: {
      approach: string;
      pros: string[];
      cons: string[];
    }[];
  };

  // Metadata
  topicTags: string[];
  relatedQuestions?: string[]; // IDs of related questions
  prerequisites?: string[];
  learningResources?: {
    title: string;
    url: string;
    type: "article" | "video" | "documentation" | "course" | "book";
  }[];

  // Quality & Verification
  verified: boolean;
  aiGenerated: boolean;
  reviewedBy?: string[];
  lastReviewDate?: Timestamp;

  // Status
  isActive: boolean;
  isDraft?: boolean;

  // Source
  source: string;
  sourceUrl?: string;
  contributor?: string;

  // Timing
  estimatedMinutes: number;
  actualAvgMinutes?: number;

  // Usage Statistics
  usageStats: {
    usedByCount: number;
    totalAttempts: number;
    avgScore: number;
    avgTimeToComplete: number;
    completionRate: number;
    successRate: number;
    usageLast7Days: number;
    usageLast30Days: number;
    lastUsed?: Timestamp;
  };

  // Scoring
  popularityScore: number;
  qualityScore: number;
  difficultyRating?: number; // User-reported difficulty

  // Timestamps
  createdAt?: Timestamp;
  lastUpdatedAt?: Timestamp;
  version?: number;
}

const COLLECTION_NAME = "practice-questions";

/**
 * Get all practice questions
 */
export async function getAllPracticeQuestions(): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  const q = query(
    questionsRef,
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeQuestion[];
}

/**
 * Get practice questions by category
 */
export async function getPracticeQuestionsByCategory(
  category: string,
): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  const q = query(
    questionsRef,
    where("category", "==", category),
    where("isActive", "==", true),
    orderBy("difficulty", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeQuestion[];
}

/**
 * Get practice questions by difficulty
 */
export async function getPracticeQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  const q = query(
    questionsRef,
    where("difficulty", "==", difficulty),
    where("isActive", "==", true),
    orderBy("popularityScore", "desc"),
    limit(50),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeQuestion[];
}

/**
 * Get a single practice question by ID
 */
export async function getPracticeQuestionById(
  id: string,
): Promise<PracticeQuestion | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as PracticeQuestion;
}

/**
 * Create a new practice question
 */
export async function createPracticeQuestion(
  question: Omit<
    PracticeQuestion,
    "id" | "createdAt" | "lastUpdatedAt" | "version"
  >,
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(questionsRef, {
    ...question,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
    version: 1,
  });

  return docRef.id;
}

/**
 * Update an existing practice question
 */
export async function updatePracticeQuestion(
  id: string,
  updates: Partial<PracticeQuestion>,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    lastUpdatedAt: serverTimestamp(),
  });
}

/**
 * Delete a practice question (soft delete by setting isActive to false)
 */
export async function deletePracticeQuestion(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    isActive: false,
    lastUpdatedAt: serverTimestamp(),
  });
}

/**
 * Hard delete a practice question (permanent)
 */
export async function hardDeletePracticeQuestion(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Search practice questions
 */
export async function searchPracticeQuestions(
  searchTerm: string,
): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  // Note: Firestore doesn't support full-text search natively
  // This is a simple implementation that gets all questions and filters client-side
  // For production, consider using Algolia or similar service
  const questions = await getAllPracticeQuestions();

  const lowerSearchTerm = searchTerm.toLowerCase();
  return questions.filter(
    (q) =>
      q.question.toLowerCase().includes(lowerSearchTerm) ||
      q.category.toLowerCase().includes(lowerSearchTerm) ||
      q.topicTags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm)),
  );
}
