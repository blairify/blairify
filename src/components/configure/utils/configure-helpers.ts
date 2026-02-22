import type { ConfigureFlowMode, InterviewConfig } from "./types";

export const POSITIONS_WITHOUT_TECH = new Set(["product", "cybersecurity"]);

export function isTechRequired(position: string): boolean {
  return !POSITIONS_WITHOUT_TECH.has(position);
}

export function isAutoFlow(mode: ConfigureFlowMode | null): boolean {
  return mode === "paste" || mode === "url";
}

export function isConfigComplete(config: InterviewConfig): boolean {
  if (isAutoFlow(config.flowMode)) return !!config.jobDescription?.trim();

  return !!(
    config.position &&
    config.seniority &&
    (!isTechRequired(config.position) || config.technologies.length > 0) &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode
  );
}

const hasAutoFlowDescription = (config: InterviewConfig) =>
  !isAutoFlow(config.flowMode) || !!config.jobDescription?.trim();

const STEP_VALIDATORS: Record<string, (config: InterviewConfig) => boolean> = {
  flow: (config) => config.flowMode !== null,
  description: hasAutoFlowDescription,
  analysis: hasAutoFlowDescription,
  position: (config) => config.position !== "",
  technologies: (config) =>
    !isTechRequired(config.position) || config.technologies.length > 0,
  experience: (config) => config.seniority !== "",
  company: (config) =>
    config.companyProfile !== "" || config.specificCompany !== "",
  mode: (config) => config.interviewMode !== "",
};

export function canGoNext(
  stepId: string | undefined,
  config: InterviewConfig,
): boolean {
  if (!stepId) return false;
  const validator = STEP_VALIDATORS[stepId];
  return validator ? validator(config) : false;
}

export function canStartInterview(config: InterviewConfig): boolean {
  if (isAutoFlow(config.flowMode)) {
    return !!config.jobDescription?.trim() && !!config.interviewMode;
  }

  return !!(
    config.position &&
    config.seniority &&
    (!isTechRequired(config.position) || config.technologies.length > 0) &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode &&
    config.interviewType
  );
}
