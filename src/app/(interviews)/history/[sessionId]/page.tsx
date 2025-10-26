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
        <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <Button
                aria-label="Back to History"
                onClick={() => router.push("/history")}
                variant="ghost"
                className="mb-4 sm:mb-6 hover:bg-primary/10"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-sm flex-shrink-0">
                    {getInterviewIcon(session.config.interviewType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {session.totalDuration} minutes
                      </span>
                      {session.config.specificCompany && (
                        <Badge variant="secondary" className="font-medium">
                          {session.config.specificCompany}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  {session.scores?.overall ? (
                    <>
                      <div
                        className={`text-5xl sm:text-6xl font-bold px-6 py-3 rounded-2xl shadow-lg ${getScoreColor(session.scores.overall)}`}
                      >
                        {session.scores.overall}%
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground mt-2">
                        Overall Score
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl sm:text-6xl font-bold text-muted-foreground px-6 py-3 rounded-2xl bg-muted/50">
                        N/A
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground mt-2">
                        Analysis Pending
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Score Breakdown - Only show if scores are available */}
            {session.scores && session.scores.overall > 0 && (
              <Card className="mb-6 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <div
                          key={key}
                          className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground">
                              {formatKey(key)}
                            </span>
                            <span
                              className={`text-lg font-bold px-2.5 py-0.5 rounded-lg ${getScoreColor(value)}`}
                            >
                              {value}%
                            </span>
                          </div>
                          <Progress value={value} className="h-2.5" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Configuration */}
            <Card className="mb-6 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <User className="h-5 w-5 text-primary" />
                  Interview Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Position
                    </div>
                    <div className="font-bold text-base capitalize text-foreground">
                      {session.config.position}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Seniority Level
                    </div>
                    <div className="font-bold text-base capitalize text-foreground">
                      {session.config.seniority}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Interview Type
                    </div>
                    <div className="font-bold text-base capitalize text-foreground">
                      {session.config.interviewType}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Mode
                    </div>
                    <Badge
                      variant="default"
                      className="capitalize font-semibold"
                    >
                      {session.config.interviewMode}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Duration
                    </div>
                    <div className="font-bold text-base text-foreground">
                      {session.config.duration} minutes
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Status
                    </div>
                    <Badge
                      variant={
                        session.status === "completed" ? "default" : "secondary"
                      }
                      className="capitalize font-semibold"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions and Responses */}
            {session.questions && session.questions.length > 0 && (
              <Card className="mb-6 border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Questions & Responses ({session.questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 sm:space-y-8">
                    {session.questions.map((question, index) => {
                      const response = session.responses?.find(
                        (r) => r.questionId === question.id,
                      );

                      return (
                        <div
                          key={question.id}
                          className="border-2 border-border/50 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-card to-card/50 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge
                                  variant="default"
                                  className="font-semibold"
                                >
                                  Question {index + 1}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="capitalize font-medium"
                                >
                                  {question.type}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="font-medium"
                                >
                                  Difficulty: {question.difficulty}/10
                                </Badge>
                              </div>
                              <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert mb-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {question.question}
                                </ReactMarkdown>
                              </div>
                              {question.category && (
                                <div className="text-sm text-muted-foreground font-medium">
                                  Category:{" "}
                                  <span className="text-foreground">
                                    {question.category}
                                  </span>
                                </div>
                              )}
                            </div>
                            {response && (
                              <div className="text-center sm:text-right flex-shrink-0">
                                {response.score > 0 ? (
                                  <div
                                    className={`text-3xl sm:text-4xl font-bold px-4 py-2 rounded-xl shadow-sm ${getScoreColor(response.score)}`}
                                  >
                                    {response.score}%
                                  </div>
                                ) : (
                                  <div className="text-3xl sm:text-4xl font-bold text-muted-foreground px-4 py-2 rounded-xl bg-muted/50">
                                    N/A
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2 font-medium">
                                  {Math.round(response.duration / 60)}m{" "}
                                  {response.duration % 60}s
                                </div>
                              </div>
                            )}
                          </div>

                          {response && (
                            <>
                              <Separator className="my-5" />
                              <div className="space-y-5">
                                <div>
                                  <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Your Response:
                                  </div>
                                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-xl border border-border/50">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {response.response ||
                                          "No response recorded"}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                </div>

                                {response.feedback &&
                                  response.feedback !== "Analysis pending" && (
                                    <div>
                                      <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-primary" />
                                        AI Feedback:
                                      </div>
                                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                          >
                                            {response.feedback}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {response.feedback === "Analysis pending" && (
                                  <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                                    <div className="text-sm font-bold mb-2 text-muted-foreground">
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
                    <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xl font-bold">
                          <CheckCircle className="h-6 w-6" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {session.analysis.strengths.map((strength) => (
                            <li
                              key={strength}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                            >
                              <Star className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {strength}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                {/* Areas for Improvement */}
                {session.analysis.improvements &&
                  session.analysis.improvements.length > 0 && (
                    <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xl font-bold">
                          <Lightbulb className="h-6 w-6" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {session.analysis.improvements.map((improvement) => (
                            <li
                              key={improvement}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                            >
                              <Target className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {improvement}
                                </ReactMarkdown>
                              </div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                aria-label="Start New Interview"
                onClick={() => router.push("/configure")}
                size="lg"
                className="w-full sm:w-auto h-12 px-8 font-semibold text-base shadow-lg"
              >
                Start New Interview
              </Button>
              <Button
                aria-label="Practice More Questions"
                onClick={() => router.push("/practice")}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 font-semibold text-base"
              >
                Practice More Questions
              </Button>
              <Button
                aria-label="Export Results"
                onClick={() => router.push("/export")}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 font-semibold text-base"
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
