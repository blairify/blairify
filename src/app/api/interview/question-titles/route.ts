import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateAnalysis,
  isAvailable,
} from "@/lib/services/ai/ai-client";
import type { InterviewConfig } from "@/types/interview";

export const runtime = "nodejs";

type QuestionTitlesRequest = {
  interviewConfig: InterviewConfig;
  questions: string[];
};

function truncateForLog(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n…(truncated)`;
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

function isValidTitlesResponse(value: unknown): value is { titles: string[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.titles)) return false;
  const titles = v.titles as unknown[];
  return titles.every((t) => typeof t === "string");
}

function buildSystemPrompt(config: InterviewConfig): string {
  return `You are a senior interview coach.

Your task: turn interviewer question text into short topic titles.

Hard rules:
- Output STRICT JSON only. No markdown. No extra keys.
- Do NOT quote the transcript.
- Do NOT include "you", "your", "we", "let's", "since", "when I asked", "in your answer", "and why".
- Titles must be noun phrases, 2-5 words, Title Case.
- No commas, no question marks, no trailing fragments.
- No generic placeholders like "This Topic".
- Titles must be unique; if two questions are similar, choose different labels.

Quality bar (critical):
- Output must be a clean topic label. NEVER output sentence fragments.
- NEVER end with: "in", "in the", "in a", "in an", "of", "of the", "for", "for the", "to", "to the", "with", "with the", "and", "or", "the", "a", "an".

Examples (good):
- "CrashLoopBackOff Triage"
- "Exit Code 137 Debugging"
- "Kubernetes Deployment Troubleshooting"
- "Java Class Inheritance"
Examples (bad):
- "You access parent member in the"
- "Let’s try a different scenario"
- "How would you diagnose"
- "This topic"

Output format:
{ "titles": string[] }

Context: ${config.seniority}-level ${config.position} (${config.interviewType}).`;
}

function buildUserPrompt(questions: string[]): string {
  return `Rewrite each interviewer question into a short topic title.

Input questions (keep order):
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
}

function extractCanonicalQuestion(raw: string): string {
  const compact = raw.replace(/\s+/g, " ").trim();
  if (!compact) return "";

  const dropLeadingShortNonQuestionLine = (value: string): string => {
    const lines = value
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return value;

    const first = lines[0] ?? "";
    const restJoined = lines.slice(1).join(" ").trim();

    const firstWordCount = first.split(/\s+/).filter(Boolean).length;
    const restWordCount = restJoined.split(/\s+/).filter(Boolean).length;

    const isShortNonQuestion =
      firstWordCount > 0 && firstWordCount <= 8 && !first.includes("?");
    const looksLikePromptAfter = restWordCount >= 12;

    if (!isShortNonQuestion || !looksLikePromptAfter) return value;
    return restJoined;
  };

  const withoutLeadingJunk = dropLeadingShortNonQuestionLine(raw);
  const normalized = withoutLeadingJunk.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const dropPrefixes = (value: string): string =>
    value
      .replace(
        /^i\s+understand\s+that\s+wasn['’]t\s+something\s+you\s+had\s+an\s+immediate\s+answer\s+for\.?\s*/i,
        "",
      )
      .replace(/^no\s+worries\.?\s*/i, "")
      .replace(/^all\s+good\.?\s*/i, "")
      .replace(/^okay\.?\s*/i, "")
      .replace(/^let['’]s\s+try\s+(?:a\s+)?different\s+scenario\s*:\s*/i, "")
      .replace(/^let['’]s\s+try\s+another\s+scenario\s*:\s*/i, "")
      .replace(/^let['’]s\s+move\s+to\s+something\s+else\s*:\s*/i, "")
      .trim();

  const cleaned = dropPrefixes(normalized);

  const questionSentences = cleaned
    .split(/(?<=[?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.includes("?"));

  const lastQuestion = questionSentences.at(-1);
  if (lastQuestion) return lastQuestion;

  const parts = cleaned
    .split(/(?:\n\n+|\s{2,})/)
    .map((s) => s.trim())
    .filter(Boolean);
  const lastPart = parts.at(-1);
  return lastPart ?? cleaned;
}

function fallbackTitle(question: string): string {
  const compact = question.replace(/\s+/g, " ").trim();
  if (!compact) return "Question";
  const clause = compact.split(/[.?!]/)[0]?.trim() ?? compact;
  return clause.length > 52 ? `${clause.slice(0, 52)}…` : clause;
}

function isValidTitle(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (t.length > 60) return false;
  if (/[?.,]/.test(t)) return false;

  const lower = t.toLowerCase();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  if (wordCount < 2 || wordCount > 5) return false;

  const bannedSubstrings = [
    "let's",
    "lets ",
    "since ",
    "when i asked",
    "in your answer",
    "and why",
    "how would you",
    "what's your",
    "what is ",
    "what are ",
    "can you ",
    "could you ",
  ] as const;
  if (bannedSubstrings.some((b) => lower.includes(b))) return false;

  if (/^you\b/i.test(t)) return false;

  const badEndings = [
    " in",
    " in the",
    " in a",
    " in an",
    " of",
    " of the",
    " for",
    " for the",
    " to",
    " to the",
    " with",
    " with the",
    " and",
    " or",
    " the",
    " a",
    " an",
  ] as const;
  if (badEndings.some((e) => lower.endsWith(e))) return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const body = (await request.json()) as Partial<QuestionTitlesRequest>;

    if (!body?.interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Missing interviewConfig" },
        { status: 400 },
      );
    }

    const questions = Array.isArray(body.questions)
      ? body.questions
          .map((q) => (typeof q === "string" ? q.trim() : ""))
          .filter(Boolean)
      : [];

    if (questions.length === 0) {
      return NextResponse.json({ success: true, titles: [] });
    }

    const canonicalQuestions = questions.map((q) => {
      const picked = extractCanonicalQuestion(q);
      return picked.trim().length > 0 ? picked : q;
    });

    if (!isAvailable(aiClient)) {
      return NextResponse.json({
        success: true,
        titles: canonicalQuestions.map(fallbackTitle),
      });
    }

    const systemPrompt = buildSystemPrompt(body.interviewConfig);
    const userPrompt = buildUserPrompt(canonicalQuestions);

    const res = await generateAnalysis(aiClient, systemPrompt, userPrompt);
    if (!res.success) {
      return NextResponse.json({
        success: true,
        titles: canonicalQuestions.map(fallbackTitle),
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[question-titles] raw", {
        requestId,
        length: res.content.length,
        preview: truncateForLog(res.content, 1800),
      });
    }

    const parsed = safeParseJsonObject(res.content);
    if (!isValidTitlesResponse(parsed)) {
      return NextResponse.json({
        success: true,
        titles: canonicalQuestions.map(fallbackTitle),
      });
    }

    const titles = parsed.titles
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .map((t, i) => {
        const fallback = fallbackTitle(canonicalQuestions[i] ?? "");
        if (!t) return fallback;
        return isValidTitle(t) ? t : fallback;
      })
      .slice(0, questions.length);

    return NextResponse.json({ success: true, titles });
  } catch (error) {
    console.error("Question titles API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate question titles" },
      { status: 500 },
    );
  }
}
