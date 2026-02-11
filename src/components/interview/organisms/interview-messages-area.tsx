import { useEffect, useMemo, useRef } from "react";
import type { InterviewerProfile } from "@/lib/config/interviewers";
import { MessageBubble } from "../molecules/message-bubble";
import { TypingIndicator } from "../molecules/typing-indicator";
import type { Message } from "../types";

function splitIntroFromFirstQuestion(message: Message): Message[] {
  if (message.type !== "ai") return [message];
  if (typeof message.content !== "string") return [message];
  const raw = message.content.trim();
  if (!raw) return [message];

  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    const greeting = paragraphs[0] ?? "";
    const question = paragraphs.slice(1).join("\n\n");
    if (!greeting || !question) return [message];
    return [
      { ...message, id: `${message.id}:greeting`, content: greeting },
      { ...message, id: `${message.id}:question`, content: question },
    ];
  }

  const firstQuestionMark = raw.indexOf("?");
  if (firstQuestionMark <= 0) return [message];

  const beforeQuestion = raw.slice(0, firstQuestionMark).trim();
  const afterQuestion = raw.slice(firstQuestionMark).trim();
  if (!beforeQuestion || !afterQuestion) return [message];

  const boundaryCandidates = [
    beforeQuestion.lastIndexOf("\n"),
    beforeQuestion.lastIndexOf(". "),
    beforeQuestion.lastIndexOf("! "),
  ];
  const splitAt = Math.max(...boundaryCandidates);
  if (splitAt < 0) return [message];

  const greeting = beforeQuestion.slice(0, splitAt + 1).trim();
  const question =
    `${beforeQuestion.slice(splitAt + 1).trim()} ${afterQuestion}`
      .replace(/\s+/g, " ")
      .trim();
  if (!greeting || !question) return [message];

  return [
    { ...message, id: `${message.id}:greeting`, content: greeting },
    { ...message, id: `${message.id}:question`, content: question },
  ];
}

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

  const displayMessages = useMemo(() => {
    if (messages.length === 0) return messages;
    const [first, ...rest] = messages;
    if (!first) return messages;
    return [...splitIntroFromFirstQuestion(first), ...rest];
  }, [messages]);

  const lastMessageId = useMemo(
    () => displayMessages[displayMessages.length - 1]?.id ?? null,
    [displayMessages],
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
            {displayMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                interviewer={interviewer}
                isLatest={index === displayMessages.length - 1}
                isFirstMessage={index === 0}
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
