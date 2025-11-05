import { NextResponse } from "next/server";
import { getFeaturedJobs } from "@/lib/services/landing-page-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    const jobs = await getFeaturedJobs(limit);

    return NextResponse.json({ jobs, success: true });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { jobs: [], success: false, error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
