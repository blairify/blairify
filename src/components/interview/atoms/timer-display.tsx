import { Timer } from "lucide-react";

interface TimerDisplayProps {
  seconds: number;
}

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  const formatTime = (secs: number) => {
    if (secs === Number.POSITIVE_INFINITY) return "∞";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
      <Timer className="h-4 w-4 text-primary" />
      <span className="font-mono font-bold text-sm sm:text-base text-foreground">
        {formatTime(seconds)}
      </span>
    </div>
  );
}
