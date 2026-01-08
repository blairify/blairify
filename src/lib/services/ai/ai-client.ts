/**
 * AI Client Service (Functional Version)
 * Handles external AI API interactions (Mistral)
 */

import { Mistral } from "@mistralai/mistralai";
import type { InterviewConfig, ResponseAnalysis } from "@/types/interview";
import { generateMockAnalysis } from "../interview/analysis-service";

export interface AIClientConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  interviewModel?: string;
  analysisModel?: string;
  codingModel?: string;
}

export enum MistralModel {
  // Lightweight models for interviews
  MINISTRAL_8B = "ministral-8b-latest",
  MISTRAL_SMALL = "mistral-small-latest",

  // Powerful models for analysis
  MISTRAL_MEDIUM = "mistral-medium-latest",
  MISTRAL_LARGE = "mistral-large-latest",

  // Specialized coding model
  CODESTRAL = "codestral-latest",
}

export enum UseCase {
  INTERVIEW = "interview",
  ANALYSIS = "analysis",
  CODING = "coding",
}

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIClientInstance {
  client: Mistral | null;
  config: Required<AIClientConfig>;
}

/**
 * Create an AI client instance with configuration
 */
export function createAIClient(config: AIClientConfig = {}): AIClientInstance {
  const fullConfig: Required<AIClientConfig> = {
    apiKey: config.apiKey || process.env.MISTRAL_API_KEY || "",
    model: config.model || MistralModel.MISTRAL_SMALL,
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? 800,
    interviewModel:
      config.interviewModel ||
      process.env.MISTRAL_INTERVIEW_MODEL ||
      MistralModel.MINISTRAL_8B,
    analysisModel:
      config.analysisModel ||
      process.env.MISTRAL_ANALYSIS_MODEL ||
      MistralModel.MISTRAL_MEDIUM,
    codingModel:
      config.codingModel ||
      process.env.MISTRAL_CODING_MODEL ||
      MistralModel.CODESTRAL,
  };

  const client = fullConfig.apiKey
    ? new Mistral({ apiKey: fullConfig.apiKey })
    : null;

  return { client, config: fullConfig };
}

/**
 * Get the appropriate model for the given use case
 */
function getModelForUseCase(
  config: Required<AIClientConfig>,
  useCase: UseCase,
  interviewType?: string,
): string {
  switch (useCase) {
    case UseCase.INTERVIEW:
      // Use coding model for coding interviews, otherwise use lightweight model
      if (interviewType === "coding") {
        return config.codingModel || MistralModel.CODESTRAL;
      }
      return config.interviewModel || MistralModel.MINISTRAL_8B;

    case UseCase.ANALYSIS:
      return config.analysisModel || MistralModel.MISTRAL_MEDIUM;

    case UseCase.CODING:
      return config.codingModel || MistralModel.CODESTRAL;

    default:
      return config.model || MistralModel.MISTRAL_SMALL;
  }
}

/**
 * Retry helper with exponential backoff for rate-limited requests
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorObj = error as { statusCode?: number; body?: string };
      const isRateLimited =
        errorObj?.statusCode === 429 ||
        errorObj?.body?.includes("service_tier_capacity_exceeded") ||
        (error instanceof Error &&
          (error.message.includes("429") ||
            error.message.includes("Service tier capacity exceeded") ||
            error.message.includes("rate limit")));

      if (!isRateLimited || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Generate interview question or response
 */
export async function generateInterviewResponse(
  instance: AIClientInstance,
  systemPrompt: string,
  userPrompt: string,
  interviewType?: string,
): Promise<AIResponse> {
  if (!instance.client || !instance.config.apiKey) {
    console.error(
      "❌ AI Service Error: MISTRAL_API_KEY is not configured. Please add it to your .env file.",
    );
    console.error("Get your API key from: https://console.mistral.ai/");
    return {
      content:
        "I apologize, but the AI service is not configured. Please contact support.",
      success: false,
      error: "AI service not configured - Missing MISTRAL_API_KEY",
    };
  }

  try {
    const selectedModel = getModelForUseCase(
      instance.config,
      UseCase.INTERVIEW,
      interviewType,
    );
    console.log(
      `🤖 Using model for interview: ${selectedModel} (type: ${interviewType || "general"})`,
    );

    const chatResponse = await retryWithBackoff(() => {
      if (!instance.client) {
        throw new Error("AI client not properly configured");
      }
      return instance.client.chat.complete({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: instance.config.temperature,
        maxTokens: instance.config.maxTokens,
      });
    });

    const content = chatResponse.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return {
        content,
        success: true,
        usage: {
          prompt_tokens: chatResponse.usage.promptTokens ?? 0,
          completion_tokens: chatResponse.usage.completionTokens ?? 0,
          total_tokens: chatResponse.usage.totalTokens ?? 0,
        },
      };
    }

    return {
      content:
        "I apologize, but I encountered an error. Could you please try again?",
      success: false,
      error: "Invalid response format",
    };
  } catch (error) {
    console.error("AI Client error:", error);
    return handleError(error);
  }
}

/**
 * Generate interview analysis
 */
export async function generateAnalysis(
  instance: AIClientInstance,
  systemPrompt: string,
  analysisPrompt: string,
): Promise<AIResponse> {
  if (!instance.client || !instance.config.apiKey) {
    console.error(
      "❌ Analysis Service Error: MISTRAL_API_KEY is not configured. Please add it to your .env file.",
    );
    console.error("Get your API key from: https://console.mistral.ai/");
    return {
      content: "Analysis service not available - Missing API configuration",
      success: false,
      error: "AI service not configured - Missing MISTRAL_API_KEY",
    };
  }

  try {
    const selectedModel = getModelForUseCase(instance.config, UseCase.ANALYSIS);
    console.log(`🔍 Using model for analysis: ${selectedModel}`);

    const chatResponse = await retryWithBackoff(() => {
      if (!instance.client) {
        throw new Error("AI client not properly configured");
      }
      return instance.client.chat.complete({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.4,
        maxTokens: 2500,
      });
    });

    const content = chatResponse.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return {
        content,
        success: true,
        usage: {
          prompt_tokens: chatResponse.usage.promptTokens ?? 0,
          completion_tokens: chatResponse.usage.completionTokens ?? 0,
          total_tokens: chatResponse.usage.totalTokens ?? 0,
        },
      };
    }

    return {
      content: "Unable to generate analysis at this time.",
      success: false,
      error: "Invalid response format",
    };
  } catch (error) {
    console.error("AI Analysis error:", error);
    return handleError(error);
  }
}

/**
 * Generic error handler reused for both functions
 */
function handleError(error: unknown): AIResponse {
  let errorMessage =
    "I apologize, but I'm experiencing technical difficulties. Could you please try again?";
  let errorType = "unknown";

  if (error instanceof Error) {
    if (error.message.includes("API key")) {
      errorMessage = "Invalid API key configuration";
      errorType = "auth";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
      errorType = "timeout";
    } else if (
      error.message.includes("rate limit") ||
      error.message.includes("429")
    ) {
      errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      errorType = "rate_limit";
    } else if (error.message.includes("Service tier capacity exceeded")) {
      errorMessage =
        "AI service is currently at capacity. Using fallback response.";
      errorType = "capacity_exceeded";
    }
  }

  const errorObj = error as { statusCode?: number; body?: string };
  if (
    errorObj?.statusCode === 429 ||
    errorObj?.body?.includes("service_tier_capacity_exceeded")
  ) {
    errorMessage =
      "AI service is currently at capacity. Using fallback response.";
    errorType = "capacity_exceeded";
  }

  return {
    content: errorMessage,
    success: false,
    error: errorType,
  };
}

/**
 * Check if AI service is available
 */
export function isAvailable(instance: AIClientInstance): boolean {
  return !!(instance.client && instance.config.apiKey);
}

/**
 * Get fallback response when AI is unavailable
 */
export function getFallbackResponse(
  config: InterviewConfig,
  isFollowUp: boolean,
): string {
  if (config.isDemoMode) {
    return "I'm having some technical issues generating the next demo response right now. This is just a demo, so your progress isn't affected, but please refresh the page or try again in a moment.";
  }

  if (isFollowUp) {
    return "I ran into a technical issue while generating a follow-up question. Your previous answer is saved, but I can't reliably continue this follow-up. Please wait a moment and try again, or move on to the next question when the interview resumes.";
  }

  return "I encountered a technical problem while generating the next interview question. Your previous responses are saved, but I can't safely continue this interview right now. Please wait a moment and try again, or restart the interview when you're ready. I apologize for the inconvenience.";
}

/**
 * Generate mock analysis when AI is unavailable
 */
export function generateMockAnalysisResponse(
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  return generateMockAnalysis(config, responseAnalysis);
}

/**
 * Default instance for the application
 */
export const aiClient = createAIClient();
