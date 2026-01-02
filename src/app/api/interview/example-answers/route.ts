import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateInterviewResponse,
} from "@/lib/services/ai/ai-client";
import type { InterviewConfig } from "@/types/interview";

export const runtime = "nodejs";

type ExampleAnswersRequest = {
  interviewConfig: InterviewConfig;
  questions: string[];
};

function sanitizeExampleAnswer(value: string): string {
  const raw = value.trim();
  if (!raw) return raw;

  const withoutXmlAnalysis = raw.replace(
    /<analysis>[\s\S]*?<\/analysis>/gi,
    "",
  );
  const withoutFencedAnalysis = withoutXmlAnalysis.replace(
    /```\s*analysis[\s\S]*?```/gi,
    "",
  );

  return withoutFencedAnalysis
    .replace(/^\s*(example\s+answer|answer)\s*:\s*/i, "")
    .trim();
}

function buildSystemPrompt(config: InterviewConfig): string {
  return `You are an expert interviewer and senior engineer.

Write a concise, high-quality example answer for a single interview question.

Rules:
- Output ONLY the answer body. No title. No labels like "Example Answer:".
- Prefer structured explanation with short paragraphs.
- If relevant, include a small code snippet (no code fences) but keep it short.
- Be accurate and role-appropriate.

Context:
- Role: ${config.position}
- Seniority: ${config.seniority}
- Interview type: ${config.interviewType}`;
}

function buildUserPrompt(question: string): string {
  return `Question:\n${question}\n\nWrite the example answer now.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ExampleAnswersRequest>;

    if (!body?.interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Missing interviewConfig" },
        { status: 400 },
      );
    }

    const config = body.interviewConfig;

    const questions = Array.isArray(body.questions)
      ? body.questions
          .map((q) => (typeof q === "string" ? q.trim() : ""))
          .filter(Boolean)
      : [];

    if (questions.length === 0) {
      return NextResponse.json({ success: true, answers: [] });
    }

    const systemPrompt = buildSystemPrompt(config);

    const answers = await Promise.all(
      questions.map(async (q) => {
        const res = await generateInterviewResponse(
          aiClient,
          systemPrompt,
          buildUserPrompt(q),
          config.interviewType,
        );

        if (!res.success) return "";
        return sanitizeExampleAnswer(res.content);
      }),
    );

    return NextResponse.json({ success: true, answers });
  } catch (error) {
    console.error("Example answers API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate example answers" },
      { status: 500 },
    );
  }
}
