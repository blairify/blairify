import {
  normalizeCompanyProfileValue,
  normalizePositionValue,
} from "@/lib/utils/interview-normalizers";
import type {
  InterviewConfig,
  InterviewMode,
  InterviewType,
  SeniorityLevel,
} from "./types";

const INTERVIEW_MODES: InterviewMode[] = [
  "regular",
  "practice",
  "flash",
  "play",
  "competitive",
  "teacher",
];

const INTERVIEW_TYPES: InterviewType[] = [
  "technical",
  "bullet",
  "coding",
  "system-design",
  "situational",
  "mixed",
];

const SENIORITY_LEVELS: SeniorityLevel[] = ["entry", "junior", "mid", "senior"];

function parseInterviewMode(value: string | null): InterviewMode {
  if (!value) return "regular";
  const normalized = value.toLowerCase() as InterviewMode;
  return INTERVIEW_MODES.includes(normalized) ? normalized : "regular";
}

function parseInterviewType(value: string | null): InterviewType {
  if (!value) return "technical";
  const normalized = value.toLowerCase() as InterviewType;
  return INTERVIEW_TYPES.includes(normalized) ? normalized : "technical";
}

function parseSeniority(value: string | null): SeniorityLevel {
  if (!value) return "mid";
  const normalized = value.toLowerCase() as SeniorityLevel;
  return SENIORITY_LEVELS.includes(normalized) ? normalized : "mid";
}

export function parseInterviewConfigFromSearchParams(
  params: URLSearchParams,
): InterviewConfig {
  const technologiesParam = params.get("technologies");
  let technologies: string[] = [];

  if (technologiesParam) {
    try {
      const parsed = JSON.parse(technologiesParam);
      if (Array.isArray(parsed)) {
        technologies = parsed.filter((t) => typeof t === "string");
      }
    } catch {
      technologies = [];
    }
  }

  const interviewMode = parseInterviewMode(params.get("interviewMode"));
  const seniority = parseSeniority(params.get("seniority"));
  const interviewType = parseInterviewType(params.get("interviewType"));
  const position = normalizePositionValue(params.get("position"));
  const companyProfile = normalizeCompanyProfileValue(
    params.get("companyProfile"),
  );

  return {
    position,
    seniority,
    technologies,
    companyProfile,
    specificCompany: params.get("specificCompany") || undefined,
    interviewMode,
    interviewType,
    duration: params.get("duration") || "30",
    isDemoMode: params.get("demo") === "true",
    contextType: params.get("contextType") || undefined,
    jobId: params.get("jobId") || undefined,
    company: params.get("company") || undefined,
    jobDescription: params.get("jobDescription") || undefined,
    jobRequirements: params.get("jobRequirements") || undefined,
    jobLocation: params.get("jobLocation") || undefined,
    jobType: params.get("jobType") || undefined,
  };
}

export function buildSearchParamsFromInterviewConfig(
  config: InterviewConfig,
): URLSearchParams {
  const params = new URLSearchParams();

  params.set("position", config.position);
  params.set("seniority", config.seniority);
  params.set("interviewMode", config.interviewMode);
  params.set("interviewType", config.interviewType);
  params.set("duration", config.duration);

  if (config.technologies.length > 0) {
    params.set("technologies", JSON.stringify(config.technologies));
  }

  if (config.companyProfile) {
    params.set("companyProfile", config.companyProfile);
  }

  if (config.specificCompany) {
    params.set("specificCompany", config.specificCompany);
  }

  if (config.isDemoMode) {
    params.set("demo", "true");
  }

  if (config.contextType) {
    params.set("contextType", config.contextType);
  }

  if (config.jobId) {
    params.set("jobId", config.jobId);
  }

  if (config.company) {
    params.set("company", config.company);
  }

  if (config.jobDescription) {
    params.set("jobDescription", config.jobDescription);
  }

  if (config.jobRequirements) {
    params.set("jobRequirements", config.jobRequirements);
  }

  if (config.jobLocation) {
    params.set("jobLocation", config.jobLocation);
  }

  if (config.jobType) {
    params.set("jobType", config.jobType);
  }

  return params;
}
