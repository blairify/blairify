"use client";

import { CheckCircle } from "lucide-react";

const EXPECTATIONS = [
  "Personalized questions based on the job description and company",
  "Real-time feedback and follow-up questions",
  "Comprehensive performance analysis at the end",
  "Detailed recommendations for improvement",
] as const;

export function InterviewExpectations() {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm sm:text-base text-foreground">
        What to Expect
      </h3>
      <div className="space-y-2.5">
        {EXPECTATIONS.map((expectation, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {expectation}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
