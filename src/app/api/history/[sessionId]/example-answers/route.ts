import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  return NextResponse.json(
    {
      success: false,
      error:
        "Deprecated. Example answers are now generated during /results and persisted via saveInterviewResults.",
      sessionId,
    },
    { status: 410 },
  );
}
