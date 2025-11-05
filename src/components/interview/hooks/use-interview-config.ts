import { useEffect, useState } from "react";
import type { InterviewConfig, InterviewMode, SeniorityLevel } from "../types";

export function useInterviewConfig() {
  const [config, setConfig] = useState<InterviewConfig>({
    position: "Frontend Engineer",
    seniority: "mid" as SeniorityLevel,
    technologies: [],
    companyProfile: "faang",
    specificCompany: "",
    interviewMode: "regular" as InterviewMode, // Fixed: was "timed" (old mode)
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
    const technologiesParam = params.get("technologies");
    let technologies: string[] = [];
    if (technologiesParam) {
      try {
        technologies = JSON.parse(technologiesParam);
      } catch {
        technologies = [];
      }
    }

    const interviewMode = (params.get("interviewMode") ||
      "regular") as InterviewMode;
    const seniority = (params.get("seniority") || "mid") as SeniorityLevel;
    const interviewType = (params.get("interviewType") ||
      "technical") as InterviewConfig["interviewType"];

    console.log("📋 Config loaded from URL:", {
      interviewMode,
      seniority,
      interviewType,
      position: params.get("position"),
      isDemoMode: params.get("demo") === "true",
    });

    setConfig({
      position: params.get("position") || "Frontend Engineer",
      seniority,
      technologies,
      companyProfile: params.get("companyProfile") || "",
      specificCompany: params.get("specificCompany") || "",
      interviewMode,
      interviewType,
      duration: params.get("duration") || "30",
      isDemoMode: params.get("demo") === "true",
      contextType: params.get("contextType") || "",
      jobId: params.get("jobId") || "",
      company: params.get("company") || "",
      jobDescription: params.get("jobDescription") || "",
      jobRequirements: params.get("jobRequirements") || "",
      jobLocation: params.get("jobLocation") || "",
      jobType: params.get("jobType") || "",
    });
    setMounted(true);
  }, []);

  return { config, mounted };
}
