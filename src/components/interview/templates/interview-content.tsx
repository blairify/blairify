"use client";

import {
  ArrowRight,
  Bot,
  Brain,
  Building,
  CheckCircle,
  Code,
  HelpCircle,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  SkipForward,
  Square,
  Target,
  Timer,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { UserData } from "@/lib/services/auth/auth";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  questionType?: "technical" | "bullet" | "coding" | "system-design";
  isFollowUp?: boolean;
}

interface InterviewSession {
  messages: Message[];
  currentQuestionCount: number;
  totalQuestions: number;
  startTime: Date;
  isComplete: boolean;
  isPaused: boolean;
  isDemoMode: boolean;
  hasPersonalizedIntro: boolean;
}

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

interface InterviewContentProps {
  user: UserData;
}

export function InterviewContent({ user }: InterviewContentProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    position: "Frontend Engineer",
    seniority: "mid",
    technologies: [] as string[],
    companyProfile: "faang",
    specificCompany: "",
    interviewMode: "timed",
    interviewType: "technical",
    duration: "30",
    isDemoMode: false,
    // Job-specific context
    contextType: "",
    jobId: "",
    company: "",
    jobDescription: "",
    jobRequirements: "",
    jobLocation: "",
    jobType: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const technologiesParam = params.get("technologies");
    let technologies: string[] = [];
    if (technologiesParam) {
      try {
        technologies = JSON.parse(technologiesParam);
      } catch {
        technologies = [];
      }
    }

    setConfig({
      position: params.get("position") || "Frontend Engineer",
      seniority: params.get("seniority") || "mid",
      technologies,
      companyProfile: params.get("companyProfile") || "",
      specificCompany: params.get("specificCompany") || "",
      interviewMode: params.get("interviewMode") || "timed",
      interviewType: params.get("interviewType") || "technical",
      duration: params.get("duration") || "30",
      isDemoMode: params.get("demo") === "true",
      // Job-specific context from URL params
      contextType: params.get("contextType") || "",
      jobId: params.get("jobId") || "",
      company: params.get("company") || "",
      jobDescription: params.get("jobDescription") || "",
      jobRequirements: params.get("jobRequirements") || "",
      jobLocation: params.get("jobLocation") || "",
      jobType: params.get("jobType") || "",
    });
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setSession((prev) => ({
        ...prev,
        totalQuestions: config.isDemoMode
          ? 3
          : config.interviewType === "bullet"
            ? 3
            : 8,
        isDemoMode: config.isDemoMode,
      }));

      if (config.interviewMode === "untimed") {
        setTimeRemaining(Number.POSITIVE_INFINITY);
      } else {
        setTimeRemaining(Number.parseInt(config.duration, 10) * 60);
      }
    }
  }, [config, mounted]);

  const [session, setSession] = useState<InterviewSession>({
    messages: [],
    currentQuestionCount: 0,
    totalQuestions: 8,
    startTime: new Date(),
    isComplete: false,
    isPaused: false,
    isDemoMode: false,
    hasPersonalizedIntro: false,
  });

  const [currentMessage, setCurrentMessage] = useState("");
  const [_isRecording, _setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [_isTyping, _setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleCompleteInterview = useCallback(() => {
    setSession((prev) => ({ ...prev, isComplete: true }));

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

    // Store configuration separately (required by results page)
    localStorage.setItem("interviewConfig", JSON.stringify(config));

    // Navigate to results
    window.location.href = "/results";
  }, [session, config]);

  // Timer effect
  useEffect(() => {
    if (
      !isInterviewStarted ||
      session.isPaused ||
      session.isComplete ||
      timeRemaining === Number.POSITIVE_INFINITY
    )
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleCompleteInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isInterviewStarted,
    session.isPaused,
    session.isComplete,
    timeRemaining,
    handleCompleteInterview,
  ]);

  const formatTime = (seconds: number) => {
    if (seconds === Number.POSITIVE_INFINITY) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartInterview = async () => {
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

        setSession((prev) => ({
          ...prev,
          messages: [aiMessage],
          currentQuestionCount: 1,
          hasPersonalizedIntro: true,
        }));
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      // Show error to user
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";
      setSession((prev) => ({
        ...prev,
        messages: [
          {
            id: Date.now().toString(),
            type: "ai",
            content: `I apologize, but there was an error starting the interview: ${errorMessage}. Please check your configuration and try again.`,
            timestamp: new Date(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
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

        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          currentQuestionCount: data.isFollowUp
            ? prev.currentQuestionCount
            : prev.currentQuestionCount + 1,
          isComplete: data.isComplete || false,
        }));

        if (data.isComplete) {
          handleCompleteInterview();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = () => {
    setSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
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

        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          currentQuestionCount: prev.currentQuestionCount + 1,
          isComplete: data.isComplete || false,
        }));

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

  const startSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognition;
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognition;
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const stopSpeechRecognition = () => {
    setIsListening(false);
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="h-4 w-4" />;
      case "bullet":
        return <Target className="h-4 w-4" />;
      case "system-design":
        return <Building className="h-4 w-4" />;
      case "coding":
        return <Brain className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "bullet":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "system-design":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "coding":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (!mounted) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </main>
    );
  }

  if (!isInterviewStarted) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to Start Your Interview?
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your personalized interview session is configured and ready to
              begin.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                Interview Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Position
                  </p>
                  <p className="font-semibold text-sm sm:text-base">
                    {config.position}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Seniority
                  </p>
                  <p className="font-semibold text-sm sm:text-base capitalize">
                    {config.seniority}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Interview Type
                  </p>
                  <Badge
                    className={`${getInterviewTypeColor(config.interviewType)} text-xs sm:text-sm`}
                  >
                    {getInterviewTypeIcon(config.interviewType)}
                    <span className="ml-1 capitalize">
                      {config.interviewType}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Duration
                  </p>
                  <p className="font-semibold text-sm sm:text-base">
                    {config.interviewMode === "untimed"
                      ? "Untimed"
                      : `${config.duration} minutes`}
                  </p>
                </div>
              </div>

              {/* Job-specific context indicator */}
              {config.contextType === "job-specific" && config.company && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="font-semibold text-sm sm:text-base text-primary">
                      Job-Specific Interview
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    This interview is tailored for the{" "}
                    <strong>{config.position}</strong> position at{" "}
                    <strong>{config.company}</strong>
                  </p>
                  {config.jobDescription && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Job Focus:</p>
                      <p className="line-clamp-2">
                        {config.jobDescription.substring(0, 150)}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleStartInterview}
              disabled={isLoading}
              className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Start Interview
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Interview Header - Sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          {/* Top Row: Badge, Timer, Actions */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Badge
                className={`${getInterviewTypeColor(config.interviewType)} text-xs sm:text-sm px-3 py-1.5 flex-shrink-0 font-medium`}
              >
                {getInterviewTypeIcon(config.interviewType)}
                <span className="ml-1.5 capitalize hidden sm:inline">
                  {config.interviewType}
                </span>
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-mono font-bold text-sm sm:text-base text-foreground">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={session.isComplete}
                className="h-9 sm:h-10 px-3 sm:px-4 font-medium"
              >
                {session.isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Pause</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipQuestion}
                disabled={isLoading || session.isComplete}
                className="h-9 sm:h-10 px-3 sm:px-4 font-medium"
              >
                <SkipForward className="h-4 w-4" />
                <span className="ml-2 hidden md:inline">Skip</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCompleteInterview}
                disabled={session.isComplete}
                className="h-9 sm:h-10 px-3 sm:px-4 font-medium"
              >
                <Square className="h-4 w-4" />
                <span className="ml-2 hidden md:inline">End</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-muted-foreground">
                Question Progress
              </span>
              <span className="font-bold text-foreground bg-primary/10 px-2.5 py-0.5 rounded-full">
                {session.currentQuestionCount} / {session.totalQuestions}
              </span>
            </div>
            <Progress
              value={
                (session.currentQuestionCount / session.totalQuestions) * 100
              }
              className="h-2.5"
            />
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-4 ${message.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {message.type === "ai" && (
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl shadow-sm border ${
                  message.type === "user"
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20"
                    : "bg-card text-card-foreground border-border/50"
                }`}
              >
                <div className="p-3 sm:p-4">
                  <div
                    className={`prose prose-sm sm:prose-base max-w-none ${
                      message.type === "user"
                        ? "prose-invert"
                        : "dark:prose-invert"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div
                  className={`px-3 sm:px-4 pb-2 text-[10px] sm:text-xs font-medium ${
                    message.type === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === "user" && (
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-border">
                  <AvatarFallback className="bg-gradient-to-br from-muted to-muted-foreground/20">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                  <Bot className="h-5 w-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Sticky Footer */}
      {!session.isComplete && (
        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your response... (Shift + Enter for new line)"
                  className="min-h-[70px] sm:min-h-[80px] resize-none text-sm sm:text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={session.isPaused || isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={
                    isListening ? stopSpeechRecognition : startSpeechRecognition
                  }
                  variant="outline"
                  size="sm"
                  disabled={session.isPaused || isLoading}
                  className={`h-11 w-11 sm:h-12 sm:w-12 p-0 rounded-xl ${
                    isListening
                      ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-950 dark:border-red-800"
                      : ""
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !currentMessage.trim() || session.isPaused || isLoading
                  }
                  size="sm"
                  className="h-11 w-11 sm:h-12 sm:w-12 p-0 rounded-xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
                  title="Send message (Enter)"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Complete */}
      {session.isComplete && (
        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                    Interview Complete!
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                    Excellent work! Your interview responses are being analyzed
                    to provide detailed feedback.
                  </p>
                  <Button
                    onClick={handleCompleteInterview}
                    size="lg"
                    className="h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  >
                    View Results
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
