/**
 * Interview Service Layer
 * Core business logic for interview management
 */

import {
  DEFAULT_INTERVIEW_CONFIG,
  QUESTION_TYPE_MAPPINGS,
  SCORING_THRESHOLDS,
} from "@/lib/config/interview-config";
import { ResponseValidator } from "@/lib/services/ai/response-validator";
import type {
  InterviewConfig,
  InterviewType,
  Message,
  QuestionType,
  ResponseAnalysis,
} from "@/types/interview";

export class InterviewService {
  /**
   * Determine the appropriate question type based on interview type and count
   */
  static determineQuestionType(
    interviewType: InterviewType,
    questionCount: number,
  ): QuestionType {
    const typeArray =
      QUESTION_TYPE_MAPPINGS[interviewType] || QUESTION_TYPE_MAPPINGS.technical;
    return typeArray[questionCount % typeArray.length];
  }

  /**
   * Calculate total questions for interview configuration
   */
  static calculateTotalQuestions(config: InterviewConfig): number {
    if (config.isDemoMode) {
      return DEFAULT_INTERVIEW_CONFIG.totalQuestions.demo;
    }

    return (
      DEFAULT_INTERVIEW_CONFIG.totalQuestions[config.interviewType] ||
      DEFAULT_INTERVIEW_CONFIG.totalQuestions.technical
    );
  }

  /**
   * Determine if a follow-up question should be generated
   */
  static shouldGenerateFollowUp(
    userResponse: string,
    conversationHistory: Message[],
    config: InterviewConfig,
    questionCount: number,
  ): boolean {
    // Don't follow up on empty or very short responses
    if (!userResponse || userResponse.trim().length < 10) {
      return false;
    }

    // Don't follow up if we're near the end of the interview
    const totalQuestions = InterviewService.calculateTotalQuestions(config);
    if (questionCount >= totalQuestions) {
      return false;
    }

    // Don't follow up on "I don't know" or skip responses
    if (ResponseValidator.isUnknownResponse(userResponse)) {
      return false;
    }

    // Analyze response characteristics
    const characteristics =
      ResponseValidator.analyzeResponseCharacteristics(userResponse);

    // Score factors that indicate a good candidate for follow-up
    let followUpScore = 0;

    // Length indicators
    if (
      characteristics.responseLength >= 100 &&
      characteristics.responseLength <= 500
    ) {
      followUpScore += 2; // Sweet spot
    } else if (characteristics.responseLength > 500) {
      followUpScore += 1; // Detailed but may need clarification
    } else if (characteristics.responseLength < 50) {
      followUpScore -= 1; // Too brief
    }

    // Add quality indicators
    followUpScore += characteristics.qualityIndicators;

    // Context-based scoring
    const recentFollowUps = conversationHistory
      .slice(-4)
      .filter((msg) => msg.type === "ai" && msg.isFollowUp).length;

    if (recentFollowUps >= SCORING_THRESHOLDS.maxConsecutiveFollowUps) {
      followUpScore -= 2; // Avoid too many consecutive follow-ups
    }

    // Interview type specific adjustments
    if (config.interviewType === "coding" && characteristics.hasCodeExample) {
      followUpScore += 1;
    }
    if (
      config.interviewType === "system-design" &&
      characteristics.responseLength > 200
    ) {
      followUpScore += 1;
    }
    if (
      config.interviewMode === "bullet" &&
      characteristics.responseLength > 150
    ) {
      followUpScore -= 1; // Keep it concise
    }

    // Seniority level adjustments
    if (config.seniority === "senior" && characteristics.responseLength < 100) {
      followUpScore += 1; // Expect more detail
    }
    if (config.seniority === "junior" && characteristics.responseLength > 300) {
      followUpScore += 1; // Good elaboration
    }

    // Return true if score is above threshold
    return followUpScore >= SCORING_THRESHOLDS.followUpScoreThreshold;
  }

  /**
   * Analyze conversation history for response quality
   */
  static analyzeResponseQuality(
    conversationHistory: Message[],
  ): ResponseAnalysis {
    const aiMessages = conversationHistory.filter(
      (msg) =>
        msg.type === "ai" && !msg.content.toLowerCase().includes("hello"),
    );
    const userResponses = conversationHistory.filter(
      (msg) => msg.type === "user",
    );

    let skippedQuestions = 0;
    let noAnswerResponses = 0;
    let veryShortResponses = 0;
    let gibberishResponses = 0;
    let substantiveResponses = 0;
    let totalLength = 0;

    userResponses.forEach((response) => {
      const content = response.content.trim();
      totalLength += content.length;

      // Check for skipped questions
      if (
        content === "[Question skipped]" ||
        content.toLowerCase() === "[question skipped]"
      ) {
        skippedQuestions++;
        return;
      }

      // Validate response characteristics
      const validation = ResponseValidator.validateUserResponse(content);

      if (validation.isNoAnswer) {
        noAnswerResponses++;
      } else if (validation.isGibberish) {
        gibberishResponses++;
      } else if (validation.isVeryShort) {
        veryShortResponses++;
      } else {
        substantiveResponses++;
      }
    });

    const totalQuestions = aiMessages.length;
    const totalResponses = userResponses.length;
    const poorResponses =
      skippedQuestions +
      noAnswerResponses +
      gibberishResponses +
      veryShortResponses;

    const effectiveResponseRate =
      totalResponses > 0 ? (substantiveResponses / totalResponses) * 100 : 0;

    const averageResponseLength =
      totalResponses > 0 ? totalLength / totalResponses : 0;

    const qualityScore = Math.max(
      0,
      Math.min(
        100,
        (substantiveResponses / Math.max(totalQuestions, 1)) * 100 -
          (poorResponses / Math.max(totalQuestions, 1)) * 50,
      ),
    );

    return {
      totalQuestions,
      totalResponses,
      skippedQuestions,
      noAnswerResponses,
      veryShortResponses,
      gibberishResponses,
      substantiveResponses,
      averageResponseLength,
      effectiveResponseRate,
      qualityScore,
    };
  }

  /**
   * Validate interview configuration
   */
  static validateInterviewConfig(config: Partial<InterviewConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.position) {
      errors.push("Position is required");
    }

    if (
      !config.seniority ||
      !["junior", "mid", "senior"].includes(config.seniority)
    ) {
      errors.push("Valid seniority level is required (junior, mid, senior)");
    }

    if (
      !config.interviewType ||
      !["technical", "bullet", "coding", "system-design"].includes(
        config.interviewType,
      )
    ) {
      errors.push("Valid interview type is required");
    }

    if (
      !config.interviewMode ||
      !["timed", "untimed", "bullet", "whiteboard"].includes(
        config.interviewMode,
      )
    ) {
      errors.push("Valid interview mode is required");
    }

    if (
      config.interviewMode === "timed" &&
      (!config.duration || Number.isNaN(Number(config.duration)))
    ) {
      errors.push("Duration is required for timed interviews");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new message object
   */
  static createMessage(
    type: "ai" | "user",
    content: string,
    questionType?: QuestionType,
    isFollowUp?: boolean,
  ): Message {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      questionType,
      isFollowUp,
    };
  }

  /**
   * Calculate maximum allowed score based on response quality
   */
  static calculateMaxScore(responseAnalysis: ResponseAnalysis): number {
    const { substantiveResponses, totalQuestions, qualityScore } =
      responseAnalysis;

    if (substantiveResponses === 0) return 10;

    const responseRate = substantiveResponses / Math.max(totalQuestions, 1);

    if (responseRate < 0.3) return 25;
    if (responseRate < 0.5) return 40;
    if (responseRate < 0.7) return 60;

    return Math.min(100, Math.round(qualityScore * 1.2));
  }

  /**
   * Check if interview should be completed
   */
  static shouldCompleteInterview(
    currentQuestionCount: number,
    totalQuestions: number,
  ): boolean {
    return currentQuestionCount >= totalQuestions;
  }

  /**
   * Generate completion message
   */
  static generateCompletionMessage(isDemoMode: boolean): string {
    if (isDemoMode) {
      return "Great job exploring the demo! You've seen how our AI interview system works - it's conversational, supportive, and designed to help you showcase your best self. When you're ready for a full interview, just head back to the configure page. Thanks for trying out!";
    }

    return "Excellent work! That concludes our interview session. You've demonstrated strong knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!";
  }
}
