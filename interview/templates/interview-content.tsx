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
    localStorage.setItem(
      "interviewSession",
      JSON.stringify({
        ...session,
        messages: session.messages,
        endTime: new Date(),
        totalDuration: Math.round(
          (Date.now() - session.startTime.getTime()) / 1000 / 60,
        ),
        config,
      }),
    );

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

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: config.interviewType as any,
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
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to Start Your Interview?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your personalized interview session is configured and ready to
              begin.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Interview Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Position
                  </p>
                  <p className="font-semibold">{config.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Seniority
                  </p>
                  <p className="font-semibold capitalize">{config.seniority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interview Type
                  </p>
                  <Badge
                    className={getInterviewTypeColor(config.interviewType)}
                  >
                    {getInterviewTypeIcon(config.interviewType)}
                    <span className="ml-1 capitalize">
                      {config.interviewType}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration
                  </p>
                  <p className="font-semibold">
                    {config.interviewMode === "untimed"
                      ? "Untimed"
                      : `${config.duration} minutes`}
                  </p>
                </div>
              </div>

              {/* Job-specific context indicator */}
              {config.contextType === "job-specific" && config.company && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">
                      Job-Specific Interview
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
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
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
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
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Interview Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className={getInterviewTypeColor(config.interviewType)}>
              {getInterviewTypeIcon(config.interviewType)}
              <span className="ml-1 capitalize">
                {config.interviewType} Interview
              </span>
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseResume}
              disabled={session.isComplete}
            >
              {session.isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipQuestion}
              disabled={isLoading || session.isComplete}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCompleteInterview}
              disabled={session.isComplete}
            >
              <Square className="h-4 w-4 mr-1" />
              End
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {session.currentQuestionCount} / {session.totalQuestions}{" "}
              questions
            </span>
          </div>
          <Progress
            value={
              (session.currentQuestionCount / session.totalQuestions) * 100
            }
            className="h-2"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "ai" && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.type === "user" && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!session.isComplete && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[60px] resize-none"
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
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !currentMessage.trim() || session.isPaused || isLoading
                }
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Complete */}
      {session.isComplete && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Interview Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Great job! Your interview responses are being analyzed.
                </p>
                <Button onClick={handleCompleteInterview}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
