"use client";

import {
  Bookmark,
  Briefcase,
  Clock,
  ExternalLink,
  Lightbulb,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useJobValidation,
  useValidatedJobData,
} from "@/hooks/use-job-validation";
import { parseJobDescription } from "@/lib/parse-job-descrpition";
import type { Job } from "@/lib/validators";

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

  // Use validation hooks for clean separation of concerns
  const validation = useJobValidation(job);
  const { safeData } = useValidatedJobData(job);

  // Early return if job is not valid for display
  if (!validation.isValid) {
    return null;
  }

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
            {/* Title and Company */}
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`group-hover:text-primary transition-colors break-words ${
                  layout === "compact" ? "text-base font-semibold" : "text-xl"
                }`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="line-clamp-1">{job.title}</span>
                    </TooltipTrigger>
                    <TooltipContent>{job.title}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
          <div className="flex flex-1 flex-col">
            <div className={layout === "compact" ? "space-y-2" : "space-y-4"}>
              <div
                className={`flex flex-wrap justify-between text-sm text-muted-foreground ${
                  layout === "compact" ? "gap-2" : "gap-4"
                }`}
              >
                <div className="flex items-center gap-1">
                  {job.remote ? (
                    <span
                      className={`text-green-600 dark:text-green-400 font-medium ${layout === "compact" ? "text-xs" : ""}`}
                    >
                      Remote
                    </span>
                  ) : (
                    <span
                      className={`text-blue-600 dark:text-blue-400 font-medium ${layout === "compact" ? "text-xs" : ""}`}
                    >
                      On-site
                    </span>
                  )}
                </div>

                {safeData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin
                      className={`flex-shrink-0 text-muted-foreground ${
                        layout === "compact" ? "h-3 w-3" : "h-4 w-4"
                      }`}
                    />
                    <span
                      className={`truncate ${layout === "compact" ? "text-xs" : ""}`}
                    >
                      {safeData.location}
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
                {safeData.level && (
                  <Badge
                    variant="outline"
                    className={
                      layout === "compact" ? "text-xs px-1.5 py-0" : ""
                    }
                  >
                    {safeData.level}
                  </Badge>
                )}
                {job.seniorityLevel && (
                  <Badge
                    variant="outline"
                    className={
                      layout === "compact" ? "text-xs px-1.5 py-0" : ""
                    }
                  >
                    {job.seniorityLevel}
                  </Badge>
                )}
                {safeData.category && (
                  <Badge
                    variant="secondary"
                    className={
                      layout === "compact" ? "text-xs px-1.5 py-0" : ""
                    }
                  >
                    {safeData.category}
                  </Badge>
                )}
                {safeData.tags
                  .slice(0, layout === "compact" ? 2 : 3)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={
                        layout === "compact" ? "text-xs px-1.5 py-0" : ""
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                {safeData.skills
                  .slice(0, layout === "compact" ? 2 : 3)
                  .map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className={
                        layout === "compact" ? "text-xs px-1.5 py-0" : ""
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
              </div>

              {/* Posted Date */}
              {layout !== "compact" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>Posted {safeData.formattedDate}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`mt-auto flex gap-2 ${
                layout === "compact" ? "pt-2" : "pt-4"
              } ${
                layout === "list"
                  ? "flex-row justify-end"
                  : "flex-col sm:flex-row"
              }`}
            >
              <Button
                variant="outline"
                size={layout === "compact" ? "sm" : "sm"}
                className={`hover:bg-primary/10 hover:border-primary hover:text-[color:var(--foreground)] relative overflow-hidden group/btn ${
                  layout === "compact"
                    ? "h-8 text-xs flex-1"
                    : layout === "list"
                      ? "h-9 px-4"
                      : "flex-1"
                }`}
                onClick={handlePrepare}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <Lightbulb className="mr-1 size-3 relative z-10" />
                <span className="relative z-10">Interview with AI</span>
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
        <DialogContent className="max-w-2xl md:max-w-4xl lg:max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg md:text-xl font-bold leading-tight">
                  {job.title}
                </DialogTitle>
                <DialogDescription className="text-base md:text-lg mt-1">
                  {job.company} • {safeData.location || "Remote"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Job Metadata */}
            <div className="flex flex-wrap gap-4 text-sm">
              {safeData.type && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{safeData.type}</span>
                </div>
              )}
              {safeData.level && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Level:</span>
                  <span>{safeData.level}</span>
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
                  <div className="text-sm md:text-base leading-relaxed text-foreground/90 space-y-4">
                    {parsed.sections.map((section, i) => (
                      <div key={`section-${section.title}-${i}`}>
                        <Typography.Heading3 className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1 uppercase tracking-wide">
                          {section.title}
                        </Typography.Heading3>
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
              <Typography.Body color="secondary">
                No description available
              </Typography.Body>
            )}

            {/* Company Info */}
            {job.companyDescription?.trim() &&
              job.companyDescription.toLowerCase() !== "none" && (
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Typography.Heading3 className="font-semibold">
                    About {job.company}
                  </Typography.Heading3>
                  <Typography.Body
                    color="secondary"
                    className="text-sm leading-relaxed"
                  >
                    {job.companyDescription}
                  </Typography.Body>
                </div>
              )}

            {/* Additional Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.jobFunction?.trim() &&
                job.jobFunction.toLowerCase() !== "none" && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Typography.BodyMedium className="text-sm">
                      Job Function
                    </Typography.BodyMedium>
                    <Typography.Body color="secondary" className="text-sm">
                      {job.jobFunction}
                    </Typography.Body>
                  </div>
                )}
              {job.experienceRange?.trim() &&
                job.experienceRange.toLowerCase() !== "none" && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Typography.BodyMedium className="text-sm">
                      Experience
                    </Typography.BodyMedium>
                    <Typography.Body color="secondary" className="text-sm">
                      {job.experienceRange}
                    </Typography.Body>
                  </div>
                )}
              {safeData.companyRating && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <Typography.BodyMedium className="text-sm">
                    Company Rating
                  </Typography.BodyMedium>
                  <Typography.Body color="secondary" className="text-sm">
                    {safeData.companyRating.toFixed(1)}/5.0
                  </Typography.Body>
                </div>
              )}
              {job.companyRevenue?.trim() &&
                job.companyRevenue.toLowerCase() !== "none" && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Typography.BodyMedium className="text-sm">
                      Revenue
                    </Typography.BodyMedium>
                    <Typography.Body color="secondary" className="text-sm">
                      {job.companyRevenue}
                    </Typography.Body>
                  </div>
                )}
              {job.companyNumEmployees?.trim() &&
                job.companyNumEmployees.toLowerCase() !== "none" && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Typography.BodyMedium className="text-sm">
                      Employees
                    </Typography.BodyMedium>
                    <Typography.Body color="secondary" className="text-sm">
                      {job.companyNumEmployees}
                    </Typography.Body>
                  </div>
                )}
              {job.companyIndustry?.trim() &&
                job.companyIndustry.toLowerCase() !== "none" && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Typography.BodyMedium className="text-sm">
                      Industry
                    </Typography.BodyMedium>
                    <Typography.Body color="secondary" className="text-sm">
                      {job.companyIndustry}
                    </Typography.Body>
                  </div>
                )}
            </div>

            {/* Tags / Skills */}
            {(safeData.tags.length > 0 || safeData.skills.length > 0) && (
              <div className="space-y-3">
                <Typography.Heading3 className="font-medium">
                  Skills & Technologies
                </Typography.Heading3>
                <div className="flex flex-wrap gap-2">
                  {safeData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dialog Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onPrepare?.(job)}
                className="flex-1 sm:flex-none"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Prepare for Interview
              </Button>
              <Button
                onClick={(e) =>
                  handleApply(e, job.url || job.jobUrlDirect || job.jobUrl)
                }
                disabled={!job.url && !job.jobUrlDirect && !job.jobUrl}
                className="flex-1 sm:flex-none"
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
