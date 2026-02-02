import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateInterviewResponse,
} from "@/lib/services/ai/ai-client";
import { getQuestionById } from "@/lib/services/questions/neon-question-repository";
import type { InterviewConfig } from "@/types/interview";
import type {
  CodeQuestion,
  OpenQuestion,
  Question,
  TrueFalseQuestion,
} from "@/types/practice-question";

export const runtime = "nodejs";

type ExampleAnswersRequest = {
  interviewConfig: InterviewConfig;
  items: Array<{
    questionId?: string;
    questionText: string;
  }>;
};

function getExampleAnswerFromQuestion(question: Question): string {
  switch (question.type) {
    case "open": {
      const open = question as OpenQuestion;
      const fromReference = (open.referenceAnswers ?? [])
        .map((r) => r.text)
        .find((t) => t.trim().length > 0);
      return (fromReference ?? open.description ?? "").trim();
    }
    case "code": {
      const code = question as CodeQuestion;
      return (code.description ?? "").trim();
    }
    case "truefalse": {
      const tf = question as TrueFalseQuestion;
      const explanation = (tf.explanation ?? "").trim();
      if (explanation.length > 0) return explanation;
      return (tf.description ?? "").trim();
    }
    case "mcq":
    case "matching": {
      return (question.description ?? "").trim();
    }
    default: {
      const _never: never = question;
      throw new Error(`Unhandled question type: ${String(_never)}`);
    }
  }
}

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

    const items = Array.isArray(body.items)
      ? body.items
          .map((i) => {
            const questionId =
              typeof i?.questionId === "string" ? i.questionId.trim() : "";
            const questionText =
              typeof i?.questionText === "string" ? i.questionText.trim() : "";
            if (!questionText) return null;
            return {
              questionId: questionId.length > 0 ? questionId : undefined,
              questionText,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
      : [];

    if (items.length === 0) {
      return NextResponse.json({ success: true, answers: [] });
    }

    const systemPrompt = buildSystemPrompt(config);

    const answers = await Promise.all(
      items.map(async (item) => {
        const dbAnswer = await (async () => {
          if (!item.questionId) return "";
          const q = await getQuestionById(item.questionId);
          if (!q) return "";
          return sanitizeExampleAnswer(getExampleAnswerFromQuestion(q));
        })();

        if (dbAnswer.trim().length > 0) return dbAnswer;

        const res = await generateInterviewResponse(
          aiClient,
          systemPrompt,
          buildUserPrompt(item.questionText),
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
