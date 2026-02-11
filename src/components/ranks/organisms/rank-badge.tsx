"use client";

import { Crown, Flame, Gem, Star, Trophy } from "lucide-react";
import { GiBurningBook, GiFlowerTwirl } from "react-icons/gi";

import type { Rank } from "@/lib/ranks";
import { formatRankLevel } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: Rank;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  showLabel?: boolean;
  showLevel?: boolean;
  animated?: boolean;
  className?: string;
  showContainer?: boolean;
}

const icons = {
  GiBurningBook,
  GiFlowerTwirl,
  Crown,
  Gem,
  Star,
  Flame,
  Trophy,
};

const sizeClasses = {
  xs: {
    container: "w-6 h-6",
    icon: "w-3 h-3",
    text: "text-[8px]",
    border: "border",
  },
  sm: {
    container: "w-8 h-8",
    icon: "size-4",
    text: "text-[10px]",
    border: "border",
  },
  md: {
    container: "w-12 h-12",
    icon: "w-6 h-6",
    text: "text-xs",
    border: "border-2",
  },
  lg: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
    text: "text-sm",
    border: "border-2",
  },
  xl: {
    container: "w-24 h-24",
    icon: "w-12 h-12",
    text: "text-base",
    border: "border-3",
  },
};

export function RankBadge({
  rank,
  size = "md",
  showGlow = false,
  showLabel = false,
  showLevel = true,
  animated = true,
  className,
  showContainer = true,
}: RankBadgeProps) {
  const Icon = icons[rank.icon as keyof typeof icons] || GiBurningBook;
  const sizeConfig = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Badge */}
      {showContainer ? (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full",
            "transition-all duration-300",
            sizeConfig.container,
            sizeConfig.border,
            rank.badge.border,
            rank.badge.bg,
            showGlow && rank.badge.glow,
            showGlow && "shadow-lg",
            animated && "hover:scale-110 hover:rotate-6",
            animated && "group cursor-pointer",
          )}
        >
          {/* Animated ring effect */}
          {animated && (
            <div
              className={cn(
                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
                "transition-opacity duration-300",
                rank.badge.border,
                "animate-ping",
              )}
            />
          )}

          {/* Icon */}
          <Icon
            className={cn(
              sizeConfig.icon,
              rank.badge.text,
              "relative z-10",
              animated && "group-hover:scale-110 transition-transform",
            )}
          />

          {/* Level indicator (small badge) */}
          {showLevel && size !== "xs" && size !== "sm" && (
            <div
              className={cn(
                "absolute -bottom-1 -right-1",
                "rounded-full",
                "bg-background border-2",
                rank.badge.border,
                "flex items-center justify-center",
                size === "md" && "size-5",
                size === "lg" && "size-6",
                size === "xl" && "size-8",
              )}
            >
              <span
                className={cn(
                  "font-bold",
                  rank.badge.text,
                  size === "md" && "text-[10px]",
                  size === "lg" && "text-xs",
                  size === "xl" && "text-sm",
                )}
              >
                {formatRankLevel(rank.level)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <Icon className={cn(sizeConfig.icon, rank.badge.text)} />
      )}

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            "font-semibold",
            rank.badge.text,
            sizeConfig.text,
            "text-center",
          )}
        >
          {rank.name}
        </span>
      )}
    </div>
  );
}

// Compact inline badge for use in headers/navigation
export function RankBadgeInline({
  rank,
  showXP = false,
  xp,
  className,
}: {
  rank: Rank;
  showXP?: boolean;
  xp?: number;
  className?: string;
}) {
  const Icon = icons[rank.icon as keyof typeof icons] || GiBurningBook;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full",
        "px-2 py-0.5",
        "bg-background/70 border",
        rank.badge.border,
        className,
      )}
    >
      <Icon className={cn("size-4", rank.badge.text)} />
      <span className="text-xs font-semibold text-foreground">
        {rank.name} {formatRankLevel(rank.level)}
      </span>
      {showXP && xp !== undefined && (
        <>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs font-medium text-muted-foreground">
            {xp.toLocaleString()} XP
          </span>
        </>
      )}
    </div>
  );
}
