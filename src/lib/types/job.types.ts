/**
 * Job-related type definitions for type safety across the application
 */

export interface Job {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly location?: string | null;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly level?: string | null;
  readonly remote: boolean;
  readonly salary?: string | null;
  readonly minAmount?: string | null;
  readonly maxAmount?: string | null;
  readonly currency?: string;
  readonly interval?: string;
  readonly url?: string | null;
  readonly jobUrl?: string;
  readonly jobUrlDirect?: string;
  readonly category?: string | null;
  readonly tags?: readonly string[];
  readonly skills?: string;
  readonly postedAt: string | Date;
  readonly companyLogo?: string | null;
  readonly companyDescription?: string | null;
  readonly jobFunction?: string | null;
  readonly experienceRange?: string | null;
  readonly companyRating?: number | null;
  readonly companyRevenue?: string | null;
  readonly companyNumEmployees?: string | null;
  readonly companyIndustry?: string | null;
  readonly companyAddresses?: string | null;
  readonly createdAt?: string | Date | null;
  readonly updatedAt?: string | Date | null;
}

export interface ValidatedJobData {
  readonly location: string | null;
  readonly level: string | null;
  readonly category: string | null;
  readonly type: string | null;
  readonly companyLogo: string | null;
  readonly tags: readonly string[];
  readonly skills: readonly string[];
  readonly companyRating: number | null;
  readonly formattedSalary: string | null;
  readonly formattedDate: string;
}

export type JobValidationResult = {
  readonly isValid: boolean;
  readonly validatedData: ValidatedJobData | null;
  readonly errors: readonly string[];
};

export type SalaryData = {
  readonly minAmount?: string | null;
  readonly maxAmount?: string | null;
  readonly salary?: string | null;
  readonly interval?: string | null;
};

export type DateValue = string | Date | null | undefined;

export type ValidationError = {
  readonly field: string;
  readonly message: string;
  readonly value: unknown;
};
