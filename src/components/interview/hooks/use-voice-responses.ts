"use client";

import { useCallback, useEffect, useState } from "react";
import type { Message } from "../types";

export function useVoiceResponses() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<
    string | null
  >(null);

  // Load voice preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("interview-voice-enabled");
    if (saved !== null) {
      setIsVoiceEnabled(JSON.parse(saved));
    }
  }, []);

  // Save voice preference to localStorage
  useEffect(() => {
    localStorage.setItem(
      "interview-voice-enabled",
      JSON.stringify(isVoiceEnabled),
    );
  }, [isVoiceEnabled]);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled((prev) => !prev);
  }, []);

  const processNewMessage = useCallback(
    (messages: Message[]) => {
      if (!isVoiceEnabled || messages.length === 0) return null;

      const latestMessage = messages[messages.length - 1];

      // Only process AI messages that we haven't processed yet
      if (
        latestMessage.type === "ai" &&
        latestMessage.id !== lastProcessedMessageId
      ) {
        setLastProcessedMessageId(latestMessage.id);
        return {
          message: latestMessage.content,
          isAIMessage: true,
        };
      }

      return null;
    },
    [isVoiceEnabled, lastProcessedMessageId],
  );

  return {
    isVoiceEnabled,
    toggleVoice,
    processNewMessage,
  };
}
