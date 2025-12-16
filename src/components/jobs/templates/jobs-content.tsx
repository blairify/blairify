"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid3x3,
  LayoutGrid,
  Lightbulb,
  List,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Typography } from "@/components/common/atoms/typography";
import { JobCard } from "@/components/jobs/molecules/job-card";
import { InterviewPreparationModal } from "@/components/jobs/organisms/interview-preparation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SENIORITY_LEVELS } from "@/constants/configure";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig as DomainInterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/validators";
import { useAuth } from "@/providers/auth-provider";

interface JobsResponse {
  results: Job[];
  page: number;
  per_page: number;
  total: number;
  page_count: number;
}

interface CitiesResponse {
  cities: string[];
  success: boolean;
}

const ROLE_OPTIONS = [
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "mobile",
  "data-scientist",
  "cybersecurity",
  "product-manager",
] as const;

type RoleOption = (typeof ROLE_OPTIONS)[number];

function normalizeRole(value: string | null | undefined): RoleOption | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (ROLE_OPTIONS.includes(trimmed as RoleOption))
    return trimmed as RoleOption;
  return null;
}

function normalizeSeniority(
  value: string | null | undefined,
): (typeof SENIORITY_LEVELS)[number]["value"] | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (SENIORITY_LEVELS.some((lvl) => lvl.value === lower)) {
    return lower as (typeof SENIORITY_LEVELS)[number]["value"];
  }

  switch (trimmed) {
    case "Entry level":
      return "entry";
    case "Junior":
      return "junior";
    case "Middle":
      return "mid";
    case "Senior":
      return "senior";
    default:
      return null;
  }
}

function getRoleLabel(role: RoleOption) {
  switch (role) {
    case "frontend":
      return "Frontend";
    case "backend":
      return "Backend";
    case "fullstack":
      return "Full Stack";
    case "devops":
      return "DevOps";
    case "mobile":
      return "Mobile";
    case "data-scientist":
      return "Data Scientist";
    case "cybersecurity":
      return "Cybersecurity";
    case "product-manager":
      return "Product Manager";
    default: {
      const _never: never = role;
      throw new Error(`Unhandled role: ${_never}`);
    }
  }
}

// SWR fetcher function
const fetcher = async (url: string): Promise<JobsResponse> => {
  const res = await fetch(url);
  const data: unknown = await res.json();

  if (!res.ok) {
    throw new Error(`Jobs API error: ${res.status}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Jobs API error: invalid response");
  }

  if ("success" in data && data.success === false) {
    const message =
      "error" in data && typeof data.error === "string"
        ? data.error
        : "Jobs API error";
    throw new Error(message);
  }

  return data as JobsResponse;
};

const citiesFetcher = async (url: string): Promise<CitiesResponse> => {
  const res = await fetch(url);
  const data: unknown = await res.json();

  if (!res.ok) {
    throw new Error(`Jobs Cities API error: ${res.status}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Jobs Cities API error: invalid response");
  }

  if ("success" in data && data.success === false) {
    throw new Error("Jobs Cities API error");
  }

  return data as CitiesResponse;
};

export function JobsContent() {
  const router = useRouter();
  const { userData } = useAuth();

  // Basic filters
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("role-all");
  const [jobLevel, setJobLevel] = useState("level-all");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

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

  const { data: citiesData } = useSWR<CitiesResponse>(
    "/api/jobs/cities?limit=500",
    citiesFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const cities = citiesData?.cities ?? [];

  const filteredCities = cities.filter((city) => {
    if (!locationSearch.trim()) return true;
    return city.toLowerCase().includes(locationSearch.trim().toLowerCase());
  });

  // Build query string
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: perPage.toString(),
    });

    if (searchQuery) params.append("query", searchQuery);
    if (location) params.append("location", location);
    if (role !== "role-all") params.append("role", role.replace("role-", ""));
    if (jobLevel !== "level-all")
      params.append("level", jobLevel.replace("level-", ""));
    if (remoteOnly) params.append("remote", "true");

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

  const results = data?.results ?? [];
  const pageCount = data?.page_count ?? 0;

  useEffect(() => {
    if (hasInitializedFilters) return;
    if (typeof window === "undefined") return;
    if (!userData) return;

    const params = new URLSearchParams(window.location.search);

    const query = params.get("query");
    const nextQuery = query?.trim() ? query.trim() : null;
    if (nextQuery) setSearchQuery(nextQuery);

    const nextLocation = params.get("location")?.trim();
    if (nextLocation) {
      setLocation(nextLocation);
    } else if (userData.preferences?.preferredLocation?.trim()) {
      setLocation(userData.preferences.preferredLocation.trim());
    }

    const nextRoleFromUrl = normalizeRole(params.get("role"));
    const nextRoleFromProfile = normalizeRole(userData.role);
    const nextRole = nextRoleFromUrl ?? nextRoleFromProfile;
    if (nextRole) setRole(`role-${nextRole}`);

    const nextSeniorityFromUrl = normalizeSeniority(params.get("level"));
    const nextSeniorityFromProfile = normalizeSeniority(userData.experience);
    const nextSeniority = nextSeniorityFromUrl ?? nextSeniorityFromProfile;
    if (nextSeniority) setJobLevel(`level-${nextSeniority}`);

    const remoteParam = params.get("remote");
    if (remoteParam === "true") {
      setRemoteOnly(true);
    } else {
      const workTypes = userData.preferences?.preferredWorkTypes ?? [];
      const prefersRemote = workTypes.some((value) =>
        value.toLowerCase().includes("remote"),
      );
      if (prefersRemote) setRemoteOnly(true);
    }

    setHasInitializedFilters(true);
  }, [hasInitializedFilters, userData]);

  // Reset to page 1 when filters change and mark as no longer first load
  useEffect(() => {
    setCurrentPage(1);
    // If any filter changes, it's no longer the first load
    if (
      searchQuery ||
      location ||
      role !== "role-all" ||
      jobLevel !== "level-all" ||
      remoteOnly
    ) {
      setIsFirstLoad(false);
    }
  }, [searchQuery, location, role, jobLevel, remoteOnly]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setRole("role-all");
    setJobLevel("level-all");
    setRemoteOnly(false);
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
      const seniority: SeniorityLevel =
        (selectedJob.seniorityLevel?.toLowerCase() ||
          selectedJob.level?.toLowerCase() ||
          "mid") as SeniorityLevel;
      const interviewMode: InterviewMode = "practice";
      const interviewType: InterviewType = "technical";

      const domainConfig: DomainInterviewConfig = {
        position: selectedJob.title || "Software Engineer",
        seniority,
        technologies: [],
        companyProfile: "",
        specificCompany: undefined,
        interviewMode,
        interviewType,
        duration: "30",
        isDemoMode: false,
        contextType: "job-specific",
        jobId: selectedJob.id,
        company: selectedJob.company,
        jobDescription: selectedJob.description || "",
        jobRequirements: selectedJob.tags?.join(", ") || "",
        jobLocation: selectedJob.location || "",
        jobType: selectedJob.type || "",
      };

      const interviewParams =
        buildSearchParamsFromInterviewConfig(domainConfig);
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
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-4 shadow-sm md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs (title, company, description)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-background/80 border-border/60 shadow-xs focus-visible:shadow-sm"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-11 pl-10 w-full justify-start bg-background/80 border-border/60 shadow-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        !location && "text-muted-foreground",
                      )}
                      aria-label="Filter by location"
                    >
                      <span className="truncate">{location || "Location"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] max-w-[320px] p-2"
                  >
                    <Input
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search locations..."
                      className="h-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />

                    <div className="mt-2 max-h-[260px] overflow-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setLocation("");
                          setIsLocationOpen(false);
                        }}
                        className={cn(
                          "w-full !text-white !text-left rounded-md px-2 mb-2 py-2 text-sm hover:!bg-primary",
                          !location && "!bg-primary font-medium",
                        )}
                      >
                        All
                      </button>

                      {filteredCities.length === 0 ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No matches
                        </div>
                      ) : (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setLocation(city);
                              setIsLocationOpen(false);
                            }}
                            className={cn(
                              "w-full !text-left rounded-md px-2 py-2 mb-[2px] text-sm hover:!bg-primary hover:!text-white",
                              location === city && "bg-accent font-medium",
                            )}
                          >
                            {city}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="h-10 w-[180px] bg-background/80 border-border/60 shadow-xs focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="role-all"
                    className="w-full text-left rounded-md px-2 py-2 mb-[2px] text-sm data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    All roles
                  </SelectItem>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={`role-${opt}`}
                      value={`role-${opt}`}
                      className="w-full text-left rounded-md px-2 py-2 mb-[2px] text-sm data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      {getRoleLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setJobLevel} value={jobLevel}>
                <SelectTrigger className="h-10 w-[180px] bg-background/80 border-border/60 shadow-xs focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="level-all"
                    className="w-full text-left rounded-md px-2 py-2 mb-[2px] text-sm data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    All
                  </SelectItem>
                  {SENIORITY_LEVELS.map((lvl) => (
                    <SelectItem
                      key={`level-${lvl.value}`}
                      value={`level-${lvl.value}`}
                      className="w-full text-left rounded-md px-2 py-2 mb-[2px] text-sm data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="lg"
                aria-pressed={remoteOnly}
                onClick={() => setRemoteOnly((prev) => !prev)}
                className={cn(remoteOnly && "border-primary/40 bg-primary/10")}
              >
                Remote Only
              </Button>

              <div className="flex-1" />

              {(searchQuery ||
                location ||
                jobLevel !== "level-all" ||
                remoteOnly) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Typography.BodyBold className="text-2xl font-semibold mr-2">
              Available Jobs
            </Typography.BodyBold>
            {typeof data?.total === "number" ? (
              <Badge variant="secondary" className="py-1">
                {data.total.toLocaleString("fr-FR")} positions
              </Badge>
            ) : null}
            {searchQuery ||
            location ||
            jobLevel !== "level-all" ||
            remoteOnly ? (
              <>
                {location ? (
                  <Badge variant="secondary" className="bg-purple-200 py-1">
                    {location}
                  </Badge>
                ) : null}
                {remoteOnly ? (
                  <Badge variant="secondary" className="bg-emerald-200 py-1">
                    Remote Only
                  </Badge>
                ) : null}
              </>
            ) : null}
            {jobLevel !== "level-all" ? (
              <Badge variant="secondary" className="bg-blue-200 py-1">
                {jobLevel}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
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

        {!error && !isLoading && results.length === 0 && (
          <div className="text-center py-12">
            <Typography.Body className="text-muted-foreground text-lg">
              No jobs found matching your criteria.
            </Typography.Body>
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
        ) : results.length > 0 ? (
          <>
            {viewLayout === "list" ? (
              <div className="mb-8 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isFirstLoad ? shuffleArray(results) : results).map(
                      (job) => (
                        <TableRow
                          key={`job-${job.id}`}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewDetails(job)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                                      {job.title}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>{job.title}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex flex-wrap gap-1">
                                {job.level && (
                                  <Badge variant="outline" className="text-xs">
                                    {job.level}
                                  </Badge>
                                )}
                                {job.seniorityLevel && (
                                  <Badge variant="outline" className="text-xs">
                                    {job.seniorityLevel}
                                  </Badge>
                                )}
                                {job.remote && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Remote
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="font-medium line-clamp-1">
                                    {job.company}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{job.company}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {job.remote ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    Remote
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    On-site
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(job.cityNormalized ?? job.location) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {job.cityNormalized ?? job.location}
                                </span>
                              </div>
                            )}
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
                                className="hover:bg-primary/10 hover:border-primary hover:text-[color:var(--foreground)] relative overflow-hidden group/btn"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                <Lightbulb className="mr-1 size-3 relative z-10" />
                                <span className="relative z-10">
                                  Interview with AI
                                </span>
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
                      ),
                    )}
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
                {(isFirstLoad ? shuffleArray(results) : results).map((job) => (
                  <JobCard
                    key={`job-${job.id}`}
                    job={job}
                    onViewDetails={handleViewDetails}
                    onPrepare={handlePrepareJob}
                    layout={viewLayout}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
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
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    let pageNum: number;

                    if (pageCount <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= pageCount - 2)
                      pageNum = pageCount - 4 + i;
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
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pageCount, p + 1))
                  }
                  disabled={currentPage === pageCount || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : null}
      </section>

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
