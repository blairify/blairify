/**
 * Interview Question Selector Service
 * Selects appropriate questions from practice library for interviews
 */

import type {
  InterviewConfig,
  InterviewType,
  SeniorityLevel,
} from "@/components/interview/types";
import { getAppUrl } from "@/lib/utils";
import { shuffleWithSeed } from "@/lib/utils/seeded-random";

import type { DifficultyLevel, Question } from "@/types/practice-question";

/**
 * Recently used questions cache to prevent immediate repetition
 * Stores question IDs with timestamp, auto-expires after 30 minutes
 */
const recentlyUsedQuestions = new Map<string, number>();
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

function getQuestionsBaseUrl(explicitBaseUrl?: string) {
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  return getAppUrl();
}

function canonicalizeTech(value: string): string {
  const trimmed = value.trim().toLowerCase();
  switch (trimmed) {
    case "golang":
      return "go";
    case "c#":
    case "csharp":
      return "csharp";
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    default:
      return trimmed;
  }
}

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
  baseUrl?: string,
): Promise<Question[]> {
  try {
    // Fetch questions from API endpoint instead of direct Firestore access
    const resolvedBaseUrl = getQuestionsBaseUrl(baseUrl);

    const params = new URLSearchParams({
      limit: "1000",
      status: "published",
    });

    // Use position as canonical role topic for filtering
    if (config.position) {
      params.set("position", config.position);
    }

    if (config.technologies.length === 1) {
      params.set("tag", canonicalizeTech(config.technologies[0]));
    }

    const response = await fetch(
      `${resolvedBaseUrl}/api/practice/questions?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to load questions");
    }

    const allQuestions = result.questions as Question[];

    const isSituationalTopic = (topic: string): boolean => {
      const situationalTopics = new Set([
        "debugging",
        "performance",
        "testing",
        "incident-response",
        "reliability",
        "architecture",
        "system-design",
        "api-design",
        "database",
        "cloud",
      ]);

      return situationalTopics.has(topic);
    };

    const relevantQuestions = allQuestions.filter((q: Question) => {
      // Skip recently used questions to prevent immediate repetition
      if (wasRecentlyUsed(q.id || "")) {
        return false;
      }

      // Skip situational questions in flash mode
      if (config.interviewMode === "flash" && isSituationalTopic(q.topic)) {
        return false;
      }

      const difficultyMatch = matchQuestionToSeniority(q, config.seniority);

      // Match topic to interview type
      const categoryMatch = config.position
        ? matchCategoryToInterviewTypeForRoleSelection(config.interviewType)
        : matchCategoryToInterviewType(q.topic, config.interviewType);

      // Match tech stack if specified
      const techStackMatch =
        config.technologies.length === 0 ||
        matchTechStack(q, config.technologies);

      const roleMatch = (() => {
        if (!config.position) return true;
        const declared = q.positions ?? [];
        if (declared.length === 0) return true;
        return declared.includes(config.position);
      })();

      return difficultyMatch && categoryMatch && techStackMatch && roleMatch;
    });

    if (relevantQuestions.length === 0) {
      const stats = allQuestions.reduce(
        (acc, q) => {
          const recentlyUsed = wasRecentlyUsed(q.id || "");
          const difficultyMatch = matchQuestionToSeniority(q, config.seniority);
          const categoryMatch = config.position
            ? matchCategoryToInterviewTypeForRoleSelection(config.interviewType)
            : matchCategoryToInterviewType(q.topic, config.interviewType);
          const techStackMatch =
            config.technologies.length === 0 ||
            matchTechStack(q, config.technologies);
          const roleMatch = !config.position
            ? true
            : (q.positions ?? []).includes(config.position);

          if (recentlyUsed) acc.recentlyUsed += 1;
          if (difficultyMatch) acc.difficultyMatch += 1;
          if (categoryMatch) acc.categoryMatch += 1;
          if (techStackMatch) acc.techStackMatch += 1;
          if (roleMatch) acc.roleMatch += 1;
          if (difficultyMatch && categoryMatch && techStackMatch && roleMatch)
            acc.fullMatch += 1;

          return acc;
        },
        {
          totalFetched: allQuestions.length,
          recentlyUsed: 0,
          difficultyMatch: 0,
          categoryMatch: 0,
          techStackMatch: 0,
          roleMatch: 0,
          fullMatch: 0,
        },
      );

      console.log("🧪 Question filter breakdown:", {
        stats,
        config: {
          position: config.position,
          seniority: config.seniority,
          interviewType: config.interviewType,
          technologies: config.technologies,
        },
      });
    }

    // Shuffle with timestamp-based seed for better randomization
    const shuffled = shuffleWithSeed(relevantQuestions, Date.now());

    const canonicalize = (value: string): string => {
      const trimmed = value.trim().toLowerCase();
      switch (trimmed) {
        case "golang":
          return "go";
        case "c#":
        case "csharp":
          return "csharp";
        case "react-native":
        case "react native":
          return "reactnative";
        case "js":
          return "javascript";
        case "ts":
          return "typescript";
        default:
          return trimmed;
      }
    };

    const matchesTech = (q: Question, tech: string): boolean => {
      const required = canonicalize(tech);
      const stack = (q.primaryTechStack ?? []).map(canonicalize);
      return stack.includes(required);
    };

    const normalizedTechs = config.technologies
      .map(canonicalize)
      .filter(Boolean);

    const allowSituationalCap = config.interviewType === "mixed";
    const maxSituational = allowSituationalCap
      ? Math.round(count * 0.1)
      : count;

    // Disable situational questions in flash mode
    const isFlashMode = config.interviewMode === "flash";
    const effectiveMaxSituational = isFlashMode ? 0 : maxSituational;

    const selected: Question[] = [];
    const remaining = [...shuffled];

    if (normalizedTechs.length > 0 && count >= normalizedTechs.length) {
      for (const tech of normalizedTechs) {
        const index = remaining.findIndex((q) => matchesTech(q, tech));
        if (index === -1) continue;
        const [picked] = remaining.splice(index, 1);
        selected.push(picked);
        if (selected.length >= count) break;
      }
    }

    let situationalPicked = selected.filter((q) =>
      isSituationalTopic(q.topic),
    ).length;
    const overflowSituational: Question[] = [];

    for (const q of remaining) {
      if (selected.length >= count) break;

      const isSituational = allowSituationalCap && isSituationalTopic(q.topic);
      if (isSituational && situationalPicked >= effectiveMaxSituational) {
        overflowSituational.push(q);
        continue;
      }

      selected.push(q);
      if (isSituational) situationalPicked += 1;
    }

    if (selected.length < count) {
      for (const q of overflowSituational) {
        if (selected.length >= count) break;
        selected.push(q);
      }
    }

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
  baseUrl?: string,
): Promise<Question | null> {
  try {
    // Fetch questions from API endpoint instead of direct Firestore access
    const resolvedBaseUrl = getQuestionsBaseUrl(baseUrl);

    const params = new URLSearchParams({
      limit: "1000",
      status: "published",
    });

    if (config.position) {
      params.set("position", config.position);
    }

    if (config.technologies.length === 1) {
      params.set("tag", canonicalizeTech(config.technologies[0]));
    }

    const response = await fetch(
      `${resolvedBaseUrl}/api/practice/questions?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to load questions");
    }

    const allQuestions = result.questions as Question[];

    // Define situational topics for flash mode filtering
    const isSituationalTopic = (topic: string): boolean => {
      const situationalTopics = new Set([
        "debugging",
        "performance",
        "testing",
        "incident-response",
        "reliability",
        "architecture",
        "system-design",
        "api-design",
        "database",
        "cloud",
      ]);

      return situationalTopics.has(topic);
    };

    // Filter out already used questions
    const availableQuestions = allQuestions.filter(
      (q: Question) => !usedQuestionIds.includes(q.id || ""),
    );

    // Filter by relevance
    const relevantQuestions = availableQuestions.filter((q: Question) => {
      // Skip situational questions in flash mode
      if (config.interviewMode === "flash" && isSituationalTopic(q.topic)) {
        return false;
      }

      const difficultyMatch = matchQuestionToSeniority(q, config.seniority);
      const categoryMatch = config.position
        ? matchCategoryToInterviewTypeForRoleSelection(config.interviewType)
        : matchCategoryToInterviewType(q.topic, config.interviewType);
      const techStackMatch =
        config.technologies.length === 0 ||
        matchTechStack(q, config.technologies);

      const roleMatch = !config.position
        ? true
        : (q.positions ?? []).includes(config.position);

      return difficultyMatch && categoryMatch && techStackMatch && roleMatch;
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
    entry: ["entry", "junior"],
    junior: ["junior", "mid"],
    mid: ["mid", "senior"],
    senior: ["senior", "mid"],
  };

  return difficultyMap[seniority]?.includes(difficulty) || false;
}

function getAcceptedSeniorityLevels(
  seniority: SeniorityLevel,
): Array<"entry" | "junior" | "mid" | "senior"> {
  switch (seniority) {
    case "entry":
      return ["entry", "junior"];
    case "junior":
      return ["junior", "mid"];
    case "mid":
      return ["mid", "senior"];
    case "senior":
      return ["senior", "mid"];
    default: {
      const _never: never = seniority;
      throw new Error(`Unhandled seniority: ${_never}`);
    }
  }
}

function matchQuestionToSeniority(q: Question, seniority: SeniorityLevel) {
  const accepted = getAcceptedSeniorityLevels(seniority);
  const declared = q.seniorityLevels;
  if (declared && declared.length > 0) {
    return declared.some((level) => accepted.includes(level));
  }

  return matchDifficultyToSeniority(q.difficulty, seniority);
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
      // Role topics
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "mobile",
      "data-engineer",
      "data-scientist",
      "cybersecurity",
      // Functional topics
      "algorithms",
      "data-structures",
      "database",
      "performance",
      "testing",
      "debugging",
      "api-design",
      "architecture",
      "cloud",
    ],
    "system-design": [
      "system-design",
      "backend",
      "fullstack",
      "devops",
      "scalability",
      "architecture",
      "cloud",
      "performance",
      "database",
      "api-design",
    ],
    coding: [
      // Role topics
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "mobile",
      "data-engineer",
      "data-scientist",
      "cybersecurity",
      // Functional topics
      "algorithms",
      "data-structures",
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
      "product",
    ],
    situational: [
      "debugging",
      "performance",
      "testing",
      "incident-response",
      "reliability",
      "architecture",
      "system-design",
      "api-design",
      "database",
      "cloud",
    ],
    mixed: [
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "mobile",
      "data-engineer",
      "data-scientist",
      "cybersecurity",
      "algorithms",
      "data-structures",
      "database",
      "performance",
      "testing",
      "debugging",
      "api-design",
      "architecture",
      "cloud",
      "system-design",
      "scalability",
      "incident-response",
      "reliability",
      "product",
      "communication",
      "problem-solving",
    ],
  };

  return categoryMap[interviewType].includes(category);
}

function matchCategoryToInterviewTypeForRoleSelection(
  interviewType: InterviewType,
): boolean {
  switch (interviewType) {
    case "technical":
    case "coding":
    case "system-design":
    case "situational":
    case "mixed":
      return true;
    case "bullet":
      return false;
    default: {
      const _never: never = interviewType;
      throw new Error(`Unhandled interviewType: ${_never}`);
    }
  }
}

/**
 * Match question tech stack to interview requirements
 */
function matchTechStack(question: Question, technologies: string[]): boolean {
  const canonicalize = (value: string): string => {
    const trimmed = value.trim().toLowerCase();
    switch (trimmed) {
      case "golang":
        return "go";
      case "c#":
      case "csharp":
        return "csharp";
      case "react-native":
      case "react native":
        return "reactnative";
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      default:
        return trimmed;
    }
  };

  const questionTech = new Set(
    (question.primaryTechStack ?? [])
      .filter(Boolean)
      .map((t) => canonicalize(String(t))),
  );

  const requiredTech = technologies
    .filter(Boolean)
    .map((t) => canonicalize(String(t)));

  return requiredTech.some((tech) => questionTech.has(tech));
}

/**
 * Format question for AI prompt - enhanced for comprehensive yet concise format
 */
export function formatQuestionForPrompt(question: Question): string {
  // Format tech stack
  const techStack = [...(question.primaryTechStack || [])].join(", ");

  // Format company info
  const company = question.companies?.[0]?.name || "General";

  const evaluationHint = question.aiEvaluationHint
    ? `\nEvaluation Hint (for you only, do NOT read aloud): ${question.aiEvaluationHint}`
    : "";

  // Enhanced format: more comprehensive but AI-readable, without exposing reference answers
  return `**${question.title}** (${question.difficulty})\nTopic: ${question.topic}\nTech: ${techStack || "General"}\nCompany: ${company}\nQuestion: ${question.prompt}\nTags: ${question.tags.join(", ")}${evaluationHint}`;
}
