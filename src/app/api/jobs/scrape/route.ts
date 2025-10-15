import { spawn } from "node:child_process";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export interface JobSearchRequest {
  search_term: string;
  location?: string;
  site_names?: string[];
  results_wanted?: number;
  job_type?: "fulltime" | "parttime" | "internship" | "contract";
  is_remote?: boolean;
  hours_old?: number;
  distance?: number;
  country_indeed?: string;
  easy_apply?: boolean;
  linkedin_fetch_description?: boolean;
  google_search_term?: string;
  description_format?: "markdown" | "html";
  offset?: number;
  enforce_annual_salary?: boolean;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  company_url?: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    full_location?: string;
  };
  job_url?: string;
  is_remote: boolean;
  job_type?: string;
  description?: string;
  salary: {
    min_amount?: number;
    max_amount?: number;
    interval?: string;
    currency?: string;
  };
  date_posted?: string;
  site: string;
  scraped_at: string;
  search_term: string;
  search_location: string;
  company_industry?: string;
  job_level?: string;
  emails?: string[];
  skills?: string[];
}

export interface JobSearchResponse {
  success: boolean;
  data?: JobData[];
  count?: number;
  error?: string;
  message?: string;
}

/**
 * Interface for the raw request body from the client
 * All fields are optional strings/primitives as they come from JSON
 */
export interface JobSearchRequestBody {
  search_term?: string;
  location?: string;
  site_names?: string[];
  results_wanted?: string | number;
  job_type?: string;
  is_remote?: boolean;
  hours_old?: string | number;
  distance?: string | number;
  country_indeed?: string;
  easy_apply?: boolean;
  linkedin_fetch_description?: boolean;
  google_search_term?: string;
  description_format?: string;
  offset?: string | number;
  enforce_annual_salary?: boolean;
}

/**
 * Execute the job scraper via Python API or local script
 */
async function executeJobScraper(params: JobSearchRequest): Promise<JobData[]> {
  // In production (Vercel), use the Python API endpoint
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      // Get the base URL for the current deployment
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "https://grant-guide.vercel.app";

      const apiUrl = `${baseUrl}/api`;

      console.log("Calling Python API at:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        // Add timeout for serverless function
        signal: AbortSignal.timeout(55000), // 55 seconds timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Python API responded with status: ${response.status}, body: ${errorText}`,
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data.jobs || [];
      } else {
        throw new Error(result.error?.message || "Python API returned error");
      }
    } catch (error) {
      console.error("Python API error:", error);
      throw new Error(
        `Failed to call Python API: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // In development, use local Python script
  return new Promise((resolve, reject) => {
    const pythonPath =
      process.env.PYTHON_PATH ||
      path.join(process.cwd(), ".venv", "bin", "python");
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "jobspy_api_bridge.py",
    );

    const child = spawn(pythonPath, [scriptPath, JSON.stringify(params)], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          if (result.success) {
            resolve(result.data || []);
          } else {
            reject(new Error(result.error || "Unknown error occurred"));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON response: ${error}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });

    child.on("error", (error) => {
      console.error("Python spawn error:", {
        pythonPath,
        scriptPath,
        error: error.message,
        cwd: process.cwd(),
      });
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });
  });
}

/**
 * Validate job search request parameters
 */
function validateJobSearchRequest(
  body: JobSearchRequestBody,
): JobSearchRequest | null {
  if (!body.search_term || typeof body.search_term !== "string") {
    return null;
  }

  const validJobTypes = [
    "fulltime",
    "parttime",
    "internship",
    "contract",
  ] as const;
  const validSites = [
    "indeed",
    "linkedin",
    "zip_recruiter",
    "google",
    "glassdoor",
    "bayt",
    "naukri",
    "bdjobs",
  ];
  const validDescriptionFormats = ["markdown", "html"] as const;

  // Helper function to safely parse integers
  const safeParseInt = (
    value: string | number | undefined,
    defaultValue: number,
  ): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // Helper function to check if job type is valid
  const isValidJobType = (
    type: string | undefined,
  ): type is "fulltime" | "parttime" | "internship" | "contract" => {
    return (
      type !== undefined && (validJobTypes as readonly string[]).includes(type)
    );
  };

  // Helper function to check if description format is valid
  const isValidDescriptionFormat = (
    format: string | undefined,
  ): format is "markdown" | "html" => {
    return (
      format !== undefined &&
      (validDescriptionFormats as readonly string[]).includes(format)
    );
  };

  return {
    search_term: body.search_term,
    location: body.location || "",
    site_names: Array.isArray(body.site_names)
      ? body.site_names.filter((site: string) => validSites.includes(site))
      : ["indeed", "linkedin", "zip_recruiter"],
    results_wanted: Math.min(
      Math.max(1, safeParseInt(body.results_wanted, 20)),
      100,
    ), // Limit to 100
    job_type: isValidJobType(body.job_type) ? body.job_type : undefined,
    is_remote: typeof body.is_remote === "boolean" ? body.is_remote : undefined,
    hours_old: body.hours_old
      ? Math.max(1, safeParseInt(body.hours_old, 0))
      : undefined,
    distance: Math.max(1, safeParseInt(body.distance, 50)),
    country_indeed: body.country_indeed || "USA",
    easy_apply:
      typeof body.easy_apply === "boolean" ? body.easy_apply : undefined,
    linkedin_fetch_description:
      typeof body.linkedin_fetch_description === "boolean"
        ? body.linkedin_fetch_description
        : false,
    google_search_term: body.google_search_term || undefined,
    description_format: isValidDescriptionFormat(body.description_format)
      ? body.description_format
      : "markdown",
    offset: Math.max(0, safeParseInt(body.offset, 0)),
    enforce_annual_salary:
      typeof body.enforce_annual_salary === "boolean"
        ? body.enforce_annual_salary
        : true,
  };
}

/**
 * POST /api/jobs/scrape
 * Scrape jobs from various job boards
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<JobSearchResponse>> {
  try {
    const body = await request.json();
    console.log("Job search request:", body);

    // Validate request
    const params = validateJobSearchRequest(body);
    if (!params) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters. search_term is required.",
        },
        { status: 400 },
      );
    }

    // Execute job scraping
    const jobs = await executeJobScraper(params);

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
      message: `Successfully scraped ${jobs.length} jobs`,
    });
  } catch (error) {
    console.error("Job scraping error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/jobs/scrape
 * Get available job scraping options and status
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: "Job scraping API endpoint",
    supported_sites: [
      "indeed",
      "linkedin",
      "zip_recruiter",
      "google",
      "glassdoor",
      "bayt",
      "naukri",
      "bdjobs",
    ],
    supported_job_types: ["fulltime", "parttime", "internship", "contract"],
    supported_countries: [
      "Argentina",
      "Australia",
      "Austria",
      "Bahrain",
      "Belgium",
      "Brazil",
      "Canada",
      "Chile",
      "China",
      "Colombia",
      "Costa Rica",
      "Czech Republic",
      "Denmark",
      "Ecuador",
      "Egypt",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hong Kong",
      "Hungary",
      "India",
      "Indonesia",
      "Ireland",
      "Israel",
      "Italy",
      "Japan",
      "Kuwait",
      "Luxembourg",
      "Malaysia",
      "Mexico",
      "Morocco",
      "Netherlands",
      "New Zealand",
      "Nigeria",
      "Norway",
      "Oman",
      "Pakistan",
      "Panama",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Qatar",
      "Romania",
      "Saudi Arabia",
      "Singapore",
      "South Africa",
      "South Korea",
      "Spain",
      "Sweden",
      "Switzerland",
      "Taiwan",
      "Thailand",
      "Turkey",
      "Ukraine",
      "United Arab Emirates",
      "UK",
      "USA",
      "Uruguay",
      "Venezuela",
      "Vietnam",
    ],
    example_request: {
      search_term: "software engineer",
      location: "San Francisco, CA",
      site_names: ["indeed", "linkedin"],
      results_wanted: 20,
      job_type: "fulltime",
      hours_old: 72,
      is_remote: false,
      distance: 50,
      country_indeed: "USA",
    },
  });
}
