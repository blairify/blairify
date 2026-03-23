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
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { AiFeedbackCard } from "@/components/common/molecules/ai-feedback-card";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { readableMarkdownComponents } from "@/components/results/atoms/result-markdown-renderers";
import { ScoreRadialChart } from "@/components/results/atoms/score-radial-chart";
import { DetailedScoreCard } from "@/components/results/molecules/detailed-score-card";
import { PassFailBanner } from "@/components/results/molecules/pass-fail-banner";
import {
  CandidateBubble,
  ExampleAnswerCard,
  InterviewerBubble,
} from "@/components/results/molecules/transcript-bubbles";
import { KnowledgeGapsSection } from "@/components/results/organisms/knowledge-gaps-section";
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
  clampCategoryScores,
  clampTechnologyScores,
} from "@/lib/utils/score-utils";
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
                <PassFailBanner
                  passed={session.analysis.passed}
                  compact
                  className="mb-6"
                />
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
                        categoryScores={clampCategoryScores(
                          session.analysis?.categoryScores,
                          overallScore,
                        )}
                        technologyScores={clampTechnologyScores(
                          session.analysis?.technologyScores,
                        )}
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
                <PassFailBanner
                  passed={session.analysis.passed}
                  className="mb-8"
                />
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
                          categoryScores={clampCategoryScores(
                            session.analysis?.categoryScores,
                            overallScore,
                          )}
                          technologyScores={clampTechnologyScores(
                            session.analysis?.technologyScores,
                          )}
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
                <KnowledgeGapsSection
                  knowledgeGaps={session.analysis.knowledgeGaps}
                  mode="compact"
                  className="mb-6"
                />
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
                      <div className="flex flex-col items-center gap-2 px-3 pt-6 pb-2">
                        <Typography.Caption className="text-xl sm:text-2xl font-bold tracking-tight text-center">
                          Answers & Transcript
                        </Typography.Caption>
                        <Typography.Caption className="text-center">
                          Conducted by {interviewer.name}
                        </Typography.Caption>
                      </div>

                      <CardContent className="px-6 py-0">
                        <div className="max-w-4xl mx-auto">
                          {qaRows.map((row, rowIdx) => {
                            if (row.type === "follow-up") {
                              return (
                                <Fragment
                                  key={`${row.question.id}_followup_${rowIdx}`}
                                >
                                  <Collapsible
                                    defaultOpen={false}
                                    className="group transition-all ml-6 border-l-2 border-border/40 pl-4"
                                  >
                                    <CollapsibleTrigger className="w-full text-left py-4 hover:bg-muted/5 transition-colors items-center">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Follow-up
                                          </div>
                                          <div className="text-sm font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
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
                                        <InterviewerBubble
                                          interviewer={interviewer}
                                          markdown={
                                            row.followUpQuestionText ?? ""
                                          }
                                        />

                                        {(row.followUpResponse ?? "").length >
                                          0 && (
                                          <CandidateBubble
                                            displayInitial={
                                              user?.displayName?.[0] || "ME"
                                            }
                                            markdown={
                                              row.followUpResponse ?? ""
                                            }
                                          />
                                        )}

                                        {(row.followUpAiExample ?? "").length >
                                          0 && (
                                          <ExampleAnswerCard
                                            markdown={
                                              row.followUpAiExample ?? ""
                                            }
                                          />
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </Fragment>
                              );
                            }

                            // Main question
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
                                  <Separator className="my-0 opacity-30" />
                                )}
                                <Collapsible
                                  defaultOpen={false}
                                  className="group transition-all"
                                >
                                  <CollapsibleTrigger className="w-full text-left py-5 hover:bg-muted/5 transition-colors items-center">
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
                                      <InterviewerBubble
                                        interviewer={interviewer}
                                        markdown={row.question.question}
                                      />

                                      {row.response && (
                                        <CandidateBubble
                                          displayInitial={
                                            user?.displayName?.[0] || "ME"
                                          }
                                          markdown={
                                            row.response ||
                                            "No response recorded"
                                          }
                                        />
                                      )}

                                      {effectiveExampleAnswer && (
                                        <ExampleAnswerCard
                                          markdown={effectiveExampleAnswer}
                                        />
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
