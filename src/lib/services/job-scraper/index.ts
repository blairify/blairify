import {
  assembleFromJsonLd,
  extractJsonLd,
  isJobPostingSufficient,
} from "./json-ld";
import type { Platform } from "./types";

export type { Platform };

const PLATFORM_PATTERNS: [RegExp, Platform][] = [
  [/linkedin\.com/i, "linkedin"],
  [/indeed\.com|indeed\.[a-z]{2,}/i, "indeed"],
  [/justjoin\.it/i, "justjoin"],
  [/jobs\.google\.com|google\.com\/about\/careers/i, "google-jobs"],
  [/ziprecruiter\.[a-z]{2,}/i, "ziprecruiter"],
  [/flexjobs\.com/i, "flexjobs"],
];

export function detectPlatform(url: string): Platform {
  for (const [pattern, platform] of PLATFORM_PATTERNS) {
    if (pattern.test(url)) return platform;
  }
  return "unsupported";
}

function normalizeUrl(url: string, platform: Platform): string {
  if (platform === "linkedin") {
    // /jobs/collections/recommended/?currentJobId=123 → /jobs/view/123
    // /jobs/search/?currentJobId=123 → /jobs/view/123
    const parsed = new URL(url);
    const currentJobId = parsed.searchParams.get("currentJobId");
    if (currentJobId && !/\/jobs\/view\//.test(parsed.pathname)) {
      return `https://www.linkedin.com/jobs/view/${currentJobId}/`;
    }
  }
  return url;
}

function validateJobUrl(url: string, platform: Platform): void {
  const parsed = new URL(url);
  const path = parsed.pathname;

  switch (platform) {
    case "flexjobs":
      // Only accept /job/ or /jobs/ detail pages, reject /search
      if (/\/search/i.test(path)) {
        throw new Error(
          "This looks like a search page, not a specific job listing. Please paste the URL of a single job posting from FlexJobs.",
        );
      }
      break;
    case "linkedin":
      // After normalization, should be /jobs/view/ID
      if (!/\/jobs\/view\/\d+/i.test(path)) {
        throw new Error(
          "This looks like a LinkedIn feed or search page. Please paste the URL of a specific job posting (e.g. linkedin.com/jobs/view/123456).",
        );
      }
      break;
    case "indeed":
      if (/\/jobs\?/i.test(url) && !/\/viewjob/i.test(url)) {
        throw new Error(
          "This looks like an Indeed search page. Please paste the URL of a specific job posting.",
        );
      }
      break;
    case "ziprecruiter":
      if (/\/search/i.test(path) || /\/jobs\/?$/i.test(path)) {
        throw new Error(
          "This looks like a ZipRecruiter search page. Please paste the URL of a specific job posting.",
        );
      }
      break;
    case "justjoin":
    case "google-jobs":
    case "unsupported":
      break;
    default: {
      const _never: never = platform;
      throw new Error(`Unhandled platform: ${_never}`);
    }
  }
}

export async function scrapeJobUrl(rawUrl: string): Promise<string> {
  const platform = detectPlatform(rawUrl);
  if (platform === "unsupported") {
    throw new Error(
      "This URL isn't supported. Try LinkedIn, Indeed, JustJoin, Google Jobs, ZipRecruiter, or FlexJobs.",
    );
  }

  const url = normalizeUrl(rawUrl, platform);
  validateJobUrl(url, platform);

  // 1. Lightweight fetch to attempt JSON-LD first
  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });
    html = await res.text();
  } catch {
    // fetch failed — proceed to Playwright
  }

  // 2. Try JSON-LD on lightweight HTML
  if (html) {
    const jsonLd = extractJsonLd(html);
    if (jsonLd && isJobPostingSufficient(jsonLd)) {
      return assembleFromJsonLd(jsonLd);
    }
  }

  // 3. Playwright fallback for full render
  const { scrapeWithPlaywright } = await import("./browser");
  html = await scrapeWithPlaywright(url, platform);

  // 4. Try JSON-LD on fully rendered page
  const jsonLd = extractJsonLd(html);
  if (jsonLd && isJobPostingSufficient(jsonLd)) {
    return assembleFromJsonLd(jsonLd);
  }

  // 5. Platform-specific HTML selector extraction
  const { loadPlatformModule } = await import("./browser");
  const platformModule = await loadPlatformModule(platform);
  const text = platformModule.extractText(html);

  if (!text.trim()) {
    throw new Error(
      "Could not extract job details from this page. The listing may require login, be expired, or use a format we can't read. Try pasting the job description directly instead.",
    );
  }

  return text;
}
