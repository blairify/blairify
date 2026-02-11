"use client";

import { useEffect, useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AchievementProgress,
  useAchievements,
} from "@/hooks/use-achievements";
import type { AchievementTier, UserStats } from "@/lib/achievements";
import { DatabaseService } from "@/lib/database";
import {
  formatRankLevel,
  formatXP,
  getNextRank,
  getProgressToNextRank,
  getRankByXP,
  getXPToNextRank,
} from "@/lib/ranks";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

type TierBase = "bronze" | "silver" | "gold" | "platinum" | "diamond";
type StatusFilter = "all" | "unlocked" | "locked";
type TierFilter = "all" | TierBase;

const getBaseTier = (tier: AchievementTier): string => tier.split("_")[0];

const formatTier = (tier: AchievementTier): string => {
  const [base, level] = tier.split("_");
  const levelMap: Record<string, string> = { i: "I", ii: "II", iii: "III" };
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${levelMap[level]}`;
};

function getCurrentStreakDays(sessions: unknown[]): number {
  const asSessions = sessions as Array<{
    completedAt?: { toDate: () => Date };
    createdAt: { toDate: () => Date };
    status?: string;
  }>;

  const dayKeys = new Set<number>();
  for (const session of asSessions) {
    if (session.status !== "completed") continue;
    const date = (session.completedAt ?? session.createdAt).toDate();
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    dayKeys.add(day.getTime());
  }

  if (dayKeys.size === 0) return 0;

  const sortedDays = [...dayKeys].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffToTodayDays = Math.floor(
    (today.getTime() - sortedDays[0]) / (1000 * 60 * 60 * 24),
  );
  if (diffToTodayDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = Math.floor(
      (sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24),
    );
    if (diffDays !== 1) break;
    streak++;
  }

  return streak;
}

function getLongestStreakDays(sessions: unknown[]): number {
  const asSessions = sessions as Array<{
    completedAt?: { toDate: () => Date };
    createdAt: { toDate: () => Date };
    status?: string;
  }>;

  const dayKeys = new Set<number>();
  for (const session of asSessions) {
    if (session.status !== "completed") continue;
    const date = (session.completedAt ?? session.createdAt).toDate();
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    dayKeys.add(day.getTime());
  }

  if (dayKeys.size === 0) return 0;

  const sortedDays = [...dayKeys].sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = Math.floor(
      (sortedDays[i] - sortedDays[i - 1]) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
      continue;
    }
    current = 1;
  }

  return longest;
}

function formatRequirement(requirement?: number, unit?: string): string | null {
  if (typeof requirement !== "number" || !Number.isFinite(requirement))
    return null;
  if (typeof unit !== "string" || unit.trim().length === 0) return null;

  const trimmed = unit.trim();
  const isSimpleWord = /^[A-Za-z]+$/.test(trimmed);
  if (requirement === 1) {
    const singular =
      isSimpleWord && trimmed.endsWith("s") ? trimmed.slice(0, -1) : trimmed;
    return `${requirement} ${singular}`;
  }

  if (!isSimpleWord) {
    return `${requirement} ${trimmed}`;
  }

  const plural = trimmed.endsWith("s") ? trimmed : `${trimmed}s`;
  return `${requirement} ${plural}`;
}

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
  useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [stats, setStats] = useState<UserStats>({
    avgScore: 0,
    totalSessions: 0,
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

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
        const profile = await DatabaseService.getUserProfile(user.uid);
        setTotalXP(
          typeof profile?.experiencePoints === "number" &&
            Number.isFinite(profile.experiencePoints)
            ? profile.experiencePoints
            : 0,
        );
        const sessions = await DatabaseService.getUserSessions(user.uid, 100);
        if (!sessions.length) {
          setStats({
            avgScore: profile?.averageScore ?? 0,
            totalSessions: profile?.totalInterviews ?? 0,
            totalTime: 0,
          });
          return;
        }

        const completedSessionsWithScores = sessions.filter(
          (s) => s.status === "completed" && (s.scores?.overall ?? 0) > 0,
        );
        const derivedAvgScore =
          completedSessionsWithScores.length > 0
            ? Math.round(
                completedSessionsWithScores.reduce(
                  (sum, session) => sum + (session.scores?.overall || 0),
                  0,
                ) / completedSessionsWithScores.length,
              )
            : 0;

        const derivedTotalSessions = sessions.length;
        const derivedTotalTime = sessions.reduce(
          (sum, session) => sum + (session.totalDuration || 0),
          0,
        );

        const perfectScores = completedSessionsWithScores.filter(
          (s) => (s.scores?.overall ?? 0) === 100,
        ).length;

        const computedStats: UserStats = {
          avgScore:
            typeof profile?.averageScore === "number"
              ? profile.averageScore
              : derivedAvgScore,
          totalSessions:
            typeof profile?.totalInterviews === "number"
              ? profile.totalInterviews
              : derivedTotalSessions,
          totalTime: derivedTotalTime,
          perfectScores,
          currentStreak: getCurrentStreakDays(sessions),
          longestStreak: getLongestStreakDays(sessions),
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

  const tierOrder = useMemo<AchievementTier[]>(
    () => [
      "bronze_i",
      "bronze_ii",
      "bronze_iii",
      "silver_i",
      "silver_ii",
      "silver_iii",
      "gold_i",
      "gold_ii",
      "gold_iii",
      "platinum_i",
      "platinum_ii",
      "platinum_iii",
      "diamond_i",
      "diamond_ii",
      "diamond_iii",
    ],
    [],
  );

  const filteredAchievements = useMemo(() => {
    const tierIndex = new Map<AchievementTier, number>(
      tierOrder.map((tier, idx) => [tier, idx]),
    );

    const filtered = achievementsWithProgress.filter((item) => {
      if (statusFilter === "unlocked" && !item.isUnlocked) return false;
      if (statusFilter === "locked" && item.isUnlocked) return false;

      if (tierFilter === "all") return true;
      return getBaseTier(item.achievement.tier) === tierFilter;
    });

    return filtered.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;

      const aTier = tierIndex.get(a.achievement.tier) ?? 999;
      const bTier = tierIndex.get(b.achievement.tier) ?? 999;
      if (aTier !== bTier) return aTier - bTier;

      return a.achievement.name.localeCompare(b.achievement.name);
    });
  }, [achievementsWithProgress, statusFilter, tierFilter, tierOrder]);

  const rank = getRankByXP(totalXP);
  const nextRank = getNextRank(rank);
  const progressToNextRank = getProgressToNextRank(totalXP, rank);
  const xpToNextRank = getXPToNextRank(totalXP, rank);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="size-8 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
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
            <div className="flex items-center gap-3">
              <Typography.SubCaptionMedium color="secondary">
                {achievementStats.unlockedCount} /{" "}
                {achievementStats.totalAchievements} unlocked
              </Typography.SubCaptionMedium>

              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="h-9 w-[140px] border border-border/60 bg-transparent px-3 text-sm shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      All
                    </SelectItem>
                    <SelectItem
                      value="unlocked"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Unlocked
                    </SelectItem>
                    <SelectItem
                      value="locked"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Locked
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={tierFilter}
                  onValueChange={(value) => setTierFilter(value as TierFilter)}
                >
                  <SelectTrigger className="h-9 w-[140px] border border-border/60 bg-transparent px-3 text-sm shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      All tiers
                    </SelectItem>
                    <SelectItem
                      value="bronze"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Bronze
                    </SelectItem>
                    <SelectItem
                      value="silver"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Silver
                    </SelectItem>
                    <SelectItem
                      value="gold"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Gold
                    </SelectItem>
                    <SelectItem
                      value="platinum"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Platinum
                    </SelectItem>
                    <SelectItem
                      value="diamond"
                      className="data-[highlighted]:bg-muted data-[state=checked]:bg-muted focus:bg-muted"
                    >
                      Diamond
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAchievements.map((item) => (
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
  const ariaLabel = (() => {
    if (isUnlocked) {
      return `${achievement.name} - Unlocked - ${achievement.description} - Worth ${achievement.xpReward} XP`;
    }

    const formatted = formatRequirement(
      achievement.requirement,
      achievement.requirementUnit,
    );
    const requires = formatted ? ` - Requires ${formatted}` : "";

    return `${achievement.name} - Locked - ${Math.round(progress)}% progress - ${achievement.description}${requires} - Worth ${achievement.xpReward} XP`;
  })();

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
          "relative overflow-hidden transition-all duration-300 border-2 group cursor-pointer",
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
        {!isUnlocked && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-background/45 backdrop-blur-[2px]"
          />
        )}
        {!isUnlocked && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-4 top-4 z-20"
          >
            <div className="rounded-full border bg-background/70 p-2 shadow-sm">
              <svg
                className="size-4 text-foreground/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          </div>
        )}

        <CardContent className="p-5 flex flex-col h-full relative z-0">
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={cn(
                "p-3 rounded-2xl",
                currentStyle.bg,
                !isUnlocked && "grayscale",
              )}
            >
              <Icon
                className={cn("size-6", currentStyle.text)}
                aria-hidden="true"
              />
            </div>

            <div className="space-y-1">
              <Typography.BodyMedium className="line-clamp-2">
                {achievement.name}
              </Typography.BodyMedium>
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

            {!isUnlocked && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <Typography.SubCaption>Progress</Typography.SubCaption>
                  <Typography.SubCaption>
                    {Math.round(progress)}%
                  </Typography.SubCaption>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge
              variant={isUnlocked ? "default" : "secondary"}
              className={cn(
                isUnlocked
                  ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                  : "bg-muted/50 text-muted-foreground border-muted",
              )}
            >
              {isUnlocked ? "Unlocked" : "Locked"}
            </Badge>
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
