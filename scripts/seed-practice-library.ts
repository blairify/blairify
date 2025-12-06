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

const ROLE_TOPICS = [
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "mobile",
  "data-engineer",
  "data-scientist",
  "cybersecurity",
  "product",
] as const;

const QUESTIONS_PER_ROLE = 10;
const BATCH_SIZE = QUESTIONS_PER_ROLE;
const TOTAL = ROLE_TOPICS.length * QUESTIONS_PER_ROLE;
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

const seenQuestionKeys = new Set<string>();

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function questionKey(q: JsonCoreQuestion): string {
  return `${normalizeText(q.topic)}::${normalizeText(q.title)}`;
}

function dedupeQuestions<T extends JsonCoreQuestion>(items: T[]): T[] {
  const result: T[] = [];

  for (const item of items) {
    const key = questionKey(item);
    if (seenQuestionKeys.has(key)) continue;
    seenQuestionKeys.add(key);
    result.push(item);
  }

  return result;
}

// ---------------------
// Helper functions
// ---------------------

function applyTemplate(schema: string, batchSize: number, roleTopic: string) {
  return PROMPT_TEMPLATE.replace("{{SCHEMA}}", schema)
    .replace(/{{BATCH_SIZE}}/g, String(batchSize))
    .replace(/{{ROLE_TOPIC}}/g, roleTopic);
}

async function generateBatch(
  batchNumber: number,
  roleTopic: (typeof ROLE_TOPICS)[number],
): Promise<void> {
  const prompt = applyTemplate(SCHEMA, BATCH_SIZE, roleTopic);

  const res = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_completion_tokens: 10000,
  });

  let text = res.choices[0].message.content ?? "";

  // Ensure clean JSON block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  text = text.slice(start, end + 1);

  let json: BatchOutput;

  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error(`❌ Failed to parse JSON for batch ${batchNumber}`);
    console.error("Raw model output:");
    console.error(text);
    throw err;
  }

  const mcq = dedupeQuestions(json.mcq_questions);
  const open = dedupeQuestions(json.open_questions);
  const tf = dedupeQuestions(json.truefalse_questions);
  const matching = dedupeQuestions(json.matching_questions);
  const systemDesign = dedupeQuestions(json.system_design_questions);

  const totalQuestions =
    mcq.length + open.length + tf.length + matching.length + systemDesign.length;

  console.log(
    `✓ Batch ${batchNumber}: ${totalQuestions} questions generated (after dedupe)`,
  );

  // Merge into master list
  accumulator.mcq_questions.push(...mcq);
  accumulator.open_questions.push(...open);
  accumulator.truefalse_questions.push(...tf);
  accumulator.matching_questions.push(...matching);
  accumulator.system_design_questions.push(...systemDesign);

  fs.writeFileSync(OUT, JSON.stringify(accumulator, null, 2));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------
// Main runner
// ---------------------

async function main() {
  const batches = ROLE_TOPICS.length;

  console.log(
    `🚀 Generating ${TOTAL} questions (${QUESTIONS_PER_ROLE} per role) in ${batches} batches...`,
  );

  for (let i = 0; i < batches; i++) {
    const roleTopic = ROLE_TOPICS[i];
    console.log(`\n🟦 Running batch ${i + 1}/${batches} for topic "${roleTopic}"`);
    await generateBatch(i + 1, roleTopic);

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
