/**
 * Interview Analysis Hook
 * Client-side hook for interview analysis
 */

import { useCallback, useState } from "react";
import type {
  AnalyzeApiRequest,
  AnalyzeApiResponse,
  InterviewConfig,
  InterviewResults,
  Message,
} from "@/types/interview";

export interface UseInterviewAnalysisOptions {
  onError?: (error: string) => void;
  onSuccess?: (results: InterviewResults) => void;
  timeout?: number; // milliseconds
}

export interface UseInterviewAnalysisReturn {
  // State
  isAnalyzing: boolean;
  results: InterviewResults | null;
  error: string | null;
  rawAnalysis: string | null;

  // Actions
  analyzeInterview: (
    conversationHistory: Message[],
    config: InterviewConfig,
  ) => Promise<InterviewResults | null>;

  clearResults: () => void;
  clearError: () => void;
}

export function useInterviewAnalysis(
  options: UseInterviewAnalysisOptions = {},
): UseInterviewAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string | null>(null);

  const { timeout = 30000 } = options;

  const clearResults = useCallback(() => {
    setResults(null);
    setRawAnalysis(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const analyzeInterview = useCallback(
    async (
      conversationHistory: Message[],
      config: InterviewConfig,
    ): Promise<InterviewResults | null> => {
      try {
        setIsAnalyzing(true);
        setError(null);
        setResults(null);
        setRawAnalysis(null);

        // Validate inputs
        if (!conversationHistory || conversationHistory.length === 0) {
          throw new Error("No interview responses found to analyze");
        }

        const requestBody: AnalyzeApiRequest = {
          conversationHistory,
          interviewConfig: config,
        };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch("/api/interview/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data: AnalyzeApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Analysis failed");
        }

        if (!data.feedback) {
          throw new Error("No analysis results received");
        }

        setResults(data.feedback);
        setRawAnalysis(data.rawAnalysis || null);
        options.onSuccess?.(data.feedback);

        return data.feedback;
      } catch (err) {
        let errorMessage = "Failed to analyze interview responses";

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            errorMessage = "Analysis timed out. Please try again.";
          } else if (err.message.includes("401")) {
            errorMessage =
              "API authentication failed. Please check configuration.";
          } else if (err.message.includes("timeout")) {
            errorMessage = "Analysis request timed out. Please try again.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [options, timeout],
  );

  return {
    isAnalyzing,
    results,
    error,
    rawAnalysis,
    analyzeInterview,
    clearResults,
    clearError,
  };
}
