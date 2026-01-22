"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
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
  label: "Job Ready" | "Almost There" | "Needs Practice";
  badgeClass: string;
  ringClass: string;
} {
  if (score >= 85) {
    return {
      label: "Job Ready",
      badgeClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      ringClass: "text-emerald-600 dark:text-emerald-400",
    };
  }

  if (score >= 70) {
    return {
      label: "Almost There",
      badgeClass:
        "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
      ringClass: "text-amber-600 dark:text-amber-400",
    };
  }

  return {
    label: "Needs Practice",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    ringClass: "text-red-600 dark:text-red-400",
  };
}

function getScoreTextClass(passed: boolean | null | undefined): string {
  if (passed === true) return "text-emerald-900 dark:text-emerald-100";
  if (passed === false) return "text-red-900 dark:text-red-100";
  return "text-foreground";
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
  summary: ReactNode;
  categoryScores: Record<CategoryKey, number>;
  technologyScores?: Array<{ tech: string; score: number }>;
}

export function DetailedScoreCard({
  score,
  passed,
  summary,
  categoryScores,
  technologyScores = [],
}: DetailedScoreCardProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const scoreValue = Math.max(0, Math.min(100, score));
  const progress = scoreValue / 100;
  const dashOffsetTarget = circumference * (1 - progress);

  const readiness = getReadiness(scoreValue);

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-10">
          {/* Top Section: Radial Chart & Summary */}
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
            {/* Radial Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden
                focusable="false"
              >
                <title>Score Progress Chart</title>
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffsetTarget }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={readiness.ringClass}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`text-4xl font-bold tabular-nums ${getScoreTextClass(
                    passed,
                  )}`}
                >
                  {scoreValue}
                </div>
              </div>
            </div>

            {/* Headline & Narrative */}
            <div className="text-center sm:text-left max-w-2xl flex-1">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {readiness.label}
                </h2>
                {passed !== undefined && passed !== null && (
                  <Badge
                    variant={passed ? "default" : "destructive"}
                    className="ml-2 uppercase tracking-tight font-bold"
                  >
                    {passed ? "Passed" : "Not Passed"}
                  </Badge>
                )}
              </div>
              <div className="mt-4 text-muted-foreground leading-relaxed text-base">
                {summary || "No summary available for this session."}
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Bottom Section: Category Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Core Competencies */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                Core Competencies
              </h3>
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
                          className="h-full bg-primary/80"
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
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Tech Stack
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {technologyScores.slice(0, 8).map((t, _idx) => (
                    <div
                      key={t.tech}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium truncate mr-2">
                        {t.tech}
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          t.score >= 70
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {Math.round(t.score)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
