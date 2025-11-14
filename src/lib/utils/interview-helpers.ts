/**
 * Interview utility helper functions
 */

import type { InterviewMode } from "@/types/interview";

/**
 * Get the total number of questions for an interview based on mode
 */
export function getQuestionCountForMode(
  mode: InterviewMode,
  isDemoMode: boolean = false,
): number {
  if (isDemoMode) {
    return 3;
  }

  switch (mode) {
    case "regular":
      return 8;
    case "practice":
      return 5;
    case "flash":
      return 3;
    case "competitive":
      return 10;
    case "play":
      return 20;
    case "teacher":
      return 20;
  }

  const _never: never = mode;
  throw new Error(`Unhandled interview mode: ${_never}`);
}

/**
 * Check if an interview mode is unlimited (user-controlled end)
 */
export function isUnlimitedMode(mode: InterviewMode): boolean {
  return mode === "play" || mode === "teacher";
}

/**
 * Check if an interview mode should show scoring
 */
export function shouldShowScoring(mode: InterviewMode): boolean {
  return mode !== "teacher"; // Teacher mode is not scored
}

/**
 * Check if an interview mode should show "Show Answer" button
 */
export function shouldShowAnswerButton(mode: InterviewMode): boolean {
  return mode === "teacher";
}
