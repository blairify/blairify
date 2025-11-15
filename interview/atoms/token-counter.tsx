"use client";

import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface TokenCounterProps {
  messages: Array<{ content: string; type: "ai" | "user" }>;
}

export function TokenCounter({ messages }: TokenCounterProps) {
  const [tokenCount, setTokenCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === "development");
  }, []);

  useEffect(() => {
    const totalCharacters = messages.reduce((sum, msg) => {
      return sum + msg.content.length;
    }, 0);

    const estimatedTokens = Math.ceil(totalCharacters / 4);
    setTokenCount(estimatedTokens);
  }, [messages]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg p-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div className="text-xs">
            <div className="font-semibold text-foreground">Token Usage</div>
            <div className="text-muted-foreground">
              ~{tokenCount.toLocaleString()} tokens
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              {messages.length} messages
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
