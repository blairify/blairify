"use client";

import { motion } from "motion/react";
import type React from "react";
import { Typography } from "@/components/common/atoms/typography";
import { RatingStars } from "@/components/results/atoms/rating-stars";
import { ScoreRadialChart } from "@/components/results/atoms/score-radial-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const CATEGORY_MAX = {
  technical: 45,
  problemSolving: 25,
  communication: 10,
  professional: 20,
} as const;

export type CategoryKey = keyof typeof CATEGORY_MAX;

export function clampFinite(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function getReadiness(score: number): {
  label:
    | "Exceptional Performance"
    | "Outstanding Performance"
    | "Excellent Performance"
    | "Strong Performance"
    | "Good Performance"
    | "Satisfactory Performance"
    | "Needs Improvement"
    | "Below Expectations"
    | "Critical";
  ringClass: string;
} {
  if (score >= 95) {
    return {
      label: "Exceptional Performance",
      ringClass: "text-lime-400 dark:text-lime-400",
    };
  }

  if (score >= 90) {
    return {
      label: "Outstanding Performance",
      ringClass: "text-lime-500 dark:text-lime-400",
    };
  }

  if (score >= 85) {
    return {
      label: "Excellent Performance",
      ringClass: "text-lime-600 dark:text-lime-400",
    };
  }

  if (score >= 80) {
    return {
      label: "Strong Performance",
      ringClass: "text-lime-700 dark:text-lime-400",
    };
  }

  if (score >= 75) {
    return {
      label: "Good Performance",
      ringClass: "text-emerald-400 dark:text-emerald-400",
    };
  }

  if (score >= 70) {
    return {
      label: "Satisfactory Performance",
      ringClass: "text-emerald-500 dark:text-emerald-400",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs Improvement",
      ringClass: "text-yellow-400 dark:text-yellow-400",
    };
  }

  if (score >= 30) {
    return {
      label: "Below Expectations",
      ringClass: "text-orange-400 dark:text-orange-400",
    };
  }

  return {
    label: "Critical",
    ringClass: "text-red-600 dark:text-red-400",
  };
}

function getProgressBarColor(score: number): string {
  if (score >= 95) return "bg-lime-400 dark:bg-lime-400";
  if (score >= 90) return "bg-lime-500 dark:bg-lime-400";
  if (score >= 85) return "bg-lime-600 dark:bg-lime-400";
  if (score >= 80) return "bg-lime-700 dark:bg-lime-400";
  if (score >= 75) return "bg-emerald-400 dark:bg-emerald-400";
  if (score >= 70) return "bg-emerald-500 dark:bg-emerald-400";
  if (score >= 50) return "bg-yellow-400 dark:bg-yellow-400";
  if (score >= 30) return "bg-orange-400 dark:bg-orange-400";
  return "bg-red-600 dark:bg-red-400";
}

export function getCategoryScores(score: number): Record<CategoryKey, number> {
  const ratio = Math.max(0, Math.min(1, score / 100));
  return {
    technical: Math.round(ratio * CATEGORY_MAX.technical),
    problemSolving: Math.round(ratio * CATEGORY_MAX.problemSolving),
    communication: Math.round(ratio * CATEGORY_MAX.communication),
    professional: Math.round(ratio * CATEGORY_MAX.professional),
  };
}

interface DetailedScoreCardProps {
  score: number;
  passed?: boolean | null;
  summary: React.ReactNode;
  categoryScores: Record<CategoryKey, number>;
  technologyScores?: Array<{ tech: string; score: number | null }>;
  withCard?: boolean;
}

export function DetailedScoreCard({
  score,
  passed,
  summary,
  categoryScores,
  technologyScores = [],
  withCard = true,
}: DetailedScoreCardProps) {
  const scoreValue = Math.max(0, Math.min(100, score));

  const content = (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col gap-10">
        {/* Top Section: Radial Chart & Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
          {/* Radial Chart */}
          <ScoreRadialChart
            score={scoreValue}
            passed={passed}
            size={120}
            strokeWidth={9}
            textSize="text-[32px]"
          />

          {/* Headline & Narrative */}
          <div className="text-center sm:text-left max-w-2xl flex-1">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <Typography.Caption className="text-2xl sm:text-4xl font-bold tracking-tight">
                {(() => {
                  const readiness = getReadiness(scoreValue);
                  return readiness.label;
                })()}
              </Typography.Caption>
            </div>
            <div className="mt-4 text-muted-foreground leading-relaxed text-base">
              {summary || "No summary available for this session."}
            </div>
          </div>
        </div>

        <Separator className="bg-border/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Typography.BodyBold>Core Competencies</Typography.BodyBold>
            <div className="space-y-3">
              {(
                [
                  { key: "technical", label: "Technical Proficiency" },
                  { key: "problemSolving", label: "Problem Solving" },
                  { key: "communication", label: "Communication" },
                  { key: "professional", label: "Professionalism" },
                ] as const
              ).map((c, idx) => {
                const val = categoryScores[c.key as CategoryKey] ?? 0;
                const max = CATEGORY_MAX[c.key as CategoryKey];
                const pct = max > 0 ? Math.round((val / max) * 100) : 0;
                return (
                  <div key={c.key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {val}/{max}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                      <motion.div
                        className={`h-full ${getProgressBarColor(pct)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.2 + idx * 0.1,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technology Scores (if any) */}
          {technologyScores.length > 0 && (
            <div className="space-y-4">
              <Typography.BodyBold>Technology Scores</Typography.BodyBold>
              {technologyScores.every((t) => t.score === null) && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Not assessed — none of the selected technologies were
                  discussed or used in the questions.
                </div>
              )}
              <div className="flex flex-col gap-3">
                {technologyScores.slice(0, 8).map((t) => (
                  <div
                    key={t.tech}
                    className="flex flex-row items-center justify-between"
                  >
                    <span className="font-medium text-sm">
                      {t.tech.charAt(0).toUpperCase() + t.tech.slice(1)}
                    </span>
                    {t.score === null ? (
                      <span className="text-[10px] tracking-wider text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded">
                        Unmentioned
                      </span>
                    ) : (
                      <RatingStars
                        score={Math.round(t.score)}
                        maxStars={5}
                        size={16}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!withCard) return content;

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden">
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
