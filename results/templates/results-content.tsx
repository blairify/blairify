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

const calmingMessages = [
  "Analyzing interview responses...",
  "Evaluating technical competencies...",
  "Assessing communication patterns...",
  "Reviewing problem-solving approaches...",
  "Generating comprehensive feedback...",
  "Finalizing performance insights...",
];

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

  useEffect(() => {
    if (!isAnalyzing) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(
        (prevIndex) => (prevIndex + 1) % calmingMessages.length,
      );
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [isAnalyzing]);

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
          setProgress(100); // Complete progress when analysis is done
          setResults(data.feedback);

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

  const getScoreLabel = (score: number, passed?: boolean) => {
    if (passed === true) {
      if (score >= 90) return "Outstanding Performance";
      if (score >= 80) return "Excellent Performance";
      if (score >= 70) return "Strong Performance";
      return "Satisfactory Performance";
    }
    if (passed === false) {
      if (score >= 60) return "Below Required Standard";
      if (score >= 40) return "Significant Development Required";
      return "Insufficient Competency Demonstrated";
    }
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Developing";
    return "Needs Improvement";
  };

  if (isAnalyzing) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <Card className="w-full max-w-lg border shadow-sm">
          <CardContent className="pt-16 pb-16">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Analyzing Interview Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center min-h-[1.5rem] mb-6">
              {calmingMessages[currentMessageIndex]}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                This may take 30-90 seconds
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <Card className="w-full max-w-lg border border-red-200 dark:border-red-900 shadow-sm">
          <CardContent className="pt-12 pb-12">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">
              Analysis Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <Card className="w-full max-w-lg border shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              No Results Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Complete an interview to receive detailed performance feedback.
            </p>
            <Button onClick={() => router.push("/configure")}>
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Interview Performance Report
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive evaluation and performance analysis
          </p>
        </div>

        {/* Pass/Fail Decision Banner */}
        {results.passed !== undefined && (
          <Card
            className={`border-2 ${results.passed ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"}`}
          >
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {results.passed ? (
                    <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-2xl sm:text-3xl font-bold mb-1 ${results.passed ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100"}`}
                    >
                      {results.passed
                        ? "Candidate Passed"
                        : "Candidate Did Not Pass"}
                    </div>
                    <p
                      className={`text-sm ${results.passed ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}
                    >
                      {results.passed
                        ? "Met all required competency standards for this position."
                        : `Did not meet the ${results.passingThreshold || 70}-point threshold requirement.`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-4xl font-bold ${results.passed ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100"}`}
                  >
                    {results.score}
                  </div>
                  <div
                    className={`text-sm ${results.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    / 100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Score Card */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative w-24 h-24 flex-shrink-0">
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
                    className="text-gray-900 dark:text-gray-100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {results.score}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {getScoreLabel(results.score, results.passed)}
                </h3>
                <div
                  className="prose prose-sm prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={parseFullMarkdown(
                    results.overallScore,
                  )}
                />
              </div>
            </div>
            {results.passingThreshold && (
              <div className="text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
                Passing threshold for this position: {results.passingThreshold}{" "}
                points
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strengths and Improvements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
                <Award className="h-4 w-4 mr-2" />
                Demonstrated Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {results.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {results.strengths.map((strength, index) => (
                    <li
                      key={`strength-${index}`}
                      className="flex items-start text-sm"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-gray-100 mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  No notable strengths identified in this assessment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
                <Target className="h-4 w-4 mr-2" />
                {results.passed === false
                  ? "Critical Gaps"
                  : "Development Areas"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {results.improvements.length > 0 ? (
                <ul className="space-y-3">
                  {results.improvements.map((improvement, index) => (
                    <li
                      key={`improvement-${index}`}
                      className="flex items-start text-sm"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-gray-100 mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {improvement}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  Continue to build upon existing competencies.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Why Decision */}
        {results.whyDecision && (
          <Card className="border shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
                <MessageSquare className="h-4 w-4 mr-2" />
                Assessment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                className="prose prose-sm prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={parseFullMarkdown(results.whyDecision)}
              />
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
              <BarChart3 className="h-4 w-4 mr-2" />
              Detailed Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="prose prose-sm prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={parseFullMarkdown(
                results.detailedAnalysis,
              )}
            />
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
              <Lightbulb className="h-4 w-4 mr-2" />
              {results.passed === false
                ? "Required Improvements"
                : "Development Recommendations"}
            </CardTitle>
            {results.passed === false && (
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Address these areas before reapplying for this position level.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="prose prose-sm prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={parseFullMarkdown(
                results.recommendations,
              )}
            />
          </CardContent>
        </Card>

        {/* Next Steps */}
        {results.nextSteps && results.nextSteps !== results.recommendations && (
          <Card className="border shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-4 w-4 mr-2" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                className="prose prose-sm prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={parseFullMarkdown(results.nextSteps)}
              />
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        {results.passed === false && (
          <Card className="border-l-4 border-l-gray-900 dark:border-l-gray-100 bg-gray-100 dark:bg-gray-900 border-t border-r border-b border-gray-200 dark:border-gray-800">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Recommended Waiting Period
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    A 3-6 month development period is recommended to address
                    identified competency gaps before reapplying for a position
                    at this level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center pb-8 pt-4">
          <Button
            onClick={() => router.push("/configure")}
            variant={results.passed ? "default" : "outline"}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {results.passed ? "New Interview" : "Start Over"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <Target className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/practice")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Practice Mode
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 pb-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Confidential Report • For Professional Development Purposes Only
          </p>
        </div>
      </div>
    </main>
  );
}
