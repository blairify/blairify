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
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";

interface InterviewResults {
  score: number;
  scoreColor: string;
  overallScore: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendations: string;
  nextSteps: string;
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

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              console.log("Interview results saved to database");
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

  if (authLoading || isAnalyzing) {
    return authLoading ? (
      <LoadingPage />
    ) : (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-auto flex items-center justify-center">
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
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-auto flex items-center justify-center">
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
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-auto flex items-center justify-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Overall Score */}
            <Card className={`${getScoreBgColor(results.score)} border-2`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
                    <div
                      className={`absolute inset-0 w-24 h-24 rounded-full border-8 border-transparent ${getScoreColor(results.score).replace("text-", "border-")}`}
                      style={{
                        borderTopColor: "currentColor",
                        borderRightColor: "currentColor",
                        transform: `rotate(${(results.score / 100) * 360}deg)`,
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-2xl font-bold ${getScoreColor(results.score)}`}
                      >
                        {results.score}
                      </span>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">
                  Overall Performance
                </CardTitle>
                <CardDescription className="text-lg prose prose-gray dark:prose-invert max-w-none">
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
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.strengths.map((strength) => (
                      <li key={strength} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-green-800 dark:text-green-200">
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                    <Target className="h-5 w-5 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.improvements.map((improvement) => (
                      <li key={improvement} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-orange-800 dark:text-orange-200">
                          {improvement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {results.detailedAnalysis}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {results.recommendations}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {results.nextSteps}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <Button
                onClick={() => router.push("/configure")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                <Target className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/practice")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Practice More
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
