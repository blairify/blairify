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
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  APIArchitecture,
  BackendFramework,
  CachingTech,
  CICD,
  CloudProvider,
  ContainerTech,
  CSSFramework,
  FrontendFramework,
  IaC,
  LLMProvider,
  MessageQueue,
  MLFramework,
  MobileDevelopment,
  Monitoring,
  NoSQLDatabase,
  ORM,
  ProgrammingLanguage,
  Protocol,
  SearchEngine,
  SecurityTool,
  SQLDatabase,
  StateManagement,
  TechStack,
  TestingFramework,
  VectorDatabase,
  WebServer,
} from "@/types/tech-stack";
import { db } from "../../firebase";

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

export type ExperienceLevel = "entry" | "junior" | "mid" | "senior";

export type CompanySize =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise"
  | "faang"
  | "unicorn";

export type CompanyLogo =
  // FAANG/Big Tech
  | "SiGoogle"
  | "SiMeta"
  | "SiAmazon"
  | "SiApple"
  | "SiNetflix"
  | "SiMicrosoft"

  // Other Tech Giants
  | "SiTesla"
  | "SiNvidia"
  | "SiOracle"
  | "SiSalesforce"
  | "SiIbm"
  | "SiIntel"
  | "SiAdobe"
  | "SiSap"
  | "SiCisco"
  | "SiX"
  | "SiLinkedin"
  | "SiSnapchat"
  | "SiTiktok"
  | "SiReddit"
  | "SiAmazonaws"
  | "SiMicrosoftazure"
  | "SiGooglecloud"
  | "SiCloudflare"
  | "SiVercel"
  | "SiStripe"
  | "SiSpotify"
  | "SiUber"
  | "SiAirbnb"
  | "SiShopify"
  | "SiZoom"
  | "SiSlack"
  | "SiDropbox"
  | "SiNotion"
  | "SiAtlassian"
  | "SiTwilio"
  | "SiDatadog"
  | "SiSnowflake"
  | "SiPaypal"
  | "SiSquare"
  | "SiCoinbase"
  | "SiGithub"
  | "SiGitlab"
  | "SiDatabricks"
  | "SiOptiver"
  | "SiQualcomm"
  | "SiNetguru"
  | "SiHexagon"
  | "SiDassaultsystemes";

export interface PracticeQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  companyName: string;
  companyLogo: CompanyLogo;
  companySize?: CompanySize[];
  primaryTechStack: TechStack[];
  languages?: ProgrammingLanguage[];
  frontendFrameworks?: FrontendFramework[];
  backendFrameworks?: BackendFramework[];
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
  protocol?: Protocol[];
  webServers?: WebServer[];
  searchEngines?: SearchEngine[];
  vectorDBs?: VectorDatabase[];
  iac?: IaC[];
  title: string;
  question: string;
  answer: string;
  topicTags: string[];
  relatedQuestions?: string[];
  learningResources?: {
    title: string;
    url: string;
    type: "article" | "documentation" | "course" | "book";
  }[];
  lastUpdatedAt?: Timestamp;
}

const COLLECTION_NAME = "practice-questions";

/**
 * Get all practice questions
 */
export async function getAllPracticeQuestions(): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  // Removed filters for non-existent fields (isActive, createdAt)
  const q = query(questionsRef);

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
  // Removed isActive filter and orderBy difficulty (sorting client-side instead)
  const q = query(questionsRef, where("category", "==", category));

  const snapshot = await getDocs(q);
  const questions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeQuestion[];

  // Sort by difficulty client-side
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  return questions.sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
  );
}

/**
 * Get practice questions by difficulty
 */
export async function getPracticeQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): Promise<PracticeQuestion[]> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  // Removed isActive and popularityScore filters
  const q = query(
    questionsRef,
    where("difficulty", "==", difficulty),
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
  question: Omit<PracticeQuestion, "id" | "lastUpdatedAt">,
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const questionsRef = collection(db, COLLECTION_NAME);
  // Only add lastUpdatedAt, removed createdAt and version
  const docRef = await addDoc(questionsRef, {
    ...question,
    lastUpdatedAt: serverTimestamp(),
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
 * Delete a practice question (permanent delete)
 */
export async function deletePracticeQuestion(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
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
      (q.title || "").toLowerCase().includes(lowerSearchTerm) ||
      q.question.toLowerCase().includes(lowerSearchTerm) ||
      q.category.toLowerCase().includes(lowerSearchTerm) ||
      (q.companyLogo || "").toLowerCase().includes(lowerSearchTerm) ||
      q.topicTags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm)),
  );
}
