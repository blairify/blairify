/**
 * AI Client Service
 * Handles external AI API interactions (Mistral)
 */

import { Mistral } from "@mistralai/mistralai";
import type { InterviewConfig, ResponseAnalysis } from "@/types/interview";
import { AnalysisService } from "../interview/analysis-service";

export interface AIClientConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class AIClient {
  private client: Mistral | null = null;
  private config: AIClientConfig;

  constructor(config: AIClientConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.MISTRAL_API_KEY,
      model: config.model || "mistral-large-latest",
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 800,
      ...config,
    };

    if (this.config.apiKey) {
      this.client = new Mistral({
        apiKey: this.config.apiKey,
      });
    }
  }

  /**
   * Retry helper with exponential backoff for rate-limited requests
   */
  private async retryWithBackoff<T>(
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
        console.log(
          `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries exceeded");
  }

  /**
   * Generate interview question or response
   */
  async generateInterviewResponse(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AIResponse> {
    if (!this.client || !this.config.apiKey) {
      return {
        content:
          "I apologize, but I encountered a configuration error. Could you please try again?",
        success: false,
        error: "AI service not configured",
      };
    }

    try {
      const chatResponse = await this.retryWithBackoff(() => {
        if (!this.client || !this.config.model) {
          throw new Error("AI client not properly configured");
        }
        return this.client.chat.complete({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        });
      });

      const content = chatResponse.choices?.[0]?.message?.content;

      if (typeof content === "string") {
        return {
          content,
          success: true,
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
          errorMessage =
            "Rate limit exceeded. Please wait a moment and try again.";
          errorType = "rate_limit";
        } else if (error.message.includes("Service tier capacity exceeded")) {
          errorMessage =
            "AI service is currently at capacity. Using fallback response.";
          errorType = "capacity_exceeded";
        }
      }

      // Check for specific error codes in the error object
      if (typeof error === "object" && error !== null) {
        const errorObj = error as { statusCode?: number; body?: string };
        if (
          errorObj.statusCode === 429 ||
          errorObj.body?.includes("service_tier_capacity_exceeded")
        ) {
          errorMessage =
            "AI service is currently at capacity. Using fallback response.";
          errorType = "capacity_exceeded";
        }
      }

      return {
        content: errorMessage,
        success: false,
        error: errorType,
      };
    }
  }

  /**
   * Generate interview analysis
   */
  async generateAnalysis(
    systemPrompt: string,
    analysisPrompt: string,
  ): Promise<AIResponse> {
    if (!this.client || !this.config.apiKey) {
      return {
        content: "Analysis service not available",
        success: false,
        error: "AI service not configured",
      };
    }

    try {
      const chatResponse = await this.retryWithBackoff(() => {
        if (!this.client || !this.config.model) {
          throw new Error("AI client not properly configured");
        }
        return this.client.chat.complete({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          temperature: 0.2, // Lower temperature for more consistent analysis
          maxTokens: 2500, // Higher token limit for detailed analysis
        });
      });

      const content = chatResponse.choices?.[0]?.message?.content;

      if (typeof content === "string") {
        return {
          content,
          success: true,
        };
      }

      return {
        content: "Unable to generate analysis at this time.",
        success: false,
        error: "Invalid response format",
      };
    } catch (error) {
      console.error("AI Analysis error:", error);

      let errorMessage = "Analysis failed due to technical difficulties.";
      let errorType = "unknown";

      if (error instanceof Error) {
        if (
          error.message.includes("Service tier capacity exceeded") ||
          error.message.includes("429")
        ) {
          errorMessage =
            "AI service is currently at capacity. Using fallback analysis.";
          errorType = "capacity_exceeded";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Rate limit exceeded. Using fallback analysis.";
          errorType = "rate_limit";
        } else {
          errorType = error.message;
        }
      }

      // Check for specific error codes in the error object
      if (typeof error === "object" && error !== null) {
        const errorObj = error as { statusCode?: number; body?: string };
        if (
          errorObj.statusCode === 429 ||
          errorObj.body?.includes("service_tier_capacity_exceeded")
        ) {
          errorMessage =
            "AI service is currently at capacity. Using fallback analysis.";
          errorType = "capacity_exceeded";
        }
      }

      return {
        content: errorMessage,
        success: false,
        error: errorType,
      };
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return !!(this.client && this.config.apiKey);
  }

  /**
   * Get fallback response when AI is unavailable
   */
  getFallbackResponse(config: InterviewConfig, isFollowUp: boolean): string {
    if (config.isDemoMode) {
      return "That's interesting! Our AI service is currently at capacity, but let me continue with a demo question. What interests you most about this field and what draws you to this type of work?";
    }

    if (isFollowUp) {
      return "Thank you for that detailed explanation. I appreciate your insights. Let's continue with the next question to explore different aspects of your experience.";
    }

    // Generate different fallback questions based on interview type
    switch (config.interviewType) {
      case "technical":
        return "Let me ask you a fundamental technical question. Can you walk me through your approach to debugging a complex issue in a system you're unfamiliar with?";
      case "coding":
        return "Here's a coding question for you: How would you approach optimizing a slow-performing database query? Please describe your thought process step by step.";
      case "system-design":
        return "Let's discuss system design. How would you design a scalable system to handle user authentication for a growing application with millions of users?";
      case "bullet":
        return "Let's keep this concise. In bullet points, can you describe the key factors you consider when choosing between different technology solutions?";
      default:
        return "Let me ask you about your experience. Can you describe a challenging project you worked on and how you approached solving the main technical obstacles?";
    }
  }

  /**
   * Generate mock analysis when AI is unavailable
   */
  generateMockAnalysis(
    config: InterviewConfig,
    responseAnalysis: ResponseAnalysis,
  ): string {
    return AnalysisService.generateMockAnalysis(config, responseAnalysis);
  }
}

// Singleton instance for the application
export const aiClient = new AIClient();
