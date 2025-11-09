/**
 * Seed ALL Questions - Complete Migration
 * Imports from seed-interview-questions-2.ts and converts to new format
 * Run: npx ts-node scripts/seed-all-questions.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { allQuestions as oldQuestions } from "./questions-data-only";

// ============================================================================
// Firebase Setup
// ============================================================================

let serviceAccount: any;
try {
  const serviceAccountPath = join(
    process.cwd(),
    "scripts",
    "serviceAccounts.json",
  );
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (_error) {
  console.error("❌ Error loading service account");
  process.exit(1);
}

// Initialize Firebase only if not already initialized
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// ============================================================================
// Conversion Functions
// ============================================================================

type NewDifficulty = "entry" | "junior" | "middle" | "senior";
type QuestionType = "open" | "code";

function mapDifficulty(
  oldDifficulty: "easy" | "medium" | "hard",
): NewDifficulty {
  const mapping = {
    easy: "entry" as NewDifficulty,
    medium: "junior" as NewDifficulty,
    hard: "middle" as NewDifficulty,
  };
  return mapping[oldDifficulty];
}

function determineQuestionType(category: string): QuestionType {
  // Code questions for algorithms and data structures
  if (["algorithms", "data-structures"].includes(category)) {
    return "code";
  }
  // Everything else as open-ended
  return "open";
}

function mapTopic(category: string): string {
  const topicMap: Record<string, string> = {
    algorithms: "Algorithms & Data Structures",
    "data-structures": "Algorithms & Data Structures",
    frontend: "Frontend Development",
    react: "Frontend Development",
    javascript: "Frontend Development",
    backend: "Backend Development",
    "system-design": "System Design",
    database: "Database Design",
    security: "Security",
    testing: "Testing & QA",
    performance: "Performance Optimization",
    devops: "DevOps & Infrastructure",
  };
  return topicMap[category] || "General Programming";
}

function extractKeyPoints(answer: string): string[] {
  const sentences = answer
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 150);
  return sentences.slice(0, 5);
}

function estimateTime(difficulty: NewDifficulty, type: QuestionType): number {
  const baseTime = { entry: 5, junior: 10, middle: 15, senior: 20 };
  const multiplier = type === "code" ? 2 : 1;
  return baseTime[difficulty] * multiplier;
}

function convertToNewFormat(oldQuestion: any) {
  const difficulty = mapDifficulty(oldQuestion.difficulty);
  const type = determineQuestionType(oldQuestion.category);
  const topic = mapTopic(oldQuestion.category);
  const keyPoints = extractKeyPoints(oldQuestion.answer);

  const baseQuestion: any = {
    type,
    difficulty,
    status: "published" as const,
    title: oldQuestion.title,
    description: `${difficulty}-level ${topic.toLowerCase()} question`,
    prompt: oldQuestion.question,
    topic,
    subtopics: oldQuestion.topicTags.slice(0, 3),
    tags: oldQuestion.topicTags,
    estimatedTimeMinutes: estimateTime(difficulty, type),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: "migration-script",
    stats: { attemptCount: 0, averageScore: 0, averageTimeSeconds: 0 },
  };

  // Convert company data to new structure (supports multiple companies)
  if (oldQuestion.companyName || oldQuestion.companyLogo) {
    baseQuestion.companies = [
      {
        name: oldQuestion.companyName || "Unknown",
        logo: oldQuestion.companyLogo || "SiBuilding",
        size: oldQuestion.companySize,
      },
    ];
  }

  // Add tech stack if present
  if (oldQuestion.primaryTechStack && oldQuestion.primaryTechStack.length > 0) {
    baseQuestion.primaryTechStack = oldQuestion.primaryTechStack;
  }

  // Map seniority levels to interview integration
  if (oldQuestion.seniorityLevel && oldQuestion.seniorityLevel.length > 0) {
    baseQuestion.seniorityLevels = oldQuestion.seniorityLevel.map(
      (level: string) => {
        if (level === "mid") return "mid";
        if (level === "senior") return "senior";
        if (level === "junior") return "junior";
        return "entry";
      },
    );
  }

  // Infer interview types from category
  const interviewTypeMap: Record<
    string,
    Array<"technical" | "bullet" | "coding" | "system-design">
  > = {
    algorithms: ["coding", "technical"],
    "data-structures": ["coding", "technical"],
    "system-design": ["system-design", "technical"],
    frontend: ["technical", "coding"],
    backend: ["technical", "coding"],
    database: ["technical"],
    security: ["technical"],
    devops: ["technical"],
  };

  if (oldQuestion.category && interviewTypeMap[oldQuestion.category]) {
    baseQuestion.interviewTypes = interviewTypeMap[oldQuestion.category];
  }

  if (type === "code") {
    return {
      ...baseQuestion,
      language: oldQuestion.primaryTechStack?.[0] || "javascript",
      starterCode: `function solution(input) {\n  // Your code here\n  \n  return result;\n}`,
      // Store the answer for code questions too (for flashcard display)
      referenceAnswers: [
        {
          id: "ref-1",
          text: oldQuestion.answer,
          weight: 1.0,
          keyPoints,
        },
      ],
      testCases: [
        {
          id: "test-1",
          input: "Sample input",
          expectedOutput: "Expected output",
          isHidden: false,
          weight: 0.5,
        },
        {
          id: "test-2",
          input: "Edge case",
          expectedOutput: "Edge output",
          isHidden: false,
          weight: 0.3,
        },
        {
          id: "test-3",
          input: "Hidden test",
          expectedOutput: "Hidden output",
          isHidden: true,
          weight: 0.2,
        },
      ],
      evaluationCriteria: {
        correctness: 0.5,
        efficiency: 0.2,
        codeQuality: 0.2,
        edgeCases: 0.1,
      },
    };
  }

  return {
    ...baseQuestion,
    referenceAnswers: [
      {
        id: "ref-1",
        text: oldQuestion.answer,
        weight: 1.0,
        keyPoints,
      },
    ],
    minWords: difficulty === "entry" ? 50 : 100,
    maxWords: difficulty === "senior" ? 500 : 300,
    evaluationCriteria: {
      completeness: 0.3,
      accuracy: 0.4,
      clarity: 0.2,
      depth: 0.1,
    },
  };
}

// ============================================================================
// Main Seeding Function
// ============================================================================

async function seedAllQuestions() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   COMPLETE MIGRATION - All Questions               ║");
  console.log("║   Converting & Seeding to New Schema               ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  if (oldQuestions.length === 0) {
    console.error("❌ No questions found to seed");
    process.exit(1);
  }

  // Convert all questions
  console.log("🔄 Converting questions to new format...\n");
  const convertedQuestions = [];
  let errors = 0;

  for (let i = 0; i < oldQuestions.length; i++) {
    try {
      const converted = convertToNewFormat(oldQuestions[i]);
      convertedQuestions.push(converted);

      if ((i + 1) % 20 === 0) {
        console.log(`   Converted ${i + 1}/${oldQuestions.length} questions`);
      }
    } catch (error) {
      console.error(
        `   ❌ Error converting question "${oldQuestions[i].title}":`,
        error,
      );
      errors++;
    }
  }

  console.log(
    `\n✅ Converted ${convertedQuestions.length} questions successfully`,
  );
  if (errors > 0) {
    console.log(`⚠️  ${errors} questions failed to convert\n`);
  }

  // Print conversion summary
  const typeBreakdown = convertedQuestions.reduce(
    (acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(`\n📊 Question Type Breakdown:`);
  Object.entries(typeBreakdown).forEach(([type, count]) => {
    const countNum = count as number;
    console.log(
      `   ${type}: ${countNum} (${Math.round((countNum / convertedQuestions.length) * 100)}%)`,
    );
  });

  const difficultyBreakdown = convertedQuestions.reduce(
    (acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(`\n📈 Difficulty Breakdown:`);
  Object.entries(difficultyBreakdown).forEach(([diff, count]) => {
    const countNum = count as number;
    console.log(
      `   ${diff}: ${countNum} (${Math.round((countNum / convertedQuestions.length) * 100)}%)`,
    );
  });

  // Seed to Firestore
  console.log(`\n🌱 Seeding to Firestore...\n`);

  const BATCH_SIZE = 500;
  let totalSeeded = 0;

  for (let i = 0; i < convertedQuestions.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = convertedQuestions.slice(i, i + BATCH_SIZE);

    for (const question of chunk) {
      const docRef = db.collection("practice_questions").doc();
      batch.set(docRef, question);
    }

    await batch.commit();
    totalSeeded += chunk.length;

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(convertedQuestions.length / BATCH_SIZE);
    console.log(
      `✅ Batch ${batchNum}/${totalBatches}: Seeded ${chunk.length} questions`,
    );
    console.log(
      `   Progress: ${totalSeeded}/${convertedQuestions.length} (${Math.round((totalSeeded / convertedQuestions.length) * 100)}%)\n`,
    );
  }

  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   🎉 MIGRATION COMPLETE!                           ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  console.log(`📈 Final Summary:`);
  console.log(`   Total questions seeded: ${totalSeeded}`);
  console.log(`   Collection: practice_questions`);
  console.log(`   Status: All questions published\n`);

  console.log(`📋 Next Steps:`);
  console.log(`   1. ✅ Verify in Firestore Console`);
  console.log(`   2. ✅ Test with QuestionDisplay component`);
  console.log(`   3. ✅ Try LLM evaluation`);
  console.log(`   4. ✅ Monitor costs and performance\n`);
}

// ============================================================================
// Clear Existing (Optional)
// ============================================================================

async function clearExisting() {
  console.log("🗑️  Clearing existing questions...\n");

  const snapshot = await db.collection("practice_questions").get();

  if (snapshot.empty) {
    console.log("   No existing questions to clear.\n");
    return;
  }

  console.log(`   Found ${snapshot.size} existing questions`);

  // Delete in batches
  const BATCH_SIZE = 500;
  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = snapshot.docs.slice(i, i + BATCH_SIZE);

    for (const doc of chunk) {
      batch.delete(doc.ref);
    }
    await batch.commit();

    console.log(`   Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}`);
  }

  console.log(`   ✅ Cleared ${snapshot.size} questions\n`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes("--clear");

  if (shouldClear) {
    await clearExisting();
  }

  await seedAllQuestions();

  console.log("✨ Done! Your practice library is fully migrated.\n");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
