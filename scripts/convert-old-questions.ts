/**
 * Convert Old Questions to New Format
 * Helper script to transform existing questions
 * Run: npx ts-node scripts/convert-old-questions.ts
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface OldQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyLogo: string;
  companySize: string[];
  primaryTechStack: string[];
  title: string;
  question: string;
  answer: string;
  topicTags: string[];
  seniorityLevel?: string[];
  companyName?: string;
}

type NewDifficulty = "entry" | "junior" | "middle" | "senior";
type QuestionType = "open" | "code" | "mcq" | "truefalse";

// ============================================================================
// Conversion Functions
// ============================================================================

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

function determineQuestionType(
  category: string,
  _tags: string[],
): QuestionType {
  // Code questions
  if (["algorithms", "data-structures"].includes(category)) {
    return "code";
  }

  // Everything else as open-ended for now
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
  // Split by sentences and take meaningful ones
  const sentences = answer
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 150);

  // Take up to 5 key points
  return sentences.slice(0, 5);
}

function estimateTimeFromDifficulty(
  difficulty: NewDifficulty,
  type: QuestionType,
): number {
  const baseTime = {
    entry: 5,
    junior: 10,
    middle: 15,
    senior: 20,
  };

  // Code questions take longer
  const multiplier = type === "code" ? 2 : 1;

  return baseTime[difficulty] * multiplier;
}

// ============================================================================
// Main Conversion Function
// ============================================================================

export function convertToNewFormat(oldQuestion: OldQuestion) {
  const difficulty = mapDifficulty(oldQuestion.difficulty);
  const type = determineQuestionType(
    oldQuestion.category,
    oldQuestion.topicTags,
  );
  const topic = mapTopic(oldQuestion.category);
  const keyPoints = extractKeyPoints(oldQuestion.answer);

  // Base question structure
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
    estimatedTimeMinutes: estimateTimeFromDifficulty(difficulty, type),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  // Add type-specific data
  if (type === "code") {
    return {
      ...baseQuestion,
      data: {
        language: oldQuestion.primaryTechStack?.[0] || "javascript",
        starterCode: `function solution(input) {\n  // Your code here\n  \n  return result;\n}`,
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
            expectedOutput: "Edge case output",
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
      },
    };
  }

  // Default to open-ended
  return {
    ...baseQuestion,
    data: {
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
    },
  };
}

// ============================================================================
// Batch Conversion
// ============================================================================

export function convertBatch(oldQuestions: OldQuestion[]) {
  console.log(`🔄 Converting ${oldQuestions.length} questions...\n`);

  const converted = oldQuestions
    .map((q, index) => {
      try {
        const newQuestion = convertToNewFormat(q);

        if ((index + 1) % 10 === 0) {
          console.log(`   Converted ${index + 1}/${oldQuestions.length}`);
        }

        return newQuestion;
      } catch (error) {
        console.error(`❌ Error converting question "${q.title}":`, error);
        return null;
      }
    })
    .filter(Boolean);

  console.log(`\n✅ Successfully converted ${converted.length} questions`);

  // Print summary
  const typeBreakdown = converted.reduce(
    (acc, q) => {
      if (q) {
        acc[q.type] = (acc[q.type] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(`\n📊 Type Breakdown:`);
  Object.entries(typeBreakdown).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  return converted;
}

// ============================================================================
// Example Usage
// ============================================================================

if (require.main === module) {
  // Example: Convert questions from seed-interview-questions-2.ts
  console.log("💡 This is a helper module for converting questions.");
  console.log("   Import it in your seeding script:\n");
  console.log(
    "   import { convertToNewFormat, convertBatch } from './convert-old-questions';\n",
  );
  console.log("   const newQuestions = convertBatch(oldQuestions);\n");
}
