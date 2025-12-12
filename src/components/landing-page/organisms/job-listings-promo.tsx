"use client";

import { ArrowRight, ExternalLink, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobListing } from "@/lib/services/landing-page-data";
import { formatJobType } from "@/lib/utils/job-formatting";

interface JobListingsPromoProps {
  jobs: JobListing[];
}

export function JobListingsPromo({ jobs }: JobListingsPromoProps) {
  const router = useRouter();
  const featuredJobs = jobs.slice(0, 4);
  return (
    <section
      className="w-full bg-[color:var(--secondary)] py-12 sm:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="job-listings-heading"
      data-analytics-id="home-jobs-promo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
          {/* Job Listings - Left Side */}
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-left-8 duration-1000 delay-200 order-last lg:order-first max-w-xl lg:max-w-none mx-auto lg:mx-0">
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
                        <span className="text-xs  font-medium">
                          {job.company}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {formatJobType(job.jobType)}
                    </Badge>
                  </div>

                  <div className="flex flex-col min-[600px]:flex-row gap-2 pt-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full min-[600px]:w-1/3 text-xs"
                      onClick={() => window.open("#", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full min-[600px]:flex-1 text-xs hover:bg-primary/10 hover:border-primary hover:text-[color:var(--foreground)] relative overflow-hidden group/btn"
                      onClick={() => router.push("/configure")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      <Lightbulb className="h-3 w-3 mr-1 relative z-10" />
                      <span className="relative z-10">Interview with AI</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </ul>
          </div>

          <div className="space-y-4 sm:space-y-8 animate-in slide-in-from-right-8 duration-1000 delay-400 flex flex-col items-center lg:items-start justify-center text-center lg:text-left max-w-xl lg:max-w-none mx-auto lg:mx-0">
            <div className="space-y-4 sm:space-y-6">
              <Typography.Heading2
                id="job-listings-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
              >
                Practice for Real Job Opportunities
              </Typography.Heading2>
              <Typography.Body
                color="secondary"
                className="text-base sm:text-lg leading-relaxed max-w-2xl lg:max-w-3xl mx-auto lg:mx-0"
              >
                Browse current job openings and practice interview questions
                specifically tailored to these positions. No stress, no
                pressure, no payment, no excuses.
              </Typography.Body>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
