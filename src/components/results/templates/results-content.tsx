"use client";

import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  FileText,
  Lightbulb,
  RotateCcw,
  Target,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { AiFeedbackCard } from "@/components/common/molecules/ai-feedback-card";
import { MarkdownContent } from "@/components/common/molecules/markdown-content";
import {
  CATEGORY_MAX,
  DetailedScoreCard,
  getCategoryScores,
} from "@/components/results/molecules/detailed-score-card";
import {
  PostInterviewSurvey,
  type PostInterviewSurveyController,
} from "@/components/results/organisms/post-interview-survey";
import { ResultsDeck } from "@/components/results/organisms/results-deck";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { addUserXP } from "@/lib/services/users/user-xp";
import {
  normalizePositionValue,
  normalizeSeniorityValue,
} from "@/lib/utils/interview-normalizers";
import {
  generateAnalysisMessages,
  getResultsCopySeed,
} from "@/lib/utils/results-copy";
import { useAuth } from "@/providers/auth-provider";
import type { InterviewSession, UserProfile } from "@/types/firestore";
import type {
  InterviewConfig,
  InterviewResults,
  KnowledgeGap,
  KnowledgeGapPriority,
  TerminationReason,
} from "@/types/interview";
import type { Question } from "@/types/practice-question";

type RewardsPayload = {
  xpGained: number;
  newAchievementIds: string[];
};

function clampFinite(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function deriveOverallScoreFromSession(session: InterviewSession): number {
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

  const techScores = session.analysis?.technologyScores
    ? Object.values(session.analysis.technologyScores).filter(Number.isFinite)
    : [];
  if (techScores.length > 0) {
    const avg = techScores.reduce((sum, n) => sum + n, 0) / techScores.length;
    return clampFinite(Math.round(avg), 0, 100);
  }

  return 0;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

function mapKnowledgeGaps(
  analysis: InterviewSession["analysis"],
): KnowledgeGap[] | undefined {
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

function mapSessionToInterviewResults(
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
    categoryScores: session.scores
      ? {
          technical: session.scores.technical,
          problemSolving: session.scores.problemSolving,
          communication: session.scores.communication,
          professional: session.scores.professional,
        }
      : undefined,
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

function getPriorityLabel(priority: KnowledgeGapPriority): string {
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

function getPriorityClass(priority: KnowledgeGapPriority): string {
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

const qaMarkdownComponents: Components = {
  p({ children }) {
    return (
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line my-2">
        {children}
      </p>
    );
  },
  ul({ children }) {
    return <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="space-y-2 list-decimal pl-5 mt-1 mb-2">{children}</ol>
    );
  },
  li({ children }) {
    return (
      <li className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {children}
      </li>
    );
  },
  pre({ children }) {
    return (
      <pre className="my-2 overflow-x-auto whitespace-pre rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    );
  },
  code({ children }) {
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  strong({ children }) {
    return (
      <strong className="text-gray-900 dark:text-gray-100 font-semibold">
        {children}
      </strong>
    );
  },
  hr() {
    return null;
  },
};

const qaQuestionMarkdownComponents: Components = {
  ...qaMarkdownComponents,
  p({ children }) {
    return (
      <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-line my-2">
        {children}
      </p>
    );
  },
  li({ children }) {
    return (
      <li className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
        {children}
      </li>
    );
  },
};

function stripLinks(value: string): string {
  const withoutMarkdownLinks = value.replace(/\[([^\]]+)]\([^)]+\)/g, "$1");
  const withoutUrls = withoutMarkdownLinks.replace(/https?:\/\/\S+/g, "");
  return withoutUrls.replace(/\s{2,}/g, " ").trim();
}

function stripMarkdown(value: string): string {
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

function normalizeKnowledgeGapTitle(title: string): string {
  return title
    .trim()
    .replace(/^\s*\d+\s*[.)]\s*/g, "")
    .replace(/^\s*title\s*:\s*/i, "")
    .trim();
}

function toShortTopicTitle(raw: string): string {
  const cleaned = normalizeKnowledgeGapTitle(raw)
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const firstClause = cleaned.split(/[:.\n]/)[0]?.trim() ?? cleaned;
  const maxLen = 52;
  if (firstClause.length <= maxLen) return firstClause;
  const slice = firstClause.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 18 ? slice.slice(0, cut) : slice).trimEnd();
  return safe;
}

function shouldHideGapDescription(raw: string): boolean {
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

function getGapSummaryText(gap: { summary?: string }): string {
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

function getMarkdownText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getMarkdownText).join("");
  if (typeof node === "object" && node && "props" in node) {
    const n = node as { props?: { children?: unknown } };
    return getMarkdownText(n.props?.children);
  }
  return "";
}

function normalizeOverallSummaryMarkdown(markdown: string): string {
  return markdown.replace(/\n(?=[A-Za-z][A-Za-z\s/]{2,40}:\s*\S)/g, "\n\n");
}

const overallSummaryMarkdownComponents: Components = {
  p({ children }) {
    const labelInfo = (() => {
      const text = getMarkdownText(children).trim().replace(/\s+/g, " ");
      const match = /^([A-Za-z][A-Za-z\s/]{2,40}):\s*(.+)$/.exec(text);
      if (!match) return null;
      const [, label, value] = match;
      return { label, value };
    })();

    if (labelInfo) {
      return (
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line my-2">
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            {labelInfo.label}:
          </span>{" "}
          <span className="text-gray-500 dark:text-gray-400">
            {labelInfo.value}
          </span>
        </p>
      );
    }

    return (
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line my-2">
        {children}
      </p>
    );
  },
  ul({ children }) {
    return <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="space-y-2 list-decimal pl-5 mt-1 mb-2">{children}</ol>
    );
  },
  li({ children }) {
    return (
      <li className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {children}
      </li>
    );
  },
  pre({ children }) {
    return (
      <pre className="my-2 overflow-x-auto whitespace-pre rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    );
  },
  code({ children }) {
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  strong({ children }) {
    const text = getMarkdownText(children).trim().replace(/\s+/g, " ");
    if (text.endsWith(":")) {
      return (
        <strong className="text-gray-900 dark:text-gray-100 font-semibold">
          {children}
        </strong>
      );
    }

    return <strong className="font-normal">{children}</strong>;
  },
  hr() {
    return null;
  },
};

interface ResultsContentProps {
  user: UserData;
}

export function ResultsContent({ user: initialUser }: ResultsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, refreshUserData } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [resultsView, setResultsView] = useState<"deck" | "full">("deck");
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const justCreatedSessionIdRef = useRef<string | null>(null);
  const [savedSession, setSavedSession] = useState<InterviewSession | null>(
    null,
  );
  const [storedSession, setStoredSession] = useState<{
    questionIds?: string[];
    messages?: Array<{
      type?: "ai" | "user";
      content?: string;
      isFollowUp?: boolean;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [termination, setTermination] = useState<{
    reason: TerminationReason;
    message: string;
    at?: string | Date;
  } | null>(null);
  const [practiceQuestionIds, setPracticeQuestionIds] = useState<string[]>([]);
  const [practiceQuestionsById, setPracticeQuestionsById] = useState<
    Record<string, Question>
  >({});
  const [_answerByQuestionId, setAnswerByQuestionId] = useState<
    Record<string, string>
  >({});
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisMessages, setAnalysisMessages] = useState<string[]>([]);
  const [outcomeMessage, _setOutcomeMessage] = useState<string>("");
  const [_currentDate, setCurrentDate] = useState<string>("");
  const [copySeed, setCopySeed] = useState<number | null>(null);
  const [
    generatedExampleAnswerByQuestionId,
    _setGeneratedExampleAnswerByQuestionId,
  ] = useState<Record<string, string>>({});
  const [generatedExampleAnswers, setGeneratedExampleAnswers] = useState<
    string[]
  >([]);
  const [generatedFollowUpExampleAnswers, setGeneratedFollowUpExampleAnswers] =
    useState<string[]>([]);
  const [storedConfig, setStoredConfig] = useState<
    Pick<InterviewConfig, "position" | "seniority"> | undefined
  >(undefined);
  const [interviewConfig, setInterviewConfig] =
    useState<InterviewConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [rewardsPayload, setRewardsPayload] = useState<RewardsPayload | null>(
    null,
  );
  const backgroundClass = "bg-gradient-to-b from-background to-muted/20";
  const surveyControllerRef = useRef<PostInterviewSurveyController | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("postInterviewRewards");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return;
      const maybe = parsed as Partial<RewardsPayload>;
      const xpGained =
        typeof maybe.xpGained === "number" && Number.isFinite(maybe.xpGained)
          ? maybe.xpGained
          : null;
      const newAchievementIds = Array.isArray(maybe.newAchievementIds)
        ? maybe.newAchievementIds.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          )
        : [];

      if (xpGained === null) return;
      setRewardsPayload({ xpGained, newAchievementIds });
    } catch {
      return;
    }
  }, []);

  const getDeckCompletedKey = useCallback(
    (sessionId: string) => `resultsDeckCompleted:${sessionId}`,
    [],
  );

  const getDeckCompleted = useCallback(
    (sessionId: string): boolean => {
      try {
        return (
          window.sessionStorage.getItem(getDeckCompletedKey(sessionId)) ===
          "true"
        );
      } catch {
        return false;
      }
    },
    [getDeckCompletedKey],
  );

  const markDeckCompleted = useCallback(
    (sessionId: string) => {
      try {
        window.sessionStorage.setItem(getDeckCompletedKey(sessionId), "true");
      } catch {
        // ignore
      }
    },
    [getDeckCompletedKey],
  );

  const handleSurveyNavigation = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  const handleNavigationRequest = useCallback(
    (path: string) => {
      const controller = surveyControllerRef.current;
      if (controller) {
        controller.requestNavigation(path);
        return;
      }
      handleSurveyNavigation(path);
    },
    [handleSurveyNavigation],
  );
  const activeUserId = useMemo(
    () => authUser?.uid ?? initialUser.uid,
    [authUser?.uid, initialUser.uid],
  );
  const activeUserEmail = useMemo(
    () => authUser?.email ?? initialUser.email ?? "",
    [authUser?.email, initialUser.email],
  );

  const sessionIdFromQuery = useMemo(() => {
    const raw = searchParams.get("sessionId");
    return typeof raw === "string" && raw.trim().length > 0 ? raw : null;
  }, [searchParams]);

  // Set current date and analysis messages on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());

    const interviewSessionRaw = localStorage.getItem("interviewSession");
    const interviewConfigRaw = localStorage.getItem("interviewConfig");
    const interviewSessionId = localStorage.getItem("interviewSessionId");

    if (!interviewSessionRaw && !sessionIdFromQuery) {
      router.replace("/history");
      return;
    }

    try {
      const parsedSession = interviewSessionRaw
        ? (JSON.parse(interviewSessionRaw) as {
            questionIds?: string[];
            messages?: Array<{
              type?: "ai" | "user";
              content?: string;
              isFollowUp?: boolean;
            }>;
            termination?: {
              reason?: TerminationReason;
              message?: string;
              at?: string | Date;
            };
          })
        : null;
      setStoredSession(parsedSession);
      const questionIds = parsedSession?.questionIds ?? [];

      setPracticeQuestionIds(questionIds);

      const parsedConfig = interviewConfigRaw
        ? (JSON.parse(interviewConfigRaw) as Partial<InterviewConfig>)
        : null;

      if (
        parsedConfig?.position &&
        parsedConfig.seniority &&
        parsedConfig.interviewType &&
        parsedConfig.interviewMode &&
        typeof parsedConfig.duration === "number"
      ) {
        setInterviewConfig(parsedConfig as InterviewConfig);
      } else {
        setInterviewConfig(null);
      }

      const maybeTermination = parsedSession?.termination;
      if (
        maybeTermination?.reason &&
        typeof maybeTermination.message === "string" &&
        maybeTermination.message.trim().length > 0
      ) {
        setTermination({
          reason: maybeTermination.reason,
          message: maybeTermination.message,
          at: maybeTermination.at,
        });
      } else {
        setTermination(null);
      }

      setSavedSession(null);

      const userAnswers = (parsedSession?.messages ?? [])
        .filter((m) => m.type === "user" && m.isFollowUp !== true)
        .map((m) => (m.content ?? "").trim())
        .filter(Boolean);

      const nextAnswers: Record<string, string> = {};
      for (let i = 0; i < questionIds.length; i++) {
        const id = questionIds[i];
        const answer = userAnswers[i] ?? "";
        if (!id) continue;
        nextAnswers[id] = answer;
      }
      setAnswerByQuestionId(nextAnswers);

      if (questionIds.length > 0) {
        void (async () => {
          try {
            const questions = await Promise.all(
              questionIds.map(async (id) => {
                try {
                  const res = await fetch(`/api/practice/questions/${id}`);
                  if (!res.ok) return null;
                  const data = (await res.json()) as {
                    success: boolean;
                    question?: Question;
                  };
                  if (!data.success || !data.question) return null;
                  return data.question;
                } catch {
                  return null;
                }
              }),
            );

            const next: Record<string, Question> = {};
            for (const q of questions) {
              if (!q) continue;
              next[q.id] = q;
            }
            setPracticeQuestionsById(next);
          } catch {
            setPracticeQuestionsById({});
          }
        })();
      }
    } catch {
      setStoredSession(null);
      setPracticeQuestionIds([]);
      setPracticeQuestionsById({});
      setAnswerByQuestionId({});
      setTermination(null);
    }

    setCopySeed(
      getResultsCopySeed({
        interviewSessionId,
        interviewSessionRaw,
        interviewConfigRaw,
      }),
    );

    try {
      const parsedConfig = interviewConfigRaw
        ? (JSON.parse(interviewConfigRaw) as Partial<
            Pick<InterviewConfig, "position" | "seniority">
          >)
        : null;

      if (parsedConfig?.position && parsedConfig?.seniority) {
        setStoredConfig({
          position: normalizePositionValue(parsedConfig.position),
          seniority: normalizeSeniorityValue(parsedConfig.seniority),
        });
      }
    } catch {
      // noop
    }
  }, [router, sessionIdFromQuery]);

  const getExampleAnswer = (question: Question): string | null => {
    switch (question.type) {
      case "open":
        return question.referenceAnswers?.[0]?.text ?? null;
      case "mcq":
        return question.options?.find((o) => o.isCorrect)?.text ?? null;
      case "truefalse":
        return `${question.correctAnswer}`;
      case "matching":
      case "code":
        return null;
      default: {
        const _never: never = question;
        throw new Error(`Unhandled question type: ${_never}`);
      }
    }
  };

  const qaRows = useMemo(() => {
    if (savedSession) {
      const rows: Array<{
        type: "main" | "follow-up";
        idx: number;
        practiceQuestionId: string | null;
        questionText: string;
        yourAnswer: string;
        aiExampleAnswer: string | null;
      }> = [];

      savedSession.questions.forEach((q, idx) => {
        const response = savedSession.responses.find(
          (r) => r.questionId === q.id,
        );
        const practiceQuestionId = q.id.startsWith("q_") ? null : q.id;

        // Add main question
        rows.push({
          type: "main",
          idx,
          practiceQuestionId,
          questionText: q.question,
          yourAnswer: response?.response ?? "",
          aiExampleAnswer: q.aiExampleAnswer ?? null,
        });

        // Add follow-ups if they exist
        if (q.followUps && q.followUps.length > 0) {
          q.followUps.forEach((f) => {
            rows.push({
              type: "follow-up",
              idx: idx, // Keep associated with main question index or use -1? Use main idx for context if needed
              practiceQuestionId: null,
              questionText: f.question,
              yourAnswer: f.response,
              aiExampleAnswer: f.aiExampleAnswer ?? null,
            });
          });
        }
      });
      return rows;
    }

    const messages = Array.isArray(storedSession?.messages)
      ? storedSession.messages
      : [];

    const rows: Array<{
      type: "main" | "follow-up";
      idx: number;
      practiceQuestionId: string | null;
      questionText: string;
      yourAnswer: string;
      aiExampleAnswer: string | null;
    }> = [];

    let mainIdx = 0;
    let cursor = 0;
    let followUpIdx = 0;

    while (cursor < messages.length) {
      const ai = messages[cursor];
      const user = messages[cursor + 1];

      if (!ai || ai.type !== "ai") {
        cursor += 1;
        continue;
      }

      const aiText = (ai.content ?? "").trim();
      if (!aiText) {
        cursor += 1;
        continue;
      }

      const isFollowUp = ai.isFollowUp === true;
      if (isFollowUp) {
        // Find the last main question index to associate with
        // For now, just using the current mainIdx - 1 as the parent,
        // effectively treating it as a follow-up to the most recent question.
        // If mainIdx is 0 (first question hasn't happened?), might be edge case
        // but logic implies main question comes first.

        const responseText =
          user?.type === "user" ? (user.content ?? "").trim() : "";
        const followUpExample = (() => {
          const raw = generatedFollowUpExampleAnswers[followUpIdx];
          if (typeof raw !== "string") return null;
          const trimmed = raw.trim();
          return trimmed.length > 0 ? trimmed : null;
        })();

        rows.push({
          type: "follow-up",
          idx: Math.max(0, mainIdx - 1),
          practiceQuestionId: null,
          questionText: aiText,
          yourAnswer: responseText,
          aiExampleAnswer: followUpExample,
        });

        followUpIdx += 1;
        cursor += user?.type === "user" ? 2 : 1;
        continue;
      }

      // Main question
      const practiceQuestionId = practiceQuestionIds[mainIdx] ?? null;

      const answerContent =
        user?.type === "user" ? (user.content ?? "").trim() : "";

      rows.push({
        type: "main",
        idx: mainIdx,
        practiceQuestionId,
        questionText: aiText,
        yourAnswer: answerContent,
        aiExampleAnswer: generatedExampleAnswers[mainIdx] || null,
      });

      mainIdx += 1;
      // If user answered, skip 2 messages (AI Q + User A). If not, skip 1 (AI Q only... wait, logic above handled that?)
      // Original logic:
      // if (!user || user.type !== "user") { cursor += 1; continue; }
      // else { cursor += 2; }

      // Replicating original cursor logic:
      if (!user || user.type !== "user") {
        cursor += 1;
      } else {
        cursor += 2;
      }
    }

    return rows;
  }, [
    generatedExampleAnswers,
    generatedFollowUpExampleAnswers,
    practiceQuestionIds,
    savedSession,
    storedSession?.messages,
  ]);

  const getAiExampleAnswerForRow = (row: {
    idx: number;
    practiceQuestionId: string | null;
  }): string | null => {
    const key = row.practiceQuestionId ?? `q_${row.idx + 1}`;
    const value = generatedExampleAnswerByQuestionId[key];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  useEffect(() => {
    if (copySeed === null) return;
    const next = generateAnalysisMessages({
      seed: copySeed,
      config: storedConfig,
    });

    setAnalysisMessages(Array.isArray(next) ? next : []);
  }, [copySeed, storedConfig]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const messageCount = analysisMessages?.length ?? 0;
    if (messageCount === 0) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messageCount);
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [isAnalyzing, analysisMessages]);

  // Progress simulation effect
  useEffect(() => {
    if (!isAnalyzing) return;

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        // Simulate realistic progress - slower at start, faster in middle, slower at end
        const increment = prevProgress < 20 ? 2 : prevProgress < 80 ? 3 : 1;
        const newProgress = Math.min(prevProgress + increment, 99);
        return newProgress;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!sessionIdFromQuery) return;

    if (justCreatedSessionIdRef.current === sessionIdFromQuery) {
      justCreatedSessionIdRef.current = null;
    }

    let active = true;

    void (async () => {
      try {
        setResultsView(getDeckCompleted(sessionIdFromQuery) ? "full" : "deck");
        setIsLoadingSession(true);
        setIsAnalyzing(false);

        const session = await DatabaseService.getSession(
          activeUserId,
          sessionIdFromQuery,
        );

        if (!active) return;

        if (!session || !session.analysis) {
          router.replace("/history");
          return;
        }

        setSavedSessionId(sessionIdFromQuery);
        setSavedSession(session as InterviewSession);
        setResults(mapSessionToInterviewResults(session as InterviewSession));

        const cfg = session.config as unknown;
        if (cfg && typeof cfg === "object") {
          setInterviewConfig(cfg as InterviewConfig);
        }
      } catch (e) {
        console.error("Failed to load saved session for results:", e);
        router.replace("/history");
      } finally {
        if (active) setIsLoadingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [activeUserId, getDeckCompleted, router, sessionIdFromQuery]);

  useEffect(() => {
    if (sessionIdFromQuery) {
      setIsAnalyzing(false);
      return;
    }

    let isMounted = true;

    const loadAnalysis = async (retryCount = 0) => {
      try {
        const interviewData = localStorage.getItem("interviewSession");
        const interviewConfig = localStorage.getItem("interviewConfig");
        const interviewSessionId = localStorage.getItem("interviewSessionId");

        const clearInterviewStorage = () => {
          localStorage.removeItem("interviewSession");
          localStorage.removeItem("interviewConfig");
          localStorage.removeItem("interviewSessionId");
        };

        if (!interviewData || !interviewConfig) {
          if (retryCount < 6) {
            await new Promise((r) => setTimeout(r, 250));
            return loadAnalysis(retryCount + 1);
          }

          if (
            typeof interviewSessionId === "string" &&
            interviewSessionId.trim().length > 0
          ) {
            router.replace(`/results?sessionId=${interviewSessionId}`);
            setIsAnalyzing(false);
            return;
          }

          if (!isMounted) return;
          setError(
            "No interview data found. Please complete an interview first.",
          );
          setIsAnalyzing(false);
          return;
        }

        const session = JSON.parse(interviewData) as {
          messages?: unknown;
          startTime?: unknown;
          endTime?: unknown;
          endedEarly?: unknown;
          termination?: unknown;
          tokenUsage?: unknown;
          questionIds?: unknown;
        };
        const config = JSON.parse(interviewConfig) as InterviewConfig;

        if (!Array.isArray(session.messages) || session.messages.length === 0) {
          if (!isMounted) return;
          setError("No interview responses found to analyze.");
          setIsAnalyzing(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        let response: Response;
        try {
          response = await fetch("/api/interview/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationHistory: session.messages,
              interviewConfig: config,
            }),
            signal: controller.signal,
          });
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (
            fetchError instanceof Error &&
            fetchError.name === "AbortError" &&
            retryCount < 2
          ) {
            await new Promise((r) => setTimeout(r, 1500));
            return loadAnalysis(retryCount + 1);
          }

          throw fetchError;
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          feedback?: InterviewResults;
          error?: string;
        };

        if (!data.success || !data.feedback) {
          throw new Error(data.error || "Analysis failed");
        }

        setProgress(100);
        setResults(data.feedback);
        setInterviewConfig(config);

        // Map knowledge gaps back to questions to get example answers
        const mainExampleAnswers: string[] = [];
        const followUpExampleAnswers: string[] = [];
        let gapIdx = 0;

        (session.messages || []).forEach((m) => {
          if (m.type === "ai") {
            const gap = data.feedback?.knowledgeGaps?.[gapIdx];
            const example = gap?.exampleAnswer || "";
            if (m.isFollowUp) {
              followUpExampleAnswers.push(example);
            } else {
              mainExampleAnswers.push(example);
            }
            gapIdx++;
          }
        });

        setGeneratedExampleAnswers(mainExampleAnswers);
        setGeneratedFollowUpExampleAnswers(followUpExampleAnswers);

        const existingSessionId = localStorage.getItem("interviewSessionId");

        try {
          const nextSavedSessionId = await DatabaseService.saveInterviewResults(
            activeUserId,
            {
              ...(session as {
                messages: Array<{
                  type: string;
                  content: string;
                  isFollowUp?: boolean;
                }>;
                questionIds?: string[];
                isComplete: boolean;
              }),
              exampleAnswers: mainExampleAnswers,
              followUpExampleAnswers: followUpExampleAnswers,
              isComplete: true,
            },
            {
              position: config.position,
              seniority: config.seniority,
              interviewType: config.interviewType,
              interviewMode: config.interviewMode,
              duration: Number(config.duration),
              ...(config.specificCompany
                ? { specificCompany: config.specificCompany }
                : {}),
            },
            data.feedback,
            existingSessionId,
          );

          try {
            const shouldAwardXP = (() => {
              if (
                typeof nextSavedSessionId !== "string" ||
                nextSavedSessionId.trim().length === 0
              ) {
                return true;
              }
              const awardKey = `xpAwarded:${nextSavedSessionId}`;
              return window.sessionStorage.getItem(awardKey) !== "1";
            })();

            if (!shouldAwardXP) {
              await refreshUserData();
              return;
            }

            const durationMinutes = (() => {
              const rawDuration = (session as { totalDuration?: unknown })
                .totalDuration;
              return typeof rawDuration === "number" &&
                Number.isFinite(rawDuration)
                ? rawDuration
                : Number(config.duration);
            })();

            const xp = await addUserXP(
              activeUserId,
              data.feedback.score,
              durationMinutes,
            );

            toast.success(
              xp.newAchievements.length > 0
                ? `+${xp.xpGained} XP · ${xp.newAchievements.length} achievement${xp.newAchievements.length === 1 ? "" : "s"}`
                : `+${xp.xpGained} XP`,
            );

            if (
              typeof nextSavedSessionId === "string" &&
              nextSavedSessionId.trim().length > 0
            ) {
              window.sessionStorage.setItem(
                `xpAwarded:${nextSavedSessionId}`,
                "1",
              );
            }

            window.sessionStorage.setItem(
              "postInterviewRewards",
              JSON.stringify({
                xpGained: xp.xpGained,
                newAchievementIds: xp.newAchievements,
              } satisfies RewardsPayload),
            );
            setRewardsPayload({
              xpGained: xp.xpGained,
              newAchievementIds: xp.newAchievements,
            });
            await refreshUserData();
          } catch (xpError) {
            console.error("Error awarding XP:", xpError);
            toast.error("Failed to award XP. Please retry.");
          }

          if (!isMounted) return;
          if (typeof nextSavedSessionId === "string" && nextSavedSessionId) {
            setSavedSessionId(nextSavedSessionId);
            clearInterviewStorage();
            justCreatedSessionIdRef.current = nextSavedSessionId;
            router.replace(`/results?sessionId=${nextSavedSessionId}`);
            setResultsView("deck");
          }
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
        }
      } catch (e) {
        console.error("Analysis error:", e);
        if (!isMounted) return;
        setError("Failed to analyze interview responses");
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    };

    void loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [activeUserId, refreshUserData, router, sessionIdFromQuery]);

  // ...

  if (isLoadingSession) {
    return <LoadingPage message="Loading results..." />;
  }

  // ...

  if (isAnalyzing) {
    return (
      <main
        className={`flex-1 overflow-auto flex items-center justify-center p-4 ${backgroundClass}`}
      >
        <Card className="w-full max-w-lg border shadow-lg animate-in fade-in duration-500">
          <CardContent className="pt-16 pb-16">
            <div className="flex justify-center mb-8">
              <div className="containerForBlocks">
                <div className="loadingspinner">
                  <div id="square1"></div>
                  <div id="square2"></div>
                  <div id="square3"></div>
                  <div id="square4"></div>
                  <div id="square5"></div>
                </div>
              </div>
            </div>
            <Typography.Heading2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100 animate-in fade-in slide-in-from-top-2 duration-700">
              Analyzing Your Performance
            </Typography.Heading2>
            <Typography.Body className="text-base text-gray-600 dark:text-gray-400 text-center min-h-[3rem] mb-8 leading-relaxed px-4 animate-in fade-in duration-500">
              {analysisMessages[currentMessageIndex]}
            </Typography.Body>

            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="flex justify-between items-center">
                <Typography.CaptionMedium className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Analysis Progress
                </Typography.CaptionMedium>
                <Typography.BodyBold className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {progress}%
                </Typography.BodyBold>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <Typography.SubCaption className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Usually takes 30-90 seconds
              </Typography.SubCaption>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <main
        className={`flex-1 overflow-auto flex items-center justify-center p-4 ${backgroundClass}`}
      >
        <Card className="w-full max-w-lg border-2 border-red-200 dark:border-red-900 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-12 pb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <Typography.Heading3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Analysis Unavailable
            </Typography.Heading3>
            <Typography.Body className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
              {error}
            </Typography.Body>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="hover:scale-105 transition-transform"
              >
                <RotateCcw className="size-4 mr-2" />
                Retry Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/my-progress")}
                className="hover:scale-105 transition-transform"
              >
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ============================================================================
  // RENDER: NO RESULTS STATE
  // ============================================================================

  if (!results) {
    return (
      <main
        className={`flex-1 overflow-auto flex items-center justify-center p-4 ${backgroundClass}`}
      >
        <Card className="w-full max-w-lg border shadow-lg animate-in fade-in duration-500">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <Typography.Heading3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              No Results Available
            </Typography.Heading3>
            <Typography.Body className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-4">
              Complete an interview to receive detailed performance feedback and
              insights.
            </Typography.Body>
            <Button
              onClick={() => router.push("/configure")}
              className="hover:scale-105 transition-transform"
            >
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const terminationTitle = (() => {
    if (!termination) return null;
    switch (termination.reason) {
      case "language":
        return "Interview terminated: language";
      case "profanity":
        return "Interview terminated: inappropriate language";
      case "inappropriate-behavior":
        return "Interview terminated: inappropriate behavior";
      default: {
        const _never: never = termination.reason;
        throw new Error(`Unhandled termination reason: ${_never}`);
      }
    }
  })();

  const showDeck = resultsView === "deck" && Boolean(savedSessionId);

  const rewards = (() => {
    if (!rewardsPayload) return null;
    const achievements = ACHIEVEMENTS.filter((a) =>
      rewardsPayload.newAchievementIds.includes(a.id),
    );
    return { xpGained: rewardsPayload.xpGained, achievements };
  })();

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {showDeck ? (
          <motion.div
            key="results_deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 min-h-0 overflow-hidden"
          >
            {savedSessionId ? (
              <ResultsDeck
                results={results}
                rewards={rewards}
                onRewardsConsumed={() => {
                  window.sessionStorage.removeItem("postInterviewRewards");
                }}
                onOpenFullReport={() =>
                  router.push(`/history/${savedSessionId}`)
                }
                onDone={() => {
                  markDeckCompleted(savedSessionId);
                  setResultsView("full");
                }}
              />
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="results_full"
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex flex-1 min-h-0 flex-col"
          >
            <div className={`flex-1 min-h-0 overflow-auto ${backgroundClass}`}>
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {termination && terminationTitle && (
                  <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
                    <CardContent className="py-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            <AlertTriangle className="size-6" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">
                              {terminationTitle}
                            </div>
                            <Typography.Body className="text-sm leading-relaxed text-red-700 dark:text-red-300">
                              {termination.message}
                            </Typography.Body>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============================================================================ */}
                {/* OUTCOME DECISION BANNER */}
                {/* ============================================================================ */}
                {results.passed !== undefined && (
                  <Card
                    className={`border-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 ${
                      results.passed
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
                        : "border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30"
                    }`}
                  >
                    <CardContent className="py-8">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div
                            className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                              results.passed
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {results.passed ? (
                              <CheckCircle className="h-8 w-8" />
                            ) : (
                              <XCircle className="h-8 w-8" />
                            )}
                          </div>
                          <div className="text-center sm:text-left">
                            <div
                              className={`text-3xl font-bold mb-3 ${
                                results.passed
                                  ? "text-emerald-900 dark:text-emerald-100"
                                  : "text-red-900 dark:text-red-100"
                              }`}
                            >
                              {results.passed
                                ? "Interview Passed"
                                : "Not Passed"}
                            </div>
                            <Typography.Body
                              className={`text-lg leading-relaxed mb-2 ${
                                results.passed
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-red-700 dark:text-red-300"
                              }`}
                            >
                              {outcomeMessage}
                            </Typography.Body>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {interviewConfig && (
                  <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <User className="size-4 text-blue-600 dark:text-blue-400" />
                        Interview Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Position
                          </div>
                          <div className="text-sm font-semibold capitalize">
                            {interviewConfig.position}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Seniority
                          </div>
                          <div className="text-sm font-semibold capitalize">
                            {interviewConfig.seniority}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Interview Type
                          </div>
                          <div className="text-sm font-semibold capitalize">
                            {interviewConfig.interviewType}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Mode
                          </div>
                          <div className="text-sm font-semibold capitalize">
                            {interviewConfig.interviewMode}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Duration
                          </div>
                          <div className="text-sm font-semibold">
                            {interviewConfig.duration} minutes
                          </div>
                        </div>
                        {(interviewConfig.specificCompany ||
                          interviewConfig.company) && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Company
                            </div>
                            <div className="text-sm font-semibold">
                              {interviewConfig.specificCompany ??
                                interviewConfig.company}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============================================================================ */}
                {/* OVERALL ASSESSMENT */}
                {/* ============================================================================ */}
                {/* OVERALL ASSESSMENT (Detailed View) */}
                {/* ============================================================================ */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" />
                    <h2 className="text-xl font-bold">
                      Overall Performance Assessment
                    </h2>
                  </div>
                  <DetailedScoreCard
                    score={results.score}
                    passed={results.passed}
                    summary={(() => {
                      const summary =
                        results.overallScore?.trim() || outcomeMessage;
                      if (!summary) return null;

                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={overallSummaryMarkdownComponents}
                        >
                          {normalizeOverallSummaryMarkdown(summary)}
                        </ReactMarkdown>
                      );
                    })()}
                    categoryScores={
                      results.categoryScores
                        ? {
                            technical: clampFinite(
                              results.categoryScores.technical,
                              0,
                              CATEGORY_MAX.technical,
                            ),
                            problemSolving: clampFinite(
                              results.categoryScores.problemSolving,
                              0,
                              CATEGORY_MAX.problemSolving,
                            ),
                            communication: clampFinite(
                              results.categoryScores.communication,
                              0,
                              CATEGORY_MAX.communication,
                            ),
                            professional: clampFinite(
                              results.categoryScores.professional,
                              0,
                              CATEGORY_MAX.professional,
                            ),
                          }
                        : getCategoryScores(results.score)
                    }
                    technologyScores={
                      results.technologyScores
                        ? Object.entries(results.technologyScores)
                            .map(([tech, score]) => ({
                              tech,
                              score: clampFinite(score, 0, 100),
                            }))
                            .sort((a, b) => b.score - a.score)
                        : undefined
                    }
                  />
                </div>

                {/* ============================================================================ */}
                {/* STRENGTHS & IMPROVEMENTS GRID */}
                {/* ============================================================================ */}
                {(() => {
                  const showStrengthsAndGrowth = false;

                  if (!showStrengthsAndGrowth) return null;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-left-4">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <Award className="size-5 text-emerald-600 dark:text-emerald-400" />
                            Key Strengths Demonstrated
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {results.strengths.length > 0 ? (
                            <ul className="space-y-4">
                              {results.strengths.map((strength, index) => (
                                <li
                                  key={`strength-${index}`}
                                  className="flex items-start gap-3 group animate-in fade-in slide-in-from-left-2 duration-500"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors group-hover:scale-110 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                  <Typography.Body className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {strength}
                                  </Typography.Body>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-8">
                              <Award className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <Typography.Body className="text-sm text-gray-500 dark:text-gray-500 italic">
                                Building foundational skills - keep developing
                                your technical expertise!
                              </Typography.Body>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-right-4">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <Target className="size-5 text-amber-600 dark:text-amber-400" />
                            {results.passed === false
                              ? "Critical Development Areas"
                              : "Growth Opportunities"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {results.improvements.length > 0 ? (
                            <ul className="space-y-4">
                              {results.improvements.map(
                                (improvement, index) => (
                                  <li
                                    key={`improvement-${index}`}
                                    className="flex items-start gap-3 group animate-in fade-in slide-in-from-right-2 duration-500"
                                    style={{
                                      animationDelay: `${index * 100}ms`,
                                    }}
                                  >
                                    <div
                                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors group-hover:scale-110 ${
                                        results.passed === false
                                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                      }`}
                                    >
                                      <TrendingUp className="w-3 h-3" />
                                    </div>
                                    <Typography.Body className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {stripLinks(improvement)}
                                    </Typography.Body>
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <div className="text-center py-8">
                              <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <Typography.Body className="text-sm text-gray-500 dark:text-gray-500 italic">
                                Excellent foundation - continue building
                                advanced competencies!
                              </Typography.Body>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}

                {results.knowledgeGaps && results.knowledgeGaps.length > 0 && (
                  <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                        Knowledge Gaps & Resources
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Focus on the high-priority items first. Each gap has
                        curated links from the resource library.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {results.knowledgeGaps.map((gap, index) => (
                          <div
                            key={`${gap.title}-${index}`}
                            className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {toShortTopicTitle(gap.title)}
                              </div>
                              <Typography.CaptionMedium
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(
                                  gap.priority,
                                )}`}
                              >
                                {getPriorityLabel(gap.priority)}
                              </Typography.CaptionMedium>
                            </div>

                            {(() => {
                              const summary = getGapSummaryText(gap);
                              if (!summary) return null;
                              return (
                                <MarkdownContent
                                  className="text-gray-700 dark:text-gray-300 mb-3"
                                  markdown={gap.summary ?? ""}
                                />
                              );
                            })()}

                            {gap.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {gap.tags.map((tag) => (
                                  <Typography.Caption
                                    key={tag}
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  >
                                    {tag}
                                  </Typography.Caption>
                                ))}
                              </div>
                            )}

                            {gap.resources.length > 0 ? (
                              <ul className="space-y-2">
                                {gap.resources.map((r) => (
                                  <li key={r.id} className="text-sm">
                                    <a
                                      className="text-blue-700 dark:text-blue-300 hover:underline"
                                      href={r.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {r.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-500 italic">
                                No resources found for these tags yet.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {qaRows.length > 0 && (
                  <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <Lightbulb className="size-5 text-amber-600 dark:text-amber-400" />
                        Questions & Example Answers
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Practice-library examples to benchmark your responses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {qaRows.map((row, uniqueRowIdx) => {
                          const q = row.practiceQuestionId
                            ? (practiceQuestionsById[row.practiceQuestionId] ??
                              null)
                            : null;
                          const example =
                            (q ? getExampleAnswer(q) : null) ??
                            row.aiExampleAnswer ??
                            getAiExampleAnswerForRow(row);
                          const prompt = row.questionText.trim() || null;
                          const yourAnswer = row.yourAnswer.trim() || null;

                          return (
                            <Collapsible
                              key={
                                row.practiceQuestionId ?? `row_${uniqueRowIdx}`
                              }
                              defaultOpen={false}
                              className={`border-2 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow ${
                                row.type === "follow-up"
                                  ? "border-l-4 border-l-blue-500/50 bg-gradient-to-br from-blue-50/50 to-blue-50/10 border-y-border/50 border-r-border/50 dark:from-blue-950/20 dark:to-blue-950/5"
                                  : "border-border/50 bg-gradient-to-br from-card to-card/50"
                              }`}
                            >
                              <CollapsibleTrigger className="w-full text-left group">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                                    {row.type === "main" ? (
                                      <Badge
                                        variant="default"
                                        className="font-semibold"
                                      >
                                        Question {row.idx + 1}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="secondary"
                                        className="font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                                      >
                                        Follow-up
                                      </Badge>
                                    )}
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                      {row.type === "main" && q?.title
                                        ? q.title
                                        : prompt
                                          ? prompt.slice(0, 60) +
                                            (prompt.length > 60 ? "..." : "")
                                          : "Question Details"}
                                    </div>
                                  </div>
                                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="pt-4">
                                <div className="whitespace-pre-line mb-3">
                                  {prompt ? (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={qaQuestionMarkdownComponents}
                                    >
                                      {prompt}
                                    </ReactMarkdown>
                                  ) : (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Question prompt unavailable.
                                    </div>
                                  )}
                                </div>

                                {yourAnswer ? (
                                  <>
                                    <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                      <User className="size-4 text-primary" />
                                      Your Response:
                                    </div>
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                      <div className="whitespace-pre-line text-sm">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={qaMarkdownComponents}
                                        >
                                          {yourAnswer}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    No response recorded.
                                  </div>
                                )}

                                <Separator className="my-5" />

                                {example ? (
                                  <div>
                                    <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                      <Lightbulb className="size-4 text-primary" />
                                      Example Answer:
                                    </div>
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                      <div className="whitespace-pre-line text-sm">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={qaMarkdownComponents}
                                        >
                                          {example}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {q
                                      ? "No example answer available for this question yet."
                                      : "No example answer available."}
                                  </div>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(Boolean(results.overallScore?.trim()) ||
                  Boolean(results.detailedAnalysis?.trim()) ||
                  results.strengths.length > 0 ||
                  results.improvements.length > 0) && (
                  <AiFeedbackCard
                    title="AI Feedback"
                    icon={<FileText className="size-4" />}
                    summaryMarkdown={null}
                    strengths={null}
                    improvements={results.improvements}
                    detailsMarkdown={results.detailedAnalysis}
                  />
                )}

                {/* ============================================================================ */}
                {/* DETAILED PERFORMANCE ANALYSIS */}
                {/* ============================================================================ */}

                {/* ============================================================================ */}
                {/* ACTION BUTTONS */}
                {/* ============================================================================ */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Button
                    onClick={() => handleNavigationRequest("/configure")}
                    variant={results.passed ? "default" : "outline"}
                    className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    {results.passed ? "Take Another Interview" : "Try Again"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleNavigationRequest("/history")}
                    className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
                  >
                    <BookOpen className="size-4 mr-2" />
                    View Interview History
                  </Button>
                </div>
              </div>
              <PostInterviewSurvey
                activeUserId={activeUserId}
                activeUserEmail={activeUserEmail}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                results={results}
                refreshUserData={refreshUserData}
                onNavigate={handleSurveyNavigation}
                controllerRef={surveyControllerRef}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
