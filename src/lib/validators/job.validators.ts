/**
 * Job-specific validation utilities with domain-specific business logic
 */

import type {
  DateValue,
  Job,
  JobValidationResult,
  SalaryData,
  ValidatedJobData,
} from "../types/job.types";
import {
  createValidationError,
  isInvalidValue,
  type ValidationResult,
  validateNumber,
  validateString,
  validateStringArray,
  validateUrl,
} from "./core.validators";

/**
 * Validates and formats salary information
 */
export const validateSalary = (
  salaryData: SalaryData,
): ValidationResult<string> => {
  const { minAmount, maxAmount, salary, interval } = salaryData;

  // Check if salary string is provided and valid
  if (salary && !isInvalidValue(salary)) {
    const cleanSalary = salary.trim();

    // Reject obviously invalid salary strings
    const invalidPatterns = ["nan", "none"];
    if (
      invalidPatterns.some((pattern) =>
        cleanSalary.toLowerCase().includes(pattern),
      )
    ) {
      return {
        success: false,
        error: createValidationError(
          "salary",
          "Salary contains invalid data",
          salary,
        ),
      };
    }

    return { success: true, data: cleanSalary };
  }

  // Validate min/max amounts
  const minResult = minAmount
    ? validateNumber(minAmount, "minAmount", { min: 0, allowZero: false })
    : null;
  const maxResult = maxAmount
    ? validateNumber(maxAmount, "maxAmount", { min: 0, allowZero: false })
    : null;

  const min = minResult?.success ? minResult.data : null;
  const max = maxResult?.success ? maxResult.data : null;

  if (!min && !max) {
    return {
      success: false,
      error: createValidationError(
        "salary",
        "No valid salary information provided",
        salaryData,
      ),
    };
  }

  // Validate interval
  const intervalResult = validateString(interval, "interval", {
    fallback: "year",
  });
  const validInterval = intervalResult.success ? intervalResult.data : "year";

  // Format salary range
  if (min && max) {
    if (min > max) {
      return {
        success: false,
        error: createValidationError(
          "salary",
          "Minimum salary cannot be greater than maximum",
          salaryData,
        ),
      };
    }
    return {
      success: true,
      data: `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k / ${validInterval}`,
    };
  }

  if (min) {
    return {
      success: true,
      data: `$${(min / 1000).toFixed(0)}k+ / ${validInterval}`,
    };
  }

  if (max) {
    return {
      success: true,
      data: `Up to $${(max / 1000).toFixed(0)}k / ${validInterval}`,
    };
  }

  return {
    success: false,
    error: createValidationError(
      "salary",
      "Unable to format salary information",
      salaryData,
    ),
  };
};

/**
 * Validates company logo URL
 */
export const validateCompanyLogo = (
  logo: unknown,
): ValidationResult<string> => {
  if (isInvalidValue(logo)) {
    return {
      success: false,
      error: createValidationError("companyLogo", "Logo URL is invalid", logo),
    };
  }

  return validateUrl(logo, "companyLogo", { minLength: 3 });
};

/**
 * Validates and filters job tags
 */
export const validateJobTags = (
  tags: unknown,
): ValidationResult<readonly string[]> => {
  return validateStringArray(tags, "tags", {
    minItems: 0,
    maxItems: 20,
    allowEmpty: false,
  });
};

/**
 * Validates and parses skills string into array
 */
export const validateJobSkills = (
  skills: unknown,
): ValidationResult<readonly string[]> => {
  if (isInvalidValue(skills) || typeof skills !== "string") {
    return { success: true, data: [] }; // Skills are optional
  }

  const skillsArray = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0 && !isInvalidValue(skill));

  return validateStringArray(skillsArray, "skills", {
    minItems: 0,
    maxItems: 30,
    allowEmpty: false,
  });
};

/**
 * Validates job location (excluding "remote" as it's handled separately)
 */
export const validateJobLocation = (
  location: unknown,
): ValidationResult<string> => {
  const result = validateString(location, "location", { minLength: 1 });

  if (!result.success) {
    return result;
  }

  // Exclude "remote" as it's handled by the remote boolean field
  if (result.data.toLowerCase() === "remote") {
    return {
      success: false,
      error: createValidationError(
        "location",
        'Location cannot be "remote" - use remote field instead',
        location,
      ),
    };
  }

  return result;
};

/**
 * Validates job level/seniority
 */
export const validateJobLevel = (level: unknown): ValidationResult<string> => {
  return validateString(level, "level", { minLength: 1, maxLength: 50 });
};

/**
 * Validates job category
 */
export const validateJobCategory = (
  category: unknown,
): ValidationResult<string> => {
  return validateString(category, "category", { minLength: 1, maxLength: 100 });
};

/**
 * Validates job type (e.g., full-time, contract, etc.)
 */
export const validateJobType = (type: unknown): ValidationResult<string> => {
  return validateString(type, "type", { minLength: 1, maxLength: 50 });
};

/**
 * Validates company rating (1-5 scale)
 */
export const validateCompanyRating = (
  rating: unknown,
): ValidationResult<number> => {
  return validateNumber(rating, "companyRating", {
    min: 0,
    max: 5,
    allowZero: false,
  });
};

/**
 * Validates and formats date for display
 */
export const validateAndFormatDate = (dateValue: DateValue): string => {
  if (!dateValue) return "Unknown";

  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const diffDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return "Recently"; // Future date
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Unknown";
  }
};

/**
 * Validates that a job has minimum required data for display
 */
export const validateJobRequiredFields = (job: Job): ValidationResult<Job> => {
  const errors: string[] = [];

  // Check required fields
  if (isInvalidValue(job.title)) {
    errors.push("Job title is required");
  }

  if (isInvalidValue(job.company)) {
    errors.push("Company name is required");
  }

  if (isInvalidValue(job.id)) {
    errors.push("Job ID is required");
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: createValidationError("job", errors.join(", "), job),
    };
  }

  return { success: true, data: job };
};

/**
 * Comprehensive job validation that returns validated data or errors
 */
export const validateJob = (job: Job): JobValidationResult => {
  // First check required fields
  const requiredFieldsResult = validateJobRequiredFields(job);
  if (!requiredFieldsResult.success) {
    return {
      isValid: false,
      validatedData: null,
      errors: [requiredFieldsResult.error.message],
    };
  }

  const errors: string[] = [];

  // Validate optional fields and collect results
  const locationResult = validateJobLocation(job.location);
  const levelResult = validateJobLevel(job.level);
  const categoryResult = validateJobCategory(job.category);
  const typeResult = validateJobType(job.type);
  const logoResult = validateCompanyLogo(job.companyLogo);
  const tagsResult = validateJobTags(job.tags);
  const skillsResult = validateJobSkills(job.skills);
  const ratingResult = validateCompanyRating(job.companyRating);
  const salaryResult = validateSalary({
    minAmount: job.minAmount,
    maxAmount: job.maxAmount,
    salary: job.salary,
    interval: job.interval,
  });

  // Create validated data object
  const validatedData: ValidatedJobData = {
    location: locationResult.success ? locationResult.data : null,
    level: levelResult.success ? levelResult.data : null,
    category: categoryResult.success ? categoryResult.data : null,
    type: typeResult.success ? typeResult.data : null,
    companyLogo: logoResult.success ? logoResult.data : null,
    tags: tagsResult.success ? tagsResult.data : [],
    skills: skillsResult.success ? skillsResult.data : [],
    companyRating: ratingResult.success ? ratingResult.data : null,
    formattedSalary: salaryResult.success ? salaryResult.data : null,
    formattedDate: validateAndFormatDate(
      job.postedAt || job.createdAt || job.updatedAt,
    ),
  };

  // Collect non-critical errors (job is still valid but some fields couldn't be processed)
  if (!locationResult.success && job.location)
    errors.push(`Location: ${locationResult.error.message}`);
  if (!salaryResult.success && (job.salary || job.minAmount || job.maxAmount)) {
    errors.push(`Salary: ${salaryResult.error.message}`);
  }

  return {
    isValid: true,
    validatedData,
    errors,
  };
};
