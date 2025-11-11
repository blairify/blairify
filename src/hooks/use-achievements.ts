"use client";

import { useMemo } from "react";
import {
  ACHIEVEMENTS,
  type Achievement,
  type AchievementCategory,
  type AchievementTier,
  calculateTotalXP,
  getAchievementsByCategory,
  getAchievementsByTier,
  getNextAchievement,
  type UserStats,
} from "@/lib/achievements";
import {
  getNextRank,
  getProgressToNextRank,
  getRankByXP,
  getXPToNextRank,
} from "@/lib/ranks";

export interface AchievementProgress {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number; // 0-100
  xpEarned: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  lockedCount: number;
  totalXP: number;
  completionPercentage: number;
  byTier: Record<AchievementTier, { unlocked: number; total: number }>;
  byCategory: Record<AchievementCategory, { unlocked: number; total: number }>;
}

export function useAchievements(stats: UserStats) {
  // Calculate unlocked achievements
  const unlocked = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => a.condition(stats));
  }, [stats]);

  // Calculate locked achievements
  const locked = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => !a.condition(stats));
  }, [stats]);

  // Calculate progress for all achievements
  const achievementsWithProgress = useMemo((): AchievementProgress[] => {
    return ACHIEVEMENTS.map((achievement) => {
      const isUnlocked = achievement.condition(stats);
      const progress = achievement.progressCalculator
        ? achievement.progressCalculator(stats)
        : isUnlocked
          ? 100
          : 0;

      return {
        achievement,
        isUnlocked,
        progress,
        xpEarned: isUnlocked ? achievement.xpReward : 0,
      };
    });
  }, [stats]);

  // Calculate total XP from unlocked achievements
  const totalXP = useMemo(() => {
    return calculateTotalXP(unlocked.map((a) => a.id));
  }, [unlocked]);

  // Calculate level based on XP (100 XP per level)
  const level = useMemo(() => {
    return Math.floor(totalXP / 100) + 1;
  }, [totalXP]);

  // Calculate XP needed for next level
  const xpForNextLevel = useMemo(() => {
    return level * 100;
  }, [level]);

  const xpProgress = useMemo(() => {
    return totalXP % 100;
  }, [totalXP]);

  // Group achievements by tier
  const achievementsByTier = useMemo(() => {
    const tiers: AchievementTier[] = [
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond",
    ];
    return tiers.reduce(
      (acc, tier) => {
        acc[tier] = achievementsWithProgress.filter(
          (a) => a.achievement.tier === tier,
        );
        return acc;
      },
      {} as Record<AchievementTier, AchievementProgress[]>,
    );
  }, [achievementsWithProgress]);

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const categories: AchievementCategory[] = [
      "sessions",
      "performance",
      "time",
      "streaks",
      "special",
    ];
    return categories.reduce(
      (acc, category) => {
        acc[category] = achievementsWithProgress.filter(
          (a) => a.achievement.category === category,
        );
        return acc;
      },
      {} as Record<AchievementCategory, AchievementProgress[]>,
    );
  }, [achievementsWithProgress]);

  // Calculate statistics
  const achievementStats = useMemo((): AchievementStats => {
    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedCount = unlocked.length;
    const lockedCount = locked.length;
    const completionPercentage = Math.round(
      (unlockedCount / totalAchievements) * 100,
    );

    const tiers: AchievementTier[] = [
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond",
    ];
    const byTier = tiers.reduce(
      (acc, tier) => {
        const tierAchievements = getAchievementsByTier(tier);
        const unlockedInTier = tierAchievements.filter((a) =>
          a.condition(stats),
        ).length;
        acc[tier] = {
          unlocked: unlockedInTier,
          total: tierAchievements.length,
        };
        return acc;
      },
      {} as Record<AchievementTier, { unlocked: number; total: number }>,
    );

    const categories: AchievementCategory[] = [
      "sessions",
      "performance",
      "time",
      "streaks",
      "special",
    ];
    const byCategory = categories.reduce(
      (acc, category) => {
        const categoryAchievements = getAchievementsByCategory(category);
        const unlockedInCategory = categoryAchievements.filter((a) =>
          a.condition(stats),
        ).length;
        acc[category] = {
          unlocked: unlockedInCategory,
          total: categoryAchievements.length,
        };
        return acc;
      },
      {} as Record<AchievementCategory, { unlocked: number; total: number }>,
    );

    return {
      totalAchievements,
      unlockedCount,
      lockedCount,
      totalXP,
      completionPercentage,
      byTier,
      byCategory,
    };
  }, [unlocked, locked, totalXP, stats]);

  // Get next achievement to unlock (closest to completion)
  const nextAchievement = useMemo(() => {
    return getNextAchievement(stats);
  }, [stats]);

  // Rank system integration
  const rank = useMemo(() => {
    return getRankByXP(totalXP);
  }, [totalXP]);

  const nextRank = useMemo(() => {
    return getNextRank(rank);
  }, [rank]);

  const progressToNextRank = useMemo(() => {
    return getProgressToNextRank(totalXP, rank);
  }, [totalXP, rank]);

  const xpToNextRank = useMemo(() => {
    return getXPToNextRank(totalXP, rank);
  }, [totalXP, rank]);

  return {
    // Basic lists
    unlocked,
    locked,
    all: ACHIEVEMENTS,

    // Progress tracking
    achievementsWithProgress,
    achievementsByTier,
    achievementsByCategory,

    // XP and leveling
    totalXP,
    level,
    xpForNextLevel,
    xpProgress,

    // Rank system
    rank,
    nextRank,
    progressToNextRank,
    xpToNextRank,

    // Statistics
    stats: achievementStats,

    // Recommendations
    nextAchievement,
  };
}

// Helper hook for checking if a specific achievement is unlocked
export function useAchievementUnlocked(
  achievementId: string,
  stats: UserStats,
): boolean {
  return useMemo(() => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    return achievement ? achievement.condition(stats) : false;
  }, [achievementId, stats]);
}
