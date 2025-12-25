import { useEffect, useMemo, useRef } from "react";
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

  const lastMessageId = useMemo(
    () => messages[messages.length - 1]?.id ?? null,
    [messages],
  );

  useEffect(() => {
    if (!lastMessageId) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
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
