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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@/components/common/atoms/typography";
import { AiFeedbackCard } from "@/components/common/molecules/ai-feedback-card";
import {
  PostInterviewSurvey,
  type PostInterviewSurveyController,
} from "@/components/results/organisms/post-interview-survey";
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
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { addUserXP } from "@/lib/services/users/user-xp";
import {
  normalizePositionValue,
  normalizeSeniorityValue,
} from "@/lib/utils/interview-normalizers";
import {
  generateAnalysisMessages,
  generateOutcomeMessage,
  getResultsCopySeed,
} from "@/lib/utils/results-copy";
import { useAuth } from "@/providers/auth-provider";
import type { UserProfile } from "@/types/firestore";
import type {
  InterviewConfig,
  InterviewResults,
  KnowledgeGapPriority,
  TerminationReason,
} from "@/types/interview";
import type { Question } from "@/types/practice-question";

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

const getPerformanceLabel = (score: number, passed?: boolean): string => {
  if (passed === true) {
    if (score >= 90) return "Outstanding Performance";
    if (score >= 80) return "Strong Performance";
    if (score >= 70) return "Solid Performance";
    return "Acceptable Performance";
  }
  if (passed === false) {
    if (score >= 60) return "Below Threshold";
    if (score >= 40) return "Significant Gaps";
    return "Insufficient Competency";
  }
  // Neutral labels when pass/fail not determined
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Developing";
  return "Needs Improvement";
};

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

function normalizeKnowledgeGapTitle(title: string): string {
  return title
    .trim()
    .replace(/^\s*\d+\s*[.)]\s*/g, "")
    .replace(/^\s*title\s*:\s*/i, "")
    .trim();
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
  const { user: authUser, refreshUserData } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<InterviewResults | null>(null);
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
  const [answerByQuestionId, setAnswerByQuestionId] = useState<
    Record<string, string>
  >({});
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisMessages, setAnalysisMessages] = useState<string[]>([]);
  const [outcomeMessage, setOutcomeMessage] = useState<string>("");
  const [_currentDate, setCurrentDate] = useState<string>("");
  const [copySeed, setCopySeed] = useState<number | null>(null);
  const [storedConfig, setStoredConfig] = useState<
    Pick<InterviewConfig, "position" | "seniority"> | undefined
  >(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const backgroundClass = "bg-gradient-to-b from-background to-muted/20";
  const surveyControllerRef = useRef<PostInterviewSurveyController | null>(
    null,
  );
  const activeUserId = useMemo(
    () => authUser?.uid ?? initialUser.uid,
    [authUser?.uid, initialUser.uid],
  );
  const activeUserEmail = useMemo(
    () => authUser?.email ?? initialUser.email ?? "",
    [authUser?.email, initialUser.email],
  );

  // Set current date and analysis messages on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());

    const interviewSessionRaw = localStorage.getItem("interviewSession");
    const interviewConfigRaw = localStorage.getItem("interviewConfig");
    const interviewSessionId = localStorage.getItem("interviewSessionId");

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
      const questionIds = parsedSession?.questionIds ?? [];

      setPracticeQuestionIds(questionIds);

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
  }, []);

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
        const newProgress = Math.min(prevProgress + increment, 95);
        return newProgress;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isAnalyzing]);

  useEffect(() => {
    const loadAnalysis = async (retryCount = 0) => {
      try {
        const interviewData = localStorage.getItem("interviewSession");
        const interviewConfig = localStorage.getItem("interviewConfig");

        if (!interviewData || !interviewConfig) {
          console.error("Missing localStorage data:", {
            interviewData: !!interviewData,
            interviewConfig: !!interviewConfig,
          });
          setError(
            "No interview data found. Please complete an interview first.",
          );
          setIsAnalyzing(false);
          return;
        }

        const session = JSON.parse(interviewData);
        const config = JSON.parse(interviewConfig);

        console.log("📊 Session data loaded:", {
          hasMessages: !!session.messages,
          messageCount: session.messages?.length || 0,
          sessionKeys: Object.keys(session),
          isComplete: session.isComplete,
        });

        if (!session.messages || session.messages.length === 0) {
          console.error("No messages in session data:", {
            session,
            sessionKeys: Object.keys(session),
            messagesType: typeof session.messages,
            messagesValue: session.messages,
          });
          setError("No interview responses found to analyze.");
          setIsAnalyzing(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 90000);

        let response: Response;
        try {
          response = await fetch("/api/interview/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationHistory: session.messages,
              interviewConfig: config,
            }),
            signal: controller.signal,
          });
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            throw new Error(
              "Analysis request timed out. The AI service may be experiencing high load. Please try again.",
            );
          }
          throw fetchError;
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Analysis API error response:", {
            status: response.status,
            error: errorData.error,
            details: errorData.details,
            config,
            messageCount: session.messages.length,
          });
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setProgress(100);
          setResults(data.feedback);

          const seed = getResultsCopySeed({
            interviewSessionId: localStorage.getItem("interviewSessionId"),
            interviewSessionRaw: localStorage.getItem("interviewSession"),
            interviewConfigRaw: localStorage.getItem("interviewConfig"),
          });

          let configFromStorage:
            | Pick<InterviewConfig, "position" | "seniority">
            | undefined;
          try {
            const raw = localStorage.getItem("interviewConfig");
            const parsed = raw
              ? (JSON.parse(raw) as Partial<
                  Pick<InterviewConfig, "position" | "seniority">
                >)
              : null;

            if (parsed?.position && parsed?.seniority) {
              configFromStorage = {
                position: normalizePositionValue(parsed.position),
                seniority: normalizeSeniorityValue(parsed.seniority),
              };
            }
          } catch {
            // noop
          }

          setOutcomeMessage(
            generateOutcomeMessage({
              seed,
              results: {
                score: data.feedback.score,
                passed: data.feedback.passed ?? false,
                strengths: data.feedback.strengths,
                improvements: data.feedback.improvements,
              },
              config: configFromStorage,
            }),
          );

          if (activeUserId) {
            const hasAnyUserAnswer =
              Array.isArray(session.messages) &&
              session.messages.some(
                (message: { type?: unknown; content?: unknown }) =>
                  message.type === "user" &&
                  typeof message.content === "string" &&
                  message.content.trim().length > 0,
              );

            const existingSessionId =
              localStorage.getItem("interviewSessionId");

            if (!hasAnyUserAnswer) {
              if (existingSessionId) {
                try {
                  await DatabaseService.deleteSession(
                    activeUserId,
                    existingSessionId,
                  );
                } catch (deleteError) {
                  console.error(
                    "Error deleting empty session from database:",
                    deleteError,
                  );
                }
              }

              localStorage.removeItem("interviewSessionId");
              return;
            }

            try {
              await DatabaseService.saveInterviewResults(
                activeUserId,
                session,
                config,
                data.feedback,
                existingSessionId,
              );

              const xpResult = await addUserXP(
                activeUserId,
                data.feedback.score,
                data.feedback.totalDuration || 0,
              );

              console.log("XP Update:", xpResult);

              try {
                const latestProfile =
                  await DatabaseService.getUserProfile(activeUserId);
                setUserProfile(latestProfile);
              } catch (profileRefreshError) {
                console.error(
                  "Failed to refresh user profile after XP update:",
                  profileRefreshError,
                );
                setUserProfile((prev) =>
                  prev
                    ? {
                        ...prev,
                        totalInterviews: (prev.totalInterviews ?? 0) + 1,
                      }
                    : prev,
                );
              }
            } catch (dbError) {
              console.error("Error saving to database:", dbError);
            }
          }
        } else {
          throw new Error(data.error || "Analysis failed");
        }
      } catch (error) {
        console.error("Analysis error:", error);

        const shouldRetry =
          retryCount < 2 &&
          error instanceof Error &&
          (error.message.includes("timed out") ||
            error.message.includes("timeout") ||
            error.message.includes("AbortError") ||
            error.message.includes("429") ||
            error.message.includes("rate limit"));

        if (shouldRetry) {
          const delay = 2 ** retryCount * 2000;

          setTimeout(() => {
            loadAnalysis(retryCount + 1);
          }, delay);
          return;
        }

        if (error instanceof Error) {
          if (
            error.name === "AbortError" ||
            error.message.includes("timed out")
          ) {
            setError(
              "Analysis timed out after multiple attempts. The AI service may be experiencing high load. Please try again later.",
            );
          } else if (error.message.includes("401")) {
            setError("API authentication failed. Please check configuration.");
          } else if (
            error.message.includes("429") ||
            error.message.includes("rate limit")
          ) {
            setError(
              "AI service is currently at capacity. Please try again in a few minutes.",
            );
          } else {
            setError(error.message || "Failed to analyze interview responses");
          }
        } else {
          setError("Failed to analyze interview responses");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    loadAnalysis();
  }, [activeUserId]);

  useEffect(() => {
    if (!activeUserId) return;

    let isMounted = true;
    (async () => {
      try {
        const profile = await DatabaseService.getUserProfile(activeUserId);
        if (!isMounted) return;
        setUserProfile((prev) => {
          if (!profile) {
            return prev ?? null;
          }

          if (prev) {
            const prevInterviews = prev.totalInterviews ?? 0;
            const nextInterviews = profile.totalInterviews ?? 0;
            if (prevInterviews > nextInterviews) {
              return prev;
            }
          }

          return profile;
        });
      } catch (profileError) {
        console.error(
          "Failed to load user profile for survey gating:",
          profileError,
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

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

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

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
    <>
      <main className={`flex-1 overflow-auto ${backgroundClass}`}>
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
                        {results.passed ? "Interview Passed" : "Not Passed"}
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

          {/* ============================================================================ */}
          {/* OVERALL ASSESSMENT */}
          {/* ============================================================================ */}
          <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Overall Performance Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-start gap-8 mb-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                    aria-labelledby="score-chart-title"
                  >
                    <title id="score-chart-title">
                      Interview Score: {results.score} out of 100
                    </title>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - results.score / 100)}`}
                      className={
                        results.passed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Typography.BodyBold
                      className={`text-3xl font-bold ${
                        results.passed
                          ? "text-emerald-900 dark:text-emerald-100"
                          : "text-red-900 dark:text-red-100"
                      }`}
                    >
                      {results.score}
                    </Typography.BodyBold>
                  </div>
                </div>
                <div className="flex-1">
                  <Typography.Heading3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    {getPerformanceLabel(results.score, results.passed)}
                  </Typography.Heading3>

                  {(() => {
                    const summary = results.overallScore?.trim();
                    if (summary) {
                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={overallSummaryMarkdownComponents}
                        >
                          {normalizeOverallSummaryMarkdown(summary)}
                        </ReactMarkdown>
                      );
                    }

                    const fallback = results.detailedAnalysis
                      ?.trim()
                      .split(/\n{2,}/)
                      .map((part) => part.trim())
                      .filter(Boolean)[0];

                    if (fallback) {
                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={overallSummaryMarkdownComponents}
                        >
                          {normalizeOverallSummaryMarkdown(fallback)}
                        </ReactMarkdown>
                      );
                    }

                    return (
                      <Typography.Body className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Detailed summary unavailable for this interview.
                      </Typography.Body>
                    );
                  })()}
                </div>
              </div>
              {results.passingThreshold && (
                <div className="text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
                  Passing threshold for this position:{" "}
                  {results.passingThreshold} points
                </div>
              )}
            </CardContent>
          </Card>

          {(Boolean(results.overallScore?.trim()) ||
            Boolean(results.detailedAnalysis?.trim()) ||
            results.strengths.length > 0 ||
            results.improvements.length > 0) && (
            <AiFeedbackCard
              title="AI Feedback"
              icon={<FileText className="size-4" />}
              summaryMarkdown={null}
              strengths={results.strengths}
              improvements={results.improvements}
              detailsMarkdown={results.detailedAnalysis}
            />
          )}

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
                      <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                          Building foundational skills - keep developing your
                          technical expertise!
                        </Typography.Body>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      {results.passed === false
                        ? "Critical Development Areas"
                        : "Growth Opportunities"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {results.improvements.length > 0 ? (
                      <ul className="space-y-4">
                        {results.improvements.map((improvement, index) => (
                          <li
                            key={`improvement-${index}`}
                            className="flex items-start gap-3 group animate-in fade-in slide-in-from-right-2 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
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
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <Typography.Body className="text-sm text-gray-500 dark:text-gray-500 italic">
                          Excellent foundation - continue building advanced
                          competencies!
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
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Knowledge Gaps & Resources
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Focus on the high-priority items first. Each gap has curated
                  links from the resource library.
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
                          {normalizeKnowledgeGapTitle(gap.title)}
                        </div>
                        <Typography.CaptionMedium
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(
                            gap.priority,
                          )}`}
                        >
                          {getPriorityLabel(gap.priority)}
                        </Typography.CaptionMedium>
                      </div>

                      {gap.why && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {gap.why}
                        </div>
                      )}

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

          {practiceQuestionIds.length > 0 && (
            <Card className="border shadow-md hover:shadow-lg transition-shadow duration-500 animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Questions & Example Answers
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Practice-library examples to benchmark your responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {practiceQuestionIds.map((id, idx) => {
                    const q = practiceQuestionsById[id] ?? null;
                    const example = q ? getExampleAnswer(q) : null;
                    const prompt =
                      q?.prompt?.trim() || q?.description?.trim() || null;
                    const yourAnswer = answerByQuestionId[id]?.trim() || null;

                    return (
                      <Collapsible
                        key={id}
                        defaultOpen={false}
                        className="border-2 border-border/50 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-card to-card/50 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <CollapsibleTrigger className="w-full text-left group">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <Badge
                                variant="default"
                                className="font-semibold"
                              >
                                Question {idx + 1}
                              </Badge>
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {q?.title ?? "(failed to load)"}
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
                                : "Question details unavailable (could not fetch from Neon)."}
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
      </main>

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
    </>
  );
}
