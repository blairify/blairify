/**
 * Centralized validation exports for clean imports across the application
 */

// Type exports
export type {
  DateValue,
  Job,
  JobValidationResult,
  SalaryData,
  ValidatedJobData,
  ValidationError,
} from "../types/job.types";
// Core validation utilities
export {
  createValidationError,
  isInvalidValue,
  isNullish,
  type ValidationResult,
  validateNumber,
  validateString,
  validateStringArray,
  validateUrl,
} from "./core.validators";
// Job-specific validators
export {
  validateAndFormatDate,
  validateCompanyLogo,
  validateCompanyRating,
  validateJob,
  validateJobCategory,
  validateJobLevel,
  validateJobLocation,
  validateJobRequiredFields,
  validateJobSkills,
  validateJobTags,
  validateJobType,
  validateSalary,
} from "./job.validators";
