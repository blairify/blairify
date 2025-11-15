"use client";

import {
  ArrowRight,
  Building2,
  Clock,
  ExternalLink,
  Lightbulb,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobListing } from "@/lib/services/landing-page-data";
import {
  formatDatePosted,
  formatJobType,
  formatLocation,
  formatSalary,
} from "@/lib/utils/job-formatting";

interface JobListingsPromoProps {
  jobs: JobListing[];
}

export function JobListingsPromo({ jobs }: JobListingsPromoProps) {
  const router = useRouter();
  const featuredJobs = jobs.slice(0, 4);
  return (
    <section
      className=" max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 bg-muted/30 overflow-hidden"
      aria-labelledby="job-listings-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
          {/* Job Listings - Left Side */}
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-left-8 duration-1000 delay-200 order-last lg:order-first">
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              aria-label="Featured job opportunities"
            >
              {featuredJobs.map((job, index) => (
                <Card
                  key={job.id}
                  className="p-4 rounded-lg transition-colors border space-y-1 gap-2 group hover:shadow-md"
                  style={{
                    animationDelay: `${600 + index * 100}ms`,
                  }}
                  role="listitem"
                  aria-label={`Job: ${job.title} at ${job.company}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {job.company}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {formatJobType(job.jobType)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatLocation(job.location, job.isRemote)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDatePosted(job.datePosted)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-green-600">
                        {formatSalary(job)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-2/3 text-xs hover:bg-primary/10 hover:border-primary hover:text-blue-800 relative overflow-hidden group/btn"
                      onClick={() => router.push("/configure")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      <Lightbulb className="h-3 w-3 mr-1 relative z-10" />
                      <span className="relative z-10">Interview with AI</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-1/3 text-xs"
                      onClick={() => window.open("#", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </Card>
              ))}
            </ul>
          </div>

          <div className="space-y-4 sm:space-y-8 animate-in slide-in-from-right-8 duration-1000 delay-400 flex flex-col justify-left lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <h2
                id="job-listings-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
              >
                Practice for Real Job Opportunities
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Browse current job openings and practice interview questions
                specifically tailored to these positions. No stress, no
                pressure, no payment, no excuses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-left lg:justify-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Real job postings from top companies
                </span>
              </div>
              <div className="flex items-center justify-left lg:justify-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Position-specific interview preparation
                </span>
              </div>

              <div className="flex items-center justify-left lg:justify-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  A stressless way to pepare for your next interview
                </span>
              </div>
              <div className="flex items-center justify-left lg:justify-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  First ever AI-powered job interview preparation tool
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-left lg:justify-start">
              <Button
                onClick={() => router.push("/jobs")}
                aria-label="Browse All Jobs"
                className="group w-full sm:w-auto"
              >
                Browse All Jobs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                aria-label="Start Practice Interview"
                className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary hover:text-blue-800 relative overflow-hidden group/btn"
                onClick={() => router.push("/configure")}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <Lightbulb className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Start Practice Interview</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
