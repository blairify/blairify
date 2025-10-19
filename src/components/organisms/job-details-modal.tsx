"use client";

import {
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { JobData } from "@/types/job-market";

interface JobDescriptionParserProps {
  description: string;
}

function JobDescriptionParser({ description }: JobDescriptionParserProps) {
  // Parse the description and format it nicely
  const parseDescription = (text: string): React.ReactNode[] => {
    // Handle different section markers
    const sectionPatterns = [
      /\*\*([^*]+)\*\*/g, // **SECTION**
      /## ([^\n]+)/g, // ## SECTION
      /### ([^\n]+)/g, // ### SECTION
      /([A-Z][A-Z\s]+):/g, // SECTION NAME:
    ];

    let sections: Array<{ header: string; content: string }> = [];
    const _remainingText = text;

    // Try to extract sections using different patterns
    for (const pattern of sectionPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        sections = [];
        const _lastIndex = 0;

        matches.forEach((match, index) => {
          const header = match[1].trim();
          const startIndex = match.index ?? 0 + match[0].length;
          const endIndex =
            index < matches.length - 1
              ? (matches[index + 1].index ?? 0)
              : text.length;

          const content = text.slice(startIndex, endIndex).trim();
          if (content) {
            sections.push({ header, content });
          }
        });

        if (sections.length > 0) break;
      }
    }

    // If no sections found, format as paragraphs
    if (sections.length === 0) {
      return text
        .split("\n\n")
        .filter((p) => p.trim())
        .map((paragraph, index) => (
          <p
            key={`para-${paragraph.slice(0, 20)}-${index}`}
            className="mb-4 last:mb-0 leading-relaxed"
          >
            {paragraph.split("\n").map((line) => (
              <span key={`line-${line}`}>
                {line.trim()}
                {line !==
                  paragraph.split("\n")[paragraph.split("\n").length - 1] && (
                  <br />
                )}
              </span>
            ))}
          </p>
        ));
    }

    // Render sections
    return sections.map((section) => (
      <div key={`section-${section.header}`} className="mb-6">
        <h4 className="font-semibold text-base mb-3 text-primary">
          {section.header}
        </h4>
        <div className="text-sm leading-relaxed">
          {section.content
            .split("\n\n")
            .filter((p) => p.trim())
            .map((paragraph, pIndex) => (
              <p
                key={`para-${paragraph.slice(0, 20)}-${pIndex}`}
                className="mb-3 last:mb-0"
              >
                {paragraph.split("\n").map((line) => (
                  <span key={`line-${line}`}>
                    {line.trim()}
                    {line !==
                      paragraph.split("\n")[
                        paragraph.split("\n").length - 1
                      ] && <br />}
                  </span>
                ))}
              </p>
            ))}
        </div>
      </div>
    ));
  };

  return <div>{parseDescription(description)}</div>;
}

interface JobDetailsModalProps {
  job: JobData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailsModal({
  job,
  open,
  onOpenChange,
}: JobDetailsModalProps) {
  if (!job) return null;

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

  const getSiteColor = (site: string) => {
    const colors: Record<string, string> = {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto w-[calc(100vw-2rem)] sm:w-auto">
        <DialogHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold pr-8">
                {job.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-lg">
                {job.company}
              </DialogDescription>
            </div>
            <Badge className={getSiteColor(job.site)}>{job.site}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.location.full_location || "Location not specified"}
                </span>
                {job.is_remote && <Badge variant="secondary">Remote</Badge>}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.job_type
                    ? job.job_type.charAt(0).toUpperCase() +
                      job.job_type.slice(1)
                    : "Not specified"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{getTimeAgo(job.date_posted || job.scraped_at)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatSalary(job)}</span>
              </div>

              {job.company_industry && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company_industry}</span>
                </div>
              )}

              {job.job_level && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{job.job_level}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Job Description</h3>
              <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                <JobDescriptionParser description={job.description} />
              </div>
            </div>
          )}

          {/* Company Info */}
          {(job.company_url || job.company_description) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">About {job.company}</h3>
                {job.company_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {job.company_description}
                  </p>
                )}
                {job.company_url && (
                  <a
                    href={job.company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Visit Company Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Apply on {job.site}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Save Job
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
            <p>Job ID: {job.id}</p>
            <p>
              Scraped from {job.site} at{" "}
              {new Date(job.scraped_at).toLocaleString()}
            </p>
            <p>
              Search term: "{job.search_term}" in{" "}
              {job.search_location || "Any location"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
