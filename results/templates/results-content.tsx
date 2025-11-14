"use client";

import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  FileText,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { addUserXP } from "@/lib/services/users/user-xp";
import { parseFullMarkdown } from "@/lib/utils/markdown-parser";

interface InterviewResults {
  score: number;
  scoreColor: string;
  overallScore: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendations: string;
  nextSteps: string;
  decision?: string;
  passed?: boolean;
  passingThreshold?: number;
  whyDecision?: string;
}

// ============================================================================
// DYNAMIC ANALYSIS MESSAGES
// ============================================================================

const getAnalysisMessages = () => {
  const messageVariants = [
    [
      "Reviewing your technical responses...",
      "Evaluating problem-solving approaches...",
      "Analyzing communication effectiveness...",
      "Assessing professional readiness...",
      "Calculating performance metrics...",
      "Compiling comprehensive feedback...",
    ],
    [
      "Processing interview transcript...",
      "Examining technical depth and accuracy...",
      "Evaluating analytical reasoning...",
      "Reviewing response quality patterns...",
      "Generating detailed insights...",
      "Finalizing performance report...",
    ],
    [
      "Analyzing your interview performance...",
      "Assessing technical competency levels...",
      "Reviewing problem-solving strategies...",
      "Evaluating communication clarity...",
      "Identifying strengths and gaps...",
      "Preparing personalized feedback...",
    ],
  ];

  // Randomly select a variant set for variety
  return messageVariants[Math.floor(Math.random() * messageVariants.length)];
};

// ============================================================================
// OUTCOME MESSAGE GENERATORS
// ============================================================================

const getOutcomeMessage = (score: number, passed: boolean): string => {
  if (passed) {
    if (score >= 90) {
      const messages = [
        "Exceptional performance across all competency areas.",
        "Outstanding demonstration of technical expertise and problem-solving.",
        "Impressive depth of knowledge and professional communication.",
        "Excellent interview showcasing strong technical fundamentals.",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (score >= 80) {
      const messages = [
        "Strong performance with solid technical foundation.",
        "Good demonstration of core competencies and practical knowledge.",
        "Competent showing with clear understanding of key concepts.",
        "Solid interview performance meeting role requirements.",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    const messages = [
      "Satisfactory performance meeting minimum requirements.",
      "Adequate demonstration of foundational competencies.",
      "Acceptable performance with room for continued growth.",
      "Met the passing threshold with baseline knowledge demonstrated.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Failed outcomes - direct but growth-focused
  if (score >= 60) {
    const messages = [
      "Close to passing - focus on strengthening key technical areas.",
      "Near the threshold - targeted preparation will bridge remaining gaps.",
      "Some competencies demonstrated - additional study needed in core areas.",
      "Approaching requirements - focused development will improve candidacy.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  if (score >= 40) {
    const messages = [
      "Significant knowledge gaps identified - systematic learning required.",
      "Foundational skills need development before reapplying at this level.",
      "Multiple competency areas require focused improvement.",
      "Substantial preparation needed to meet position requirements.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  const messages = [
    "Critical gaps in required competencies - extensive preparation recommended.",
    "Fundamental knowledge building needed before pursuing this level.",
    "Insufficient demonstration of core skills - consider foundational training.",
    "Significant development required across all competency areas.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

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

interface ResultsContentProps {
  user: UserData;
}

export function ResultsContent({ user }: ResultsContentProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisMessages] = useState(() => getAnalysisMessages());
  const [outcomeMessage, setOutcomeMessage] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Set current date on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (!isAnalyzing) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(
        (prevIndex) => (prevIndex + 1) % analysisMessages.length,
      );
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [isAnalyzing, analysisMessages.length]);

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
          setOutcomeMessage(
            getOutcomeMessage(
              data.feedback.score,
              data.feedback.passed || false,
            ),
          );

          if (user?.uid) {
            try {
              await DatabaseService.saveInterviewResults(
                user.uid,
                session,
                config,
                data.feedback,
              );

              // Update XP, levels, badges
              const xpResult = await addUserXP(
                user.uid,
                data.feedback.score, // AI score
                data.feedback.totalDuration || 0,
              );

              console.log("XP Update:", xpResult);
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
  }, [user?.uid]);

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isAnalyzing) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Card className="w-full max-w-lg border shadow-lg animate-in fade-in duration-500">
          <CardContent className="pt-16 pb-16">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 dark:border-t-indigo-500 rounded-full animate-spin"
                  style={{
                    animationDuration: "1.5s",
                    animationDirection: "reverse",
                  }}
                ></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100 animate-in fade-in slide-in-from-top-2 duration-700">
              Analyzing Your Performance
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 text-center min-h-[3rem] mb-8 leading-relaxed px-4 animate-in fade-in duration-500">
              {analysisMessages[currentMessageIndex]}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Analysis Progress
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Usually takes 30-90 seconds
              </div>
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
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Card className="w-full max-w-lg border-2 border-red-200 dark:border-red-900 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-12 pb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Analysis Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="hover:scale-105 transition-transform"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="hover:scale-105 transition-transform"
              >
                Return to Dashboard
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
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Card className="w-full max-w-lg border shadow-lg animate-in fade-in duration-500">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              No Results Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-4">
              Complete an interview to receive detailed performance feedback and
              insights.
            </p>
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

  // ============================================================================
  // RENDER: RESULTS DISPLAY
  // ============================================================================

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ============================================================================ */}
        {/* HEADER SECTION */}
        {/* ============================================================================ */}
        <header className="text-center border-b border-gray-200 dark:border-gray-800 pb-8 mb-2 animate-in fade-in slide-in-from-top-2 duration-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Interview Performance Report
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Comprehensive evaluation and personalized insights for your
            professional development
          </p>
        </header>

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
                    <p
                      className={`text-lg leading-relaxed mb-2 ${
                        results.passed
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {outcomeMessage}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Final Score:</span>
                      <span
                        className={`font-bold text-xl ${
                          results.passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {results.score}/100
                      </span>
                      {results.passingThreshold && (
                        <span className="text-gray-500">
                          (threshold: {results.passingThreshold})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================================ */}
        {/* OVERALL ASSESSMENT */}
        {/* ============================================================================ */}
        <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                  <span
                    className={`text-3xl font-bold ${results.passed ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100"}`}
                  >
                    {results.score}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {getPerformanceLabel(results.score, results.passed)}
                </h3>
                <div
                  className="prose prose-base prose-gray dark:prose-invert max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={parseFullMarkdown(
                    results.overallScore,
                  )}
                />
              </div>
            </div>
            {results.passingThreshold && (
              <div className="text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
                Passing threshold for this position: {results.passingThreshold}{" "}
                points
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================================================ */}
        {/* STRENGTHS & IMPROVEMENTS GRID */}
        {/* ============================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-left-4 duration-700">
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
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    Building foundational skills - keep developing your
                    technical expertise!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-right-4 duration-700">
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
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {improvement}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    Excellent foundation - continue building advanced
                    competencies!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============================================================================ */}
        {/* DETAILED PERFORMANCE ANALYSIS */}
        {/* ============================================================================ */}
        {results.whyDecision && (
          <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Detailed Performance Analysis
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {results.passed === false
                  ? "Key factors in the evaluation decision"
                  : "Understanding your performance evaluation"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div
                className="prose prose-base prose-gray dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={parseFullMarkdown(
                  results.detailedAnalysis,
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* ============================================================================ */}
        {/* RECOMMENDATIONS / DEVELOPMENT PLAN */}
        {/* ============================================================================ */}
        <Card
          className={`border shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ${
            results.passed === false
              ? "border-red-200 dark:border-red-800"
              : "border-emerald-200 dark:border-emerald-800"
          }`}
        >
          <CardHeader
            className={`border-b pb-4 ${
              results.passed === false
                ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-700/50"
                : "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200/50 dark:border-emerald-700/50"
            }`}
          >
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Lightbulb
                className={`h-5 w-5 ${
                  results.passed === false
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              />
              {results.passed === false
                ? "Development Roadmap"
                : "Growth Recommendations"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {results.passed === false
                ? "Your personalized plan for technical growth"
                : "Strategies to elevate your expertise"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="prose prose-base prose-gray dark:prose-invert max-w-none leading-relaxed"
              dangerouslySetInnerHTML={parseFullMarkdown(
                results.recommendations,
              )}
            />
          </CardContent>
        </Card>

        {/* ============================================================================ */}
        {/* NEXT STEPS */}
        {/* ============================================================================ */}
        {results.nextSteps && results.nextSteps !== results.recommendations && (
          <Card className="border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Next Steps & Action Plan
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Concrete actions to implement your development plan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                className="prose prose-base prose-gray dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={parseFullMarkdown(results.nextSteps)}
              />
            </CardContent>
          </Card>
        )}

        {/* ============================================================================ */}
        {/* DEVELOPMENT NOTICE */}
        {/* ============================================================================ */}
        {results.passed === false && (
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Recommended Development Timeline
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    A 3-6 month focused development period is recommended to
                    address identified competency gaps. Use this time to
                    strengthen your technical foundation and communication
                    skills before reapplying for positions at this level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================================ */}
        {/* ACTION BUTTONS */}
        {/* ============================================================================ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            onClick={() => router.push("/configure")}
            variant={results.passed ? "default" : "outline"}
            className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {results.passed ? "Take Another Interview" : "Try Again"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            <Target className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/practice")}
            className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Practice Mode
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* FOOTER */}
        {/* ============================================================================ */}
        <footer className="text-center pt-8 pb-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Confidential Assessment • Generated for Professional Development
            {currentDate && ` • ${currentDate}`}
          </p>
        </footer>
      </div>
    </main>
  );
}
