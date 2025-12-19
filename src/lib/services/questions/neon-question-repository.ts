import { and, desc, eq } from "drizzle-orm";
import { practiceDb } from "@/practice-library-db/client";
import {
  matchingQuestions,
  mcqQuestions,
  openQuestions,
  systemDesignQuestions,
  truefalseQuestions,
} from "@/practice-library-db/schema";
import type {
  DifficultyLevel,
  MatchingQuestion,
  MCQOption,
  MCQQuestion,
  OpenQuestion,
  Question,
  QuestionQueryOptions,
  QuestionStatus,
  TrueFalseQuestion,
} from "@/types/practice-question";

// Drizzle row types

type McqRow = typeof mcqQuestions.$inferSelect;
type OpenRow = typeof openQuestions.$inferSelect;
type TrueFalseRow = typeof truefalseQuestions.$inferSelect;
type MatchingRow = typeof matchingQuestions.$inferSelect;
type SystemDesignRow = typeof systemDesignQuestions.$inferSelect;

interface BaseFilters {
  status: QuestionStatus;
  topic?: string;
  difficulty?: DifficultyLevel;
}

interface QueryResult {
  questions: Question[];
  hasMore: boolean;
}

type SeniorityTag = "entry" | "junior" | "mid" | "senior";

function normalizeSeniorityTags(values: unknown): SeniorityTag[] {
  if (!Array.isArray(values)) return [];

  const allowed = new Set<SeniorityTag>(["entry", "junior", "mid", "senior"]);
  return values
    .filter((v) => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is SeniorityTag => allowed.has(v as SeniorityTag));
}

// Public API

export async function getQuestionById(id: string): Promise<Question | null> {
  const [mcq, open, tf, matching, system] = await Promise.all([
    practiceDb
      .select()
      .from(mcqQuestions)
      .where(eq(mcqQuestions.id, id))
      .limit(1),
    practiceDb
      .select()
      .from(openQuestions)
      .where(eq(openQuestions.id, id))
      .limit(1),
    practiceDb
      .select()
      .from(truefalseQuestions)
      .where(eq(truefalseQuestions.id, id))
      .limit(1),
    practiceDb
      .select()
      .from(matchingQuestions)
      .where(eq(matchingQuestions.id, id))
      .limit(1),
    practiceDb
      .select()
      .from(systemDesignQuestions)
      .where(eq(systemDesignQuestions.id, id))
      .limit(1),
  ]);

  if (mcq[0]) return mapMcqRowToQuestion(mcq[0]);
  if (open[0]) return mapOpenRowToQuestion(open[0]);
  if (tf[0]) return mapTrueFalseRowToQuestion(tf[0]);
  if (matching[0]) return mapMatchingRowToQuestion(matching[0]);
  if (system[0]) return mapSystemDesignRowToQuestion(system[0]);

  return null;
}

export async function queryQuestions(
  options: QuestionQueryOptions,
): Promise<QueryResult> {
  const { filters } = options;
  const limit = options.limit ?? 20;
  const status = filters.status ?? "published";

  const baseFilters: BaseFilters = {
    status,
    topic: filters.topic,
    difficulty: filters.difficulty,
  };

  const [mcq, open, tf, matching, system] = await Promise.all([
    fetchMcqQuestions(baseFilters, limit),
    fetchOpenQuestions(baseFilters, limit),
    fetchTrueFalseQuestions(baseFilters, limit),
    fetchMatchingQuestions(baseFilters, limit),
    fetchSystemDesignQuestions(baseFilters, limit),
  ]);

  let questions: Question[] = [...mcq, ...open, ...tf, ...matching, ...system];

  if (filters.type) {
    questions = questions.filter((q) => q.type === filters.type);
  }

  if (filters.companyName) {
    const companyLower = filters.companyName.toLowerCase();
    questions = questions.filter((q) =>
      q.companies?.some((c) => c.name.toLowerCase() === companyLower),
    );
  }

  if (filters.position) {
    questions = questions.filter((q) =>
      q.positions?.includes(filters.position!),
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    const tagLower = filters.tags[0].toLowerCase();
    questions = questions.filter((q) =>
      q.tags.some((tag) => tag.toLowerCase() === tagLower),
    );
  }

  questions = applyOrder(questions, options);

  const sliced = questions.slice(0, limit);

  return {
    questions: sliced,
    hasMore: questions.length > sliced.length,
  };
}

// Per-table fetchers

async function fetchMcqQuestions(
  filters: BaseFilters,
  limit: number,
): Promise<MCQQuestion[]> {
  const whereClauses = buildWhereClauses(mcqQuestions, filters);

  const rows = await practiceDb
    .select()
    .from(mcqQuestions)
    .where(and(...whereClauses))
    .orderBy(desc(mcqQuestions.createdAt))
    .limit(limit);

  return rows.map(mapMcqRowToQuestion);
}

async function fetchOpenQuestions(
  filters: BaseFilters,
  limit: number,
): Promise<OpenQuestion[]> {
  const whereClauses = buildWhereClauses(openQuestions, filters);

  const rows = await practiceDb
    .select()
    .from(openQuestions)
    .where(and(...whereClauses))
    .orderBy(desc(openQuestions.createdAt))
    .limit(limit);

  return rows.map(mapOpenRowToQuestion);
}

async function fetchTrueFalseQuestions(
  filters: BaseFilters,
  limit: number,
): Promise<TrueFalseQuestion[]> {
  const whereClauses = buildWhereClauses(truefalseQuestions, filters);

  const rows = await practiceDb
    .select()
    .from(truefalseQuestions)
    .where(and(...whereClauses))
    .orderBy(desc(truefalseQuestions.createdAt))
    .limit(limit);

  return rows.map(mapTrueFalseRowToQuestion);
}

async function fetchMatchingQuestions(
  filters: BaseFilters,
  limit: number,
): Promise<MatchingQuestion[]> {
  const whereClauses = buildWhereClauses(matchingQuestions, filters);

  const rows = await practiceDb
    .select()
    .from(matchingQuestions)
    .where(and(...whereClauses))
    .orderBy(desc(matchingQuestions.createdAt))
    .limit(limit);

  return rows.map(mapMatchingRowToQuestion);
}

async function fetchSystemDesignQuestions(
  filters: BaseFilters,
  limit: number,
): Promise<Question[]> {
  const whereClauses = buildWhereClauses(systemDesignQuestions, filters);

  const rows = await practiceDb
    .select()
    .from(systemDesignQuestions)
    .where(and(...whereClauses))
    .orderBy(desc(systemDesignQuestions.createdAt))
    .limit(limit);

  return rows.map(mapSystemDesignRowToQuestion);
}

// Mapping functions

function mapBaseFields(
  row: McqRow | OpenRow | TrueFalseRow | MatchingRow | SystemDesignRow,
): Omit<Question, "type"> {
  return {
    id: row.id,
    difficulty: row.difficulty,
    status: row.status,
    isDemoMode: row.isDemoMode,
    companyType: row.companyType,
    title: row.title,
    description: row.description,
    prompt: row.prompt,
    topic: row.topic,
    subtopics: row.subtopics,
    tags: row.tags,
    estimatedTimeMinutes: row.estimatedTimeMinutes,
    aiEvaluationHint: row.aiEvaluationHint ?? undefined,
    companies: row.companies ?? undefined,
    positions: row.positions ?? undefined,
    primaryTechStack: row.primaryTechStack ?? undefined,
    interviewTypes: row.interviewTypes ?? undefined,
    seniorityLevels:
      row.seniorityLevels && row.seniorityLevels.length > 0
        ? normalizeSeniorityTags(row.seniorityLevels)
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  };
}

function mapMcqRowToQuestion(row: McqRow): MCQQuestion {
  const base = mapBaseFields(row);

  const options: MCQOption[] = [
    {
      id: "option-1",
      text: row.correctAnswerText,
      isCorrect: true,
    },
  ];

  return {
    ...base,
    type: "mcq",
    options,
    allowMultipleAnswers: false,
    shuffleOptions: false,
  };
}

function mapOpenRowToQuestion(row: OpenRow): OpenQuestion {
  const base = mapBaseFields(row);

  return {
    ...base,
    type: "open",
    referenceAnswers: (row.referenceAnswers ?? []).map((ref) => ({
      id: ref.id,
      text: ref.text,
      weight: ref.weight,
      keyPoints: ref.keyPoints ?? [],
    })),
    evaluationCriteria: {
      completeness: 0.25,
      accuracy: 0.25,
      clarity: 0.25,
      depth: 0.25,
    },
  };
}

function mapTrueFalseRowToQuestion(row: TrueFalseRow): TrueFalseQuestion {
  const base = mapBaseFields(row);

  return {
    ...base,
    type: "truefalse",
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
  };
}

function mapMatchingRowToQuestion(row: MatchingRow): MatchingQuestion {
  const base = mapBaseFields(row);

  return {
    ...base,
    type: "matching",
    pairs: row.pairs ?? [],
    shuffleLeft: row.shuffleLeft ?? false,
    shuffleRight: row.shuffleRight ?? false,
  };
}

function mapSystemDesignRowToQuestion(row: SystemDesignRow): Question {
  const base = mapBaseFields(row);

  return {
    ...base,
    type: "open",
    referenceAnswers: [
      {
        id: "system-design-reference",
        text: row.description,
        weight: 1,
        keyPoints: row.nonFunctionalRequirements ?? [],
      },
    ],
    evaluationCriteria: {
      completeness: 0.25,
      accuracy: 0.25,
      clarity: 0.25,
      depth: 0.25,
    },
  } as OpenQuestion;
}

// Helpers

function buildWhereClauses<
  T extends { status: any; topic: any; difficulty: any },
>(table: T, filters: BaseFilters) {
  const clauses = [eq(table.status, filters.status)];

  if (filters.topic) {
    clauses.push(eq(table.topic, filters.topic));
  }

  if (filters.difficulty) {
    clauses.push(eq(table.difficulty, filters.difficulty));
  }

  return clauses;
}

function applyOrder(questions: Question[], options: QuestionQueryOptions) {
  const orderByField = options.orderBy ?? "createdAt";
  const direction = options.orderDirection ?? "desc";

  if (orderByField === "random") {
    return [...questions].sort(() => Math.random() - 0.5);
  }

  const sorted = [...questions].sort((a, b) => {
    if (orderByField === "difficulty") {
      const order: DifficultyLevel[] = ["entry", "junior", "mid", "senior"];
      const aIndex = order.indexOf(a.difficulty as DifficultyLevel);
      const bIndex = order.indexOf(b.difficulty as DifficultyLevel);
      return aIndex - bIndex;
    }

    if (orderByField === "createdAt") {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return aDate - bDate;
    }

    const _never: never = orderByField;
    throw new Error(`Unhandled orderBy field: ${_never}`);
  });

  if (direction === "desc") {
    return sorted.reverse();
  }

  return sorted;
}
