"use client";

import {
  ArrowRight,
  Bot,
  Brain,
  Building,
  CheckCircle,
  Clock,
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
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";

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

export default function InterviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Type definitions for Speech Recognition API
  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: {
        [index: number]: {
          transcript: string;
        };
      };
    };
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }

  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
  }

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
          console.log("Speech recognition started");
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setCurrentMessage(transcript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const getAIResponse = async (
    userMessage: string,
    questionCount: number,
    isFollowUp = false,
  ): Promise<Message> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: session.messages,
          interviewConfig: config,
          questionCount,
          isFollowUp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: data.questionType as
            | "technical"
            | "bullet"
            | "coding"
            | "system-design",
          isFollowUp,
        };
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      return {
        id: `ai-error-${Date.now()}`,
        type: "ai",
        content:
          "I apologize, but I'm experiencing technical difficulties. Could you please try again or rephrase your response?",
        timestamp: new Date(),
        questionType: config.interviewType as
          | "technical"
          | "bullet"
          | "coding"
          | "system-design",
        isFollowUp,
      };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    if (
      !isInterviewStarted ||
      session.isComplete ||
      session.isPaused ||
      config.interviewMode === "untimed"
    )
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSession((prev) => ({ ...prev, isComplete: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isInterviewStarted,
    session.isComplete,
    session.isPaused,
    config.interviewMode,
  ]);

  const formatTime = (seconds: number) => {
    if (seconds === Number.POSITIVE_INFINITY) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const pauseInterview = () => {
    setSession((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeInterview = () => {
    setSession((prev) => ({ ...prev, isPaused: false }));
  };

  const stopInterview = () => {
    setSession((prev) => ({ ...prev, isComplete: true }));

    const sessionData = {
      ...session,
      isComplete: true,
      endedEarly: true,
      endTime: new Date(),
    };

    localStorage.setItem("interviewSession", JSON.stringify(sessionData));
    localStorage.setItem("interviewConfig", JSON.stringify(config));
  };

  const startInterview = async () => {
    setIsInterviewStarted(true);

    setSession((prev) => ({
      ...prev,
      messages: [],
      startTime: new Date(),
      hasPersonalizedIntro: true,
    }));

    try {
      const firstQuestion = await getAIResponse("", 0);
      setSession((prev) => ({
        ...prev,
        messages: [firstQuestion],
        currentQuestionCount: 1,
      }));
    } catch (error) {
      console.error("Error getting first question:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Use intelligent follow-up decision instead of random
      let shouldFollowUp = false;
      if (session.currentQuestionCount < session.totalQuestions) {
        try {
          const followUpResponse = await fetch("/api/interview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: currentMessage,
              conversationHistory: session.messages,
              interviewConfig: config,
              questionCount: session.currentQuestionCount,
              checkFollowUpOnly: true,
            }),
          });

          const followUpData = await followUpResponse.json();
          shouldFollowUp = followUpData.success && followUpData.shouldFollowUp;
        } catch (error) {
          console.error("Error checking follow-up decision:", error);
          // Fallback to simpler logic if API fails
          shouldFollowUp =
            session.currentQuestionCount < session.totalQuestions &&
            currentMessage.trim().length > 50;
        }
      }

      let aiResponse: Message;

      if (session.currentQuestionCount >= session.totalQuestions) {
        aiResponse = {
          id: `ai-complete-${Date.now()}`,
          type: "ai",
          content: session.isDemoMode
            ? "Great job exploring the demo! You've seen how our AI interview system works - it's conversational, supportive, and designed to help you showcase your best self. When you're ready for a full interview, just head back to the configure page. Thanks for trying it out!"
            : "Excellent work! That concludes our interview session. You've demonstrated strong knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!",
          timestamp: new Date(),
        };

        if (!session.isDemoMode) {
          const updatedSession = {
            ...session,
            messages: [...session.messages, userMessage, aiResponse],
            isComplete: true,
            endTime: new Date(),
          };

          localStorage.setItem(
            "interviewSession",
            JSON.stringify(updatedSession),
          );
          localStorage.setItem("interviewConfig", JSON.stringify(config));

          if (user?.uid) {
            try {
              console.log(
                "Interview completed, will save to database after analysis",
              );
            } catch (error) {
              console.error("Error saving interview to database:", error);
            }
          }
        }

        setSession((prev) => ({ ...prev, isComplete: true }));
      } else {
        aiResponse = await getAIResponse(
          currentMessage,
          session.currentQuestionCount,
          shouldFollowUp,
        );

        if (!shouldFollowUp) {
          setSession((prev) => ({
            ...prev,
            currentQuestionCount: prev.currentQuestionCount + 1,
          }));
        }
      }

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const skipQuestion = async () => {
    if (isLoading || session.isPaused) return;

    const skipMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: "[Question skipped]",
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, skipMessage],
    }));

    setCurrentMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(
        "[Question skipped]",
        session.currentQuestionCount,
        false,
      );

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        currentQuestionCount: prev.currentQuestionCount + 1,
      }));
    } catch (error) {
      console.error("Error skipping question:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const submitDontKnow = async () => {
    if (isLoading || session.isPaused) return;

    const dontKnowMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: "I don't know",
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, dontKnowMessage],
    }));

    setCurrentMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(
        "I don't know",
        session.currentQuestionCount,
        false,
      );

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        currentQuestionCount: prev.currentQuestionCount + 1,
      }));
    } catch (error) {
      console.error("Error submitting 'I don't know':", error);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isListening) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  if (!isInterviewStarted) {
    return (
      <div className="h-screen flex overflow-hidden">
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {!mounted
                    ? "Ready to Start?"
                    : config.isDemoMode
                      ? "Try the Demo!"
                      : "Ready to Start?"}
                </CardTitle>
                <CardDescription className="text-lg">
                  {!mounted ? (
                    <>
                      Your AI-powered technical interview for{" "}
                      <span className="font-semibold">Frontend Engineer</span>
                    </>
                  ) : mounted && config.isDemoMode ? (
                    "Experience our AI interview system with a quick, no-pressure demo"
                  ) : mounted ? (
                    <>
                      Your AI-powered {config.interviewType} interview for{" "}
                      <span className="font-semibold">{config.position}</span>
                    </>
                  ) : (
                    "Loading interview configuration..."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mounted && !config.isDemoMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {config.interviewMode === "untimed"
                          ? "Untimed"
                          : `${config.duration} minutes`}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {config.seniority} Level
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        {config.interviewType}
                      </Badge>
                      {config.specificCompany && (
                        <Badge
                          variant="outline"
                          className="w-full justify-center"
                        >
                          <Building className="h-3 w-3 mr-1" />
                          {config.specificCompany}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {mounted && config.isDemoMode && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <Badge variant="outline" className="mb-3">
                      Demo Mode
                    </Badge>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      What to Expect:
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Just 2-3 casual practice questions</li>
                      <li>• No scoring or recording</li>
                      <li>• Try voice input and chat features</li>
                      <li>• Get comfortable with the interface</li>
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {config.isDemoMode ? "Demo Tips:" : "Interview Tips:"}
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {config.isDemoMode ? (
                      <>
                        <li>• Relax and explore - this is just practice!</li>
                        <li>• Try the voice recording feature</li>
                        <li>• Ask questions to see how the AI responds</li>
                        <li>• Check out the pause/stop controls</li>
                      </>
                    ) : (
                      <>
                        <li>
                          • Think out loud to show your problem-solving process
                        </li>
                        <li>• Ask clarifying questions when needed</li>
                        <li>• Use specific examples from your experience</li>
                        <li>
                          • Take your time to understand each question fully
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <Button onClick={startInterview} className="w-full " size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  {config.isDemoMode ? "Start Demo" : "Start Interview"}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-purple-900 rounded-full">
                <Brain className="h-6 w-6 text-muted-foreground dark:text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Interview Session</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.position} • {config.seniority} level
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {config.interviewMode !== "untimed" && !session.isDemoMode && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span
                    className={`font-mono font-bold ${
                      timeRemaining < 300
                        ? "text-red-500"
                        : timeRemaining < 600
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                  {session.isPaused && (
                    <Badge variant="secondary" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
              )}

              {session.isDemoMode && (
                <Badge variant="outline" className="text-xs">
                  Demo Mode
                </Badge>
              )}

              <div className="flex items-center space-x-2">
                <Progress
                  value={
                    (session.currentQuestionCount / session.totalQuestions) *
                    100
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {session.currentQuestionCount}/{session.totalQuestions}
                </span>
              </div>

              {/* Interview Controls */}
              <div className="flex items-center space-x-2">
                {!session.isComplete && (
                  <>
                    {session.isPaused ? (
                      <Button
                        onClick={resumeInterview}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseInterview}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button
                      onClick={stopInterview}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[90%] sm:max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                } items-start space-x-3`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 shadow-sm border"
                  }`}
                >
                  {message.type === "ai" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  {message.questionType && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {message.questionType}
                      {message.isFollowUp && " • Follow-up"}
                    </Badge>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[90%] sm:max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 shadow-sm border rounded-lg p-4">
                  <div className="flex space-x-1">
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
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!session.isComplete && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4">
            {session.isPaused && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Interview is paused. Click Resume to continue.
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    session.isPaused
                      ? "Interview paused..."
                      : "Type your response here..."
                  }
                  className="min-h-[60px] resize-none"
                  disabled={isLoading || session.isPaused}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || session.isPaused}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={skipQuestion}
                  disabled={isLoading || session.isPaused}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                  title="Skip this question"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  onClick={submitDontKnow}
                  disabled={isLoading || session.isPaused}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700 border-gray-300 hover:border-gray-400"
                  title="I don't know"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant="outline"
                  size="sm"
                  className={isRecording ? "text-red-500" : ""}
                  disabled={session.isPaused}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Complete */}
        {session.isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              {session.isDemoMode ? "Demo Complete!" : "Interview Complete!"}
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              {session.isDemoMode
                ? "Thanks for trying the demo! Ready for the real thing? Configure your interview settings and let's get started."
                : "Great job! Your interview responses are being analyzed."}
            </p>
            <div className="flex gap-3 justify-center">
              {session.isDemoMode ? (
                <>
                  <Button
                    onClick={() => {
                      window.location.href = "/configure";
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Real Interview
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                    variant="outline"
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = "/results";
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
