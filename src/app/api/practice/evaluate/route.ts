/**
 * API Route: Evaluate Practice Answer
 * POST /api/practice/evaluate
 */

import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/services/evaluation/evaluation-service";
import type { Question, UserAnswer } from "@/types/practice-question";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, userAnswer, apiKey } = body as {
      question: Question;
      userAnswer: UserAnswer;
      apiKey?: string;
    };

    // Validate input
    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: "Missing required fields: question, userAnswer" },
        { status: 400 },
      );
    }

    // Get API key from environment or request
    const llmApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!llmApiKey) {
      return NextResponse.json(
        { error: "LLM API key not configured" },
        { status: 500 },
      );
    }

    // Perform evaluation
    const evaluationResult = await evaluateAnswer(question, userAnswer, {
      apiKey: llmApiKey,
    });

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
    });
  } catch (error) {
    console.error("Evaluation API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate answer",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
