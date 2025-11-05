"use client";

import { Sparkles } from "lucide-react";

interface AIInterviewerCardProps {
  jobCompany: string;
  jobTitle: string;
}

export function AIInterviewerCard({
  jobCompany,
  jobTitle,
}: AIInterviewerCardProps) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 transition-colors hover:bg-primary/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
            Your AI Interviewer
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Meet Alex, your specialized AI interviewer trained in{" "}
            <span className="font-medium text-foreground">{jobCompany}</span>{" "}
            interview practices and{" "}
            <span className="font-medium text-foreground">{jobTitle}</span> role
            requirements. Alex will adapt questions based on your responses and
            provide real-time feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
