"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ACHIEVEMENT_FALLBACK_ICON,
  ACHIEVEMENT_ICON_MAP,
} from "@/components/achievements/constants/icon-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Achievement, AchievementTier } from "@/lib/achievements";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

const getBaseTier = (tier: AchievementTier): string => tier.split("_")[0];

const formatTier = (tier: AchievementTier): string => {
  const [base, level] = tier.split("_");
  const levelMap: Record<string, string> = { i: "I", ii: "II", iii: "III" };
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${levelMap[level]}`;
};

const tierColors: Record<string, { bg: string; border: string; text: string }> =
  {
    bronze: {
      bg: "bg-gradient-to-br from-amber-950/90 to-amber-900/90",
      border: "border-amber-600",
      text: "text-amber-400",
    },
    silver: {
      bg: "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
      border: "border-slate-400",
      text: "text-slate-300",
    },
    gold: {
      bg: "bg-gradient-to-br from-yellow-950/90 to-yellow-900/90",
      border: "border-yellow-500",
      text: "text-yellow-400",
    },
    platinum: {
      bg: "bg-gradient-to-br from-cyan-950/90 to-cyan-900/90",
      border: "border-cyan-400",
      text: "text-cyan-300",
    },
    diamond: {
      bg: "bg-gradient-to-br from-purple-950/90 to-purple-900/90",
      border: "border-purple-400",
      text: "text-purple-300",
    },
  };

export function AchievementNotification({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-close if enabled
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay, handleClose]);

  const Icon =
    ACHIEVEMENT_ICON_MAP[achievement.icon as IconKey] ??
    ACHIEVEMENT_FALLBACK_ICON;
  const tierColor = tierColors[getBaseTier(achievement.tier)];

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300 ease-out",
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
      )}
    >
      <Card
        className={cn(
          "border-2 shadow-2xl backdrop-blur-sm overflow-hidden max-w-sm",
          tierColor.border,
          tierColor.bg,
        )}
      >
        <CardContent className="p-4 relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Close"
            >
              <title>Close notification</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-start gap-4 relative z-10">
            {/* Icon with pulse animation */}
            <div
              className={cn(
                "p-3 rounded-full animate-pulse-slow",
                tierColor.text,
                "bg-white/10",
              )}
            >
              <Icon className="size-8" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-white">
                  Achievement Unlocked!
                </h3>
                <Sparkles className="size-4 text-yellow-400 animate-pulse" />
              </div>

              <h4
                className={cn("font-semibold text-base mb-1", tierColor.text)}
              >
                {achievement.name}
              </h4>

              <p className="text-sm text-white/80 mb-2">
                {achievement.description}
              </p>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs border-white/30 bg-white/10",
                    tierColor.text,
                  )}
                >
                  {formatTier(achievement.tier)}
                </Badge>
                <span className="text-xs font-medium text-yellow-400">
                  +{achievement.xpReward} XP
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Container for managing multiple notifications
interface AchievementNotificationContainerProps {
  achievements: Achievement[];
  onClearAll: () => void;
}

export function AchievementNotificationContainer({
  achievements,
  onClearAll,
}: AchievementNotificationContainerProps) {
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>(
    [],
  );

  useEffect(() => {
    if (achievements.length > 0) {
      // Show achievements one by one with a delay
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          setVisibleAchievements((prev) => [...prev, achievement]);
        }, index * 1000); // 1 second delay between each
      });
    }
  }, [achievements]);

  const handleRemove = (achievementId: string) => {
    setVisibleAchievements((prev) =>
      prev.filter((a) => a.id !== achievementId),
    );

    // If all notifications are cleared, call onClearAll
    if (visibleAchievements.length === 1) {
      setTimeout(onClearAll, 300);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {visibleAchievements.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{ transform: `translateY(${index * 10}px)` }}
        >
          <AchievementNotification
            achievement={achievement}
            onClose={() => handleRemove(achievement.id)}
          />
        </div>
      ))}
    </div>
  );
}
