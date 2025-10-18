/**
 * Jobs API Route
 * Retrieves cached jobs from Firestore
 */

import { NextResponse } from "next/server";
import {
  filterCachedJobs,
  getCachedJobs,
  needsCacheRefresh,
  searchCachedJobs,
} from "@/lib/jobs-cache-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("query");
    const location = searchParams.get("location");
    const level = searchParams.get("level");
    const type = searchParams.get("type");
    const remote = searchParams.get("remote");
    const company = searchParams.get("company");
    const category = searchParams.get("category");
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const perPage = Number.parseInt(searchParams.get("per_page") || "20", 10);

    // Check if cache needs refresh
    const needsRefresh = await needsCacheRefresh(24); // 24 hours

    let jobs: Awaited<ReturnType<typeof getCachedJobs>>;

    // If we have a search query, use search
    if (query) {
      jobs = await searchCachedJobs(query);
    }
    // If we have filters, use filter
    else if (location || level || type || remote || company || category) {
      jobs = await filterCachedJobs({
        location: location || undefined,
        level: level || undefined,
        type: type || undefined,
        remote:
          remote === "true" ? true : remote === "false" ? false : undefined,
        company: company || undefined,
        category: category || undefined,
      });
    }
    // Otherwise get all jobs
    else {
      jobs = await getCachedJobs();
    }

    // Pagination
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const paginatedJobs = jobs.slice(startIdx, endIdx);

    return NextResponse.json({
      results: paginatedJobs,
      page,
      per_page: perPage,
      total: jobs.length,
      page_count: Math.ceil(jobs.length / perPage),
      cache_needs_refresh: needsRefresh,
    });
  } catch (error) {
    console.error("API /jobs error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
