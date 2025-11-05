/**
 * Core interview types and interfaces
 * Shared across the entire interview system
 */

export interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  questionType?: QuestionType;
  isFollowUp?: boolean;
}

export interface InterviewConfig {
  position: string;
  seniority: SeniorityLevel;
  technologies: string[];
  companyProfile: string;
  specificCompany?: string;
  interviewMode: InterviewMode;
  interviewType: InterviewType;
  duration: string;
  isDemoMode: boolean;
  // Job-specific context fields
  contextType?: string;
  jobId?: string;
  company?: string;
  jobDescription?: string;
  jobRequirements?: string;
  jobLocation?: string;
  jobType?: string;
}

export interface InterviewSession {
  messages: Message[];
  currentQuestionCount: number;
  totalQuestions: number;
  startTime: Date;
  endTime?: Date;
  isComplete: boolean;
  isPaused: boolean;
  isDemoMode: boolean;
  hasPersonalizedIntro: boolean;
  endedEarly?: boolean;
  interviewerId?: string; // Store interviewer ID for consistency
}

export interface InterviewResults {
  score: number;
  scoreColor: string;
  overallScore: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendations: string;
  nextSteps: string;
  decision?: "PASS" | "FAIL";
  passed?: boolean;
  passingThreshold?: number;
  whyDecision?: string;
}

export interface ResponseAnalysis {
  totalQuestions: number;
  totalResponses: number;
  skippedQuestions: number;
  noAnswerResponses: number;
  veryShortResponses: number;
  gibberishResponses: number;
  substantiveResponses: number;
  averageResponseLength: number;
  effectiveResponseRate: number;
  qualityScore: number;
}

// Enums and Union Types
export type SeniorityLevel = "entry" | "junior" | "mid" | "senior";
export type InterviewMode =
  | "regular" // 8 questions, standard pace
  | "practice" // 5 questions, untimed, learning-focused
  | "flash" // 3 questions, quick assessment
  | "play" // Unlimited, ABCD multiple choice, gamified
  | "competitive" // 10 questions, hardest difficulty
  | "teacher"; // Unlimited, has "Show Answer" button, not scored
export type InterviewType = "technical" | "bullet" | "coding" | "system-design";
export type QuestionType =
  | "technical"
  | "bullet"
  | "coding"
  | "system-design"
  | "conceptual"
  | "practical"
  | "architectural"
  | "debugging"
  | "core-concept"
  | "quick-assessment"
  | "essential-skill"
  | "algorithms"
  | "data-structures"
  | "optimization"
  | "implementation"
  | "architecture"
  | "scalability"
  | "trade-offs"
  | "components";

// API Request/Response Types
export interface InterviewApiRequest {
  message: string;
  conversationHistory: Message[];
  interviewConfig: InterviewConfig;
  questionCount: number;
  isFollowUp?: boolean;
  checkFollowUpOnly?: boolean;
}

export interface InterviewApiResponse {
  success: boolean;
  message?: string;
  questionType?: QuestionType;
  validated?: boolean;
  shouldFollowUp?: boolean;
  error?: string;
}

export interface AnalyzeApiRequest {
  conversationHistory: Message[];
  interviewConfig: InterviewConfig;
}

export interface AnalyzeApiResponse {
  success: boolean;
  feedback?: InterviewResults;
  rawAnalysis?: string;
  error?: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  sanitized?: string;
}

// Configuration Types
export interface SeniorityExpectations {
  score: number;
  description: string;
}

export interface CompanyPrompts {
  [key: string]: string;
}

export interface PromptTemplates {
  system: string;
  user: string;
  demo: string;
  followUp: string;
}
