"use client";

import type { IconType } from "react-icons";
import { GiTargetShot } from "react-icons/gi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AchievementTier } from "@/lib/achievements";

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
    <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GiTargetShot className="size-5 text-primary" />
          Next Achievement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{name}</h3>
              <Badge variant="outline" className={badgeClassName}>
                {formatTier(tier)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Reward:{" "}
              <span className="text-primary font-medium">+{xpReward} XP</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
