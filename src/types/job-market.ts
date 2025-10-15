/**
 * Job Market Types and Interfaces
 * TypeScript definitions for job scraping and job market functionality
 */

export interface JobLocation {
  city?: string;
  state?: string;
  country?: string;
  full_location?: string;
}

export interface JobSalary {
  min_amount?: number;
  max_amount?: number;
  interval?: "yearly" | "monthly" | "weekly" | "daily" | "hourly";
  currency?: string;
  salary_source?: "direct_data" | "description";
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  company_url?: string;
  location: JobLocation;
  job_url?: string;
  is_remote: boolean;
  job_type?: "fulltime" | "parttime" | "internship" | "contract";
  description?: string;
  salary: JobSalary;
  date_posted?: string;
  site: string;
  scraped_at: string;
  search_term: string;
  search_location: string;

  // Additional fields
  company_industry?: string;
  job_level?: string;
  job_function?: string;
  emails?: string[];
  skills?: string[];

  // Site-specific fields
  company_country?: string;
  company_addresses?: string[];
  company_employees_label?: string;
  company_revenue_label?: string;
  company_description?: string;
  company_logo?: string;
  company_rating?: number;
  company_reviews_count?: number;
  experience_range?: string;
  vacancy_count?: number;
  work_from_home_type?: string;
}

export interface JobSearchParams {
  search_term: string;
  location?: string;
  site_names?: JobSite[];
  results_wanted?: number;
  job_type?: JobType;
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
  linkedin_company_ids?: number[];
}

export interface JobSearchFilters {
  query?: string;
  location?: string;
  job_type?: JobType[];
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  company?: string[];
  site?: JobSite[];
  hours_old?: number;
  posted_after?: string;
  posted_before?: string;
  has_salary?: boolean;
  skills?: string[];
  experience_level?: string[];
}

export interface JobSearchResponse {
  success: boolean;
  data?: JobData[];
  count?: number;
  total_pages?: number;
  current_page?: number;
  error?: string;
  message?: string;
  filters_applied?: JobSearchFilters;
  search_metadata?: {
    search_term: string;
    location: string;
    sites_searched: JobSite[];
    results_per_site: Record<JobSite, number>;
    search_duration_ms: number;
    scraped_at: string;
  };
}

export type JobSite =
  | "indeed"
  | "linkedin"
  | "zip_recruiter"
  | "google"
  | "glassdoor"
  | "bayt"
  | "naukri"
  | "bdjobs";

export type JobType = "fulltime" | "parttime" | "internship" | "contract";

export interface JobMarketConfig {
  default_sites: JobSite[];
  default_results_per_site: number;
  max_results_per_request: number;
  supported_countries: string[];
  cache_duration_minutes: number;
  rate_limit_per_minute: number;
}

export interface SavedJobSearch {
  id: string;
  user_id: string;
  name: string;
  search_params: JobSearchParams;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  is_active: boolean;
  notification_enabled: boolean;
  results_count?: number;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  job_data: JobData;
  status:
    | "interested"
    | "applied"
    | "interviewing"
    | "rejected"
    | "offered"
    | "hired";
  applied_at?: string;
  notes?: string;
  resume_version?: string;
  cover_letter?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface JobBookmark {
  id: string;
  user_id: string;
  job_id: string;
  job_data: JobData;
  tags?: string[];
  notes?: string;
  created_at: string;
}

export interface JobAlert {
  id: string;
  user_id: string;
  name: string;
  search_params: JobSearchParams;
  frequency: "daily" | "weekly" | "bi-weekly";
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

// Database schemas (for Firestore)
export interface JobDocumentData {
  id: string;
  title: string;
  company: string;
  company_url?: string;
  location: JobLocation;
  job_url?: string;
  is_remote: boolean;
  job_type?: JobType;
  description?: string;
  salary: JobSalary;
  date_posted?: string;
  site: JobSite;
  scraped_at: string;
  search_term: string;
  search_location: string;

  // Additional indexed fields for querying
  company_industry?: string;
  job_level?: string;
  skills?: string[];

  // Firestore metadata
  created_at: string;
  updated_at: string;
  expires_at?: string; // TTL for automatic cleanup
}

export interface UserJobPreferences {
  user_id: string;
  preferred_locations: string[];
  preferred_job_types: JobType[];
  preferred_sites: JobSite[];
  salary_expectations: {
    min_salary?: number;
    max_salary?: number;
    currency: string;
    interval: "yearly" | "monthly" | "hourly";
  };
  remote_preference: "only" | "preferred" | "no_preference" | "not_preferred";
  skills: string[];
  industries: string[];
  experience_level: string;
  company_size_preference?: string[];
  excluded_companies?: string[];
  keywords: string[];
  excluded_keywords?: string[];
  created_at: string;
  updated_at: string;
}

// Utility types
export type JobSortOption =
  | "relevance"
  | "date_posted"
  | "salary_high"
  | "salary_low"
  | "company_name"
  | "title";

export interface JobPaginationParams {
  page: number;
  limit: number;
  sort_by: JobSortOption;
  sort_order: "asc" | "desc";
}

export interface JobAnalytics {
  total_jobs_scraped: number;
  jobs_by_site: Record<JobSite, number>;
  jobs_by_type: Record<JobType, number>;
  average_salary_by_location: Record<string, number>;
  top_companies: Array<{ company: string; count: number }>;
  top_skills: Array<{ skill: string; count: number }>;
  remote_job_percentage: number;
  scraping_success_rate: Record<JobSite, number>;
  last_updated: string;
}

// Error types
export interface JobScrapingError {
  site: JobSite;
  error_type:
    | "rate_limit"
    | "network_error"
    | "parsing_error"
    | "timeout"
    | "blocked";
  error_message: string;
  timestamp: string;
  retry_after?: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
