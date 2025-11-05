"use client";

import { Clock, MessageSquare, Target } from "lucide-react";

interface InterviewOverviewCardsProps {
  duration: string;
  questionCount: string;
  interviewType: string;
}

export function InterviewOverviewCards({
  duration,
  questionCount,
  interviewType,
}: InterviewOverviewCardsProps) {
  const cards = [
    {
      icon: Clock,
      label: "Duration",
      value: `${duration} min`,
      color: "text-primary",
    },
    {
      icon: MessageSquare,
      label: "Questions",
      value: questionCount,
      color: "text-primary",
    },
    {
      icon: Target,
      label: "Type",
      value: interviewType,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg border border-border transition-colors hover:bg-muted/50"
          >
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 ${card.color}`} />
            <div className="font-medium text-xs sm:text-sm text-muted-foreground">
              {card.label}
            </div>
            <div className="text-base sm:text-lg font-bold text-foreground">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
