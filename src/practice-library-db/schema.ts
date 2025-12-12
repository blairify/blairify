import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  CompanyType,
  DifficultyLevel,
  MatchingPair,
  QuestionInterviewMode,
  QuestionStatus,
  ReferenceAnswer,
} from "@/types/practice-question";

export const resources = pgTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  tags: text("tags").array().notNull().default([]),
  difficulty: text("difficulty"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const mcqQuestions = pgTable("mcq_questions", {
  id: text("id").primaryKey(),
  status: text("status").$type<QuestionStatus>().notNull(),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  isDemoMode: boolean("is_demo_mode").notNull().default(false),
  companyType: text("company_type").$type<CompanyType>().notNull(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),

  topic: text("topic").notNull(),
  subtopics: text("subtopics").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(0),

  aiEvaluationHint: text("ai_evaluation_hint"),
  companies: jsonb("companies").$type<Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }> | null>(),
  positions: text("positions").array().notNull().default([]),
  primaryTechStack: text("primary_tech_stack").array().notNull().default([]),

  interviewTypes: text("interview_types")
    .array()
    .$type<QuestionInterviewMode[]>()
    .notNull()
    .default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),
  correctAnswerText: text("correct_answer_text").notNull(),
});

export const openQuestions = pgTable("open_questions", {
  id: text("id").primaryKey(),
  status: text("status").$type<QuestionStatus>().notNull(),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  isDemoMode: boolean("is_demo_mode").notNull().default(false),
  companyType: text("company_type").$type<CompanyType>().notNull(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),

  topic: text("topic").notNull(),
  subtopics: text("subtopics").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(0),

  aiEvaluationHint: text("ai_evaluation_hint"),
  companies: jsonb("companies").$type<Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }> | null>(),
  positions: text("positions").array().notNull().default([]),
  primaryTechStack: text("primary_tech_stack").array().notNull().default([]),

  interviewTypes: text("interview_types")
    .array()
    .$type<QuestionInterviewMode[]>()
    .notNull()
    .default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),
  referenceAnswers: jsonb("reference_answers").$type<
    ReferenceAnswer[] | null
  >(),
});

export const truefalseQuestions = pgTable("truefalse_questions", {
  id: text("id").primaryKey(),
  status: text("status").$type<QuestionStatus>().notNull(),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  isDemoMode: boolean("is_demo_mode").notNull().default(false),
  companyType: text("company_type").$type<CompanyType>().notNull(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),

  topic: text("topic").notNull(),
  subtopics: text("subtopics").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(0),

  aiEvaluationHint: text("ai_evaluation_hint"),
  companies: jsonb("companies").$type<Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }> | null>(),
  positions: text("positions").array().notNull().default([]),
  primaryTechStack: text("primary_tech_stack").array().notNull().default([]),

  interviewTypes: text("interview_types")
    .array()
    .$type<QuestionInterviewMode[]>()
    .notNull()
    .default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),

  correctAnswer: boolean("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  trickinessLevel: integer("trickiness_level"),
});

export const matchingQuestions = pgTable("matching_questions", {
  id: text("id").primaryKey(),
  status: text("status").$type<QuestionStatus>().notNull(),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  isDemoMode: boolean("is_demo_mode").notNull().default(false),
  companyType: text("company_type").$type<CompanyType>().notNull(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),

  topic: text("topic").notNull(),
  subtopics: text("subtopics").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(0),

  aiEvaluationHint: text("ai_evaluation_hint"),
  companies: jsonb("companies").$type<Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }> | null>(),
  positions: text("positions").array().notNull().default([]),
  primaryTechStack: text("primary_tech_stack").array().notNull().default([]),

  interviewTypes: text("interview_types")
    .array()
    .$type<QuestionInterviewMode[]>()
    .notNull()
    .default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),

  shuffleLeft: boolean("shuffle_left"),
  shuffleRight: boolean("shuffle_right"),
  minPairs: integer("min_pairs"),
  maxPairs: integer("max_pairs"),
  pairs: jsonb("pairs").$type<MatchingPair[] | null>(),
});

export const systemDesignQuestions = pgTable("system_design_questions", {
  id: text("id").primaryKey(),
  status: text("status").$type<QuestionStatus>().notNull(),
  reviewerId: text("reviewer_id"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  isDemoMode: boolean("is_demo_mode").notNull().default(false),
  companyType: text("company_type").$type<CompanyType>().notNull(),

  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),

  topic: text("topic").notNull(),
  subtopics: text("subtopics").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(0),

  aiEvaluationHint: text("ai_evaluation_hint"),
  companies: jsonb("companies").$type<Array<{
    name: string;
    logo: string;
    size?: string[];
    description: string;
  }> | null>(),
  positions: text("positions").array().notNull().default([]),
  primaryTechStack: text("primary_tech_stack").array().notNull().default([]),

  interviewTypes: text("interview_types")
    .array()
    .$type<QuestionInterviewMode[]>()
    .notNull()
    .default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),

  complexityLevel: text("complexity_level"),
  nonFunctionalRequirements: text("non_functional_requirements")
    .array()
    .notNull()
    .default([]),
  constraints: text("constraints").array().notNull().default([]),
  scalingFocus: text("scaling_focus"),
  hints: text("hints").array().notNull().default([]),
  charts: jsonb("charts").$type<Array<{
    id: string;
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      description: string;
      connections: string[];
    }>;
  }> | null>(),
});
