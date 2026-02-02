import { type NextRequest, NextResponse } from "next/server";
import {
  determineQuestionType,
  generateSystemPrompt,
  generateUserPrompt,
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
  getQuestionCountForMode,
  validateInterviewConfig,
} from "@/lib/interview";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import {
  validateAIResponse,
  validateQuestionSequence,
} from "@/lib/services/ai/response-validator";
import type { Message } from "@/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationHistory,
      interviewConfig,
      questionCount,
      totalQuestions,
      questionIds,
    } = body;

    // Validate required fields
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    // Validate interview configuration
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

    // Select interviewer based on role
    const interviewer = interviewConfig.specificCompany
      ? getInterviewerForCompanyAndRole(
          interviewConfig.specificCompany,
          interviewConfig.position,
        )
      : getInterviewerForRole(interviewConfig.position);

    const safeQuestionIds: string[] =
      Array.isArray(questionIds) && questionIds.length > 0 ? questionIds : [];

    const shouldUseQuestionBank =
      safeQuestionIds.length > 0 &&
      interviewConfig.interviewType !== "situational" &&
      interviewConfig.interviewType !== "mixed" &&
      !interviewConfig.isDemoMode;

    let currentQuestionPrompt: string | undefined;

    if (shouldUseQuestionBank) {
      const nextIndex = questionCount || 0;

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
          console.error("Failed to load Neon question for skip route:", {
            error,
            nextIndex,
          });
        }
      }
    }

    // Generate next question after skipping
    const systemPrompt = generateSystemPrompt(interviewConfig, interviewer);
    const userPrompt = generateUserPrompt(
      "I do not know the answer. I'd like to skip this question and move to the next one.",
      conversationHistory || [],
      interviewConfig,
      questionCount || 0,
      false, // Not a follow-up
      interviewer,
      currentQuestionPrompt,
    );

    // Get AI response for the next question
    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage: string;

    if (!aiResponse.success || !aiResponse.content) {
      console.warn("AI response failed on skip, using fallback");
      finalMessage = getFallbackResponse(interviewConfig, false);
    } else {
      const validation = validateAIResponse(
        aiResponse.content,
        interviewConfig,
        false,
      );

      if (!validation.isValid) {
        console.warn(
          `AI response validation failed on skip: ${validation.reason}`,
        );
        finalMessage = getFallbackResponse(interviewConfig, false);
      } else {
        const contentForSequence = validation.sanitized ?? aiResponse.content;

        if (!shouldUseQuestionBank) {
          finalMessage = contentForSequence;
        } else {
          const expectedIndex = (questionCount || 0) + 1;

          const sequenceCheck = validateQuestionSequence(
            contentForSequence,
            expectedIndex,
            true,
          );

          if (!sequenceCheck.isValid) {
            console.warn(
              `AI question sequence validation failed on skip: ${sequenceCheck.reason}`,
            );
            finalMessage = getFallbackResponse(interviewConfig, false);
          } else {
            finalMessage = contentForSequence;
          }
        }
      }
    }

    if (finalMessage) {
      finalMessage = finalMessage
        .replace(/\s*\[BANK_QUESTION_INDEX:\s*\d+\]\s*$/gi, "")
        .trim();
    }

    if (
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
          "🔁 Detected repeated AI question on skip. Using fallback question instead to avoid repetition.",
        );
        finalMessage = getFallbackResponse(interviewConfig, false);
      }
    }

    // Determine question type
    const questionType = determineQuestionType(
      interviewConfig.interviewType,
      (questionCount || 0) + 1,
    );

    const maxQuestions =
      totalQuestions ||
      getQuestionCountForMode(
        interviewConfig.interviewMode,
        interviewConfig.isDemoMode,
      );
    const shouldComplete = (questionCount || 0) >= maxQuestions;

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: aiResponse.success,
      isComplete: shouldComplete,
    });
  } catch (error) {
    console.error("Interview skip API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to skip question. Please try again.",
      },
      { status: 500 },
    );
  }
}
