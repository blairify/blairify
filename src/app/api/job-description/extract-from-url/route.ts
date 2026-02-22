import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { extractJobDescriptionData } from "@/lib/services/job-description/extractor";
import { detectPlatform, scrapeJobUrl } from "@/lib/services/job-scraper";
import { readJsonBody } from "../read-json-body";

function sanitizeErrorForUser(error: unknown): string {
  if (!(error instanceof Error))
    return "Something went wrong while loading this page.";
  const msg = error.message;
  if (msg.includes("net::ERR_"))
    return "Could not connect to this website. It may be blocking automated access.";
  if (msg.includes("timeout") || msg.includes("Timeout"))
    return "The page took too long to load. Try again or paste the job description directly.";
  if (msg.includes("navigation") || msg.includes("goto"))
    return "Could not navigate to this page. The URL may be invalid or the site may be down.";
  return msg;
}

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
    const url = payload.url;

    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a job URL." },
        { status: 400 },
      );
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, error: "Please use a valid https:// URL." },
        { status: 400 },
      );
    }

    const platform = detectPlatform(trimmedUrl);
    if (platform === "unsupported") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This URL isn't supported. Try LinkedIn, Indeed, JustJoin, Google Jobs, ZipRecruiter, or FlexJobs.",
        },
        { status: 400 },
      );
    }

    let jobText: string;
    try {
      jobText = await scrapeJobUrl(trimmedUrl);
    } catch (scrapeError) {
      console.error("Scraping failed:", scrapeError);
      return NextResponse.json(
        { success: false, error: sanitizeErrorForUser(scrapeError) },
        { status: 422 },
      );
    }

    if (!jobText || jobText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract enough content from this page. Try pasting the job description directly instead.",
        },
        { status: 422 },
      );
    }

    console.log(
      `[extract-from-url] Scraped ${jobText.length} chars from ${platform}`,
    );

    const data = await extractJobDescriptionData(jobText);

    if (!data.jobDescription?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We scraped the page but couldn't extract a usable job description. Try pasting the job description directly instead.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Job URL extraction failed:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 422 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyze job from URL.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
