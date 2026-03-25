/**
 * New Interview Analysis API Route Handler
 * Clean, thin controller that delegates to service layer
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateAnalysis,
  generateMockAnalysisResponse,
  isAvailable,
} from "@/lib/services/ai/ai-client";
import {
  generateAnalysisSystemPrompt,
  generatePresentationSystemPrompt,
} from "@/lib/services/ai/prompt-generator";
import {
  deriveTagsFromTitle,
  parseAnalysis,
} from "@/lib/services/interview/analysis-service";

import {
  analyzeResponseQuality,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";
import { getQuestionById } from "@/lib/services/questions/neon-question-repository";
import { getResourcesByTags } from "@/lib/services/resources/neon-resource-repository";
import {
  formatKnowledgeGapDescription,
  formatKnowledgeGapTitle,
} from "@/lib/utils/interview-normalizers";
import type {
  AnalyzeApiRequest,
  AnalyzeApiResponse,
  InterviewConfig,
  InterviewResults,
  KnowledgeGap,
  Message,
  PresentationCopy,
  ResponseAnalysis,
} from "@/types/interview";

function normalizeGapTitle(value: string): string {
  return value
    .trim()
    .replace(/^[-*\s]*title\s*:\s*/i, "")
    .replace(/^[-*\s]*-\s*title\s*:\s*/i, "")
    .replace(/^[-*\s]*\*\*title\*\*\s*:\s*/i, "")
    .replace(/^[-*\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePresentationWhy(value: string): string {
  const cleaned = value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) return "";
  return cleaned;
}

function normalizePresentationPlanLine(value: string): string {
  const raw = stripInlineMarkdown(value).trim();
  if (!raw) return "";

  const firstSentence = raw.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!firstSentence) return "";

  const trimmed = firstSentence.replace(/[\s\-–—,:;]+$/g, "").trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  const endsBadly =
    lower.endsWith(" vs") ||
    lower.endsWith(" vs.") ||
    lower.endsWith(" versus") ||
    lower.endsWith(" etc") ||
    lower.endsWith(" etc.");
  if (endsBadly) return "";

  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function isAcceptableGapTitle(title: string): boolean {
  const t = title.trim();
  if (t.length < 5 || t.length > 52) return false;
  if (t.includes("?")) return false;

  const lower = t.toLowerCase();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  if (wordCount < 2 || wordCount > 8) return false;

  const bannedStarts = [
    "let's ",
    "lets ",
    "whether ",
    "thanks",
    "you ",
    "can you ",
    "could you ",
    "would you ",
    "explain ",
    "describe ",
    "define ",
    "summarize ",
    "implement ",
    "use ",
    "build ",
    "create ",
    "when i asked",
    "during the question",
    "i asked",
    "we asked",
    "the candidate",
  ];
  if (bannedStarts.some((p) => lower.startsWith(p))) return false;

  const bannedContains = [
    "let's try",
    "let's move",
    "let's switch",
    "let's",
    "different angle",
    "you described",
    "you said",
    "you mentioned",
    "you explained",
    "you answered",
    "you didn",
    "you did not",
    "when i asked",
    "can you",
  ];
  if (bannedContains.some((p) => lower.includes(p))) return false;

  if (/[.!]$/.test(t)) return false;
  return true;
}

function normalizeGrowthTitle(raw: string): string {
  const cleaned = stripInlineMarkdown(raw)
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  const isGeneric = (value: string): boolean => {
    const t = value.trim().toLowerCase();
    if (!t) return true;
    if (t === "topic") return true;
    if (t === "this") return true;
    if (t === "this topic") return true;
    if (t === "that topic") return true;
    if (t === "this concept") return true;
    return false;
  };

  const withoutLead = cleaned
    .replace(/^in\s+your\s+answer\s+about\s+/i, "")
    .replace(/^when\s+i\s+asked\s+about\s+/i, "")
    .replace(
      /^since\s+that\s+topic\s+wasn['’]t\s+familiar\s*,?\s*let['’]s\s+.+$/i,
      "",
    )
    .replace(/^since\s+that\s+wasn['’]t\s+familiar\s*,?\s*let['’]s\s+.+$/i, "")
    .replace(
      /^since\s+you\s+(?:weren['’]t|were\s+not)\s+familiar\s+with\s+.+$/i,
      "",
    )
    .replace(/^no\s+worries\s*,?\s*let['’]s\s+.+$/i, "")
    .replace(/^all\s+good\s*,?\s*let['’]s\s+.+$/i, "")
    .replace(/^okay\s*,?\s*let['’]s\s+.+$/i, "")
    .replace(/^let['’]s\s+try\s+.+?\s*[:\-–—]?\s*/i, "")
    .replace(/^let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^now,\s+let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^how\s+do\s+you\s+/i, "")
    .replace(/^how\s+would\s+you\s+/i, "")
    .replace(/^how\s+to\s+/i, "")
    .replace(/^what\s+is\s+/i, "")
    .replace(/^what\s+are\s+/i, "")
    .replace(/^you\s+(?:can\s+)?/i, "")
    .replace(/^your\s+/i, "")
    .trim();

  const withoutQuestionTail = withoutLead
    .replace(/[,;:]?\s+and\s+why\s+is\s+it\b.*$/i, "")
    .replace(/[,;:]?\s+and\s+why\s+it\b.*$/i, "")
    .replace(/[,;:]?\s+and\s+why\b.*$/i, "")
    .replace(/\s+why\s+is\s+it\b.*$/i, "")
    .replace(/\s+why\s+it\b.*$/i, "")
    .trim();

  if (!withoutQuestionTail) return "";

  const words = withoutQuestionTail.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const verb = (words[0] ?? "").toLowerCase();
  const rest = words.slice(1).join(" ");

  const toIng = (v: string): string => {
    const map: Record<string, string> = {
      handle: "Handling",
      debug: "Debugging",
      investigate: "Investigating",
      triage: "Triaging",
      optimize: "Optimizing",
      improve: "Improving",
      secure: "Securing",
      design: "Designing",
      implement: "Implementing",
      build: "Building",
      test: "Testing",
      monitor: "Monitoring",
      diagnose: "Diagnosing",
      tune: "Tuning",
      mitigate: "Mitigating",
      prevent: "Preventing",
      explain: "Explaining",
      describe: "Describing",
      define: "Defining",
      identify: "Identifying",
    };
    const mapped = map[v];
    if (mapped) return mapped;
    if (v.endsWith("e") && v.length > 2) return `${v.slice(0, -1)}ing`;
    return `${v}ing`;
  };

  const normalized = (() => {
    if (!rest) return withoutLead;
    if (
      verb === "handle" ||
      verb === "debug" ||
      verb === "investigate" ||
      verb === "triage" ||
      verb === "optimize" ||
      verb === "improve" ||
      verb === "secure" ||
      verb === "design" ||
      verb === "implement" ||
      verb === "build" ||
      verb === "test" ||
      verb === "monitor" ||
      verb === "diagnose" ||
      verb === "tune" ||
      verb === "mitigate" ||
      verb === "prevent" ||
      verb === "explain" ||
      verb === "describe" ||
      verb === "define" ||
      verb === "identify"
    ) {
      return `${toIng(verb)} ${rest}`;
    }
    return withoutQuestionTail;
  })();

  const capped =
    normalized.length > 0
      ? normalized[0].toUpperCase() + normalized.slice(1)
      : "";

  const final = capped.replace(/[.!]+$/g, "").trim();
  if (isGeneric(final)) return "";
  return final;
}

function normalizeWhy(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function safeParseJsonObject(value: string): Record<string, unknown> | null {
  const raw = value.trim();
  if (!raw) return null;

  const unfence = (input: string): string => {
    const fenced = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) return fenced[1].trim();
    return input;
  };

  const normalized = unfence(raw).trim();
  if (!normalized) return null;

  const jsonCandidate = (() => {
    if (normalized.startsWith("{") && normalized.endsWith("}"))
      return normalized;
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start < 0 || end < 0 || end <= start) return normalized;
    return normalized.slice(start, end + 1);
  })();
  try {
    const parsed = JSON.parse(jsonCandidate) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function truncateForLog(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n…(truncated)`;
}

function isPresentationCopy(value: unknown): value is PresentationCopy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.coachFeedback !== "string") return false;
  if (!Array.isArray(v.focusAreas)) return false;
  if (!Array.isArray(v.plan)) return false;

  const focusAreas = v.focusAreas as unknown[];
  if (focusAreas.length < 2 || focusAreas.length > 6) return false;
  for (const item of focusAreas) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const i = item as Record<string, unknown>;
    if (typeof i.title !== "string" || i.title.trim().length === 0)
      return false;
    if (typeof i.why !== "string" || i.why.trim().length === 0) return false;
    if (i.priority != null) {
      if (
        i.priority !== "high" &&
        i.priority !== "medium" &&
        i.priority !== "low"
      )
        return false;
    }
    if (i.tags != null && !Array.isArray(i.tags)) return false;
  }

  const plan = v.plan as unknown[];
  if (plan.length < 3 || plan.length > 8) return false;
  if (!plan.every((p) => typeof p === "string" && p.trim().length > 0))
    return false;

  return true;
}

function buildPresentationUserPrompt(options: {
  config: InterviewConfig;
  results: InterviewResults;
}): string {
  const { results, config } = options;
  const gaps = Array.isArray(results.knowledgeGaps)
    ? results.knowledgeGaps
    : [];

  const base = {
    interview: {
      position: config.position,
      seniority: config.seniority,
      interviewType: config.interviewType,
      technologies: config.technologies,
    },
    outcome: {
      decision: results.decision,
      score: results.score,
      passed: results.passed,
      performanceLevel: results.overallScore,
      whyDecision: results.whyDecision,
    },
    strengths: results.strengths,
    improvements: results.improvements,
    knowledgeGaps: gaps.map((g) => ({
      title: g.title,
      priority: g.priority,
      tags: g.tags,
      summary: g.summary,
      why: g.why,
    })),
  };

  return `Turn this structured analysis into presentation copy.\n\nINPUT JSON:\n${JSON.stringify(
    base,
    null,
    2,
  )}`;
}

function extractInterviewerQuestions(conversationHistory: Message[]): string[] {
  const questions: string[] = [];

  const isOutroLine = (value: string): boolean => {
    const t = value.trim().toLowerCase();
    if (!t) return true;
    if (t.startsWith("thanks")) return true;
    if (t.includes("that's all the questions")) return true;
    if (t.includes("thats all the questions")) return true;
    if (t.includes("that is all the questions")) return true;
    if (t.includes("that concludes")) return true;
    if (t.includes("end of the interview")) return true;
    if (t.includes("good luck")) return true;
    if (t.includes("anything else")) return true;
    if (t.includes("any questions for me")) return true;
    return false;
  };

  const extractQuestion = (content: string): string | null => {
    const raw = content.trim();
    if (!raw) return null;
    if (isOutroLine(raw)) return null;

    const lines = raw
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 6);

    for (const line of lines) {
      if (isOutroLine(line)) continue;
      if (line.includes("?")) return line;
    }

    const joined = lines.join(" ").trim();
    if (!joined) return null;
    if (isOutroLine(joined)) return null;

    const lead = joined.toLowerCase();
    const looksLikeQuestion =
      lead.startsWith("what ") ||
      lead.startsWith("why ") ||
      lead.startsWith("how ") ||
      lead.startsWith("when ") ||
      lead.startsWith("where ") ||
      lead.startsWith("which ") ||
      lead.startsWith("can you ") ||
      lead.startsWith("could you ") ||
      lead.startsWith("walk me ") ||
      lead.startsWith("tell me ") ||
      lead.startsWith("describe ") ||
      lead.startsWith("explain ");
    if (looksLikeQuestion) return joined;

    return null;
  };

  for (const msg of conversationHistory) {
    if (msg.type !== "ai") continue;
    // Return the full message content or a truncated version as the "question"
    // This ensures a 1:1 mapping with AI messages as expected by the frontend
    const q = extractQuestion(msg.content);
    if (!q) continue;
    questions.push(q);
  }
  return questions;
}

function normalizeTopicReference(value: string): string {
  return value
    .trim()
    .replace(/^[-*\s\d.)]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/[?]+$/g, "")
    .trim();
}

function questionToTopicReference(question: string | undefined): string {
  const q = normalizeTopicReference(question ?? "");
  if (!q) return "";

  const lower = q.toLowerCase();
  if (lower.includes("alt attribute")) return "the alt attribute in HTML";
  if (lower.includes("javascript") && lower.includes("html")) {
    return "JavaScript placement in HTML";
  }
  if (lower.includes("error boundary")) return "React error boundaries";
  if (lower.includes("functional component"))
    return "React functional components";
  if (lower.includes("testing") && lower.includes("react")) {
    return "Testing React components";
  }
  if (lower.startsWith("what react is") || /\bwhat\s+is\s+react\b/i.test(q)) {
    return "React fundamentals";
  }

  const cleaned = q
    .replace(/^let['’]s\s+try\s+a\s+different\s+scenario\s*[:\-–—]?\s*/i, "")
    .replace(/^let['’]s\s+try\s+another\s+scenario\s*[:\-–—]?\s*/i, "")
    .replace(/^let['’]s\s+try\s+another\s+angle\s*[:\-–—]?\s*/i, "")
    .replace(/^let['’]s\s+try\s+.+?\s*[:\-–—]?\s*/i, "")
    .replace(/^you['’]d\s+/i, "")
    .replace(/^let['’]s\s+start\s+with\s+something\s+fundamental—?/i, "")
    .replace(/^now,\s+let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^if\s+you\s+were\s+working\s+with\s+/i, "")
    .replace(
      /^(?:can|could|would)\s+you\s+(?:quickly\s+)?(?:explain|describe|walk\s+me\s+through|tell\s+me\s+about)\s+/i,
      "",
    )
    .replace(
      /^(?:explain|describe|walk\s+me\s+through|tell\s+me\s+about)\s+/i,
      "",
    )
    .replace(
      /^(?:what|why|how|when|where|which)\s+(?:is|are|was|were|do|does|did|can|could|would|should)\s+/i,
      "",
    )
    .replace(/^(?:what|why|how|when|where|which)\s+/i, "")
    .replace(/^(?:the|a|an)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const clause = cleaned.split(/[:.]/)[0]?.trim() ?? cleaned;
  if (!clause) return "";

  const maxLen = 60;
  if (clause.length <= maxLen) {
    const title = normalizeGrowthTitle(clause);
    return title;
  }

  const slice = clause.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 18 ? slice.slice(0, cut) : slice)
    .replace(/[,:;\-–—]+\s*$/g, "")
    .trim();
  const title = normalizeGrowthTitle(safe);
  return title;
}

function isAcceptablePresentationFocusTitle(title: string): boolean {
  const t = normalizeGapTitle(title);
  if (!t) return false;
  if (t.toLowerCase() === "this topic") return false;
  if (!isAcceptableGapTitle(t)) return false;
  const lower = t.toLowerCase();
  if (lower.includes("let's try")) return false;
  if (lower.includes("in your answer about")) return false;
  if (lower.includes("when i asked")) return false;
  return true;
}

function buildFallbackTitleFromTags(tags: string[]): string {
  const ignore = new Set(["fundamentals", "interview", "practice"]);
  const cleaned = tags
    .map((t) => normalizeTag(t))
    .filter((t) => t.length > 0)
    .filter((t) => !ignore.has(t));

  const pick = cleaned[0] ?? tags[0] ?? "";
  const secondary = cleaned[1];

  const humanize = (tag: string): string => {
    const words = tag
      .replace(/[-_]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4);
    if (words.length === 0) return "";
    return words
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ")
      .trim();
  };

  const a = humanize(pick);
  const b = secondary ? humanize(secondary) : "";
  if (a && b) return `${a}: ${b}`;
  if (a) return a;
  return "Core fundamentals";
}

function normalizeTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeModelTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  return tags
    .map((t) => normalizeTag(t))
    .filter((t) => {
      if (t.length === 0) return false;
      if (t.length > 32) return false;
      if (t.includes("--")) return false;
      if (t.startsWith("title-")) return false;
      if (t.includes("title-")) return false;
      const dashCount = (t.match(/-/g) ?? []).length;
      if (dashCount >= 4) return false;
      return true;
    })
    .slice(0, 6);
}

function _deriveConceptTagsFromQuestion(
  question: string | undefined,
): string[] {
  const q = (question ?? "").toLowerCase();
  const tags: string[] = [];

  const push = (t: string) => {
    const v = normalizeTag(t);
    if (!v) return;
    if (!tags.includes(v)) tags.push(v);
  };

  if (q.includes("alt attribute")) {
    push("html");
    push("accessibility");
    push("images");
    return tags;
  }

  if (q.includes("javascript") && q.includes("html")) {
    push("html");
    push("javascript");
    push("script-tag");
    return tags;
  }

  if (q.includes("error boundary")) {
    push("react");
    push("error-boundary");
    push("error-handling");
    return tags;
  }

  if (q.includes("functional component")) {
    push("react");
    push("functional-components");
    push("components");
    return tags;
  }

  if (q.includes("testing") && q.includes("component")) {
    push("react");
    push("testing");
    push("component-testing");

    if (q.includes("jest")) push("jest");
    if (q.includes("vitest")) push("vitest");
    if (q.includes("testing library") || q.includes("testing-library")) {
      push("testing-library");
    }
    if (
      q.includes("react testing library") ||
      q.includes("react-testing-library")
    ) {
      push("react-testing-library");
    }
    if (q.includes("cypress")) push("cypress");
    if (q.includes("playwright")) push("playwright");
    if (q.includes("enzyme")) push("enzyme");

    return tags;
  }

  if (q.includes("react")) push("react");
  if (q.includes("css")) push("css");
  if (q.includes("sql") || q.includes("database")) push("sql");
  if (q.includes("index")) push("indexes");
  if (q.includes("http") || q.includes("api")) push("http");
  if (q.includes("auth") || q.includes("authentication"))
    push("authentication");
  if (q.includes("security")) push("security");
  if (q.includes("testing") || q.includes("test")) push("testing");
  if (q.includes("performance") || q.includes("optimiz")) push("performance");

  if (tags.length > 0) return tags;
  return ["fundamentals"];
}

function normalizeSecondPerson(value: string): string {
  return value
    .replace(/\bthe candidate\b/gi, "you")
    .replace(/\bcandidate\b/gi, "you")
    .replace(/\bthey\b/gi, "you")
    .replace(/\btheir\b/gi, "your")
    .replace(/\bthem\b/gi, "you")
    .replace(/\s+/g, " ")
    .trim();
}

function _sanitizeGapSummary(summary: string): string {
  const s = stripInlineMarkdown(summary)
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";

  const normalized = normalizeSecondPerson(s);
  const lower = normalized.toLowerCase();
  const looksBad =
    lower.startsWith("when i asked") ||
    lower.startsWith("during the question") ||
    lower.startsWith("thanks") ||
    lower.startsWith("let's ") ||
    lower.startsWith("lets ") ||
    lower.startsWith("whether ");
  if (looksBad) return "";

  const maxLen = 180;
  if (normalized.length <= maxLen) return normalized;

  const slice = normalized.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 80 ? slice.slice(0, cut) : slice).trimEnd();
  return safe.length > 0 ? `${safe}.` : "";
}

function deriveGapSummaryFromWhy(why: string): string {
  const base = stripInlineMarkdown(why)
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";

  const firstSentence = base.split(/(?<=[.!?])\s+/)[0]?.trim() ?? base;
  if (!firstSentence) return "";

  const rewritten = normalizeSecondPerson(firstSentence)
    .replace(/^(?:because|since)\s+/i, "")
    .replace(/^you\s+(?:should|need\s+to|must)\s+/i, "")
    .replace(/^focus\s+on\s+/i, "")
    .trim();

  if (!rewritten) return "";
  const maxLen = 180;
  const clipped =
    rewritten.length <= maxLen ? rewritten : rewritten.slice(0, maxLen);
  const cleaned = clipped
    .replace(/[\s\-:,(]+$/g, "")
    .replace(/[.]+$/g, "")
    .trim();
  if (!cleaned) return "";
  if (/[.!?]$/.test(cleaned)) return cleaned;
  return `${cleaned}.`;
}

function _buildGapSummaryFallback(params: {
  title: string;
  tags: string[];
  priority: KnowledgeGap["priority"];
}): string {
  const topic = normalizeGapTitle(params.title);
  const base = topic;

  const prefix = (() => {
    switch (params.priority) {
      case "high":
        return "High priority — ";
      case "medium":
        return "Priority — ";
      case "low":
        return "";
      default: {
        const _never: never = params.priority;
        throw new Error(`Unhandled priority: ${_never}`);
      }
    }
  })();

  const templates = [
    `${prefix}Practice a crisp definition, a tiny example, and one trade-off for ${base}.`,
    `${prefix}Explain ${base} end-to-end in under 60 seconds, then add one common pitfall.`,
    `${prefix}Strengthen ${base} by comparing alternatives and when you’d choose each.`,
  ];

  const key = [topic, params.priority].join("|");
  const pick =
    templates[stableHash(key) % templates.length] ?? templates[0] ?? "";
  return pick;
}

function ensureWhyReferencesTranscript(
  why: string,
  fallbackQuestion: string | undefined,
): string {
  const normalized = normalizeSecondPerson(normalizeWhy(why));
  const lower = normalized.toLowerCase();
  const looksBad =
    normalized.length < 12 ||
    lower.startsWith("when i asked") ||
    lower.startsWith("during the question") ||
    lower.startsWith("thanks") ||
    lower.includes("that's all the questions") ||
    lower.includes("let's try") ||
    lower.includes("different angle") ||
    lower.includes("in your answer about");

  if (!looksBad) return normalized;

  const topic = questionToTopicReference(fallbackQuestion);
  return `In your answer about ${topic}, you didn’t demonstrate this clearly.`;
}

function dedupeKnowledgeGaps(gaps: KnowledgeGap[]): KnowledgeGap[] {
  const next: KnowledgeGap[] = [];
  const seen = new Set<string>();
  for (const gap of gaps) {
    const key = normalizeGapTitle(gap.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(gap);
  }
  return next;
}

type FallbackGapSeed = {
  title: string;
  tags: string[];
  why: string;
};

function deriveFallbackGapsFromQuestion(question: string): FallbackGapSeed[] {
  const q = question.toLowerCase();

  const includesJava =
    q.includes(" java ") || q.startsWith("java ") || q.includes("in java");
  const mentionsMain = q.includes(" main") || q.includes("main(");
  const mentionsBeforeMain = q.includes("before") && mentionsMain;

  if (includesJava && mentionsBeforeMain) {
    return [
      {
        title: "Java class initialization: static initializers & class loading",
        tags: ["java", "class-loading", "static-initializer"],
        why: "you should explain when static blocks/fields run, what triggers initialization, and give a concrete example (e.g., registering a JDBC driver, initializing a singleton).",
      },
      {
        title:
          "Static initialization pitfalls (side effects, order, heavy work)",
        tags: ["java", "static-initializer", "best-practices"],
        why: "a strong answer also warns against heavy IO in static blocks, explains initialization order, and suggests safer patterns (lazy init, explicit bootstrap, DI).",
      },
    ];
  }

  if (includesJava && mentionsMain) {
    return [
      {
        title: "Java application startup flow (JVM → class loading → main)",
        tags: ["java", "jvm", "startup"],
        why: "a strong answer connects JVM startup, class loading/initialization, and what code can run before `main`.",
      },
      {
        title: "Initialization order: static fields vs static blocks",
        tags: ["java", "initialization", "static"],
        why: "you should be able to describe initialization order and how it affects side effects and correctness.",
      },
    ];
  }

  if (q.includes("sql") || q.includes("database") || q.includes("index")) {
    return [
      {
        title: "SQL performance: indexes and query plans",
        tags: ["sql", "indexes", "query-plans"],
        why: "you should explain how indexes affect lookups, when they don’t help, and how to validate with `EXPLAIN`/query plans.",
      },
      {
        title: "Index design basics (selectivity, composite indexes)",
        tags: ["sql", "indexes", "database"],
        why: "a complete answer includes selectivity, composite index ordering, and trade-offs (write cost, storage).",
      },
    ];
  }

  if (q.includes("python") || q.includes("django") || q.includes("flask")) {
    return [
      {
        title: "Pythonic patterns: comprehensions and generators",
        tags: ["python", "generators", "list-comprehension"],
        why: "you should explain when to use generators for memory efficiency vs list comprehensions for speed.",
      },
      {
        title: "Memory management in Python (GIL, GC, ref counting)",
        tags: ["python", "performance", "gil"],
        why: "a strong answer explains the Global Interpreter Lock, how garbage collection works, and implications for concurrency.",
      },
      {
        title: "Higher-order functions: decorators and closures",
        tags: ["python", "decorators", "functional"],
        why: "you should be able to explain how decorators wrap functions and give a practical example like logging or authentication.",
      },
    ];
  }

  if (q.includes("react") || q.includes("render")) {
    return [
      {
        title: "React rendering: what triggers re-renders",
        tags: ["react", "rendering", "state"],
        why: "you should explain what triggers renders, how state/props changes propagate, and how reconciliation works at a high level.",
      },
      {
        title: "Avoid unnecessary re-renders (memoization, stable props)",
        tags: ["react", "performance", "memoization"],
        why: "a strong answer calls out practical patterns: `memo`, stable callbacks, derived state, and measuring before optimizing.",
      },
    ];
  }

  if (q.includes("http") || q.includes("rest") || q.includes("api")) {
    return [
      {
        title: "HTTP semantics: status codes, idempotency",
        tags: ["http", "rest", "api"],
        why: "you should cover status codes, idempotency, and what guarantees clients can rely on.",
      },
      {
        title: "API error handling patterns (retries, timeouts)",
        tags: ["api", "error-handling", "reliability"],
        why: "a strong answer explains timeouts, retries, backoff, and how to avoid retry storms.",
      },
    ];
  }

  return [
    {
      title: "Answer structure: definition → example → pitfall",
      tags: ["fundamentals", "examples"],
      why: "aim for a crisp definition, then a tiny example, then one pitfall or best practice — this makes answers easy to score.",
    },
    {
      title: "Trade-offs and edge cases",
      tags: ["trade-offs", "edge-cases"],
      why: "add at least one trade-off or edge case to show depth beyond the happy path.",
    },
  ];
}

function buildFallbackKnowledgeGaps(options: {
  conversationHistory: Message[];
  config: InterviewConfig;
  score: number;
  passed?: boolean;
  technologyScores?: Record<string, number | null>;
}): KnowledgeGap[] {
  const questions = extractInterviewerQuestions(options.conversationHistory);

  const isPerfectish = options.score >= 95;
  if (isPerfectish) {
    const q1 = questions[0];
    const q2 = questions[1];
    return [
      {
        title: "Optimization: trade-offs and profiling mindset",
        priority: "low",
        tags: ["performance", "profiling", "optimization"],
        summary:
          "Explain how you would measure bottlenecks, compare trade-offs, and choose an optimization deliberately.",
        why: ensureWhyReferencesTranscript(
          "you can go beyond correct solutions by explaining how you would measure bottlenecks and choose optimizations.",
          q1,
        ),
        resources: [],
      },
      {
        title: "Advanced concepts: edge cases and production hardening",
        priority: "low",
        tags: ["reliability", "testing", "edge-cases"],
        summary:
          "Call out failure modes and edge cases, then explain how you would validate assumptions in production.",
        why: ensureWhyReferencesTranscript(
          "a senior-level answer typically calls out failure modes, constraints, and how you’d validate assumptions in production.",
          q2 ?? q1,
        ),
        resources: [],
      },
    ];
  }

  const positionTag = options.config.position
    ? options.config.position.toLowerCase().replace(/\s+/g, "-")
    : "interview";

  // Filter out questions that seem to be well-answered based on technology scores
  const filteredQuestions = questions.filter((q) => {
    if (!options.technologyScores) return true;
    const lowerQ = q.toLowerCase();
    for (const [tech, score] of Object.entries(options.technologyScores)) {
      if (score !== null && score >= 85) {
        if (lowerQ.includes(tech.toLowerCase())) return false;
      }
    }
    return true;
  });

  const targetQuestions =
    filteredQuestions.length > 0 ? filteredQuestions : questions;

  const allSeeds = targetQuestions.flatMap((q) =>
    deriveFallbackGapsFromQuestion(q),
  );

  const candidates: FallbackGapSeed[] = [
    ...allSeeds,
    ...(targetQuestions.length > 0
      ? []
      : [
          {
            title: "Answer structure: definition → example → pitfall",
            tags: [positionTag, "fundamentals"],
            why: "answers should define the concept, show a minimal working example, and call out one pitfall or best practice.",
          },
        ]),
  ];

  const selected: FallbackGapSeed[] = [];
  const seenTitles = new Set<string>();
  for (const c of candidates) {
    const key = normalizeGapTitle(c.title).toLowerCase();
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    selected.push(c);
    if (selected.length >= 5) break;
  }

  return selected.map((s, idx) => ({
    title: s.title,
    priority: options.passed === false ? "high" : "medium",
    tags: s.tags,
    summary:
      "Answer with a crisp definition, a tiny example, and one pitfall or best practice.",
    why: ensureWhyReferencesTranscript(
      s.why ??
        "aim for a crisp definition, then a tiny example, then one pitfall/best practice.",
      targetQuestions[idx] ?? targetQuestions[0],
    ),
    resources: [],
  }));
}

function ensureMinimumKnowledgeGaps(options: {
  knowledgeGaps: KnowledgeGap[];
  conversationHistory: Message[];
  config: InterviewConfig;
  score: number;
  passed?: boolean;
  technologyScores?: Record<string, number | null>;
}): KnowledgeGap[] {
  const normalizedFromModel = dedupeKnowledgeGaps(
    (Array.isArray(options.knowledgeGaps) ? options.knowledgeGaps : [])
      .map((g) => {
        const modelTags = sanitizeModelTags(g.tags);
        const tags = modelTags.length > 0 ? modelTags : [];
        const baseTitle = normalizeGapTitle(g.title);
        const fromTitle = isAcceptableGapTitle(baseTitle)
          ? normalizeGrowthTitle(baseTitle)
          : "";
        const title =
          fromTitle.length > 0
            ? fromTitle
            : tags.length > 0
              ? buildFallbackTitleFromTags(tags)
              : "";
        if (!title) return null;

        // Skip gaps for topics that were well-answered
        if (options.technologyScores) {
          for (const [tech, score] of Object.entries(
            options.technologyScores,
          )) {
            if (score !== null && score >= 85) {
              const lowerTech = tech.toLowerCase();
              if (
                title.toLowerCase().includes(lowerTech) ||
                tags.some((t) => t.toLowerCase().includes(lowerTech))
              ) {
                return null;
              }
            }
          }
        }

        return { ...g, title, tags };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null),
  );

  if (normalizedFromModel.length >= 2) return normalizedFromModel.slice(0, 5);

  const fallback = buildFallbackKnowledgeGaps({
    conversationHistory: options.conversationHistory,
    config: options.config,
    score: options.score,
    passed: options.passed,
    technologyScores: options.technologyScores,
  });

  const merged = dedupeKnowledgeGaps([
    ...normalizedFromModel,
    ...fallback.map((g) => ({
      ...g,
      title: normalizeGrowthTitle(g.title) || g.title,
    })),
  ]);
  return merged.slice(0, 5);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeApiResponse>> {
  try {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    // Parse and validate request
    const body = (await request.json()) as AnalyzeApiRequest;
    const { conversationHistory, interviewConfig, questionIds } = body;

    // Validate required fields
    if (
      !conversationHistory ||
      !Array.isArray(conversationHistory) ||
      conversationHistory.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No conversation history provided" },
        { status: 400 },
      );
    }

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "No interview configuration provided" },
        { status: 400 },
      );
    }

    // Validate interview configuration
    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      console.error("❌ Analysis configuration validation failed:", {
        errors: configValidation.errors,
        config: interviewConfig,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
          details: configValidation.errors,
        },
        { status: 400 },
      );
    }

    // Analyze response quality
    const responseAnalysis = analyzeResponseQuality(conversationHistory);

    // Extract tags from all questions actually asked to improve resource matching
    const askedQuestions = await Promise.all(
      (questionIds ?? []).map((id) => getQuestionById(id)),
    );

    // Generate analysis prompts
    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
      responseAnalysis,
      askedQuestions,
    );

    let analysisText: string;
    let usage:
      | {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        }
      | undefined;

    // Try to get AI analysis
    if (isAvailable(aiClient)) {
      const aiResponse = await generateAnalysis(
        aiClient,
        systemPrompt,
        analysisPrompt,
      );

      if (aiResponse.success) {
        analysisText = aiResponse.content;
        usage = aiResponse.usage;
      } else {
        console.error(
          "AI analysis failed, falling back to mock:",
          aiResponse.error,
        );
        analysisText = generateMockAnalysisResponse(
          interviewConfig,
          responseAnalysis,
        );
      }
    } else {
      console.warn("AI service not available, using mock analysis");
      analysisText = generateMockAnalysisResponse(
        interviewConfig,
        responseAnalysis,
      );
    }

    // Parse analysis into structured feedback
    const feedback: InterviewResults = parseAnalysis(
      analysisText,
      responseAnalysis,
      interviewConfig,
    );

    if (feedback.technologyScores && interviewConfig.technologies?.length) {
      const transcript = conversationHistory
        .map((m) => m.content)
        .join("\n")
        .toLowerCase();

      const next: Record<string, number | null> = {};
      for (const tech of interviewConfig.technologies.filter(Boolean)) {
        const normalized = tech.trim().toLowerCase();
        if (!normalized) continue;

        const mentioned = transcript.includes(normalized);
        next[tech] = mentioned
          ? (feedback.technologyScores[tech] ?? null)
          : null;
      }

      feedback.technologyScores = next;
    }

    const knowledgeGaps: KnowledgeGap[] = Array.isArray(feedback.knowledgeGaps)
      ? feedback.knowledgeGaps
      : [];

    // Extract tags from all questions actually asked to improve resource matching

    const allQuestionTags = Array.from(
      new Set(askedQuestions.flatMap((q) => q?.tags ?? [])),
    );

    console.info(
      "[analyze] allQuestionTags from asked questions:",
      allQuestionTags,
    );
    console.info(
      "[analyze] knowledgeGaps from model:",
      knowledgeGaps.map((g) => ({ title: g.title, tags: g.tags })),
    );

    const enrichedKnowledgeGapsFromModel: KnowledgeGap[] = await Promise.all(
      knowledgeGaps.map(async (gap) => {
        // If an asked question has a tag or title that overlaps with the gap's topic,
        // include it to bridge "general AI tags" with "specific bank tags".
        const matchingQuestions = askedQuestions.filter((q) => {
          if (!q) return false;
          const qTags = q.tags ?? [];
          const qTitle = (q.title ?? "").toLowerCase();
          const derivedGapTags = deriveTagsFromTitle(gap.title);

          const matchesByTags = gap.tags.some((gt) => {
            const lowerGt = gt.toLowerCase();
            return (
              qTags.some(
                (qt) =>
                  qt.toLowerCase().includes(lowerGt) ||
                  lowerGt.includes(qt.toLowerCase()),
              ) ||
              q.id.toLowerCase().includes(lowerGt) ||
              qTitle.includes(lowerGt)
            );
          });

          const matchesByTitleKeywords = derivedGapTags.some((t) => {
            const lowerT = t.toLowerCase();
            return (
              qTags.some((qt) => qt.toLowerCase().includes(lowerT)) ||
              q.id.toLowerCase().includes(lowerT) ||
              qTitle.includes(lowerT)
            );
          });

          return matchesByTags || matchesByTitleKeywords;
        });

        const matchingQuestionTags = Array.from(
          new Set(matchingQuestions.flatMap((q) => q?.tags ?? [])),
        );

        const matchingQuestionIds = matchingQuestions.map((q) => q!.id);

        // Search with AI-provided tags, bridged question tags, and specific matching question IDs
        const searchTags = Array.from(
          new Set([
            ...gap.tags,
            ...matchingQuestionTags,
            ...matchingQuestionIds,
          ]),
        );
        const resources = await getResourcesByTags(searchTags, 3);
        console.info("[analyze] gap resource enrichment:", {
          gapTitle: gap.title,
          gapTags: gap.tags,
          matchingQuestionTags,
          matchingQuestionIds,
          searchTags,
          resourceCount: resources.length,
          resourceIds: resources.map((r) => r.id),
        });
        return { ...gap, resources };
      }),
    );

    const ensuredKnowledgeGaps = ensureMinimumKnowledgeGaps({
      knowledgeGaps: enrichedKnowledgeGapsFromModel,
      conversationHistory,
      config: interviewConfig,
      score: feedback.score,
      passed: feedback.passed,
      technologyScores: feedback.technologyScores ?? undefined,
    });

    // Second enrichment pass for gaps that might still need resources
    const reEnrichedGaps: KnowledgeGap[] = await Promise.all(
      ensuredKnowledgeGaps.map(async (gap) => {
        if (Array.isArray(gap.resources) && gap.resources.length > 0) {
          return gap;
        }

        const matchingQuestions = askedQuestions.filter((q) => {
          if (!q) return false;
          const qTags = q.tags ?? [];
          return gap.tags.some((gt) => {
            const lowerGt = gt.toLowerCase();
            return (
              qTags.some(
                (qt) =>
                  qt.toLowerCase().includes(lowerGt) ||
                  lowerGt.includes(qt.toLowerCase()),
              ) || q.id.toLowerCase().includes(lowerGt)
            );
          });
        });

        const matchingQuestionTags = Array.from(
          new Set(matchingQuestions.flatMap((q) => q?.tags ?? [])),
        );
        const matchingQuestionIds = matchingQuestions.map((q) => q!.id);

        const searchTags = Array.from(
          new Set([
            ...gap.tags,
            ...matchingQuestionTags,
            ...matchingQuestionIds,
          ]),
        );
        const resources = await getResourcesByTags(searchTags, 3);
        console.info("[analyze] re-enrichment for gap without resources:", {
          gapTitle: gap.title,
          searchTags,
          resourceCount: resources.length,
        });
        return { ...gap, resources };
      }),
    );

    const normalizedKnowledgeGaps: KnowledgeGap[] = reEnrichedGaps.map((g) => {
      const rawTitle = normalizeGapTitle(g.title);
      const title = formatKnowledgeGapTitle(rawTitle, g.tags);
      const sourceSummary =
        typeof g.summary === "string" && g.summary.trim().length > 0
          ? g.summary
          : deriveGapSummaryFromWhy(g.why);
      const summary = formatKnowledgeGapDescription({
        title,
        tags: g.tags,
        priority: g.priority,
        summary: sourceSummary,
      });
      return { ...g, title, summary };
    });

    const enrichedFeedback: InterviewResults = {
      ...feedback,
      ...(normalizedKnowledgeGaps.length > 0
        ? { knowledgeGaps: normalizedKnowledgeGaps }
        : {}),
    };

    let rawPresentation: string | undefined;
    let presentation: PresentationCopy | undefined;

    if (isAvailable(aiClient)) {
      const system = generatePresentationSystemPrompt(interviewConfig);
      const user = buildPresentationUserPrompt({
        config: interviewConfig,
        results: enrichedFeedback,
      });

      const attempt = async (userPrompt: string) => {
        const aiResponse = await generateAnalysis(aiClient, system, userPrompt);
        if (!aiResponse.success) return null;
        rawPresentation = aiResponse.content;

        if (process.env.NODE_ENV !== "production") {
          console.info("[analyze] rawPresentation", {
            requestId,
            length: rawPresentation.length,
            preview: truncateForLog(rawPresentation, 1800),
          });
        }

        const parsed = safeParseJsonObject(aiResponse.content);
        if (!isPresentationCopy(parsed)) return null;
        return parsed;
      };

      const first = await attempt(user);
      if (first) {
        presentation = first;
      } else {
        const retry = await attempt(
          `${user}

Your previous output was invalid.

Repair rules:
- Output STRICT JSON only (no markdown, no prose).
- Use the exact schema.
- Do not add extra keys.
`,
        );
        if (retry) presentation = retry;
      }
    }

    const normalizedPresentation = (() => {
      if (!presentation) return undefined;

      const focusAreas = Array.isArray(presentation.focusAreas)
        ? presentation.focusAreas
            .map((fa) => {
              const titleRaw = typeof fa.title === "string" ? fa.title : "";
              const title = normalizeGrowthTitle(
                formatKnowledgeGapTitle(titleRaw, fa.tags),
              );
              const whyRaw = typeof fa.why === "string" ? fa.why : "";
              const why = normalizePresentationWhy(whyRaw);
              const tags = Array.isArray(fa.tags)
                ? fa.tags
                    .map((t) => (typeof t === "string" ? t.trim() : ""))
                    .filter(Boolean)
                : undefined;

              return {
                ...fa,
                title,
                why,
                ...(tags ? { tags } : {}),
              };
            })
            .filter(
              (x): x is NonNullable<typeof x> =>
                typeof x.title === "string" &&
                x.title.trim().length > 0 &&
                isAcceptablePresentationFocusTitle(x.title),
            )
            .reduce<PresentationCopy["focusAreas"]>((acc, item) => {
              const key = normalizeGapTitle(item.title).toLowerCase();
              if (!key) return acc;
              if (
                acc.some(
                  (x) => normalizeGapTitle(x.title).toLowerCase() === key,
                )
              )
                return acc;
              acc.push(item);
              return acc;
            }, [])
            .slice(0, 3)
        : presentation.focusAreas;

      const plan = Array.isArray(presentation.plan)
        ? presentation.plan
            .map((line) =>
              typeof line === "string"
                ? normalizePresentationPlanLine(line)
                : "",
            )
            .filter(Boolean)
        : presentation.plan;

      return {
        ...presentation,
        ...(Array.isArray(focusAreas) ? { focusAreas } : {}),
        ...(Array.isArray(plan) ? { plan } : {}),
      };
    })();

    const finalFeedback: InterviewResults = normalizedPresentation
      ? { ...enrichedFeedback, presentation: normalizedPresentation }
      : enrichedFeedback;

    return NextResponse.json({
      success: true,
      feedback: finalFeedback,
      rawAnalysis: analysisText,
      rawPresentation,
      usage,
    });
  } catch (error) {
    console.error("❌ Analysis API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Provide specific error messages
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { success: false, error: "Analysis request timed out" },
          { status: 408 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze interview responses. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Generate analysis prompt with conversation context
 */
function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
  askedQuestions?: (any | null)[],
): string {
  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  const passingThreshold = getPassingThreshold(config.seniority);

  return `Analyze this ${config.interviewType} interview for a ${config.seniority}-level ${config.position} position.

INTERVIEW TRANSCRIPT:
${conversation}

${
  askedQuestions?.length
    ? `EXPECTED QUESTION TOPICS (from bank):
${askedQuestions.map((q, i) => `${i + 1}. ${q?.title || "Unknown"}`).join("\n")}

`
    : ""
}

RESPONSE QUALITY ANALYSIS:
📊 Total Questions Asked: ${responseAnalysis.totalQuestions}
📝 Total Responses Given: ${responseAnalysis.totalResponses}
❌ Skipped Questions: ${responseAnalysis.skippedQuestions}
🚫 "I Don't Know" Responses: ${responseAnalysis.noAnswerResponses}
⚠️ Gibberish/Single-Word Responses: ${responseAnalysis.gibberishResponses}
📏 Very Short Responses (<20 chars): ${responseAnalysis.veryShortResponses}
✅ Substantive Responses: ${responseAnalysis.substantiveResponses}
📈 Effective Response Rate: ${responseAnalysis.effectiveResponseRate.toFixed(1)}%
🎯 Quality Score: ${responseAnalysis.qualityScore.toFixed(1)}/100
📊 Average Response Length: ${responseAnalysis.averageResponseLength.toFixed(0)} characters

CRITICAL ASSESSMENT FLAGS:
${
  responseAnalysis.substantiveResponses === 0
    ? "🚨 CRITICAL: ZERO substantive responses. This is an automatic FAIL. Score must be 0-10."
    : responseAnalysis.effectiveResponseRate < 30
      ? "🚨 CRITICAL: Under 30% effective responses. Strong FAIL likely. Maximum score should be 15-25."
      : responseAnalysis.effectiveResponseRate < 50
        ? "⚠️ WARNING: Under 50% effective responses. FAIL likely. Maximum score should be 25-40."
        : responseAnalysis.effectiveResponseRate < 70
          ? "⚠️ CAUTION: Under 70% effective responses. May fail if responses lack depth. Score caps around 50-60."
          : "✓ Adequate response rate. Now assess actual quality and correctness of content."
}

PASSING CRITERIA:
- Required Score: ${passingThreshold.score}/100
- ${passingThreshold.description}

INSTRUCTIONS:
1. Read EVERY response carefully
2. Score based ONLY on actual knowledge demonstrated
3. Give ZERO points for "I don't know", gibberish, or wrong answers
4. Identify specific examples of good and bad responses
5. Make a clear PASS or FAIL decision
6. Explain your decision with evidence

Remember: Be honest and strict. A bad hire costs companies hundreds of thousands of dollars. Only pass candidates who truly demonstrated the required knowledge.`;
}

function getPassingThreshold(seniority: string) {
  const thresholds = {
    entry: {
      score: 55,
      description:
        "Entry-level candidates must demonstrate basic understanding of fundamental concepts and eagerness to learn.",
    },
    junior: {
      score: 60,
      description:
        "Junior candidates must demonstrate basic understanding of core concepts and show learning potential.",
    },
    mid: {
      score: 70,
      description:
        "Mid-level candidates must show solid technical knowledge and independent problem-solving ability.",
    },
    senior: {
      score: 80,
      description:
        "Senior candidates must demonstrate deep expertise, architectural thinking, and leadership capability.",
    },
  };

  return thresholds[seniority as keyof typeof thresholds] || thresholds.mid;
}
