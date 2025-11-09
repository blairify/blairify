/**
 * Question Repository Service
 * Handles all Firestore operations for practice questions
 */

import {
  collection,
  type DocumentSnapshot,
  doc,
  limit as firestoreLimit,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  DifficultyLevel,
  Question,
  QuestionFilters,
  QuestionQueryOptions,
  QuestionType,
} from "@/types/practice-question";

// ============================================================================
// Collection References
// ============================================================================

const QUESTIONS_COLLECTION = "practice_questions";

// ============================================================================
// Helper to ensure db is initialized
// ============================================================================

function getDb() {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }
  return db;
}

// ============================================================================
// Get Single Question
// ============================================================================

export async function getQuestionById(
  questionId: string,
): Promise<Question | null> {
  try {
    const questionRef = doc(getDb(), QUESTIONS_COLLECTION, questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      return null;
    }

    return transformFirestoreToQuestion(questionSnap);
  } catch (error) {
    console.error("Error fetching question:", error);
    throw new Error(`Failed to fetch question: ${error}`);
  }
}

// ============================================================================
// Query Questions
// ============================================================================

export async function queryQuestions(options: QuestionQueryOptions): Promise<{
  questions: Question[];
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}> {
  try {
    const constraints = buildQueryConstraints(options);
    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      ...constraints,
    );

    const snapshot = await getDocs(questionsQuery);
    const questions = snapshot.docs.map(transformFirestoreToQuestion);

    // Check if there are more results
    const hasMore = snapshot.docs.length === (options.limit || 20);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return { questions, hasMore, lastDoc };
  } catch (error) {
    console.error("Error querying questions:", error);
    throw new Error(`Failed to query questions: ${error}`);
  }
}

// ============================================================================
// Get Next Question (Smart Selection)
// ============================================================================

export async function getNextQuestion(filters: {
  topic?: string;
  difficulty?: DifficultyLevel;
  excludeQuestionIds?: string[];
  userId?: string;
}): Promise<Question | null> {
  try {
    const constraints: QueryConstraint[] = [where("status", "==", "published")];

    if (filters.topic) {
      constraints.push(where("topic", "==", filters.topic));
    }

    if (filters.difficulty) {
      constraints.push(where("difficulty", "==", filters.difficulty));
    }

    // Get a pool of questions
    constraints.push(firestoreLimit(20));

    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      ...constraints,
    );

    const snapshot = await getDocs(questionsQuery);
    let candidates = snapshot.docs.map(transformFirestoreToQuestion);

    // Filter out excluded questions
    if (filters.excludeQuestionIds && filters.excludeQuestionIds.length > 0) {
      candidates = candidates.filter(
        (q) => !filters.excludeQuestionIds?.includes(q.id),
      );
    }

    if (candidates.length === 0) {
      return null;
    }

    // TODO: Implement smart selection based on user history
    // For now, return random from candidates
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  } catch (error) {
    console.error("Error getting next question:", error);
    throw new Error(`Failed to get next question: ${error}`);
  }
}

// ============================================================================
// Get Questions for Session
// ============================================================================

export async function getQuestionsForSession(config: {
  topic?: string;
  difficulty?: DifficultyLevel;
  questionTypes?: QuestionType[];
  count: number;
}): Promise<Question[]> {
  try {
    const constraints: QueryConstraint[] = [where("status", "==", "published")];

    if (config.topic) {
      constraints.push(where("topic", "==", config.topic));
    }

    if (config.difficulty) {
      constraints.push(where("difficulty", "==", config.difficulty));
    }

    // Get more than needed to allow filtering
    constraints.push(firestoreLimit(config.count * 2));

    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      ...constraints,
    );

    const snapshot = await getDocs(questionsQuery);
    let questions = snapshot.docs.map(transformFirestoreToQuestion);

    // Filter by question types if specified
    if (config.questionTypes && config.questionTypes.length > 0) {
      questions = questions.filter((q) =>
        config.questionTypes?.includes(q.type),
      );
    }

    // Shuffle and take requested count
    questions = shuffleArray(questions).slice(0, config.count);

    return questions;
  } catch (error) {
    console.error("Error getting questions for session:", error);
    throw new Error(`Failed to get questions for session: ${error}`);
  }
}

// ============================================================================
// Search Questions
// ============================================================================

export async function searchQuestions(
  searchTerm: string,
  filters?: QuestionFilters,
): Promise<Question[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia, Elasticsearch, or similar

    const constraints: QueryConstraint[] = [where("status", "==", "published")];

    // Add filters
    if (filters?.topic) {
      constraints.push(where("topic", "==", filters.topic));
    }

    if (filters?.difficulty) {
      constraints.push(where("difficulty", "==", filters.difficulty));
    }

    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    }

    constraints.push(firestoreLimit(50));

    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      ...constraints,
    );

    const snapshot = await getDocs(questionsQuery);
    let questions = snapshot.docs.map(transformFirestoreToQuestion);

    // Client-side filtering for search term
    const searchLower = searchTerm.toLowerCase();
    questions = questions.filter(
      (q) =>
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.prompt.toLowerCase().includes(searchLower) ||
        q.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    );

    return questions;
  } catch (error) {
    console.error("Error searching questions:", error);
    throw new Error(`Failed to search questions: ${error}`);
  }
}

// ============================================================================
// Get Questions by Topic
// ============================================================================

export async function getQuestionsByTopic(
  topic: string,
  limit = 20,
): Promise<Question[]> {
  try {
    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      where("status", "==", "published"),
      where("topic", "==", topic),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit),
    );

    const snapshot = await getDocs(questionsQuery);
    return snapshot.docs.map(transformFirestoreToQuestion);
  } catch (error) {
    console.error("Error getting questions by topic:", error);
    throw new Error(`Failed to get questions by topic: ${error}`);
  }
}

// ============================================================================
// Get Questions by Company
// ============================================================================

export async function getQuestionsByCompany(
  companyName: string,
  limit = 20,
): Promise<Question[]> {
  try {
    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      where("status", "==", "published"),
      where("companyName", "==", companyName),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit),
    );

    const snapshot = await getDocs(questionsQuery);
    return snapshot.docs.map(transformFirestoreToQuestion);
  } catch (error) {
    console.error("Error getting questions by company:", error);
    throw new Error(`Failed to get questions by company: ${error}`);
  }
}

// ============================================================================
// Get Available Topics
// ============================================================================

export async function getAvailableTopics(): Promise<
  Array<{ topic: string; count: number }>
> {
  try {
    // Note: This requires aggregation which Firestore doesn't support well
    // Consider caching this in a separate document or using Cloud Functions

    const questionsQuery = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      where("status", "==", "published"),
    );

    const snapshot = await getDocs(questionsQuery);
    const topicCounts = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const topic = doc.data().topic;
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    return Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error getting available topics:", error);
    throw new Error(`Failed to get available topics: ${error}`);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildQueryConstraints(
  options: QuestionQueryOptions,
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  const { filters, limit, orderBy: orderByField, orderDirection } = options;

  // Status filter (always published for users)
  constraints.push(where("status", "==", filters.status || "published"));

  // Apply filters
  if (filters.topic) {
    constraints.push(where("topic", "==", filters.topic));
  }

  if (filters.difficulty) {
    constraints.push(where("difficulty", "==", filters.difficulty));
  }

  if (filters.type) {
    constraints.push(where("type", "==", filters.type));
  }

  if (filters.companyName) {
    constraints.push(where("companyName", "==", filters.companyName));
  }

  if (filters.position) {
    constraints.push(where("position", "==", filters.position));
  }

  // Tags filter (array-contains)
  if (filters.tags && filters.tags.length > 0) {
    constraints.push(where("tags", "array-contains", filters.tags[0]));
  }

  // Ordering
  if (orderByField && orderByField !== "random") {
    constraints.push(orderBy(orderByField, orderDirection || "desc"));
  } else {
    // Default ordering
    constraints.push(orderBy("createdAt", "desc"));
  }

  // Limit
  constraints.push(firestoreLimit(limit || 20));

  return constraints;
}

function transformFirestoreToQuestion(doc: DocumentSnapshot): Question {
  const data = doc.data()!;

  // Transform Firestore Timestamps to ISO strings
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt;

  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt;

  // Reconstruct type-specific question structure
  const baseQuestion = {
    id: doc.id,
    type: data.type,
    difficulty: data.difficulty,
    status: data.status,
    title: data.title,
    description: data.description,
    prompt: data.prompt,
    topic: data.topic,
    subtopics: data.subtopics || [],
    tags: data.tags || [],
    estimatedTimeMinutes: data.estimatedTimeMinutes,
    companyName: data.companyName,
    position: data.position,
    companySize: data.companySize,
    primaryTechStack: data.primaryTechStack,
    createdAt,
    updatedAt,
    createdBy: data.createdBy,
  };

  // Merge type-specific data
  return {
    ...baseQuestion,
    ...data.data, // Type-specific fields from nested 'data' object
  } as Question;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// Cache Layer (Optional)
// ============================================================================

const questionCache = new Map<
  string,
  { question: Question; timestamp: number }
>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCachedQuestion(questionId: string): Question | null {
  const cached = questionCache.get(questionId);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    questionCache.delete(questionId);
    return null;
  }

  return cached.question;
}

export function cacheQuestion(question: Question): void {
  questionCache.set(question.id, {
    question,
    timestamp: Date.now(),
  });
}

export function clearQuestionCache(): void {
  questionCache.clear();
}
