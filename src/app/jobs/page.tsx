"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { type Job, JobCard } from "@/components/organisms/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/providers/auth-provider";
import LoadingPage from "@/components/atoms/loading-page";


interface JobsResponse {
  results: Job[];
  page: number;
  per_page: number;
  total: number;
  page_count: number;
}

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobMarketPage() {
  const { loading: authLoading } = useAuthGuard();
  const { user } = useAuth();

  if (authLoading) {
    return <LoadingPage message="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Basic Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Advanced Filters
  const [minSalary, setMinSalary] = useState<number | "">("");
  const [maxSalary, setMaxSalary] = useState<number | "">("");
  const [currency, setCurrency] = useState("USD");
  const [datePosted, setDatePosted] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");
  const [jobFunction, setJobFunction] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Job Functions
  const jobFunctions = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "Human Resources",
    "Customer Service",
    "Education",
    "Healthcare",
    "Other",
  ];

  // Company Sizes
  const companySizes = [
    { value: "1-50", label: "Small (1-50)" },
    { value: "51-500", label: "Medium (51-500)" },
    { value: "501-1000", label: "Large (501-1000)" },
    { value: "1001+", label: "Enterprise (1001+)" },
  ];

  // Date Posted Options
  const datePostedOptions = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 3 months" },
    { value: "all", label: "All time" },
  ];

  // Experience Levels
  const experienceLevels = [
    "Internship",
    "Entry Level",
    "Associate",
    "Mid-Senior Level",
    "Director",
    "Executive",
    "Not Applicable",
  ];

  // Currencies
  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY", "CNY"];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Build the query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: perPage.toString(),
    });

    // Basic filters
    if (searchQuery) params.append("query", searchQuery);
    if (location) params.append("location", location);
    if (jobType && jobType !== "all") params.append("type", jobType);
    if (jobLevel && jobLevel !== "all") params.append("level", jobLevel);
    if (remoteOnly) params.append("remote", "true");

    // Advanced filters
    if (minSalary !== "") params.append("min_salary", minSalary.toString());
    if (maxSalary !== "") params.append("max_salary", maxSalary.toString());
    if (currency) params.append("currency", currency);
    if (datePosted && datePosted !== "all")
      params.append("date_posted", datePosted);
    if (companySize && companySize !== "all")
      params.append("company_size", companySize);
    if (jobFunction && jobFunction !== "all")
      params.append("job_function", jobFunction);

    return params.toString();
  };

  // Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR<JobsResponse>(
    `/api/jobs/neon?${buildQueryParams()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        console.error("Error fetching jobs:", err);
        toast.error("Failed to load jobs. Please try again.");
      },
    },
  );

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    mutate();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setJobType("all");
    setJobLevel("all");
    setRemoteOnly(false);
    setMinSalary("");
    setMaxSalary("");
    setCurrency("USD");
    setDatePosted("all");
    setCompanySize("all");
    setJobFunction("all");
    setCurrentPage(1);
  };

  // Handle job preparation (save for later)
  const handlePrepareJob = (job: Job) => {
    // TODO: Implement job preparation logic (e.g., save to user's list)
    toast.success(`Preparing for ${job.title} at ${job.company}`, {
      action: {
        label: "View Prep",
        onClick: () => {
          // Navigate to preparation page
          console.log("Navigate to preparation page for job:", job.id);
        },
      },
    });
  };

  // Handle job view details
  const handleViewDetails = (job: Job) => {
    // Analytics or other tracking can be added here
    console.log("Viewing job details:", job.id);
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
        <main className="flex-1 overflow-y-auto bg-background">
          <section className="relative py-12 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Explore Programming Jobs
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
                Discover the latest active programming roles from top companies
                around the world. Filter by keyword, location, and find your
                next opportunity.
              </p>

              {/* Search and Filters */}
              <div className="max-w-4xl mx-auto space-y-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Job title, company, or keywords"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select onValueChange={setJobType} value={jobType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-sm text-muted-foreground"
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      {/* Experience Level */}
                      <Select onValueChange={setJobLevel} value={jobLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Experience Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Job Function */}
                      <Select
                        onValueChange={setJobFunction}
                        value={jobFunction}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Job Function" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Functions</SelectItem>
                          {jobFunctions.map((func) => (
                            <SelectItem key={func} value={func}>
                              {func}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Company Size */}
                      <Select
                        onValueChange={setCompanySize}
                        value={companySize}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Company Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Size</SelectItem>
                          {companySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Date Posted */}
                      <Select onValueChange={setDatePosted} value={datePosted}>
                        <SelectTrigger>
                          <SelectValue placeholder="Date Posted" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Time</SelectItem>
                          {datePostedOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Salary Range */}
                      <div className="flex gap-2 col-span-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Min Salary"
                            value={minSalary}
                            onChange={(e) =>
                              setMinSalary(
                                e.target.value ? Number(e.target.value) : "",
                              )
                            }
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Max Salary"
                            value={maxSalary}
                            onChange={(e) =>
                              setMaxSalary(
                                e.target.value ? Number(e.target.value) : "",
                              )
                            }
                            min={minSalary !== "" ? minSalary : 0}
                          />
                        </div>
                        <Select onValueChange={setCurrency} value={currency}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remote Only Toggle */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remoteOnly"
                          checked={remoteOnly}
                          onChange={(e) => setRemoteOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="remoteOnly"
                          className="text-sm font-medium leading-none"
                        >
                          Remote Only
                        </label>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>

          {/* Jobs Section */}
          <section className="container mx-auto px-6 py-8">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Available Jobs</h2>
                {data && (
                  <Badge variant="secondary">{data.total} positions</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
                {!isLoading && !error && data && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Back to Top
                  </Button>
                )}
              </div>
            </div>

            {/* Jobs Grid */}
            {!error && !isLoading && data?.results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No jobs found matching your criteria.
                </p>
                <Button
                  onClick={clearFilters}
                  className="mt-4"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">
                  Failed to load jobs. Please try again.
                </p>
                <Button onClick={() => mutate()}>Retry</Button>
              </div>
            ) : data && data.results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.results.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewDetails}
                      onPrepare={handlePrepareJob}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.page_count > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(5, data.page_count) },
                        (_, i) => {
                          let pageNum: number;
                          if (data.page_count <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= data.page_count - 2) {
                            pageNum = data.page_count - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={isLoading}
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(data.page_count, p + 1))
                      }
                      disabled={currentPage === data.page_count || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
