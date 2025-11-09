import { type NextRequest, NextResponse } from "next/server";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import { aiClient } from "@/lib/services/ai/ai-client";
import { PromptGenerator } from "@/lib/services/ai/prompt-generator";
import { InterviewService } from "@/lib/services/interview/interview-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewConfig } = body;

    // Validate required fields
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    // Validate interview configuration
    const configValidation =
      InterviewService.validateInterviewConfig(interviewConfig);
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

    // Select interviewer based on role
    const interviewer = getInterviewerForRole(interviewConfig.position);

    // Get actual questions from database based on interview mode
    const { getQuestionCountForMode } = await import(
      "@/lib/utils/interview-helpers"
    );
    const totalQuestions = getQuestionCountForMode(
      interviewConfig.interviewMode,
      interviewConfig.isDemoMode,
    );

    // Fetch questions from practice library
    const { prompt: questionsPrompt, questionIds } =
      await PromptGenerator.getDatabaseQuestionsPrompt(
        interviewConfig,
        totalQuestions,
      );

    console.log("📚 Loaded questions from database:", {
      totalQuestions,
      loadedQuestions: questionIds.length,
      interviewMode: interviewConfig.interviewMode,
    });

    // Generate system prompt with actual questions
    const systemPrompt =
      PromptGenerator.generateSystemPrompt(interviewConfig, interviewer) +
      questionsPrompt;
    const userPrompt = PromptGenerator.generateUserPrompt(
      "", // No initial message
      [], // No conversation history
      interviewConfig,
      0, // First question
      false, // Not a follow-up
      interviewer, // Pass interviewer for name consistency
    );

    // Get AI response for the first question
    const aiResponse = await aiClient.generateInterviewResponse(
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage = aiResponse.content;

    // If AI failed, use fallback
    if (!aiResponse.success) {
      console.warn(`AI response failed: ${aiResponse.error}`);
      finalMessage = aiClient.getFallbackResponse(interviewConfig, false);
    }

    // Determine question type
    const questionType = InterviewService.determineQuestionType(
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
