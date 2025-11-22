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

    const { prompt: questionsPrompt, questionIds } =
      await getDatabaseQuestionsPrompt(interviewConfig, totalQuestions);

    console.log("📚 Loaded questions from database:", {
      totalQuestions,
      loadedQuestions: questionIds.length,
      interviewMode: interviewConfig.interviewMode,
    });

    const systemPrompt =
      generateSystemPrompt(interviewConfig, interviewer) + questionsPrompt;
    const userPrompt = generateUserPrompt(
      "",
      [],
      interviewConfig,
      0,
      false,
      interviewer,
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
