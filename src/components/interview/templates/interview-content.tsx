"use client";

import { Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getInterviewerById,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import type { TerminationReason } from "@/types/interview";
import { useInterviewConfig } from "../../../hooks/use-interview-config";
import { useInterviewSession } from "../../../hooks/use-interview-session";
import { useInterviewTimer } from "../../../hooks/use-interview-timer";
import { useSpeechRecognition } from "../../../hooks/use-speech-recognition";
import { MessageInput } from "../molecules/message-input";
import { InterviewCompleteCard } from "../organisms/interview-complete-card";
import { InterviewConfigScreen } from "../organisms/interview-config-screen";
import { InterviewHeader } from "../organisms/interview-header";
import { InterviewMessagesArea } from "../organisms/interview-messages-area";
import type { Message, QuestionType } from "../types";

interface InterviewContentProps {
  user: UserData;
}

interface StartInterviewResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: unknown;
  questionIds?: string[];
}

interface ChatInterviewResponse {
  success: boolean;
  message: string;
  questionType?: QuestionType;
  isFollowUp?: boolean;
  usedFallback?: boolean;
  warningCount?: number;
  isComplete?: boolean;
  terminatedForLanguage?: boolean;
  terminatedForProfanity?: boolean;
  terminatedForBehavior?: boolean;
  aiErrorType?: string;
  matchedBehaviorPatterns?: string[];
}

function getUserFacingInterviewErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "";
  const normalized = raw.toLowerCase();

  if (
    normalized.includes("failed to process message") ||
    normalized.includes("failed to send message") ||
    normalized.includes("timeout") ||
    normalized.includes("network") ||
    normalized.includes("fetch")
  ) {
    return "I ran into a temporary issue processing that. Your answer is saved in the transcript. Please try sending again in a moment.";
  }

  return "I ran into an issue processing that. Your answer is saved in the transcript. Please try again in a moment.";
}

export function InterviewContent({ user }: InterviewContentProps) {
  const { config, mounted } = useInterviewConfig();
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [completionTerminationReason, setCompletionTerminationReason] =
    useState<TerminationReason | null>(null);
  const [databaseSessionId, setDatabaseSessionId] = useState<string | null>(
    null,
  );
  const [warningCount, setWarningCount] = useState(0);
  const interviewCompletedRef = useRef(false);
  const allowExitRef = useRef(false);
  const hasPushedGuardStateRef = useRef(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const pendingExitUrlRef = useRef<string | null>(null);
  const originalHistoryMethodsRef = useRef<{
    pushState: History["pushState"];
    replaceState: History["replaceState"];
  } | null>(null);

  const {
    session,
    addMessage,
    updateSession,
    incrementQuestionCount,
    togglePause,
    completeInterview,
  } = useInterviewSession(config);

  const interviewer = session.interviewerId
    ? getInterviewerById(session.interviewerId) ||
      getInterviewerForRole(config.position)
    : getInterviewerForRole(config.position);

  const hasAnyUserAnswer = (messages: Message[]): boolean =>
    messages.some(
      (m) =>
        m.type === "user" && typeof m.content === "string" && m.content.trim(),
    );

  const countUserAnswers = (messages: Message[]): number =>
    messages.reduce((count, m) => {
      if (m.type !== "user") return count;
      if (typeof m.content !== "string") return count;
      if (m.content.trim().length === 0) return count;
      return count + 1;
    }, 0);

  const ensureDatabaseSession = async (messages: Message[]) => {
    if (!user?.uid) return null;
    if (databaseSessionId) return databaseSessionId;
    if (!hasAnyUserAnswer(messages)) return null;

    try {
      const sessionData = {
        config: {
          position: config.position,
          seniority: config.seniority,
          interviewMode: config.interviewMode as
            | "regular"
            | "practice"
            | "flash"
            | "play"
            | "competitive"
            | "teacher",
          interviewType: config.interviewType,
          duration: Number.parseInt(String(config.duration), 10) || 30,
          ...(config.specificCompany && {
            specificCompany: config.specificCompany,
          }),
        },
        status: "in-progress" as const,
        startedAt: Timestamp.now(),
        totalDuration: 0,
        questions: [],
        responses: [],
        analysis: {
          strengths: [],
          improvements: [],
          skillsAssessed: [],
          difficulty: 5,
          aiConfidence: 50,
          summary: "Interview in progress...",
          recommendations: [],
          nextSteps: [],
        },
        analysisStatus: "pending" as const,
      };

      const sessionId = await DatabaseService.createSession(
        user.uid,
        sessionData,
      );
      setDatabaseSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.error("Error creating database session:", error);
      return null;
    }
  };

  const markInterviewComplete = (
    messagesOverride?: Message[],
    sessionIdOverride?: string | null,
  ) => {
    if (session.isComplete || interviewCompletedRef.current) {
      return;
    }

    interviewCompletedRef.current = true;
    completeInterview();
    const sessionData = {
      ...session,
      messages: messagesOverride ?? session.messages,
      endTime: new Date(),
      totalDuration: Math.round(
        (Date.now() - session.startTime.getTime()) / 1000 / 60,
      ),
      isComplete: true,
    };

    const userAnswerCount = countUserAnswers(sessionData.messages);
    const shouldKeepInHistory = (() => {
      if (userAnswerCount === 0) return false;
      if (sessionData.termination?.reason && userAnswerCount < 2) return false;
      return true;
    })();

    const resolvedSessionId = sessionIdOverride ?? databaseSessionId;

    if (!shouldKeepInHistory) {
      if (resolvedSessionId && user?.uid) {
        void (async () => {
          try {
            await DatabaseService.deleteSession(user.uid, resolvedSessionId);
          } catch (error) {
            console.error("Error deleting session from database:", error);
          }
        })();
      }

      setDatabaseSessionId(null);
      localStorage.removeItem("interviewSessionId");
    }

    localStorage.setItem("interviewSession", JSON.stringify(sessionData));
    localStorage.setItem("interviewConfig", JSON.stringify(config));

    if (resolvedSessionId && shouldKeepInHistory) {
      localStorage.setItem("interviewSessionId", resolvedSessionId);
    }
  };

  const shouldBlockExit =
    isInterviewStarted && !session.isComplete && !allowExitRef.current;

  useEffect(() => {
    if (!shouldBlockExit) {
      return;
    }

    const ensureOriginalHistoryMethods = () => {
      if (originalHistoryMethodsRef.current) {
        return originalHistoryMethodsRef.current;
      }

      const methods = {
        pushState: window.history.pushState.bind(window.history),
        replaceState: window.history.replaceState.bind(window.history),
      };
      originalHistoryMethodsRef.current = methods;
      return methods;
    };

    const shouldBlockNavigationTo = (url: string) => {
      if (!shouldBlockExit) {
        return false;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(url, window.location.href);
      } catch {
        return false;
      }

      if (nextUrl.origin !== window.location.origin) {
        return false;
      }

      if (
        nextUrl.pathname === window.location.pathname &&
        nextUrl.search === window.location.search &&
        nextUrl.hash === window.location.hash
      ) {
        return false;
      }

      return true;
    };

    const requestExitTo = (url: string) => {
      if (!shouldBlockExit) {
        return;
      }

      pendingExitUrlRef.current = url;
      setIsExitDialogOpen(true);
    };

    const { pushState, replaceState } = ensureOriginalHistoryMethods();

    window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
      const url = args[2];
      if (typeof url === "string" && shouldBlockNavigationTo(url)) {
        requestExitTo(url);
        return;
      }
      pushState(...args);
    }) as History["pushState"];

    window.history.replaceState = ((
      ...args: Parameters<History["replaceState"]>
    ) => {
      const url = args[2];
      if (typeof url === "string" && shouldBlockNavigationTo(url)) {
        requestExitTo(url);
        return;
      }
      replaceState(...args);
    }) as History["replaceState"];

    const handleDocumentClickCapture = (event: MouseEvent) => {
      if (!shouldBlockExit) {
        return;
      }

      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      if (shouldBlockNavigationTo(href)) {
        event.preventDefault();
        requestExitTo(href);
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockExit) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    const handlePopState = () => {
      if (!shouldBlockExit) {
        return;
      }

      if (!isExitDialogOpen) {
        setIsExitDialogOpen(true);
      }

      window.history.pushState(null, "", window.location.href);
    };

    if (!hasPushedGuardStateRef.current) {
      hasPushedGuardStateRef.current = true;
      window.history.pushState(null, "", window.location.href);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);

      document.removeEventListener("click", handleDocumentClickCapture, true);

      const original = originalHistoryMethodsRef.current;
      if (original) {
        window.history.pushState = original.pushState;
        window.history.replaceState = original.replaceState;
      }
    };
  }, [isExitDialogOpen, shouldBlockExit]);

  const handleViewResults = () => {
    allowExitRef.current = true;
    markInterviewComplete();
    window.location.href = "/results";
  };

  const handleStopInterview = () => {
    allowExitRef.current = true;
    setIsExitDialogOpen(false);
    markInterviewComplete();
  };

  const handleTimeUp = () => {
    if (session.isComplete || interviewCompletedRef.current) {
      return;
    }

    const timeoutMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content:
        "Our time is up. I'll now analyze your responses and prepare your results.",
      timestamp: new Date(),
    };

    addMessage(timeoutMessage);
    markInterviewComplete();
  };

  const timeRemaining = useInterviewTimer(
    config,
    mounted,
    isInterviewStarted,
    session.isPaused,
    session.isComplete,
    handleTimeUp,
  );

  const { isListening, startSpeechRecognition, stopSpeechRecognition } =
    useSpeechRecognition((text: string) => {
      setCurrentMessage(text);
    });

  const handleStartInterview = async () => {
    setCompletionTerminationReason(null);
    setIsInterviewStarted(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewConfig: config,
          userId: user?.uid,
        }),
      });

      const data: StartInterviewResponse = await response.json();

      if (!response.ok) {
        console.error("❌ Failed to start interview:", {
          status: response.status,
          error: data.error,
          details: data.details,
          config,
        });
        throw new Error(data.error || "Failed to start interview");
      }

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: config.interviewType as
            | "technical"
            | "bullet"
            | "coding"
            | "system-design",
        };

        updateSession({
          messages: [aiMessage],
          currentQuestionCount: 1,
          hasPersonalizedIntro: true,
          questionIds: data.questionIds ?? [],
          ...(data.questionIds && data.questionIds.length > 0
            ? { totalQuestions: data.questionIds.length }
            : {}),
        });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      addMessage({
        id: Date.now().toString(),
        type: "ai",
        content:
          "I ran into an issue starting the interview. Please try again in a moment.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && !isInterviewStarted && !isLoading) {
      void handleStartInterview();
    }
  }, [
    mounted,
    isInterviewStarted,
    isLoading,
    // biome-ignore lint/correctness/useExhaustiveDependencies: handleStartInterview does not need memoization in React 19
    handleStartInterview,
  ]);

  useEffect(() => {
    if (!user?.uid || !databaseSessionId || session.messages.length === 0) {
      return;
    }

    const syncSession = async () => {
      try {
        const currentDuration = Math.round(
          (Date.now() - session.startTime.getTime()) / 1000 / 60,
        );

        const nextStatus = (() => {
          if (!session.isComplete) return "in-progress" as const;
          if (session.termination?.reason) return "terminated" as const;
          if (session.currentQuestionCount >= session.totalQuestions)
            return "completed" as const;
          return "abandoned" as const;
        })();

        await DatabaseService.updateSession(user.uid, databaseSessionId, {
          totalDuration: currentDuration,
          status: nextStatus,
          ...(session.isComplete && { completedAt: Timestamp.now() }),
        });
      } catch (dbError) {
        console.error("Error updating database session:", dbError);
      }
    };

    void syncSession();
  }, [
    user?.uid,
    databaseSessionId,
    session.messages,
    session.startTime,
    session.isComplete,
    session.termination?.reason,
    session.currentQuestionCount,
    session.totalQuestions,
  ]);

  const handleSendMessage = async () => {
    if (
      !currentMessage.trim() ||
      isLoading ||
      session.isComplete ||
      interviewCompletedRef.current
    ) {
      return;
    }

    const messageToSend = currentMessage;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    const conversationHistoryToSend = [...session.messages, userMessage];

    addMessage(userMessage);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: conversationHistoryToSend,
          interviewConfig: config,
          questionCount: session.currentQuestionCount,
          totalQuestions: session.totalQuestions,
          warningCount: warningCount,
          questionIds: session.questionIds,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        const errorMessage =
          errorData.error || `Failed to send message (${response.status})`;
        console.error("API Error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data: ChatInterviewResponse = await response.json();

      if (data.success) {
        const isFollowUp = data.isFollowUp === true;
        const _usedFallback = data.usedFallback === true;

        if (data.matchedBehaviorPatterns?.length) {
          console.warn("Moderation matched behavior patterns:", {
            matchedBehaviorPatterns: data.matchedBehaviorPatterns,
          });
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: data.questionType,
          isFollowUp,
        };

        const nextMessages = [...conversationHistoryToSend, aiMessage];

        addMessage(aiMessage);

        const ensuredSessionId = await ensureDatabaseSession(
          conversationHistoryToSend,
        );

        if (data.aiErrorType === "timeout") {
          addMessage({
            id: (Date.now() + 2).toString(),
            type: "ai",
            content:
              "The interview AI timed out briefly, so I used a reliable fallback question. You can continue answering as normal.",
            timestamp: new Date(),
          });
        }

        if (data.warningCount !== undefined) {
          setWarningCount(data.warningCount);
        }

        if (data.isComplete) {
          if (data.terminatedForLanguage) {
            interviewCompletedRef.current = true;
            setCompletionTerminationReason("language");
            updateSession({
              isComplete: true,
              termination: {
                reason: "language",
                message: data.message,
                at: new Date(),
              },
            });

            const terminationData = {
              messages: nextMessages,
              config,
              interviewer,
              startTime: session.startTime,
              endTime: new Date(),
              questionIds: session.questionIds,
              isComplete: true,
              terminatedForLanguage: true,
              termination: {
                reason: "language",
                message: data.message,
                at: new Date(),
              },
              finalScore: 0,
            };

            localStorage.setItem(
              "interviewSession",
              JSON.stringify(terminationData),
            );
            localStorage.setItem("interviewConfig", JSON.stringify(config));

            if (ensuredSessionId) {
              localStorage.setItem("interviewSessionId", ensuredSessionId);
            }

            markInterviewComplete(nextMessages, ensuredSessionId);
            return;
          }

          if (data.terminatedForProfanity) {
            interviewCompletedRef.current = true;
            setCompletionTerminationReason("profanity");
            updateSession({
              isComplete: true,
              termination: {
                reason: "profanity",
                message: data.message,
                at: new Date(),
              },
            });

            const terminationData = {
              messages: nextMessages,
              config,
              interviewer,
              startTime: session.startTime,
              endTime: new Date(),
              questionIds: session.questionIds,
              isComplete: true,
              terminatedForProfanity: true,
              termination: {
                reason: "profanity",
                message: data.message,
                at: new Date(),
              },
              finalScore: 0,
            };

            localStorage.setItem(
              "interviewSession",
              JSON.stringify(terminationData),
            );
            localStorage.setItem("interviewConfig", JSON.stringify(config));

            if (ensuredSessionId) {
              localStorage.setItem("interviewSessionId", ensuredSessionId);
            }

            markInterviewComplete(nextMessages, ensuredSessionId);
            return;
          }

          if (data.terminatedForBehavior) {
            interviewCompletedRef.current = true;
            setCompletionTerminationReason("inappropriate-behavior");
            updateSession({
              isComplete: true,
              termination: {
                reason: "inappropriate-behavior",
                message: data.message,
                at: new Date(),
              },
            });

            const terminationData = {
              messages: nextMessages,
              config,
              interviewer,
              startTime: session.startTime,
              endTime: new Date(),
              questionIds: session.questionIds,
              isComplete: true,
              terminatedForBehavior: true,
              termination: {
                reason: "inappropriate-behavior",
                message: data.message,
                at: new Date(),
              },
              finalScore: 0,
            };

            localStorage.setItem(
              "interviewSession",
              JSON.stringify(terminationData),
            );
            localStorage.setItem("interviewConfig", JSON.stringify(config));

            if (ensuredSessionId) {
              localStorage.setItem("interviewSessionId", ensuredSessionId);
            }

            markInterviewComplete(nextMessages, ensuredSessionId);
            return;
          }

          markInterviewComplete(nextMessages, ensuredSessionId);
        }

        if (!isFollowUp) {
          incrementQuestionCount();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        id: Date.now().toString(),
        type: "ai",
        content: getUserFacingInterviewErrorMessage(error),
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (session.isComplete || interviewCompletedRef.current) {
      return;
    }

    if (session.currentQuestionCount >= session.totalQuestions) {
      setIsLoading(true);

      try {
        const response = await fetch("/api/interview/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message:
              "I would like to skip this question and end the interview here.",
            conversationHistory: session.messages,
            interviewConfig: config,
            questionCount: session.currentQuestionCount,
            totalQuestions: session.totalQuestions,
            warningCount,
            questionIds: session.questionIds,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          const errorMessage =
            errorData.error ||
            `Failed to skip final question (${response.status})`;
          console.error("API Error (final skip):", errorMessage, errorData);
          throw new Error(errorMessage);
        }

        const data: ChatInterviewResponse = await response.json();

        if (data.success) {
          const isFollowUp = data.isFollowUp === true;

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: data.message,
            timestamp: new Date(),
            questionType: data.questionType,
            isFollowUp,
          };

          addMessage(aiMessage);

          const ensuredSessionId = await ensureDatabaseSession(
            session.messages,
          );

          if (data.warningCount !== undefined) {
            setWarningCount(data.warningCount);
          }

          if (data.isComplete) {
            if (data.terminatedForProfanity) {
              interviewCompletedRef.current = true;
              completeInterview();

              const terminationData = {
                messages: session.messages,
                config,
                interviewer,
                startTime: session.startTime,
                endTime: new Date(),
                questionIds: session.questionIds,
                isComplete: true,
                terminatedForProfanity: true,
                termination: {
                  reason: "profanity",
                  message: data.message,
                  at: new Date(),
                },
                finalScore: 0,
              };

              localStorage.setItem(
                "interviewSession",
                JSON.stringify(terminationData),
              );
              localStorage.setItem("interviewConfig", JSON.stringify(config));

              if (ensuredSessionId) {
                localStorage.setItem("interviewSessionId", ensuredSessionId);
              }

              markInterviewComplete(undefined, ensuredSessionId);
              return;
            }

            if (data.terminatedForBehavior) {
              interviewCompletedRef.current = true;
              completeInterview();

              const terminationData = {
                messages: session.messages,
                config,
                interviewer,
                startTime: session.startTime,
                endTime: new Date(),
                questionIds: session.questionIds,
                isComplete: true,
                terminatedForBehavior: true,
                termination: {
                  reason: "inappropriate-behavior",
                  message: data.message,
                  at: new Date(),
                },
                finalScore: 0,
              };

              localStorage.setItem(
                "interviewSession",
                JSON.stringify(terminationData),
              );
              localStorage.setItem("interviewConfig", JSON.stringify(config));

              if (ensuredSessionId) {
                localStorage.setItem("interviewSessionId", ensuredSessionId);
              }

              markInterviewComplete(undefined, ensuredSessionId);
              return;
            }

            markInterviewComplete(undefined, ensuredSessionId);
          }

          if (!isFollowUp) {
            incrementQuestionCount();
          }
        }
      } catch (error) {
        console.error("Error skipping final question:", error);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/skip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationHistory: session.messages,
          interviewConfig: config,
          questionCount: session.currentQuestionCount,
          totalQuestions: session.totalQuestions,
          questionIds: session.questionIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to skip question");
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: data.questionType,
        };

        addMessage(aiMessage);
        incrementQuestionCount();

        if (data.isComplete) {
          markInterviewComplete();
        }
      }
    } catch (error) {
      console.error("Error skipping question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </main>
    );
  }

  if (!isInterviewStarted) {
    return (
      <InterviewConfigScreen
        config={config}
        isLoading={isLoading}
        onStart={handleStartInterview}
      />
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave interview?</DialogTitle>
            <DialogDescription>
              Your interview is still in progress. Click Stop to end it, or View
              Results after it ends.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                pendingExitUrlRef.current = null;
                setIsExitDialogOpen(false);
              }}
            >
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                allowExitRef.current = true;
                setIsExitDialogOpen(false);
                const pendingUrl = pendingExitUrlRef.current;
                pendingExitUrlRef.current = null;
                if (pendingUrl) {
                  window.location.href = pendingUrl;
                  return;
                }

                window.history.back();
              }}
            >
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InterviewHeader
        interviewType={config.interviewType}
        timeRemaining={timeRemaining}
        currentQuestion={session.currentQuestionCount}
        totalQuestions={session.totalQuestions}
        isPaused={session.isPaused}
        isComplete={session.isComplete}
        isLoading={isLoading}
        onPauseResume={togglePause}
        onSkip={handleSkipQuestion}
        onEnd={handleStopInterview}
      />

      <InterviewMessagesArea
        messages={session.messages}
        isLoading={isLoading}
        interviewer={interviewer}
        completionCard={
          session.isComplete ? (
            <InterviewCompleteCard
              onViewResults={handleViewResults}
              showViewResults={hasAnyUserAnswer(session.messages)}
              onGoToProgress={() => {
                allowExitRef.current = true;
                window.location.href = "/my-progress";
              }}
              terminationReason={
                session.termination?.reason ??
                completionTerminationReason ??
                undefined
              }
            />
          ) : null
        }
      />

      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <MessageInput
            value={currentMessage}
            onChange={setCurrentMessage}
            onSend={handleSendMessage}
            onStartVoice={startSpeechRecognition}
            onStopVoice={stopSpeechRecognition}
            isListening={isListening}
            isPaused={session.isPaused}
            isLoading={isLoading}
            isDisabled={session.isComplete}
          />
        </div>
      </div>

      {/* <TokenCounter messages={session.messages} /> */}
    </main>
  );
}
