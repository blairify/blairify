/**
 * AI Client Service
 * Handles external AI API interactions (Mistral)
 */

import { Mistral } from "@mistralai/mistralai";
import type { InterviewConfig } from "@/types/interview";
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
      const chatResponse = await this.client.chat.complete({
        model: this.config.model!,
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
        } else if (error.message.includes("rate limit")) {
          errorMessage =
            "Rate limit exceeded. Please wait a moment and try again.";
          errorType = "rate_limit";
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
      const chatResponse = await this.client.chat.complete({
        model: this.config.model!,
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

      return {
        content: "Analysis failed due to technical difficulties.",
        success: false,
        error: error instanceof Error ? error.message : "unknown",
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
      return "That's interesting! Let me ask you another question to help you explore our interview system. What interests you most about this field?";
    }

    if (isFollowUp) {
      return "Thank you for that explanation. Let's move on to the next question.";
    }

    return "Let me ask you a fundamental question about your experience. Can you describe your approach to solving technical problems?";
  }

  /**
   * Generate mock analysis when AI is unavailable
   */
  generateMockAnalysis(config: InterviewConfig, responseAnalysis: any): string {
    return AnalysisService.generateMockAnalysis(config, responseAnalysis);
  }
}

// Singleton instance for the application
export const aiClient = new AIClient();
