/**
 * LLM Evaluation Prompt Templates
 * Version-controlled prompts for semantic answer evaluation
 */

import type {
  CodeQuestion,
  MatchingQuestion,
  MCQQuestion,
  OpenQuestion,
  Question,
  TrueFalseQuestion,
  UserAnswer,
} from "@/types/practice-question";

// ============================================================================
// Prompt Template Version
// ============================================================================

export const EVALUATION_VERSION = "1.0.0";

// ============================================================================
// System Prompts
// ============================================================================

const SYSTEM_PROMPT_BASE = `You are an expert technical interviewer and educator evaluating candidate responses to technical interview questions.

Your role is to:
1. Assess answers semantically, not just by keyword matching
2. Recognize correct concepts expressed in different ways
3. Provide constructive, actionable feedback
4. Be fair but rigorous in your evaluation
5. Consider the difficulty level and expected depth

Evaluation Principles:
- Focus on conceptual understanding over exact wording
- Recognize partial credit for partially correct answers
- Value clarity and structure in explanations
- Consider edge cases and real-world applicability
- Provide specific, actionable improvement suggestions`;

// ============================================================================
// Open-Ended Question Evaluation
// ============================================================================

export function getOpenQuestionPrompt(
  question: OpenQuestion,
  userAnswer: string,
): string {
  const referenceAnswersText = question.referenceAnswers
    .map(
      (ref, idx) =>
        `Reference Answer ${idx + 1} (Weight: ${ref.weight}):\n${ref.text}\n\nKey Points:\n${ref.keyPoints.map((kp) => `- ${kp}`).join("\n")}`,
    )
    .join("\n\n");

  return `${SYSTEM_PROMPT_BASE}

QUESTION DETAILS:
Difficulty: ${question.difficulty}
Topic: ${question.topic}
Estimated Time: ${question.estimatedTimeMinutes} minutes

QUESTION:
${question.prompt}

REFERENCE ANSWERS:
${referenceAnswersText}

EVALUATION CRITERIA (weights):
- Completeness: ${question.evaluationCriteria.completeness}
- Accuracy: ${question.evaluationCriteria.accuracy}
- Clarity: ${question.evaluationCriteria.clarity}
- Depth: ${question.evaluationCriteria.depth}

USER'S ANSWER:
${userAnswer}

EVALUATION TASK:
Evaluate the user's answer semantically against the reference answers and key points.

Provide your evaluation in the following JSON format:
{
  "score": <number between 0 and 1>,
  "reasoning": "<2-3 sentence explanation of the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "breakdown": {
    "completeness": <0-1>,
    "accuracy": <0-1>,
    "clarity": <0-1>,
    "depth": <0-1>,
    "coveredKeyPoints": ["<key point 1>", ...],
    "missedKeyPoints": ["<key point 1>", ...]
  }
}

SCORING GUIDELINES:
- 0.9-1.0: Excellent - Comprehensive, accurate, well-structured answer covering all key points
- 0.7-0.89: Good - Solid understanding with minor gaps or unclear explanations
- 0.5-0.69: Adequate - Basic understanding but missing important concepts or details
- 0.3-0.49: Needs Improvement - Significant gaps in understanding or accuracy
- 0.0-0.29: Insufficient - Major misunderstandings or very incomplete answer

Consider the difficulty level (${question.difficulty}) when scoring - expect more depth and nuance for senior-level questions.`;
}

// ============================================================================
// Code Question Evaluation
// ============================================================================

export function getCodeQuestionPrompt(
  question: CodeQuestion,
  userCode: string,
  testResults: Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }>,
): string {
  const testCasesText = question.testCases
    .filter((tc) => !tc.isHidden)
    .map(
      (tc, idx) =>
        `Test ${idx + 1}:\nInput: ${tc.input}\nExpected: ${tc.expectedOutput}`,
    )
    .join("\n\n");

  const testResultsText = testResults
    .map(
      (result, idx) =>
        `Test ${idx + 1}: ${result.passed ? "✓ PASSED" : "✗ FAILED"}\n` +
        `Input: ${result.input}\n` +
        `Expected: ${result.expected}\n` +
        `Actual: ${result.actual}`,
    )
    .join("\n\n");

  return `${SYSTEM_PROMPT_BASE}

QUESTION DETAILS:
Difficulty: ${question.difficulty}
Language: ${question.language}
Topic: ${question.topic}

PROBLEM STATEMENT:
${question.prompt}

TEST CASES:
${testCasesText}

USER'S CODE:
\`\`\`${question.language}
${userCode}
\`\`\`

TEST RESULTS:
${testResultsText}

EVALUATION CRITERIA (weights):
- Correctness: ${question.evaluationCriteria.correctness}
- Efficiency: ${question.evaluationCriteria.efficiency}
- Code Quality: ${question.evaluationCriteria.codeQuality}
- Edge Cases: ${question.evaluationCriteria.edgeCases}

EVALUATION TASK:
Evaluate the code solution considering:
1. Correctness: Does it solve the problem? Pass test cases?
2. Efficiency: Time and space complexity
3. Code Quality: Readability, naming, structure, best practices
4. Edge Cases: Handling of boundary conditions and special cases

Provide your evaluation in the following JSON format:
{
  "score": <number between 0 and 1>,
  "reasoning": "<2-3 sentence explanation of the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "breakdown": {
    "correctness": <0-1>,
    "efficiency": <0-1>,
    "codeQuality": <0-1>,
    "edgeCases": <0-1>,
    "passedTestCases": ${testResults.filter((r) => r.passed).length},
    "totalTestCases": ${testResults.length}
  }
}

SCORING GUIDELINES:
- Consider time/space complexity (O(n), O(n²), etc.)
- Evaluate code readability and maintainability
- Check for proper error handling
- Assess variable naming and code organization
- Consider the difficulty level (${question.difficulty})`;
}

// ============================================================================
// MCQ Evaluation (Deterministic with LLM Explanation)
// ============================================================================

export function getMCQExplanationPrompt(
  question: MCQQuestion,
  selectedOptionIds: string[],
  correctOptionIds: string[],
): string {
  const optionsText = question.options
    .map(
      (opt) =>
        `${opt.id}: ${opt.text} ${opt.isCorrect ? "[CORRECT]" : "[INCORRECT]"}${opt.explanation ? `\nExplanation: ${opt.explanation}` : ""}`,
    )
    .join("\n\n");

  const selectedOptions = question.options.filter((opt) =>
    selectedOptionIds.includes(opt.id),
  );
  const correctOptions = question.options.filter((opt) =>
    correctOptionIds.includes(opt.id),
  );

  return `${SYSTEM_PROMPT_BASE}

QUESTION:
${question.prompt}

OPTIONS:
${optionsText}

USER SELECTED: ${selectedOptions.map((o) => `${o.id}: ${o.text}`).join(", ")}
CORRECT ANSWERS: ${correctOptions.map((o) => `${o.id}: ${o.text}`).join(", ")}

TASK:
The score has been calculated deterministically. Provide educational feedback explaining:
1. Why the correct answers are correct
2. Why incorrect selections are wrong (if any)
3. What concepts the user should review

Provide your response in the following JSON format:
{
  "reasoning": "<explanation of correct/incorrect choices>",
  "strengths": ["<what they understood correctly>"],
  "weaknesses": ["<misconceptions or gaps>"],
  "suggestions": ["<specific topics to review>"]
}`;
}

// ============================================================================
// Matching Question Evaluation
// ============================================================================

export function getMatchingQuestionPrompt(
  question: MatchingQuestion,
  userMatches: Array<{ leftId: string; rightId: string }>,
): string {
  const correctPairsText = question.pairs
    .map(
      (pair) =>
        `${pair.left} → ${pair.right}${pair.explanation ? `\n  Explanation: ${pair.explanation}` : ""}`,
    )
    .join("\n");

  const userMatchesText = userMatches
    .map((match) => {
      const leftItem =
        question.pairs.find((p) => p.id === match.leftId)?.left || "Unknown";
      const rightItem =
        question.pairs.find((p) => p.id === match.rightId)?.right || "Unknown";
      return `${leftItem} → ${rightItem}`;
    })
    .join("\n");

  return `${SYSTEM_PROMPT_BASE}

QUESTION:
${question.prompt}

CORRECT MATCHES:
${correctPairsText}

USER'S MATCHES:
${userMatchesText}

TASK:
Evaluate the matching answers and provide educational feedback.

Provide your response in the following JSON format:
{
  "score": <number between 0 and 1>,
  "reasoning": "<explanation of correct/incorrect matches>",
  "strengths": ["<correct matches and understanding>"],
  "weaknesses": ["<incorrect matches and why>"],
  "suggestions": ["<concepts to review>"]
}`;
}

// ============================================================================
// True/False Evaluation
// ============================================================================

export function getTrueFalsePrompt(
  question: TrueFalseQuestion,
  userAnswer: boolean,
): string {
  return `${SYSTEM_PROMPT_BASE}

STATEMENT:
${question.prompt}

CORRECT ANSWER: ${question.correctAnswer}
USER'S ANSWER: ${userAnswer}

EXPLANATION:
${question.explanation}

TASK:
Provide educational feedback about this true/false question.

Provide your response in the following JSON format:
{
  "reasoning": "<explanation of why the statement is true/false>",
  "strengths": ["<if correct, what they understood>"],
  "weaknesses": ["<if incorrect, what they misunderstood>"],
  "suggestions": ["<concepts to review or deepen understanding>"]
}`;
}

// ============================================================================
// Prompt Builder Functions
// ============================================================================

export function buildEvaluationPrompt(
  question: Question,
  userAnswer: UserAnswer,
  additionalContext?: {
    testResults?: Array<{
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }>;
  },
): string {
  switch (question.type) {
    case "open":
      return getOpenQuestionPrompt(question, (userAnswer as any).answerText);

    case "code":
      return getCodeQuestionPrompt(
        question,
        (userAnswer as any).code,
        additionalContext?.testResults || [],
      );

    case "mcq": {
      const selectedIds = (userAnswer as any).selectedOptionIds;
      const correctIds = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);
      return getMCQExplanationPrompt(question, selectedIds, correctIds);
    }

    case "matching":
      return getMatchingQuestionPrompt(question, (userAnswer as any).matches);

    case "truefalse":
      return getTrueFalsePrompt(question, (userAnswer as any).answer);

    default:
      throw new Error(`Unsupported question type: ${(question as any).type}`);
  }
}

// ============================================================================
// Response Parser
// ============================================================================

export interface ParsedEvaluationResponse {
  score: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  breakdown: any;
}

export function parseEvaluationResponse(
  responseText: string,
): ParsedEvaluationResponse {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch =
      responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (
      typeof parsed.score !== "number" ||
      parsed.score < 0 ||
      parsed.score > 1
    ) {
      throw new Error("Invalid score value");
    }

    return {
      score: parsed.score,
      reasoning: parsed.reasoning || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      breakdown: parsed.breakdown || {},
    };
  } catch (error) {
    console.error("Failed to parse evaluation response:", error);
    throw new Error(`Failed to parse LLM response: ${error}`);
  }
}
