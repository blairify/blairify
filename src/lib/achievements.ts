// /lib/achievements.ts

export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";
export type AchievementCategory =
  | "sessions"
  | "performance"
  | "time"
  | "streaks"
  | "special";

export interface UserStats {
  avgScore: number;
  totalSessions: number;
  totalTime: number; // in minutes
  currentStreak?: number;
  longestStreak?: number;
  perfectScores?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category: AchievementCategory;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
  progressCalculator?: (stats: UserStats) => number; // Returns 0-100
  requirement?: number; // For display purposes
  requirementUnit?: string;
}

// XP rewards by tier
const XP_BY_TIER: Record<AchievementTier, number> = {
  bronze: 50,
  silver: 100,
  gold: 250,
  platinum: 500,
  diamond: 1000,
};

export const ACHIEVEMENTS: Achievement[] = [
  // Bronze Tier - Getting Started
  {
    id: "first_interview",
    name: "First Steps",
    description: "Complete your first interview session.",
    icon: "Gi3dMeeple",
    tier: "bronze",
    category: "sessions",
    xpReward: XP_BY_TIER.bronze,
    requirement: 1,
    requirementUnit: "session",
    condition: (stats) => stats.totalSessions >= 1,
    progressCalculator: (stats) => Math.min(stats.totalSessions * 100, 100),
  },
  {
    id: "five_interviews",
    name: "Getting Warmed Up",
    description: "Complete 5 interview sessions.",
    icon: "GiProgression",
    tier: "bronze",
    category: "sessions",
    xpReward: XP_BY_TIER.bronze,
    requirement: 5,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 5,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 5) * 100, 100),
  },
  {
    id: "thirty_minutes",
    name: "Time Investor",
    description: "Spend 30 minutes practicing.",
    icon: "GiHourglass",
    tier: "bronze",
    category: "time",
    xpReward: XP_BY_TIER.bronze,
    requirement: 30,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 30,
    progressCalculator: (stats) => Math.min((stats.totalTime / 30) * 100, 100),
  },

  // Silver Tier - Building Momentum
  {
    id: "ten_interviews",
    name: "Dedicated Learner",
    description: "Complete 10 interview sessions.",
    icon: "GiLaurelCrown",
    tier: "silver",
    category: "sessions",
    xpReward: XP_BY_TIER.silver,
    requirement: 10,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 10,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 10) * 100, 100),
  },
  {
    id: "hour_practice",
    name: "The Grinder",
    description: "Spend 1 hour in practice interviews.",
    icon: "GiSandsOfTime",
    tier: "silver",
    category: "time",
    xpReward: XP_BY_TIER.silver,
    requirement: 60,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 60,
    progressCalculator: (stats) => Math.min((stats.totalTime / 60) * 100, 100),
  },
  {
    id: "score_70",
    name: "Competent Communicator",
    description: "Achieve an average score of 70% or above.",
    icon: "GiStarMedal",
    tier: "silver",
    category: "performance",
    xpReward: XP_BY_TIER.silver,
    requirement: 70,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 70,
    progressCalculator: (stats) => Math.min((stats.avgScore / 70) * 100, 100),
  },

  // Gold Tier - Mastery
  {
    id: "twenty_five_interviews",
    name: "Interview Veteran",
    description: "Complete 25 interview sessions.",
    icon: "GiMeepleKing",
    tier: "gold",
    category: "sessions",
    xpReward: XP_BY_TIER.gold,
    requirement: 25,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 25,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 25) * 100, 100),
  },
  {
    id: "score_90",
    name: "Ace Communicator",
    description: "Achieve an average score of 90% or above.",
    icon: "GiDiamondTrophy",
    tier: "gold",
    category: "performance",
    xpReward: XP_BY_TIER.gold,
    requirement: 90,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 90,
    progressCalculator: (stats) => Math.min((stats.avgScore / 90) * 100, 100),
  },
  {
    id: "three_hour_practice",
    name: "Marathon Runner",
    description: "Spend 3 hours in practice interviews.",
    icon: "GiTimeTrap",
    tier: "gold",
    category: "time",
    xpReward: XP_BY_TIER.gold,
    requirement: 180,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 180,
    progressCalculator: (stats) => Math.min((stats.totalTime / 180) * 100, 100),
  },

  // Platinum Tier - Excellence
  {
    id: "fifty_interviews",
    name: "Interview Master",
    description: "Complete 50 interview sessions.",
    icon: "GiImperialCrown",
    tier: "platinum",
    category: "sessions",
    xpReward: XP_BY_TIER.platinum,
    requirement: 50,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 50,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 50) * 100, 100),
  },
  {
    id: "score_95",
    name: "Elite Performer",
    description: "Achieve an average score of 95% or above.",
    icon: "GiSparkSpirit",
    tier: "platinum",
    category: "performance",
    xpReward: XP_BY_TIER.platinum,
    requirement: 95,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 95,
    progressCalculator: (stats) => Math.min((stats.avgScore / 95) * 100, 100),
  },
  {
    id: "five_hour_practice",
    name: "Dedication Personified",
    description: "Spend 5 hours in practice interviews.",
    icon: "GiMetronome",
    tier: "platinum",
    category: "time",
    xpReward: XP_BY_TIER.platinum,
    requirement: 300,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 300,
    progressCalculator: (stats) => Math.min((stats.totalTime / 300) * 100, 100),
  },

  // Diamond Tier - Legendary
  {
    id: "hundred_interviews",
    name: "Interview Legend",
    description: "Complete 100 interview sessions.",
    icon: "GiTrophyCup",
    tier: "diamond",
    category: "sessions",
    xpReward: XP_BY_TIER.diamond,
    requirement: 100,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 100,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 100) * 100, 100),
  },
  {
    id: "perfect_score",
    name: "Perfectionist",
    description: "Achieve a perfect 100% score in any interview.",
    icon: "GiSparkles",
    tier: "diamond",
    category: "performance",
    xpReward: XP_BY_TIER.diamond,
    requirement: 1,
    requirementUnit: "perfect score",
    condition: (stats) => (stats.perfectScores || 0) >= 1,
    progressCalculator: (stats) => ((stats.perfectScores || 0) >= 1 ? 100 : 0),
  },
  {
    id: "ten_hour_practice",
    name: "Ultimate Dedication",
    description: "Spend 10 hours in practice interviews.",
    icon: "GiLotus",
    tier: "diamond",
    category: "time",
    xpReward: XP_BY_TIER.diamond,
    requirement: 600,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 600,
    progressCalculator: (stats) => Math.min((stats.totalTime / 600) * 100, 100),
  },
];

// Helper functions
export function getAchievementsByTier(tier: AchievementTier): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
}

export function getAchievementsByCategory(
  category: AchievementCategory,
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function calculateTotalXP(unlockedAchievements: string[]): number {
  return ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id)).reduce(
    (sum, a) => sum + a.xpReward,
    0,
  );
}

export function getNextAchievement(
  stats: UserStats,
  category?: AchievementCategory,
): Achievement | null {
  const filtered = category
    ? ACHIEVEMENTS.filter((a) => a.category === category)
    : ACHIEVEMENTS;

  const locked = filtered.filter((a) => !a.condition(stats));
  if (locked.length === 0) return null;

  // Sort by progress (closest to completion first)
  return locked.sort((a, b) => {
    const progressA = a.progressCalculator ? a.progressCalculator(stats) : 0;
    const progressB = b.progressCalculator ? b.progressCalculator(stats) : 0;
    return progressB - progressA;
  })[0];
}
