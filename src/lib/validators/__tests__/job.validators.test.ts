/**
 * Comprehensive test suite for job validation utilities
 */

import { describe, expect, it } from "@jest/globals";
import type { Job, SalaryData } from "../../types/job.types";
import {
  validateAndFormatDate,
  validateCompanyLogo,
  validateCompanyRating,
  validateJob,
  validateJobLocation,
  validateJobRequiredFields,
  validateJobSkills,
  validateJobTags,
  validateSalary,
} from "../job.validators";

describe("Job Validators", () => {
  describe("validateSalary", () => {
    it("should format salary range correctly", () => {
      const salaryData: SalaryData = {
        minAmount: "120000",
        maxAmount: "160000",
        interval: "year",
      };

      const result = validateSalary(salaryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("$120k – $160k / year");
      }
    });

    it("should handle single minimum amount", () => {
      const salaryData: SalaryData = {
        minAmount: "100000",
        interval: "year",
      };

      const result = validateSalary(salaryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("$100k+ / year");
      }
    });

    it("should handle salary string", () => {
      const salaryData: SalaryData = {
        salary: "$80k - $120k per year",
      };

      const result = validateSalary(salaryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("$80k - $120k per year");
      }
    });

    it("should reject invalid salary data", () => {
      const salaryData: SalaryData = {
        salary: "nan",
      };

      const result = validateSalary(salaryData);
      expect(result.success).toBe(false);
    });

    it("should reject min > max scenario", () => {
      const salaryData: SalaryData = {
        minAmount: "160000",
        maxAmount: "120000",
      };

      const result = validateSalary(salaryData);
      expect(result.success).toBe(false);
    });
  });

  describe("validateCompanyLogo", () => {
    it("should accept valid URL", () => {
      const result = validateCompanyLogo("https://example.com/logo.png");
      expect(result.success).toBe(true);
    });

    it("should accept relative path", () => {
      const result = validateCompanyLogo("/images/logo.png");
      expect(result.success).toBe(true);
    });

    it("should reject invalid values", () => {
      expect(validateCompanyLogo("nan").success).toBe(false);
      expect(validateCompanyLogo("none").success).toBe(false);
      expect(validateCompanyLogo("").success).toBe(false);
      expect(validateCompanyLogo(null).success).toBe(false);
    });
  });

  describe("validateJobTags", () => {
    it("should filter and validate tags", () => {
      const tags = ["React", "TypeScript", "", "none", "JavaScript"];
      const result = validateJobTags(tags);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["React", "TypeScript", "JavaScript"]);
      }
    });

    it("should handle non-array input", () => {
      const result = validateJobTags("not an array");
      expect(result.success).toBe(false);
    });

    it("should respect max items limit", () => {
      const manyTags = Array(25).fill("tag");
      const result = validateJobTags(manyTags);
      expect(result.success).toBe(false);
    });
  });

  describe("validateJobSkills", () => {
    it("should parse comma-separated skills", () => {
      const skills = "React, TypeScript, Node.js, none, ";
      const result = validateJobSkills(skills);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["React", "TypeScript", "Node.js"]);
      }
    });

    it("should handle invalid input gracefully", () => {
      const result = validateJobSkills(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe("validateJobLocation", () => {
    it("should accept valid location", () => {
      const result = validateJobLocation("San Francisco, CA");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("San Francisco, CA");
      }
    });

    it('should reject "remote" as location', () => {
      const result = validateJobLocation("remote");
      expect(result.success).toBe(false);
    });

    it("should reject empty/invalid values", () => {
      expect(validateJobLocation("").success).toBe(false);
      expect(validateJobLocation("none").success).toBe(false);
      expect(validateJobLocation(null).success).toBe(false);
    });
  });

  describe("validateCompanyRating", () => {
    it("should accept valid ratings", () => {
      const result = validateCompanyRating(4.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(4.5);
      }
    });

    it("should reject out-of-range ratings", () => {
      expect(validateCompanyRating(6).success).toBe(false);
      expect(validateCompanyRating(-1).success).toBe(false);
      expect(validateCompanyRating(0).success).toBe(false);
    });

    it("should reject invalid values", () => {
      expect(validateCompanyRating(NaN).success).toBe(false);
      expect(validateCompanyRating("not a number").success).toBe(false);
    });
  });

  describe("validateAndFormatDate", () => {
    it("should format recent dates correctly", () => {
      const today = new Date();
      expect(validateAndFormatDate(today)).toBe("Today");

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(validateAndFormatDate(yesterday)).toBe("Yesterday");
    });

    it("should handle invalid dates", () => {
      expect(validateAndFormatDate("invalid date")).toBe("Unknown");
      expect(validateAndFormatDate(null)).toBe("Unknown");
    });

    it("should format older dates", () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(validateAndFormatDate(weekAgo)).toBe("1 weeks ago");
    });
  });

  describe("validateJobRequiredFields", () => {
    const validJob: Job = {
      id: "job-123",
      title: "Software Engineer",
      company: "Tech Corp",
      remote: false,
      postedAt: new Date(),
    };

    it("should accept job with required fields", () => {
      const result = validateJobRequiredFields(validJob);
      expect(result.success).toBe(true);
    });

    it("should reject job without title", () => {
      const invalidJob = { ...validJob, title: "" };
      const result = validateJobRequiredFields(invalidJob);
      expect(result.success).toBe(false);
    });

    it("should reject job without company", () => {
      const invalidJob = { ...validJob, company: "" };
      const result = validateJobRequiredFields(invalidJob);
      expect(result.success).toBe(false);
    });

    it("should reject job without id", () => {
      const invalidJob = { ...validJob, id: "" };
      const result = validateJobRequiredFields(invalidJob);
      expect(result.success).toBe(false);
    });
  });

  describe("validateJob", () => {
    const validJob: Job = {
      id: "job-123",
      title: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      level: "Senior",
      category: "Engineering",
      type: "Full-time",
      remote: false,
      salary: "$120k - $160k",
      companyLogo: "https://example.com/logo.png",
      tags: ["React", "TypeScript"],
      skills: "JavaScript, Node.js",
      companyRating: 4.5,
      postedAt: new Date(),
    };

    it("should validate complete job successfully", () => {
      const result = validateJob(validJob);
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    it("should handle job with some invalid optional fields", () => {
      const jobWithInvalidFields = {
        ...validJob,
        location: "none", // Invalid
        companyRating: 10, // Out of range
      };

      const result = validateJob(jobWithInvalidFields);
      expect(result.isValid).toBe(true); // Still valid overall
      expect(result.validatedData?.location).toBeNull();
      expect(result.validatedData?.companyRating).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject job with missing required fields", () => {
      const invalidJob = { ...validJob, title: "" };
      const result = validateJob(invalidJob);
      expect(result.isValid).toBe(false);
      expect(result.validatedData).toBeNull();
    });

    it("should provide validated data with proper types", () => {
      const result = validateJob(validJob);
      expect(result.isValid).toBe(true);

      if (result.validatedData) {
        expect(typeof result.validatedData.location).toBe("string");
        expect(typeof result.validatedData.companyRating).toBe("number");
        expect(Array.isArray(result.validatedData.tags)).toBe(true);
        expect(Array.isArray(result.validatedData.skills)).toBe(true);
      }
    });
  });
});
