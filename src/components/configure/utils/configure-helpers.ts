import type { InterviewConfig } from "./types";

function isTechRequired(position: string): boolean {
  return position !== "product";
}

/**
 * Validates if the interview configuration is complete
 */
export function isConfigComplete(config: InterviewConfig): boolean {
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
  currentStep: number,
  config: InterviewConfig,
): boolean {
  switch (currentStep) {
    case 0:
      return config.position !== "";
    case 1:
      return !isTechRequired(config.position) || config.technologies.length > 0;
    case 2:
      return config.seniority !== "";
    case 3:
      return config.companyProfile !== "" || config.specificCompany !== "";
    case 4:
      return config.interviewMode !== "";
    default:
      return false;
  }
}

/**
 * Validates if the configuration is ready to start an interview
 */
export function canStartInterview(config: InterviewConfig): boolean {
  return !!(
    config.position &&
    config.seniority &&
    (!isTechRequired(config.position) || config.technologies.length > 0) &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode &&
    config.interviewType
  );
}
