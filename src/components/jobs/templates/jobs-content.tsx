"use client";

import {
  Brain,
  Building,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid3x3,
  Home,
  LayoutGrid,
  Lightbulb,
  List,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { JobCard } from "@/components/job-market/job-card";
import { InterviewPreparationModal } from "@/components/jobs/organisms/interview-preparation-modal";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  COMPANY_SIZES,
  CURRENCIES,
  DATE_POSTED_OPTIONS,
  JOB_FUNCTIONS,
  JOB_LEVELS,
  SPECIFIC_COMPANIES,
} from "@/constants/jobs";
import type { Job } from "@/lib/validators";

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
  const [specificCompany, setSpecificCompany] = useState("company-all");

  // Interview modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Random sorting state
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Function to randomly shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [viewLayout, setViewLayout] = useState<"grid" | "list" | "compact">(
    "grid",
  );

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
    if (specificCompany !== "company-all")
      params.append("company", specificCompany.replace("company-", ""));

    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<JobsResponse>(
    `/api/jobs?${buildQueryParams()}`,
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

  // Reset to page 1 when filters change and mark as no longer first load
  useEffect(() => {
    setCurrentPage(1);
    // If any filter changes, it's no longer the first load
    if (
      searchQuery ||
      location ||
      jobType !== "type-all" ||
      jobLevel !== "level-all" ||
      remoteOnly ||
      minSalary ||
      maxSalary ||
      datePosted !== "date-all" ||
      companySize !== "size-all" ||
      jobFunction !== "func-all" ||
      specificCompany !== "company-all"
    ) {
      setIsFirstLoad(false);
    }
  }, [
    searchQuery,
    location,
    jobType,
    jobLevel,
    remoteOnly,
    minSalary,
    maxSalary,
    datePosted,
    companySize,
    jobFunction,
    specificCompany,
  ]);

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
    setSpecificCompany("company-all");
    setCurrentPage(1);
    setIsFirstLoad(true); // Reset to first load state for new random sorting
  };

  const handlePrepareJob = (job: Job) => {
    setSelectedJob(job);
    setIsInterviewModalOpen(true);
  };

  const handleConfirmInterview = () => {
    if (!selectedJob) return;

    try {
      // Create URL parameters with job context
      const interviewParams = new URLSearchParams({
        // Basic configuration based on job
        position: selectedJob.title,
        seniority: selectedJob.level || "mid",
        interviewType: "technical",
        interviewMode: "practice",
        duration: "30",
        jobId: selectedJob.id,
        company: selectedJob.company,
        jobDescription: selectedJob.description || "",
        jobRequirements: selectedJob.tags?.join(", ") || "",
        jobLocation: selectedJob.location || "",
        jobType: selectedJob.type || "",
        contextType: "job-specific",
      });

      // Navigate to interview with job context
      router.push(`/interview?${interviewParams.toString()}`);

      toast.success("Starting AI interview...");
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
    } finally {
      setIsInterviewModalOpen(false);
      setSelectedJob(null);
    }
  };

  const handleCloseModal = () => {
    setIsInterviewModalOpen(false);
    setSelectedJob(null);
  };

  const handleViewDetails = (job: Job) => {
    console.info("Viewing job details:", job.id);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      {/* Filters */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Primary Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, company, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm focus:shadow-md transition-shadow"
                  />
                </div>
              </div>
              <div className="w-full lg:w-64">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 pl-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm focus:shadow-md transition-shadow"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 shadow-sm hover:shadow-md transition-all"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select onValueChange={setJobType} value={jobType}>
                  <SelectTrigger className="w-[160px] h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type-all">All Types</SelectItem>
                    <SelectItem value="type-Full-time">Full-time</SelectItem>
                    <SelectItem value="type-Part-time">Part-time</SelectItem>
                    <SelectItem value="type-Contract">Contract</SelectItem>
                    <SelectItem value="type-Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setJobLevel} value={jobLevel}>
                  <SelectTrigger className="w-[180px] h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level-all">All Levels</SelectItem>
                    {JOB_LEVELS.map((lvl) => (
                      <SelectItem key={`level-${lvl}`} value={`level-${lvl}`}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-2 px-4 py-2.5 border border-border/60 rounded-lg cursor-pointer hover:bg-accent/50 hover:border-primary/40 transition-all bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Remote Only</span>
                </label>
              </div>

              <div className="flex-1 min-w-[20px]" />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-10 px-4 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? "Less" : "More"} Filters
                  {(minSalary ||
                    maxSalary ||
                    datePosted !== "date-all" ||
                    companySize !== "size-all" ||
                    jobFunction !== "func-all" ||
                    specificCompany !== "company-all") && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                    >
                      {
                        [
                          minSalary,
                          maxSalary,
                          datePosted !== "date-all",
                          companySize !== "size-all",
                          jobFunction !== "func-all",
                          specificCompany !== "company-all",
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>

                {(searchQuery ||
                  location ||
                  jobType !== "type-all" ||
                  jobLevel !== "level-all" ||
                  remoteOnly ||
                  minSalary ||
                  maxSalary ||
                  datePosted !== "date-all" ||
                  companySize !== "size-all" ||
                  jobFunction !== "func-all" ||
                  specificCompany !== "company-all") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-lg space-y-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Advanced Filters
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Job Function */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      Job Function
                    </div>
                    <Select onValueChange={setJobFunction} value={jobFunction}>
                      <SelectTrigger className="h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                        <SelectValue placeholder="All Functions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="func-all">All Functions</SelectItem>
                        {JOB_FUNCTIONS.map((func) => (
                          <SelectItem
                            key={`func-${func}`}
                            value={`func-${func}`}
                          >
                            {func}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Company Size
                    </div>
                    <Select onValueChange={setCompanySize} value={companySize}>
                      <SelectTrigger className="h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                        <SelectValue placeholder="Any Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="size-all">Any Size</SelectItem>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem
                            key={`size-${size.value}`}
                            value={`size-${size.value}`}
                          >
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Posted */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>Date Posted</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Date Posted
                    </div>
                    <Select onValueChange={setDatePosted} value={datePosted}>
                      <SelectTrigger className="h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                        <SelectValue placeholder="Any Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-all">Any Time</SelectItem>
                        {DATE_POSTED_OPTIONS.map((opt) => (
                          <SelectItem
                            key={`date-${opt.value}`}
                            value={`date-${opt.value}`}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>Currency</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Currency
                    </div>
                    <Select onValueChange={setCurrency} value={currency}>
                      <SelectTrigger className="h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={`curr-${curr}`} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Specific Company Filter */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    Filter by Specific Company
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {SPECIFIC_COMPANIES.slice(0, 12).map((company) => {
                      const CompanyIcon = company.icon;
                      const isSelected =
                        specificCompany === `company-${company.value}`;
                      return (
                        <button
                          key={company.value}
                          type="button"
                          onClick={() => {
                            setSpecificCompany(
                              isSelected
                                ? "company-all"
                                : `company-${company.value}`,
                            );
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          }`}
                        >
                          <CompanyIcon className={`h-6 w-6 ${company.color}`} />
                          <span className="text-xs font-medium text-center leading-tight">
                            {company.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {SPECIFIC_COMPANIES.length > 12 && (
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                        <span>
                          Show {SPECIFIC_COMPANIES.length - 12} more companies
                        </span>
                        <svg
                          className="h-3 w-3 transition-transform group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <title>Expand companies list</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                        {SPECIFIC_COMPANIES.slice(12).map((company) => {
                          const CompanyIcon = company.icon;
                          const isSelected =
                            specificCompany === `company-${company.value}`;
                          return (
                            <button
                              key={company.value}
                              type="button"
                              onClick={() => {
                                setSpecificCompany(
                                  isSelected
                                    ? "company-all"
                                    : `company-${company.value}`,
                                );
                              }}
                              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-border hover:border-primary/50 hover:bg-accent/50"
                              }`}
                            >
                              <CompanyIcon
                                className={`h-6 w-6 ${company.color}`}
                              />
                              <span className="text-xs font-medium text-center leading-tight">
                                {company.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>

                {/* Salary Range */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>Salary Range</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Salary Range ({currency})
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Minimum"
                      value={minSalary}
                      onChange={(e) =>
                        setMinSalary(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="flex-1 h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm focus:shadow-md transition-shadow"
                    />
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                      <span className="text-xs text-muted-foreground font-medium">
                        to
                      </span>
                    </div>
                    <Input
                      type="number"
                      placeholder="Maximum"
                      value={maxSalary}
                      onChange={(e) =>
                        setMaxSalary(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="flex-1 h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm focus:shadow-md transition-shadow"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Available Jobs</h2>
            {data && (
              <Badge variant="secondary">
                {data.total.toLocaleString("fr-FR")} positions
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                onValueChange={(val) => setPerPage(Number(val))}
                value={perPage.toString()}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                  <SelectItem value="96">96</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layout view options */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewLayout === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewLayout("grid")}
                className="h-8 px-2"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewLayout === "compact" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewLayout("compact")}
                className="h-8 px-2"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewLayout === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewLayout("list")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
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
              className="mt-4 bg-transparent"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {isLoading ? (
          <div
            className={`grid gap-6 mb-8 ${
              viewLayout === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : viewLayout === "compact"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
            }`}
          >
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
            {viewLayout === "list" ? (
              <div className="mb-8 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isFirstLoad
                      ? shuffleArray(data.results)
                      : data.results
                    ).map((job) => (
                      <TableRow
                        key={`job-${job.id}`}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(job)}
                      >
                        <TableCell>
                          {job.companyLogo && job.companyLogo !== "nan" ? (
                            <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted flex items-center justify-center">
                              <Image
                                src={job.companyLogo || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                fill
                                className="object-contain p-1"
                                sizes="40px"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground hover:text-primary transition-colors">
                              {job.title}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {job.level && (
                                <Badge variant="outline" className="text-xs">
                                  {job.level}
                                </Badge>
                              )}
                              {job.remote && (
                                <Badge variant="secondary" className="text-xs">
                                  Remote
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{job.company}</div>
                        </TableCell>
                        <TableCell>
                          {job.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.remote ? (
                              <div className="flex items-center gap-1 text-xs">
                                <Home className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  Remote
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs">
                                <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  On-site
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrepareJob(job);
                              }}
                              className={`hover:bg-primary/10 hover:border-primary hover:text-blue-800 relative overflow-hidden group/btn `}
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                              <Lightbulb className="h-3 w-3 mr-1" />
                              Interview with AI
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (job.jobUrlDirect || job.jobUrl) {
                                  window.open(
                                    job.jobUrlDirect || job.jobUrl,
                                    "_blank",
                                  );
                                }
                              }}
                              disabled={!job.jobUrl && !job.jobUrlDirect}
                              className="h-8"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div
                className={`grid gap-6 mb-8 ${
                  viewLayout === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {(isFirstLoad ? shuffleArray(data.results) : data.results).map(
                  (job) => (
                    <JobCard
                      key={`job-${job.id}`}
                      job={job}
                      onViewDetails={handleViewDetails}
                      onPrepare={handlePrepareJob}
                      layout={viewLayout}
                    />
                  ),
                )}
              </div>
            )}

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

      {/* Interview Preparation Modal */}
      {selectedJob && (
        <InterviewPreparationModal
          isOpen={isInterviewModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmInterview}
          job={selectedJob}
        />
      )}
    </main>
  );
}
