import { Clock, MessageSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AvatarIconDisplay } from "@/components/common/atoms/avatar-icon-selector";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { InterviewerProfile } from "@/lib/config/interviewers";
import { useAuth } from "@/providers/auth-provider";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  interviewer: InterviewerProfile;
  isLatest?: boolean;
}

export function MessageBubble({
  message,
  interviewer,
  isLatest = false,
}: MessageBubbleProps) {
  const { user, userData } = useAuth();

  const [displayedContent, setDisplayedContent] = useState(message.content);

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isUser = message.type === "user";
  const isAI = message.type === "ai";

  useEffect(() => {
    if (!isAI || !isLatest) {
      setDisplayedContent(message.content);
      return;
    }

    const words = message.content.split(" ");

    if (words.length <= 1) {
      setDisplayedContent(message.content);
      return;
    }

    setDisplayedContent("");

    let index = 0;
    let timeout: number | null = null;
    const baseDelay = 65;
    const delayVariance = 70;

    const scheduleNext = () => {
      timeout = window.setTimeout(
        () => {
          index += 1;
          setDisplayedContent(words.slice(0, index).join(" "));

          if (index < words.length) {
            scheduleNext();
          }
        },
        baseDelay + Math.random() * delayVariance,
      );
    };

    scheduleNext();

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [isAI, isLatest, message.content]);

  return (
    <div
      className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500 ${
        isLatest ? "animate-in slide-in-from-bottom-4" : ""
      }`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="relative">
          <div className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20 rounded-full overflow-hidden shadow-md">
            <InterviewerAvatar interviewer={interviewer} size={40} />
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] min-w-0">
        {/* Message Header */}
        <div
          className={`flex items-center gap-2 text-xs text-muted-foreground ${isUser ? "justify-end" : "justify-start"}`}
        >
          <div className="flex items-center gap-1">
            {isUser ? (
              <User className="h-3 w-3" />
            ) : (
              <MessageSquare className="h-3 w-3" />
            )}
            <span className="font-medium">
              {isUser ? "You" : interviewer.name}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Clock className="h-3 w-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
            isUser
              ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-primary/20 shadow-primary/20"
              : "bg-gradient-to-br from-card to-card/95 text-card-foreground border-border/50 shadow-black/5 dark:shadow-black/20"
          }`}
        >
          {/* Message tail */}
          <div
            className={`absolute top-3 w-3 h-3 rotate-45 border ${
              isUser
                ? "right-[-6px] bg-primary border-primary/20 border-l-0 border-b-0"
                : "left-[-6px] bg-card border-border/50 border-r-0 border-t-0"
            }`}
          />

          {/* Content */}
          <div className="relative p-4">
            {/* Question type indicator for AI messages */}
            {isAI && message.questionType && (
              <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <MessageSquare className="h-3 w-3" />
                {message.questionType
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            )}

            <div
              className={`prose prose-sm max-w-none min-w-0 break-words [overflow-wrap:anywhere] ${
                isUser ? "prose-invert" : "dark:prose-invert"
              } prose-p:my-2 prose-p:leading-relaxed prose-headings:my-2 prose-ul:my-2 prose-ol:my-2`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {isAI ? displayedContent : message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Subtle glow effect for latest message */}
          {isLatest && (
            <div
              className={`absolute inset-0 rounded-2xl ${
                isUser ? "bg-primary/5" : "bg-primary/10"
              } animate-pulse`}
            />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden shadow-md">
          {userData?.avatarIcon ? (
            <AvatarIconDisplay
              iconId={userData.avatarIcon}
              size="sm"
              className="h-10 w-10"
            />
          ) : (
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage
                src={user?.photoURL || userData?.photoURL}
                alt={userData?.displayName || user?.displayName || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(
                  userData?.displayName || user?.displayName || null,
                )}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
    </div>
  );
}
