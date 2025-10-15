"use client";

import {
  AlertCircle,
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  DollarSign,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import JobDetailsModal from "@/components/organisms/job-details-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobSearch } from "@/hooks/useJobSearch";
import type {
  JobData,
  JobSearchParams,
  JobSite,
  JobType,
} from "@/types/job-market";

// Skeleton Loading Component
const JobCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="pt-6">
      <div className="space-y-4">
        {/* Job Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3 sm:gap-0">
          <div className="space-y-2 flex-1 w-full">
            <div className="flex items-center gap-2">
              <div className="h-5 sm:h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 sm:h-5 bg-muted rounded w-16"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          </div>
          <div className="h-8 bg-muted rounded w-8 self-start"></div>
        </div>

        {/* Job Details Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
          <div className="h-4 bg-muted rounded w-3/5"></div>
          <div className="h-8 bg-muted rounded w-24 mt-2"></div>
        </div>

        {/* Skills Skeleton */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <div className="h-5 sm:h-6 bg-muted rounded w-16"></div>
          <div className="h-5 sm:h-6 bg-muted rounded w-20"></div>
          <div className="h-5 sm:h-6 bg-muted rounded w-14"></div>
          <div className="h-5 sm:h-6 bg-muted rounded w-18"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface JobSearchFilters {
  query: string;
  location: string;
  sites: JobSite[];
  jobTypes: JobType[];
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
}

export default function JobMarketPage() {
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<JobSearchParams | null>(
    null,
  );
  const [filters, setFilters] = useState<JobSearchFilters>({
    query: "Software Engineer",
    location: "Warsaw",
    sites: ["indeed", "linkedin"],
    jobTypes: [],
    isRemote: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
  });

  // Use SWR hook for job searching
  const {
    data: jobs,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useJobSearch(searchParams);

  const jobSites: JobSite[] = [
    "indeed",
    "linkedin",
    "zip_recruiter",
    "google",
    "glassdoor",
  ];
  const jobTypes: JobType[] = [
    "fulltime",
    "parttime",
    "internship",
    "contract",
  ];

  const handleSearch = useCallback(() => {
    if (!filters.query.trim()) {
      alert("Please enter a search term");
      return;
    }

    const newSearchParams: JobSearchParams = {
      search_term: filters.query,
      location: filters.location,
      site_names: filters.sites,
      results_wanted: 20,
      job_type: filters.jobTypes.length > 0 ? filters.jobTypes[0] : undefined,
      is_remote: filters.isRemote,
      description_format: "markdown",
      enforce_annual_salary: true,
    };

    setSearchParams(newSearchParams);
  }, [filters]);

  useEffect(() => {
    if (filters.query && filters.location) {
      handleSearch();
    }
  }, [filters, handleSearch]);

  const formatSalary = (job: JobData) => {
    const { salary } = job;
    if (!salary.min_amount && !salary.max_amount) return "Salary not specified";

    const formatAmount = (amount: number) => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
      return `$${amount.toLocaleString()}`;
    };

    const interval =
      salary.interval === "yearly"
        ? "/year"
        : salary.interval === "monthly"
          ? "/month"
          : salary.interval === "hourly"
            ? "/hour"
            : "";

    if (salary.min_amount && salary.max_amount) {
      return `${formatAmount(salary.min_amount)} - ${formatAmount(salary.max_amount)}${interval}`;
    } else if (salary.min_amount) {
      return `${formatAmount(salary.min_amount)}+${interval}`;
    } else if (salary.max_amount) {
      return `Up to ${formatAmount(salary.max_amount)}${interval}`;
    }

    return "Salary not specified";
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;

      return `${Math.floor(diffInDays / 30)}mo ago`;
    } catch {
      return "Recently";
    }
  };

  const getSiteColor = (site: JobSite) => {
    const colors = {
      indeed: "bg-blue-100 text-blue-800",
      linkedin: "bg-blue-600 text-white",
      zip_recruiter: "bg-green-100 text-green-800",
      google: "bg-red-100 text-red-800",
      glassdoor: "bg-green-600 text-white",
      bayt: "bg-orange-100 text-orange-800",
      naukri: "bg-purple-100 text-purple-800",
      bdjobs: "bg-gray-100 text-gray-800",
    };
    return colors[site] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Job Market
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Search for jobs across multiple platforms using our powerful job
                scraping engine
              </p>
            </div>

            {/* Search Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Job Search
                </CardTitle>
                <CardDescription>
                  Search for jobs across LinkedIn, Indeed, ZipRecruiter, and
                  more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Primary Search */}
                {/* Search Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-query">Job Title or Keywords</Label>
                    <Input
                      id="search-query"
                      placeholder="e.g. Software Engineer, Product Manager"
                      value={filters.query}
                      onChange={(e) =>
                        setFilters({ ...filters, query: e.target.value })
                      }
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-location">Location</Label>
                    <Input
                      id="search-location"
                      placeholder="e.g. San Francisco, CA"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label>&nbsp;</Label>
                    <Button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Search Jobs
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {/* Filter Tabs */}
                <Tabs defaultValue="sites" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="sites">Job Sites</TabsTrigger>
                    <TabsTrigger value="types">Job Types</TabsTrigger>
                    <TabsTrigger value="salary">Salary & Remote</TabsTrigger>
                    <TabsTrigger value="cache">Cache</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sites" className="space-y-3">
                    <Label>Select Job Sites to Search</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {jobSites.map((site) => (
                        <div key={site} className="flex items-center space-x-2">
                          <Checkbox
                            id={site}
                            checked={filters.sites.includes(site)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  sites: [...filters.sites, site],
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  sites: filters.sites.filter(
                                    (s) => s !== site,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={site} className="capitalize">
                            {site.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="types" className="space-y-3">
                    <Label>Job Types</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {jobTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={filters.jobTypes.includes(type)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  jobTypes: [...filters.jobTypes, type],
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  jobTypes: filters.jobTypes.filter(
                                    (t) => t !== type,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={type} className="capitalize">
                            {type === "fulltime"
                              ? "Full Time"
                              : type === "parttime"
                                ? "Part Time"
                                : type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="salary" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary-min">Minimum Salary</Label>
                        <Input
                          id="salary-min"
                          type="number"
                          placeholder="50000"
                          value={filters.salaryMin || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              salaryMin: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary-max">Maximum Salary</Label>
                        <Input
                          id="salary-max"
                          type="number"
                          placeholder="150000"
                          value={filters.salaryMax || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              salaryMax: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Remote Work</Label>
                        <Select
                          value={
                            filters.isRemote === undefined
                              ? "any"
                              : filters.isRemote
                                ? "yes"
                                : "no"
                          }
                          onValueChange={(value) =>
                            setFilters({
                              ...filters,
                              isRemote:
                                value === "any" ? undefined : value === "yes",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Remote Only</SelectItem>
                            <SelectItem value="no">On-site Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cache" className="space-y-3">
                    <Label>Cache Management</Label>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Cache helps speed up repeated searches by storing
                        results locally for 5 minutes.
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            mutate();
                            alert("Cache refreshed successfully!");
                          }}
                        >
                          Refresh Cache
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          SWR automatically manages caching and deduplication.
                          {isValidating && " Currently refreshing..."}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error?.message || "An error occurred"}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Summary */}
            {jobs && jobs.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span>Found {jobs.length} jobs</span>
                      {!isValidating && (
                        <Badge variant="secondary" className="text-xs">
                          �️ Cached
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {Array.from(new Set(jobs.map((job) => job.site))).map(
                        (site) => (
                          <Badge
                            key={site}
                            className={getSiteColor(site as JobSite)}
                          >
                            {site}:{" "}
                            {jobs.filter((job) => job.site === site).length}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Results */}
            <div className="space-y-4">
              {isLoading
                ? // Show skeleton cards while loading
                  Array.from({ length: 6 }, () => (
                    <JobCardSkeleton key={`job-skeleton-${Math.random()}`} />
                  ))
                : jobs?.map((job, index) => (
                    <Card
                      key={`${job.site}-${index}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Job Header */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-primary hover:underline">
                                  {job.job_url ? (
                                    <a
                                      href={job.job_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2"
                                    >
                                      {job.title}
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  ) : (
                                    job.title
                                  )}
                                </h3>
                                <Badge
                                  className={getSiteColor(job.site as JobSite)}
                                >
                                  {job.site}
                                </Badge>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground text-sm sm:text-base">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  <span>{job.company}</span>
                                </div>
                                {job.location.full_location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate">
                                      {job.location.full_location}
                                    </span>
                                  </div>
                                )}
                                {job.is_remote && (
                                  <Badge
                                    variant="secondary"
                                    className="self-start"
                                  >
                                    Remote
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex sm:flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Job Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {job.job_type
                                    ? job.job_type.charAt(0).toUpperCase() +
                                      job.job_type.slice(1)
                                    : "Not specified"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>{formatSalary(job)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {getTimeAgo(
                                    job.date_posted || job.scraped_at,
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Job Description Preview */}
                            {job.description && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {job.description
                                    .replace(/[#*`]/g, "")
                                    .substring(0, 200)}
                                  ...
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowJobDetails(true);
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            )}

                            {/* Skills/Tags */}
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 3).map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className="text-xs truncate max-w-24"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            {/* Empty State */}
            {!isLoading && (!jobs || jobs.length === 0) && !error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Searching for Jobs...
                      </h3>
                      <p className="text-muted-foreground">
                        Loading Software Engineer jobs in Warsaw from multiple
                        job boards
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Details Modal */}
            <JobDetailsModal
              job={selectedJob}
              open={showJobDetails}
              onOpenChange={(open) => {
                setShowJobDetails(open);
                if (!open) setSelectedJob(null);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
