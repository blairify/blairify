import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Typography } from "@/components/common/atoms/typography";
import type { InterviewerProfile } from "@/lib/config/interviewers";
import { MessageBubble } from "../molecules/message-bubble";
import { TypingIndicator } from "../molecules/typing-indicator";
import type { Message } from "../types";

interface InterviewMessagesAreaProps {
  messages: Message[];
  isLoading: boolean;
  interviewer: InterviewerProfile;
  completionCard?: React.ReactNode;
}

export function InterviewMessagesArea({
  messages,
  isLoading,
  interviewer,
  completionCard,
}: InterviewMessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {isEmpty && (
            <div className="text-center py-12 animate-in fade-in duration-1000">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <Typography.Heading3 className="text-lg font-semibold text-foreground mb-2">
                Ready to begin your interview?
              </Typography.Heading3>
              <Typography.Body className="text-muted-foreground max-w-md mx-auto">
                Your AI interviewer {interviewer.name} is here to help you
                practice. Take your time and answer thoughtfully. Good luck! 🚀
              </Typography.Body>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                interviewer={interviewer}
                isLatest={index === messages.length - 1}
              />
            ))}

            {isLoading && (
              <div className="animate-in fade-in duration-300">
                <TypingIndicator interviewer={interviewer} />
              </div>
            )}

            {completionCard}
          </div>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
    </div>
  );
}
