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

interface JsonCompany {
  name: string;
  logo: string;
  size?: string[];
  description: string;
}

interface JsonReferenceAnswer {
  id: string;
  text: string;
  weight: number;
  keyPoints?: string[];
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
  status: string;
  reviewerId: string | null;
  reviewedAt: string | null;

  difficulty: "entry" | "junior" | "middle" | "senior";
  isDemoMode: boolean;
  companyType: "faang" | "startup" | "enterprise";

  title: string;
  description: string;
  prompt: string;

  topic: string;
  subtopics: string[];
  tags: string[];
  estimatedTimeMinutes: number;

  aiEvaluationHint: string | null;

  companies: JsonCompany[] | null;
  positions: string[];
  primaryTechStack: string[];

  interviewTypes: string[];
  seniorityLevels: string[];

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
  complexityLevel: "entry" | "junior" | "middle" | "senior" | null;
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

async function main() {
  if (!process.env.PRACTICE_LIBRARY_DATABASE_URL) {
    throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
  }

  const jsonPath = path.resolve(__dirname, "..", "questions_output.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data: JsonBatch = JSON.parse(raw);

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
      await tx.insert(mcqQuestions).values(
        data.mcq_questions.map((q) => ({
          id: q.id,
          status: q.status as any,
          reviewerId: q.reviewerId ?? null,
          reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
          difficulty: q.difficulty,
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
          positions: q.positions ?? [],
          primaryTechStack: q.primaryTechStack ?? [],
          interviewTypes: (q.interviewTypes ?? []) as any,
          seniorityLevels: q.seniorityLevels ?? [],
          createdAt: now,
          updatedAt: now,
          createdBy: "generated_by_ai",
          correctAnswerText: q.correctAnswerText,
        })),
      );
    }

    if (data.open_questions.length > 0) {
      await tx.insert(openQuestions).values(
        data.open_questions.map((q) => ({
          id: q.id,
          status: q.status as any,
          reviewerId: q.reviewerId ?? null,
          reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
          difficulty: q.difficulty,
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
          positions: q.positions ?? [],
          primaryTechStack: q.primaryTechStack ?? [],
          interviewTypes: (q.interviewTypes ?? []) as any,
          seniorityLevels: q.seniorityLevels ?? [],
          createdAt: now,
          updatedAt: now,
          createdBy: "generated_by_ai",
          referenceAnswers: q.referenceAnswers
            ? q.referenceAnswers.map((r) => ({
                id: r.id,
                text: r.text,
                weight: r.weight,
                keyPoints: r.keyPoints ?? [],
              }))
            : null,
        })),
      );
    }

    if (data.truefalse_questions.length > 0) {
      await tx.insert(truefalseQuestions).values(
        data.truefalse_questions.map((q) => ({
          id: q.id,
          status: q.status as any,
          reviewerId: q.reviewerId ?? null,
          reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
          difficulty: q.difficulty,
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
          positions: q.positions ?? [],
          primaryTechStack: q.primaryTechStack ?? [],
          interviewTypes: (q.interviewTypes ?? []) as any,
          seniorityLevels: q.seniorityLevels ?? [],
          createdAt: now,
          updatedAt: now,
          createdBy: "generated_by_ai",
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          trickinessLevel: q.trickinessLevel ?? null,
        })),
      );
    }

    if (data.matching_questions.length > 0) {
      await tx.insert(matchingQuestions).values(
        data.matching_questions.map((q) => ({
          id: q.id,
          status: q.status as any,
          reviewerId: q.reviewerId ?? null,
          reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
          difficulty: q.difficulty,
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
          positions: q.positions ?? [],
          primaryTechStack: q.primaryTechStack ?? [],
          interviewTypes: (q.interviewTypes ?? []) as any,
          seniorityLevels: q.seniorityLevels ?? [],
          createdAt: now,
          updatedAt: now,
          createdBy: "generated_by_ai",
          shuffleLeft: q.shuffleLeft ?? null,
          shuffleRight: q.shuffleRight ?? null,
          minPairs: q.minPairs ?? null,
          maxPairs: q.maxPairs ?? null,
          pairs: (q.pairs ?? null) as any,
        })),
      );
    }

    if (data.system_design_questions.length > 0) {
      await tx.insert(systemDesignQuestions).values(
        data.system_design_questions.map((q) => ({
          id: q.id,
          status: q.status as any,
          reviewerId: q.reviewerId ?? null,
          reviewedAt: q.reviewedAt ? new Date(q.reviewedAt) : null,
          difficulty: q.difficulty,
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
          positions: q.positions ?? [],
          primaryTechStack: q.primaryTechStack ?? [],
          interviewTypes: (q.interviewTypes ?? []) as any,
          seniorityLevels: q.seniorityLevels ?? [],
          createdAt: now,
          updatedAt: now,
          createdBy: "generated_by_ai",
          complexityLevel: q.complexityLevel ?? null,
          nonFunctionalRequirements: q.nonFunctionalRequirements ?? [],
          constraints: q.constraints ?? [],
          scalingFocus: q.scalingFocus ?? null,
          hints: q.hints ?? [],
          charts: (q.charts ?? null) as any,
        })),
      );
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
  process.exit(1);
});
