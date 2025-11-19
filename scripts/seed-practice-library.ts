import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/practice-library-db/schema";

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

  const difficulties: Array<"entry" | "junior" | "middle" | "senior"> = [
    "entry",
    "junior",
    "middle",
    "senior",
  ];

  const questionTypes: Array<
    "mcq" | "open" | "matching" | "truefalse" | "system-design"
  > = ["mcq", "open", "matching", "truefalse", "system-design"];

  const companyTypes: Array<"faang" | "startup" | "enterprise"> = [
    "faang",
    "startup",
    "enterprise",
  ];

  const practiceQuestions: Array<typeof schema.practiceQuestions.$inferInsert> = [];
  const mcqOptions: Array<typeof schema.practiceMcqOptions.$inferInsert> = [];
  const matchingPairs: Array<typeof schema.practiceMatchingPairs.$inferInsert> = [];
  const systemDesignCharts: Array<
    typeof schema.practiceSystemDesignCharts.$inferInsert
  > = [];

  for (let i = 1; i <= 50; i++) {
    const id = `seed-q-${i}-${randomUUID()}`;
    const type = questionTypes[(i - 1) % questionTypes.length];
    const difficulty = difficulties[(i - 1) % difficulties.length];
    const companyType = companyTypes[(i - 1) % companyTypes.length];

    const topic =
      type === "system-design" ? "System Design" : "General Programming";

    const baseQuestion: typeof schema.practiceQuestions.$inferInsert = {
      id,
      type,
      difficulty,
      status: "published",
      isDemoMode: i <= 5,
      companyType,
      title: `Seed ${type} question #${i}`,
      description: `Seeded ${type} question for the practice library (difficulty: ${difficulty}).`,
      prompt: `You are solving a seeded ${type} practice question #${i}. Provide a clear, concise answer suitable for an interview.

Question:
Explain the core idea behind this ${type} scenario and common pitfalls to avoid.`,
      topic,
      subtopics:
        type === "system-design"
          ? ["architecture", "scalability"]
          : ["fundamentals"],
      tags: [type, difficulty, "seed"],
      estimatedTimeMinutes: type === "system-design" ? 30 : 10,
      aiEvaluationHint:
        type === "system-design"
          ? "Focus on tradeoffs, bottlenecks, and scalability."
          : "Reward clear structure, correctness, and practical examples.",
      companies: [
        {
          name: "Acme Corp",
          logo: "SiBuilding",
          size: [companyType],
          description: "Sample company for seeded practice questions.",
        },
      ],
      positions: ["Software Engineer"],
      primaryTechStack:
        type === "system-design"
          ? ["nodejs", "postgres", "redis"]
          : ["typescript", "react"],
      interviewTypes: ["practice"],
      seniorityLevels:
        difficulty === "entry" ? ["entry"] : ["junior", "mid", "senior"],
      createdAt: now,
      updatedAt: now,
      createdBy: "practice-db-seed-script",
    };

    if (type === "open") {
      baseQuestion.openReferenceAnswers = [
        {
          id: "ref-1",
          text: "A clear, structured explanation covering the main idea, key tradeoffs, and at least one concrete example.",
          weight: 1,
          keyPoints: [
            "core concept explained",
            "tradeoffs mentioned",
            "example provided",
          ],
        },
      ];
    }

    if (type === "matching") {
      baseQuestion.matchingShuffleLeft = true;
      baseQuestion.matchingShuffleRight = true;

      const pairCount = 3;
      for (let j = 1; j <= pairCount; j++) {
        const pairId = `match-${id}-${j}`;
        matchingPairs.push({
          id: pairId,
          questionId: id,
          left: `Concept ${j}`,
          right: `Definition ${j}`,
          explanation: `Explanation for why Concept ${j} maps to Definition ${j}.`,
        });
      }
    }

    if (type === "truefalse") {
      baseQuestion.trueFalseCorrectAnswer = i % 2 === 0;
      baseQuestion.trueFalseExplanation =
        "This is a seeded true/false question used for practice. The explanation clarifies why the statement is correct or incorrect.";
    }

    if (type === "mcq") {
      const optionCount = 4;
      const correctIndex = (i - 1) % optionCount;

      for (let j = 0; j < optionCount; j++) {
        const optionId = `mcq-${id}-${j + 1}`;
        mcqOptions.push({
          id: optionId,
          questionId: id,
          text: `Option ${j + 1} for question #${i}`,
          isCorrect: j === correctIndex,
          explanation: `Seeded explanation for why option ${j + 1
            } is ${j === correctIndex ? "correct" : "incorrect"}.`,
        });
      }
    }

    if (type === "system-design") {
      const chart = {
        nodes: [
          { id: "client", label: "Client" },
          { id: "api", label: "API Gateway" },
          { id: "service", label: "Application Service" },
          { id: "db", label: "Database" },
          { id: "cache", label: "Cache" },
        ],
        edges: [
          { from: "client", to: "api" },
          { from: "api", to: "service" },
          { from: "service", to: "db" },
          { from: "service", to: "cache" },
        ],
        description:
          "Simple seeded system design: client → API gateway → service → database/cache.",
      };

      systemDesignCharts.push({
        id: `chart-${id}`,
        questionId: id,
        chart,
      });
    }

    practiceQuestions.push(baseQuestion);
  }

  console.log("🌱 Seeding practice questions...");
  await db.insert(schema.practiceQuestions).values(practiceQuestions);
  console.log(`   Inserted ${practiceQuestions.length} questions`);

  if (mcqOptions.length > 0) {
    console.log("🌱 Seeding MCQ options...");
    await db.insert(schema.practiceMcqOptions).values(mcqOptions);
    console.log(`   Inserted ${mcqOptions.length} MCQ options`);
  }

  if (matchingPairs.length > 0) {
    console.log("🌱 Seeding matching pairs...");
    await db.insert(schema.practiceMatchingPairs).values(matchingPairs);
    console.log(`   Inserted ${matchingPairs.length} matching pairs`);
  }

  if (systemDesignCharts.length > 0) {
    console.log("🌱 Seeding system design charts...");
    await db
      .insert(schema.practiceSystemDesignCharts)
      .values(systemDesignCharts);
    console.log(`   Inserted ${systemDesignCharts.length} system design charts`);
  }

  console.log("✅ Practice library seed complete.");

  await pool.end();
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
