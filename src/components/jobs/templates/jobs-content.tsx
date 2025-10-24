"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { type Job, JobCard } from "@/components/job-market/job-card";
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

interface JobsResponse {
  results: Job[];
  page: number;
  per_page: number;
  total: number;
  page_count: number;
}

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function JobsContent() {
  const router = useRouter();

  // Basic filters
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("type-all");
  const [jobLevel, setJobLevel] = useState("level-all");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Advanced filters
  const [minSalary, setMinSalary] = useState<number | "">("");
  const [maxSalary, setMaxSalary] = useState<number | "">("");
  const [currency, setCurrency] = useState("USD");
  const [datePosted, setDatePosted] = useState("date-all");
  const [companySize, setCompanySize] = useState("size-all");
  const [jobFunction, setJobFunction] = useState("func-all");
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

  const companySizes = [
    { value: "1-50", label: "Small (1-50)" },
    { value: "51-500", label: "Medium (51-500)" },
    { value: "501-1000", label: "Large (501-1000)" },
    { value: "1001+", label: "Enterprise (1001+)" },
  ];

  const datePostedOptions = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 3 months" },
  ];

  const experienceLevels = [
    "Internship",
    "Entry Level",
    "Associate",
    "Mid-Senior Level",
    "Director",
    "Executive",
    "Not Applicable",
  ];

  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY", "CNY"];

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Build query string
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: perPage.toString(),
    });

    if (searchQuery) params.append("query", searchQuery);
    if (location) params.append("location", location);
    if (jobType !== "type-all")
      params.append("type", jobType.replace("type-", ""));
    if (jobLevel !== "level-all")
      params.append("level", jobLevel.replace("level-", ""));
    if (remoteOnly) params.append("remote", "true");
    if (minSalary !== "") params.append("min_salary", minSalary.toString());
    if (maxSalary !== "") params.append("max_salary", maxSalary.toString());
    if (currency) params.append("currency", currency);
    if (datePosted !== "date-all")
      params.append("date_posted", datePosted.replace("date-", ""));
    if (companySize !== "size-all")
      params.append("company_size", companySize.replace("size-", ""));
    if (jobFunction !== "func-all")
      params.append("job_function", jobFunction.replace("func-", ""));

    return params.toString();
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    mutate();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setJobType("type-all");
    setJobLevel("level-all");
    setRemoteOnly(false);
    setMinSalary("");
    setMaxSalary("");
    setCurrency("USD");
    setDatePosted("date-all");
    setCompanySize("size-all");
    setJobFunction("func-all");
    setCurrentPage(1);
  };

  const handlePrepareJob = (job: Job) => {
    try {
      // Create URL parameters with job context
      const interviewParams = new URLSearchParams({
        // Basic configuration based on job
        position: job.title,
        seniority: job.level || "mid",
        interviewType: "technical",
        interviewMode: "untimed",
        duration: "30",
        jobId: job.id,
        company: job.company,
        jobDescription: job.description || "",
        jobRequirements: job.tags?.join(", ") || "",
        jobLocation: job.location || "",
        jobType: job.type || "",
        contextType: "job-specific",
      });

      // Navigate to interview with job context
      router.push(`/interview?${interviewParams.toString()}`);

      toast.success(`Starting interview prep for ${job.title}`, {
        description: `Tailored questions based on ${job.company}'s requirements`,
      });
    } catch (error) {
      console.error("Error preparing job interview:", error);
      toast.error("Failed to start interview preparation");
    }
  };

  const handleViewDetails = (job: Job) => {
    console.info("Viewing job details:", job.id);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <section className="relative py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Explore Programming Jobs
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Discover the latest active programming roles from top companies
            around the world. Filter by keyword, location, and find your next
            opportunity.
          </p>

          {/* Search */}
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
                      <SelectItem key="type-all" value="type-all">
                        All Types
                      </SelectItem>
                      <SelectItem key="type-full" value="type-Full-time">
                        Full-time
                      </SelectItem>
                      <SelectItem key="type-part" value="type-Part-time">
                        Part-time
                      </SelectItem>
                      <SelectItem key="type-contract" value="type-Contract">
                        Contract
                      </SelectItem>
                      <SelectItem key="type-intern" value="type-Internship">
                        Internship
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  {/* Experience Level */}
                  <Select onValueChange={setJobLevel} value={jobLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="level-all" value="level-all">
                        All Levels
                      </SelectItem>
                      {experienceLevels.map((lvl) => (
                        <SelectItem key={`level-${lvl}`} value={`level-${lvl}`}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Job Function */}
                  <Select onValueChange={setJobFunction} value={jobFunction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Function" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="func-all" value="func-all">
                        All Functions
                      </SelectItem>
                      {jobFunctions.map((func) => (
                        <SelectItem key={`func-${func}`} value={`func-${func}`}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Company Size */}
                  <Select onValueChange={setCompanySize} value={companySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Company Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="size-all" value="size-all">
                        Any Size
                      </SelectItem>
                      {companySizes.map((size) => (
                        <SelectItem
                          key={`size-${size.value}`}
                          value={`size-${size.value}`}
                        >
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
                      <SelectItem key="date-all" value="date-all">
                        Any Time
                      </SelectItem>
                      {datePostedOptions.map((opt) => (
                        <SelectItem
                          key={`date-${opt.value}`}
                          value={`date-${opt.value}`}
                        >
                          {opt.label}
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
                      />
                    </div>
                    <Select onValueChange={setCurrency} value={currency}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={`curr-${curr}`} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remote Only */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remoteOnly"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="remoteOnly" className="text-sm font-medium">
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Available Jobs</h2>
            {data && <Badge variant="secondary">{data.total} positions</Badge>}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          {/* TODO: OPS-36 - Fix back to top button functionality */}
          {/* {!isLoading && !error && data && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Back to Top
              </Button>
            )} */}
        </div>

        {/* Jobs Grid */}
        {!error && !isLoading && data?.results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No jobs found matching your criteria.
            </p>
            <Button onClick={clearFilters} className="mt-4" variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from(
              { length: 6 },
              (_, index) => `skeleton-${Date.now()}-${index}`,
            ).map((skeletonId) => (
              <div
                key={skeletonId}
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
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
                  key={`job-${job.id}`}
                  job={job}
                  onViewDetails={handleViewDetails}
                  onPrepare={handlePrepareJob}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.page_count > 1 && (
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
                      if (data.page_count <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= data.page_count - 2)
                        pageNum = data.page_count - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <Button
                          key={`page-${pageNum}`}
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
  );
}
