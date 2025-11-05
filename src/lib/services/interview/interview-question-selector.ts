/**
 * Interview Question Selector Service
 * Selects appropriate questions from practice library for interviews
 */

import type {
  InterviewConfig,
  InterviewType,
  SeniorityLevel,
} from "@/components/interview/types";
import {
  getAllPracticeQuestions,
  type PracticeQuestion,
} from "../practice-questions/practice-questions-service";

/**
 * Get questions relevant to the interview configuration
 */
export async function getRelevantQuestionsForInterview(
  config: InterviewConfig,
  count: number = 10,
): Promise<PracticeQuestion[]> {
  try {
    const allQuestions = await getAllPracticeQuestions();

    // Filter questions based on interview config
    const relevantQuestions = allQuestions.filter((q) => {
      // Match difficulty to seniority
      const difficultyMatch = matchDifficultyToSeniority(
        q.difficulty,
        config.seniority,
      );

      // Match category to interview type
      const categoryMatch = matchCategoryToInterviewType(
        q.category,
        config.interviewType,
      );

      // Match tech stack if specified
      const techStackMatch =
        config.technologies.length === 0 ||
        matchTechStack(q, config.technologies);

      return difficultyMatch && categoryMatch && techStackMatch;
    });

    // Shuffle and return requested count
    return shuffleArray(relevantQuestions).slice(0, count);
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
): Promise<PracticeQuestion | null> {
  try {
    const allQuestions = await getAllPracticeQuestions();

    // Filter out already used questions
    const availableQuestions = allQuestions.filter(
      (q) => !usedQuestionIds.includes(q.id || ""),
    );

    // Filter by relevance
    const relevantQuestions = availableQuestions.filter((q) => {
      const difficultyMatch = matchDifficultyToSeniority(
        q.difficulty,
        config.seniority,
      );
      const categoryMatch = matchCategoryToInterviewType(
        q.category,
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
  difficulty: "easy" | "medium" | "hard",
  seniority: SeniorityLevel,
): boolean {
  const difficultyMap: Record<SeniorityLevel, ("easy" | "medium" | "hard")[]> =
    {
      entry: ["easy"],
      junior: ["easy", "medium"],
      mid: ["medium"],
      senior: ["medium", "hard"],
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

  return categoryMap[interviewType]?.includes(category) || true;
}

/**
 * Match question tech stack to interview requirements
 */
function matchTechStack(
  question: PracticeQuestion,
  technologies: string[],
): boolean {
  const questionTech = [
    ...(question.primaryTechStack || []),
    ...(question.languages || []),
    ...(question.frontendFrameworks || []),
    ...(question.backendFrameworks || []),
  ].map((t) => t.toLowerCase());

  const requiredTech = technologies.map((t) => t.toLowerCase());

  // Check if any required tech is in question's tech stack
  return requiredTech.some((tech) =>
    questionTech.some((qTech) => qTech.includes(tech) || tech.includes(qTech)),
  );
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format question for AI prompt - enhanced for comprehensive yet concise format
 */
export function formatQuestionForPrompt(question: PracticeQuestion): string {
  // Format tech stack
  const techStack = [
    ...(question.primaryTechStack || []),
    ...(question.languages || []),
    ...(question.frontendFrameworks || []),
    ...(question.backendFrameworks || []),
  ].join(", ");

  // Format company info
  const company =
    question.companyLogo?.replace("Si", "") ||
    question.companyLogo ||
    "Unknown";

  // Enhanced format: more comprehensive but AI-readable
  return `**${question.title}** (${question.difficulty})
Category: ${question.category}
Tech: ${techStack || "General"}
Company: ${company}
Question: ${question.question}
Expected Answer: ${question.answer.substring(0, 200)}${question.answer.length > 200 ? "..." : ""}
Tags: ${question.topicTags.join(", ")}`;
}
