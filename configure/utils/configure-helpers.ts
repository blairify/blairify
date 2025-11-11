import type { InterviewConfig } from "./types";

/**
 * Validates if the interview configuration is complete
 */
export function isConfigComplete(config: InterviewConfig): boolean {
  return !!(
    config.position &&
    config.seniority &&
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
      return config.seniority !== "";
    case 2:
      return config.companyProfile !== "" || config.specificCompany !== "";
    case 3:
      return config.interviewMode !== "";
    default:
      return false;
  }
}

/**
 * Builds URL parameters from interview configuration
 */
export function buildInterviewUrlParams(
  config: InterviewConfig,
): URLSearchParams {
  const urlParams = new URLSearchParams();

  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      if (key === "technologies" && Array.isArray(value)) {
        urlParams.append(key, JSON.stringify(value));
      } else {
        urlParams.append(key, value as string);
      }
    }
  });

  return urlParams;
}

/**
 * Validates if the configuration is ready to start an interview
 */
export function canStartInterview(config: InterviewConfig): boolean {
  return !!(
    config.position &&
    config.seniority &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode &&
    config.interviewType
  );
}
