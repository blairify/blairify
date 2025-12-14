import { NextResponse } from "next/server";
import { getQuestionById } from "@/lib/services/questions/neon-question-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 },
      );
    }

    const question = await getQuestionById(id);

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error fetching practice question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
