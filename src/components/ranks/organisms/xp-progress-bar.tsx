"use client";

import { Progress } from "@/components/ui/progress";
import type { Rank } from "@/lib/ranks";
import { formatXP } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  currentXP: number;
  rank: Rank;
  nextRank: Rank | null;
  progress: number; // 0-100
  xpToNextRank: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showNumbers?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    height: "h-1.5",
    text: "text-[10px]",
    gap: "gap-1",
  },
  md: {
    height: "h-2",
    text: "text-xs",
    gap: "gap-1.5",
  },
  lg: {
    height: "h-3",
    text: "text-sm",
    gap: "gap-2",
  },
};

export function XPProgressBar({
  currentXP,
  rank,
  nextRank,
  progress,
  xpToNextRank,
  size = "md",
  showLabel = true,
  showNumbers = true,
  animated = true,
  className,
}: XPProgressBarProps) {
  const sizeConfig = sizeClasses[size];
  const _nextRankXP = nextRank ? nextRank.minXP : currentXP;
  const currentRankXP = rank.minXP;
  const xpInCurrentRank = currentXP - currentRankXP;

  return (
    <div className={cn("w-full", className)}>
      {/* Label */}
      {showLabel && (
        <div
          className={cn(
            "flex items-center justify-between mb-1",
            sizeConfig.gap,
          )}
        >
          <span className={cn("font-medium", rank.badge.text, sizeConfig.text)}>
            {rank.name} {rank.level}
          </span>
          {nextRank && (
            <span
              className={cn(
                "font-medium text-muted-foreground",
                sizeConfig.text,
              )}
            >
              {nextRank.name} {nextRank.level}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={progress}
          className={cn(
            sizeConfig.height,
            "bg-muted/30",
            animated && "transition-all duration-500",
          )}
          indicatorClassName={cn(
            "bg-gradient-to-r",
            rank.color.gradient,
            animated && "transition-all duration-500",
          )}
        />

        {/* Glow effect */}
        {animated && progress > 0 && (
          <div
            className={cn(
              "absolute inset-0 rounded-full opacity-50 blur-sm",
              "bg-gradient-to-r",
              rank.color.gradient,
              "pointer-events-none",
            )}
            style={{
              width: `${progress}%`,
            }}
          />
        )}
      </div>

      {/* Numbers */}
      {showNumbers && (
        <div
          className={cn(
            "flex items-center justify-between mt-1",
            sizeConfig.gap,
          )}
        >
          <span className={cn("font-medium", rank.badge.text, sizeConfig.text)}>
            {formatXP(xpInCurrentRank)} XP
          </span>
          {nextRank ? (
            <span
              className={cn(
                "font-medium text-muted-foreground",
                sizeConfig.text,
              )}
            >
              {formatXP(xpToNextRank)} to go
            </span>
          ) : (
            <span
              className={cn(
                "font-medium text-muted-foreground",
                sizeConfig.text,
              )}
            >
              Max Rank!
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for header/navigation
export function XPProgressBarCompact({
  currentXP: _currentXP,
  rank,
  progress,
  className,
}: {
  currentXP: number;
  rank: Rank;
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 min-w-[60px]">
        <Progress
          value={progress}
          className="h-1.5 bg-muted/30"
          indicatorClassName={cn("bg-gradient-to-r", rank.color.gradient)}
        />
      </div>
    </div>
  );
}
