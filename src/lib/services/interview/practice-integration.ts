/**
 * Practice Library Integration for AI Interview System
 * Connects practice questions with interview functionality
 */

import type {
  InterviewConfig,
  QuestionType as InterviewQuestionType,
  InterviewType,
  SeniorityLevel,
} from "@/types/interview";
import type {
  DifficultyLevel,
  QuestionType as PracticeQuestionType,
  Question,
  QuestionFilters,
} from "@/types/practice-question";
import { evaluateAnswer } from "../evaluation/evaluation-service";
import {
  getQuestionById,
  queryQuestions,
} from "../questions/neon-question-repository";

// ============================================================================
// Type Mappings
// ============================================================================

/**
 * Map interview seniority to practice difficulty
 */
export function mapSeniorityToDifficulty(
  seniority: SeniorityLevel,
): DifficultyLevel {
  const mapping: Record<SeniorityLevel, DifficultyLevel> = {
    entry: "entry",
    junior: "junior",
    mid: "mid",
    senior: "senior",
  };
  return mapping[seniority];
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

function matchQuestionToSeniority(
  question: Question,
  seniority: SeniorityLevel,
) {
  const accepted = getAcceptedSeniorityLevels(seniority);
  const declared = question.seniorityLevels;

  if (declared && declared.length > 0) {
    return declared.some((level) => accepted.includes(level));
  }

  return accepted.includes(question.difficulty);
}

/**
 * Map interview type to practice question filters
 */
export function getTopicForInterviewType(
  interviewType: InterviewType,
): string[] {
  switch (interviewType) {
    case "technical":
      return [
        "Frontend Development",
        "Backend Development",
        "Algorithms & Data Structures",
      ];
    case "coding":
      return ["Algorithms & Data Structures"];
    case "system-design":
      return ["System Design", "Backend Development"];
    case "bullet":
      return [
        "Frontend Development",
        "Backend Development",
        "General Programming",
      ];
    case "situational":
      return [
        "Backend Development",
        "Frontend Development",
        "System Design",
        "General Programming",
      ];
    case "mixed":
      return [
        "Frontend Development",
        "Backend Development",
        "Algorithms & Data Structures",
        "System Design",
        "General Programming",
      ];
  }

  const _never: never = interviewType;
  throw new Error(
    `Unhandled interview type in getTopicForInterviewType: ${_never}`,
  );
}

// ============================================================================
// Question Selection for Interviews
// ============================================================================

export interface InterviewQuestionSelectionOptions {
  config: InterviewConfig;
  count: number;
  excludeIds?: string[];
  preferCompany?: string;
}

/**
 * Select questions for an interview session based on config
 */
export async function selectQuestionsForInterview(
  options: InterviewQuestionSelectionOptions,
): Promise<Question[]> {
  const { config, count, excludeIds = [], preferCompany } = options;
  const topics = getTopicForInterviewType(config.interviewType);

  // Build query filters
  const filters: QuestionFilters = {
    status: "published",
    position: config.position,
    tags:
      config.technologies.length === 1 ? [config.technologies[0]] : undefined,
  };

  // Query questions
  const { questions } = await queryQuestions({
    filters,
    limit: count * 25,
  });

  // Filter and prioritize
  let filtered = questions
    .filter((q) => !excludeIds.includes(q.id))
    .filter((q) => matchQuestionToSeniority(q, config.seniority));

  // Prioritize by company if specified
  if (preferCompany) {
    filtered.sort((a, b) => {
      const aHasCompany = a.companies?.some((c) => c.name === preferCompany)
        ? 1
        : 0;
      const bHasCompany = b.companies?.some((c) => c.name === preferCompany)
        ? 1
        : 0;
      return bHasCompany - aHasCompany;
    });
  }

  // Prioritize by topic match
  filtered.sort((a, b) => {
    const aTopicMatch = topics.includes(a.topic) ? 1 : 0;
    const bTopicMatch = topics.includes(b.topic) ? 1 : 0;
    return bTopicMatch - aTopicMatch;
  });

  // Filter by tech stack if specified
  if (config.technologies && config.technologies.length > 0) {
    const techSet = new Set(config.technologies.map((t) => t.toLowerCase()));
    filtered = filtered.filter((q) =>
      q.primaryTechStack?.some((tech) => techSet.has(tech.toLowerCase())),
    );
  }

  // Return requested count
  return filtered.slice(0, count);
}

// ============================================================================
// Answer Evaluation Integration
// ============================================================================

export interface InterviewAnswerEvaluation {
  score: number; // 0-1
  passed: boolean;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailedFeedback?: string;
}

/**
 * Evaluate an interview answer using the practice library evaluation system
 */
export async function evaluateInterviewAnswer(
  questionId: string,
  userAnswer: string,
  config: InterviewConfig,
): Promise<InterviewAnswerEvaluation> {
  // Get the question
  const question = await getQuestionById(questionId);

  if (!question) {
    throw new Error(`Question ${questionId} not found`);
  }

  // Build user answer object based on question type
  const answer: any = {
    questionId,
    userId: "interview-user", // Will be replaced with actual user ID
    sessionId: "interview-session",
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    timeSpentSeconds: 0,
  };

  // Add type-specific answer data
  if (question.type === "open") {
    answer.questionType = "open";
    answer.text = userAnswer;
  } else if (question.type === "code") {
    answer.questionType = "code";
    answer.code = userAnswer;
    answer.language = (question as any).language || "javascript";
  } else if (question.type === "mcq") {
    // Parse MCQ answer (assuming format like "a,b,c")
    answer.questionType = "mcq";
    answer.selectedOptionIds = userAnswer.split(",").map((s) => s.trim());
  }

  // Evaluate using practice library system
  const evaluation = await evaluateAnswer(question, answer, {
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Map to interview evaluation format
  const difficulty = mapSeniorityToDifficulty(config.seniority);
  const passingThreshold = getPassingThreshold(difficulty);

  return {
    score: evaluation.score,
    passed: evaluation.score >= passingThreshold,
    reasoning: evaluation.reasoning,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    suggestions: evaluation.suggestions,
    detailedFeedback: evaluation.breakdown
      ? JSON.stringify(evaluation.breakdown)
      : undefined,
  };
}

/**
 * Get passing threshold based on difficulty
 */
function getPassingThreshold(difficulty: DifficultyLevel): number {
  const thresholds: Record<DifficultyLevel, number> = {
    entry: 0.6,
    junior: 0.65,
    mid: 0.7,
    senior: 0.75,
  };
  return thresholds[difficulty];
}

// ============================================================================
// Batch Evaluation for Interview Sessions
// ============================================================================

export interface InterviewSessionEvaluation {
  overallScore: number;
  passed: boolean;
  questionEvaluations: Array<{
    questionId: string;
    questionTitle: string;
    score: number;
    passed: boolean;
    reasoning: string;
  }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

/**
 * Evaluate an entire interview session
 */
export async function evaluateInterviewSession(
  questionAnswerPairs: Array<{ questionId: string; userAnswer: string }>,
  config: InterviewConfig,
): Promise<InterviewSessionEvaluation> {
  const evaluations = [];

  // Evaluate each answer
  for (const pair of questionAnswerPairs) {
    try {
      const evaluation = await evaluateInterviewAnswer(
        pair.questionId,
        pair.userAnswer,
        config,
      );

      const question = await getQuestionById(pair.questionId);

      evaluations.push({
        questionId: pair.questionId,
        questionTitle: question?.title || "Unknown Question",
        score: evaluation.score,
        passed: evaluation.passed,
        reasoning: evaluation.reasoning,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
      });
    } catch (error) {
      console.error(`Error evaluating question ${pair.questionId}:`, error);
    }
  }

  // Calculate overall score
  const overallScore =
    evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
  const difficulty = mapSeniorityToDifficulty(config.seniority);
  const passed = overallScore >= getPassingThreshold(difficulty);

  // Aggregate strengths and improvements
  const allStrengths = evaluations.flatMap((e) => e.strengths);
  const allWeaknesses = evaluations.flatMap((e) => e.weaknesses);
  const allSuggestions = evaluations.flatMap((e) => e.suggestions);

  // Deduplicate and prioritize
  const strengths = [...new Set(allStrengths)].slice(0, 5);
  const improvements = [...new Set(allWeaknesses)].slice(0, 5);
  const recommendations = [...new Set(allSuggestions)].slice(0, 5);

  return {
    overallScore,
    passed,
    questionEvaluations: evaluations,
    strengths,
    improvements,
    recommendations,
  };
}

// ============================================================================
// Question Formatting for Interview Display
// ============================================================================

/**
 * Format a practice question for interview display
 */
export function formatQuestionForInterview(question: Question): {
  id: string;
  title: string;
  prompt: string;
  type: InterviewQuestionType;
  difficulty: string;
  estimatedTime: number;
  companies?: string[];
  techStack?: string[];
} {
  return {
    id: question.id,
    title: question.title,
    prompt: question.prompt,
    type: mapPracticeTypeToInterviewType(question.type),
    difficulty: question.difficulty,
    estimatedTime: question.estimatedTimeMinutes,
    companies: question.companies?.map((c) => c.name),
    techStack: question.primaryTechStack,
  };
}

/**
 * Map practice question type to interview question type
 */
function mapPracticeTypeToInterviewType(
  type: PracticeQuestionType,
): InterviewQuestionType {
  switch (type) {
    case "open":
      return "technical";
    case "code":
      return "coding";
    case "mcq":
      return "quick-assessment";
    case "matching":
      return "conceptual";
    case "truefalse":
      return "quick-assessment";
    case "system-design":
      return "system-design";
  }

  const _never: never = type;
  throw new Error(`Unhandled practice question type: ${_never}`);
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

/**
 * Get question statistics for a user
 */
export async function getUserQuestionStats(_userId: string): Promise<{
  totalAttempts: number;
  averageScore: number;
  byDifficulty: Record<
    DifficultyLevel,
    { attempts: number; averageScore: number }
  >;
  byTopic: Record<string, { attempts: number; averageScore: number }>;
}> {
  // This would query user_answers and evaluation_results collections
  // Placeholder implementation
  return {
    totalAttempts: 0,
    averageScore: 0,
    byDifficulty: {
      entry: { attempts: 0, averageScore: 0 },
      junior: { attempts: 0, averageScore: 0 },
      mid: { attempts: 0, averageScore: 0 },
      senior: { attempts: 0, averageScore: 0 },
    },
    byTopic: {},
  };
}
