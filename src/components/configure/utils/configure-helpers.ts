import type { InterviewConfig } from "./types";

export const POSITIONS_WITHOUT_TECH = new Set(["product", "cybersecurity"]);

export function isTechRequired(position: string): boolean {
  return !POSITIONS_WITHOUT_TECH.has(position);
}

/**
 * Validates if the interview configuration is complete
 */
export function isConfigComplete(config: InterviewConfig): boolean {
  if (config.flowMode === "paste") {
    return !!config.jobDescription?.trim();
  }

  return !!(
    config.position &&
    config.seniority &&
    (!isTechRequired(config.position) || config.technologies.length > 0) &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode
  );
}

/**
 * Checks if the user can proceed to the next step
 */
export function canGoNext(
  stepId: string | undefined,
  config: InterviewConfig,
): boolean {
  if (!stepId) return false;

  switch (stepId) {
    case "flow":
      return config.flowMode === "custom" || config.flowMode === "paste";
    case "description":
      if (config.flowMode === "paste") {
        return !!config.pastedDescription?.trim();
      }
      return true;
    case "analysis":
      if (config.flowMode === "paste") {
        return !!config.jobDescription?.trim();
      }
      return true;
    case "position":
      return config.position !== "";
    case "technologies":
      return !isTechRequired(config.position) || config.technologies.length > 0;
    case "experience":
      return config.seniority !== "";
    case "company":
      return config.companyProfile !== "" || config.specificCompany !== "";
    case "mode":
      return config.interviewMode !== "";
    default:
      return false;
  }
}

/**
 * Validates if the configuration is ready to start an interview
 */
export function canStartInterview(config: InterviewConfig): boolean {
  if (config.flowMode === "paste") {
    return !!config.jobDescription?.trim();
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
