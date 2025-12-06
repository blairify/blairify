/**
 * Prompt Generation Module
 * Thin facade over the canonical prompt implementations.
 *
 * This file exists for backwards compatibility with the modular
 * `ai/prompts` API but delegates to `prompt-generator.ts` to avoid
 * duplication and drift.
 */

// Canonical prompt functions (system, user, questions)
export {
  generateAnalysisSystemPrompt,
  generateSystemPrompt,
  generateUserPrompt,
  getDatabaseQuestionsPrompt,
} from "@/lib/services/ai/prompt-generator";
// Re-export constants for external use
export {
  CATEGORY_DESCRIPTION,
  DIFFICULTY_MAP,
  PASSING_THRESHOLDS,
} from "./constants";
