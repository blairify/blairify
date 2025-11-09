/**
 * Unified Jobs API Route
 * Handles both simple featured jobs and advanced filtering
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Simple mode: just return featured jobs with limit
    const limit = searchParams.get("limit");
    if (limit && !searchParams.get("query") && !searchParams.get("location")) {
      const jobs = await prisma.job.findMany({
        orderBy: { datePosted: "desc" },
        take: parseInt(limit, 10),
      });
      return NextResponse.json({ jobs, success: true });
    }

    // Advanced mode: full filtering and pagination
    const query = searchParams.get("query");
    const location = searchParams.get("location");
    const level = searchParams.get("level");
    const type = searchParams.get("type");
    const remote = searchParams.get("remote");
    const company = searchParams.get("company");
    const category = searchParams.get("category");
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const perPage = Number.parseInt(searchParams.get("per_page") || "20", 10);

    // Build where clause for filtering
    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (level) {
      where.jobLevel = { contains: level, mode: "insensitive" };
    }

    if (type) {
      where.jobType = { contains: type, mode: "insensitive" };
    }

    if (remote !== null && remote !== undefined) {
      where.isRemote = remote === "true";
    }

    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    if (category) {
      where.jobFunction = { contains: category, mode: "insensitive" };
    }

    // Get total count for pagination
    const total = await prisma.job.count({ where });

    // Fetch jobs with pagination
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { datePosted: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return NextResponse.json({
      results: jobs,
      jobs, // Keep for backward compatibility
      success: true,
      page,
      per_page: perPage,
      total,
      page_count: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("API /jobs error:", error);
    return NextResponse.json(
      {
        jobs: [],
        success: false,
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
