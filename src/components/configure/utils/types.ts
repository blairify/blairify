import type { JobContext } from "@/types/global";

export type ConfigureFlowMode = "custom" | "paste";

export interface InterviewConfig extends JobContext {
  flowMode: ConfigureFlowMode;
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
  pastedDescription: string;
  jobTitle?: string;
}
