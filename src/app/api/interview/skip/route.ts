import { type NextRequest, NextResponse } from "next/server";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import { aiClient } from "@/lib/services/ai/ai-client";
import { PromptGenerator } from "@/lib/services/ai/prompt-generator";
import {
  determineQuestionType,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";
import { getQuestionCountForMode } from "@/lib/utils/interview-helpers";

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
    const interviewer = getInterviewerForRole(interviewConfig.position);

    // Generate next question after skipping
    const systemPrompt = PromptGenerator.generateSystemPrompt(
      interviewConfig,
      interviewer,
    );
    const userPrompt = PromptGenerator.generateUserPrompt(
      "I do not know the answer. I'd like to skip this question and move to the next one.",
      conversationHistory || [],
      interviewConfig,
      (questionCount || 0) + 1, // Increment question count
      false, // Not a follow-up
      interviewer,
    );

    // Get AI response for the next question
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
    const questionType = determineQuestionType(
      interviewConfig.interviewType,
      (questionCount || 0) + 1,
    );

    // Check if interview should complete based on question count
    const nextQuestionCount = (questionCount || 0) + 1;
    const maxQuestions =
      totalQuestions ||
      getQuestionCountForMode(
        interviewConfig.interviewMode,
        interviewConfig.isDemoMode,
      );
    const shouldComplete = nextQuestionCount >= maxQuestions;

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
