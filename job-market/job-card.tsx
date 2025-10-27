"use client";

import {
  Bookmark,
  Brain,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Home,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseJobDescription } from "@/lib/parse-job-descrpition";

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  type?: string | null;
  level?: string | null;
  remote: boolean;
  salary?: string | null;
  minAmount?: string | null;
  maxAmount?: string | null;
  currency?: string;
  interval?: string;
  url?: string | null;
  jobUrl?: string;
  jobUrlDirect?: string;
  category?: string | null;
  tags?: string[];
  skills?: string;
  postedAt: string | Date;
  companyLogo?: string | null;
  companyDescription?: string | null;
  jobFunction?: string | null;
  experienceRange?: string | null;
  companyRating?: number | null;
  companyRevenue?: string | null;
  companyNumEmployees?: string | null;
  companyIndustry?: string | null;
  companyAddresses?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onPrepare?: (job: Job) => void;
  layout?: "grid" | "list" | "compact";
}

export function JobCard({
  job,
  onViewDetails,
  onPrepare,
  layout = "grid",
}: JobCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getTimeAgo = () => {
    // Prefer datePosted, fallback to createdAt, then updatedAt
    const dateStr = job.postedAt || job.createdAt || job.updatedAt;
    if (!dateStr) return "Unknown";

    const postedDate = new Date(dateStr);
    if (Number.isNaN(postedDate.getTime())) return "Unknown";

    const diffDays = Math.floor(
      (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formatSalary = () => {
    if (!job.minAmount && !job.maxAmount) return job.salary || null;
    const min = job.minAmount ? Number(job.minAmount) : null;
    const max = job.maxAmount ? Number(job.maxAmount) : null;
    if (min && max)
      return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)} / ${job.interval || "year"}`;
    if (min) return `$${(min / 1000).toFixed(0)}k / ${job.interval || "year"}`;
    if (max) return `$${(max / 1000).toFixed(0)}k / ${job.interval || "year"}`;
    return null;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
    onViewDetails?.(job);
  };

  const handleApply = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePrepare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrepare?.(job);
  };

  return (
    <>
      <Card
        className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full ${
          layout === "list" ? "flex flex-row" : "flex flex-col"
        }`}
        onClick={handleCardClick}
      >
        <CardHeader
          className={`${
            layout === "list"
              ? "py-4 pr-4 pl-4"
              : layout === "compact"
                ? "pb-2"
                : ""
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            {/* Company Logo */}
            {job.companyLogo && job.companyLogo !== "nan" ? (
              <div
                className={`flex-shrink-0 ${
                  layout === "compact"
                    ? "h-8 w-8"
                    : layout === "list"
                      ? "h-12 w-12"
                      : "h-10 w-10"
                } relative rounded-md overflow-hidden bg-muted flex items-center justify-center`}
              >
                <Image
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  fill
                  className="object-contain p-1"
                  sizes={
                    layout === "compact"
                      ? "32px"
                      : layout === "list"
                        ? "48px"
                        : "40px"
                  }
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div
                className={`flex-shrink-0 ${
                  layout === "compact"
                    ? "h-8 w-8"
                    : layout === "list"
                      ? "h-12 w-12"
                      : "h-10 w-10"
                } rounded-md bg-primary/10 flex items-center justify-center`}
              >
                <Building2
                  className={`text-primary ${
                    layout === "compact" ? "h-4 w-4" : "h-5 w-5"
                  }`}
                />
              </div>
            )}

            {/* Title and Company */}
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`group-hover:text-primary transition-colors break-words ${
                  layout === "compact"
                    ? "text-base font-semibold line-clamp-2"
                    : "text-xl line-clamp-2"
                }`}
              >
                {job.title}
              </CardTitle>
              <CardDescription
                className={`flex items-center gap-2 text-sm text-muted-foreground line-clamp-1 break-words min-w-0 ${
                  layout === "compact" ? "mt-1" : "mt-2"
                }`}
              >
                <span className="font-medium">{job.company}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`flex-1 flex flex-col ${
            layout === "list" ? "py-4 pr-4" : layout === "compact" ? "pt-2" : ""
          }`}
        >
          <div
            className={`flex-1 ${layout === "compact" ? "space-y-2" : "space-y-4"}`}
          >
            <div
              className={`flex flex-wrap text-sm text-muted-foreground ${
                layout === "compact" ? "gap-2" : "gap-4"
              }`}
            >
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin
                    className={`flex-shrink-0 text-muted-foreground ${
                      layout === "compact" ? "h-3 w-3" : "h-4 w-4"
                    }`}
                  />
                  <span
                    className={`truncate ${layout === "compact" ? "text-xs" : ""}`}
                  >
                    {job.location}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {job.remote ? (
                  <>
                    <Home
                      className={`flex-shrink-0 text-green-600 dark:text-green-400 ${
                        layout === "compact" ? "h-3 w-3" : "h-4 w-4"
                      }`}
                    />
                    <span
                      className={`text-green-600 dark:text-green-400 font-medium ${layout === "compact" ? "text-xs" : ""}`}
                    >
                      Remote
                    </span>
                  </>
                ) : (
                  <>
                    <Building2
                      className={`flex-shrink-0 text-blue-600 dark:text-blue-400 ${
                        layout === "compact" ? "h-3 w-3" : "h-4 w-4"
                      }`}
                    />
                    <span
                      className={`text-blue-600 dark:text-blue-400 font-medium ${layout === "compact" ? "text-xs" : ""}`}
                    >
                      On-site
                    </span>
                  </>
                )}
              </div>
              {formatSalary() && (
                <div className="flex items-center gap-1">
                  <DollarSign
                    className={`flex-shrink-0 text-muted-foreground ${
                      layout === "compact" ? "h-3 w-3" : "h-4 w-4"
                    }`}
                  />
                  <span className={layout === "compact" ? "text-xs" : ""}>
                    {formatSalary()}
                  </span>
                </div>
              )}
            </div>

            {/* Job Description Preview */}
            {job.description && layout !== "compact" && (
              <div className="text-sm text-foreground/90 line-clamp-3">
                {(() => {
                  const parsed = parseJobDescription(job.description || "");
                  const previewSection = parsed.sections[0];
                  if (!previewSection) return null;
                  const renderTextWithLinks = (text: string) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = text.split(urlRegex);
                    return parts.map((part, idx) =>
                      urlRegex.test(part) ? (
                        <a
                          key={`link-${part.replace(/[^a-zA-Z0-9]/g, "")}`}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-primary hover:text-primary/80"
                        >
                          {part}
                        </a>
                      ) : (
                        <span
                          key={`text-${part.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || `empty-${idx}`}`}
                        >
                          {part}
                        </span>
                      ),
                    );
                  };
                  const elements: React.ReactNode[] = [];
                  let linesShown = 0;
                  for (const line of previewSection.content) {
                    if (linesShown >= 3) break;
                    if (line.startsWith("-")) {
                      elements.push(
                        <li key={linesShown} className="ml-5 list-disc">
                          {renderTextWithLinks(line.replace(/^-/, "").trim())}
                        </li>,
                      );
                    } else {
                      elements.push(
                        <p key={linesShown} className="mb-1">
                          {renderTextWithLinks(line)}
                        </p>,
                      );
                    }
                    linesShown++;
                  }
                  return elements;
                })()}
              </div>
            )}

            {/* Tags & Level */}
            <div
              className={`flex flex-wrap ${
                layout === "compact" ? "gap-1" : "gap-2"
              }`}
            >
              {job.level && job.level !== "none" && (
                <Badge
                  variant="outline"
                  className={layout === "compact" ? "text-xs px-1.5 py-0" : ""}
                >
                  {job.level}
                </Badge>
              )}
              {job.category && job.category !== "none" && (
                <Badge
                  variant="outline"
                  className={layout === "compact" ? "text-xs px-1.5 py-0" : ""}
                >
                  {job.category}
                </Badge>
              )}
              {job.tags?.slice(0, layout === "compact" ? 2 : 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={layout === "compact" ? "text-xs px-1.5 py-0" : ""}
                >
                  {tag}
                </Badge>
              ))}
              {job.skills
                ?.split(",")
                .slice(0, layout === "compact" ? 2 : 3)
                .map((skill) => (
                  <Badge
                    key={skill.trim()}
                    variant="outline"
                    className={
                      layout === "compact" ? "text-xs px-1.5 py-0" : ""
                    }
                  >
                    {skill.trim()}
                  </Badge>
                ))}
            </div>

            {/* Posted Date */}
            {layout !== "compact" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Posted {getTimeAgo()}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`flex gap-2 ${
                layout === "compact" ? "mt-2" : "mt-5"
              } ${
                layout === "list"
                  ? "flex-row justify-end"
                  : "flex-col sm:flex-row"
              }`}
            >
              <Button
                variant="outline"
                size={layout === "compact" ? "sm" : "sm"}
                className={`hover:bg-primary/10 hover:border-primary relative overflow-hidden group/btn ${
                  layout === "compact"
                    ? "h-8 text-xs flex-1"
                    : layout === "list"
                      ? "h-9 px-4"
                      : "flex-1"
                }`}
                onClick={handlePrepare}
              >
                {/* Glow animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <Brain
                  className={`relative z-10 ${
                    layout === "compact" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"
                  }`}
                />
                <span className="relative z-10">
                  {layout === "compact" ? "AI Interview" : "Interview with AI"}
                </span>
              </Button>
              <Button
                size={layout === "compact" ? "sm" : "sm"}
                className={`${
                  layout === "compact"
                    ? "h-8 text-xs flex-1"
                    : layout === "list"
                      ? "h-9 px-4"
                      : "flex-1"
                }`}
                onClick={(e) => handleApply(e, job.jobUrlDirect || job.jobUrl)}
                disabled={!job.jobUrl && !job.jobUrlDirect}
              >
                <ExternalLink
                  className={`${
                    layout === "compact" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"
                  }`}
                />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {job.company} • {job.location || "Remote"}
                </DialogDescription>
              </div>
              {job.companyLogo && job.companyLogo !== "nan" && (
                <Image
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Job Metadata */}
            <div className="flex flex-wrap gap-4 text-sm">
              {job.type && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{job.type}</span>
                </div>
              )}
              {job.level && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Level:</span>
                  <span>{job.level}</span>
                </div>
              )}
              {formatSalary() && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatSalary()}</span>
                </div>
              )}
              {job.remote && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Remote
                </Badge>
              )}
            </div>

            {/* Job Description */}
            {job.description ? (
              (() => {
                const parsed = parseJobDescription(job.description || "");
                const renderTextWithLinks = (text: string) => {
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const parts = text.split(urlRegex);
                  return parts.map((part, idx) =>
                    urlRegex.test(part) ? (
                      <a
                        key={`link-${part.replace(/[^a-zA-Z0-9]/g, "")}`}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary hover:text-primary/80"
                      >
                        {part}
                      </a>
                    ) : (
                      <span
                        key={`text-${part.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || `empty-${idx}`}`}
                      >
                        {part}
                      </span>
                    ),
                  );
                };
                return (
                  <div className="text-[15px] leading-relaxed text-foreground/90 space-y-5">
                    {parsed.sections.map((section, i) => (
                      <div key={`section-${section.title}-${i}`}>
                        <h4 className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1 uppercase">
                          {section.title}
                        </h4>
                        {(() => {
                          const elements: React.ReactNode[] = [];
                          let listItems: string[] = [];
                          const flushList = () => {
                            if (listItems.length > 0) {
                              elements.push(
                                <ul
                                  key={`ul-${i}-${elements.length}`}
                                  className="list-disc ml-5 mb-3 space-y-1"
                                >
                                  {listItems.map((item, j) => (
                                    <li
                                      key={`item-${item.slice(0, 20)}-${j}`}
                                      className="text-foreground/90"
                                    >
                                      {renderTextWithLinks(
                                        item.replace(/^-/, "").trim(),
                                      )}
                                    </li>
                                  ))}
                                </ul>,
                              );
                              listItems = [];
                            }
                          };
                          section.content.forEach((line) => {
                            if (line.startsWith("-")) {
                              listItems.push(line);
                            } else {
                              flushList();
                              elements.push(
                                <p key={elements.length} className="mb-2">
                                  {renderTextWithLinks(line)}
                                </p>,
                              );
                            }
                          });
                          flushList();
                          return elements;
                        })()}
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <p className="text-muted-foreground">No description available</p>
            )}

            {/* Company Info */}
            {job.companyDescription && (
              <div className="space-y-2">
                <h3 className="font-semibold">About {job.company}</h3>
                <p className="text-muted-foreground">
                  {job.companyDescription}
                </p>
              </div>
            )}

            {/* Additional Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.jobFunction && (
                <div>
                  <h4 className="font-medium">Job Function</h4>
                  <p className="text-muted-foreground">{job.jobFunction}</p>
                </div>
              )}
              {job.experienceRange && (
                <div>
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-muted-foreground">{job.experienceRange}</p>
                </div>
              )}
              {job.companyRating !== null &&
                job.companyRating !== undefined && (
                  <div>
                    <h4 className="font-medium">Company Rating</h4>
                    <p className="text-muted-foreground">
                      {job.companyRating.toFixed(1)}/5.0
                    </p>
                  </div>
                )}
              {job.companyRevenue && (
                <div>
                  <h4 className="font-medium">Revenue</h4>
                  <p className="text-muted-foreground">{job.companyRevenue}</p>
                </div>
              )}
              {job.companyNumEmployees && (
                <div>
                  <h4 className="font-medium">Employees</h4>
                  <p className="text-muted-foreground">
                    {job.companyNumEmployees}
                  </p>
                </div>
              )}
              {job.companyIndustry && (
                <div>
                  <h4 className="font-medium">Industry</h4>
                  <p className="text-muted-foreground">{job.companyIndustry}</p>
                </div>
              )}
              {job.companyAddresses && (
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-muted-foreground">
                    {job.companyAddresses}
                  </p>
                </div>
              )}
            </div>

            {/* Tags / Skills */}
            {job.tags?.length || job.skills ? (
              <div className="space-y-2">
                <h4 className="font-medium">Skills & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {job.skills?.split(",").map((skill) => (
                    <Badge key={skill.trim()} variant="outline">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Dialog Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onPrepare?.(job)}>
                <Bookmark className="h-4 w-4 mr-2" />
                Prepare for Interview
              </Button>
              <Button
                onClick={(e) =>
                  handleApply(e, job.url || job.jobUrlDirect || job.jobUrl)
                }
                disabled={!job.url && !job.jobUrlDirect && !job.jobUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
