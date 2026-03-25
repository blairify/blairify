import {
  CATEGORY_MAX,
  type CategoryKey,
  getCategoryScores,
} from "@/components/results/molecules/detailed-score-card";
import { clampFinite } from "@/lib/utils/results-content-utils";

export { getCategoryScores, CATEGORY_MAX, type CategoryKey };

export function clampCategoryScores(
  rawCat: Record<string, unknown> | null | undefined,
  overallScore: number,
): Record<CategoryKey, number> {
  if (!rawCat) return getCategoryScores(overallScore);
  return {
    technical: clampFinite(rawCat.technical, 0, CATEGORY_MAX.technical),
    problemSolving: clampFinite(
      rawCat.problemSolving,
      0,
      CATEGORY_MAX.problemSolving,
    ),
    communication: clampFinite(
      rawCat.communication,
      0,
      CATEGORY_MAX.communication,
    ),
    professional: clampFinite(
      rawCat.professional,
      0,
      CATEGORY_MAX.professional,
    ),
  };
}

export function clampTechnologyScores(
  rawTech: Record<string, number | null> | null | undefined,
): Array<{ tech: string; score: number | null }> {
  if (!rawTech || typeof rawTech !== "object") return [];
  return Object.entries(rawTech)
    .map(([tech, score]) => ({
      tech,
      score: score === null ? null : clampFinite(score, 0, 100),
    }))
    .filter((x) => x.tech.trim().length > 0)
    .sort((a, b) => {
      const aScore = a.score ?? -1;
      const bScore = b.score ?? -1;
      return bScore - aScore;
    });
}
