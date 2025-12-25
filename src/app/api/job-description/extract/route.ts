import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { extractJobDescriptionData } from "@/lib/services/job-description/extractor";

type AnyRequest = NextRequest | Request;

async function readJsonBody(request: AnyRequest): Promise<unknown> {
  const candidate = request as {
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
  };

  if (typeof candidate.json === "function") {
    return candidate.json();
  }

  if (typeof candidate.text === "function") {
    const raw = await candidate.text();
    return raw ? JSON.parse(raw) : {};
  }

  throw new Error("UNSUPPORTED_BODY");
}

export async function POST(request: AnyRequest) {
  try {
    let body: unknown;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      const message =
        error instanceof Error && error.message === "UNSUPPORTED_BODY"
          ? "Unsupported request body."
          : "Invalid JSON body.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 },
      );
    }

    const payload =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const description = payload.description;

    if (typeof description !== "string" || description.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a job description with at least 50 characters.",
        },
        { status: 400 },
      );
    }

    const data = await extractJobDescriptionData(description);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Job description extraction failed:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues,
        },
        { status: 422 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyze job description.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
