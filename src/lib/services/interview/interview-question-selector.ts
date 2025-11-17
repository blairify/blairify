/**
 * Interview Question Selector Service
 * Selects appropriate questions from practice library for interviews
 */

import type {
  InterviewConfig,
  InterviewType,
  SeniorityLevel,
} from "@/components/interview/types";
import type { DifficultyLevel, Question } from "@/types/practice-question";

/**
 * Recently used questions cache to prevent immediate repetition
 * Stores question IDs with timestamp, auto-expires after 30 minutes
 */
const recentlyUsedQuestions = new Map<string, number>();
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Add question to recently used cache
 */
function markQuestionAsUsed(questionId: string): void {
  recentlyUsedQuestions.set(questionId, Date.now());

  // Clean up expired entries
  const now = Date.now();
  for (const [id, timestamp] of recentlyUsedQuestions.entries()) {
    if (now - timestamp > CACHE_EXPIRY_MS) {
      recentlyUsedQuestions.delete(id);
    }
  }
}

/**
 * Check if question was recently used
 */
function wasRecentlyUsed(questionId: string): boolean {
  const timestamp = recentlyUsedQuestions.get(questionId);
  if (!timestamp) return false;

  const age = Date.now() - timestamp;
  return age < CACHE_EXPIRY_MS;
}

/**
 * Get questions relevant to the interview configuration
 */
export async function getRelevantQuestionsForInterview(
  config: InterviewConfig,
  count: number = 10,
): Promise<Question[]> {
  try {
    // Fetch questions from API endpoint instead of direct Firestore access
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/practice/questions?limit=1000&status=published`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to load questions");
    }

    const allQuestions = result.questions as Question[];

    // Filter questions based on interview config
    const relevantQuestions = allQuestions.filter((q: Question) => {
      // Skip recently used questions to prevent immediate repetition
      if (wasRecentlyUsed(q.id || "")) {
        return false;
      }

      // Match difficulty to seniority
      const difficultyMatch = matchDifficultyToSeniority(
        q.difficulty,
        config.seniority,
      );

      // Match topic to interview type
      const categoryMatch = matchCategoryToInterviewType(
        q.topic,
        config.interviewType,
      );

      // Match tech stack if specified
      const techStackMatch =
        config.technologies.length === 0 ||
        matchTechStack(q, config.technologies);

      return difficultyMatch && categoryMatch && techStackMatch;
    });

    // Shuffle with timestamp-based seed for better randomization
    const shuffled = shuffleArrayWithSeed(relevantQuestions, Date.now());
    const selected = shuffled.slice(0, count);

    // Mark selected questions as recently used
    selected.forEach((q) => {
      if (q.id) {
        markQuestionAsUsed(q.id);
      }
    });

    // Log shuffling info for debugging
    console.log(`🔀 Question Selection Summary:`, {
      totalAvailable: relevantQuestions.length,
      requested: count,
      selected: selected.length,
      selectedTitles: selected.map((q) => q.title).slice(0, 3), // Show first 3 titles
      recentlyUsedCount: recentlyUsedQuestions.size,
      config: {
        seniority: config.seniority,
        interviewType: config.interviewType,
        technologies: config.technologies,
      },
    });

    return selected;
  } catch (error) {
    console.error("Failed to fetch questions for interview:", error);
    return [];
  }
}

/**
 * Get a single random question for the interview
 */
export async function getRandomQuestionForInterview(
  config: InterviewConfig,
  usedQuestionIds: string[] = [],
): Promise<Question | null> {
  try {
    // Fetch questions from API endpoint instead of direct Firestore access
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/practice/questions?limit=1000&status=published`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to load questions");
    }

    const allQuestions = result.questions as Question[];

    // Filter out already used questions
    const availableQuestions = allQuestions.filter(
      (q: Question) => !usedQuestionIds.includes(q.id || ""),
    );

    // Filter by relevance
    const relevantQuestions = availableQuestions.filter((q: Question) => {
      const difficultyMatch = matchDifficultyToSeniority(
        q.difficulty,
        config.seniority,
      );
      const categoryMatch = matchCategoryToInterviewType(
        q.topic,
        config.interviewType,
      );
      const techStackMatch =
        config.technologies.length === 0 ||
        matchTechStack(q, config.technologies);

      return difficultyMatch && categoryMatch && techStackMatch;
    });

    if (relevantQuestions.length === 0) {
      return null;
    }

    // Return random question
    const randomIndex = Math.floor(Math.random() * relevantQuestions.length);
    return relevantQuestions[randomIndex];
  } catch (error) {
    console.error("Failed to get random question:", error);
    return null;
  }
}

/**
 * Match question difficulty to candidate seniority
 */
function matchDifficultyToSeniority(
  difficulty: DifficultyLevel,
  seniority: SeniorityLevel,
): boolean {
  const difficultyMap: Record<SeniorityLevel, DifficultyLevel[]> = {
    entry: ["entry"],
    junior: ["entry", "junior"],
    mid: ["junior", "middle"],
    senior: ["middle", "senior"],
  };

  return difficultyMap[seniority]?.includes(difficulty) || false;
}

/**
 * Match question category to interview type
 */
function matchCategoryToInterviewType(
  category: string,
  interviewType: InterviewType,
): boolean {
  const categoryMap: Record<InterviewType, string[]> = {
    technical: [
      "algorithms",
      "data-structures",
      "frontend",
      "backend",
      "database",
      "performance",
      "testing",
      "debugging",
      "api-design",
      "architecture",
      "cloud",
      "devops",
    ],
    "system-design": [
      "system-design",
      "scalability",
      "architecture",
      "cloud",
      "devops",
      "performance",
      "database",
      "api-design",
    ],
    coding: [
      "algorithms",
      "data-structures",
      "frontend",
      "backend",
      "testing",
      "debugging",
      "performance",
    ],
    bullet: [
      "behavioral",
      "leadership",
      "communication",
      "problem-solving",
      "code-review",
      "debugging",
    ],
  };

  return categoryMap[interviewType].includes(category);
}

/**
 * Match question tech stack to interview requirements
 */
function matchTechStack(question: Question, technologies: string[]): boolean {
  const questionTech = [...(question.primaryTechStack || [])].map((t) =>
    t.toLowerCase(),
  );

  const requiredTech = technologies.map((t) => t.toLowerCase());

  // Check if any required tech is in question's tech stack
  return requiredTech.some((tech) =>
    questionTech.some((qTech) => qTech.includes(tech) || tech.includes(qTech)),
  );
}

/**
 * Shuffle array with timestamp-based seeding for better randomization
 * Uses a simple seeded random number generator
 */
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];

  // Simple seeded random number generator (LCG algorithm)
  let currentSeed = seed;
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Format question for AI prompt - enhanced for comprehensive yet concise format
 */
export function formatQuestionForPrompt(question: Question): string {
  // Format tech stack
  const techStack = [...(question.primaryTechStack || [])].join(", ");

  // Format company info
  const company = question.companies?.[0]?.name || "General";

  // Enhanced format: more comprehensive but AI-readable, without exposing reference answers
  return `**${question.title}** (${question.difficulty})\nTopic: ${
    question.topic
  }\nTech: ${techStack || "General"}\nCompany: ${
    company
  }\nQuestion: ${question.prompt}\nTags: ${question.tags.join(", ")}`;
}
