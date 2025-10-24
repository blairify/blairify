"use client";

import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Download,
  Lightbulb,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LoadingPage from "@/components/common/atoms/loading-page";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";
import type { InterviewSession } from "@/types/firestore";

export default function SessionDetailsPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const sessionId = params.sessionId as string;

  useEffect(() => {
    const loadSession = async () => {
      if (!user?.uid || !sessionId) {
        setError("Missing user or session information");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionData = await DatabaseService.getSession(
          user.uid,
          sessionId,
        );

        if (!sessionData) {
          setError("Session not found");
          setLoading(false);
          return;
        }

        setSession(sessionData);
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [user?.uid, sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="h-5 w-5" />;
      case "bullet":
        return <Target className="h-5 w-5" />;
      case "system-design":
        return <Target className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  if (error || !session) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button
                  onClick={() => router.push("/history")}
                  aria-label="Back to History"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
              </div>
            </div>
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
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <Button
                aria-label="Back to History"
                onClick={() => router.push("/history")}
                variant="ghost"
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    {getInterviewIcon(session.config.interviewType)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {session.config.position
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}{" "}
                      Interview
                    </h1>
                    <div className="flex items-center space-x-4 text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(session.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.totalDuration} minutes
                      </span>
                      {session.config.specificCompany && (
                        <Badge variant="secondary">
                          {session.config.specificCompany}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {session.scores?.overall ? (
                    <>
                      <div
                        className={`text-4xl font-bold ${getScoreColor(session.scores.overall)}`}
                      >
                        {session.scores.overall}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Overall Score
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-muted-foreground">
                        N/A
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Analysis Pending
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Score Breakdown - Only show if scores are available */}
            {session.scores && session.scores.overall > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(session.scores).map(([key, value]) => {
                      if (key === "overall" || !value) return null;

                      const formatKey = (str: string) => {
                        return str
                          .split(/(?=[A-Z])/)
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ");
                      };

                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {formatKey(key)}
                            </span>
                            <span
                              className={`text-sm font-bold ${getScoreColor(value)}`}
                            >
                              {value}%
                            </span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Configuration */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Interview Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Position
                    </div>
                    <div className="font-medium capitalize">
                      {session.config.position}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Seniority Level
                    </div>
                    <div className="font-medium capitalize">
                      {session.config.seniority}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Interview Type
                    </div>
                    <div className="font-medium capitalize">
                      {session.config.interviewType}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Mode</div>
                    <Badge variant="outline" className="capitalize">
                      {session.config.interviewMode}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Duration
                    </div>
                    <div className="font-medium">
                      {session.config.duration} minutes
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge
                      variant={
                        session.status === "completed" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions and Responses */}
            {session.questions && session.questions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Questions & Responses ({session.questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {session.questions.map((question, index) => {
                      const response = session.responses?.find(
                        (r) => r.questionId === question.id,
                      );

                      return (
                        <div
                          key={question.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">
                                  Question {index + 1}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {question.type}
                                </Badge>
                                <Badge variant="outline">
                                  Difficulty: {question.difficulty}/10
                                </Badge>
                              </div>
                              <h4 className="font-medium text-lg mb-2">
                                {question.question}
                              </h4>
                              {question.category && (
                                <div className="text-sm text-muted-foreground">
                                  Category: {question.category}
                                </div>
                              )}
                            </div>
                            {response && (
                              <div className="text-right">
                                {response.score > 0 ? (
                                  <div
                                    className={`text-xl font-bold ${getScoreColor(response.score)}`}
                                  >
                                    {response.score}%
                                  </div>
                                ) : (
                                  <div className="text-xl font-bold text-muted-foreground">
                                    N/A
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(response.duration / 60)}m{" "}
                                  {response.duration % 60}s
                                </div>
                              </div>
                            )}
                          </div>

                          {response && (
                            <>
                              <Separator className="my-3" />
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm font-medium mb-1">
                                    Your Response:
                                  </div>
                                  <div className="bg-muted p-3 rounded text-sm">
                                    {response.response ||
                                      "No response recorded"}
                                  </div>
                                </div>

                                {response.feedback &&
                                  response.feedback !== "Analysis pending" && (
                                    <div>
                                      <div className="text-sm font-medium mb-1">
                                        AI Feedback:
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {response.feedback}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  )}

                                {response.feedback === "Analysis pending" && (
                                  <div>
                                    <div className="text-sm font-medium mb-1 text-muted-foreground">
                                      AI Analysis Pending
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Detailed feedback requires AI service
                                      configuration.
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                  <div>
                                    Confidence: {response.confidence}/10
                                  </div>
                                  <div className="flex gap-4">
                                    {response.keyPoints &&
                                      response.keyPoints.length > 0 && (
                                        <span className="text-green-600">
                                          ✓ {response.keyPoints.length} key
                                          points covered
                                        </span>
                                      )}
                                    {response.missedPoints &&
                                      response.missedPoints.length > 0 && (
                                        <span className="text-orange-600">
                                          ⚠ {response.missedPoints.length}{" "}
                                          points missed
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis & Feedback */}
            {session.analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                {session.analysis.strengths &&
                  session.analysis.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {session.analysis.strengths.map((strength) => (
                            <li
                              key={strength}
                              className="flex items-start gap-2"
                            >
                              <Star className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                {/* Areas for Improvement */}
                {session.analysis.improvements &&
                  session.analysis.improvements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <Lightbulb className="h-5 w-5" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {session.analysis.improvements.map((improvement) => (
                            <li
                              key={improvement}
                              className="flex items-start gap-2"
                            >
                              <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}

            {/* Summary and Recommendations */}
            {session.analysis &&
              (session.analysis.summary ||
                session.analysis.recommendations) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {session.analysis.summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Interview Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {session.analysis.summary}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {session.analysis.recommendations &&
                    session.analysis.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {session.analysis.recommendations.map(
                              (rec, index) => (
                                <li
                                  key={rec}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className="text-sm">{rec}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                aria-label="Start New Interview"
                onClick={() => router.push("/configure")}
                className="w-full sm:w-auto"
              >
                Start New Interview
              </Button>
              <Button
                aria-label="Practice More Questions"
                onClick={() => router.push("/practice")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Practice More Questions
              </Button>
              <Button
                aria-label="Export Results"
                onClick={() => router.push("/export")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
