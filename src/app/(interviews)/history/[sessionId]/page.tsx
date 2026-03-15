"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Clock,
  Clock9,
  Code,
  FileDown,
  Lightbulb,
  Star,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FiLink2 } from "react-icons/fi";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { AiFeedbackCard } from "@/components/common/molecules/ai-feedback-card";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { ScoreRadialChart } from "@/components/results/atoms/score-radial-chart";
import {
  CATEGORY_MAX,
  type CategoryKey,
  DetailedScoreCard,
} from "@/components/results/molecules/detailed-score-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  INTERVIEW_MODES,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import {
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { DatabaseService } from "@/lib/database";
import {
  formatKnowledgeGapBlurb,
  formatKnowledgeGapTitle,
} from "@/lib/utils/interview-normalizers";
import {
  clampFinite,
  getMarkdownText,
  getPriorityClass,
  getPriorityLabel,
  isGeneratedSearchResourceUrl,
} from "@/lib/utils/results-content-utils";
import { useAuth } from "@/providers/auth-provider";
import type { InterviewSession } from "@/types/firestore";
import type { Question } from "@/types/practice-question";

// Utility function to safely handle termination reasons
function getTerminationTitle(reason: unknown): string {
  const validReasons = [
    "language",
    "profanity",
    "inappropriate-behavior",
  ] as const;

  if (typeof reason !== "string" || !validReasons.includes(reason as any)) {
    throw new Error(`Unknown termination reason: ${reason}`);
  }

  switch (reason) {
    case "language":
      return "Interview terminated: language";
    case "profanity":
      return "Interview terminated: inappropriate language";
    case "inappropriate-behavior":
      return "Interview terminated: inappropriate behavior";
    default: {
      // This should never be reached due to the validation above
      const _never: never = reason as never;
      throw new Error(`Unhandled termination reason: ${_never}`);
    }
  }
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

interface SessionState {
  session: InterviewSession | null;
  setSession: (session: InterviewSession | null) => void;
  loading: boolean;
  error: string | null;
}

// Custom hook for session management
function useSession(sessionId: string): SessionState {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadSession = useCallback(async () => {
    console.log("🔍 useSession.loadSession called:", {
      userUid: user?.uid,
      sessionId,
    });

    if (!user?.uid || !sessionId) {
      console.log("❌ Missing user or session ID");
      setError("Missing user or session information");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(
        "📞 Calling DatabaseService.getSession:",
        user.uid,
        sessionId,
      );
      const sessionData = await DatabaseService.getSession(user.uid, sessionId);
      console.log(
        "📋 Session data received:",
        sessionData ? "Found" : "Not found",
      );

      if (!sessionData) {
        console.log("❌ Session not found in database");
        setError("Session not found");
        setSession(null);
        return;
      }

      console.log("✅ Session loaded successfully");
      setSession(sessionData);
      setError(null);
    } catch (error) {
      console.log("💥 Error loading session:", error);
      setError("Failed to load session");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return { session, setSession, loading, error };
}

export default function SessionDetailsPage() {
  const resolvedParams = useParams();
  const sessionId = resolvedParams.sessionId as string;
  const { user, loading: authLoading } = useAuth();
  const {
    session,
    loading: sessionLoading,
    error: sessionError,
  } = useSession(sessionId);

  // Debug: Log session and user state
  console.log("Session Debug:", {
    sessionId: sessionId,
    hasSession: !!session,
    hasAnalysis: !!session?.analysis,
    hasKnowledgeGaps: !!session?.analysis?.knowledgeGaps,
    knowledgeGapsLength: session?.analysis?.knowledgeGaps?.length,
    analysisKeys: session?.analysis ? Object.keys(session.analysis) : null,
    userUid: user?.uid,
    authLoading,
    sessionLoading,
    sessionError,
  });
  const [exporting, setExporting] = useState(false);
  const [questionTitlesByText, setQuestionTitlesByText] = useState<
    Record<string, string>
  >({});
  const [practiceQuestionsById, setPracticeQuestionsById] = useState<
    Record<string, Question>
  >({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const readableMarkdownComponents = useMemo<Components>(() => {
    return {
      h1({ children }) {
        return (
          <div className="text-sm font-semibold tracking-tight text-gray-950 dark:text-gray-50 mb-2">
            {children}
          </div>
        );
      },
      h2({ children }) {
        return (
          <div className="text-sm font-semibold tracking-tight text-gray-950 dark:text-gray-50 mb-2">
            {children}
          </div>
        );
      },
      h3({ children }) {
        return (
          <div className="pt-3">
            <div className="text-sm font-semibold tracking-tight text-gray-950 dark:text-gray-50">
              {children}
            </div>
          </div>
        );
      },
      h4({ children }) {
        return (
          <div className="pt-2">
            <div className="text-sm font-medium tracking-tight text-gray-900 dark:text-gray-100">
              {children}
            </div>
          </div>
        );
      },
      p({ children }) {
        const text = getMarkdownText(children).trim().replace(/\s+/g, " ");

        const summaryLabels = [
          "DECISION:",
          "Score:",
          "Performance Level:",
        ] as const;

        const splitSummaryHeader = (() => {
          const indices = summaryLabels
            .map((label) => ({ label, idx: text.indexOf(label) }))
            .filter((x) => x.idx >= 0)
            .sort((a, b) => a.idx - b.idx);

          if (indices.length <= 1) return null;
          if (indices[0]?.idx !== 0) return null;

          const rows = indices.map((entry, i) => {
            const start = entry.idx + entry.label.length;
            const end =
              i + 1 < indices.length ? indices[i + 1]!.idx : text.length;
            const value = text.slice(start, end).trim();
            return { label: entry.label.slice(0, -1), value };
          });

          return { rows, rest: null };
        })();

        if (splitSummaryHeader) {
          return (
            <div className="space-y-1">
              {splitSummaryHeader.rows.map((row) => (
                <p
                  key={row.label}
                  className="text-sm leading-relaxed whitespace-pre-line"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    {row.label}:
                  </span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    {row.value}
                  </span>
                </p>
              ))}

              <div className="h-1" />

              {splitSummaryHeader.rest && (
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line pt-2">
                  {splitSummaryHeader.rest}
                </p>
              )}
            </div>
          );
        }

        const labelMatch = text.match(/^([A-Za-z][A-Za-z\s]{1,40}):\s*(.+)$/);

        if (labelMatch) {
          const [, label, value] = labelMatch;

          return (
            <p className="text-sm leading-relaxed whitespace-pre-line my-1 first:mt-0 last:mb-0">
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {sessionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                ) : (
                  label
                )}
                :
              </span>{" "}
              <span className="text-gray-500 dark:text-gray-400">{value}</span>
            </p>
          );
        }

        return (
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line my-1 first:mt-0 last:mb-0">
            {children}
          </p>
        );
      },
      ul({ children }) {
        return (
          <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>
        );
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
        return <strong className="font-normal">{children}</strong>;
      },
      hr() {
        return null;
      },
    };
  }, [sessionLoading]);

  const qaQuestionMarkdownComponents = useMemo<Components>(() => {
    return {
      ...readableMarkdownComponents,
      p({ children }) {
        return (
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-line my-1 first:mt-0 last:mb-0">
            {children}
          </p>
        );
      },
      li({ children }) {
        return (
          <li className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {children}
          </li>
        );
      },
    };
  }, [readableMarkdownComponents]);

  const exportPdf = async () => {
    if (!session) return;
    if (exporting) return;

    setExporting(true);
    try {
      const res = await fetch(`/api/history/${session.sessionId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const fileName = `interview-session-${session.sessionId}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const aiFeedback = useMemo(() => {
    const detailed = session?.analysis?.detailedAnalysis?.trim();
    if (detailed) return detailed;

    const responses = session?.responses ?? [];
    const unique = new Set(
      responses
        .map((r: any) => r.feedback?.trim())
        .filter((v: any): v is string => typeof v === "string" && v.length > 0),
    );

    if (unique.size === 0) return null;
    return Array.from(unique)[0] ?? null;
  }, [session?.analysis?.detailedAnalysis, session?.responses]);

  useEffect(() => {
    if (!session?.questions || session.questions.length === 0) {
      setPracticeQuestionsById({});
      return;
    }

    void (async () => {
      const ids = session.questions.map((q: any) => q.id).filter(Boolean);
      if (ids.length === 0) {
        setPracticeQuestionsById({});
        return;
      }

      const questionsById: Record<string, Question> = {};
      await Promise.all(
        ids.map(async (id: string) => {
          try {
            const res = await fetch(`/api/practice/questions/${id}`);
            if (!res.ok) return null;
            const data = (await res.json()) as {
              success: boolean;
              question?: Question;
            };
            if (!data.success || !data.question) return null;
            questionsById[id] = data.question;
          } catch {
            return null;
          }
        }),
      );

      setPracticeQuestionsById(questionsById);
    })();
  }, [session?.questions]);

  useEffect(() => {
    if (!session) return;

    const main = Array.isArray(session.questions)
      ? session.questions
          .map((q: any) => (q.question ?? "").trim())
          .filter(Boolean)
      : [];
    const followUps = Array.isArray(session.questions)
      ? session.questions
          .flatMap((q: any) =>
            (q.followUps ?? []).map((f: any) => (f.question ?? "").trim()),
          )
          .filter(Boolean)
      : [];
    const unique = Array.from(new Set([...main, ...followUps]));
    if (unique.length === 0) return;

    void (async () => {
      try {
        const res = await fetch("/api/interview/question-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewConfig: session.config,
            questions: unique,
          }),
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          success: boolean;
          titles?: unknown;
        };
        if (!json.success || !Array.isArray(json.titles)) return;

        const titles = json.titles.map((t) => (typeof t === "string" ? t : ""));
        const next: Record<string, string> = {};
        for (let i = 0; i < unique.length; i += 1) {
          const q = unique[i];
          const title = titles[i]?.trim() ?? "";
          if (!q) continue;
          if (!title) continue;
          next[q] = title;
        }
        setQuestionTitlesByText(next);
      } catch {
        return;
      }
    })();
  }, [session]);

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

  if (authLoading || sessionLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  if (sessionError) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <Typography.BodyBold className="mb-4 text-xl">
                  Session Not Found
                </Typography.BodyBold>
                <p className="text-muted-foreground mb-6">{sessionError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  aria-label="Retry loading session"
                  variant="outline"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => router.push("/history")}
                  aria-label="Back to History"
                  variant="outline"
                  className="mt-4"
                >
                  Back to History
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <Typography.BodyBold className="mb-4 text-xl">
                  Session Not Found
                </Typography.BodyBold>
                <p className="text-muted-foreground mb-6">
                  Session not found or you don't have access to it.
                </p>
                <Button
                  onClick={() => router.push("/history")}
                  aria-label="Back to History"
                  variant="outline"
                >
                  Back to History
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 lg:py-8 max-w-6xl">
            {/* ============================================================ */}
            {/* MOBILE — purpose-built, not scaled from desktop             */}
            {/* ============================================================ */}
            <div className="md:hidden">
              {/* Minimal nav bar */}

              {/* Session identity */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <Typography.Caption color="secondary" className="mb-1">
                    {new Date(session.createdAt.toDate()).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                    {" · "}
                    {session.totalDuration}m
                    {session.config.specificCompany
                      ? ` · ${session.config.specificCompany}`
                      : ""}
                  </Typography.Caption>
                  <Typography.BodyBold className="text-xl text-foreground">
                    {session.config.position
                      .split(" ")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(" ")}{" "}
                    Interview
                  </Typography.BodyBold>
                </div>
                <div className="flex items-center justify-end mb-4 gap-2 ">
                  <Button
                    aria-label="Back to History"
                    onClick={() => router.push("/history")}
                    variant="outline"
                    size="icon"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label="Export PDF"
                    onClick={() => void exportPdf()}
                    variant="outline"
                    size="icon"
                    disabled={exporting}
                  >
                    <FileDown className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Config chips — no section heading on mobile */}
              {(() => {
                const positionInfo = POSITIONS.find(
                  (p: any) => p.value === session.config.position,
                );
                const seniorityInfo = SENIORITY_LEVELS.find(
                  (s: any) => s.value === session.config.seniority,
                );
                const modeInfo = INTERVIEW_MODES.find(
                  (m: any) => m.value === session.config.interviewMode,
                );
                const chips = [
                  {
                    label: positionInfo?.label || session.config.position,
                    icon: positionInfo?.icon || Code,
                  },
                  {
                    label: seniorityInfo?.label || session.config.seniority,
                    icon: seniorityInfo?.icon || Trophy,
                  },
                  { label: session.config.interviewType, icon: Target },
                  {
                    label: modeInfo?.label || session.config.interviewMode,
                    icon: modeInfo?.icon || Clock,
                  },
                  {
                    label: `${session.config.duration}m`,
                    icon: Clock9,
                  },
                  { label: session.status, icon: CheckCircle },
                ];
                return (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip, idx) => {
                        const Icon = chip.icon;
                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card "
                          >
                            <Icon className="w-3.5 h-3.5 " aria-hidden="true" />
                            <span className="text-sm font-medium text-foreground capitalize">
                              {chip.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Mobile Pass/Fail banner — compact */}
              {session.analysis?.passed !== undefined && (
                <div
                  className={`mb-6 rounded-2xl p-4 border-2 ${
                    session.analysis.passed
                      ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
                      : "border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        session.analysis.passed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {session.analysis.passed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        session.analysis.passed
                          ? "text-emerald-900 dark:text-emerald-100"
                          : "text-red-900 dark:text-red-100"
                      }`}
                    >
                      {session.analysis.passed
                        ? "Interview Passed"
                        : "Not Passed"}
                    </div>
                  </div>
                </div>
              )}

              {/* Score card — clean card, no header overhead */}
              <div className="mb-5 rounded-2xl border border-border/50 bg-card overflow-hidden">
                {(() => {
                  const overallScore =
                    typeof session.scores?.overall === "number" &&
                    session.scores.overall > 0
                      ? session.scores.overall
                      : 0;

                  if (session.analysisStatus === "ready" && session.analysis) {
                    return (
                      <DetailedScoreCard
                        withCard={false}
                        score={overallScore}
                        passed={session.analysis.passed}
                        summary={
                          session.analysis.summary && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={readableMarkdownComponents}
                              >
                                {session.analysis.summary}
                              </ReactMarkdown>
                            </div>
                          )
                        }
                        categoryScores={(() => {
                          const rawCat = session.analysis?.categoryScores;
                          return rawCat
                            ? {
                                technical: clampFinite(
                                  rawCat.technical,
                                  0,
                                  CATEGORY_MAX.technical,
                                ),
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
                              }
                            : getCategoryScores(overallScore);
                        })()}
                        technologyScores={(() => {
                          const rawTech = session.analysis?.technologyScores;
                          return rawTech && typeof rawTech === "object"
                            ? Object.entries(rawTech)
                                .map(([tech, score]) => ({
                                  tech,
                                  score:
                                    score === null
                                      ? null
                                      : clampFinite(score, 0, 100),
                                }))
                                .filter((x) => x.tech.trim().length > 0)
                                .sort(
                                  (a, b) => (b.score ?? -1) - (a.score ?? -1),
                                )
                            : [];
                        })()}
                      />
                    );
                  }

                  if (
                    session.analysisStatus === "pending" ||
                    session.analysisStatus === "ready"
                  ) {
                    return (
                      <div className="p-8 flex flex-col items-center gap-4 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <div>
                          <Typography.BodyBold className="mb-1">
                            Analyzing Interview
                          </Typography.BodyBold>
                          <Typography.Caption color="secondary">
                            AI is grading your responses. Usually less than a
                            minute.
                          </Typography.Caption>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-8 text-center">
                      <Typography.Body color="secondary">
                        {session.analysisStatus === "failed"
                          ? "Score analysis failed."
                          : "Score unavailable."}
                      </Typography.Body>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ============================================================ */}
            {/* TABLET + DESKTOP LAYOUT                                       */}
            {/* ============================================================ */}
            <div className="hidden md:block mb-8">
              {/* Action buttons */}

              {/* Interview Configuration grid */}
              <div className="mb-12">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <Typography.Caption color="secondary" className="mb-1">
                      {new Date(session.createdAt.toDate()).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                      {" · "}
                      {session.totalDuration}m
                      {session.config.specificCompany
                        ? ` · ${session.config.specificCompany}`
                        : ""}
                    </Typography.Caption>
                    <Typography.BodyBold className="text-xl text-foreground">
                      {session.config.position
                        .split(" ")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}{" "}
                      Interview
                    </Typography.BodyBold>
                  </div>
                  <div className="flex items-center justify-end mb-4 gap-2 ">
                    <Button
                      aria-label="Back to History"
                      onClick={() => router.push("/history")}
                      variant="outline"
                      size="icon"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Export PDF"
                      onClick={() => void exportPdf()}
                      variant="outline"
                      size="icon"
                      disabled={exporting}
                    >
                      <FileDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {/* Config chips — no section heading on mobile */}
                {(() => {
                  const positionInfo = POSITIONS.find(
                    (p: any) => p.value === session.config.position,
                  );
                  const seniorityInfo = SENIORITY_LEVELS.find(
                    (s: any) => s.value === session.config.seniority,
                  );
                  const modeInfo = INTERVIEW_MODES.find(
                    (m: any) => m.value === session.config.interviewMode,
                  );
                  const chips = [
                    {
                      label: positionInfo?.label || session.config.position,
                      icon: positionInfo?.icon || Code,
                    },
                    {
                      label: seniorityInfo?.label || session.config.seniority,
                      icon: seniorityInfo?.icon || Trophy,
                    },
                    { label: session.config.interviewType, icon: Target },
                    {
                      label: modeInfo?.label || session.config.interviewMode,
                      icon: modeInfo?.icon || Clock,
                    },
                    {
                      label: `${session.config.duration}m`,
                      icon: Clock9,
                    },
                    { label: session.status, icon: CheckCircle },
                  ];
                  return (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {chips.map((chip, idx) => {
                          const Icon = chip.icon;
                          return (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card "
                            >
                              <Icon
                                className="w-3.5 h-3.5 "
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium text-foreground capitalize">
                                {chip.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Pass/Fail banner */}
              {session.analysis?.passed !== undefined && (
                <Card
                  className={`mb-8 border-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 ${
                    session.analysis.passed
                      ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
                      : "border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30"
                  }`}
                >
                  <CardContent className="py-8">
                    <div className="flex items-center gap-6">
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                          session.analysis.passed
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {session.analysis.passed ? (
                          <CheckCircle className="h-8 w-8" />
                        ) : (
                          <XCircle className="h-8 w-8" />
                        )}
                      </div>
                      <div
                        className={`text-3xl font-bold ${
                          session.analysis.passed
                            ? "text-emerald-900 dark:text-emerald-100"
                            : "text-red-900 dark:text-red-100"
                        }`}
                      >
                        {session.analysis.passed
                          ? "Interview Passed"
                          : "Not Passed"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Score card */}
              <Card className="mb-8 border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardContent className="pt-6">
                  {(() => {
                    const overallScore =
                      typeof session.scores?.overall === "number" &&
                      session.scores.overall > 0
                        ? session.scores.overall
                        : 0;

                    if (
                      session.analysisStatus === "ready" &&
                      session.analysis
                    ) {
                      return (
                        <DetailedScoreCard
                          withCard={false}
                          score={overallScore}
                          passed={session.analysis.passed}
                          summary={
                            session.analysis.summary && (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={readableMarkdownComponents}
                                >
                                  {session.analysis.summary}
                                </ReactMarkdown>
                              </div>
                            )
                          }
                          categoryScores={(() => {
                            const rawCat = session.analysis?.categoryScores;
                            return rawCat
                              ? {
                                  technical: clampFinite(
                                    rawCat.technical,
                                    0,
                                    CATEGORY_MAX.technical,
                                  ),
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
                                }
                              : getCategoryScores(overallScore);
                          })()}
                          technologyScores={(() => {
                            const rawTech = session.analysis?.technologyScores;
                            return rawTech && typeof rawTech === "object"
                              ? Object.entries(rawTech)
                                  .map(([tech, score]) => ({
                                    tech,
                                    score:
                                      score === null
                                        ? null
                                        : clampFinite(score, 0, 100),
                                  }))
                                  .filter((x) => x.tech.trim().length > 0)
                                  .sort((a, b) => {
                                    const aScore = a.score ?? -1;
                                    const bScore = b.score ?? -1;
                                    return bScore - aScore;
                                  })
                              : [];
                          })()}
                        />
                      );
                    }

                    if (
                      session.analysisStatus === "pending" ||
                      session.analysisStatus === "ready"
                    ) {
                      return (
                        <div className="rounded-xl border border-dashed border-border/60 bg-background/40 p-8">
                          <div className="flex flex-col items-center justify-center text-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">
                                Analyzing Interview
                              </h3>
                              <p className="text-sm text-muted-foreground m-0 max-w-md">
                                Our AI is currently grading your responses and
                                generating feedback. This usually takes less
                                than a minute.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="rounded-xl border border-border/60 bg-muted/10 p-8 text-center">
                        <Typography.Body className="text-muted-foreground">
                          {session.analysisStatus === "failed"
                            ? "Score analysis failed."
                            : "Score unavailable for this session."}
                        </Typography.Body>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {(() => {
              const termination = session.termination;
              if (!termination) return null;

              const title = getTerminationTitle(termination.reason);

              return (
                <Card className="mb-6 border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 shadow-lg">
                  <CardHeader className="px-3 pt-2 pb-0">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold leading-none text-red-900 dark:text-red-100">
                      <AlertTriangle className="size-5" />
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pt-2 pb-3">
                    <Typography.Body className="text-sm leading-relaxed text-red-700 dark:text-red-300">
                      {termination.message}
                    </Typography.Body>
                  </CardContent>
                </Card>
              );
            })()}

            {session.analysis?.knowledgeGaps &&
              session.analysis.knowledgeGaps.length > 0 && (
                <Card className="mb-6 border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardHeader className="px-3 pt-2 pb-0 gap-6">
                    <Typography.BodyBold className="text-center text-7xl">
                      {session.analysis.knowledgeGaps.length}
                    </Typography.BodyBold>
                    <Typography.Caption className="text-2xl sm:text-4xl font-bold tracking-tight text-center">
                      Knowledge Gaps & Resources
                    </Typography.Caption>
                  </CardHeader>
                  <CardContent className="px-2 pt-0 pb-1">
                    <div className="space-y-4">
                      {session.analysis.knowledgeGaps.map((gap: any) => (
                        <div key={gap.title} className="space-y-3 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-sm font-bold text-foreground">
                              {formatKnowledgeGapTitle(gap.title, gap.tags)}
                            </div>
                            <Badge
                              className={`font-semibold ${getPriorityClass(
                                gap.priority,
                              )}`}
                            >
                              {getPriorityLabel(gap.priority)}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {formatKnowledgeGapBlurb({
                              title: gap.title,
                              tags: gap.tags,
                              priority: gap.priority,
                            })}
                          </div>

                          {(() => {
                            const resources = (gap.resources ?? []).filter(
                              (r: any) => !isGeneratedSearchResourceUrl(r.url),
                            );

                            // Debug: Log the resources data
                            console.log(`Knowledge Gap: ${gap.title}`, {
                              gapData: gap, // Log the entire gap object
                              gapTitle: gap.title,
                              gapTags: gap.tags,
                              gapPriority: gap.priority,
                              gapWhy: gap.why,
                              resourceCount: resources.length,
                              resourceIds: resources.map((r: any) => ({
                                id: r.id,
                                title: r.title,
                                url: r.url,
                                tags: r.tags, // Add resource tags
                              })),
                              // Add question tags from the session
                              questionTags: session?.questions?.map(
                                (q: any) => ({
                                  id: q.id,
                                  tags: q.tags,
                                }),
                              ),
                            });

                            if (resources.length === 0) {
                              return (
                                <div className="text-sm text-muted-foreground italic">
                                  No curated links yet.
                                </div>
                              );
                            }

                            return (
                              <ul className="space-y-2">
                                {resources.map(
                                  (r: any, resourceIndex: number) => (
                                    <li
                                      key={`${gap.title}-${resourceIndex}-${r.id}`}
                                      className="text-sm"
                                    >
                                      <a
                                        className="text-gray-700 dark:text-gray-300 hover:underline flex items-center gap-2"
                                        href={r.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <FiLink2
                                          className="size-4"
                                          aria-hidden="true"
                                        />
                                        {r.title}
                                      </a>
                                    </li>
                                  ),
                                )}
                              </ul>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {session.questions && session.questions.length > 0 && (
              <Card className="mb-6 border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                {(() => {
                  const visibleQuestions = session.questions.filter(
                    (q: any) => {
                      const r = session.responses?.find(
                        (x: any) => x.questionId === q.id,
                      );

                      if (!r) return false;
                      if ((r.response ?? "").trim().length > 0) return true;
                      const score =
                        typeof r.score === "number" ? r.score : Number(r.score);
                      return Number.isFinite(score) && score > 0;
                    },
                  );

                  const qaRows: Array<{
                    type: "main" | "follow-up";
                    mainIdx: number;
                    question: any;
                    practiceQuestion: Question | null;
                    response: string | null;
                    score: number | null;
                    followUpQuestionText?: string;
                    followUpResponse?: string;
                    followUpAiExample?: string;
                  }> = [];

                  visibleQuestions.forEach((question: any, index: number) => {
                    const response = session.responses?.find(
                      (r: any) => r.questionId === question.id,
                    );

                    const practiceQuestion =
                      practiceQuestionsById[question.id] ?? null;

                    qaRows.push({
                      type: "main",
                      mainIdx: index,
                      question,
                      practiceQuestion,
                      response: response?.response ?? null,
                      score: (() => {
                        const raw = response?.score;
                        const n = typeof raw === "number" ? raw : Number(raw);
                        return Number.isFinite(n) ? n : null;
                      })(),
                    });

                    if (
                      Array.isArray(question.followUps) &&
                      question.followUps.length > 0
                    ) {
                      question.followUps.forEach((f: any) => {
                        const fQuestion = (f?.question ?? "").trim();
                        const fResponse = (f?.response ?? "").trim();
                        const fAiExampleRaw =
                          typeof (f as { aiExampleAnswer?: unknown })
                            .aiExampleAnswer === "string"
                            ? (
                                (f as { aiExampleAnswer?: string })
                                  .aiExampleAnswer ?? ""
                              ).trim()
                            : "";

                        const fAiExample = fAiExampleRaw
                          ? fAiExampleRaw
                              .replace(
                                /^\s*(Example\s+Answer|Example)\s*:\s*/i,
                                "",
                              )
                              .replace(
                                /^\s*(Example\s+Answer|Example)\s*\n+/i,
                                "",
                              )
                              .trim()
                          : "";

                        if (fQuestion.length > 0) {
                          qaRows.push({
                            type: "follow-up",
                            mainIdx: index,
                            question,
                            practiceQuestion,
                            response: null,
                            score: null,
                            followUpQuestionText: fQuestion,
                            followUpResponse: fResponse,
                            followUpAiExample: fAiExample,
                          });
                        }
                      });
                    }
                  });

                  const interviewer = session.config.specificCompany
                    ? getInterviewerForCompanyAndRole(
                        session.config.specificCompany,
                        session.config.position,
                      )
                    : getInterviewerForRole(session.config.position);

                  return (
                    <Fragment>
                      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        <div className="flex flex-col items-left mx-auto gap-4 text-left sm:text-left">
                          <div className="pt-8">
                            <Typography.Caption className="text-2xl sm:text-4xl font-bold tracking-tight text-center">
                              Answers & Transcript
                            </Typography.Caption>
                            <div className="text-sm text-muted-foreground flex items-center justify-center text-centersm:justify-start gap-2">
                              <span>
                                Conducted by <strong>{interviewer.name}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CardContent className="px-6 py-0">
                        <div className="max-w-4xl mx-auto">
                          {qaRows.map((row, rowIdx) => {
                            if (row.type === "follow-up") {
                              return (
                                <Fragment
                                  key={`${row.question.id}_followup_${rowIdx}`}
                                >
                                  {rowIdx > 0 && (
                                    <Separator className="my-0 opacity-50" />
                                  )}
                                  <Collapsible
                                    defaultOpen={false}
                                    className="group transition-all"
                                  >
                                    <CollapsibleTrigger className="w-full text-left py-6 hover:bg-muted/5 transition-colors items-center">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                            Follow-up Question
                                          </div>
                                          <div className="text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {(() => {
                                              const qText =
                                                row.followUpQuestionText?.trim() ??
                                                "";
                                              if (!qText) return "Follow-up";
                                              return (
                                                questionTitlesByText[qText] ??
                                                qText
                                              );
                                            })()}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 mt-1">
                                          <ChevronDown className="size-5 text-muted-foreground/40 transition-transform group-data-[state=open]:rotate-180" />
                                        </div>
                                      </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="pt-2 px-6 pb-6">
                                      <div className="space-y-6">
                                        {/* Interviewer Side */}
                                        <div className="flex gap-4">
                                          <div className="flex-shrink-0 mt-1">
                                            <InterviewerAvatar
                                              interviewer={interviewer}
                                              size={32}
                                            />
                                          </div>
                                          <div className="flex-1 space-y-2">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                              <span>{interviewer.name}</span>
                                              <span className="size-1 rounded-full bg-border" />
                                              <span>Interviewer</span>
                                            </div>
                                            <div className="p-4 rounded-2xl rounded-tl-none bg-muted/30 border border-border/40">
                                              <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={
                                                  qaQuestionMarkdownComponents
                                                }
                                              >
                                                {row.followUpQuestionText}
                                              </ReactMarkdown>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Candidate Side */}
                                        {(row.followUpResponse ?? "").length >
                                          0 && (
                                          <div className="flex flex-row-reverse gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                              <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                                                {user?.displayName?.[0] || "ME"}
                                              </div>
                                            </div>
                                            <div className="flex-1 space-y-2 text-right">
                                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Your Response
                                              </div>
                                              <div className="p-4 rounded-2xl rounded-tr-none bg-primary/[0.03] border border-primary/10 text-left">
                                                <div className="whitespace-pre-line text-sm">
                                                  <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={
                                                      readableMarkdownComponents
                                                    }
                                                  >
                                                    {row.followUpResponse}
                                                  </ReactMarkdown>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Example Answer */}
                                        {(row.followUpAiExample ?? "").length >
                                          0 && (
                                          <div className="pl-12 pt-2">
                                            <div className="p-4 rounded-xl border-l-2 border-primary/30 bg-primary/5 space-y-2">
                                              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                                <Lightbulb className="size-3.5" />
                                                Suggested Best Practice Answer:
                                              </div>
                                              <div className="text-sm leading-relaxed text-muted-foreground">
                                                <ReactMarkdown
                                                  remarkPlugins={[remarkGfm]}
                                                  components={
                                                    readableMarkdownComponents
                                                  }
                                                >
                                                  {row.followUpAiExample}
                                                </ReactMarkdown>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </Fragment>
                              );
                            }

                            // Main Question
                            const exampleAnswer = row.practiceQuestion
                              ? getExampleAnswer(row.practiceQuestion)
                              : null;

                            const storedAiExampleAnswer =
                              typeof row.question.aiExampleAnswer === "string"
                                ? row.question.aiExampleAnswer.trim()
                                : null;

                            const normalizedExampleAnswer = exampleAnswer
                              ? exampleAnswer
                                  .replace(
                                    /^\s*(Example\s+Answer|Example)\s*:\s*/i,
                                    "",
                                  )
                                  .replace(
                                    /^\s*(Example\s+Answer|Example)\s*\n+/i,
                                    "",
                                  )
                                  .trim()
                              : null;

                            const normalizedStoredAiExampleAnswer =
                              storedAiExampleAnswer
                                ? storedAiExampleAnswer
                                    .replace(
                                      /^\s*(Example\s+Answer|Example)\s*:\s*/i,
                                      "",
                                    )
                                    .replace(
                                      /^\s*(Example\s+Answer|Example)\s*\n+/i,
                                      "",
                                    )
                                    .trim()
                                : null;

                            const effectiveExampleAnswer =
                              normalizedExampleAnswer ??
                              normalizedStoredAiExampleAnswer ??
                              null;

                            return (
                              <Fragment key={row.question.id}>
                                {rowIdx > 0 && (
                                  <Separator className="my-0 opacity-50" />
                                )}
                                <Collapsible
                                  defaultOpen={false}
                                  className="group transition-all"
                                >
                                  <CollapsibleTrigger className="w-full text-left py-6 hover:bg-muted/5 transition-colors items-center">
                                    <div className="flex items-center gap-4">
                                      {row.score !== null && (
                                        <ScoreRadialChart
                                          score={row.score}
                                          size={48}
                                          strokeWidth={4}
                                          textSize="text-[12px]"
                                        />
                                      )}
                                      {row.score === null && row.response && (
                                        <div className="text-xs font-bold text-muted-foreground bg-muted p-1.5 rounded-lg border border-border/40">
                                          N/A
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                          {row.practiceQuestion?.title ||
                                            questionTitlesByText[
                                              row.question.question
                                            ] ||
                                            row.question.question}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                                        <ChevronDown className="size-5 text-muted-foreground/40 transition-transform group-data-[state=open]:rotate-180" />
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent className="pt-2 px-6 pb-3">
                                    <div className="space-y-6">
                                      {/* Interviewer Side */}
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                          <InterviewerAvatar
                                            interviewer={interviewer}
                                            size={32}
                                          />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <span>{interviewer.name}</span>
                                            <span className="size-1 rounded-full bg-border" />
                                            <span>Interviewer</span>
                                          </div>
                                          <div className="p-4 rounded-2xl rounded-tl-none bg-muted/30 border border-border/40">
                                            <ReactMarkdown
                                              remarkPlugins={[remarkGfm]}
                                              components={
                                                qaQuestionMarkdownComponents
                                              }
                                            >
                                              {row.question.question}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Candidate Side */}
                                      {row.response && (
                                        <div className="flex flex-row-reverse gap-4">
                                          <div className="flex-shrink-0 mt-1">
                                            <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                                              {user?.displayName?.[0] || "ME"}
                                            </div>
                                          </div>
                                          <div className="flex-1 space-y-2 text-right">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                              Your Response
                                            </div>
                                            <div className="p-4 rounded-2xl rounded-tr-none bg-primary/[0.03] border border-primary/10 text-left">
                                              <div className="whitespace-pre-line text-sm">
                                                <ReactMarkdown
                                                  remarkPlugins={[remarkGfm]}
                                                  components={
                                                    readableMarkdownComponents
                                                  }
                                                >
                                                  {row.response ||
                                                    "No response recorded"}
                                                </ReactMarkdown>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Example Answer */}
                                      {effectiveExampleAnswer && (
                                        <div className="pl-12 pt-2">
                                          <div className="p-4 rounded-xl border-l-2 border-primary/30 bg-primary/5 space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                              <Lightbulb className="size-3.5" />
                                              Suggested Best Practice Answer:
                                            </div>
                                            <div className="text-sm leading-relaxed text-muted-foreground">
                                              <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={
                                                  readableMarkdownComponents
                                                }
                                              >
                                                {effectiveExampleAnswer}
                                              </ReactMarkdown>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </Fragment>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Fragment>
                  );
                })()}
              </Card>
            )}

            {aiFeedback && (
              <div className="mb-6">
                {(() => {
                  const interviewer = session.config.specificCompany
                    ? getInterviewerForCompanyAndRole(
                        session.config.specificCompany,
                        session.config.position,
                      )
                    : getInterviewerForRole(session.config.position);

                  return (
                    <AiFeedbackCard
                      title={`${interviewer.name}'s Feedback`}
                      interviewer={interviewer}
                      detailsMarkdown={aiFeedback}
                    />
                  );
                })()}
              </div>
            )}

            {/* Analysis & Feedback */}
            {session.analysis &&
              (() => {
                const showStrengthsAndGrowth = false;

                if (!showStrengthsAndGrowth) return null;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Strengths */}
                    {session.analysis.strengths &&
                      session.analysis.strengths.length > 0 && (
                        <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xl font-bold">
                              <CheckCircle className="h-6 w-6" />
                              Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {session.analysis.strengths.map(
                                (strength: string) => (
                                  <li
                                    key={strength}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                                  >
                                    <Star className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {strength}
                                      </ReactMarkdown>
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {/* Areas for Improvement */}
                    {session.analysis.improvements &&
                      session.analysis.improvements.length > 0 && (
                        <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xl font-bold">
                              <Lightbulb className="h-6 w-6" />
                              Areas for Improvement
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {session.analysis.improvements.map(
                                (improvement: string) => (
                                  <li
                                    key={improvement}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                                  >
                                    <Target className="size-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {improvement}
                                      </ReactMarkdown>
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                );
              })()}

            {/* Summary and Recommendations */}
            {session.analysis &&
              (session.analysis.summary ||
                session.analysis.recommendations) && (
                <div className="mb-6">
                  {session.analysis.recommendations &&
                    session.analysis.recommendations.length > 0 && (
                      <Card className="border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                        <CardHeader className="px-3 pt-2 pb-0">
                          <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Lightbulb className="size-5 text-primary" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-3">
                          <ul className="space-y-3">
                            {session.analysis.recommendations.map(
                              (rec: string, index: number) => (
                                <li
                                  key={rec}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary dark:text-primary/80">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className="text-sm">{rec}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}

            {/* Action Buttons */}
            {null}
          </div>
        </main>
      </div>
    </div>
  );
}
