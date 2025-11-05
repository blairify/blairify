/**
 * New Interview API Route Handler (v2)
 * Clean, thin controller that delegates to service layer
 */

import { type NextRequest, NextResponse } from "next/server";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import { aiClient } from "@/lib/services/ai/ai-client";
import { PromptGenerator } from "@/lib/services/ai/prompt-generator";
import { ResponseValidator } from "@/lib/services/ai/response-validator";
import { InterviewService } from "@/lib/services/interview/interview-service";
import type {
  InterviewApiRequest,
  InterviewApiResponse,
} from "@/types/interview";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<InterviewApiResponse>> {
  try {
    // Parse and validate request
    const body = (await request.json()) as InterviewApiRequest;
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp = false,
      checkFollowUpOnly = false,
    } = body;

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

    // Handle follow-up check requests
    if (checkFollowUpOnly) {
      const shouldFollow = InterviewService.shouldGenerateFollowUp(
        message,
        conversationHistory || [],
        interviewConfig,
        questionCount || 0,
      );

      return NextResponse.json({
        success: true,
        shouldFollowUp: shouldFollow,
      });
    }

    // Select interviewer based on role
    const interviewer = getInterviewerForRole(interviewConfig.position);

    // Generate prompts
    const systemPrompt = PromptGenerator.generateSystemPrompt(
      interviewConfig,
      interviewer,
    );
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
      interviewConfig.interviewType,
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
    console.error("Interview API error:", error);

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { success: false, error: "Request timed out" },
          { status: 408 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response. Please try again.",
      },
      { status: 500 },
    );
  }
}
