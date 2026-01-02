/**
 * Firestore Data Models for Blairify Application
 * Comprehensive TypeScript interfaces for all database entities
 */

import type { DocumentSnapshot, Timestamp } from "firebase/firestore";

// ================================
// USER PROFILE MODELS
// ================================

export interface UserProfile {
  // Basic Information
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  avatarIcon?: string;

  // Profile Details
  role?: string;
  experience?: string;

  onboardingCompleted?: boolean;

  // Gamification
  experiencePoints?: number;
  level?: number;
  title?: string;
  badgesUnlocked?: string[];
  totalInterviews?: number;
  averageScore?: number;
  postInterviewSurveyCompleted?: boolean;

  // Preferences
  preferences: UserPreferences;

  // Cookie Consent (GDPR Compliance)
  cookieConsent?: {
    hasConsented: boolean;
    consentDate: Timestamp;
    preferences: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
      personalization: boolean;
    };
    version: string;
  };

  // GDPR Data (for easier access and compliance reporting)
  gdprData?: {
    cookieConsentGiven: boolean;
    cookieConsentDate: Timestamp;
    cookiePreferences: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
      personalization: boolean;
    };
    consentVersion: string;
    lastUpdated: Timestamp;
    dataProcessingConsent?: boolean;
    marketingEmailConsent?: boolean;
  };

  // Metadata
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActiveAt: Timestamp;
  isActive: boolean;

  // Subscription/Plan Info
  subscription: UserSubscription;
}

export interface UserPreferences {
  preferredDifficulty: "beginner" | "intermediate" | "advanced";
  preferredInterviewTypes: InterviewType[];
  targetCompanies: string[];
  notificationsEnabled: boolean;
  language: string;
  earlyJobMatchingEnabled?: boolean;
  preferredLocation?: string;
  preferredTechnologies?: string[];
  preferredWorkTypes?: string[];
  expectedSalary?: string;
  struggleAreas?: string[];
  careerGoals?: string[];
}

export interface UserSubscription {
  plan: "free" | "pro";
  status: "active" | "cancelled" | "expired";
  expiresAt?: Timestamp;
  features: string[];
  limits: {
    sessionsPerMonth: number;
    skillsTracking: number;
    analyticsRetention: number; // days
  };
}

// ================================
// SKILLS MODELS
// ================================

export interface UserSkill {
  skillId: string;
  category: SkillCategory;
  name: string;

  // Current Assessment
  currentLevel: number; // 1-10 scale
  targetLevel: number;
  confidence: number; // 1-10 scale

  // Progress Tracking
  progressHistory: SkillProgressEntry[];

  // Performance Metrics
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  // Activity
  lastPracticedAt?: Timestamp;
  totalPracticeTime: number; // minutes
  practiceCount: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SkillProgressEntry {
  date: Timestamp;
  level: number;
  confidence: number;
  assessmentSource:
    | "interview"
    | "practice"
    | "self-assessment"
    | "ai-analysis";
  sessionId?: string;
  notes?: string;
}

export type SkillCategory =
  | "technical"
  | "bullet"
  | "system-design"
  | "communication"
  | "problem-solving"
  | "leadership"
  | "coding"
  | "algorithms"
  | "data-structures";

// ================================
// INTERVIEW SESSION MODELS
// ================================

export interface InterviewSession {
  sessionId: string;

  // Configuration
  config: InterviewConfig;

  // Session State
  status: SessionStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  totalDuration: number; // actual minutes spent
  scores?: SessionScores;
  termination?: SessionTermination;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  analysis: SessionAnalysis;
  userFeedback?: UserSessionFeedback;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TerminationReason =
  | "language"
  | "profanity"
  | "inappropriate-behavior";

export interface SessionTermination {
  reason: TerminationReason;
  message: string;
  at?: Timestamp;
}

export interface InterviewConfig {
  position: string;
  seniority: SeniorityLevel;
  technologies?: string[];
  companyProfile?: string;
  specificCompany?: string;
  company?: string;
  interviewMode: InterviewMode;
  interviewType: InterviewType;
  duration: number; // minutes
  isDemoMode?: boolean;
  contextType?: string;
  jobId?: string;
  jobDescription?: string;
  jobRequirements?: string;
  jobLocation?: string;
  jobType?: string;
  difficulty?: "easy" | "medium" | "hard";
  focusAreas?: string[];
}

export type SeniorityLevel = "entry" | "junior" | "mid" | "senior";

export type InterviewMode =
  | "regular"
  | "practice"
  | "flash"
  | "play"
  | "competitive"
  | "teacher";

export type InterviewType = "technical" | "bullet" | "coding" | "system-design";

export type SessionStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "abandoned"
  | "paused";

export interface SessionScores {
  overall: number; // 1-100
  technical: number;
  communication: number;
  problemSolving: number;
  codeQuality?: number;
  systemDesign?: number;
  bullet?: number;
  presentation?: number;
}

export interface InterviewQuestion {
  id: string;
  type: InterviewType;
  category: string;
  question: string;
  difficulty: number; // 1-10
  expectedDuration: number; // minutes
  tags: string[];
  hints?: string[];
  followUpQuestions?: string[];
  aiExampleAnswer?: string;
  followUps?: Array<{
    question: string;
    response: string;
    aiExampleAnswer?: string;
  }>;
}

export interface InterviewResponse {
  questionId: string;
  response: string;
  duration: number; // seconds taken to respond
  confidence: number; // user's self-reported confidence 1-10
  score: number; // AI-generated score 1-100
  feedback: string; // AI-generated feedback
  keyPoints: string[];
  missedPoints: string[];
  codeSubmitted?: string;
  language?: string;
}

export interface SessionAnalysis {
  strengths: string[];
  improvements: string[];
  skillsAssessed: string[];
  difficulty: number; // 1-10
  aiConfidence: number; // 1-100
  summary: string;
  detailedAnalysis?: string;
  recommendations: string[];
  nextSteps: string[];
  passed?: boolean;
  decision?: "PASS" | "FAIL" | "UNKNOWN";
  passingThreshold?: number;
  whyDecision?: string;
  knowledgeGaps?: Array<{
    title: string;
    priority: "high" | "medium" | "low";
    tags: string[];
    why: string;
    resources?: Array<{
      id: string;
      title: string;
      url: string;
      type: "docs" | "course" | "video" | "book" | "practice";
      tags: string[];
      difficulty?: SeniorityLevel;
    }>;
  }>;
}

export interface UserSessionFeedback {
  difficulty: number; // 1-10
  relevance: number; // 1-10
  satisfaction: number; // 1-10
  comments?: string;
  wouldRecommend: boolean;
  suggestedImprovements?: string[];
}

// ================================
// ANALYTICS MODELS
// ================================

export interface UserAnalytics {
  period: AnalyticsPeriod;
  date: string; // YYYY-MM-DD or YYYY-MM or YYYY format

  // Session Statistics
  sessions: SessionStatistics;

  // Performance Metrics
  performance: PerformanceMetrics;

  // Skills Progress
  skillsProgress: SkillAnalytics[];

  // Activity Patterns
  activity: ActivityPatterns;

  // Goals and Achievements
  goals: GoalProgress;
  achievements: string[]; // achievement IDs unlocked this period

  // Metadata
  generatedAt: Timestamp;
  updatedAt: Timestamp;
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface SessionStatistics {
  total: number;
  completed: number;
  abandoned: number;
  averageDuration: number;
  totalTime: number; // minutes
  byType: Record<InterviewType, number>;
  byDifficulty: Record<string, number>;
}

export interface PerformanceMetrics {
  averageScore: number;
  scoreDistribution: Record<string, number>;
  improvement: number; // percentage change from previous period
  consistency: number; // score variance metric
  bestPerformingArea: string;
  needsImprovementArea: string;
}

export interface SkillAnalytics {
  skillId: string;
  skillName: string;
  startLevel: number;
  currentLevel: number;
  improvement: number;
  practiceTime: number;
  confidenceGain: number;
}

export interface ActivityPatterns {
  mostActiveDay: string;
  averageSessionsPerDay: number;
  preferredTime: string; // hour of day
  streak: number; // consecutive days
  totalDaysActive: number;
  longestStreak: number;
}

export interface GoalProgress {
  target: number;
  achieved: number;
  progress: number; // percentage
  onTrack: boolean;
}

// ================================
// PROGRESS TRACKING MODELS
// ================================

export interface ProgressTracking {
  trackingId: string;
  type: ProgressType;

  // Target Information
  target: ProgressTarget;

  // Current Progress
  current: CurrentProgress;

  // History
  history: ProgressHistoryEntry[];

  // Status
  status: ProgressStatus;
  priority: "low" | "medium" | "high";

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export type ProgressType =
  | "skill"
  | "goal"
  | "milestone"
  | "streak"
  | "score-improvement"
  | "session-completion";

export interface ProgressTarget {
  name: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string; // 'sessions', 'points', 'level', etc.
  deadline?: Timestamp;
  reward?: string;
}

export interface CurrentProgress {
  value: number;
  percentage: number;
  lastUpdated: Timestamp;
  velocity: number; // progress per day
}

export interface ProgressHistoryEntry {
  date: Timestamp;
  value: number;
  change: number;
  note?: string;
  trigger?: string; // what caused this progress update
}

export type ProgressStatus =
  | "active"
  | "completed"
  | "paused"
  | "failed"
  | "on-hold";

// ================================
// ACTIVITY LOG MODELS
// ================================

export interface ActivityLog {
  activityId: string;

  // Activity Details
  type: ActivityType;
  action: string;
  description: string;

  // Context
  sessionId?: string;
  skillId?: string;
  targetId?: string;

  // Data
  data: Record<string, unknown>; // flexible data storage

  // Impact
  impact: ActivityImpact;

  // Metadata
  timestamp: Timestamp;
  source: "user_action" | "system_event" | "ai_analysis";
  device?: string;
  userAgent?: string;
}

export type ActivityType =
  | "session_start"
  | "session_complete"
  | "skill_practice"
  | "goal_achieved"
  | "milestone_reached"
  | "level_up"
  | "streak_broken"
  | "streak_extended"
  | "achievement_unlocked"
  | "profile_updated"
  | "feedback_submitted";

export interface ActivityImpact {
  skillsAffected: string[];
  scoreChange?: number;
  levelChange?: number;
  streakUpdate?: number;
  pointsEarned?: number;
  achievementsUnlocked?: string[];
}

// ================================
// ACHIEVEMENT MODELS
// ================================

export interface UserAchievement {
  achievementId: string;

  // Achievement Details
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon?: string;

  // Requirements
  requirements: AchievementRequirement[];

  // Status
  isUnlocked: boolean;
  progress: number; // 0-100
  unlockedAt?: Timestamp;

  // Rewards
  rewards: AchievementRewards;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AchievementCategory =
  | "sessions"
  | "skills"
  | "streaks"
  | "scores"
  | "special"
  | "social"
  | "learning";

export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface AchievementRequirement {
  type: string;
  value: number;
  timeframe?: string;
  operator: ">" | ">=" | "=" | "<" | "<=";
}

export interface AchievementRewards {
  points: number;
  badges: string[];
  features?: string[];
  unlocks?: string[];
}

// ================================
// UTILITY TYPES
// ================================

export interface BaseEntity {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimestampRange {
  start: Timestamp;
  end: Timestamp;
}

export interface PaginationParams {
  limit: number;
  lastDoc?: DocumentSnapshot;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface QueryFilters {
  [key: string]: unknown;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Timestamp;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ================================
// CONFIGURATION TYPES
// ================================

export interface DatabaseConfig {
  collections: {
    users: string;
    sessions: string;
    skills: string;
    analytics: string;
    progress: string;
    activities: string;
    achievements: string;
  };
  indexes: string[];
  rules: string;
}
