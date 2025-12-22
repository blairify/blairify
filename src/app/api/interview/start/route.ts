import { type NextRequest, NextResponse } from "next/server";
import {
  determineQuestionType,
  generateSystemPrompt,
  generateUserPrompt,
  getDatabaseQuestionsPrompt,
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
  validateInterviewConfig,
} from "@/lib/interview";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import { validateAIResponse } from "@/lib/services/ai/response-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewConfig } = body;

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      console.error("❌ Interview configuration validation failed:", {
        errors: configValidation.errors,
        config: interviewConfig,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
          details: configValidation.errors,
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

    const { getQuestionCountForMode } = await import("@/lib/interview");
    const totalQuestions = getQuestionCountForMode(
      interviewConfig.interviewMode,
      interviewConfig.isDemoMode,
    );

    const baseUrl = request.nextUrl.origin;

    const { prompt: questionsPrompt, questionIds } =
      await getDatabaseQuestionsPrompt(
        interviewConfig,
        totalQuestions,
        baseUrl,
      );

    console.log("📚 Loaded questions from database:", {
      totalQuestions,
      loadedQuestions: questionIds.length,
      interviewMode: interviewConfig.interviewMode,
    });

    const systemPrompt =
      generateSystemPrompt(interviewConfig, interviewer) + questionsPrompt;

    let firstQuestionPrompt: string | undefined;

    if (
      Array.isArray(questionIds) &&
      questionIds.length > 0 &&
      !interviewConfig.isDemoMode
    ) {
      try {
        const { getQuestionById } = await import(
          "@/lib/services/questions/neon-question-repository"
        );
        const firstQuestion = await getQuestionById(questionIds[0]);
        firstQuestionPrompt = firstQuestion?.prompt;
      } catch (error) {
        console.error(
          "Failed to load first Neon question for interview start:",
          {
            error,
          },
        );
      }
    }

    const userPrompt = generateUserPrompt(
      "",
      [],
      interviewConfig,
      0,
      false,
      interviewer,
      firstQuestionPrompt,
    );

    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage = aiResponse.content;

    if (!aiResponse.success) {
      console.warn(`AI response failed: ${aiResponse.error}`);
      finalMessage = getFallbackResponse(interviewConfig, false);
    }

    if (typeof finalMessage === "string" && finalMessage.trim().length > 0) {
      const validation = validateAIResponse(finalMessage, interviewConfig, true);
      if (validation.isValid && validation.sanitized) {
        finalMessage = validation.sanitized;
      }
    }

    if (finalMessage) {
      finalMessage = finalMessage
        .replace(/\s*\[BANK_QUESTION_INDEX:\s*\d+\]\s*$/gi, "")
        .trim();
    }

    const questionType = determineQuestionType(
      interviewConfig.interviewType,
      0,
    );

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: aiResponse.success,
      interviewer: {
        id: interviewer.id,
        name: interviewer.name,
        avatarConfig: interviewer.avatarConfig,
      },
      questionIds,
    });
  } catch (error) {
    console.error("Interview start API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start interview. Please try again.",
      },
      { status: 500 },
    );
  }
}
