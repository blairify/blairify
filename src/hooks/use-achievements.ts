"use client";
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

const TIER_ORDER: AchievementTier[] = [
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
];

const CATEGORY_ORDER: AchievementCategory[] = [
  "sessions",
  "performance",
  "time",
  "streaks",
  "special",
];

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
  const unlocked = ACHIEVEMENTS.filter((achievement) =>
    achievement.condition(stats),
  );

  const locked = ACHIEVEMENTS.filter(
    (achievement) => !achievement.condition(stats),
  );

  const achievementsWithProgress: AchievementProgress[] = ACHIEVEMENTS.map(
    (achievement) => {
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
    },
  );

  const achievementXP = calculateTotalXP(
    unlocked.map((achievement) => achievement.id),
  );
  const level = Math.floor(achievementXP / 100) + 1;
  const xpForNextLevel = level * 100;
  const xpProgress = achievementXP % 100;

  const achievementsByTier = TIER_ORDER.reduce(
    (acc, tier) => {
      acc[tier] = achievementsWithProgress.filter(
        (achievement) => achievement.achievement.tier === tier,
      );
      return acc;
    },
    {} as Record<AchievementTier, AchievementProgress[]>,
  );

  const achievementsByCategory = CATEGORY_ORDER.reduce(
    (acc, category) => {
      acc[category] = achievementsWithProgress.filter(
        (achievement) => achievement.achievement.category === category,
      );
      return acc;
    },
    {} as Record<AchievementCategory, AchievementProgress[]>,
  );

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlocked.length;
  const lockedCount = locked.length;
  const completionPercentage = Math.round(
    (unlockedCount / totalAchievements) * 100,
  );

  const byTier = TIER_ORDER.reduce(
    (acc, tier) => {
      const tierAchievements = getAchievementsByTier(tier);
      const unlockedInTier = tierAchievements.filter((achievement) =>
        achievement.condition(stats),
      ).length;
      acc[tier] = {
        unlocked: unlockedInTier,
        total: tierAchievements.length,
      };
      return acc;
    },
    {} as Record<AchievementTier, { unlocked: number; total: number }>,
  );

  const byCategory = CATEGORY_ORDER.reduce(
    (acc, category) => {
      const categoryAchievements = getAchievementsByCategory(category);
      const unlockedInCategory = categoryAchievements.filter((achievement) =>
        achievement.condition(stats),
      ).length;
      acc[category] = {
        unlocked: unlockedInCategory,
        total: categoryAchievements.length,
      };
      return acc;
    },
    {} as Record<AchievementCategory, { unlocked: number; total: number }>,
  );

  const achievementStats: AchievementStats = {
    totalAchievements,
    unlockedCount,
    lockedCount,
    totalXP: achievementXP,
    completionPercentage,
    byTier,
    byCategory,
  };

  const nextAchievement = getNextAchievement(stats);
  const rank = getRankByXP(achievementXP);
  const nextRank = getNextRank(rank);
  const progressToNextRank = getProgressToNextRank(achievementXP, rank);
  const xpToNextRank = getXPToNextRank(achievementXP, rank);

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
    achievementXP,
    totalXP: achievementXP,
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
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  return achievement ? achievement.condition(stats) : false;
}
