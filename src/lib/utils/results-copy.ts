import { createSeededRandom, pickOne } from "@/lib/utils/seeded-random";
import type { InterviewConfig, InterviewResults } from "@/types/interview";

function hashStringToInt(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

export type ResultsCopySeedInput = {
  interviewSessionId?: string | null;
  interviewSessionRaw?: string | null;
  interviewConfigRaw?: string | null;
};

export function getResultsCopySeed(input: ResultsCopySeedInput): number {
  const base =
    input.interviewSessionId ||
    input.interviewSessionRaw ||
    input.interviewConfigRaw ||
    "results";

  return hashStringToInt(base);
}

type OutcomeMessageParams = {
  seed: number;
  results: Pick<
    InterviewResults,
    "score" | "passed" | "strengths" | "improvements"
  >;
  config?: Pick<InterviewConfig, "position" | "seniority">;
};

function clampFact(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

function isNonStrengthFact(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.length === 0) return true;

  return (
    v.includes("no significant strengths") ||
    v.includes("no notable strengths") ||
    v.includes("no clear strengths") ||
    v.includes("no strengths demonstrated") ||
    v.includes("no major strengths") ||
    v.includes("none identified") ||
    v === "none" ||
    v === "n/a" ||
    v === "na"
  );
}

function getFallbackStrength(band: ReturnType<typeof getScoreBand>): string {
  switch (band) {
    case "elite":
      return "your clarity and depth across key topics";
    case "strong":
      return "your consistent fundamentals";
    case "pass":
    case "near":
    case "mid":
    case "low":
      return "your ability to meet the bar under pressure";
    default: {
      const _never: never = band;
      throw new Error(`Unhandled band: ${_never}`);
    }
  }
}

function getScoreBand(
  score: number,
): "elite" | "strong" | "pass" | "near" | "mid" | "low" {
  if (score >= 90) return "elite";
  if (score >= 80) return "strong";
  if (score >= 70) return "pass";
  if (score >= 60) return "near";
  if (score >= 40) return "mid";
  return "low";
}

function sanitizeFact(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return null;
  return trimmed.replace(/[\s:;,.!-]+$/g, "");
}

export function generateOutcomeMessage(params: OutcomeMessageParams): string {
  const { seed, results, config } = params;
  const rng = createSeededRandom(seed ^ Math.floor(results.score));

  const rawStrength = clampFact(results.strengths?.[0]);
  const rawImprovement = clampFact(results.improvements?.[0]);

  const role = config?.position ? `${config.position}` : null;
  const level = config?.seniority ? `${config.seniority}` : null;
  const roleContext = role && level ? `${level} ${role}` : role || level;

  const passed = results.passed === true;
  const band = getScoreBand(results.score);

  const topStrength = sanitizeFact(
    (() => {
      if (!rawStrength) return null;
      if (!passed) return rawStrength;
      if (isNonStrengthFact(rawStrength)) return null;
      return rawStrength;
    })(),
  );

  const topImprovement = sanitizeFact(rawImprovement);

  const subject = roleContext
    ? `for a ${roleContext} interview`
    : "for this interview";

  if (passed) {
    const fallbackStrength = getFallbackStrength(band);

    const highlight =
      topStrength && topImprovement
        ? `Your strongest signal was ${topStrength}. Next, focus on ${topImprovement}.`
        : topStrength
          ? `Your strongest signal was ${topStrength}.`
          : topImprovement
            ? results.score >= 70
              ? `Your strongest signal was ${fallbackStrength}. Next, focus on ${topImprovement}.`
              : `Next, focus on ${topImprovement}.`
            : null;

    switch (band) {
      case "elite":
        return pickOne(
          [
            `Exceptional performance ${subject}. ${highlight ?? "You showed depth and clarity across the board."}`,
            `Outstanding showing ${subject}. ${highlight ?? "Your answers were consistently strong."}`,
            `Top-tier performance ${subject}. ${highlight ?? "You communicated and reasoned at a high level."}`,
          ],
          rng,
        );
      case "strong":
        return pickOne(
          [
            `Strong performance ${subject}. ${highlight ?? "You met the bar with confidence."}`,
            `Solid pass ${subject}. ${highlight ?? "Good fundamentals with room to sharpen edges."}`,
            `Good result ${subject}. ${highlight ?? "You handled most areas well."}`,
          ],
          rng,
        );
      case "pass":
        return pickOne(
          [
            `You cleared the threshold ${subject}. ${highlight ?? "Keep building consistency."}`,
            `Passing performance ${subject}. ${highlight ?? "The foundation is there—now strengthen weak spots."}`,
            `You met expectations ${subject}. ${highlight ?? "Next steps will make the difference."}`,
          ],
          rng,
        );
      case "near":
        return pickOne(
          [
            `A narrow pass ${subject}. ${highlight ?? "You got over the line—now make it comfortable."}`,
            `You passed ${subject}, but it was close. ${highlight ?? "Focus on consistency."}`,
            `You cleared the bar ${subject} by a small margin. ${highlight ?? "Target the biggest gaps next."}`,
          ],
          rng,
        );
      case "mid":
        return pickOne(
          [
            `You passed ${subject}. ${highlight ?? "This was a lower-scoring pass—use the feedback to level up."}`,
            `Passing result ${subject}. ${highlight ?? "You’ll benefit most from tightening fundamentals."}`,
            `You met the threshold ${subject}. ${highlight ?? "Next round: raise your floor."}`,
          ],
          rng,
        );
      case "low":
        return pickOne(
          [
            `You passed ${subject}. ${highlight ?? "Treat this as a starting point and build fundamentals fast."}`,
            `Passing outcome ${subject}. ${highlight ?? "Prioritize core knowledge to stabilize performance."}`,
            `You cleared the bar ${subject}. ${highlight ?? "Next: close the foundational gaps."}`,
          ],
          rng,
        );
      default: {
        const _never: never = band;
        throw new Error(`Unhandled band: ${_never}`);
      }
    }
  }

  const gapNudge =
    topImprovement && topStrength
      ? `You did well on ${topStrength}, but ${topImprovement} held you back.`
      : topImprovement
        ? `${topImprovement} was a limiting factor.`
        : "Key gaps prevented a passing recommendation.";

  switch (band) {
    case "elite":
      return pickOne(
        [
          `High-scoring but not a pass ${subject}. ${gapNudge}`,
          `Strong signals, but still not a pass ${subject}. ${gapNudge}`,
          `Score is high, but outcome is not passing ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    case "strong":
      return pickOne(
        [
          `Good score, but not passing ${subject}. ${gapNudge}`,
          `Not passed ${subject} despite a solid score. ${gapNudge}`,
          `Close in score, not there in outcome ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    case "pass":
      return pickOne(
        [
          `Not passed ${subject}. ${gapNudge}`,
          `This attempt didn’t pass ${subject}. ${gapNudge}`,
          `Outcome is not passing ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    case "near":
      return pickOne(
        [
          `Close to passing ${subject}. ${gapNudge}`,
          `Near the threshold ${subject}. ${gapNudge}`,
          `Not quite there yet ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    case "mid":
      return pickOne(
        [
          `Below the bar ${subject}. ${gapNudge}`,
          `Significant gaps ${subject}. ${gapNudge}`,
          `This attempt fell short ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    case "low":
      return pickOne(
        [
          `Foundational work needed ${subject}. ${gapNudge}`,
          `This result is well below the threshold ${subject}. ${gapNudge}`,
          `Not ready yet ${subject}. ${gapNudge}`,
        ],
        rng,
      );
    default: {
      const _never: never = band;
      throw new Error(`Unhandled band: ${_never}`);
    }
  }
}

type AnalysisMessagesParams = {
  seed: number;
  config?: Pick<InterviewConfig, "position" | "seniority">;
};

export function generateAnalysisMessages(
  params: AnalysisMessagesParams,
): string[] {
  const { seed, config } = params;
  const rng = createSeededRandom(seed ^ 0x9e3779b9);

  const role = config?.position ? `${config.position}` : "";
  const level = config?.seniority ? `${config.seniority}` : "";

  const roleSuffix =
    role && level
      ? ` for a ${level} ${role} role`
      : role
        ? ` for a ${role} role`
        : "";

  const variants: string[][] = [
    [
      `Reviewing your technical responses${roleSuffix}...`,
      "Evaluating problem-solving approaches...",
      "Analyzing communication effectiveness...",
      "Assessing readiness signals...",
      "Compiling strengths and growth areas...",
      "Finalizing your performance report...",
    ],
    [
      "Processing interview transcript...",
      `Checking fundamentals${roleSuffix}...`,
      "Looking for clear reasoning and trade-offs...",
      "Scoring consistency across questions...",
      "Generating detailed insights...",
      "Polishing recommendations...",
    ],
    [
      `Analyzing your interview performance${roleSuffix}...`,
      "Mapping strengths to role expectations...",
      "Identifying gaps that impacted the outcome...",
      "Summarizing your strongest signals...",
      "Preparing next steps...",
      "Wrapping up...",
    ],
  ];

  return pickOne(variants, rng);
}
