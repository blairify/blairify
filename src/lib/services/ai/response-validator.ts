import {
  SCORING_THRESHOLDS,
  VALIDATION_PATTERNS,
} from "@/lib/config/interview-config";
import type { InterviewConfig, ValidationResult } from "@/types/interview";

export function extractCandidateFacingQuestionFromPrompt(
  prompt: string,
): string | null {
  const value = prompt.trim();
  if (!value) return null;

  const quotedMatch = value.match(
    /answer\s+the\s+question\s*:\s*(?:"([^"]+)"|'([^']+)'|“([^”]+)”|‘([^’]+)’)/i,
  );
  if (quotedMatch) {
    return (
      (
        quotedMatch[1] ??
        quotedMatch[2] ??
        quotedMatch[3] ??
        quotedMatch[4] ??
        null
      )?.trim() ?? null
    );
  }

  const unquotedMatch = value.match(
    /answer\s+the\s+question\s*:\s*([^\n\r]+)/i,
  );
  if (unquotedMatch?.[1]) {
    return unquotedMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  return null;
}

function sanitizeModelOutput(value: string): string {
  const raw = value.trim();
  if (!raw) return raw;

  const finalMatch = raw.match(/(^|\n)\s*final\s*:\s*/i);
  if (finalMatch?.index !== undefined) {
    const start = finalMatch.index + finalMatch[0].length;
    return raw.slice(start).trim();
  }

  const withoutXmlAnalysis = raw.replace(
    /<analysis>[\s\S]*?<\/analysis>/gi,
    "",
  );
  const withoutFencedAnalysis = withoutXmlAnalysis.replace(
    /```\s*analysis[\s\S]*?```/gi,
    "",
  );

  const withoutPromptScaffolding = withoutFencedAnalysis
    .replace(
      /(^|\n)\s*(the\s+candidate\s+just\s+responded|candidate's\s+previous\s+response)\s*:\s*"[\s\S]*?"\s*(\n\s*)+/gi,
      "\n",
    )
    .replace(
      /(^|\n)\s*you\s+previously\s+asked\s+this\s+question\s*:\s*\n\s*"[\s\S]*?"\s*(\n\s*)+/gi,
      "\n",
    )
    .replace(/(^|\n)\s*internal\s+context\s*:[^\n]*?(\n\s*)+/gi, "\n")
    .replace(
      /(^|\n)\s*\(for\s+your\s+internal\s+reference\s+only\)\s*(\n\s*)+/gi,
      "\n",
    )
    .replace(/\bfor\s+your\s+internal\s+reference\s+only\b/gi, "")
    .replace(
      /\bdo\s+not\s+describe\s+these\s+instructions\s+back\s+to\s+the\s+candidate\b/gi,
      "",
    );

  return withoutPromptScaffolding
    .replace(/^\s*(analysis|thinking)\s*:\s*/i, "")
    .trim();
}

export function validateAIResponse(
  response: string,
  config: InterviewConfig,
  isFollowUp: boolean,
): ValidationResult {
  const sanitizedResponse = sanitizeModelOutput(response);

  if (!sanitizedResponse || sanitizedResponse.trim().length === 0) {
    return { isValid: false, reason: "Empty response" };
  }

  if (sanitizedResponse.length < SCORING_THRESHOLDS.minResponseLength) {
    return { isValid: false, reason: "Response too short" };
  }

  if (sanitizedResponse.length > SCORING_THRESHOLDS.maxResponseLength) {
    return {
      isValid: true,
      sanitized: `${sanitizedResponse.substring(0, 1800)}... [Response truncated for clarity]`,
    };
  }

  const inappropriateCheck = checkInappropriateContent(sanitizedResponse);
  if (!inappropriateCheck.isValid) {
    return inappropriateCheck;
  }

  if (!config.isDemoMode) {
    const contextCheck = validateInterviewContext(
      sanitizedResponse,
      isFollowUp,
    );
    if (!contextCheck.isValid) {
      return contextCheck;
    }
  }

  const technicalCheck = validateTechnicalContent(sanitizedResponse, config);
  if (!technicalCheck.isValid) {
    return technicalCheck;
  }

  if (sanitizedResponse !== response) {
    return { isValid: true, sanitized: sanitizedResponse };
  }

  return { isValid: true };
}

export function validateQuestionSequence(
  response: string,
  expectedPrimaryIndex: number,
  expectPrimaryQuestion: boolean,
): ValidationResult {
  const questionLabelPattern = /\[BANK_QUESTION_INDEX:\s*(\d+)\]/gi;
  const matches = Array.from(response.matchAll(questionLabelPattern));

  const altQuestionLabelPattern = /\bquestion\s*#?\s*(\d+)\b/gi;
  const altMatches = Array.from(response.matchAll(altQuestionLabelPattern));

  if (!expectPrimaryQuestion) {
    if (matches.length > 0) {
      return {
        isValid: false,
        reason:
          "Unexpected Question # label when no new primary question should be asked",
      };
    }

    return { isValid: true };
  }

  if (matches.length === 0) {
    if (altMatches.length === 0) {
      return {
        isValid: false,
        reason:
          "Missing Question # label when a new primary question is expected",
      };
    }

    const indices = new Set<number>();

    for (const match of altMatches) {
      const rawIndex = match[1];
      const parsedIndex = Number.parseInt(rawIndex, 10);

      if (Number.isNaN(parsedIndex)) {
        return {
          isValid: false,
          reason: "Invalid Question # label format",
        };
      }

      indices.add(parsedIndex);
    }

    if (indices.size > 1) {
      return {
        isValid: false,
        reason: "Multiple Question # labels found in primary question response",
      };
    }

    const [index] = Array.from(indices);

    if (index !== expectedPrimaryIndex) {
      return {
        isValid: false,
        reason: `Invalid question index: expected Question #${expectedPrimaryIndex}, got Question #${index}`,
      };
    }

    return { isValid: true };
  }

  const indices = new Set<number>();

  for (const match of matches) {
    const rawIndex = match[1];
    const parsedIndex = Number.parseInt(rawIndex, 10);

    if (Number.isNaN(parsedIndex)) {
      return {
        isValid: false,
        reason: "Invalid Question # label format",
      };
    }

    indices.add(parsedIndex);
  }

  if (indices.size > 1) {
    return {
      isValid: false,
      reason: "Multiple Question # labels found in primary question response",
    };
  }

  const [index] = Array.from(indices);

  if (index !== expectedPrimaryIndex) {
    return {
      isValid: false,
      reason: `Invalid question index: expected Question #${expectedPrimaryIndex}, got Question #${index}`,
    };
  }

  return { isValid: true };
}

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

export function isUnknownResponse(message: string): boolean {
  const trimmed = message.trim();

  if (!trimmed) return true;

  if (
    trimmed === "[Question skipped]" ||
    trimmed.toLowerCase() === "[question skipped]"
  ) {
    return true;
  }

  const { isNoAnswer, isGibberish } = validateUserResponse(trimmed);

  return isNoAnswer || isGibberish;
}

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

function validateInterviewContext(
  response: string,
  isFollowUp: boolean,
): ValidationResult {
  if (!isFollowUp && !response.includes("?")) {
    return {
      isValid: false,
      reason: "Main interview response should contain a question",
    };
  }

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

function matchesPatterns(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}
