"use client";

import { CheckCircle } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

const EXPECTATIONS = [
  "Personalized questions based on the job description and company",
  "Real-time feedback and follow-up questions",
  "Comprehensive performance analysis at the end",
  "Detailed recommendations for improvement",
] as const;

export function InterviewExpectations() {
  return (
    <div className="space-y-3">
      <Typography.Heading3 className="mb-2">What to Expect</Typography.Heading3>
      <div className="space-y-2.5">
        {EXPECTATIONS.map((expectation, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <Typography.Body color="secondary" className="leading-relaxed">
              {expectation}
            </Typography.Body>
          </div>
        ))}
      </div>
    </div>
  );
}
