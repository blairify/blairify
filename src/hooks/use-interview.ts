/**
 * Interview Management Hook
 * Client-side hook for interview interactions
 */

import { useCallback, useState } from "react";
import { InterviewService } from "@/lib/services/interview/interview-service";
import type {
  InterviewApiRequest,
  InterviewApiResponse,
  InterviewConfig,
  Message,
  QuestionType,
} from "@/types/interview";

export interface UseInterviewOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export interface UseInterviewReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (
    message: string,
    conversationHistory: Message[],
    config: InterviewConfig,
    questionCount: number,
    isFollowUp?: boolean,
  ) => Promise<Message | null>;

  checkFollowUp: (
    message: string,
    conversationHistory: Message[],
    config: InterviewConfig,
    questionCount: number,
  ) => Promise<boolean>;

  clearError: () => void;
}

export function useInterview(
  options: UseInterviewOptions = {},
): UseInterviewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationHistory: Message[],
      config: InterviewConfig,
      questionCount: number,
      isFollowUp = false,
    ): Promise<Message | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const requestBody: InterviewApiRequest = {
          message,
          conversationHistory,
          interviewConfig: config,
          questionCount,
          isFollowUp,
        };

        const response = await fetch("/api/interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data: InterviewApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get AI response");
        }

        // Create message object
        const aiMessage = InterviewService.createMessage(
          "ai",
          data.message ||
            "I apologize, but I encountered an error. Could you please try again?",
          data.questionType as QuestionType,
          isFollowUp,
        );

        options.onSuccess?.(data.message || "");
        return aiMessage;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        options.onError?.(errorMessage);

        // Return error message as AI response
        return InterviewService.createMessage(
          "ai",
          "I apologize, but I'm experiencing technical difficulties. Could you please try again or rephrase your response?",
          config.interviewType as QuestionType,
          isFollowUp,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  const checkFollowUp = useCallback(
    async (
      message: string,
      conversationHistory: Message[],
      config: InterviewConfig,
      questionCount: number,
    ): Promise<boolean> => {
      try {
        const requestBody: InterviewApiRequest = {
          message,
          conversationHistory,
          interviewConfig: config,
          questionCount,
          checkFollowUpOnly: true,
        };

        const response = await fetch("/api/interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          console.warn("Follow-up check failed, using fallback logic");
          return InterviewService.shouldGenerateFollowUp(
            message,
            conversationHistory,
            config,
            questionCount,
          );
        }

        const data: InterviewApiResponse = await response.json();
        return data.success && data.shouldFollowUp === true;
      } catch (error) {
        console.warn("Follow-up check error, using fallback logic:", error);
        return InterviewService.shouldGenerateFollowUp(
          message,
          conversationHistory,
          config,
          questionCount,
        );
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    sendMessage,
    checkFollowUp,
    clearError,
  };
}
