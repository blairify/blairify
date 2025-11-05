"use client";

import { Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { TokenCounter } from "@/components/dev/token-counter";
import {
  getInterviewerById,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { useInterviewConfig } from "../hooks/use-interview-config";
import { useInterviewSession } from "../hooks/use-interview-session";
import { useInterviewTimer } from "../hooks/use-interview-timer";
import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { MessageInput } from "../molecules/message-input";
import { InterviewCompleteCard } from "../organisms/interview-complete-card";
import { InterviewConfigScreen } from "../organisms/interview-config-screen";
import { InterviewHeader } from "../organisms/interview-header";
import { InterviewMessagesArea } from "../organisms/interview-messages-area";
import type { Message } from "../types";

interface InterviewContentProps {
  user: UserData;
}

export function InterviewContent({ user }: InterviewContentProps) {
  const { config, mounted } = useInterviewConfig();
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [databaseSessionId, setDatabaseSessionId] = useState<string | null>(
    null,
  );

  // Track behavior warnings
  const [warningCount, setWarningCount] = useState(0);

  const {
    session,
    addMessage,
    updateSession,
    incrementQuestionCount,
    togglePause,
    completeInterview,
  } = useInterviewSession(config);

  // Get interviewer from session to maintain consistency
  const interviewer = session.interviewerId
    ? getInterviewerById(session.interviewerId) ||
      getInterviewerForRole(config.position)
    : getInterviewerForRole(config.position);

  // Debug logging for interviewer consistency
  console.log("🎭 Interviewer selection:", {
    sessionInterviewerId: session.interviewerId,
    selectedInterviewer: interviewer?.name,
    interviewerId: interviewer?.id,
    position: config.position,
    avatarSex: interviewer?.avatarConfig?.sex,
    avatarHairStyle: interviewer?.avatarConfig?.hairStyle,
    avatarShirtColor: interviewer?.avatarConfig?.shirtColor,
  });

  const handleCompleteInterview = () => {
    completeInterview();

    // Store session data for results page
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

    // Navigate to results
    window.location.href = "/results";
  };

  const timeRemaining = useInterviewTimer(
    config,
    mounted,
    isInterviewStarted,
    session.isPaused,
    session.isComplete,
    handleCompleteInterview,
  );

  // Speech recognition
  const { isListening, startSpeechRecognition, stopSpeechRecognition } =
    useSpeechRecognition((text: string) => {
      setCurrentMessage(text);
    });

  const handleStartInterview = useCallback(async () => {
    console.log("🚀 Starting interview with config:", {
      interviewMode: config.interviewMode,
      isDemoMode: config.isDemoMode,
      sessionTotalQuestions: session.totalQuestions,
      position: config.position,
    });

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

      const data = await response.json();

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
        });

        // Create database session to save conversation history
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
            console.log("📝 Created database session:", sessionId);
          } catch (dbError) {
            console.error("Error creating database session:", dbError);
          }
        }
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";
      addMessage({
        id: Date.now().toString(),
        type: "ai",
        content: `I apologize, but there was an error starting the interview: ${errorMessage}. Please check your configuration and try again.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    config,
    session.totalQuestions,
    user?.uid,
    addMessage,
    updateSession,
    databaseSessionId,
  ]);

  // Update database session with new messages
  const updateDatabaseSession = useCallback(
    async (newMessages: Message[]) => {
      if (user?.uid && databaseSessionId && newMessages.length > 0) {
        try {
          const currentDuration = Math.round(
            (Date.now() - session.startTime.getTime()) / 1000 / 60,
          );

          await DatabaseService.updateSession(user.uid, databaseSessionId, {
            totalDuration: currentDuration,
            status: session.isComplete ? "completed" : "in-progress",
            ...(session.isComplete && { completedAt: Timestamp.now() }),
          });

          console.log("📝 Updated database session with new messages");
        } catch (dbError) {
          console.error("Error updating database session:", dbError);
        }
      }
    },
    [user?.uid, databaseSessionId, session.startTime, session.isComplete],
  );

  // Auto-start interview when config is ready (eliminates config screen entirely)
  useEffect(() => {
    if (mounted && !isInterviewStarted && !isLoading) {
      console.log("🚀 Auto-starting interview");
      handleStartInterview();
    }
  }, [mounted, isInterviewStarted, isLoading, handleStartInterview]);

  // Update database session when messages change
  useEffect(() => {
    if (session.messages.length > 0 && databaseSessionId) {
      updateDatabaseSession(session.messages);
    }
  }, [session.messages, updateDatabaseSession, databaseSessionId]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    console.log("📤 Sending answer:", {
      currentQuestionCount: session.currentQuestionCount,
      totalQuestions: session.totalQuestions,
      interviewMode: config.interviewMode,
      messagePreview: currentMessage.substring(0, 50),
    });

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Failed to send message (${response.status})`;
        console.error("API Error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

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

        // Update warning count if provided
        if (data.warningCount !== undefined) {
          setWarningCount(data.warningCount);
        }

        if (data.isComplete) {
          console.log("🎯 Client: Interview completion triggered", {
            currentQuestionCount: session.currentQuestionCount,
            totalQuestions: session.totalQuestions,
            interviewMode: config.interviewMode,
            data,
          });

          // Handle profanity termination with score 0
          if (data.terminatedForProfanity) {
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

          // Handle behavior termination with score 0
          if (data.terminatedForBehavior) {
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

            window.location.href = "/results";
            return;
          }

          handleCompleteInterview();
        }

        if (!data.isFollowUp) {
          incrementQuestionCount();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (session.currentQuestionCount >= session.totalQuestions) {
      handleCompleteInterview();
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
          handleCompleteInterview();
        }
      }
    } catch (error) {
      console.error("Error skipping question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!mounted) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </main>
    );
  }

  // Configuration screen
  if (!isInterviewStarted) {
    return (
      <InterviewConfigScreen
        config={config}
        isLoading={isLoading}
        onStart={handleStartInterview}
      />
    );
  }

  // Main interview screen
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
        onEnd={handleCompleteInterview}
      />

      <InterviewMessagesArea
        messages={session.messages}
        isLoading={isLoading}
        interviewer={interviewer}
      />

      {!session.isComplete && (
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
            />
          </div>
        </div>
      )}

      {session.isComplete && (
        <InterviewCompleteCard onViewResults={handleCompleteInterview} />
      )}

      <TokenCounter messages={session.messages} />
    </main>
  );
}
