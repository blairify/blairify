import { type NextRequest, NextResponse } from "next/server";
import { SCORING_THRESHOLDS } from "@/lib/config/interview-config";
import {
  determineQuestionType,
  generateSystemPrompt,
  generateUserPrompt,
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
  getQuestionCountForMode,
  shouldGenerateFollowUp,
  validateInterviewConfig,
} from "@/lib/interview";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import {
  extractCandidateFacingQuestionFromPrompt,
  validateAIResponse,
  validateQuestionSequence,
} from "@/lib/services/ai/response-validator";
import {
  detectDisallowedTopic,
  detectInappropriateBehavior,
  detectLanguageRequest,
  detectProfanity,
  sanitizeMessageForPrivacy,
} from "@/lib/services/interview/message-moderation";
import type { Message } from "@/types/interview";

function getFollowUpsSinceLastMainQuestion(
  conversationHistory: Message[],
):
  | { count: number; hasMainQuestion: boolean }
  | { count: 0; hasMainQuestion: false } {
  let count = 0;

  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];

    if (msg.type !== "ai") continue;

    if (msg.isFollowUp) {
      count += 1;
      continue;
    }

    return { count, hasMainQuestion: true };
  }

  return { count: 0, hasMainQuestion: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp = false,
      totalQuestions,
      warningCount = 0,
      questionIds,
    } = body;

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    const languageCheck = detectLanguageRequest(message);

    console.log("🌐 Language detection check:", {
      message: message.toLowerCase(),
      isLanguageRequest: languageCheck.isLanguageRequest,
      matchedPatterns: languageCheck.matchedPatterns,
    });

    if (languageCheck.isLanguageRequest) {
      return NextResponse.json({
        success: true,
        message:
          "I appreciate your question! Currently, I can only conduct interviews in English. This helps ensure consistency and accuracy in our assessment process. Let's continue with your interview in English - I'm here to help you showcase your skills!",
        questionType: "clarification",
        validated: true,
        isFollowUp: true,
        isComplete: false,
      });
    }

    const containsProfanity = detectProfanity(message);

    if (containsProfanity) {
      return NextResponse.json({
        success: true,
        message:
          "I understand you may be frustrated, but professional language is expected during interviews. This type of language is not appropriate for a professional setting. Unfortunately, I need to end this interview session now. Your final score is 0.",
        questionType: "termination",
        validated: true,
        isFollowUp: false,
        isComplete: true,
        terminatedForProfanity: true,
      });
    }

    const disallowedTopicCheck = detectDisallowedTopic(message);

    if (disallowedTopicCheck.containsDisallowedTopic) {
      console.log("🚫 Disallowed topic detected:", {
        matchedPatterns: disallowedTopicCheck.matchedPatterns,
      });
      return NextResponse.json({
        success: true,
        message:
          "I appreciate your engagement, but let's keep our conversation focused on technical topics relevant to the interview. I'm here to help assess your programming skills and experience. Could you please share your thoughts on the technical question I asked?",
        questionType: "redirect",
        validated: true,
        isFollowUp: true,
        isComplete: false,
      });
    }

    const behaviorCheck = detectInappropriateBehavior(message, warningCount);

    if (behaviorCheck.containsInappropriateBehavior) {
      console.warn("⚠️ Inappropriate behavior detected:", {
        matchedPatterns:
          "matchedPatterns" in behaviorCheck
            ? behaviorCheck.matchedPatterns
            : [],
      });
      const { newWarningCount } = behaviorCheck;

      if (newWarningCount >= 2) {
        return NextResponse.json({
          success: true,
          message:
            "I've already warned you about inappropriate behavior. Professional conduct is required in interviews. Since this behavior has continued, I'm ending this interview session now. Your final score is 0.",
          questionType: "termination",
          validated: true,
          isFollowUp: false,
          isComplete: true,
          terminatedForBehavior: true,
          warningCount: newWarningCount,
        });
      }

      return NextResponse.json({
        success: true,
        message:
          "I notice some inappropriate language in your response. Professional interviews require respectful communication. This is your warning - please maintain professional conduct. If this behavior continues, I'll need to end the interview. Let's refocus on the technical discussion.",
        questionType: "warning",
        validated: true,
        isFollowUp: true,
        isComplete: false,
        behaviorWarning: true,
        warningCount: newWarningCount,
        matchedBehaviorPatterns:
          "matchedPatterns" in behaviorCheck
            ? behaviorCheck.matchedPatterns
            : undefined,
      });
    }

    const privacy = sanitizeMessageForPrivacy(message);

    if (privacy.redactionsApplied) {
      console.log("🔒 Privacy protection applied:", {
        originalLength: message.length,
        sanitizedLength: privacy.sanitizedMessage.length,
        redactionsApplied: true,
      });
    }

    const processedMessage = privacy.sanitizedMessage;

    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const interviewer = interviewConfig.specificCompany
      ? getInterviewerForCompanyAndRole(
          interviewConfig.specificCompany,
          interviewConfig.position,
        )
      : getInterviewerForRole(interviewConfig.position);

    const maxQuestions =
      totalQuestions ||
      getQuestionCountForMode(
        interviewConfig.interviewMode,
        interviewConfig.isDemoMode,
      );

    const currentQuestionCount = questionCount || 0;

    const historyForFollowUpCount: Message[] = Array.isArray(
      conversationHistory,
    )
      ? (conversationHistory as Message[])
      : [];
    const followUpCountState = getFollowUpsSinceLastMainQuestion(
      historyForFollowUpCount,
    );
    const maxFollowUpsPerQuestion = SCORING_THRESHOLDS.maxFollowUpsPerQuestion;
    const reachedFollowUpCap =
      followUpCountState.hasMainQuestion &&
      followUpCountState.count >= maxFollowUpsPerQuestion;

    const autoFollowUp =
      !isFollowUp &&
      !interviewConfig.isDemoMode &&
      Array.isArray(conversationHistory) &&
      !reachedFollowUpCap &&
      shouldGenerateFollowUp(
        processedMessage,
        conversationHistory as Message[],
        interviewConfig,
        currentQuestionCount,
      );

    const requestedFollowUp = isFollowUp && !reachedFollowUpCap;
    const effectiveIsFollowUp = requestedFollowUp || autoFollowUp;

    const shouldComplete =
      !effectiveIsFollowUp && currentQuestionCount >= maxQuestions;

    let currentQuestionPrompt: string | undefined;

    const safeQuestionIds: string[] =
      Array.isArray(questionIds) && questionIds.length > 0 ? questionIds : [];

    if (
      safeQuestionIds.length > 0 &&
      !effectiveIsFollowUp &&
      !interviewConfig.isDemoMode
    ) {
      const nextIndex = currentQuestionCount;

      if (nextIndex >= 0 && nextIndex < safeQuestionIds.length) {
        try {
          const { getQuestionById } = await import(
            "@/lib/services/questions/neon-question-repository"
          );
          const nextQuestion = await getQuestionById(
            safeQuestionIds[nextIndex],
          );
          currentQuestionPrompt = nextQuestion?.prompt;
        } catch (error) {
          console.error("Failed to load Neon question for interview message:", {
            error,
            nextIndex,
          });
        }
      }
    }

    const systemPrompt = generateSystemPrompt(interviewConfig, interviewer);
    const userPrompt = generateUserPrompt(
      processedMessage,
      conversationHistory || [],
      interviewConfig,
      currentQuestionCount,
      effectiveIsFollowUp,
      interviewer,
      currentQuestionPrompt,
    );

    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage: string;
    let usedFallback = false;
    let servedBankedQuestion = false;

    if (!aiResponse.success || !aiResponse.content) {
      console.warn("AI response failed, using fallback");
      finalMessage = getFallbackResponse(interviewConfig, effectiveIsFollowUp);
      usedFallback = true;
    } else {
      const validation = validateAIResponse(
        aiResponse.content,
        interviewConfig,
        effectiveIsFollowUp || shouldComplete,
      );

      if (!validation.isValid) {
        console.warn(`AI response validation failed: ${validation.reason}`);
        finalMessage = getFallbackResponse(
          interviewConfig,
          effectiveIsFollowUp,
        );
        usedFallback = true;
      } else {
        const contentForSequence = validation.sanitized ?? aiResponse.content;

        if (!interviewConfig.isDemoMode) {
          if (safeQuestionIds.length > 0) {
            const expectPrimaryQuestion =
              !effectiveIsFollowUp && !shouldComplete;
            const expectedIndex = currentQuestionCount + 1;

            const sequenceCheck = validateQuestionSequence(
              contentForSequence,
              expectedIndex,
              expectPrimaryQuestion,
            );

            if (!sequenceCheck.isValid) {
              console.warn(
                `AI question sequence validation failed: ${sequenceCheck.reason}`,
              );
              finalMessage = getFallbackResponse(
                interviewConfig,
                effectiveIsFollowUp,
              );
              usedFallback = true;
            } else {
              finalMessage = contentForSequence;
            }
          } else {
            finalMessage = contentForSequence;
          }
        } else {
          finalMessage = contentForSequence;
        }
      }
    }

    if (finalMessage) {
      finalMessage = finalMessage
        .replace(/\s*\[BANK_QUESTION_INDEX:\s*\d+\]\s*$/gi, "")
        .trim();
    }

    if (
      usedFallback &&
      !effectiveIsFollowUp &&
      !interviewConfig.isDemoMode &&
      !shouldComplete &&
      typeof currentQuestionPrompt === "string" &&
      currentQuestionPrompt.trim().length > 0
    ) {
      const extracted = extractCandidateFacingQuestionFromPrompt(
        currentQuestionPrompt,
      );
      const candidateFacing = extracted ?? currentQuestionPrompt.trim();
      finalMessage = candidateFacing;
      usedFallback = false;
      servedBankedQuestion = true;
    }

    if (
      !usedFallback &&
      !effectiveIsFollowUp &&
      !interviewConfig.isDemoMode &&
      conversationHistory &&
      Array.isArray(conversationHistory)
    ) {
      const history = conversationHistory as Message[];
      const normalizedNew = finalMessage.trim().toLowerCase();
      const previousAiMessages = history
        .filter((msg) => msg.type === "ai" && typeof msg.content === "string")
        .map((msg) => msg.content.trim().toLowerCase());

      const isExactRepeat = previousAiMessages.some(
        (content) => content === normalizedNew,
      );

      if (isExactRepeat) {
        console.warn(
          "🔁 Detected repeated AI question. Using fallback question instead to avoid repetition.",
        );
        finalMessage = getFallbackResponse(interviewConfig, false);
        usedFallback = true;
      }
    }

    const questionType = determineQuestionType(
      interviewConfig.interviewType,
      questionCount || 0,
    );

    console.log("🎯 Interview completion check:", {
      interviewMode: interviewConfig.interviewMode,
      questionCount,
      isFollowUp,
      maxQuestions,
      shouldComplete,
      totalQuestions,
      logic: `questionCount(${questionCount}) >= maxQuestions(${maxQuestions}) && !isFollowUp = ${shouldComplete}`,
    });

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: servedBankedQuestion ? true : aiResponse.success,
      isFollowUp: effectiveIsFollowUp,
      isComplete: shouldComplete,
      usedFallback,
      aiErrorType: usedFallback ? (aiResponse.error ?? "fallback") : undefined,
    });
  } catch (error) {
    console.error("Interview message API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message. Please try again.",
      },
      { status: 500 },
    );
  }
}
