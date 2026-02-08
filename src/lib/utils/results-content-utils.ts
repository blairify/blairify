import {
  formatKnowledgeGapBlurb,
  formatKnowledgeGapDescription,
  formatKnowledgeGapTitle,
} from "@/lib/utils/interview-normalizers";
import type { InterviewSession } from "@/types/firestore";
import type {
  InterviewResults,
  KnowledgeGap,
  KnowledgeGapPriority,
} from "@/types/interview";

export function clampFinite(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function deriveOverallScoreFromSession(
  session: InterviewSession,
): number {
  const saved = session.scores?.overall;
  if (typeof saved === "number" && saved > 0) return clampFinite(saved, 0, 100);

  const responseScores = (session.responses ?? [])
    .map((r) => r.score)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  if (responseScores.length > 0) {
    const avg =
      responseScores.reduce((sum, n) => sum + n, 0) / responseScores.length;
    return clampFinite(Math.round(avg), 0, 100);
  }

  const techScores: number[] = session.analysis?.technologyScores
    ? Object.values(session.analysis.technologyScores).filter(
        (n): n is number => typeof n === "number" && Number.isFinite(n),
      )
    : [];
  if (techScores.length > 0) {
    const avg = techScores.reduce((sum, n) => sum + n, 0) / techScores.length;
    return clampFinite(Math.round(avg), 0, 100);
  }

  return 0;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

export function mapKnowledgeGaps(
  analysis: InterviewSession["analysis"],
): KnowledgeGap[] | undefined {
  const isGeneratedSearchResourceUrl = (url: string): boolean => {
    const u = url.toLowerCase();
    if (u.includes("google.com/search")) return true;
    if (u.includes("youtube.com/results")) return true;
    return false;
  };

  const gaps = analysis.knowledgeGaps;
  if (!Array.isArray(gaps) || gaps.length === 0) return undefined;

  const normalized = gaps
    .map((g) => {
      const title = typeof g.title === "string" ? g.title.trim() : "";
      const why = typeof g.why === "string" ? g.why.trim() : "";
      const priority = g.priority;
      const tags = Array.isArray(g.tags)
        ? g.tags.filter(
            (t): t is string => typeof t === "string" && t.trim().length > 0,
          )
        : [];

      if (!title || !why) return null;

      const resources = Array.isArray(g.resources)
        ? g.resources
            .map((r) => {
              const id = typeof r.id === "string" ? r.id.trim() : "";
              const title = typeof r.title === "string" ? r.title.trim() : "";
              const url = typeof r.url === "string" ? r.url.trim() : "";
              const type = r.type;
              const tags = Array.isArray(r.tags)
                ? r.tags.filter(
                    (t): t is string =>
                      typeof t === "string" && t.trim().length > 0,
                  )
                : [];
              if (!id || !title || !url || !type) return null;
              if (isGeneratedSearchResourceUrl(url)) return null;
              if (tags.length === 0) return null;
              return {
                id,
                title,
                url,
                type,
                tags,
                ...(r.difficulty ? { difficulty: r.difficulty } : {}),
              };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
        : [];

      return {
        title,
        priority,
        tags,
        why,
        resources,
      } satisfies KnowledgeGap;
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return normalized.length > 0 ? normalized : undefined;
}

export function mapSessionToInterviewResults(
  session: InterviewSession,
): InterviewResults {
  const score = deriveOverallScoreFromSession(session);
  const analysis = session.analysis;
  const knowledgeGaps = mapKnowledgeGaps(analysis);

  const decision = (() => {
    switch (analysis.decision) {
      case "PASS":
        return "PASS";
      case "FAIL":
        return "FAIL";
      case "UNKNOWN":
      case undefined:
        return undefined;
      default: {
        const _never: never = analysis.decision as never;
        throw new Error(`Unhandled decision: ${_never}`);
      }
    }
  })();

  return {
    score,
    scoreColor: getScoreColor(score),
    overallScore: analysis.summary ?? "",
    categoryScores: analysis.categoryScores ?? undefined,
    strengths: analysis.strengths ?? [],
    improvements: analysis.improvements ?? [],
    detailedAnalysis: analysis.detailedAnalysis ?? "",
    technologyScores: analysis.technologyScores ?? undefined,
    recommendations: (analysis.recommendations ?? []).join("\n"),
    nextSteps: (analysis.nextSteps ?? []).join("\n"),
    ...(knowledgeGaps ? { knowledgeGaps } : {}),
    decision,
    passed: analysis.passed,
    passingThreshold: analysis.passingThreshold,
    whyDecision: analysis.whyDecision,
  };
}

export function getPriorityLabel(priority: KnowledgeGapPriority): string {
  switch (priority) {
    case "high":
      return "High priority";
    case "medium":
      return "Medium priority";
    case "low":
      return "Low priority";
    default: {
      const _never: never = priority;
      throw new Error(`Unhandled priority: ${_never}`);
    }
  }
}

export function getPriorityClass(priority: KnowledgeGapPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    case "low":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    default: {
      const _never: never = priority;
      throw new Error(`Unhandled priority: ${_never}`);
    }
  }
}

export function stripLinks(value: string): string {
  const withoutMarkdownLinks = value.replace(/\[([^\]]+)]\([^)]+\)/g, "$1");
  const withoutUrls = withoutMarkdownLinks.replace(/https?:\/\/\S+/g, "");
  return withoutUrls.replace(/\s{2,}/g, " ").trim();
}

export function stripMarkdown(value: string): string {
  return value
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~{2}([^~]+)~{2}/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function toShortTopicTitle(raw: string, tags?: string[]): string {
  return formatKnowledgeGapTitle(raw, tags);
}

export function shouldHideGapDescription(raw: string): boolean {
  const t = raw.toLowerCase();
  if (t.includes("didn't demonstrate")) return true;
  if (t.includes("did not demonstrate")) return true;
  if (t.includes("when i asked")) return true;
  if (t.includes("this candidate")) return true;
  if (t.includes("no significant")) return true;
  if (t.includes("none demonstrated")) return true;
  if (t.length < 18) return true;
  return false;
}

export function getGapSummaryText(gap: { summary?: string }): string {
  const source =
    typeof gap.summary === "string" && gap.summary.trim().length > 0
      ? gap.summary
      : "";
  const cleaned = stripLinks(stripMarkdown(source))
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (shouldHideGapDescription(cleaned)) return "";
  return cleaned;
}

export function getGapSummaryTextWithFallback(gap: KnowledgeGap): string {
  const fromSummary = getGapSummaryText(gap);
  if (fromSummary) return fromSummary;
  return formatKnowledgeGapDescription({
    title: gap.title,
    tags: gap.tags,
    priority: gap.priority,
    summary: gap.summary,
  });
}

export function getGapBlurbText(gap: KnowledgeGap): string {
  return formatKnowledgeGapBlurb({
    title: gap.title,
    tags: gap.tags,
    priority: gap.priority,
  });
}

export function getMarkdownText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getMarkdownText).join("");
  if (typeof node === "object" && node && "props" in node) {
    const n = node as { props?: { children?: unknown } };
    return getMarkdownText(n.props?.children);
  }
  return "";
}

export function normalizeOverallSummaryMarkdown(markdown: string): string {
  return markdown.replace(/\n(?=[A-Za-z][A-Za-z\s/]{2,40}:\s*\S)/g, "\n\n");
}
