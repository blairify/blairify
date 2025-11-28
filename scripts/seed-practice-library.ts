import { config as loadEnv } from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";export {};
loadEnv({ path: path.resolve(__dirname, "..", ".env") });

// ---------------------
// Types for output JSON
// ---------------------

interface PracticeQuestion {
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
  companies:
    | {
        name: string;
        logo: string;
        size?: string[];
        description: string;
      }[]
    | null;
  positions: string[];
  primaryTechStack: string[];
  interviewTypes: string[];
  seniorityLevels: string[];
  trueFalseCorrectAnswer: boolean | null;
  trueFalseExplanation: string | null;
  matchingShuffleLeft: boolean | null;
  matchingShuffleRight: boolean | null;
  matchingPairs:
    | {
        left: string;
        right: string;
        explanation?: string | null;
      }[]
    | null;
  openReferenceAnswers:
    | {
        id: string;
        text: string;
        weight: number;
      }[]
    | null;
  createdBy: string;
}

interface MCQOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface MatchingPair {
  id: string;
  questionId: string;
  left: string;
  right: string;
  explanation: string | null;
}

interface SystemDesignChart {
  id: string;
  questionId: string;
  chart: any[];
}

interface BatchOutput {
  practice_questions: PracticeQuestion[];
  practice_mcq_options: MCQOption[];
  practice_matching_pairs: MatchingPair[];
  practice_system_design_charts: SystemDesignChart[];
}

// ---------------------
// Script configuration
// ---------------------

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const TOTAL = 10;
const BATCH_SIZE = 10;
const OUT = "./questions_output.json";

const SCHEMA_PATH = path.resolve(
  __dirname,
  "../src/practice-library-db/schema.txt",
);
const PROMPT_TEMPLATE_PATH = path.resolve(
  __dirname,
  "../src/practice-library-db/prompt.txt",
);

const SCHEMA = fs.readFileSync(SCHEMA_PATH, "utf8");
const PROMPT_TEMPLATE = fs.readFileSync(PROMPT_TEMPLATE_PATH, "utf8");

let accumulator: BatchOutput = {
  practice_questions: [],
  practice_mcq_options: [],
  practice_matching_pairs: [],
  practice_system_design_charts: [],
};

// ---------------------
// Helper functions
// ---------------------

function applyTemplate(schema: string, batchSize: number) {
  return PROMPT_TEMPLATE.replace("{{SCHEMA}}", schema).replace(/{{BATCH_SIZE}}/g, String(batchSize));
}

async function generateBatch(batchNumber: number): Promise<void> {
  const prompt = applyTemplate(SCHEMA, BATCH_SIZE);

  const res = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 10000,
  });

  let text = res.choices[0].message.content ?? "";

  // Ensure clean JSON block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  text = text.slice(start, end + 1);

  let json: BatchOutput;

  try {
    json = JSON.parse(text);
    console.log(`✓ Batch ${batchNumber}: ${json.practice_questions.length} questions generated`);
  } catch (err) {
    console.error(`❌ Failed to parse JSON for batch ${batchNumber}`);
    console.error("Raw model output:");
    console.error(text);
    throw err;
  }

  // Merge into master list
  accumulator.practice_questions.push(...json.practice_questions);
  accumulator.practice_mcq_options.push(...json.practice_mcq_options);
  accumulator.practice_matching_pairs.push(...json.practice_matching_pairs);
  accumulator.practice_system_design_charts.push(...json.practice_system_design_charts);

  fs.writeFileSync(OUT, JSON.stringify(accumulator, null, 2));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------
// Main runner
// ---------------------

async function main() {
  const batches = TOTAL / BATCH_SIZE;

  console.log(`🚀 Generating ${TOTAL} questions in ${batches} batches...`);

  for (let i = 1; i <= batches; i++) {
    console.log(`\n🟦 Running batch ${i}/${batches}`);
    await generateBatch(i);

    // Basic anti-rate-limit pause
    await sleep(1200);
  }

  console.log("\n🎉 Done!");
  console.log(`Saved final output to: ${OUT}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
