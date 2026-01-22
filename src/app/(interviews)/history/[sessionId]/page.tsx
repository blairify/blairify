"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Code,
  FileDown,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  XCircle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { AiFeedbackCard } from "@/components/common/molecules/ai-feedback-card";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
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
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";
import type { InterviewQuestion, InterviewSession } from "@/types/firestore";
import type { Question } from "@/types/practice-question";

function getPriorityLabel(priority: "high" | "medium" | "low"): string {
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

function getPriorityClass(priority: "high" | "medium" | "low"): string {
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

function normalizeKnowledgeGapTitle(title: string): string {
  return title
    .trim()
    .replace(/^\s*\d+\s*[.)]\s*/g, "")
    .replace(/^\s*title\s*:\s*/i, "")
    .trim();
}

function getMarkdownNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getMarkdownNodeText).join("");
  if (typeof node === "object" && "props" in node) {
    const n = node as { props?: { children?: ReactNode } };
    return getMarkdownNodeText(n.props?.children);
  }
  return "";
}

// --- Scoring Helpers ---

// --- Scoring Helpers ---

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

export default function SessionDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceQuestionsById, setPracticeQuestionsById] = useState<
    Record<string, Question>
  >({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const getDifficultyLabel = (value: number): string => {
    if (value <= 3) return "Entry";
    if (value <= 5) return "Junior";
    if (value <= 7) return "Mid";
    return "Senior";
  };

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
        const text = getMarkdownNodeText(children).trim().replace(/\s+/g, " ");

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
                {label}:
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
  }, []);

  const qaQuestionMarkdownComponents = useMemo<Components>(() => {
    return {
      ...readableMarkdownComponents,
      p({ children }) {
        return (
          <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-line my-1 first:mt-0 last:mb-0">
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

  const sessionId = params.sessionId as string;

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
        toast.error(`Export failed (HTTP ${res.status})`);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const fileName = match?.[1] ?? "interview-report.pdf";

      const url = URL.createObjectURL(blob);
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
        .map((r) => r.feedback?.trim())
        .filter((v): v is string => typeof v === "string" && v.length > 0),
    );

    if (unique.size === 0) return null;
    return Array.from(unique)[0] ?? null;
  }, [session?.analysis?.detailedAnalysis, session?.responses]);

  const loadSession = useCallback(async () => {
    if (!user?.uid || !sessionId) {
      setError("Missing user or session information");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessionData = await DatabaseService.getSession(user.uid, sessionId);

      if (!sessionData) {
        setError("Session not found");
        setLoading(false);
        return;
      }

      setSession(sessionData);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load session details");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, sessionId]);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Refresh session when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.uid && sessionId) {
        loadSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadSession, user?.uid, sessionId]);

  useEffect(() => {
    if (!session?.questions || session.questions.length === 0) {
      setPracticeQuestionsById({});
      return;
    }

    void (async () => {
      const ids = session.questions.map((q) => q.id).filter(Boolean);
      if (ids.length === 0) {
        setPracticeQuestionsById({});
        return;
      }

      const fetched = await Promise.all(
        ids.map(async (id) => {
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
      for (const q of fetched) {
        if (!q) continue;
        next[q.id] = q;
      }
      setPracticeQuestionsById(next);
    })();
  }, [session?.questions]);

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="size-5" />;
      case "bullet":
        return <Target className="size-5" />;
      case "system-design":
        return <Target className="size-5" />;
      default:
        return <Trophy className="size-5" />;
    }
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  if (error || !session) {
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
                <Typography.Heading2 className="mb-4">
                  Session Not Found
                </Typography.Heading2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button
                  onClick={() => router.push("/history")}
                  aria-label="Back to History"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
                <Button
                  aria-label="Back to History"
                  onClick={() => router.push("/history")}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
                <Button
                  aria-label="Export PDF"
                  onClick={() => void exportPdf()}
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-sm flex-shrink-0">
                    {getInterviewIcon(session.config.interviewType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography.Heading1 className="text-foreground mb-3">
                      {session.config.position
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}{" "}
                      Interview
                    </Typography.Heading1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {session.totalDuration} minutes
                      </span>
                      {session.config.specificCompany && (
                        <Badge variant="secondary" className="font-medium">
                          {session.config.specificCompany}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  {/* ============================================================================ */}
                  {/* OUTCOME DECISION BANNER (Matches Results Page) */}
                  {/* ============================================================================ */}
                  {session.analysis?.passed !== undefined && (
                    <Card
                      className={`mb-8 border-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 ${
                        session.analysis.passed
                          ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
                          : "border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30"
                      }`}
                    >
                      <CardContent className="py-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
                            <div className="text-center sm:text-left">
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Interview Configuration */}
                  <Card className="mb-8 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                    <CardHeader className="px-6 py-4 border-b border-border/30">
                      <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <User className="size-5 text-primary" />
                        Interview Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Position
                          </div>
                          <div className="font-bold text-base capitalize text-foreground">
                            {session.config.position}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Seniority Level
                          </div>
                          <div className="font-bold text-base capitalize text-foreground">
                            {session.config.seniority}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Interview Type
                          </div>
                          <div className="font-bold text-base capitalize text-foreground">
                            {session.config.interviewType}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Mode
                          </div>
                          <Badge
                            variant="default"
                            className="capitalize font-semibold"
                          >
                            {session.config.interviewMode}
                          </Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Duration
                          </div>
                          <div className="font-bold text-base text-foreground">
                            {session.config.duration} minutes
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Status
                          </div>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize font-semibold"
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Performance Assessment */}
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      Overall Performance Assessment
                    </h2>
                  </div>
                  <div className="mb-8">
                    {(() => {
                      const overallScore =
                        typeof session.scores?.overall === "number" &&
                        session.scores.overall > 0
                          ? session.scores.overall
                          : 0;

                      return session.analysisStatus === "ready" &&
                        session.analysis ? (
                        <DetailedScoreCard
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
                            const rawCat = session.scores;
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
                                    (rawCat as any).professional ?? 0,
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
                                    score: clampFinite(score, 0, 100),
                                  }))
                                  .filter((x) => x.tech.trim().length > 0)
                                  .sort((a, b) => b.score - a.score)
                              : [];
                          })()}
                        />
                      ) : session.analysisStatus === "pending" ||
                        session.analysisStatus === "ready" ? (
                        <Card className="border-dashed border-2 p-8">
                          <div className="flex flex-col items-center justify-center text-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                        </Card>
                      ) : (
                        <Card className="bg-muted/30 border-none p-8 text-center">
                          <Typography.Body className="text-muted-foreground">
                            {session.analysisStatus === "failed"
                              ? "Score analysis failed."
                              : "Score unavailable for this session."}
                          </Typography.Body>
                        </Card>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const termination = session.termination;
              if (!termination) return null;

              const title = (() => {
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
                <Card className="mb-6 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardHeader className="px-3 pt-2 pb-0">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <BookOpen className="size-5 text-primary" />
                      Knowledge Gaps & Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-3">
                    <div className="space-y-4">
                      {session.analysis.knowledgeGaps.map((gap) => (
                        <div
                          key={gap.title}
                          className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-sm font-bold text-foreground">
                              {normalizeKnowledgeGapTitle(gap.title)}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`font-semibold ${getPriorityClass(
                                gap.priority,
                              )}`}
                            >
                              {getPriorityLabel(gap.priority)}
                            </Badge>
                          </div>

                          {gap.resources && gap.resources.length > 0 && (
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
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {session.questions && session.questions.length > 0 && (
              <Card className="mb-6 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="px-3 pt-2 pb-0 select-none">
                  <CardTitle className="flex items-center justify-between gap-3 text-xl font-bold">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-5 text-primary" />
                      {(() => {
                        const visibleQuestions = session.questions.filter(
                          (q) => {
                            const r = session.responses?.find(
                              (x) => x.questionId === q.id,
                            );

                            if (!r) return false;
                            if ((r.response ?? "").trim().length > 0)
                              return true;
                            return r.score > 0;
                          },
                        );

                        return (
                          <>
                            Questions & Example Answers (
                            {visibleQuestions.length})
                          </>
                        );
                      })()}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-3 pt-4 pb-3">
                  <div className="space-y-4">
                    {(() => {
                      const visibleQuestions = session.questions.filter((q) => {
                        const r = session.responses?.find(
                          (x) => x.questionId === q.id,
                        );

                        if (!r) return false;
                        if ((r.response ?? "").trim().length > 0) return true;
                        return r.score > 0;
                      });

                      const qaRows: Array<{
                        type: "main" | "follow-up";
                        mainIdx: number;
                        question: InterviewQuestion;
                        practiceQuestion: Question | null;
                        response: string | null;
                        score: number | null;
                        followUpQuestionText?: string;
                        followUpResponse?: string;
                        followUpAiExample?: string;
                      }> = [];

                      visibleQuestions.forEach((question, index) => {
                        const response = session.responses?.find(
                          (r) => r.questionId === question.id,
                        );

                        const practiceQuestion =
                          practiceQuestionsById[question.id] ?? null;

                        qaRows.push({
                          type: "main",
                          mainIdx: index,
                          question,
                          practiceQuestion,
                          response: response?.response ?? null,
                          score:
                            typeof response?.score === "number"
                              ? response.score
                              : null,
                        });

                        if (
                          Array.isArray(question.followUps) &&
                          question.followUps.length > 0
                        ) {
                          question.followUps.forEach((f) => {
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

                      return qaRows.map((row, rowIdx) => {
                        if (row.type === "follow-up") {
                          return (
                            <Collapsible
                              key={`${row.question.id}_followup_${rowIdx}`}
                              defaultOpen={false}
                              className="border-2 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500/50 bg-gradient-to-br from-blue-50/50 to-blue-50/10 border-y-border/50 border-r-border/50 dark:from-blue-950/20 dark:to-blue-950/5"
                            >
                              <CollapsibleTrigger className="w-full text-left group">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge
                                        variant="secondary"
                                        className="font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                                      >
                                        Follow-up
                                      </Badge>
                                    </div>

                                    <div className="font-semibold text-foreground line-clamp-1">
                                      {row.followUpQuestionText}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 self-start sm:self-center">
                                    <ChevronDown className="size-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="pt-4 mt-2 border-t border-border/40">
                                <div className="whitespace-pre-line mb-5">
                                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Prompt
                                  </div>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={qaQuestionMarkdownComponents}
                                  >
                                    {row.followUpQuestionText}
                                  </ReactMarkdown>
                                </div>

                                {(row.followUpResponse ?? "").length > 0 && (
                                  <div className="mb-5 last:mb-0">
                                    <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                      <User className="size-4 text-primary" />
                                      Your Response:
                                    </div>
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
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
                                )}

                                {(row.followUpAiExample ?? "").length > 0 && (
                                  <>
                                    <Separator className="my-5" />
                                    <div>
                                      <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                        <Lightbulb className="size-4 text-primary" />
                                        Example Answer:
                                      </div>
                                      <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="whitespace-pre-line text-sm">
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
                                  </>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
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
                          <Collapsible
                            key={row.question.id}
                            defaultOpen={false}
                            className="border-2 border-border/50 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CollapsibleTrigger className="w-full text-left group">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge
                                      variant="default"
                                      className="font-semibold"
                                    >
                                      Question {row.mainIdx + 1}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="capitalize font-medium"
                                    >
                                      {row.question.type}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="font-medium"
                                    >
                                      {row.practiceQuestion?.difficulty
                                        ? row.practiceQuestion.difficulty
                                            .charAt(0)
                                            .toUpperCase() +
                                          row.practiceQuestion.difficulty.slice(
                                            1,
                                          )
                                        : getDifficultyLabel(
                                            row.question.difficulty,
                                          )}
                                    </Badge>
                                  </div>

                                  <div className="font-semibold text-foreground line-clamp-1">
                                    {row.practiceQuestion?.title ||
                                      row.question.question}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-start sm:self-center">
                                  {row.score !== null && (
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`text-lg font-bold px-3 py-1 rounded-lg border border-border/60 bg-card/50 ${getScoreColor(
                                          row.score,
                                        )}`}
                                      >
                                        {row.score}%
                                      </div>
                                    </div>
                                  )}
                                  {row.score === null && row.response && (
                                    <div className="text-lg font-bold text-muted-foreground px-3 py-1 rounded-lg bg-muted/50">
                                      N/A
                                    </div>
                                  )}
                                  <ChevronDown className="size-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="pt-4 mt-2 border-t border-border/40">
                              <div className="whitespace-pre-line mb-5">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Prompt
                                </div>
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={qaQuestionMarkdownComponents}
                                >
                                  {row.question.question}
                                </ReactMarkdown>
                              </div>

                              {row.response && (
                                <div className="mb-5 last:mb-0">
                                  <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Your Response:
                                  </div>
                                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                    <div className="whitespace-pre-line text-sm">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={readableMarkdownComponents}
                                      >
                                        {row.response || "No response recorded"}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {effectiveExampleAnswer && (
                                <>
                                  <Separator className="my-5" />
                                  <div>
                                    <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                      <Lightbulb className="size-4 text-primary" />
                                      Example Answer:
                                    </div>
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                      <div className="whitespace-pre-line text-sm">
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
                                </>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {aiFeedback && (
              <div className="mb-6">
                <AiFeedbackCard
                  icon={<Sparkles className="size-5" />}
                  title="AI Feedback"
                  detailsMarkdown={aiFeedback}
                />
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
                              {session.analysis.strengths.map((strength) => (
                                <li
                                  key={strength}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                                >
                                  <Star className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {strength}
                                    </ReactMarkdown>
                                  </div>
                                </li>
                              ))}
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
                                (improvement) => (
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
                              (rec, index) => (
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
