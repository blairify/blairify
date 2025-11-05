/**
 * Comprehensive error handling utilities with proper logging and user-friendly messages
 */

import type { ValidationError } from "../types/job.types";

/**
 * Error severity levels for proper categorization
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  readonly code: string;
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly context?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly userMessage: string;
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  VALIDATION = "validation",
  NETWORK = "network",
  AUTH = "auth",
  DATA = "data",
  UI = "ui",
  SYSTEM = "system",
}

/**
 * Creates a structured error with proper context
 */
export const createError = (
  category: ErrorCategory,
  code: string,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, unknown>,
  userMessage?: string,
): ErrorInfo => ({
  code: `${category.toUpperCase()}_${code}`,
  message,
  severity,
  context: context || {},
  timestamp: new Date(),
  userMessage: userMessage || getDefaultUserMessage(severity),
});

/**
 * Gets user-friendly error messages based on severity
 */
const getDefaultUserMessage = (severity: ErrorSeverity): string => {
  switch (severity) {
    case ErrorSeverity.LOW:
      return "Something minor went wrong, but you can continue.";
    case ErrorSeverity.MEDIUM:
      return "There was an issue processing your request. Please try again.";
    case ErrorSeverity.HIGH:
      return "An error occurred. Please refresh the page and try again.";
    case ErrorSeverity.CRITICAL:
      return "A critical error occurred. Please contact support if this persists.";
    default:
      return "An unexpected error occurred.";
  }
};

/**
 * Logs errors with appropriate level and context
 */
export const logError = (error: ErrorInfo): void => {
  const logData = {
    code: error.code,
    message: error.message,
    severity: error.severity,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
  };

  switch (error.severity) {
    case ErrorSeverity.LOW:
      console.info("🔵 Low severity error:", logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn("🟡 Medium severity error:", logData);
      break;
    case ErrorSeverity.HIGH:
      console.error("🔴 High severity error:", logData);
      break;
    case ErrorSeverity.CRITICAL:
      console.error("💥 CRITICAL ERROR:", logData);
      // In production, this would also send to error tracking service
      break;
    default:
      console.error("❓ Unknown severity error:", logData);
  }
};

/**
 * Handles validation errors with proper context
 */
export const handleValidationError = (
  validationError: ValidationError,
  context?: Record<string, unknown>,
): ErrorInfo => {
  const error = createError(
    ErrorCategory.VALIDATION,
    "FIELD_INVALID",
    `Validation failed for field '${validationError.field}': ${validationError.message}`,
    ErrorSeverity.LOW,
    {
      field: validationError.field,
      value: validationError.value,
      ...context,
    },
    `Please check the ${validationError.field} field and try again.`,
  );

  logError(error);
  return error;
};

/**
 * Handles network errors with retry suggestions
 */
export const handleNetworkError = (
  error: Error,
  context?: Record<string, unknown>,
): ErrorInfo => {
  const errorInfo = createError(
    ErrorCategory.NETWORK,
    "REQUEST_FAILED",
    `Network request failed: ${error.message}`,
    ErrorSeverity.MEDIUM,
    {
      originalError: error.name,
      stack: error.stack,
      ...context,
    },
    "Network error occurred. Please check your connection and try again.",
  );

  logError(errorInfo);
  return errorInfo;
};

/**
 * Handles data processing errors
 */
export const handleDataError = (
  message: string,
  data: unknown,
  context?: Record<string, unknown>,
): ErrorInfo => {
  const error = createError(
    ErrorCategory.DATA,
    "PROCESSING_FAILED",
    message,
    ErrorSeverity.MEDIUM,
    {
      data: typeof data === "object" ? JSON.stringify(data) : data,
      ...context,
    },
    "There was an issue processing the data. Please try again.",
  );

  logError(error);
  return error;
};

/**
 * Safe error boundary wrapper for async operations
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorContext?: Record<string, unknown>,
): Promise<
  { success: true; data: T } | { success: false; error: ErrorInfo }
> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorInfo =
      error instanceof Error
        ? handleNetworkError(error, errorContext)
        : createError(
            ErrorCategory.SYSTEM,
            "UNKNOWN_ERROR",
            "An unknown error occurred",
            ErrorSeverity.HIGH,
            { originalError: error, ...errorContext },
          );

    return { success: false, error: errorInfo };
  }
};

/**
 * Debounced error reporter to prevent spam
 */
class ErrorReporter {
  private readonly reportedErrors = new Set<string>();
  private readonly debounceTime = 5000; // 5 seconds

  report(error: ErrorInfo): void {
    const errorKey = `${error.code}_${error.message}`;

    if (this.reportedErrors.has(errorKey)) {
      return; // Already reported recently
    }

    this.reportedErrors.add(errorKey);
    logError(error);

    // Clean up after debounce time
    setTimeout(() => {
      this.reportedErrors.delete(errorKey);
    }, this.debounceTime);
  }
}

export const errorReporter = new ErrorReporter();

/**
 * React error boundary helper
 */
export const getErrorBoundaryInfo = (
  error: Error,
  errorInfo: { componentStack: string },
): ErrorInfo => {
  return createError(
    ErrorCategory.UI,
    "COMPONENT_ERROR",
    `React component error: ${error.message}`,
    ErrorSeverity.HIGH,
    {
      componentStack: errorInfo.componentStack,
      errorStack: error.stack,
    },
    "Something went wrong with the page. Please refresh and try again.",
  );
};
