import { config as loadEnv } from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";export {};
loadEnv({ path: path.resolve(__dirname, "..", ".env") });

// ---------------------
// Types for output JSON (v2, 5 arrays)
// ---------------------

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
  status: "draft" | "published" | "archived";
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

interface McqQuestion extends JsonCoreQuestion {
  correctAnswerText: string;
}

interface OpenQuestion extends JsonCoreQuestion {
  referenceAnswers: JsonReferenceAnswer[] | null;
}

interface TrueFalseQuestion extends JsonCoreQuestion {
  correctAnswer: boolean;
  explanation: string;
  trickinessLevel: number | null;
}

interface MatchingQuestion extends JsonCoreQuestion {
  shuffleLeft: boolean | null;
  shuffleRight: boolean | null;
  minPairs: number | null;
  maxPairs: number | null;
  pairs: JsonMatchingPair[] | null;
}

interface SystemDesignQuestion extends JsonCoreQuestion {
  complexityLevel: "entry" | "junior" | "middle" | "senior" | null;
  nonFunctionalRequirements: string[];
  constraints: string[];
  scalingFocus: string | null;
  hints: string[];
  charts: JsonSystemDesignChart[] | null;
}

interface BatchOutput {
  mcq_questions: McqQuestion[];
  open_questions: OpenQuestion[];
  truefalse_questions: TrueFalseQuestion[];
  matching_questions: MatchingQuestion[];
  system_design_questions: SystemDesignQuestion[];
}

// ---------------------
// Script configuration
// ---------------------

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const TOTAL = 30;
const BATCH_SIZE = 30;
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
  mcq_questions: [],
  open_questions: [],
  truefalse_questions: [],
  matching_questions: [],
  system_design_questions: [],
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
    const totalQuestions =
      json.mcq_questions.length +
      json.open_questions.length +
      json.truefalse_questions.length +
      json.matching_questions.length +
      json.system_design_questions.length;
    console.log(`✓ Batch ${batchNumber}: ${totalQuestions} questions generated`);
  } catch (err) {
    console.error(`❌ Failed to parse JSON for batch ${batchNumber}`);
    console.error("Raw model output:");
    console.error(text);
    throw err;
  }

  // Merge into master list
  accumulator.mcq_questions.push(...json.mcq_questions);
  accumulator.open_questions.push(...json.open_questions);
  accumulator.truefalse_questions.push(...json.truefalse_questions);
  accumulator.matching_questions.push(...json.matching_questions);
  accumulator.system_design_questions.push(...json.system_design_questions);

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
