"use client";

import { CheckCircle2, Lock, Trophy } from "lucide-react";
import type { IconType } from "react-icons";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Achievement, AchievementTier } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const getBaseTier = (tier: AchievementTier): string => tier.split("_")[0];

const formatTier = (tier: AchievementTier): string => {
  const [base, level] = tier.split("_");
  const levelMap: Record<string, string> = { i: "I", ii: "II", iii: "III" };
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${levelMap[level]}`;
};

const TIER_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  bronze: {
    bg: "bg-orange-900/20",
    border: "border-orange-600",
    text: "text-orange-500",
    badge: "bg-orange-500/15 text-foreground border-orange-600/50",
  },
  silver: {
    bg: "bg-slate-800/20",
    border: "border-slate-500",
    text: "text-slate-300",
    badge: "bg-slate-500/15 text-foreground border-slate-500/50",
  },
  gold: {
    bg: "bg-yellow-900/20",
    border: "border-yellow-500",
    text: "text-yellow-400",
    badge: "bg-yellow-500/15 text-foreground border-yellow-600/50",
  },
  platinum: {
    bg: "bg-cyan-900/20",
    border: "border-cyan-400",
    text: "text-cyan-300",
    badge: "bg-cyan-500/15 text-foreground border-cyan-500/50",
  },
  diamond: {
    bg: "bg-purple-900/20",
    border: "border-purple-400",
    text: "text-purple-300",
    badge: "bg-purple-500/15 text-foreground border-purple-500/50",
  },
};

interface AchievementDetailModalProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  isOpen: boolean;
  onClose: () => void;
  Icon: IconType;
}

export function AchievementDetailModal({
  achievement,
  isUnlocked,
  progress,
  isOpen,
  onClose,
  Icon,
}: AchievementDetailModalProps) {
  const tierStyle = TIER_STYLES[getBaseTier(achievement.tier)];
  const StatusIcon = isUnlocked ? CheckCircle2 : Lock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md border-2",
          isUnlocked ? tierStyle.border : "border-border",
        )}
        aria-label={`${achievement.name} achievement details - ${isUnlocked ? "Unlocked" : "Locked"}`}
      >
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            {/* Achievement Icon */}
            <div
              className={cn(
                "p-4 rounded-xl transition-all",
                isUnlocked
                  ? `${tierStyle.bg} ${tierStyle.border} border-2`
                  : "bg-muted/30 border-2 border-muted grayscale opacity-60",
              )}
            >
              <Icon
                className={cn(
                  "size-8",
                  isUnlocked ? tierStyle.text : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 mb-2 text-xl">
                {achievement.name}
                <StatusIcon
                  className={cn(
                    "size-5",
                    isUnlocked ? "text-green-500" : "text-muted-foreground",
                  )}
                  aria-label={isUnlocked ? "Unlocked" : "Locked"}
                />
              </DialogTitle>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isUnlocked
                    ? tierStyle.badge
                    : "bg-background/60 text-foreground border-border/70",
                )}
              >
                {formatTier(achievement.tier)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant={isUnlocked ? "default" : "secondary"}
              className={cn(
                isUnlocked
                  ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50"
                  : "bg-muted/50 text-muted-foreground border-muted",
              )}
            >
              {isUnlocked ? (
                <>
                  <Trophy className="size-3 mr-1" aria-hidden="true" />
                  Unlocked
                </>
              ) : (
                <>
                  <Lock className="size-3 mr-1" aria-hidden="true" />
                  Locked
                </>
              )}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              +{achievement.xpReward} XP
            </span>
          </div>

          {/* Description */}
          <DialogDescription className="text-base leading-relaxed">
            {achievement.description}
          </DialogDescription>

          {/* Requirement */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="font-semibold text-sm mb-2 text-foreground">
              Requirement
            </h4>
            <p className="text-sm text-muted-foreground">
              {achievement.requirement && achievement.requirementUnit
                ? `Complete ${achievement.requirement} ${achievement.requirementUnit}${achievement.requirement > 1 ? "s" : ""}`
                : achievement.description}
            </p>
          </div>

          {/* Progress Bar for Locked Achievements */}
          {!isUnlocked && progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Progress</span>
                <span className="font-semibold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2.5"
                aria-label={`Achievement progress: ${Math.round(progress)} percent`}
              />
              <p className="text-xs text-muted-foreground text-center">
                Keep going! You're {Math.round(progress)}% of the way there.
              </p>
            </div>
          )}

          {/* Unlocked Message */}
          {isUnlocked && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                🎉 Congratulations! You've unlocked this achievement.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
