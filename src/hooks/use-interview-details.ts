import type { Job } from "@/lib/validators";

interface InterviewDetails {
  duration: string;
  questionCount: string;
  interviewType: string;
}

export function useInterviewDetails(job: Job): InterviewDetails {
  const jobTitle = job.title?.toLowerCase() || "";

  const isCodeRole =
    jobTitle.includes("developer") ||
    jobTitle.includes("engineer") ||
    jobTitle.includes("programmer") ||
    jobTitle.includes("software");

  const duration = isCodeRole ? "45-60" : "30-45";
  const questionCount = isCodeRole ? "8-12" : "6-10";
  const interviewType = isCodeRole ? "Technical & Coding" : "Technical";

  return { duration, questionCount, interviewType };
}
