/**
 * Core Practice Question Types
 * Supports multiple question formats with semantic LLM-based evaluation
 */

// ============================================================================
// Question Types
// ============================================================================

export type QuestionType =
  | "mcq"
  | "open"
  | "matching"
  | "code"
  | "truefalse"
  | "system-design";
export type DifficultyLevel = "entry" | "junior" | "mid" | "senior";
export type QuestionStatus = "draft" | "published" | "archived";
export type CompanyType = "faang" | "startup" | "enterprise";
export type QuestionInterviewMode =
  | "regular"
  | "practice"
  | "flash"
  | "play"
  | "competitive"
  | "teacher";

// ============================================================================
// Base Question Interface
// ============================================================================

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  status: QuestionStatus;
  isDemoMode: boolean;
  companyType: CompanyType;

  // Content
  title: string;
  description: string;
  prompt: string;

  // Metadata
  topic: string;
  subtopics: string[];
  tags: string[];
  estimatedTimeMinutes: number;
  aiEvaluationHint?: string;

  // Company/Position Context (supports multiple companies)
  companies?: Array<{
    name: string;
    logo: string; // Icon name (e.g., "SiGoogle", "SiMeta")
    size?: string[]; // e.g., ["faang"], ["startup"], ["enterprise"]
    description: string;
  }>;
  positions?: string[]; // e.g., ["Frontend Engineer", "Full Stack Developer"]
  primaryTechStack?: string[]; // e.g., ["react", "typescript", "nodejs"]

  // Interview Integration
  interviewTypes?: QuestionInterviewMode[];
  seniorityLevels?: Array<"entry" | "junior" | "mid" | "senior">;

  // Timestamps
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdBy: string; // User ID
}

// ============================================================================
// Multiple Choice Question (MCQ)
// ============================================================================

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string; // Why this is correct/incorrect
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: MCQOption[];
  multiChoiceAnswers?: string[];
  allowMultipleAnswers: boolean;
  shuffleOptions: boolean;
}

// ============================================================================
// Open-Ended Question
// ============================================================================

export interface ReferenceAnswer {
  id: string;
  text: string;
  weight: number; // 0-1, how important this aspect is
  keyPoints: string[]; // Key concepts that should be mentioned
}

export interface OpenQuestion extends BaseQuestion {
  type: "open";
  referenceAnswers: ReferenceAnswer[];
  minWords?: number;
  maxWords?: number;
  evaluationCriteria: {
    completeness: number; // 0-1 weight
    accuracy: number; // 0-1 weight
    clarity: number; // 0-1 weight
    depth: number; // 0-1 weight
  };
}

// ============================================================================
// Matching Question
// ============================================================================

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  explanation?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  pairs: MatchingPair[];
  shuffleLeft: boolean;
  shuffleRight: boolean;
}

// ============================================================================
// Code Question
// ============================================================================

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean; // Hidden test cases not shown to user
  weight: number; // 0-1
}

export interface CodeQuestion extends BaseQuestion {
  type: "code";
  language: string; // "javascript" | "typescript" | "python" | etc.
  starterCode?: string;
  testCases: TestCase[];
  evaluationCriteria: {
    correctness: number; // 0-1 weight
    efficiency: number; // 0-1 weight
    codeQuality: number; // 0-1 weight
    edgeCases: number; // 0-1 weight
  };
}

// ============================================================================
// True/False Question
// ============================================================================

export interface TrueFalseQuestion extends BaseQuestion {
  type: "truefalse";
  correctAnswer: boolean;
  explanation: string;
}

// ============================================================================
// Union Type for All Questions
// ============================================================================

export type Question =
  | MCQQuestion
  | OpenQuestion
  | MatchingQuestion
  | CodeQuestion
  | TrueFalseQuestion;

// ============================================================================
// User Answer Types
// ============================================================================

export interface BaseUserAnswer {
  questionId: string;
  questionType: QuestionType;
  userId: string;
  sessionId: string;
  attemptNumber: number;
  submittedAt: string; // ISO string
  timeSpentSeconds: number;
}

export interface MCQUserAnswer extends BaseUserAnswer {
  questionType: "mcq";
  selectedOptionIds: string[];
}

export interface OpenUserAnswer extends BaseUserAnswer {
  questionType: "open";
  answerText: string;
  wordCount: number;
}

export interface MatchingUserAnswer extends BaseUserAnswer {
  questionType: "matching";
  matches: Array<{
    leftId: string;
    rightId: string;
  }>;
}

export interface CodeUserAnswer extends BaseUserAnswer {
  questionType: "code";
  code: string;
  language: string;
}

export interface TrueFalseUserAnswer extends BaseUserAnswer {
  questionType: "truefalse";
  answer: boolean;
}

export type UserAnswer =
  | MCQUserAnswer
  | OpenUserAnswer
  | MatchingUserAnswer
  | CodeUserAnswer
  | TrueFalseUserAnswer;

// ============================================================================
// Evaluation Result Types
// ============================================================================

export interface EvaluationResult {
  id: string;
  questionId: string;
  userId: string;
  sessionId: string;
  attemptNumber: number;

  // Score
  score: number; // 0-1
  maxScore: number; // Usually 1
  percentage: number; // 0-100

  // LLM Evaluation
  reasoning: string; // LLM's explanation
  strengths: string[]; // What user did well
  weaknesses: string[]; // What user missed or got wrong
  suggestions: string[]; // How to improve

  // Detailed Breakdown (type-specific)
  breakdown: EvaluationBreakdown;

  // Metadata
  evaluatedAt: string; // ISO string
  evaluationModel: string; // e.g., "gpt-4", "claude-3"
  evaluationVersion: string; // Template version used
}

export type EvaluationBreakdown =
  | MCQEvaluationBreakdown
  | OpenEvaluationBreakdown
  | MatchingEvaluationBreakdown
  | CodeEvaluationBreakdown
  | TrueFalseEvaluationBreakdown;

export interface MCQEvaluationBreakdown {
  type: "mcq";
  correctSelections: string[];
  incorrectSelections: string[];
  missedCorrectOptions: string[];
}

export interface OpenEvaluationBreakdown {
  type: "open";
  completeness: number; // 0-1
  accuracy: number; // 0-1
  clarity: number; // 0-1
  depth: number; // 0-1
  coveredKeyPoints: string[];
  missedKeyPoints: string[];
}

export interface MatchingEvaluationBreakdown {
  type: "matching";
  correctMatches: number;
  incorrectMatches: number;
  totalMatches: number;
}

export interface CodeEvaluationBreakdown {
  type: "code";
  correctness: number; // 0-1
  efficiency: number; // 0-1
  codeQuality: number; // 0-1
  edgeCases: number; // 0-1
  passedTestCases: number;
  totalTestCases: number;
  executionTime?: number; // milliseconds
}

export interface TrueFalseEvaluationBreakdown {
  type: "truefalse";
  isCorrect: boolean;
}

// ============================================================================
// Practice Session Types
// ============================================================================

export interface PracticeSession {
  id: string;
  userId: string;
  mode: "practice" | "timed" | "interview" | "challenge";

  // Configuration
  topic?: string;
  difficulty?: DifficultyLevel;
  questionTypes?: QuestionType[];
  questionCount: number;
  timeLimit?: number; // minutes, null for untimed

  // Progress
  currentQuestionIndex: number;
  completedQuestions: string[]; // Question IDs
  answers: UserAnswer[];
  evaluations: EvaluationResult[];

  // Status
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string; // ISO string
  completedAt?: string; // ISO string
  totalTimeSpentSeconds: number;

  // Results
  overallScore?: number; // 0-1, calculated after completion
  overallPercentage?: number; // 0-100
}

// ============================================================================
// Query/Filter Types
// ============================================================================

export interface QuestionFilters {
  topic?: string;
  subtopics?: string[];
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  tags?: string[];
  companyName?: string;
  position?: string;
  status?: QuestionStatus;
}

export interface QuestionQueryOptions {
  filters: QuestionFilters;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "difficulty" | "random";
  orderDirection?: "asc" | "desc";
}
