/**
 * Prompt Generation Module
 * Modular functional approach to generating AI prompts
 */

// Re-export constants for external use
export {
  CATEGORY_DESCRIPTION,
  DIFFICULTY_MAP,
  PASSING_THRESHOLDS,
} from "./constants";
export { getDatabaseQuestionsPrompt } from "./question-prompts";
// Re-export all prompt generation functions
export {
  generateAnalysisSystemPrompt,
  generateSystemPrompt,
} from "./system-prompts";
export { generateUserPrompt } from "./user-prompts";
