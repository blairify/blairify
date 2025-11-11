/**
 * AI Response Validation Service
 * Handles validation and sanitization of AI responses
 */

import {
  SCORING_THRESHOLDS,
  VALIDATION_PATTERNS,
} from "@/lib/config/interview-config";
import type { InterviewConfig, ValidationResult } from "@/types/interview";

/**
 * Validate AI response for appropriateness and quality
 */
export function validateAIResponse(
  response: string,
  config: InterviewConfig,
  isFollowUp: boolean,
): ValidationResult {
  // Basic validation checks
  if (!response || response.trim().length === 0) {
    return { isValid: false, reason: "Empty response" };
  }

  if (response.length < SCORING_THRESHOLDS.minResponseLength) {
    return { isValid: false, reason: "Response too short" };
  }

  // Truncate overly long responses
  if (response.length > SCORING_THRESHOLDS.maxResponseLength) {
    return {
      isValid: true,
      sanitized: `${response.substring(0, 1800)}... [Response truncated for clarity]`,
    };
  }

  // Check for inappropriate AI safety responses
  const inappropriateCheck = checkInappropriateContent(response);
  if (!inappropriateCheck.isValid) {
    return inappropriateCheck;
  }

  // Interview context validation
  if (!config.isDemoMode) {
    const contextCheck = validateInterviewContext(response, isFollowUp);
    if (!contextCheck.isValid) {
      return contextCheck;
    }
  }

  // Technical content validation
  const technicalCheck = validateTechnicalContent(response, config);
  if (!technicalCheck.isValid) {
    return technicalCheck;
  }

  // Format validation
  const formatCheck = validateFormat(response);
  if (formatCheck.sanitized) {
    return formatCheck;
  }

  return { isValid: true };
}

/**
 * Validate user response quality for analysis
 */
export function validateUserResponse(response: string): {
  isNoAnswer: boolean;
  isGibberish: boolean;
  isVeryShort: boolean;
  wordCount: number;
  characterCount: number;
} {
  const content = response.trim();
  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
  const characterCount = content.length;

  const isNoAnswer = matchesPatterns(content, VALIDATION_PATTERNS.noAnswer);
  const isGibberish = matchesPatterns(content, VALIDATION_PATTERNS.gibberish);
  const isVeryShort =
    characterCount < SCORING_THRESHOLDS.minResponseLength ||
    wordCount < SCORING_THRESHOLDS.minWordCount;

  return {
    isNoAnswer,
    isGibberish,
    isVeryShort,
    wordCount,
    characterCount,
  };
}

/**
 * Check if response indicates lack of knowledge
 */
export function isUnknownResponse(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("don't know") ||
    lowerMessage.includes("not sure") ||
    lowerMessage.includes("idk") ||
    lowerMessage.includes("no idea") ||
    message === "[Question skipped]"
  );
}

/**
 * Analyze response characteristics for follow-up decision
 */
export function analyzeResponseCharacteristics(response: string): {
  hasCodeExample: boolean;
  hasExplanation: boolean;
  mentionsTechnology: boolean;
  responseLength: number;
  qualityIndicators: number;
} {
  const hasCodeExample = /```|function|class|const|let|var|\{|\}/.test(
    response,
  );
  const hasExplanation = /because|reason|why|how|when|since|due to/i.test(
    response,
  );
  const mentionsTechnology =
    /react|javascript|typescript|node|python|sql|api|database/i.test(response);
  const responseLength = response.trim().length;

  let qualityIndicators = 0;
  if (hasCodeExample) qualityIndicators += 2;
  if (hasExplanation) qualityIndicators += 2;
  if (mentionsTechnology) qualityIndicators += 1;
  if (responseLength >= 100 && responseLength <= 500) qualityIndicators += 2;

  return {
    hasCodeExample,
    hasExplanation,
    mentionsTechnology,
    responseLength,
    qualityIndicators,
  };
}

/**
 * Check for inappropriate content
 */
function checkInappropriateContent(response: string): ValidationResult {
  for (const pattern of VALIDATION_PATTERNS.inappropriate) {
    if (pattern.test(response)) {
      return {
        isValid: false,
        reason: "Contains inappropriate AI safety response",
      };
    }
  }
  return { isValid: true };
}

/**
 * Validate interview context
 */
function validateInterviewContext(
  response: string,
  isFollowUp: boolean,
): ValidationResult {
  // Should contain a question for main questions
  if (!isFollowUp && !response.includes("?")) {
    return {
      isValid: false,
      reason: "Main interview response should contain a question",
    };
  }

  // Check for interviewer persona consistency
  const hasInterviewerContext =
    /let's|can you|what|how|why|tell me|describe|explain/i.test(response);
  if (!hasInterviewerContext && !isFollowUp) {
    return {
      isValid: false,
      reason: "Response lacks interviewer context",
    };
  }

  return { isValid: true };
}

/**
 * Validate technical content
 */
function validateTechnicalContent(
  response: string,
  config: InterviewConfig,
): ValidationResult {
  if (config.interviewType === "coding" && !config.isDemoMode) {
    const hasCodeContext =
      /code|function|algorithm|implement|solution|programming/i.test(response);
    if (!hasCodeContext) {
      return {
        isValid: false,
        reason: "Coding interview should reference programming concepts",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate response format
 */
function validateFormat(response: string): ValidationResult {
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length > SCORING_THRESHOLDS.maxSentences) {
    return {
      isValid: true,
      sanitized: `${sentences.slice(0, 6).join(". ")}. [Question continued...]`,
    };
  }

  return { isValid: true };
}

/**
 * Check if content matches any of the given patterns
 */
function matchesPatterns(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}
