"use client";

import { useEffect, useState } from "react";
import { GiLightningTrio } from "react-icons/gi";
import { TiFlowChildren } from "react-icons/ti";
import {
  ACHIEVEMENT_FALLBACK_ICON,
  ACHIEVEMENT_ICON_MAP,
} from "@/components/achievements/constants/icon-map";
import { AchievementDetailModal } from "@/components/achievements/molecules/achievement-detail-modal";
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
import { getProgressToNextRank, getRankByXP } from "@/lib/ranks";
import { formatRankLevel, formatXP, getNextRank, getXPToNextRank } from "@/lib/ranks";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

const getBaseTier = (tier: AchievementTier): string => tier.split("_")[0];

const formatTier = (tier: AchievementTier): string => {
  const [base, level] = tier.split("_");
  const levelMap: Record<string, string> = { i: "I", ii: "II", iii: "III" };
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${levelMap[level]}`;
};

const TIER_STYLES: Record<
  string,
  {
    unlocked: { bg: string; border: string; text: string; glow: string };
    locked: { bg: string; border: string; text: string };
    badge: string;
  }
> = {
  bronze: {
    unlocked: {
      bg: "bg-orange-500/10",
      border: "border-orange-600",
      text: "text-orange-500",
      glow: "shadow-lg shadow-orange-500/30",
    },
    locked: {
      bg: "bg-gray-800/10",
      border: "border-gray-700",
      text: "text-gray-500",
    },
    badge: "bg-orange-500/15 text-foreground border-orange-600/50",
  },
  silver: {
    unlocked: {
      bg: "bg-slate-500/10",
      border: "border-slate-400",
      text: "text-slate-300",
      glow: "shadow-lg shadow-slate-400/30",
    },
    locked: {
      bg: "bg-gray-800/10",
      border: "border-gray-700",
      text: "text-gray-500",
    },
    badge: "bg-slate-500/15 text-foreground border-slate-500/50",
  },
  gold: {
    unlocked: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500",
      text: "text-yellow-400",
      glow: "shadow-lg shadow-yellow-500/30",
    },
    locked: {
      bg: "bg-gray-800/10",
      border: "border-gray-700",
      text: "text-gray-500",
    },
    badge: "bg-yellow-500/15 text-foreground border-yellow-600/50",
  },
  platinum: {
    unlocked: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-400",
      text: "text-cyan-300",
      glow: "shadow-lg shadow-cyan-400/30",
    },
    locked: {
      bg: "bg-gray-800/10",
      border: "border-gray-700",
      text: "text-gray-500",
    },
    badge: "bg-cyan-500/15 text-foreground border-cyan-500/50",
  },
  diamond: {
    unlocked: {
      bg: "bg-purple-500/10",
      border: "border-purple-400",
      text: "text-purple-300",
      glow: "shadow-lg shadow-purple-400/30",
    },
    locked: {
      bg: "bg-gray-800/10",
      border: "border-gray-700",
      text: "text-gray-500",
    },
    badge: "bg-purple-500/15 text-foreground border-purple-500/50",
  },
};

interface AchievementsContentProps {
  user: UserData;
}

export function AchievementsContent({ user }: AchievementsContentProps) {
  const { userData } = useAuth();
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
    stats: achievementStats,
    nextAchievement,
  } = achievementData;

  const totalXP =
    typeof userData?.experiencePoints === "number" &&
    Number.isFinite(userData.experiencePoints)
      ? userData.experiencePoints
      : typeof user.experiencePoints === "number" &&
          Number.isFinite(user.experiencePoints)
        ? user.experiencePoints
        : 0;
  const rank = getRankByXP(totalXP);
  const nextRank = getNextRank(rank);
  const progressToNextRank = getProgressToNextRank(totalXP, rank);
  const xpToNextRank = getXPToNextRank(totalXP, rank);

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
            "border-2 overflow-hidden relative bg-card",
            rank.badge.border,
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
                <RankBadge
                  rank={rank}
                  size="xl"
                  showGlow
                  showLabel
                  showLevel={false}
                  animated
                />
                <div className="space-y-1">
                  <Typography.Heading2
                    className={cn("text-2xl", rank.badge.text)}
                  >
                    {rank.name} {formatRankLevel(rank.level)}
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
                            rank.badge.border,
                            "border bg-background/70 text-foreground",
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
                          {nextRank.name} {formatRankLevel(nextRank.level)}
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
            badgeClassName={
              TIER_STYLES[getBaseTier(nextAchievement.tier)].badge
            }
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const Icon =
    ACHIEVEMENT_ICON_MAP[achievement.icon as IconKey] ??
    ACHIEVEMENT_FALLBACK_ICON;
  const tierStyle = TIER_STYLES[getBaseTier(achievement.tier)];
  const currentStyle = isUnlocked ? tierStyle.unlocked : tierStyle.locked;

  // Comprehensive ARIA label for screen readers
  const ariaLabel = isUnlocked
    ? `${achievement.name} - Unlocked - ${achievement.description} - Worth ${achievement.xpReward} XP`
    : `${achievement.name} - Locked - ${Math.round(progress)}% progress - ${achievement.description} - Requires ${achievement.requirement} ${achievement.requirementUnit}${achievement.requirement && achievement.requirement > 1 ? "s" : ""} - Worth ${achievement.xpReward} XP`;

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-300 border-2 group cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isUnlocked
            ? `${currentStyle.border} ${currentStyle.bg} ${tierStyle.unlocked.glow} hover:scale-[1.03]`
            : "border-border/60 bg-card/70 hover:bg-card/80",
        )}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        <CardContent className="p-5 flex flex-col h-full relative">
          {/* Lock/Unlock Icon Overlay */}
          <div className="absolute top-3 right-3">
            {isUnlocked ? (
              <div
                className="p-1 rounded-full bg-green-500/20"
                aria-hidden="true"
              >
                <svg
                  className="size-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Unlocked</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="p-1 rounded-full bg-muted/50" aria-hidden="true">
                <svg
                  className="size-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Locked</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div
              className={cn(
                "p-2.5 rounded-lg transition-transform group-hover:scale-110",
                currentStyle.bg,
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform group-hover:scale-110",
                  currentStyle.text,
                )}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Typography.BodyMedium
                className={cn(
                  "truncate",
                  isUnlocked ? "text-foreground" : "text-foreground",
                )}
              >
                {achievement.name}
              </Typography.BodyMedium>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs mt-1",
                  isUnlocked
                    ? tierStyle.badge
                    : "bg-background/60 text-foreground border-border/70",
                )}
              >
                {formatTier(achievement.tier)}
              </Badge>
            </div>
          </div>

          <Typography.Body
            color="secondary"
            className={cn(
              "text-sm mb-4 line-clamp-2",
              isUnlocked ? "text-foreground/80" : "text-foreground/80",
            )}
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
                className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
              >
                ✓ Unlocked
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-muted/50 text-muted-foreground border-muted"
              >
                🔒 Locked
              </Badge>
            )}
            <Typography.SubCaptionMedium color="secondary">
              +{achievement.xpReward} XP
            </Typography.SubCaptionMedium>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={achievement}
        isUnlocked={isUnlocked}
        progress={progress}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        Icon={Icon}
      />
    </>
  );
}
