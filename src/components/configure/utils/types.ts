import type { JobContext } from "@/types/global";

export interface InterviewConfig extends JobContext {
  position: string;
  seniority: string;
  technologies: string[];
  companyProfile: string;
  specificCompany: string;
  interviewMode: string;
  interviewType: string;
  duration: string;
  company?: string;
  contextType?: string;
  jobId?: string;
  jobLocation?: string;
  jobType?: string;
  isDemoMode?: boolean;
}
