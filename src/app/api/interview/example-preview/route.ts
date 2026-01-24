import { type NextRequest, NextResponse } from "next/server";
import { getRelevantQuestionsForInterview } from "@/lib/services/interview/interview-question-selector";
import { getQuestionById } from "@/lib/services/questions/neon-question-repository";
import type { InterviewConfig } from "@/types/interview";
import type {
  CodeQuestion,
  OpenQuestion,
  Question,
  TrueFalseQuestion,
} from "@/types/practice-question";

export const runtime = "nodejs";

type ExamplePreviewRequest = {
  interviewConfig: InterviewConfig;
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
    .replace(/Copy code/gi, "")
    .trim();
}

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ExamplePreviewRequest>;

    if (!body?.interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Missing interviewConfig" },
        { status: 400 },
      );
    }

    const config = body.interviewConfig;
    const normalizedConfig: InterviewConfig = {
      ...config,
      technologies: Array.isArray(config.technologies)
        ? config.technologies
        : [],
    };
    const baseUrl = request.nextUrl.origin;

    const [question] = await getRelevantQuestionsForInterview(
      normalizedConfig,
      1,
      baseUrl,
    );

    if (!question) {
      return NextResponse.json({
        success: true,
        example: null,
      });
    }

    const fullQuestion = await getQuestionById(question.id);
    const dbAnswer = fullQuestion
      ? getExampleAnswerFromQuestion(fullQuestion)
      : "";
    const answer =
      dbAnswer.trim().length > 0 ? sanitizeExampleAnswer(dbAnswer) : "";

    return NextResponse.json({
      success: true,
      example: {
        question: {
          id: question.id,
          description: question.description,
        },
        answer,
      },
    });
  } catch (error) {
    console.error("Example preview API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate example preview" },
      { status: 500 },
    );
  }
}
