"use client";

import { ArrowRight, Brain } from "lucide-react";
import { useState } from "react";
import { AIInterviewerCard } from "@/components/jobs/molecules/ai-interviewer-card";
import { CompanyPreparationCard } from "@/components/jobs/molecules/company-preparation-card";
import { InterviewExpectations } from "@/components/jobs/molecules/interview-expectations";
import { InterviewOverviewCards } from "@/components/jobs/molecules/interview-overview-cards";
import { JobContextCard } from "@/components/jobs/molecules/job-context-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInterviewDetails } from "@/hooks/use-interview-details";
import type { Job } from "@/lib/validators";

interface InterviewPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  job: Job;
}

export function InterviewPreparationModal({
  isOpen,
  onClose,
  onConfirm,
  job,
}: InterviewPreparationModalProps) {
  const [isStarting, setIsStarting] = useState(false);
  const { duration, questionCount, interviewType } = useInterviewDetails(job);

  const handleStartInterview = async () => {
    setIsStarting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl md:max-w-3xl lg:max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            AI Interview Preparation
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
            Get ready for your personalized interview experience for{" "}
            <span className="font-semibold text-foreground">{job.title}</span>{" "}
            at{" "}
            <span className="font-semibold text-foreground">{job.company}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interview Overview Cards */}
          <InterviewOverviewCards
            duration={duration}
            questionCount={questionCount}
            interviewType={interviewType}
          />

          {/* AI Interviewer Info */}
          <AIInterviewerCard jobCompany={job.company} jobTitle={job.title} />

          {/* Company-Specific Preparation */}
          <CompanyPreparationCard
            jobCompany={job.company}
            jobTitle={job.title}
          />

          {/* What to Expect */}
          <InterviewExpectations />

          {/* Job Context */}
          <JobContextCard job={job} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11"
            disabled={isStarting}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleStartInterview}
            className="flex-1 h-11 bg-primary hover:bg-primary/90"
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Starting Interview...
              </>
            ) : (
              <>
                Start AI Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
