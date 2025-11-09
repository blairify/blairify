/**
 * Extract questions from seed files without running Firebase init
 * This is a workaround to avoid Firebase initialization conflicts
 */

const fs = require("node:fs");
const path = require("node:path");

// Read both seed files
const file1 = fs.readFileSync(
  path.join(__dirname, "seed-interview-questions.ts"),
  "utf8",
);
const file2 = fs.readFileSync(
  path.join(__dirname, "seed-interview-questions-2.ts"),
  "utf8",
);

// Extract questions array from each file using regex
function extractQuestions(content) {
  // Find the questions array
  const match = content.match(
    /export const questions.*?=\s*\[([\s\S]*?)\];[\s\S]*?(?:async function|const questionsRef)/,
  );
  if (!match) {
    console.error("Could not find questions array");
    return null;
  }
  return match[1];
}

const questions1Data = extractQuestions(file1);
const questions2Data = extractQuestions(file2);

if (!questions1Data || !questions2Data) {
  console.error("Failed to extract questions");
  process.exit(1);
}

// Create a new TypeScript file with just the data
const output = `/**
 * All Questions Data - Extracted from seed files
 * Auto-generated - do not edit manually
 */

interface PracticeQuestion {
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

export const questions1: PracticeQuestion[] = [
${questions1Data}
];

export const questions2: PracticeQuestion[] = [
${questions2Data}
];

export const allQuestions = [...questions1, ...questions2];
`;

fs.writeFileSync(path.join(__dirname, "questions-data-only.ts"), output);
console.log("✅ Extracted questions to questions-data-only.ts");
console.log(
  `   File 1: ${(questions1Data.match(/\{/g) || []).length} questions`,
);
console.log(
  `   File 2: ${(questions2Data.match(/\{/g) || []).length} questions`,
);
