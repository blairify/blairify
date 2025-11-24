import "dotenv/config";
import fs from "fs";
import path from "path";
import { practiceDb } from "../src/practice-library-db/client";
import {
  practiceMatchingPairs,
  practiceMcqOptions,
  practiceQuestions,
  practiceSystemDesignCharts,
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
  left: string;
  right: string;
  explanation?: string | null;
}

interface JsonQuestion {
  id: string;
  type: "mcq" | "open" | "truefalse" | "matching" | "system-design";
  difficulty: "entry" | "junior" | "middle" | "senior";
  status: string;
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
  multiChoiceAnswers: string[] | null;
  companies: JsonCompany[] | null;
  positions: string[];
  primaryTechStack: string[];
  interviewTypes: string[];
  seniorityLevels: string[];
  trueFalseCorrectAnswer: boolean | null;
  trueFalseExplanation: string | null;
  matchingShuffleLeft: boolean | null;
  matchingShuffleRight: boolean | null;
  matchingPairs: JsonMatchingPair[] | null;
  openReferenceAnswers: JsonReferenceAnswer[] | null;
  createdBy: string;
}

interface JsonMcqOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface JsonMatchingPairRow {
  id: string;
  questionId: string;
  left: string;
  right: string;
  explanation: string | null;
}

interface JsonSystemDesignChart {
  id: string;
  questionId: string;
  chart: unknown[];
}

interface JsonBatch {
  practice_questions: JsonQuestion[];
  practice_mcq_options: JsonMcqOption[];
  practice_matching_pairs: JsonMatchingPairRow[];
  practice_system_design_charts: JsonSystemDesignChart[];
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
    if (data.practice_questions.length === 0) return;

    await tx.insert(practiceQuestions).values(
      data.practice_questions.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        status: q.status as any,
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
        multiChoiceAnswers: q.multiChoiceAnswers ?? null,
        companies: q.companies ?? null,
        positions: q.positions ?? [],
        primaryTechStack: q.primaryTechStack ?? [],
        interviewTypes: (q.interviewTypes ?? []) as any,
        seniorityLevels: q.seniorityLevels ?? [],
        createdAt: now,
        updatedAt: now,
        createdBy: q.createdBy || "system",
        openReferenceAnswers: q.openReferenceAnswers
          ? q.openReferenceAnswers.map((r) => ({
              ...r,
              keyPoints: r.keyPoints ?? [],
            }))
          : null,
        trueFalseCorrectAnswer: q.trueFalseCorrectAnswer ?? null,
        trueFalseExplanation: q.trueFalseExplanation ?? null,
        matchingShuffleLeft: q.matchingShuffleLeft ?? null,
        matchingShuffleRight: q.matchingShuffleRight ?? null,
        matchingPairs: (q.matchingPairs ?? null) as any,
      })),
    );

    if (data.practice_mcq_options.length > 0) {
      await tx.insert(practiceMcqOptions).values(
        data.practice_mcq_options.map((o) => ({
          id: o.id,
          questionId: o.questionId,
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.explanation ?? null,
        })),
      );
    }

    if (data.practice_matching_pairs.length > 0) {
      await tx.insert(practiceMatchingPairs).values(
        data.practice_matching_pairs.map((p) => ({
          id: p.id,
          questionId: p.questionId,
          left: p.left,
          right: p.right,
          explanation: p.explanation ?? null,
        })),
      );
    }

    if (data.practice_system_design_charts.length > 0) {
      await tx.insert(practiceSystemDesignCharts).values(
        data.practice_system_design_charts.map((c) => ({
          id: c.id,
          questionId: c.questionId,
          chart: c.chart ?? [],
        })),
      );
    }
  });

  console.log("✅ Imported questions into practice library DB:", {
    questions: data.practice_questions.length,
    mcqOptions: data.practice_mcq_options.length,
    matchingPairs: data.practice_matching_pairs.length,
    systemDesignCharts: data.practice_system_design_charts.length,
  });
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
