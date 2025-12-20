import "dotenv/config";
import fs from "fs";
import path from "path";
import { practiceDb } from "../src/practice-library-db/client";
import {
  mcqQuestions,
  openQuestions,
  truefalseQuestions,
  matchingQuestions,
  systemDesignQuestions,
} from "../src/practice-library-db/schema";

type QuestionStatus = "draft" | "published" | "archived";
type Difficulty = "entry" | "junior" | "mid" | "senior";
type CompanySize = "faang" | "startup" | "enterprise";
type CompanyType = CompanySize;
type RoleTopic =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "mobile"
  | "data-engineer"
  | "data-scientist"
  | "cybersecurity"
  | "product";
type PositionSlug = RoleTopic;
type InterviewType =
  | "regular"
  | "practice"
  | "flash"
  | "play"
  | "competitive"
  | "teacher";
type SeniorityLevel = "entry" | "junior" | "mid" | "senior";

const normalizeDifficulty = (value: string): Difficulty => {
  switch (value) {
    case "entry":
    case "junior":
    case "mid":
    case "senior":
      return value;
    case "middle":
      return "mid";
    default: {
      throw new Error(`Unhandled difficulty: ${value}`);
    }
  }
};

const ensurePositions = (
  positions: PositionSlug[] | undefined,
  topic: RoleTopic,
): PositionSlug[] => {
  const next = new Set(positions ?? []);
  if (topic === "frontend" || topic === "backend") {
    next.add("fullstack");
  }
  return Array.from(next);
};

const ensureInterviewTypes = (
  seniorityLevels: SeniorityLevel[] | undefined,
): InterviewType[] => {
  const base: InterviewType[] = ["regular", "practice", "flash", "teacher"];
  const hasSenior = seniorityLevels?.includes("senior");
  return hasSenior ? [...base, "competitive"] : base;
};

interface JsonCompany {
  name: string;
  logo: string;
  size: CompanySize[];
  description: string;
}

interface JsonReferenceAnswer {
  id: string;
  text: string;
  weight?: number;
  keyPoints: string[];
}

interface JsonMatchingPair {
  id: string;
  left: string;
  right: string;
  explanation: string | null;
}

interface JsonSystemDesignNode {
  id: string;
  type: string;
  label: string;
  description: string;
  connections: string[];
}

interface JsonSystemDesignChart {
  id: string;
  nodes: JsonSystemDesignNode[];
}

interface JsonCoreQuestion {
  id: string;
  status: QuestionStatus;
  reviewerId: string | null;
  reviewedAt: string | null;

  difficulty: Difficulty;
  isDemoMode: boolean;
  companyType: CompanyType;

  title: string;
  description: string;
  prompt: string;

  topic: RoleTopic;
  subtopics: string[];
  tags: string[];
  estimatedTimeMinutes: number;

  aiEvaluationHint: string | null;

  companies: JsonCompany[] | null;
  positions: PositionSlug[];
  primaryTechStack: string[];

  interviewTypes: InterviewType[];
  seniorityLevels: SeniorityLevel[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface JsonMcqQuestion extends JsonCoreQuestion {
  correctAnswerText: string;
}

interface JsonOpenQuestion extends JsonCoreQuestion {
  referenceAnswers: JsonReferenceAnswer[] | null;
}

interface JsonTruefalseQuestion extends JsonCoreQuestion {
  correctAnswer: boolean;
  explanation: string;
  trickinessLevel: number | null;
}

interface JsonMatchingQuestion extends JsonCoreQuestion {
  shuffleLeft: boolean | null;
  shuffleRight: boolean | null;
  minPairs: number | null;
  maxPairs: number | null;
  pairs: JsonMatchingPair[] | null;
}

interface JsonSystemDesignQuestion extends JsonCoreQuestion {
  complexityLevel: "entry" | "junior" | "mid" | "senior" | "middle" | null;
  nonFunctionalRequirements: string[];
  constraints: string[];
  scalingFocus: string | null;
  hints: string[];
  charts: JsonSystemDesignChart[] | null;
}

interface JsonBatch {
  mcq_questions: JsonMcqQuestion[];
  open_questions: JsonOpenQuestion[];
  truefalse_questions: JsonTruefalseQuestion[];
  matching_questions: JsonMatchingQuestion[];
  system_design_questions: JsonSystemDesignQuestion[];
}

const parseArgs = (argv: string[]) => {
  const args = argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => !a.startsWith("--")) ?? null;

  const usage =
    "Usage: pnpm tsx scripts/import-practice-library-from-json.ts <path-to-json> [--dry-run]";

  if (!fileArg) {
    throw new Error(usage);
  }

  const inputPath = path.isAbsolute(fileArg)
    ? fileArg
    : path.resolve(process.cwd(), fileArg);

  return {
    dryRun,
    inputPath,
  };
};

async function main() {
  const { dryRun, inputPath } = parseArgs(process.argv);
  const raw = fs.readFileSync(inputPath, "utf8");
  const data: JsonBatch = JSON.parse(raw);

  if (dryRun) {
    console.log("✅ Dry run OK (parsed JSON):", {
      inputPath,
      mcqQuestions: data.mcq_questions.length,
      openQuestions: data.open_questions.length,
      truefalseQuestions: data.truefalse_questions.length,
      matchingQuestions: data.matching_questions.length,
      systemDesignQuestions: data.system_design_questions.length,
    });
    return;
  }

  if (!process.env.PRACTICE_LIBRARY_DATABASE_URL) {
    throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
  }

  const now = new Date();

  await practiceDb.transaction(async (tx) => {
    const hasAny =
      data.mcq_questions.length > 0 ||
      data.open_questions.length > 0 ||
      data.truefalse_questions.length > 0 ||
      data.matching_questions.length > 0 ||
      data.system_design_questions.length > 0;

    if (!hasAny) return;

    if (data.mcq_questions.length > 0) {
      await tx
        .insert(mcqQuestions)
        .values(
          data.mcq_questions.map((q) => ({
            id: q.id,
            status: q.status as any,
            reviewerId: q.reviewerId ?? null,
            reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
            difficulty: normalizeDifficulty(q.difficulty),
            isDemoMode: q.isDemoMode,
            companyType: q.companyType as any,
            title: q.title,
            description: q.description,
            prompt: q.prompt,
            topic: q.topic,
            subtopics: q.subtopics ?? [],
            tags: q.tags ?? [],
            estimatedTimeMinutes: q.estimatedTimeMinutes ?? 0,
            aiEvaluationHint: q.aiEvaluationHint ?? null,
            companies: q.companies ?? null,
            positions: ensurePositions(q.positions, q.topic),
            primaryTechStack: q.primaryTechStack ?? [],
            interviewTypes: ensureInterviewTypes(q.seniorityLevels),
            seniorityLevels: q.seniorityLevels ?? [],
            createdAt: now,
            updatedAt: now,
            createdBy: "admin",
            correctAnswerText: q.correctAnswerText,
          })),
        )
        .onConflictDoNothing();
    }

    if (data.open_questions.length > 0) {
      await tx
        .insert(openQuestions)
        .values(
          data.open_questions.map((q) => ({
            id: q.id,
            status: q.status as any,
            reviewerId: q.reviewerId ?? null,
            reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
            difficulty: normalizeDifficulty(q.difficulty),
            isDemoMode: q.isDemoMode,
            companyType: q.companyType as any,
            title: q.title,
            description: q.description,
            prompt: q.prompt,
            topic: q.topic,
            subtopics: q.subtopics ?? [],
            tags: q.tags ?? [],
            estimatedTimeMinutes: q.estimatedTimeMinutes ?? 0,
            aiEvaluationHint: q.aiEvaluationHint ?? null,
            companies: q.companies ?? null,
            positions: ensurePositions(q.positions, q.topic),
            primaryTechStack: q.primaryTechStack ?? [],
            interviewTypes: ensureInterviewTypes(q.seniorityLevels),
            seniorityLevels: q.seniorityLevels ?? [],
            createdAt: now,
            updatedAt: now,
            createdBy: "admin",
            referenceAnswers: q.referenceAnswers
              ? q.referenceAnswers.map((r) => ({
                  id: r.id,
                  text: r.text,
                  weight: r.weight ?? 1,
                  keyPoints: r.keyPoints ?? [],
                }))
              : null,
          })),
        )
        .onConflictDoNothing();
    }

    if (data.truefalse_questions.length > 0) {
      await tx
        .insert(truefalseQuestions)
        .values(
          data.truefalse_questions.map((q) => ({
            id: q.id,
            status: q.status as any,
            reviewerId: q.reviewerId ?? null,
            reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
            difficulty: normalizeDifficulty(q.difficulty),
            isDemoMode: q.isDemoMode,
            companyType: q.companyType as any,
            title: q.title,
            description: q.description,
            prompt: q.prompt,
            topic: q.topic,
            subtopics: q.subtopics ?? [],
            tags: q.tags ?? [],
            estimatedTimeMinutes: q.estimatedTimeMinutes ?? 0,
            aiEvaluationHint: q.aiEvaluationHint ?? null,
            companies: q.companies ?? null,
            positions: ensurePositions(q.positions, q.topic),
            primaryTechStack: q.primaryTechStack ?? [],
            interviewTypes: ensureInterviewTypes(q.seniorityLevels),
            seniorityLevels: q.seniorityLevels ?? [],
            createdAt: now,
            updatedAt: now,
            createdBy: "admin",
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            trickinessLevel: q.trickinessLevel ?? null,
          })),
        )
        .onConflictDoNothing();
    }

    if (data.matching_questions.length > 0) {
      await tx
        .insert(matchingQuestions)
        .values(
          data.matching_questions.map((q) => ({
            id: q.id,
            status: q.status as any,
            reviewerId: q.reviewerId ?? null,
            reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
            difficulty: normalizeDifficulty(q.difficulty),
            isDemoMode: q.isDemoMode,
            companyType: q.companyType as any,
            title: q.title,
            description: q.description,
            prompt: q.prompt,
            topic: q.topic,
            subtopics: q.subtopics ?? [],
            tags: q.tags ?? [],
            estimatedTimeMinutes: q.estimatedTimeMinutes ?? 0,
            aiEvaluationHint: q.aiEvaluationHint ?? null,
            companies: q.companies ?? null,
            positions: ensurePositions(q.positions, q.topic),
            primaryTechStack: q.primaryTechStack ?? [],
            interviewTypes: ensureInterviewTypes(q.seniorityLevels),
            seniorityLevels: q.seniorityLevels ?? [],
            createdAt: now,
            updatedAt: now,
            createdBy: "admin",
            shuffleLeft: q.shuffleLeft ?? null,
            shuffleRight: q.shuffleRight ?? null,
            minPairs: q.minPairs ?? null,
            maxPairs: q.maxPairs ?? null,
            pairs: (q.pairs ?? null) as any,
          })),
        )
        .onConflictDoNothing();
    }

    if (data.system_design_questions.length > 0) {
      await tx
        .insert(systemDesignQuestions)
        .values(
          data.system_design_questions.map((q) => ({
            id: q.id,
            status: q.status as any,
            reviewerId: q.reviewerId ?? null,
            reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
            difficulty: normalizeDifficulty(q.difficulty),
            isDemoMode: q.isDemoMode,
            companyType: q.companyType as any,
            title: q.title,
            description: q.description,
            prompt: q.prompt,
            topic: q.topic,
            subtopics: q.subtopics ?? [],
            tags: q.tags ?? [],
            estimatedTimeMinutes: q.estimatedTimeMinutes ?? 0,
            aiEvaluationHint: q.aiEvaluationHint ?? null,
            companies: q.companies ?? null,
            positions: ensurePositions(q.positions, q.topic),
            primaryTechStack: q.primaryTechStack ?? [],
            interviewTypes: ensureInterviewTypes(q.seniorityLevels),
            seniorityLevels: q.seniorityLevels ?? [],
            createdAt: now,
            updatedAt: now,
            createdBy: "admin",
            complexityLevel: q.complexityLevel
              ? normalizeDifficulty(q.complexityLevel)
              : null,
            nonFunctionalRequirements: q.nonFunctionalRequirements ?? [],
            constraints: q.constraints ?? [],
            scalingFocus: q.scalingFocus ?? null,
            hints: q.hints ?? [],
            charts: (q.charts ?? null) as any,
          })),
        )
        .onConflictDoNothing();
    }
  });

  console.log("✅ Imported questions into practice library DB:", {
    mcqQuestions: data.mcq_questions.length,
    openQuestions: data.open_questions.length,
    truefalseQuestions: data.truefalse_questions.length,
    matchingQuestions: data.matching_questions.length,
    systemDesignQuestions: data.system_design_questions.length,
  });
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  if (err instanceof Error && "cause" in err) {
    console.error("cause:", (err as any).cause);
  }
  process.exit(1);
});
