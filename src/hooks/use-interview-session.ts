import { useEffect, useState } from "react";
import {
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { getQuestionCountForMode } from "@/lib/utils/interview-helpers";
import type {
  InterviewConfig,
  InterviewSession,
  Message,
} from "../components/interview/types";

export function useInterviewSession(config: InterviewConfig) {
  const [session, setSession] = useState<InterviewSession>(() => {
    // Select interviewer based on company and position for more personalized experience
    const interviewer = config.specificCompany
      ? getInterviewerForCompanyAndRole(config.specificCompany, config.position)
      : getInterviewerForRole(config.position);

    // Determine total questions based on mode
    const totalQuestions = getQuestionCountForMode(
      config.interviewMode,
      config.isDemoMode,
    );

    console.log("🎯 Session initialized:", {
      interviewMode: config.interviewMode,
      isDemoMode: config.isDemoMode,
      totalQuestions,
      interviewerId: interviewer.id,
      specificCompany: config.specificCompany,
      position: config.position,
    });

    return {
      messages: [],
      currentQuestionCount: 0,
      totalQuestions,
      questionIds: [],
      startTime: new Date(),
      isComplete: false,
      isPaused: false,
      isDemoMode: config.isDemoMode,
      hasPersonalizedIntro: false,
      interviewerId: interviewer.id,
      tokenUsage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  });

  // Update totalQuestions when config changes (fixes race condition with URL params loading)
  useEffect(() => {
    const newTotalQuestions = getQuestionCountForMode(
      config.interviewMode,
      config.isDemoMode,
    );
    if (newTotalQuestions !== session.totalQuestions) {
      console.log("🔄 Updating totalQuestions:", {
        from: session.totalQuestions,
        to: newTotalQuestions,
        interviewMode: config.interviewMode,
        isDemoMode: config.isDemoMode,
      });
      setSession((prev) => ({
        ...prev,
        totalQuestions: newTotalQuestions,
      }));
    }
  }, [config.interviewMode, config.isDemoMode, session.totalQuestions]);

  // Update interviewerId when position or company changes (fixes race condition with URL params loading)
  useEffect(() => {
    const interviewer = config.specificCompany
      ? getInterviewerForCompanyAndRole(config.specificCompany, config.position)
      : getInterviewerForRole(config.position);

    if (interviewer.id !== session.interviewerId) {
      console.log("🔄 Updating interviewer:", {
        from: session.interviewerId,
        to: interviewer.id,
        position: config.position,
        specificCompany: config.specificCompany,
        interviewerName: interviewer.name,
      });
      setSession((prev) => ({
        ...prev,
        interviewerId: interviewer.id,
      }));
    }
  }, [config.position, config.specificCompany, session.interviewerId]);

  const addMessage = (message: Message) => {
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const updateSession = (updates: Partial<InterviewSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  };

  const addTokenUsage = (usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }) => {
    if (!usage) return;
    setSession((prev) => ({
      ...prev,
      tokenUsage: {
        prompt_tokens:
          (prev.tokenUsage?.prompt_tokens || 0) + usage.prompt_tokens,
        completion_tokens:
          (prev.tokenUsage?.completion_tokens || 0) + usage.completion_tokens,
        total_tokens: (prev.tokenUsage?.total_tokens || 0) + usage.total_tokens,
      },
    }));
  };

  const incrementQuestionCount = () => {
    setSession((prev) => ({
      ...prev,
      currentQuestionCount: prev.currentQuestionCount + 1,
    }));
  };

  const togglePause = () => {
    setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const completeInterview = () => {
    setSession((prev) => ({ ...prev, isComplete: true }));
  };

  return {
    session,
    addMessage,
    updateSession,
    addTokenUsage,
    incrementQuestionCount,
    togglePause,
    completeInterview,
  };
}
