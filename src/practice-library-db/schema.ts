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
  QuestionType,
  ReferenceAnswer,
} from "@/types/practice-question";

export const practiceQuestions = pgTable("practice_questions", {
  id: text("id").primaryKey(),
  type: text("type").$type<QuestionType>().notNull(),
  difficulty: text("difficulty").$type<DifficultyLevel>().notNull(),
  status: text("status").$type<QuestionStatus>().notNull(),

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

  multiChoiceAnswers: text("multi_choice_answers").array(),
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

  // Open questions
  openReferenceAnswers: jsonb("open_reference_answers").$type<
    ReferenceAnswer[] | null
  >(),

  // True/False questions
  trueFalseCorrectAnswer: boolean("truefalse_correct_answer"),
  trueFalseExplanation: text("truefalse_explanation"),

  // Matching questions
  matchingShuffleLeft: boolean("matching_shuffle_left"),
  matchingShuffleRight: boolean("matching_shuffle_right"),
  matchingPairs: jsonb("matching_pairs").$type<MatchingPair[] | null>(),
});

export const practiceMcqOptions = pgTable("practice_mcq_options", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => practiceQuestions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  explanation: text("explanation"),
});

export const practiceMatchingPairs = pgTable("practice_matching_pairs", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => practiceQuestions.id, { onDelete: "cascade" }),
  left: text("left").notNull(),
  right: text("right").notNull(),
  explanation: text("explanation"),
});

export const practiceSystemDesignCharts = pgTable(
  "practice_system_design_charts",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => practiceQuestions.id, { onDelete: "cascade" }),
    chart: jsonb("chart").notNull().default([]),
  },
);
