import { NextResponse } from "next/server";
import { queryQuestions } from "@/lib/services/questions/neon-question-repository";
import type {
  DifficultyLevel,
  QuestionFilters,
  QuestionQueryOptions,
  QuestionStatus,
  QuestionType,
} from "@/types/practice-question";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;

    const topic = searchParams.get("topic") || undefined;
    const difficultyParam = searchParams.get("difficulty") || undefined;
    const typeParam = searchParams.get("type") || undefined;
    const companyName = searchParams.get("company") || undefined;
    const position = searchParams.get("position") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const statusParam = (searchParams.get("status") ||
      "published") as QuestionStatus;
    const orderByParam = searchParams.get("orderBy") || undefined;
    const orderDirectionParam = searchParams.get("orderDirection") || undefined;

    const filters: QuestionFilters = {
      topic,
      difficulty: difficultyParam as DifficultyLevel | undefined,
      type: typeParam as QuestionType | undefined,
      companyName,
      position,
      status: statusParam,
      tags: tag ? [tag] : undefined,
    };

    const options: QuestionQueryOptions = {
      filters,
      limit,
      orderBy: orderByParam as QuestionQueryOptions["orderBy"],
      orderDirection:
        orderDirectionParam as QuestionQueryOptions["orderDirection"],
    };

    const { questions, hasMore } = await queryQuestions(options);

    return NextResponse.json({
      success: true,
      questions,
      hasMore,
      count: questions.length,
    });
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
