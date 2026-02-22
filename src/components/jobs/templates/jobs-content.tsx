"use client";

import { Building2, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import type { TechChoice } from "@/components/configure/types/tech-choice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPANY_PROFILES,
  INTERVIEW_MODES,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import type {
  InterviewConfig as DomainInterviewConfig,
  InterviewMode,
  InterviewType,
} from "@/lib/interview";
import { buildSearchParamsFromInterviewConfig } from "@/lib/interview";
import type {
  CompanyProfileValue,
  PositionValue,
  SeniorityValue,
} from "@/types/global";

const JOBS_TECH_CHOICES: Record<string, TechChoice[]> = {
  frontend: [
    { value: "react", label: "React", icon: "react-icon" },
    { value: "typescript", label: "TypeScript", icon: "typescript-icon" },
    { value: "javascript", label: "JavaScript", icon: "javascript-icon" },
    { value: "html5", label: "HTML", icon: "html-icon" },
    { value: "css", label: "CSS", icon: "css-icon" },
  ],
  backend: [
    { value: "python", label: "Python", icon: "python-icon" },
    { value: "java", label: "Java", icon: "java-icon" },
    { value: "go", label: "Go", icon: "go-icon" },
    { value: "rust", label: "Rust", icon: "rust-icon" },
  ],
  fullstack: [
    { value: "react", label: "React", icon: "react-icon" },
    { value: "typescript", label: "TypeScript", icon: "typescript-icon" },
    { value: "python", label: "Python", icon: "python-icon" },
    { value: "docker", label: "Docker", icon: "docker-icon" },
  ],
};

const getTechChoicesForPosition = (position: string): TechChoice[] =>
  JOBS_TECH_CHOICES[position] ?? [];

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  jobType: string;
  datePosted: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  companyLogo?: string;
  description?: string;
}

const PLACEHOLDER_JOBS: JobListing[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Mountain View, CA",
    isRemote: true,
    jobType: "Full-time",
    datePosted: "2024-01-15T10:00:00Z",
    minAmount: 150000,
    maxAmount: 250000,
    currency: "USD",
    companyLogo: "/assets/icons/google/google-original.svg",
    description:
      "Join our team to build the next generation of web experiences.",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    isRemote: true,
    jobType: "Full-time",
    datePosted: "2024-01-14T15:30:00Z",
    minAmount: 140000,
    maxAmount: 220000,
    currency: "USD",
    companyLogo: "/assets/icons/meta/meta-original.svg",
    description: "Help us build technologies that connect people.",
  },
  {
    id: "3",
    title: "Backend Software Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    isRemote: false,
    jobType: "Full-time",
    datePosted: "2024-01-13T09:15:00Z",
    minAmount: 130000,
    maxAmount: 200000,
    currency: "USD",
    companyLogo: "/assets/icons/netflix/netflix-original.svg",
    description: "Scale our streaming platform to millions of users worldwide.",
  },
  {
    id: "4",
    title: "Mobile Developer",
    company: "Apple",
    location: "Cupertino, CA",
    isRemote: true,
    jobType: "Full-time",
    datePosted: "2024-01-12T14:20:00Z",
    minAmount: 120000,
    maxAmount: 180000,
    currency: "USD",
    companyLogo: "/assets/icons/apple/apple-original.svg",
    description: "Create innovative mobile experiences for billions of users.",
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const formatSalary = (min?: number, max?: number, currency = "USD") => {
  if (!min && !max) return null;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  if (min && max)
    return `${symbol}${(min / 1000).toFixed(0)}k - ${symbol}${(max / 1000).toFixed(0)}k`;
  if (min) return `${symbol}${(min / 1000).toFixed(0)}k+`;
  return `${symbol}0 - ${symbol}${(max! / 1000).toFixed(0)}k`;
};

const MS_PER_DAY = 86_400_000;

const formatDatePosted = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const DEFAULT_POSITION: PositionValue = "frontend";
const DEFAULT_SENIORITY: SeniorityValue = "mid";
const DEFAULT_TECHNOLOGIES = ["react", "typescript"];
const DEFAULT_INTERVIEW_MODE: InterviewMode = "practice";
const DEFAULT_INTERVIEW_TYPE: InterviewType = "mixed";
const DEFAULT_COMPANY_PROFILE: CompanyProfileValue = "generic";

export function JobsContent() {
  const router = useRouter();
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedSeniority, setSelectedSeniority] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    [],
  );
  const [selectedInterviewMode, setSelectedInterviewMode] = useState<string>(
    DEFAULT_INTERVIEW_MODE,
  );
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<string>(
    DEFAULT_COMPANY_PROFILE,
  );

  const techChoicesForPosition = selectedPosition
    ? getTechChoicesForPosition(selectedPosition)
    : [];

  const handleInterviewWithAI = (job: JobListing) => {
    const config: DomainInterviewConfig = {
      position: (selectedPosition || DEFAULT_POSITION) as PositionValue,
      seniority: (selectedSeniority || DEFAULT_SENIORITY) as SeniorityValue,
      technologies:
        selectedTechnologies.length > 0
          ? selectedTechnologies
          : DEFAULT_TECHNOLOGIES,
      companyProfile: selectedCompanyProfile as CompanyProfileValue,
      specificCompany: job.company,
      interviewMode: selectedInterviewMode as InterviewMode,
      interviewType: DEFAULT_INTERVIEW_TYPE,
      duration: "30",
      company: job.company,
      jobDescription: job.description || "",
      contextType: "job-specific",
      isDemoMode: false,
    };

    const searchParams = buildSearchParamsFromInterviewConfig(config);
    router.push(`/interview?${searchParams.toString()}`);
  };

  const filteredJobs = PLACEHOLDER_JOBS.filter((job) => {
    if (selectedCompany && job.company !== selectedCompany) return false;
    if (
      selectedPosition &&
      !job.title.toLowerCase().includes(selectedPosition.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Typography.Heading1>Job Opportunities</Typography.Heading1>
          <Typography.Body color="secondary" className="max-w-3xl mx-auto">
            Explore real job openings from top tech companies and practice with
            AI interviews tailored to each position.
          </Typography.Body>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Typography.BodyBold>Position</Typography.BodyBold>
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Typography.BodyBold>Seniority</Typography.BodyBold>
                <Select
                  value={selectedSeniority}
                  onValueChange={setSelectedSeniority}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Typography.BodyBold>Company</Typography.BodyBold>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {Array.from(
                      new Set(PLACEHOLDER_JOBS.map((job) => job.company)),
                    ).map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Typography.BodyBold>Interview Mode</Typography.BodyBold>
                <Select
                  value={selectedInterviewMode}
                  onValueChange={setSelectedInterviewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPosition && techChoicesForPosition.length > 0 && (
              <div className="mt-6 space-y-3">
                <Typography.BodyBold>Technologies</Typography.BodyBold>
                <div className="flex flex-wrap gap-2">
                  {techChoicesForPosition.map((tech) => (
                    <button
                      key={tech.value}
                      type="button"
                      tabIndex={0}
                      className={`cursor-pointer px-3 py-1 rounded-md border ${
                        selectedTechnologies.includes(tech.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                      onClick={() => {
                        setSelectedTechnologies((prev) =>
                          prev.includes(tech.value)
                            ? prev.filter((t) => t !== tech.value)
                            : [...prev, tech.value],
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedTechnologies((prev) =>
                            prev.includes(tech.value)
                              ? prev.filter((t) => t !== tech.value)
                              : [...prev, tech.value],
                          );
                        }
                      }}
                    >
                      {tech.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Typography.BodyBold>Company Profile</Typography.BodyBold>
              <div className="flex flex-wrap gap-2">
                {COMPANY_PROFILES.map((profile) => (
                  <button
                    key={profile.value}
                    type="button"
                    tabIndex={0}
                    className={`cursor-pointer px-3 py-1 rounded-md border ${
                      selectedCompanyProfile === profile.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCompanyProfile(profile.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCompanyProfile(profile.value);
                      }
                    }}
                  >
                    {profile.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {job.companyLogo ? (
                      <Image
                        src={job.companyLogo}
                        alt={`${job.company} logo`}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div>
                      <Typography.BodyBold>{job.company}</Typography.BodyBold>
                      <Typography.Caption color="secondary">
                        {formatDatePosted(job.datePosted)}
                      </Typography.Caption>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs border rounded-md border-border">
                    {job.jobType}
                  </span>
                </div>

                <div className="space-y-2">
                  <Typography.Heading3>{job.title}</Typography.Heading3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                      {job.isRemote && (
                        <span className="px-2 py-1 text-xs border rounded-md border-secondary bg-secondary text-secondary-foreground">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <Typography.Caption className="line-clamp-2">
                      {job.description}
                    </Typography.Caption>
                  )}

                  {formatSalary(job.minAmount, job.maxAmount, job.currency) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <Typography.BodyBold>
                        {formatSalary(
                          job.minAmount,
                          job.maxAmount,
                          job.currency,
                        )}
                      </Typography.BodyBold>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleInterviewWithAI(job)}
                >
                  Interview with AI
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Typography.Body color="secondary">
              No jobs found matching your criteria. Try adjusting your filters.
            </Typography.Body>
          </div>
        )}
      </div>
    </div>
  );
}
