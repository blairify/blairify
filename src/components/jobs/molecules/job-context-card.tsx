"use client";

import type { Job } from "@/lib/validators";

interface JobContextCardProps {
  job: Job;
}

export function JobContextCard({ job }: JobContextCardProps) {
  const contextItems = [
    { label: "Position", value: job.title },
    { label: "Company", value: job.company },
    { label: "Level", value: job.level || "Mid-level" },
    { label: "Location", value: job.location || "Remote" },
  ];

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 transition-colors hover:bg-muted/70">
      <h4 className="font-medium text-sm sm:text-base mb-3 text-foreground">
        Interview Context
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        {contextItems.map((item) => (
          <div key={item.label} className="flex justify-between sm:block">
            <span className="font-medium text-muted-foreground">
              {item.label}:
            </span>
            <span className="text-foreground ml-2 sm:ml-0 sm:block truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
