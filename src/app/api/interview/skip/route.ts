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
import { validateAIResponse } from "@/lib/services/ai/response-validator";
import type { Message } from "@/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationHistory,
      interviewConfig,
      questionCount,
      totalQuestions,
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

    // Generate next question after skipping
    const systemPrompt = generateSystemPrompt(interviewConfig, interviewer);
    const userPrompt = generateUserPrompt(
      "I do not know the answer. I'd like to skip this question and move to the next one.",
      conversationHistory || [],
      interviewConfig,
      (questionCount || 0) + 1, // Increment question count
      false, // Not a follow-up
      interviewer,
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
      } else if (validation.sanitized) {
        finalMessage = validation.sanitized;
      } else {
        finalMessage = aiResponse.content;
      }
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
