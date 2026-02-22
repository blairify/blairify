import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { extractJobDescriptionData } from "@/lib/services/job-description/extractor";
import { readJsonBody } from "../read-json-body";

export async function POST(request: Request) {
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
