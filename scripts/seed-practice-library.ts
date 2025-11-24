import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/practice-library-db/schema";
import {
  generateComprehensiveQuestions,
  type PracticeQuestion as GeneratedPracticeQuestion,
} from "./generate-comprehensive-questions";
import { convertToNewFormat } from "./convert-old-questions";

// TO RUN:
// export PRACTICE_LIBRARY_DATABASE_URL="your_database_url"
// pnpm exec ts-node --project scripts/tsconfig.json scripts/seed-practice-library.ts

async function main() {
  const connectionString = process.env.PRACTICE_LIBRARY_DATABASE_URL;

  if (!connectionString) {
    throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const now = new Date();
  const generatedQuestions = generateComprehensiveQuestions();

  const practiceQuestions: Array<typeof schema.practiceQuestions.$inferInsert> =
    [];

  generatedQuestions.forEach(
    (question: GeneratedPracticeQuestion, index: number) => {
      const converted = convertToNewFormat(question as any) as any;

      if (converted.type !== "open") {
        return;
      }

      const id = `role-${question.position ?? "general"}-${question.companyLogo}-${index}`;

      const companyType = mapCompanyType(question.companySize);

      const companies =
        question.companyName || question.companyLogo
          ? [
              {
                name: question.companyName ?? "Unknown",
                logo: question.companyLogo,
                size: question.companySize,
                description: `Generated question for ${
                  question.companyName ?? "this company"
                } (${question.companyLogo}).`,
              },
            ]
          : null;

      const seniorityLevels =
        question.seniorityLevel && question.seniorityLevel.length > 0
          ? question.seniorityLevel
          : ["entry", "junior", "mid", "senior"];

      practiceQuestions.push({
        id,
        type: "open",
        difficulty: converted.difficulty,
        status: converted.status,
        isDemoMode: false,
        companyType,
        title: converted.title,
        description: converted.description,
        prompt: converted.prompt,
        topic: converted.topic,
        subtopics: converted.subtopics ?? [],
        tags: converted.tags ?? [],
        estimatedTimeMinutes: converted.estimatedTimeMinutes ?? 10,
        aiEvaluationHint: buildAiEvaluationHint(converted.topic, converted.difficulty),
        companies,
        positions: question.position ? [question.position] : [],
        primaryTechStack: question.primaryTechStack ?? [],
        interviewTypes: ["practice"],
        seniorityLevels,
        createdAt: now,
        updatedAt: now,
        createdBy: "practice-db-role-based-generator",
        openReferenceAnswers:
          converted.data?.referenceAnswers &&
          converted.data.referenceAnswers.length > 0
            ? converted.data.referenceAnswers
            : null,
      });
    },
  );

  console.log("🌱 Seeding practice questions from generated role-based data...");
  await db.insert(schema.practiceQuestions).values(practiceQuestions);
  console.log(`   Inserted ${practiceQuestions.length} questions`);

  console.log("✅ Practice library seed complete.");

  await pool.end();
}

function mapCompanyType(sizes: string[] | undefined): "faang" | "startup" | "enterprise" {
  if (!sizes || sizes.length === 0) return "startup";

  if (sizes.includes("faang")) return "faang";

  if (
    sizes.includes("enterprise") ||
    sizes.includes("data") ||
    sizes.includes("hardware") ||
    sizes.includes("automotive") ||
    sizes.includes("telecom")
  ) {
    return "enterprise";
  }

  if (sizes.includes("unicorn")) return "startup";

  return "startup";
}

function buildAiEvaluationHint(topic: string, difficulty: string): string {
  const base = `Evaluate depth, correctness, and clarity for a ${difficulty}-level ${topic} question.`;

  if (topic === "System Design") {
    return `${base} Pay attention to tradeoffs, bottlenecks, and realistic capacity planning.`;
  }

  if (topic === "Frontend Development") {
    return `${base} Reward accessibility, performance considerations, and good state management.`;
  }

  if (topic === "Backend Development") {
    return `${base} Reward understanding of data modeling, APIs, and failure handling.`;
  }

  if (topic === "Behavioral") {
    return `${base} Reward concrete STAR stories, ownership, and learning.`;
  }

  return base;
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
