"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  "Just a moment...",
  "We are analyzing your interview data...",
  "Might take just a second more...",
  "Reviewing your responses...",
  "Preparing detailed feedback...",
  "Almost there...",
  "Generating personalized insights...",
  "Finalizing your analysis...",
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

  useEffect(() => {
    if (!isAnalyzing) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(
        (prevIndex) => (prevIndex + 1) % calmingMessages.length,
      );
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [isAnalyzing]);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const interviewData = localStorage.getItem("interviewSession");
        const interviewConfig = localStorage.getItem("interviewConfig");

        if (!interviewData || !interviewConfig) {
          setError(
            "No interview data found. Please complete an interview first.",
          );
          setIsAnalyzing(false);
          return;
        }

        const session = JSON.parse(interviewData);
        const config = JSON.parse(interviewConfig);

        if (!session.messages || session.messages.length === 0) {
          setError("No interview responses found to analyze.");
          setIsAnalyzing(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch("/api/interview/analyze", {
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

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setResults(data.feedback);

          if (user?.uid) {
            try {
              await DatabaseService.saveInterviewResults(
                user.uid,
                session,
                config,
                data.feedback,
              );
            } catch (dbError) {
              console.error("Error saving to database:", dbError);
            }
          }
        } else {
          throw new Error(data.error || "Analysis failed");
        }
      } catch (error) {
        console.error("Analysis error:", error);
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            setError("Analysis timed out. Please try again.");
          } else if (error.message.includes("401")) {
            setError("API authentication failed. Please check configuration.");
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90)
      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    if (score >= 80)
      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    if (score >= 70)
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
    if (score >= 60)
      return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
    return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
  };

  const getScoreLabel = (score: number, passed?: boolean) => {
    if (passed === false) return "Failed Interview";
    if (passed === true && score >= 90) return "Outstanding - Passed";
    if (passed === true && score >= 80) return "Excellent - Passed";
    if (passed === true && score >= 70) return "Good - Passed";
    if (passed === true) return "Passed";
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Improvement";
    return "Below Expectations";
  };

  const getDecisionColor = (passed?: boolean) => {
    if (passed === true) return "text-green-600 dark:text-green-400";
    if (passed === false) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getDecisionBg = (passed?: boolean) => {
    if (passed === true)
      return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
    if (passed === false)
      return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
    return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700";
  };

  if (isAnalyzing) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Analyzing Your Interview
            </h3>
            <p className="text-muted-foreground min-h-[1.5rem] transition-opacity duration-300 text-sm sm:text-base px-2">
              {calmingMessages[currentMessageIndex]}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Analysis Failed
            </h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base px-2">
              {error}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              Please complete an interview to see your results.
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
    <main className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Pass/Fail Decision Banner */}
        {results.passed !== undefined && (
          <Card className={`${getDecisionBg(results.passed)} border-2`}>
            <CardContent className="py-6">
              <div className="text-center">
                <div
                  className={`text-4xl sm:text-5xl font-bold mb-2 ${getDecisionColor(results.passed)}`}
                >
                  {results.passed ? "✓ PASSED" : "✗ FAILED"}
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {results.passed
                    ? "Congratulations! You met the requirements for this position."
                    : `Interview Result: Below passing threshold of ${results.passingThreshold || 70} points`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Score */}
        <Card className={`${getScoreBgColor(results.score)} border-2`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                {/* Background circle */}
                <svg
                  className="w-full h-full transform -rotate-90"
                  role="img"
                  aria-label="Score progress"
                >
                  <title>Interview Score Progress</title>
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - results.score / 100)}`}
                    className={getScoreColor(results.score)}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${getScoreColor(results.score)}`}
                  >
                    {results.score}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    / 100
                  </span>
                </div>
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {getScoreLabel(results.score, results.passed)}
            </CardTitle>
            {results.passingThreshold && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Passing Threshold: {results.passingThreshold} points
              </p>
            )}
            <CardDescription className="text-sm sm:text-base md:text-lg prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none px-2 sm:px-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {results.overallScore}
              </ReactMarkdown>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300 text-base sm:text-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {results.strengths.map((strength) => (
                    <li
                      key={`strength-${strength}`}
                      className="flex items-start"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-green-800 dark:text-green-200">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm sm:text-base text-green-700 dark:text-green-300 italic">
                  No significant strengths demonstrated in this interview.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300 text-base sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                {results.passed === false
                  ? "Critical Weaknesses"
                  : "Areas for Improvement"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.improvements.length > 0 ? (
                <ul className="space-y-2">
                  {results.improvements.map((improvement) => (
                    <li
                      key={`improvement-${improvement}`}
                      className="flex items-start"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-orange-800 dark:text-orange-200">
                        {improvement}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm sm:text-base text-orange-700 dark:text-orange-300 italic">
                  Continue building on your strong foundation.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Why This Decision - Show if available */}
        {results.whyDecision && (
          <Card
            className={results.passed ? "border-blue-200" : "border-red-200"}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                {results.passed ? "Why You Passed" : "Why You Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results.whyDecision}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {results.detailedAnalysis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card
          className={
            results.passed === false
              ? "border-red-200 bg-red-50 dark:bg-red-900/10"
              : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              {results.passed === false
                ? "Required Improvements"
                : "Recommendations"}
            </CardTitle>
            {results.passed === false && (
              <CardDescription className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base">
                These improvements are critical before attempting another
                interview at this level.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {results.recommendations}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {results.nextSteps && results.nextSteps !== results.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results.nextSteps}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 pb-6">
          {results.passed === false && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 border-2">
              <CardContent className="py-4">
                <p className="text-center text-sm sm:text-base text-yellow-800 dark:text-yellow-200 font-semibold">
                  ⚠️ We recommend waiting at least 3-6 months and completing the
                  suggested improvements before attempting another interview at
                  this level.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <Button
              onClick={() => router.push("/configure")}
              className={`${results.passed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"} text-sm sm:text-base`}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {results.passed ? "Try Another Interview" : "Start Over"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="text-sm sm:text-base"
            >
              <Target className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/practice")}
              className="text-sm sm:text-base"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Practice More
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
