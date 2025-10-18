/**
 * Jobs Scraping API Route
 * Scrapes jobs from Muse API and caches them in Firestore
 */

import { NextResponse } from "next/server";
import {
  type CachedJob,
  cacheJobs,
  clearExpiredJobs,
  saveJobsMetadata,
} from "@/lib/jobs-cache-service";

interface MuseJob {
  id: number;
  name: string;
  company: {
    name: string;
    id?: number;
  };
  locations: Array<{ name: string }>;
  levels: Array<{ name: string }>;
  categories: Array<{ name: string }>;
  refs: {
    landing_page: string;
  };
  publication_date: string;
  type?: string;
}

interface MuseApiResponse {
  results: MuseJob[];
  page: number;
  page_count: number;
  total: number;
}

const programmingKeywords = [
  "front end",
  "frontend",
  "back end",
  "backend",
  "full stack",
  "full-stack",
  "devops",
  "software engineer",
  "developer",
  "programmer",
  "mobile",
  "ios",
  "android",
  "react",
  "vue",
  "angular",
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "php",
  "golang",
  "go",
  "scala",
  "swift",
  "kotlin",
  "docker",
  "kubernetes",
  "cloud",
  "aws",
  "azure",
  "gcp",
  "machine learning",
  "ml",
  "data engineer",
  "backend engineer",
  "frontend engineer",
  "site reliability engineer",
  "sre",
];

/**
 * Check if a job is programming-related
 */
function isProgrammingJob(job: MuseJob): boolean {
  const title = job.name.toLowerCase();
  const categories = job.categories.map((c) => c.name.toLowerCase()).join(" ");

  return programmingKeywords.some(
    (kw) => title.includes(kw) || categories.includes(kw),
  );
}

/**
 * Fetch jobs from Muse API
 */
async function fetchMuseJobs(
  page: number,
  perPage = 100,
): Promise<MuseApiResponse> {
  const url = `${process.env.NEXT_PUBLIC_MUSE_API_BASE}?page=${page}&per_page=${perPage}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Blairify Job Scraper",
    },
  });

  if (!response.ok) {
    throw new Error(`Muse API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Scrape all jobs from Muse API
 */
async function scrapeAllJobs(maxPages = 50): Promise<CachedJob[]> {
  const allJobs: CachedJob[] = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= Math.min(maxPages, totalPages)) {
    try {
      const data = await fetchMuseJobs(currentPage, 100);
      totalPages = data.page_count;

      // Filter for programming jobs with landing pages
      const programmingJobs = data.results.filter(
        (job) => job.refs?.landing_page && isProgrammingJob(job),
      );

      // Transform to CachedJob format
      const cachedJobs: Omit<CachedJob, "cachedAt" | "expiresAt">[] =
        programmingJobs.map((job) => ({
          id: job.id.toString(),
          name: job.name,
          company: job.company,
          locations: job.locations,
          levels: job.levels,
          categories: job.categories.map((c) => c.name),
          refs: job.refs,
          publication_date: job.publication_date,
          type: job.type,
          remote: job.locations.some((l) =>
            l.name.toLowerCase().includes("remote"),
          ),
          source: "muse_api" as const,
        }));

      allJobs.push(...(cachedJobs as CachedJob[]));

      // Rate limiting - wait 500ms between requests
      if (currentPage < totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      currentPage++;
    } catch (error) {
      console.error(`Error scraping page ${currentPage}:`, error);
      break;
    }
  }

  return allJobs;
}

/**
 * POST /api/jobs/scrape
 * Trigger job scraping manually or via cron
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Check for authorization (optional - add API key check here)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.CRON_SECRET;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear expired jobs first
    const expiredCount = await clearExpiredJobs();

    // Scrape new jobs
    const jobs = await scrapeAllJobs(50); // Scrape up to 50 pages

    // Cache jobs in Firestore
    if (jobs.length > 0) {
      await cacheJobs(jobs);
    }

    // Save metadata
    const duration = Date.now() - startTime;
    await saveJobsMetadata({
      totalJobsCached: jobs.length,
      scrapeDuration: duration,
      jobsScraped: jobs.length,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      jobsScraped: jobs.length,
      expiredJobsCleared: expiredCount,
      duration: `${(duration / 1000).toFixed(2)}s`,
    });
  } catch (error) {
    console.error("❌ Scrape error:", error);

    const duration = Date.now() - startTime;
    await saveJobsMetadata({
      totalJobsCached: 0,
      scrapeDuration: duration,
      jobsScraped: 0,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "Failed to scrape jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/jobs/scrape
 * Get scrape status and metadata
 */
export async function GET() {
  try {
    const { getCacheStats } = await import("@/lib/jobs-cache-service");
    const stats = await getCacheStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get scrape status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
