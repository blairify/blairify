import { type NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/services/ai/ai-client";
import { PromptGenerator } from "@/lib/services/ai/prompt-generator";
import { InterviewService } from "@/lib/services/interview/interview-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory, interviewConfig, questionCount } = body;

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
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Generate next question after skipping
    const systemPrompt = PromptGenerator.generateSystemPrompt(interviewConfig);
    const userPrompt = PromptGenerator.generateUserPrompt(
      "I'd like to skip this question and move to the next one.",
      conversationHistory || [],
      interviewConfig,
      (questionCount || 0) + 1, // Increment question count
      false, // Not a follow-up
    );

    // Get AI response for the next question
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
      (questionCount || 0) + 1,
    );

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: aiResponse.success,
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
