"use client";

import { Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { TokenCounter } from "@/components/interview/atoms/token-counter";
import {
  getInterviewerById,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
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
  warningCount?: number;
  isComplete?: boolean;
  terminatedForProfanity?: boolean;
  terminatedForBehavior?: boolean;
  aiErrorType?: string;
  usedFallback?: boolean;
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
  const [databaseSessionId, setDatabaseSessionId] = useState<string | null>(
    null,
  );
  const [warningCount, setWarningCount] = useState(0);
  const interviewCompletedRef = useRef(false);

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

  const markInterviewComplete = () => {
    if (session.isComplete || interviewCompletedRef.current) {
      return;
    }

    interviewCompletedRef.current = true;
    completeInterview();
    const sessionData = {
      ...session,
      messages: session.messages,
      endTime: new Date(),
      totalDuration: Math.round(
        (Date.now() - session.startTime.getTime()) / 1000 / 60,
      ),
      isComplete: true,
    };

    localStorage.setItem("interviewSession", JSON.stringify(sessionData));
    localStorage.setItem("interviewConfig", JSON.stringify(config));
    if (databaseSessionId) {
      localStorage.setItem("interviewSessionId", databaseSessionId);
    }
  };

  const handleViewResults = () => {
    markInterviewComplete();
    window.location.href = "/results";
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

        if (user?.uid && !databaseSessionId) {
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
                duration: parseInt(config.duration, 10) || 30,
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
            };

            const sessionId = await DatabaseService.createSession(
              user.uid,
              sessionData,
            );
            setDatabaseSessionId(sessionId);
          } catch (dbError) {
            console.error("Error creating database session:", dbError);
          }
        }
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

        await DatabaseService.updateSession(user.uid, databaseSessionId, {
          totalDuration: currentDuration,
          status: session.isComplete ? "completed" : "in-progress",
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

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

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
          message: currentMessage,
          conversationHistory: session.messages,
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
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: data.questionType,
          isFollowUp: data.isFollowUp,
        };

        addMessage(aiMessage);

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
          if (data.terminatedForProfanity) {
            interviewCompletedRef.current = true;
            completeInterview();

            const terminationData = {
              messages: session.messages,
              config,
              interviewer,
              isComplete: true,
              terminatedForProfanity: true,
              finalScore: 0,
            };

            localStorage.setItem(
              "interviewSession",
              JSON.stringify(terminationData),
            );
            localStorage.setItem("interviewConfig", JSON.stringify(config));

            if (databaseSessionId) {
              localStorage.setItem("interviewSessionId", databaseSessionId);
            }

            window.location.href = "/results";
            return;
          }

          if (data.terminatedForBehavior) {
            interviewCompletedRef.current = true;
            completeInterview();

            const terminationData = {
              messages: session.messages,
              config,
              interviewer,
              isComplete: true,
              terminatedForBehavior: true,
              finalScore: 0,
            };

            localStorage.setItem(
              "interviewSession",
              JSON.stringify(terminationData),
            );
            localStorage.setItem("interviewConfig", JSON.stringify(config));

            if (databaseSessionId) {
              localStorage.setItem("interviewSessionId", databaseSessionId);
            }

            window.location.href = "/results";
            return;
          }

          markInterviewComplete();
        }

        if (!data.isFollowUp && !data.usedFallback) {
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
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: data.message,
            timestamp: new Date(),
            questionType: data.questionType,
            isFollowUp: data.isFollowUp,
          };

          addMessage(aiMessage);

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
                isComplete: true,
                terminatedForProfanity: true,
                finalScore: 0,
              };

              localStorage.setItem(
                "interviewSession",
                JSON.stringify(terminationData),
              );
              localStorage.setItem("interviewConfig", JSON.stringify(config));

              window.location.href = "/results";
              return;
            }

            if (data.terminatedForBehavior) {
              interviewCompletedRef.current = true;
              completeInterview();

              const terminationData = {
                messages: session.messages,
                config,
                interviewer,
                isComplete: true,
                terminatedForBehavior: true,
                finalScore: 0,
              };

              localStorage.setItem(
                "interviewSession",
                JSON.stringify(terminationData),
              );
              localStorage.setItem("interviewConfig", JSON.stringify(config));

              if (databaseSessionId) {
                localStorage.setItem("interviewSessionId", databaseSessionId);
              }

              window.location.href = "/results";
              return;
            }

            markInterviewComplete();
          }

          if (!data.isFollowUp) {
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
        onEnd={markInterviewComplete}
      />

      <InterviewMessagesArea
        messages={session.messages}
        isLoading={isLoading}
        interviewer={interviewer}
        completionCard={
          session.isComplete ? (
            <InterviewCompleteCard onViewResults={handleViewResults} />
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

      <TokenCounter messages={session.messages} />
    </main>
  );
}
