"use client";

import {
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
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
  url?: string | null;
  category?: string | null;
  tags?: string[];
  postedAt: string | Date;
  jobUrl?: string;
  companyLogo?: string | null;
  companyDescription?: string | null;
  jobFunction?: string | null;
  experienceRange?: string | null;
  companyRating?: number | null;
}

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onPrepare?: (job: Job) => void;
}

export function JobCard({ job, onViewDetails, onPrepare }: JobCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const postedDate = new Date(job.postedAt);
  const daysAgo = Math.floor(
    (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const getTimeAgo = () => {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
    onViewDetails?.(job);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.jobUrl) {
      window.open(job.jobUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrepare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrepare?.(job);
  };

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full flex flex-col"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {job.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium truncate">{job.company}</span>
              </CardDescription>
            </div>
            {job.remote && (
              <Badge variant="secondary" className="ml-2">
                Remote
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            {/* Location and Type */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
              {job.type && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{job.type}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            {/* OPS-9 : write a parser for description coming from neon */}
            {job.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Tags and Level */}
            <div className="flex flex-wrap gap-2">
              {job.level && <Badge variant="outline">{job.level}</Badge>}
              {job.category && <Badge variant="outline">{job.category}</Badge>}
              {job.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Posted date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>Posted {getTimeAgo()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handlePrepare}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Prepare
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApply}
              disabled={!job.jobUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {job.company} • {job.location}
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
              {job.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{job.salary}</span>
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
            <div className="space-y-2">
              <h3 className="font-semibold">Job Description</h3>
              <div className="prose max-w-none">
                {job.description ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {job.description.replace(/<[^>]*>/g, "")}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No description available
                  </p>
                )}
              </div>
            </div>

            {/* Company Info */}
            {job.companyDescription && (
              <div className="space-y-2">
                <h3 className="font-semibold">About {job.company}</h3>
                <p className="text-muted-foreground">
                  {job.companyDescription}
                </p>
              </div>
            )}

            {/* Job Details */}
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
              {job.companyRating !== undefined &&
                job.companyRating !== null && (
                  <div>
                    <h4 className="font-medium">Company Rating</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {job.companyRating.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Skills & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onPrepare?.(job)}>
              <Bookmark className="h-4 w-4 mr-2" />
              Prepare for Interview
            </Button>
            <Button
              onClick={() =>
                job.url && window.open(job.url, "_blank", "noopener,noreferrer")
              }
              disabled={!job.url}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
