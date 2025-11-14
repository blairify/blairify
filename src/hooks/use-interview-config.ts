import { useEffect, useState } from "react";
import { parseInterviewConfigFromSearchParams } from "@/lib/interview";
import type { InterviewConfig } from "../components/interview/types";

export function useInterviewConfig() {
  const [config, setConfig] = useState<InterviewConfig>({
    position: "Frontend Engineer",
    seniority: "mid",
    technologies: [],
    companyProfile: "faang",
    specificCompany: "",
    interviewMode: "regular",
    interviewType: "technical",
    duration: "30",
    isDemoMode: false,
    contextType: "",
    jobId: "",
    company: "",
    jobDescription: "",
    jobRequirements: "",
    jobLocation: "",
    jobType: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedConfig = parseInterviewConfigFromSearchParams(params);
    setConfig(parsedConfig);
    setMounted(true);
  }, []);

  return { config, mounted };
}
