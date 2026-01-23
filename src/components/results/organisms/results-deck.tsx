"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACHIEVEMENT_FALLBACK_ICON,
  ACHIEVEMENT_ICON_MAP,
} from "@/components/achievements/constants/icon-map";
import { Typography } from "@/components/common/atoms/typography";
import { MarkdownContent } from "@/components/common/molecules/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/lib/achievements";
import type { InterviewResults } from "@/types/interview";

const AUTO_ADVANCE_MS = 10_000;
const INTERACTION_PAUSE_MS = 12_000;

type DeckStepId = "rewards" | "outcome" | "takeaway" | "growth" | "next";

type DeckStep =
  | {
      id: "rewards";
      title: string;
      xpGained: number;
      achievements: Achievement[];
    }
  | {
      id: "outcome";
      title: string;
      score: number;
      passed: boolean | null;
      summary: string;
    }
  | {
      id: "takeaway";
      title: string;
      body: string;
    }
  | {
      id: "growth";
      title: string;
      focusAreas: {
        title: string;
        why: string;
        priority?: string;
        tags?: string[];
      }[];
    }
  | {
      id: "next";
      title: string;
      body: string;
    };

function stripMarkdown(value: string | null | undefined): string {
  const safe = typeof value === "string" ? value : "";
  return safe
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildOutcomeSummary(params: {
  passed: boolean | null;
  strengthsCount: number;
  improvementsCount: number;
}): string {
  const focusLine = (() => {
    if (params.strengthsCount === 0 && params.improvementsCount === 0) {
      return "";
    }

    if (params.strengthsCount > 0 && params.improvementsCount > 0) {
      return `We highlighted ${Math.min(params.strengthsCount, 3)} strengths and ${Math.min(params.improvementsCount, 3)} improvements.`;
    }

    if (params.strengthsCount > 0) {
      return `We highlighted ${Math.min(params.strengthsCount, 3)} strengths to build on.`;
    }

    return `We highlighted ${Math.min(params.improvementsCount, 3)} improvements to focus on.`;
  })();

  return [focusLine].filter(Boolean).join(" ");
}

function sanitizeOutcomeNarrative(raw: string | null | undefined): string {
  const compact = stripMarkdown(raw)
    .replace(/\bscore\b[^.?!]*[.?!]/gi, "")
    .replace(/\bdecision\b[^.?!]*[.?!]/gi, "")
    .replace(/\bpassing\s*threshold\b[^.?!]*[.?!]/gi, "")
    .replace(/\b\d+\s*\/\s*\d+\b/g, "")
    .replace(/\b\d+\s*(of|\/|out of)\s*\d+\b/gi, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (compact.length === 0) return "";

  const sentences = compact
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const first = sentences[0] ?? compact;

  const max = 180;
  if (first.length <= max) return first;
  const slice = first.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 80 ? slice.slice(0, cut) : slice).trimEnd();
  return `${safe}.`;
}

function sanitizeCoachNarrative(raw: string | null | undefined): string {
  const compact = stripMarkdown(raw)
    .replace(/\bfinal\s*score\b[^.?!]*[.?!]/gi, "")
    .replace(/\bpassing\s*threshold\b[^.?!]*[.?!]/gi, "")
    .replace(/\bscore\b[^.?!]*[.?!]/gi, "")
    .replace(/\bdecision\b[^.?!]*[.?!]/gi, "")
    .replace(/\b\d+\s*\/\s*\d+\b/g, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\bthis\s+candidate\b/gi, "You")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (compact.length === 0) return "";

  const sentences = compact
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences[0] ?? "";
}

function buildCoachSummary(params: {
  passed: boolean | null;
  score: number;
  strengths: string[];
  improvements: string[];
  narrative: string;
}): string {
  const rejectPlaceholder = (s: string): boolean => {
    const t = s.toLowerCase();
    if (t.includes("none demonstrated")) return true;
    if (t.includes("no significant")) return true;
    if (t.includes("unable to")) return true;
    if (t.includes("n/a")) return true;
    return false;
  };

  const s =
    params.strengths
      .map((x) => x.trim())
      .find((x) => x && !rejectPlaceholder(x)) ?? "";
  const i =
    params.improvements
      .map((x) => x.trim())
      .find((x) => x && !rejectPlaceholder(x)) ?? "";
  const n = sanitizeCoachNarrative(params.narrative);

  const tone = (() => {
    if (params.score >= 85)
      return "Strong performance — keep momentum and polish a couple edges.";
    if (params.score >= 70)
      return "Good trajectory — tighten a few areas and you’ll feel ready.";
    if (params.score >= 50)
      return "Solid foundation — a focused sprint will move the needle fast.";
    if (params.passed === true) return "Nice work — keep sharpening the edges.";
    if (params.passed === false)
      return "Good start — a bit more practice will make it click.";
    return "Good effort — with a little focus, you can level up quickly.";
  })();

  const parts = [
    s.length > 0 ? `You did well on: ${s}.` : "",
    i.length > 0 ? `Next, focus on: ${i}.` : "",
    n.length > 0 ? n : "",
    tone,
  ].filter(Boolean);

  return parts.slice(0, 3).join(" ");
}

function getScoreTextClass(passed: boolean | null): string {
  if (passed === true) return "text-emerald-900 dark:text-emerald-100";
  if (passed === false) return "text-red-900 dark:text-red-100";
  return "text-foreground";
}

function KineticListLines({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <motion.ul
      className="divide-y divide-border/40"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {items.map((b) => (
        <motion.li
          key={b}
          className="py-3 text-sm leading-relaxed"
          variants={{
            hidden: { opacity: 0, y: 10, filter: "blur(10px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.28, ease: "easeOut" },
            },
          }}
        >
          {b}
        </motion.li>
      ))}
    </motion.ul>
  );
}

function splitActionLines(raw: string, max: number): string[] {
  const compact = raw.replace(/\s+/g, " ").trim();
  if (compact.length === 0) return [];

  const fromLines = raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromLines.length >= max) return fromLines.slice(0, max);

  const parts = compact
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, max);
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function describeGapFallback(params: {
  title: string;
  tags?: string[];
  priority?: string;
}): string {
  const cleaned = stripMarkdown(params.title)
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) return "";

  const tagHint = (Array.isArray(params.tags) ? params.tags : [])
    .map((t) => stripMarkdown(t).trim())
    .filter((t) => t.length > 0)
    .slice(0, 2)
    .join(" / ");

  const difficultyHint = (() => {
    switch (params.priority) {
      case "high":
        return "High priority — ";
      case "medium":
        return "Priority — ";
      case "low":
        return "";
      default:
        return "";
    }
  })();

  const context = tagHint.length > 0 ? `${cleaned} (${tagHint})` : cleaned;
  const templates = [
    `${difficultyHint}Revisit ${context}. Prepare a crisp definition, a concrete example, and one trade-off.`,
    `${difficultyHint}Strengthen ${context}. Be ready to compare alternatives and explain when you'd choose each.`,
    `${difficultyHint}Drill ${context}. Practice explaining it out loud end-to-end in under 60 seconds.`,
    `${difficultyHint}Sharpen ${context}. Focus on common pitfalls and how you'd spot them in an interview.`,
    `${difficultyHint}Solidify ${context}. Know the key constraints, edge cases, and how you'd validate your approach.`,
  ];

  const key = [cleaned, tagHint, params.priority ?? ""].join("|");
  return templates[stableHash(key) % templates.length] ?? templates[0] ?? "";
}

function isGenericPlanLine(line: string): boolean {
  const t = stripMarkdown(line).toLowerCase();
  if (t.includes("study fundamental")) return true;
  if (t.includes("practice coding problems")) return true;
  if (t.includes("improve technical communication")) return true;
  if (t.includes("gain more hands-on experience")) return true;
  if (t.includes("best practices") && t.includes("fundamental")) return true;
  return false;
}

function buildPlanItems(results: InterviewResults, max: number): string[] {
  const fromNext =
    typeof results.nextSteps === "string"
      ? splitActionLines(results.nextSteps, max)
      : [];
  if (fromNext.length > 0 && !fromNext.every(isGenericPlanLine))
    return fromNext;

  const fromRecommendations =
    typeof results.recommendations === "string"
      ? splitActionLines(results.recommendations, max)
      : [];
  if (
    fromRecommendations.length > 0 &&
    !fromRecommendations.every(isGenericPlanLine)
  )
    return fromRecommendations;

  const gaps = Array.isArray(results.knowledgeGaps)
    ? results.knowledgeGaps
    : [];
  const gapItems = gaps
    .slice(0, max)
    .map((g) => {
      const raw =
        typeof g.summary === "string" && g.summary.trim().length > 0
          ? g.summary.trim()
          : describeGapFallback({
              title: g.title,
              tags: g.tags,
              priority: g.priority,
            });
      const cleaned = stripMarkdown(raw)
        .replace(/\.{3,}/g, " ")
        .replace(/…/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return cleaned.length > 0 ? cleaned : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (gapItems.length > 0) return gapItems;

  const improvementItems = limitBullets(results.improvements, max).map(
    (t) => `Focus: ${stripMarkdown(t)}`,
  );
  if (improvementItems.length > 0) return improvementItems;

  const strengthItems = limitBullets(results.strengths, max).map(
    (t) => `Double down: ${stripMarkdown(t)}`,
  );
  if (strengthItems.length > 0) return strengthItems;

  return [];
}

interface ResultsDeckProps {
  results: InterviewResults;
  sessionId: string;
  rewards: { xpGained: number; achievements: Achievement[] } | null;
  onRewardsConsumed: () => void;
  onOpenFullReport: () => void;
  onDone: () => void;
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}

function limitBullets(items: string[], max: number): string[] {
  return (Array.isArray(items) ? items : [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.length > 0)
    .slice(0, max);
}

function pickFocusAreas(params: {
  knowledgeGaps: InterviewResults["knowledgeGaps"] | undefined;
  improvements: string[];
  max: number;
}): { title: string; why: string; priority?: string; tags?: string[] }[] {
  const toShortTopic = (raw: string): string => {
    const cleaned = stripMarkdown(raw)
      .replace(/\.{3,}/g, " ")
      .replace(/…/g, " ")
      .replace(/[:\-–—]+\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const firstClause = cleaned.split(/[:.\n]/)[0]?.trim() ?? cleaned;
    const maxLen = 44;
    if (firstClause.length <= maxLen) return firstClause;
    const slice = firstClause.slice(0, maxLen);
    const cut = slice.lastIndexOf(" ");
    const safe = (cut > 18 ? slice.slice(0, cut) : slice).trimEnd();
    return safe;
  };

  const toNoEllipsisSnippet = (raw: string): string => {
    const cleaned = stripMarkdown(raw)
      .replace(/\.{3,}/g, " ")
      .replace(/…/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const maxLen = 140;
    if (cleaned.length <= maxLen) return cleaned;

    const sentenceEnd = cleaned.slice(0, maxLen).match(/[.!?](?=\s|$)/);
    if (sentenceEnd?.index != null) {
      return cleaned.slice(0, sentenceEnd.index + 1).trim();
    }

    const clauseSlice = cleaned.slice(0, maxLen);
    const clauseEnd = clauseSlice.match(/[,;:](?=\s|$)/);
    if (clauseEnd?.index != null) {
      const clause = clauseSlice.slice(0, clauseEnd.index).trim();
      if (clause.length > 0)
        return clause.endsWith(".") ? clause : `${clause}.`;
    }

    const words = cleaned.split(" ").filter((w) => w.length > 0);
    const maxWords = 18;
    const short = words.slice(0, maxWords).join(" ").trim();
    if (short.length === 0) return "";
    return short.endsWith(".") ? short : `${short}.`;
  };

  const gaps = Array.isArray(params.knowledgeGaps) ? params.knowledgeGaps : [];

  const priorityRank = (p: string | undefined): number => {
    switch (p) {
      case "high":
        return 0;
      case "medium":
        return 1;
      case "low":
        return 2;
      default:
        return 3;
    }
  };

  const fromGaps = gaps
    .slice()
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .map((g) => {
      const titleRaw = typeof g.title === "string" ? g.title.trim() : "";
      const title = titleRaw.length > 0 ? toShortTopic(titleRaw) : "";
      const summaryRaw = typeof g.summary === "string" ? g.summary.trim() : "";
      const descriptionRaw =
        summaryRaw.length > 0
          ? summaryRaw
          : describeGapFallback({
              title: titleRaw.length > 0 ? titleRaw : title,
              tags: g.tags,
              priority: g.priority,
            });
      const why =
        descriptionRaw.length > 0 ? toNoEllipsisSnippet(descriptionRaw) : "";
      if (!title) return null;
      return {
        title,
        why,
        priority: g.priority,
        tags: Array.isArray(g.tags) ? g.tags : undefined,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, params.max);

  if (fromGaps.length > 0) return fromGaps;

  return params.improvements.slice(0, params.max).map((t) => ({
    title: toShortTopic(t),
    why: "",
  }));
}

function getPriorityBadge(priority: string | undefined): {
  label: string;
  className: string;
} | null {
  if (!priority) return null;
  switch (priority) {
    case "high":
      return {
        label: "High",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      };
    case "medium":
      return {
        label: "Medium",
        className:
          "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
      };
    case "low":
      return {
        label: "Low",
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      };
    default: {
      const _never: never = priority as never;
      throw new Error(`Unhandled priority: ${_never}`);
    }
  }
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

const CATEGORY_MAX = {
  technical: 45,
  problemSolving: 25,
  communication: 10,
  professional: 20,
} as const;

type CategoryKey = keyof typeof CATEGORY_MAX;

function clampFinite(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function getCategoryScores(score: number): Record<CategoryKey, number> {
  const ratio = Math.max(0, Math.min(1, score / 100));
  return {
    technical: Math.round(ratio * CATEGORY_MAX.technical),
    problemSolving: Math.round(ratio * CATEGORY_MAX.problemSolving),
    communication: Math.round(ratio * CATEGORY_MAX.communication),
    professional: Math.round(ratio * CATEGORY_MAX.professional),
  };
}

function getCategoryScoresForResults(
  results: InterviewResults,
): Record<CategoryKey, number> {
  const scores = results.categoryScores;
  const overall = clampFinite(results.score, 0, 100);
  if (!scores) return getCategoryScores(overall);
  return {
    technical: clampFinite(scores.technical, 0, CATEGORY_MAX.technical),
    problemSolving: clampFinite(
      scores.problemSolving,
      0,
      CATEGORY_MAX.problemSolving,
    ),
    communication: clampFinite(
      scores.communication,
      0,
      CATEGORY_MAX.communication,
    ),
    professional: clampFinite(
      scores.professional,
      0,
      CATEGORY_MAX.professional,
    ),
  };
}

function getTechnologyScoresForResults(
  results: InterviewResults,
): Array<{ tech: string; score: number }> {
  const raw = results.technologyScores;
  if (!raw) return [];
  if (typeof raw !== "object") return [];

  return Object.entries(raw)
    .map(([tech, score]) => ({ tech, score: clampFinite(score, 0, 100) }))
    .filter((x) => x.tech.trim().length > 0)
    .sort((a, b) => b.score - a.score);
}

function getStepIcon(stepId: DeckStepId) {
  switch (stepId) {
    case "rewards":
      return <Sparkles className="size-4" />;
    case "outcome":
      return <Sparkles className="size-4" />;
    case "takeaway":
      return <Target className="size-4" />;
    case "growth":
      return <Target className="size-4" />;
    case "next":
      return <ArrowRight className="size-4" />;
    default: {
      const _never: never = stepId;
      throw new Error(`Unhandled step: ${_never}`);
    }
  }
}

export function ResultsDeck({
  results,
  sessionId,
  rewards,
  onRewardsConsumed,
  onOpenFullReport,
  onDone,
}: ResultsDeckProps) {
  const steps = useMemo<DeckStep[]>(() => {
    const passed = typeof results.passed === "boolean" ? results.passed : null;

    const narrativeSource =
      typeof results.whyDecision === "string" &&
      results.whyDecision.trim().length > 0
        ? results.whyDecision
        : results.overallScore;

    const coachSummary = buildCoachSummary({
      passed,
      score: results.score,
      strengths: limitBullets(results.strengths ?? [], 2),
      improvements: limitBullets(results.improvements ?? [], 2),
      narrative: narrativeSource,
    });

    const base: DeckStep[] = [
      {
        id: "outcome",
        title: "Summary",
        score: results.score,
        passed,
        summary: buildOutcomeSummary({
          passed,
          strengthsCount: (results.strengths ?? []).length,
          improvementsCount: (results.improvements ?? []).length,
        }),
      },
      {
        id: "takeaway",
        title: "Coach's feedback",
        body: coachSummary,
      },
      {
        id: "growth",
        title: "Focus areas",
        focusAreas: pickFocusAreas({
          knowledgeGaps: results.knowledgeGaps,
          improvements: limitBullets(results.improvements ?? [], 3),
          max: 3,
        }),
      },
      {
        id: "next",
        title: "Next step",
        body: typeof results.nextSteps === "string" ? results.nextSteps : "",
      },
    ];

    if (!rewards) return base;
    return [
      {
        id: "rewards",
        title: "Rewards",
        xpGained: rewards.xpGained,
        achievements: rewards.achievements,
      },
      ...base,
    ];
  }, [results, rewards]);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const lastIndex = steps.length - 1;
  const step = steps[index];

  const [outcomeLoading, setOutcomeLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);
  const scoreRafRef = useRef<number | null>(null);
  const scoreTimeoutRef = useRef<number | null>(null);

  const [animatedXP, setAnimatedXP] = useState<number | null>(null);
  const xpRafRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);

  useEffect(() => {
    if (step?.id !== "outcome") {
      setOutcomeLoading(false);
      setAnimatedScore(null);
      if (scoreTimeoutRef.current !== null)
        window.clearTimeout(scoreTimeoutRef.current);
      if (scoreRafRef.current) window.cancelAnimationFrame(scoreRafRef.current);
      scoreTimeoutRef.current = null;
      scoreRafRef.current = null;
      return;
    }

    if (scoreTimeoutRef.current !== null)
      window.clearTimeout(scoreTimeoutRef.current);
    if (scoreRafRef.current) window.cancelAnimationFrame(scoreRafRef.current);
    scoreTimeoutRef.current = null;
    scoreRafRef.current = null;

    setOutcomeLoading(true);
    setAnimatedScore(0);

    scoreTimeoutRef.current = window.setTimeout(() => {
      setOutcomeLoading(false);

      const start = performance.now();
      const duration = 900;
      const from = 0;
      const to = step.score;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) * (1 - t);
        const next = Math.round(from + (to - from) * eased);
        setAnimatedScore(next);
        if (t < 1) {
          scoreRafRef.current = window.requestAnimationFrame(tick);
        }
      };

      scoreRafRef.current = window.requestAnimationFrame(tick);
    }, 650);

    return () => {
      if (scoreTimeoutRef.current !== null)
        window.clearTimeout(scoreTimeoutRef.current);
      if (scoreRafRef.current) window.cancelAnimationFrame(scoreRafRef.current);
      scoreTimeoutRef.current = null;
      scoreRafRef.current = null;
    };
  }, [step]);

  useEffect(() => {
    if (step?.id !== "rewards") {
      setAnimatedXP(null);
      if (xpRafRef.current) window.cancelAnimationFrame(xpRafRef.current);
      xpRafRef.current = null;
      return;
    }

    if (xpRafRef.current) window.cancelAnimationFrame(xpRafRef.current);
    xpRafRef.current = null;

    const from = 0;
    const to = Math.max(0, Math.round(step.xpGained));
    setAnimatedXP(from);

    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const next = Math.round(from + (to - from) * eased);
      setAnimatedXP(next);
      if (t < 1) {
        xpRafRef.current = window.requestAnimationFrame(tick);
      }
    };

    xpRafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (xpRafRef.current) window.cancelAnimationFrame(xpRafRef.current);
      xpRafRef.current = null;
    };
  }, [step]);

  const pauseForInteraction = useCallback((ms: number) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setInteractionPaused(true);
    resumeTimerRef.current = setTimeout(() => {
      setInteractionPaused(false);
    }, ms);
  }, []);

  const setFromPointer = useCallback(
    (clientX: number) => {
      const start = dragStartXRef.current;
      if (typeof start !== "number") return;

      const dx = clientX - start;
      if (Math.abs(dx) < 70) return;

      dragStartXRef.current = null;
      if (dx < 0) {
        setIndex((i) => clampIndex(i + 1, lastIndex));
        return;
      }
      setIndex((i) => clampIndex(i - 1, lastIndex));
    },
    [lastIndex],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      setFromPointer(e.clientX);
    };

    const onUp = () => {
      isDraggingRef.current = false;
      dragStartXRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromPointer]);

  const autoPaused = hoverPaused || interactionPaused;

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((i) => clampIndex(i + 1, lastIndex));
  }, [lastIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => clampIndex(i - 1, lastIndex));
  }, [lastIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        if (
          e.key !== "ArrowLeft" &&
          e.key !== "ArrowRight" &&
          e.key !== "Enter"
        ) {
          return;
        }
      }

      pauseForInteraction(INTERACTION_PAUSE_MS);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }

      if (e.key !== "Enter") return;
      if (index < lastIndex) return;

      e.preventDefault();
      onDone();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, index, lastIndex, onDone, pauseForInteraction]);

  useEffect(() => {
    if (autoPaused) return;
    if (isDraggingRef.current) return;
    if (step?.id === "rewards") return;
    if (index >= lastIndex) return;

    const t = window.setTimeout(() => {
      setDirection(1);
      setIndex((i) => clampIndex(i + 1, lastIndex));
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(t);
  }, [autoPaused, index, lastIndex, step?.id]);

  if (!step) return null;

  return (
    <main
      className="group relative flex-1 overflow-hidden bg-background"
      aria-label="Interview results deck"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onPointerDown={(e) => {
        pauseForInteraction(INTERACTION_PAUSE_MS);
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
      }}
    >
      <div className="relative h-full overflow-auto">
        <div className="absolute inset-y-0 left-0 z-30 w-1/3">
          <button
            type="button"
            aria-label="Previous slide"
            className="h-full w-full cursor-w-resize bg-transparent border-0 p-0 outline-none focus:outline-none focus-visible:outline-none appearance-none"
            onClick={() => {
              pauseForInteraction(INTERACTION_PAUSE_MS);
              goPrev();
            }}
          />
        </div>
        <div className="absolute inset-y-0 right-0 z-30 w-1/3">
          <button
            type="button"
            aria-label="Next slide"
            className="h-full w-full cursor-e-resize bg-transparent border-0 p-0 outline-none focus:outline-none focus-visible:outline-none appearance-none"
            onClick={() => {
              pauseForInteraction(INTERACTION_PAUSE_MS);
              goNext();
            }}
          />
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.55, 0.8, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(900px circle at 30% 20%, rgba(0,0,0,0.02), rgba(0,0,0,0) 55%), radial-gradient(900px circle at 70% 80%, rgba(0,0,0,0.03), rgba(0,0,0,0) 55%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="font-semibold">
              Session: {sessionId.slice(0, 6)}
            </Badge>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.id}
              className="relative mt-6"
              custom={direction}
              variants={{
                enter: (d: 1 | -1) => ({
                  opacity: 0,
                  x: d === 1 ? 70 : -70,
                  filter: "blur(10px)",
                }),
                center: {
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                },
                exit: (d: 1 | -1) => ({
                  opacity: 0,
                  x: d === 1 ? -70 : 70,
                  filter: "blur(10px)",
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-3"
              >
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10 blur-2xl dark:from-primary/15 dark:to-emerald-400/15" />
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-amber-400/10 via-transparent to-transparent blur-3xl dark:from-amber-400/15" />
              </div>

              <motion.section className="relative rounded-3xl border bg-card shadow-sm">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.div
                    className="absolute -inset-x-24 -inset-y-10 rotate-12 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
                    initial={{ x: "-40%" }}
                    animate={{ x: "140%" }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                </motion.div>

                <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center sm:flex">
                  <div className="-translate-x-3 rounded-full border border-border/60 bg-background/70 p-2 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <ChevronLeft className="size-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center sm:flex">
                  <div className="translate-x-3 rounded-full border border-border/60 bg-background/70 p-2 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-12 sm:py-12 min-h-[64vh] flex flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getStepIcon(step.id)}
                      <Typography.CaptionMedium className="uppercase tracking-wider">
                        {step.title}
                      </Typography.CaptionMedium>
                    </div>

                    <div className="text-xs tabular-nums text-muted-foreground">
                      {index + 1}/{steps.length}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full">
                      {(() => {
                        switch (step.id) {
                          case "rewards": {
                            type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

                            const xpValue =
                              typeof animatedXP === "number"
                                ? animatedXP
                                : Math.round(step.xpGained);

                            const achievements = Array.isArray(
                              step.achievements,
                            )
                              ? step.achievements
                              : [];

                            const primaryAchievement = achievements[0] ?? null;
                            const PrimaryIcon = primaryAchievement
                              ? (ACHIEVEMENT_ICON_MAP[
                                  primaryAchievement.icon as IconKey
                                ] ?? ACHIEVEMENT_FALLBACK_ICON)
                              : null;

                            const particles = Array.from({ length: 18 }).map(
                              (_, i) => ({
                                key: `p_${i}`,
                                left: `${Math.random() * 100}%`,
                                delay: `${Math.random() * 0.8}s`,
                                duration: `${2.2 + Math.random() * 1.2}s`,
                                size: 4 + Math.round(Math.random() * 5),
                              }),
                            );

                            return (
                              <div className="relative space-y-8">
                                <div
                                  aria-hidden
                                  className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-br from-primary/25 via-emerald-400/10 to-transparent blur-2xl"
                                />
                                <div
                                  aria-hidden
                                  className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-amber-400/15 via-transparent to-transparent blur-3xl"
                                />
                                <div
                                  aria-hidden
                                  className="pointer-events-none absolute inset-0 overflow-hidden"
                                >
                                  {particles.map((p) => (
                                    <div
                                      key={p.key}
                                      className="absolute rounded-full bg-white/60 animate-confetti"
                                      style={{
                                        left: p.left,
                                        width: `${p.size}px`,
                                        height: `${p.size}px`,
                                        top: "-8px",
                                        animationDelay: p.delay,
                                        animationDuration: p.duration,
                                      }}
                                    />
                                  ))}
                                </div>

                                <div className="text-center">
                                  <Typography.Heading2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
                                    Rewards
                                  </Typography.Heading2>
                                  <Typography.Body className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    You earned XP for completing this interview.
                                  </Typography.Body>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  <div className="rounded-3xl border bg-gradient-to-br from-primary/15 via-background/40 to-background/40 p-6 shadow-sm">
                                    <div className="text-sm font-semibold text-muted-foreground">
                                      XP gained
                                    </div>
                                    <div className="mt-2 text-6xl font-bold tabular-nums text-foreground">
                                      +{xpValue}
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/30">
                                      <motion.div
                                        aria-hidden
                                        className="h-full bg-gradient-to-r from-primary to-emerald-400"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                          duration: 0.9,
                                          ease: "easeOut",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-3xl border bg-background/40 p-6">
                                    <div className="text-sm font-semibold text-muted-foreground">
                                      Achievements
                                    </div>
                                    {primaryAchievement ? (
                                      <div className="mt-4 flex items-start gap-4">
                                        <div className="size-12 rounded-2xl border bg-primary/10 flex items-center justify-center">
                                          {PrimaryIcon ? (
                                            <PrimaryIcon
                                              className="size-7 text-primary"
                                              aria-hidden="true"
                                            />
                                          ) : null}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-lg font-semibold text-foreground truncate">
                                            {primaryAchievement.name}
                                          </div>
                                          <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                            {primaryAchievement.description}
                                          </div>
                                          {achievements.length > 1 ? (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                              +{achievements.length - 1} more
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-4 text-sm text-muted-foreground">
                                        No new achievements this time.
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-center">
                                  <Button
                                    type="button"
                                    size="lg"
                                    onClick={() => {
                                      onRewardsConsumed();
                                      pauseForInteraction(INTERACTION_PAUSE_MS);
                                      goNext();
                                    }}
                                  >
                                    Continue
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                          case "outcome": {
                            const radius = 45;
                            const circumference = 2 * Math.PI * radius;
                            const rawScore =
                              typeof animatedScore === "number"
                                ? animatedScore
                                : step.score;
                            const scoreValue = Number.isFinite(rawScore)
                              ? Math.max(0, Math.min(100, rawScore))
                              : 0;
                            const progress = Math.max(
                              0,
                              Math.min(
                                1,
                                (outcomeLoading ? 0 : scoreValue) / 100,
                              ),
                            );
                            const dashOffsetTarget =
                              circumference * (1 - progress);

                            const readiness = getReadiness(scoreValue);
                            const categoryScores =
                              getCategoryScoresForResults(results);
                            const technologyScores =
                              getTechnologyScoresForResults(results);

                            const narrative = sanitizeOutcomeNarrative(
                              results.whyDecision?.trim().length
                                ? results.whyDecision
                                : results.overallScore,
                            );

                            return (
                              <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                                    <svg
                                      className="w-full h-full transform -rotate-90"
                                      viewBox="0 0 100 100"
                                      aria-hidden
                                      focusable="false"
                                    >
                                      <title>Score progress</title>
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-gray-200 dark:text-gray-800"
                                      />
                                      <motion.circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        initial={{
                                          strokeDashoffset: circumference,
                                        }}
                                        animate={{
                                          strokeDashoffset: dashOffsetTarget,
                                        }}
                                        transition={{
                                          duration: 0.9,
                                          ease: "easeOut",
                                        }}
                                        className={readiness.ringClass}
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div
                                        className={`text-4xl sm:text-5xl font-bold tabular-nums ${getScoreTextClass(step.passed)}`}
                                      >
                                        {scoreValue}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-center sm:text-left max-w-2xl">
                                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                                      <Typography.Heading2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
                                        {readiness.label}
                                      </Typography.Heading2>
                                      <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${readiness.badgeClass}`}
                                      >
                                        {scoreValue}/100
                                      </span>
                                    </div>
                                    <Typography.Body className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                      {step.summary.trim().length > 0
                                        ? step.summary
                                        : ""}
                                    </Typography.Body>

                                    {narrative.length > 0 ? (
                                      <Typography.Body className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                        {narrative}
                                      </Typography.Body>
                                    ) : null}
                                  </div>
                                </div>

                                {outcomeLoading ? (
                                  <div className="rounded-2xl border bg-background/40 px-4 py-3 animate-pulse">
                                    <div className="h-4 w-40 rounded bg-muted" />
                                    <div className="mt-3 h-2 w-full rounded-full bg-muted" />
                                  </div>
                                ) : null}

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {(
                                    [
                                      {
                                        key: "technical" as const,
                                        label: "Technical",
                                      },
                                      {
                                        key: "problemSolving" as const,
                                        label: "Problem solving",
                                      },
                                      {
                                        key: "communication" as const,
                                        label: "Communication",
                                      },
                                      {
                                        key: "professional" as const,
                                        label: "Professional",
                                      },
                                    ] satisfies {
                                      key: CategoryKey;
                                      label: string;
                                    }[]
                                  ).map((c, idx) => {
                                    const value = clampFinite(
                                      categoryScores[c.key],
                                      0,
                                      CATEGORY_MAX[c.key],
                                    );
                                    const max = CATEGORY_MAX[c.key];
                                    const pct =
                                      max > 0
                                        ? Math.round((value / max) * 100)
                                        : 0;

                                    return (
                                      <div
                                        key={c.key}
                                        className="rounded-2xl border bg-background/40 px-4 py-3"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="text-sm font-semibold">
                                            {c.label}
                                          </div>
                                          <div className="text-xs tabular-nums text-muted-foreground">
                                            {value}/{max}
                                          </div>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                          <motion.div
                                            className="h-full rounded-full bg-foreground/60"
                                            initial={{ width: 0 }}
                                            animate={{
                                              width: outcomeLoading
                                                ? "0%"
                                                : `${pct}%`,
                                            }}
                                            transition={{
                                              duration: 0.7,
                                              ease: "easeOut",
                                              delay: 0.12 + idx * 0.06,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {technologyScores.length > 0 ? (
                                  <div className="rounded-2xl border bg-background/40 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="text-sm font-semibold">
                                        Technology scores
                                      </div>
                                      <div className="text-xs tabular-nums text-muted-foreground">
                                        /100
                                      </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                      {technologyScores.slice(0, 6).map((t) => {
                                        const pct = Math.round(
                                          clampFinite(t.score, 0, 100),
                                        );
                                        return (
                                          <div
                                            key={t.tech}
                                            className="space-y-1"
                                          >
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="text-sm font-medium">
                                                {t.tech}
                                              </div>
                                              <div className="text-xs tabular-nums text-muted-foreground">
                                                {pct}/100
                                              </div>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                              <motion.div
                                                className="h-full rounded-full bg-foreground/60"
                                                initial={{ width: 0 }}
                                                animate={{
                                                  width: outcomeLoading
                                                    ? "0%"
                                                    : `${pct}%`,
                                                }}
                                                transition={{
                                                  duration: 0.7,
                                                  ease: "easeOut",
                                                }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          }

                          case "takeaway":
                            return (
                              <div className="space-y-6">
                                <div>
                                  <Typography.Heading2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                                    Coach's feedback
                                  </Typography.Heading2>
                                  <Typography.Body className="mt-2 text-sm text-muted-foreground">
                                    A quick debrief — what you did well, and
                                    what to focus on next.
                                  </Typography.Body>
                                </div>

                                <div className="rounded-3xl border bg-background/40 p-5 sm:p-6">
                                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <motion.div
                                      className="shrink-0"
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.35,
                                        ease: "easeOut",
                                      }}
                                    >
                                      <motion.div
                                        aria-hidden
                                        className="relative size-12 rounded-full border bg-background/70"
                                        animate={{ y: [0, -2, 0] }}
                                        transition={{
                                          duration: 2.2,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                        }}
                                      >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="relative size-8 rounded-full bg-foreground/5" />
                                          <motion.div
                                            className="absolute left-[14px] top-[18px] size-1.5 rounded-full bg-foreground/60"
                                            animate={{
                                              scaleY: [1, 1, 0.2, 1, 1],
                                            }}
                                            transition={{
                                              duration: 3.6,
                                              repeat: Infinity,
                                              times: [0, 0.42, 0.46, 0.5, 1],
                                            }}
                                          />
                                          <motion.div
                                            className="absolute right-[14px] top-[18px] size-1.5 rounded-full bg-foreground/60"
                                            animate={{
                                              scaleY: [1, 1, 0.2, 1, 1],
                                            }}
                                            transition={{
                                              duration: 3.6,
                                              repeat: Infinity,
                                              times: [0, 0.42, 0.46, 0.5, 1],
                                            }}
                                          />
                                        </div>
                                      </motion.div>
                                    </motion.div>

                                    <div className="min-w-0">
                                      <div className="text-foreground">
                                        <MarkdownContent
                                          markdown={
                                            step.body.trim().length > 0
                                              ? step.body
                                              : "No coach feedback captured."
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );

                          case "growth":
                            if (step.focusAreas.length === 0) {
                              return (
                                <Typography.Body className="text-sm text-muted-foreground">
                                  No focus areas captured.
                                </Typography.Body>
                              );
                            }

                            return (
                              <div className="space-y-6">
                                <div>
                                  <Typography.Heading2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                                    Top areas for growth
                                  </Typography.Heading2>
                                  <Typography.Body className="mt-2 text-sm text-muted-foreground">
                                    Review these topics — they’ll move your
                                    score the fastest.
                                  </Typography.Body>
                                </div>

                                <div className="rounded-3xl border bg-background/40">
                                  <div className="divide-y">
                                    {step.focusAreas.map((a, i) => (
                                      <motion.div
                                        key={`${i}-${a.title}`}
                                        className="px-5 py-4 sm:px-6"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.35,
                                          ease: "easeOut",
                                          delay: i * 0.06,
                                        }}
                                      >
                                        <div className="flex items-start gap-4">
                                          <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <div className="text-sm sm:text-base font-semibold leading-relaxed">
                                                {a.title}
                                              </div>
                                              {(() => {
                                                const p = getPriorityBadge(
                                                  a.priority,
                                                );
                                                if (!p) return null;
                                                return (
                                                  <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.className}`}
                                                  >
                                                    {p.label}
                                                  </span>
                                                );
                                              })()}
                                            </div>

                                            {Array.isArray(a.tags) &&
                                            a.tags.length > 0 ? (
                                              <div className="mt-2 flex flex-wrap gap-1.5">
                                                {a.tags.slice(0, 4).map((t) => (
                                                  <span
                                                    key={t}
                                                    className="rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                                                  >
                                                    {t}
                                                  </span>
                                                ))}
                                              </div>
                                            ) : null}
                                            {a.why.trim().length > 0 ? (
                                              <Typography.Body className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                                {a.why}
                                              </Typography.Body>
                                            ) : null}
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );

                          case "next":
                            return (
                              <div className="space-y-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      Next session
                                    </div>
                                    <Typography.Heading2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                                      Your plan
                                    </Typography.Heading2>
                                    <Typography.Body className="mt-2 text-sm text-muted-foreground">
                                      A simple, repeatable focus list.
                                    </Typography.Body>
                                  </div>

                                  <div className="rounded-full border bg-background/40 px-3 py-1 text-xs font-semibold">
                                    Ready
                                  </div>
                                </div>

                                <div className="rounded-3xl border bg-background/40 px-5 py-3 sm:px-6">
                                  <KineticListLines
                                    items={buildPlanItems(results, 3)}
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <Button className="h-11" onClick={onDone}>
                                    See Details
                                    <ArrowRight className="size-4 ml-2" />
                                  </Button>
                                  <Button
                                    className="h-11"
                                    variant="outline"
                                    onClick={onOpenFullReport}
                                  >
                                    Open saved report in history
                                  </Button>
                                </div>
                              </div>
                            );

                          default: {
                            const _never: never = step;
                            throw new Error(`Unhandled step: ${_never}`);
                          }
                        }
                      })()}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-1">
                      {steps.map((s, idx) => (
                        <div
                          key={s.id}
                          className={
                            idx === index
                              ? "h-1.5 w-8 rounded-full bg-foreground/60"
                              : "h-1.5 w-2 rounded-full bg-muted"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
