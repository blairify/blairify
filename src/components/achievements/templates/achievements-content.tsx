"use client";

import { useEffect, useState } from "react";
import { GiLightningTrio } from "react-icons/gi";
import { TiFlowChildren } from "react-icons/ti";
import {
  ACHIEVEMENT_FALLBACK_ICON,
  ACHIEVEMENT_ICON_MAP,
} from "@/components/achievements/constants/icon-map";
import { NextAchievementCard } from "@/components/achievements/molecules/next-achievement-card";
import { Typography } from "@/components/common/atoms/typography";
import { RankBadge } from "@/components/ranks/organisms/rank-badge";
import { XPProgressBar } from "@/components/ranks/organisms/xp-progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type AchievementProgress,
  useAchievements,
} from "@/hooks/use-achievements";
import type { AchievementTier, UserStats } from "@/lib/achievements";
import { DatabaseService } from "@/lib/database";
import { formatXP } from "@/lib/ranks";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";

type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

const TIER_STYLES: Record<
  AchievementTier,
  { bg: string; border: string; text: string; badge: string }
> = {
  bronze: {
    bg: "bg-amber-950/20",
    border: "border-amber-700/50",
    text: "text-amber-600",
    badge: "bg-amber-900/30 text-amber-500 border-amber-700/50",
  },
  silver: {
    bg: "bg-slate-900/20",
    border: "border-slate-500/50",
    text: "text-slate-400",
    badge: "bg-slate-800/30 text-slate-300 border-slate-600/50",
  },
  gold: {
    bg: "bg-yellow-950/20",
    border: "border-yellow-600/50",
    text: "text-yellow-500",
    badge: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
  },
  platinum: {
    bg: "bg-cyan-950/20",
    border: "border-cyan-500/50",
    text: "text-cyan-400",
    badge: "bg-cyan-900/30 text-cyan-300 border-cyan-600/50",
  },
  diamond: {
    bg: "bg-purple-950/20",
    border: "border-purple-500/50",
    text: "text-purple-400",
    badge: "bg-purple-900/30 text-purple-300 border-purple-600/50",
  },
};

interface AchievementsContentProps {
  user: UserData;
}

export function AchievementsContent({ user }: AchievementsContentProps) {
  const [stats, setStats] = useState<UserStats>({
    avgScore: 0,
    totalSessions: 0,
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!user?.uid) {
        setStats({
          avgScore: 0,
          totalSessions: 0,
          totalTime: 0,
        });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const sessions = await DatabaseService.getUserSessions(user.uid, 100);
        if (!sessions.length) {
          setStats({
            avgScore: 0,
            totalSessions: 0,
            totalTime: 0,
          });
          return;
        }

        const avgScore =
          sessions.reduce(
            (sum, session) => sum + (session.scores?.overall || 0),
            0,
          ) / sessions.length;

        const totalSessions = sessions.length;
        const totalTime = sessions.reduce(
          (sum, session) => sum + (session.totalDuration || 0),
          0,
        );

        const computedStats: UserStats = {
          avgScore: Math.round(avgScore),
          totalSessions,
          totalTime,
        };

        setStats(computedStats);
      } catch (error) {
        console.error("❌ Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserStats();
  }, [user?.uid]);

  const achievementData = useAchievements(stats);
  const {
    achievementsWithProgress,
    totalXP,
    stats: achievementStats,
    nextAchievement,
    rank,
    nextRank,
    progressToNextRank,
    xpToNextRank,
  } = achievementData;

  if (loading) {
    return (
      <main className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <Typography.Body color="secondary">
            Loading achievements...
          </Typography.Body>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <TiFlowChildren className="size-5 flex-shrink-0" />
            <Typography.Heading1 className="text-foreground">
              Achievements
            </Typography.Heading1>
          </div>
          <Typography.Body color="secondary" className="text-lg">
            Track your progress and unlock milestones as you improve your
            interview skills.
          </Typography.Body>
        </div>
        <Card
          className={cn(
            "border-2 overflow-hidden relative",
            rank.badge.border,
            rank.badge.bg,
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Rank Display */}
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Typography.CaptionMedium
                  color="secondary"
                  className="uppercase tracking-wide"
                >
                  Current Rank
                </Typography.CaptionMedium>
                <RankBadge rank={rank} size="xl" showGlow showLabel animated />
                <div className="space-y-1">
                  <Typography.Heading2
                    className={cn("text-2xl", rank.badge.text)}
                  >
                    {rank.name} {rank.level}
                  </Typography.Heading2>
                  <Typography.SubCaptionMedium color="secondary">
                    {formatXP(totalXP)} Total XP
                  </Typography.SubCaptionMedium>
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
                <div>
                  <Typography.Heading3 className="mb-4 flex items-center gap-2">
                    <GiLightningTrio className="size-5 text-primary" />
                    Rank Progression
                  </Typography.Heading3>
                  <XPProgressBar
                    currentXP={totalXP}
                    rank={rank}
                    nextRank={nextRank}
                    progress={progressToNextRank}
                    xpToNextRank={xpToNextRank}
                    size="lg"
                    showLabel
                    showNumbers
                    animated
                  />
                </div>
                {rank.perks.length > 0 && (
                  <div>
                    <Typography.CaptionMedium
                      color="secondary"
                      className="mb-2"
                    >
                      Current Perks:
                    </Typography.CaptionMedium>
                    <div className="flex flex-wrap gap-2">
                      {rank.perks.map((perk, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn(
                            rank.badge.bg,
                            rank.badge.text,
                            rank.badge.border,
                            "border",
                          )}
                        >
                          {perk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Rank Preview */}
                {nextRank && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography.SubCaptionMedium color="secondary">
                          Next Rank:
                        </Typography.SubCaptionMedium>
                        <Typography.BodyMedium
                          className={cn(nextRank.badge.text, "font-semibold")}
                        >
                          {nextRank.name} {nextRank.level}
                        </Typography.BodyMedium>
                      </div>
                      <RankBadge
                        rank={nextRank}
                        size="md"
                        showGlow={false}
                        showContainer={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {nextAchievement && (
          <NextAchievementCard
            name={nextAchievement.name}
            description={nextAchievement.description}
            tier={nextAchievement.tier}
            progress={
              nextAchievement.progressCalculator
                ? nextAchievement.progressCalculator(stats)
                : 0
            }
            xpReward={nextAchievement.xpReward}
            Icon={
              ACHIEVEMENT_ICON_MAP[nextAchievement.icon as IconKey] ??
              ACHIEVEMENT_FALLBACK_ICON
            }
            badgeClassName={TIER_STYLES[nextAchievement.tier].badge}
          />
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Typography.Heading2>All Achievements</Typography.Heading2>
            <Typography.SubCaptionMedium color="secondary">
              {achievementStats.unlockedCount} /{" "}
              {achievementStats.totalAchievements} unlocked
            </Typography.SubCaptionMedium>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievementsWithProgress.map((item) => (
              <AchievementCard key={item.achievement.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  item: AchievementProgress;
}

function AchievementCard({ item }: AchievementCardProps) {
  const { achievement, isUnlocked, progress } = item;
  const Icon =
    ACHIEVEMENT_ICON_MAP[achievement.icon as IconKey] ??
    ACHIEVEMENT_FALLBACK_ICON;
  const tierStyle = TIER_STYLES[achievement.tier];

  return (
    <Card
      className={cn(
        "transition-all duration-300 border-2 group hover:shadow-lg",
        isUnlocked
          ? `${tierStyle.border} ${tierStyle.bg} hover:scale-[1.02]`
          : "border-border/50 bg-card/40 opacity-70 hover:opacity-85",
      )}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "p-2.5 rounded-lg transition-transform group-hover:scale-110",
              isUnlocked ? tierStyle.bg : "bg-muted/30",
            )}
          >
            <Icon
              className={cn(
                "size-5 transition-transform group-hover:scale-110",
                isUnlocked ? tierStyle.text : "text-muted-foreground/60",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Typography.BodyMedium
              className={cn(
                "truncate",
                isUnlocked ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {achievement.name}
            </Typography.BodyMedium>
            <Badge
              variant="outline"
              className={cn("text-xs mt-1", tierStyle.badge)}
            >
              {achievement.tier}
            </Badge>
          </div>
        </div>

        <Typography.Body
          color="secondary"
          className="text-sm mb-4 line-clamp-2"
        >
          {achievement.description}
        </Typography.Body>

        {/* Progress Bar for Locked Achievements */}
        {!isUnlocked && progress > 0 && (
          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <Typography.SubCaption>Progress</Typography.SubCaption>
              <Typography.SubCaption>
                {Math.round(progress)}%
              </Typography.SubCaption>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between">
          {isUnlocked ? (
            <Badge
              variant="default"
              className="bg-primary/20 text-primary border-primary/30"
            >
              ✓ Unlocked
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted/50">
              Locked
            </Badge>
          )}
          <Typography.SubCaptionMedium color="secondary">
            +{achievement.xpReward} XP
          </Typography.SubCaptionMedium>
        </div>
      </CardContent>
    </Card>
  );
}
