/**
 * New Interview Analysis API Route Handler
 * Clean, thin controller that delegates to service layer
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateAnalysis,
  generateMockAnalysisResponse,
  isAvailable,
} from "@/lib/services/ai/ai-client";
import { generateAnalysisSystemPrompt } from "@/lib/services/ai/prompt-generator";
import { parseAnalysis } from "@/lib/services/interview/analysis-service";
import {
  analyzeResponseQuality,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";
import { getResourcesByTags } from "@/lib/services/resources/neon-resource-repository";
import type {
  AnalyzeApiRequest,
  AnalyzeApiResponse,
  InterviewConfig,
  KnowledgeGap,
  Message,
  ResponseAnalysis,
} from "@/types/interview";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeApiResponse>> {
  try {
    // Parse and validate request
    const body = (await request.json()) as AnalyzeApiRequest;
    const { conversationHistory, interviewConfig } = body;

    // Validate required fields
    if (
      !conversationHistory ||
      !Array.isArray(conversationHistory) ||
      conversationHistory.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No conversation history provided" },
        { status: 400 },
      );
    }

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "No interview configuration provided" },
        { status: 400 },
      );
    }

    // Validate interview configuration
    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      console.error("❌ Analysis configuration validation failed:", {
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

    // Analyze response quality
    const responseAnalysis = analyzeResponseQuality(conversationHistory);

    // Generate analysis prompts
    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
      responseAnalysis,
    );

    let analysisText: string;

    // Try to get AI analysis
    if (isAvailable(aiClient)) {
      const aiResponse = await generateAnalysis(
        aiClient,
        systemPrompt,
        analysisPrompt,
      );

      if (aiResponse.success) {
        analysisText = aiResponse.content;
      } else {
        console.error(
          "AI analysis failed, falling back to mock:",
          aiResponse.error,
        );
        analysisText = generateMockAnalysisResponse(
          interviewConfig,
          responseAnalysis,
        );
      }
    } else {
      console.warn("AI service not available, using mock analysis");
      analysisText = generateMockAnalysisResponse(
        interviewConfig,
        responseAnalysis,
      );
    }

    // Parse analysis into structured feedback
    const feedback = parseAnalysis(
      analysisText,
      responseAnalysis,
      interviewConfig,
    );

    const knowledgeGaps = feedback.knowledgeGaps ?? [];
    const enrichedKnowledgeGaps: KnowledgeGap[] = await Promise.all(
      knowledgeGaps.map(async (gap) => {
        const resources = await getResourcesByTags(gap.tags, 5);
        return { ...gap, resources };
      }),
    );

    const enrichedFeedback = {
      ...feedback,
      ...(enrichedKnowledgeGaps.length > 0
        ? { knowledgeGaps: enrichedKnowledgeGaps }
        : {}),
    };

    return NextResponse.json({
      success: true,
      feedback: enrichedFeedback,
      rawAnalysis: analysisText,
    });
  } catch (error) {
    console.error("❌ Analysis API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Provide specific error messages
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { success: false, error: "Analysis request timed out" },
          { status: 408 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze interview responses. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Generate analysis prompt with conversation context
 */
function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  const passingThreshold = getPassingThreshold(config.seniority);

  return `Analyze this ${config.interviewType} interview for a ${config.seniority}-level ${config.position} position.

INTERVIEW TRANSCRIPT:
${conversation}

RESPONSE QUALITY ANALYSIS:
📊 Total Questions Asked: ${responseAnalysis.totalQuestions}
📝 Total Responses Given: ${responseAnalysis.totalResponses}
❌ Skipped Questions: ${responseAnalysis.skippedQuestions}
🚫 "I Don't Know" Responses: ${responseAnalysis.noAnswerResponses}
⚠️ Gibberish/Single-Word Responses: ${responseAnalysis.gibberishResponses}
📏 Very Short Responses (<20 chars): ${responseAnalysis.veryShortResponses}
✅ Substantive Responses: ${responseAnalysis.substantiveResponses}
📈 Effective Response Rate: ${responseAnalysis.effectiveResponseRate.toFixed(1)}%
🎯 Quality Score: ${responseAnalysis.qualityScore.toFixed(1)}/100
📊 Average Response Length: ${responseAnalysis.averageResponseLength.toFixed(0)} characters

CRITICAL ASSESSMENT FLAGS:
${
  responseAnalysis.substantiveResponses === 0
    ? "🚨 CRITICAL: ZERO substantive responses. This is an automatic FAIL. Score must be 0-10."
    : responseAnalysis.effectiveResponseRate < 30
      ? "🚨 CRITICAL: Under 30% effective responses. Strong FAIL likely. Maximum score should be 15-25."
      : responseAnalysis.effectiveResponseRate < 50
        ? "⚠️ WARNING: Under 50% effective responses. FAIL likely. Maximum score should be 25-40."
        : responseAnalysis.effectiveResponseRate < 70
          ? "⚠️ CAUTION: Under 70% effective responses. May fail if responses lack depth. Score caps around 50-60."
          : "✓ Adequate response rate. Now assess actual quality and correctness of content."
}

PASSING CRITERIA:
- Required Score: ${passingThreshold.score}/100
- ${passingThreshold.description}

INSTRUCTIONS:
1. Read EVERY response carefully
2. Score based ONLY on actual knowledge demonstrated
3. Give ZERO points for "I don't know", gibberish, or wrong answers
4. Identify specific examples of good and bad responses
5. Make a clear PASS or FAIL decision
6. Explain your decision with evidence

Remember: Be honest and strict. A bad hire costs companies hundreds of thousands of dollars. Only pass candidates who truly demonstrated the required knowledge.`;
}

function getPassingThreshold(seniority: string) {
  const thresholds = {
    entry: {
      score: 55,
      description:
        "Entry-level candidates must demonstrate basic understanding of fundamental concepts and eagerness to learn.",
    },
    junior: {
      score: 60,
      description:
        "Junior candidates must demonstrate basic understanding of core concepts and show learning potential.",
    },
    mid: {
      score: 70,
      description:
        "Mid-level candidates must show solid technical knowledge and independent problem-solving ability.",
    },
    senior: {
      score: 80,
      description:
        "Senior candidates must demonstrate deep expertise, architectural thinking, and leadership capability.",
    },
  };

  return thresholds[seniority as keyof typeof thresholds] || thresholds.mid;
}
