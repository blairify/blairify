"use client";

import type { IconType } from "react-icons";
import { GiTargetShot } from "react-icons/gi";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AchievementTier } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const formatTier = (tier: AchievementTier): string => {
  const [base, level] = tier.split("_");
  const levelMap: Record<string, string> = { i: "I", ii: "II", iii: "III" };
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${levelMap[level]}`;
};

export type AchievementIcon = IconType;

interface NextAchievementCardProps {
  name: string;
  description: string;
  tier: AchievementTier;
  progress: number;
  xpReward: number;
  Icon: AchievementIcon;
  badgeClassName: string;
}

export function NextAchievementCard({
  name,
  description,
  tier,
  progress,
  xpReward,
  Icon,
  badgeClassName,
}: NextAchievementCardProps) {
  return (
    <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden h-full group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <CardHeader className="pb-2 relative z-10">
        <Typography.CaptionMedium
          color="secondary"
          className="uppercase tracking-wide text-[10px] font-bold"
        >
          Next Goal
        </Typography.CaptionMedium>
        <div className="flex items-center gap-2 mt-1">
          <GiTargetShot className="size-5 text-primary" />
          <Typography.Heading3 className="text-xl font-bold tracking-tight">
            Next Achievement
          </Typography.Heading3>
        </div>
      </CardHeader>
      <CardContent className="pt-4 relative z-10 flex flex-col h-[calc(100%-80px)] justify-between">
        <div className="flex gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0 self-start group-hover:scale-105 transition-transform duration-300">
            <Icon className="size-6 text-primary" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Typography.BodyBold className="text-base truncate">
                {name}
              </Typography.BodyBold>
              <Badge
                variant="outline"
                className={cn(badgeClassName, "text-[10px] px-1.5 py-0 h-5")}
              >
                {formatTier(tier)}
              </Badge>
            </div>
            <Typography.Body className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </Typography.Body>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex justify-between items-end text-xs">
            <span className="font-medium text-muted-foreground uppercase tracking-wider">
              Progress
            </span>
            <span className="font-bold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2 bg-muted/40" />
            {progress > 0 && (
              <div
                className="absolute inset-0 rounded-full opacity-50 blur-[2px] bg-primary pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              +{xpReward} XP Reward
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
