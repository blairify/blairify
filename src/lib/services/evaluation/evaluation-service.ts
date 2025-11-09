/**
 * Evaluation Service
 * Handles semantic evaluation of user answers using LLM
 */

import type {
  EvaluationBreakdown,
  EvaluationResult,
  MCQQuestion,
  Question,
  UserAnswer,
} from "@/types/practice-question";
import {
  buildEvaluationPrompt,
  EVALUATION_VERSION,
  parseEvaluationResponse,
} from "./evaluation-prompts";

// ============================================================================
// Configuration
// ============================================================================

interface EvaluationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

const DEFAULT_CONFIG: Partial<EvaluationConfig> = {
  model: "gpt-4-turbo-preview",
  temperature: 0.3, // Low temperature for consistent evaluation
  maxTokens: 1500,
};

// ============================================================================
// LLM Client Interface
// ============================================================================

interface LLMResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}

async function callLLM(
  prompt: string,
  config: EvaluationConfig,
): Promise<LLMResponse> {
  // This is a generic interface - implement with your preferred LLM provider
  // Examples: OpenAI, Anthropic, Azure OpenAI, etc.

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `LLM API error: ${error.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens,
    },
    model: data.model,
  };
}

// ============================================================================
// Deterministic Evaluation Functions
// ============================================================================

/**
 * Evaluate MCQ deterministically (no LLM needed for scoring)
 */
function evaluateMCQ(
  question: MCQQuestion,
  selectedOptionIds: string[],
): { score: number; breakdown: any } {
  const correctOptionIds = question.options
    .filter((opt) => opt.isCorrect)
    .map((opt) => opt.id);

  const correctSelections = selectedOptionIds.filter((id) =>
    correctOptionIds.includes(id),
  );
  const incorrectSelections = selectedOptionIds.filter(
    (id) => !correctOptionIds.includes(id),
  );
  const missedCorrectOptions = correctOptionIds.filter(
    (id) => !selectedOptionIds.includes(id),
  );

  // Calculate score
  let score = 0;
  if (question.allowMultipleAnswers) {
    // Partial credit for multiple choice
    const correctWeight = correctSelections.length / correctOptionIds.length;
    const incorrectPenalty =
      incorrectSelections.length / question.options.length;
    score = Math.max(0, correctWeight - incorrectPenalty);
  } else {
    // All or nothing for single choice
    score =
      correctSelections.length === 1 &&
      incorrectSelections.length === 0 &&
      missedCorrectOptions.length === 0
        ? 1
        : 0;
  }

  return {
    score,
    breakdown: {
      type: "mcq",
      correctSelections,
      incorrectSelections,
      missedCorrectOptions,
    },
  };
}

/**
 * Evaluate True/False deterministically
 */
function evaluateTrueFalse(
  correctAnswer: boolean,
  userAnswer: boolean,
): { score: number; breakdown: any } {
  const isCorrect = correctAnswer === userAnswer;

  return {
    score: isCorrect ? 1 : 0,
    breakdown: {
      type: "truefalse",
      isCorrect,
    },
  };
}

/**
 * Evaluate Matching deterministically
 */
function evaluateMatching(
  question: any,
  userMatches: Array<{ leftId: string; rightId: string }>,
): { score: number; breakdown: any } {
  let correctMatches = 0;

  for (const userMatch of userMatches) {
    const correctPair = question.pairs.find(
      (pair: any) =>
        pair.id === userMatch.leftId && pair.id === userMatch.rightId,
    );
    if (correctPair) {
      correctMatches++;
    }
  }

  const score = correctMatches / question.pairs.length;

  return {
    score,
    breakdown: {
      type: "matching",
      correctMatches,
      incorrectMatches: userMatches.length - correctMatches,
      totalMatches: question.pairs.length,
    },
  };
}

// ============================================================================
// Code Execution (Stub - Implement with sandboxed environment)
// ============================================================================

async function executeCode(
  _code: string,
  _language: string,
  testCases: any[],
): Promise<
  Array<{ passed: boolean; input: string; expected: string; actual: string }>
> {
  // TODO: Implement with sandboxed code execution
  // Options: AWS Lambda, Docker containers, online judge APIs, etc.
  // For now, return mock results

  console.warn("Code execution not implemented - returning mock results");

  return testCases.map((tc) => ({
    passed: Math.random() > 0.5, // Mock
    input: tc.input,
    expected: tc.expectedOutput,
    actual: "Mock output",
  }));
}

// ============================================================================
// Main Evaluation Function
// ============================================================================

export async function evaluateAnswer(
  question: Question,
  userAnswer: UserAnswer,
  config: Partial<EvaluationConfig> = {},
): Promise<EvaluationResult> {
  const startTime = Date.now();
  const fullConfig = { ...DEFAULT_CONFIG, ...config } as EvaluationConfig;

  try {
    let score = 0;
    let breakdown: EvaluationBreakdown;
    let llmResponse: LLMResponse | null = null;
    let parsedResponse: any = null;

    // Handle different question types
    switch (question.type) {
      case "mcq": {
        // Deterministic scoring
        const mcqResult = evaluateMCQ(
          question,
          (userAnswer as any).selectedOptionIds,
        );
        score = mcqResult.score;
        breakdown = mcqResult.breakdown;

        // Get LLM explanation
        const prompt = buildEvaluationPrompt(question, userAnswer);
        llmResponse = await callLLM(prompt, fullConfig);
        parsedResponse = parseEvaluationResponse(llmResponse.content);
        break;
      }

      case "truefalse": {
        // Deterministic scoring
        const tfResult = evaluateTrueFalse(
          question.correctAnswer,
          (userAnswer as any).answer,
        );
        score = tfResult.score;
        breakdown = tfResult.breakdown;

        // Get LLM explanation
        const prompt = buildEvaluationPrompt(question, userAnswer);
        llmResponse = await callLLM(prompt, fullConfig);
        parsedResponse = parseEvaluationResponse(llmResponse.content);
        break;
      }

      case "matching": {
        // Deterministic scoring
        const matchingResult = evaluateMatching(
          question,
          (userAnswer as any).matches,
        );
        score = matchingResult.score;
        breakdown = matchingResult.breakdown;

        // Get LLM explanation
        const prompt = buildEvaluationPrompt(question, userAnswer);
        llmResponse = await callLLM(prompt, fullConfig);
        parsedResponse = parseEvaluationResponse(llmResponse.content);
        break;
      }

      case "code": {
        // Execute code against test cases
        const testResults = await executeCode(
          (userAnswer as any).code,
          question.language,
          question.testCases,
        );

        // Get LLM evaluation
        const prompt = buildEvaluationPrompt(question, userAnswer, {
          testResults,
        });
        llmResponse = await callLLM(prompt, fullConfig);
        parsedResponse = parseEvaluationResponse(llmResponse.content);

        score = parsedResponse.score;
        breakdown = {
          type: "code",
          ...parsedResponse.breakdown,
        };
        break;
      }

      case "open": {
        // Fully LLM-based evaluation
        const prompt = buildEvaluationPrompt(question, userAnswer);
        llmResponse = await callLLM(prompt, fullConfig);
        parsedResponse = parseEvaluationResponse(llmResponse.content);

        score = parsedResponse.score;
        breakdown = {
          type: "open",
          ...parsedResponse.breakdown,
        };
        break;
      }

      default:
        throw new Error(`Unsupported question type: ${(question as any).type}`);
    }

    // Build evaluation result
    const evaluationResult: EvaluationResult = {
      id: generateEvaluationId(),
      questionId: question.id,
      userId: userAnswer.userId,
      sessionId: userAnswer.sessionId,
      attemptNumber: userAnswer.attemptNumber,

      // Score
      score,
      maxScore: 1,
      percentage: Math.round(score * 100),

      // LLM Evaluation
      reasoning: parsedResponse?.reasoning || "Evaluation completed",
      strengths: parsedResponse?.strengths || [],
      weaknesses: parsedResponse?.weaknesses || [],
      suggestions: parsedResponse?.suggestions || [],

      // Breakdown
      breakdown,

      // Metadata
      evaluatedAt: new Date().toISOString(),
      evaluationModel: llmResponse?.model || fullConfig.model,
      evaluationVersion: EVALUATION_VERSION,
    };

    // Add token usage if available
    if (llmResponse) {
      (evaluationResult as any).tokensUsed = llmResponse.tokensUsed;
      (evaluationResult as any).estimatedCost = calculateCost(
        llmResponse.tokensUsed,
        llmResponse.model,
      );
    }

    (evaluationResult as any).evaluationTimeMs = Date.now() - startTime;

    return evaluationResult;
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw new Error(`Evaluation failed: ${error}`);
  }
}

// ============================================================================
// Batch Evaluation
// ============================================================================

export async function evaluateMultipleAnswers(
  questionsAndAnswers: Array<{ question: Question; answer: UserAnswer }>,
  config: Partial<EvaluationConfig> = {},
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < questionsAndAnswers.length; i += batchSize) {
    const batch = questionsAndAnswers.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(({ question, answer }) =>
        evaluateAnswer(question, answer, config),
      ),
    );

    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < questionsAndAnswers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateEvaluationId(): string {
  return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateCost(
  tokensUsed: { prompt: number; completion: number },
  model: string,
): number {
  // Pricing as of 2024 (update as needed)
  const pricing: Record<string, { prompt: number; completion: number }> = {
    "gpt-4-turbo-preview": { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
    "gpt-4": { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
    "gpt-3.5-turbo": { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
  };

  const modelPricing = pricing[model] || pricing["gpt-4-turbo-preview"];

  return (
    tokensUsed.prompt * modelPricing.prompt +
    tokensUsed.completion * modelPricing.completion
  );
}

// ============================================================================
// Export Types
// ============================================================================

export type { EvaluationConfig, LLMResponse };
