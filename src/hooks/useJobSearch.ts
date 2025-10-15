import useSWR, { type SWRConfiguration } from "swr";
import type {
  JobData,
  JobSearchParams,
  JobSearchResponse,
} from "@/types/job-market";

// Generate a stable cache key for job search parameters
function generateJobSearchKey(params: JobSearchParams): string {
  // Sort site names to ensure consistent key generation
  const sortedParams = {
    ...params,
    site_names: params.site_names?.sort() || [],
  };

  return `job-search:${JSON.stringify(sortedParams)}`;
}

// Fetcher function for job scraping API
async function jobScraper(key: string): Promise<JobData[]> {
  // Extract search params from the SWR key
  const params = JSON.parse(key.replace("job-search:", ""));

  console.log("🔍 Fetching job data for:", params);

  const response = await fetch("/api/jobs/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(
      `Job scraping failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: JobSearchResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch jobs");
  }

  console.log("✅ Job data fetched successfully:", data.data?.length, "jobs");
  return data.data || [];
}

// SWR configuration for job search
const swrConfig = {
  // Cache for 5 minutes (same as our previous cache duration)
  dedupingInterval: 5 * 60 * 1000,

  // Revalidate when window regains focus (but respect deduping interval)
  revalidateOnFocus: true,

  // Don't revalidate on reconnect since job data doesn't change frequently
  revalidateOnReconnect: false,

  // Refresh interval - set to 0 to disable automatic refresh
  // Users can manually refresh if needed
  refreshInterval: 0,

  // Keep previous data while fetching new data
  keepPreviousData: true,

  // Error retry configuration
  errorRetryCount: 2,
  errorRetryInterval: 3000,

  // Show error boundary on fetch errors
  shouldRetryOnError: (error: Error) => {
    // Don't retry on client errors (4xx)
    if (error.message.includes("400") || error.message.includes("404")) {
      return false;
    }
    return true;
  },
};

export interface UseJobSearchOptions {
  // Whether to automatically fetch data when params change
  enabled?: boolean;
  // Custom SWR options to override defaults
  swrOptions?: SWRConfiguration;
}

export interface UseJobSearchResult {
  data: JobData[] | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<JobData[] | undefined>;
}

/**
 * Custom hook for job searching with SWR
 * Provides automatic caching, deduplication, and error handling
 */
export function useJobSearch(
  params: JobSearchParams | null,
  options: UseJobSearchOptions = {},
): UseJobSearchResult {
  const { enabled = true, swrOptions = {} } = options;

  // Generate cache key - return null if params is null or enabled is false
  const key = enabled && params ? generateJobSearchKey(params) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    jobScraper,
    {
      ...swrConfig,
      ...swrOptions,
    },
  );

  return {
    data,
    error,
    isLoading: isLoading || (isValidating && !data), // Show loading if validating and no data
    isValidating,
    mutate,
  };
}

/**
 * Hook for manually triggering job search
 * Useful for search buttons that shouldn't auto-fetch
 */
export function useJobSearchMutation() {
  return {
    trigger: async (params: JobSearchParams): Promise<JobData[]> => {
      const key = generateJobSearchKey(params);
      return jobScraper(key);
    },
  };
}
