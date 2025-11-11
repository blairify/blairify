/**
 * Custom hook for job validation with memoization and error handling
 */

import { useMemo } from "react";
import {
  type Job,
  type JobValidationResult,
  validateJob,
} from "@/lib/validators";

/**
 * Hook for validating job data with memoization for performance
 */
export const useJobValidation = (job: Job): JobValidationResult => {
  return useMemo(() => {
    try {
      return validateJob(job);
    } catch (error) {
      console.error("Job validation failed:", error);
      return {
        isValid: false,
        validatedData: null,
        errors: ["Validation failed due to unexpected error"],
      };
    }
  }, [job]);
};

/**
 * Hook for getting validated job data with fallbacks
 */
export const useValidatedJobData = (job: Job) => {
  const validation = useJobValidation(job);

  return useMemo(
    () => ({
      ...validation,
      // Provide safe access to validated data with fallbacks
      safeData: {
        location: validation.validatedData?.location ?? null,
        level: validation.validatedData?.level ?? null,
        category: validation.validatedData?.category ?? null,
        type: validation.validatedData?.type ?? null,
        companyLogo: validation.validatedData?.companyLogo ?? null,
        tags: validation.validatedData?.tags ?? [],
        skills: validation.validatedData?.skills ?? [],
        companyRating: validation.validatedData?.companyRating ?? null,
        formattedSalary: validation.validatedData?.formattedSalary ?? null,
        formattedDate: validation.validatedData?.formattedDate ?? "Unknown",
      },
    }),
    [validation],
  );
};
