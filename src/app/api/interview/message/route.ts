import { type NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/services/ai/ai-client";
import { PromptGenerator } from "@/lib/services/ai/prompt-generator";
import { ResponseValidator } from "@/lib/services/ai/response-validator";
import { InterviewService } from "@/lib/services/interview/interview-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp = false,
    } = body;

    // Validate required fields
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

    // Generate prompts
    const systemPrompt = PromptGenerator.generateSystemPrompt(interviewConfig);
    const userPrompt = PromptGenerator.generateUserPrompt(
      message,
      conversationHistory || [],
      interviewConfig,
      questionCount || 0,
      isFollowUp,
    );

    // Get AI response
    const aiResponse = await aiClient.generateInterviewResponse(
      systemPrompt,
      userPrompt,
    );

    let finalMessage = aiResponse.content;

    // If AI failed, use fallback
    if (!aiResponse.success) {
      console.warn(`AI response failed: ${aiResponse.error}`);
      finalMessage = aiClient.getFallbackResponse(interviewConfig, isFollowUp);
    } else {
      // Validate AI response
      const validation = ResponseValidator.validateAIResponse(
        aiResponse.content,
        interviewConfig,
        isFollowUp,
      );

      if (!validation.isValid) {
        console.warn(`AI response validation failed: ${validation.reason}`);
        finalMessage = aiClient.getFallbackResponse(
          interviewConfig,
          isFollowUp,
        );
      } else if (validation.sanitized) {
        finalMessage = validation.sanitized;
      }
    }

    // Determine question type
    const questionType = InterviewService.determineQuestionType(
      interviewConfig.interviewType,
      questionCount || 0,
    );

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: aiResponse.success,
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
