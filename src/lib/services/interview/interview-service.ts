import {
  QUESTION_TYPE_MAPPINGS,
  SCORING_THRESHOLDS,
} from "@/lib/config/interview-config";
import {
  analyzeResponseCharacteristics,
  isUnknownResponse,
  validateUserResponse,
} from "@/lib/services/ai/response-validator";
import { getQuestionCountForMode } from "@/lib/utils/interview-helpers";
import type {
  InterviewConfig,
  InterviewType,
  Message,
  QuestionType,
  ResponseAnalysis,
} from "@/types/interview";

export function determineQuestionType(
  interviewType: InterviewType,
  questionCount: number,
): QuestionType {
  switch (interviewType) {
    case "technical": {
      const typeArray = QUESTION_TYPE_MAPPINGS.technical;
      return typeArray[questionCount % typeArray.length];
    }
    case "bullet": {
      const typeArray = QUESTION_TYPE_MAPPINGS.bullet;
      return typeArray[questionCount % typeArray.length];
    }
    case "coding": {
      const typeArray = QUESTION_TYPE_MAPPINGS.coding;
      return typeArray[questionCount % typeArray.length];
    }
    case "system-design": {
      const typeArray = QUESTION_TYPE_MAPPINGS["system-design"];
      return typeArray[questionCount % typeArray.length];
    }
    case "situational": {
      const typeArray = QUESTION_TYPE_MAPPINGS.situational;
      return typeArray[questionCount % typeArray.length];
    }
    case "mixed": {
      const typeArray = QUESTION_TYPE_MAPPINGS.mixed;
      return typeArray[questionCount % typeArray.length];
    }
  }

  const _never: never = interviewType;
  throw new Error(`Unhandled interview type: ${_never}`);
}

export function calculateTotalQuestions(config: InterviewConfig): number {
  return getQuestionCountForMode(config.interviewMode, config.isDemoMode);
}

export function shouldGenerateFollowUp(
  userResponse: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
): boolean {
  if (!userResponse || userResponse.trim().length < 10) return false;

  const totalQuestions = calculateTotalQuestions(config);
  if (questionCount >= totalQuestions) return false;

  if (isUnknownResponse(userResponse)) return false;

  const characteristics = analyzeResponseCharacteristics(userResponse);

  let followUpScore = 0;

  if (
    characteristics.responseLength >= 100 &&
    characteristics.responseLength <= 500
  ) {
    followUpScore += 2;
  } else if (characteristics.responseLength > 500) {
    followUpScore += 1;
  } else if (characteristics.responseLength < 50) {
    followUpScore -= 1;
  }

  followUpScore += characteristics.qualityIndicators;

  const recentFollowUps = conversationHistory
    .slice(-4)
    .filter((msg) => msg.type === "ai" && msg.isFollowUp).length;

  if (recentFollowUps >= SCORING_THRESHOLDS.maxConsecutiveFollowUps) {
    followUpScore -= 2;
  }

  if (config.interviewType === "coding" && characteristics.hasCodeExample)
    followUpScore += 1;
  if (
    config.interviewType === "system-design" &&
    characteristics.responseLength > 200
  )
    followUpScore += 1;
  if (config.interviewMode === "flash" && characteristics.responseLength > 150)
    followUpScore -= 1;

  if (config.seniority === "senior" && characteristics.responseLength < 100)
    followUpScore += 1;
  if (config.seniority === "junior" && characteristics.responseLength > 300)
    followUpScore += 1;

  if (
    config.interviewMode === "regular" ||
    config.interviewMode === "practice"
  ) {
    followUpScore += 1;
  } else if (config.interviewMode === "flash") {
    followUpScore -= 1;
  }

  return followUpScore >= SCORING_THRESHOLDS.followUpScoreThreshold;
}

export function analyzeResponseQuality(
  conversationHistory: Message[],
): ResponseAnalysis {
  const aiMessages = conversationHistory.filter(
    (msg) => msg.type === "ai" && !msg.content.toLowerCase().includes("hello"),
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

    if (
      content === "[Question skipped]" ||
      content.toLowerCase() === "[question skipped]"
    ) {
      skippedQuestions++;
      return;
    }

    const validation = validateUserResponse(content);

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

export function validateInterviewConfig(config: Partial<InterviewConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.position) {
    errors.push("Position is required");
  }

  if (
    !config.seniority ||
    !["entry", "junior", "mid", "senior"].includes(config.seniority)
  ) {
    errors.push(
      "Valid seniority level is required (entry, junior, mid, senior)",
    );
  }

  if (
    !config.interviewType ||
    ![
      "technical",
      "bullet",
      "coding",
      "system-design",
      "situational",
      "mixed",
    ].includes(config.interviewType)
  ) {
    errors.push("Valid interview type is required");
  }

  if (
    !config.interviewMode ||
    ![
      "regular",
      "practice",
      "flash",
      "play",
      "competitive",
      "teacher",
    ].includes(config.interviewMode)
  ) {
    errors.push("Valid interview mode is required");
  }

  if (
    config.interviewMode === "regular" &&
    config.duration &&
    Number.isNaN(Number(config.duration))
  ) {
    errors.push("Duration must be a valid number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateMaxScore(responseAnalysis: ResponseAnalysis): number {
  const { substantiveResponses, totalQuestions, qualityScore } =
    responseAnalysis;

  if (substantiveResponses === 0) return 10;

  const responseRate = substantiveResponses / Math.max(totalQuestions, 1);

  if (responseRate < 0.3) return 25;
  if (responseRate < 0.5) return 40;
  if (responseRate < 0.7) return 60;

  return Math.min(100, Math.round(qualityScore * 1.2));
}

export function shouldCompleteInterview(
  currentQuestionCount: number,
  totalQuestions: number,
): boolean {
  return currentQuestionCount >= totalQuestions;
}

export function generateCompletionMessage(isDemoMode: boolean): string {
  if (isDemoMode) {
    return "Great job exploring the demo! You've seen how our AI interview system works - it's conversational, supportive, and designed to help you showcase your best self. When you're ready for a full interview, just head back to the configure page. Thanks for trying out!";
  }

  return "Excellent work! That concludes our interview session. You've demonstrated strong knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!";
}
