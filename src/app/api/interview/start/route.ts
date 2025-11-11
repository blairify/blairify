import { type NextRequest, NextResponse } from "next/server";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import {
  generateSystemPrompt,
  generateUserPrompt,
  getDatabaseQuestionsPrompt,
} from "@/lib/services/ai/prompt-generator";
import {
  determineQuestionType,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";

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

    const interviewer = getInterviewerForRole(interviewConfig.position);

    const { getQuestionCountForMode } = await import(
      "@/lib/utils/interview-helpers"
    );
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
      "", // No initial message
      [], // No conversation history
      interviewConfig,
      0, // First question
      false, // Not a follow-up
      interviewer, // Pass interviewer for name consistency
    );

    // Get AI response for the first question
    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage = aiResponse.content;

    // If AI failed, use fallback
    if (!aiResponse.success) {
      console.warn(`AI response failed: ${aiResponse.error}`);
      finalMessage = getFallbackResponse(interviewConfig, false);
    }

    // Determine question type
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
