/**
 * Core validation utilities with strict type safety and error handling
 */

import type { ValidationError } from "../types/job.types";

/**
 * Set of values considered invalid for display purposes
 */
const INVALID_STRING_VALUES = new Set<string>([
  "",
  "nan",
  "none",
  "null",
  "undefined",
  "n/a",
  "not available",
  "not specified",
  "0",
  "unknown",
]);

/**
 * Result type for validation operations
 */
export type ValidationResult<T> =
  | {
      readonly success: true;
      readonly data: T;
    }
  | {
      readonly success: false;
      readonly error: ValidationError;
    };

/**
 * Creates a validation error object
 */
export const createValidationError = (
  field: string,
  message: string,
  value: unknown,
): ValidationError => ({
  field,
  message,
  value,
});

/**
 * Type guard to check if a value is null or undefined
 */
export const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/**
 * Checks if a value is considered invalid for display purposes
 */
export const isInvalidValue = (value: unknown): boolean => {
  if (isNullish(value)) return true;

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    return INVALID_STRING_VALUES.has(trimmed);
  }

  if (typeof value === "number") {
    return Number.isNaN(value) || !Number.isFinite(value) || value === 0;
  }

  return false;
};

/**
 * Validates and sanitizes a string value with proper error handling
 */
export const validateString = (
  value: unknown,
  field: string,
  options: {
    readonly fallback?: string;
    readonly minLength?: number;
    readonly maxLength?: number;
  } = {},
): ValidationResult<string> => {
  const {
    fallback = "",
    minLength = 0,
    maxLength = Number.MAX_SAFE_INTEGER,
  } = options;

  if (isInvalidValue(value)) {
    if (fallback) {
      return { success: true, data: fallback };
    }
    return {
      success: false,
      error: createValidationError(field, "Value is invalid or empty", value),
    };
  }

  const stringValue = String(value).trim();

  if (stringValue.length < minLength) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Value must be at least ${minLength} characters long`,
        value,
      ),
    };
  }

  if (stringValue.length > maxLength) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Value must be at most ${maxLength} characters long`,
        value,
      ),
    };
  }

  return { success: true, data: stringValue };
};

/**
 * Validates and converts a value to a number with proper error handling
 */
export const validateNumber = (
  value: unknown,
  field: string,
  options: {
    readonly min?: number;
    readonly max?: number;
    readonly allowZero?: boolean;
  } = {},
): ValidationResult<number> => {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    allowZero = false,
  } = options;

  if (isInvalidValue(value)) {
    return {
      success: false,
      error: createValidationError(field, "Value is invalid or empty", value),
    };
  }

  const num =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return {
      success: false,
      error: createValidationError(field, "Value is not a valid number", value),
    };
  }

  if (!allowZero && num === 0) {
    return {
      success: false,
      error: createValidationError(field, "Value cannot be zero", value),
    };
  }

  if (num < min) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Value must be at least ${min}`,
        value,
      ),
    };
  }

  if (num > max) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Value must be at most ${max}`,
        value,
      ),
    };
  }

  return { success: true, data: num };
};

/**
 * Validates and filters an array of strings
 */
export const validateStringArray = (
  value: unknown,
  field: string,
  options: {
    readonly minItems?: number;
    readonly maxItems?: number;
    readonly allowEmpty?: boolean;
  } = {},
): ValidationResult<readonly string[]> => {
  const {
    minItems = 0,
    maxItems = Number.MAX_SAFE_INTEGER,
    allowEmpty = false,
  } = options;

  if (!Array.isArray(value)) {
    return {
      success: false,
      error: createValidationError(field, "Value must be an array", value),
    };
  }

  const validItems = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => allowEmpty || (item.length > 0 && !isInvalidValue(item)));

  if (validItems.length < minItems) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Array must contain at least ${minItems} valid items`,
        value,
      ),
    };
  }

  if (validItems.length > maxItems) {
    return {
      success: false,
      error: createValidationError(
        field,
        `Array must contain at most ${maxItems} items`,
        value,
      ),
    };
  }

  return { success: true, data: validItems };
};

/**
 * Validates a URL string
 */
export const validateUrl = (
  value: unknown,
  field: string,
  options: {
    readonly protocols?: readonly string[];
    readonly minLength?: number;
  } = {},
): ValidationResult<string> => {
  const { protocols = ["http:", "https:"], minLength = 3 } = options;

  const stringResult = validateString(value, field, { minLength });
  if (!stringResult.success) {
    return stringResult;
  }

  const urlString = stringResult.data;

  // Basic URL validation
  try {
    const url = new URL(urlString);
    if (!protocols.includes(url.protocol)) {
      return {
        success: false,
        error: createValidationError(
          field,
          `URL must use one of the following protocols: ${protocols.join(", ")}`,
          value,
        ),
      };
    }
    return { success: true, data: urlString };
  } catch {
    // If URL constructor fails, treat as a simple string validation
    if (urlString.length >= minLength) {
      return { success: true, data: urlString };
    }
    return {
      success: false,
      error: createValidationError(field, "Value is not a valid URL", value),
    };
  }
};
