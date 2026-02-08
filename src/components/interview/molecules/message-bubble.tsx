import { Clock, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { RiChatAiLine } from "react-icons/ri";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { MarkdownContent } from "@/components/common/molecules/markdown-content";
import type { InterviewerProfile } from "@/lib/config/interviewers";
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
  const [displayedContent, setDisplayedContent] = useState(message.content);

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
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
    const baseDelay = 30; // Reduced from 65ms
    const delayVariance = 40; // Reduced from 70ms

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
      {isAI && (
        <div className="relative">
          <div className="size-10 flex-shrink-0 ring-2 ring-primary/20 rounded-full overflow-hidden shadow-md">
            <InterviewerAvatar interviewer={interviewer} size={40} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] min-w-0">
        <div
          className={`flex items-center gap-2 text-xs text-muted-foreground ${isUser ? "justify-end" : "justify-start"}`}
        >
          <div className="flex items-center gap-1">
            {!isUser && <RiChatAiLine className="size-3" />}
            <span className="font-medium">{!isUser && interviewer.name}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Clock className="size-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>

        <div
          className={`relative rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
            isUser
              ? "bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground border-secondary/20"
              : "bg-gradient-to-br from-card to-card/95 text-card-foreground border-border/50 shadow-black/5 dark:shadow-black/20"
          }`}
        >
          {!isUser && (
            <div className="absolute top-3 size-3 rotate-45 border left-[-6px] bg-card border-border/50 border-r-0 border-t-0" />
          )}
          <div className="relative p-4">
            {isAI && message.questionType && (
              <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <MessageSquare className="size-3" />
                {message.questionType
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            )}

            <div
              className={`prose prose-sm max-w-none min-w-0 break-words ${
                isUser ? "prose-invert" : "dark:prose-invert"
              } prose-p:my-2 prose-p:leading-relaxed prose-headings:my-2 prose-ul:my-2 prose-ol:my-2`}
            >
              <MarkdownContent
                markdown={isAI ? displayedContent : message.content}
              />
            </div>
          </div>

          {isLatest && (
            <div
              className={`absolute inset-0 rounded-2xl ${
                isUser ? "bg-primary/5" : "bg-primary/10"
              } animate-pulse`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
