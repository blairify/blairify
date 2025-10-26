import { type NextRequest, NextResponse } from "next/server";
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

    // Generate initial interview prompt
    const systemPrompt = PromptGenerator.generateSystemPrompt(interviewConfig);
    const userPrompt = PromptGenerator.generateUserPrompt(
      "", // No initial message
      [], // No conversation history
      interviewConfig,
      0, // First question
      false, // Not a follow-up
    );

    // Get AI response for the first question
    const aiResponse = await aiClient.generateInterviewResponse(
      systemPrompt,
      userPrompt,
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
