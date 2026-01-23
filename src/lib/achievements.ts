// /lib/achievements.ts

export type AchievementTier =
  | "bronze_i"
  | "bronze_ii"
  | "bronze_iii"
  | "silver_i"
  | "silver_ii"
  | "silver_iii"
  | "gold_i"
  | "gold_ii"
  | "gold_iii"
  | "platinum_i"
  | "platinum_ii"
  | "platinum_iii"
  | "diamond_i"
  | "diamond_ii"
  | "diamond_iii";
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
  bronze_i: 25,
  bronze_ii: 50,
  bronze_iii: 75,
  silver_i: 100,
  silver_ii: 125,
  silver_iii: 150,
  gold_i: 200,
  gold_ii: 250,
  gold_iii: 300,
  platinum_i: 400,
  platinum_ii: 500,
  platinum_iii: 600,
  diamond_i: 800,
  diamond_ii: 1000,
  diamond_iii: 1200,
};

export const ACHIEVEMENTS: Achievement[] = [
  // Bronze Tier - Getting Started
  {
    id: "first_interview",
    name: "First Steps",
    description: "Complete your first interview session.",
    icon: "Gi3dMeeple",
    tier: "bronze_i",
    category: "sessions",
    xpReward: XP_BY_TIER.bronze_i,
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
    tier: "bronze_ii",
    category: "sessions",
    xpReward: XP_BY_TIER.bronze_ii,
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
    tier: "bronze_iii",
    category: "time",
    xpReward: XP_BY_TIER.bronze_iii,
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
    tier: "silver_i",
    category: "sessions",
    xpReward: XP_BY_TIER.silver_i,
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
    tier: "silver_ii",
    category: "time",
    xpReward: XP_BY_TIER.silver_ii,
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
    tier: "silver_iii",
    category: "performance",
    xpReward: XP_BY_TIER.silver_iii,
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
    tier: "gold_i",
    category: "sessions",
    xpReward: XP_BY_TIER.gold_i,
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
    tier: "gold_ii",
    category: "performance",
    xpReward: XP_BY_TIER.gold_ii,
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
    tier: "gold_iii",
    category: "time",
    xpReward: XP_BY_TIER.gold_iii,
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
    tier: "platinum_i",
    category: "sessions",
    xpReward: XP_BY_TIER.platinum_i,
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
    tier: "platinum_ii",
    category: "performance",
    xpReward: XP_BY_TIER.platinum_ii,
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
    tier: "platinum_iii",
    category: "time",
    xpReward: XP_BY_TIER.platinum_iii,
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
    tier: "diamond_i",
    category: "sessions",
    xpReward: XP_BY_TIER.diamond_i,
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
    tier: "diamond_ii",
    category: "performance",
    xpReward: XP_BY_TIER.diamond_ii,
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
    tier: "diamond_iii",
    category: "time",
    xpReward: XP_BY_TIER.diamond_iii,
    requirement: 600,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 600,
    progressCalculator: (stats) => Math.min((stats.totalTime / 600) * 100, 100),
  },

  // Additional Achievements for Engagement

  // Sessions
  {
    id: "fifteen_interviews",
    name: "Growing Confidence",
    description: "Complete 15 interview sessions.",
    icon: "GiProgression",
    tier: "silver_ii",
    category: "sessions",
    xpReward: XP_BY_TIER.silver_ii,
    requirement: 15,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 15,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 15) * 100, 100),
  },
  {
    id: "twenty_interviews",
    name: "Rising Star",
    description: "Complete 20 interview sessions.",
    icon: "GiStarMedal",
    tier: "silver_ii",
    category: "sessions",
    xpReward: XP_BY_TIER.silver_ii,
    requirement: 20,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 20,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 20) * 100, 100),
  },
  {
    id: "thirty_interviews",
    name: "Seasoned Veteran",
    description: "Complete 30 interview sessions.",
    icon: "GiMeepleKing",
    tier: "gold_i",
    category: "sessions",
    xpReward: XP_BY_TIER.gold_i,
    requirement: 30,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 30,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 30) * 100, 100),
  },
  {
    id: "forty_interviews",
    name: "Interview Pro",
    description: "Complete 40 interview sessions.",
    icon: "Crown",
    tier: "gold_iii",
    category: "sessions",
    xpReward: XP_BY_TIER.gold_iii,
    requirement: 40,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 40,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 40) * 100, 100),
  },
  {
    id: "sixty_interviews",
    name: "Interview Expert",
    description: "Complete 60 interview sessions.",
    icon: "GiLaurelCrown",
    tier: "platinum_ii",
    category: "sessions",
    xpReward: XP_BY_TIER.platinum_ii,
    requirement: 60,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 60,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 60) * 100, 100),
  },
  {
    id: "seventy_five_interviews",
    name: "Interview Guru",
    description: "Complete 75 interview sessions.",
    icon: "GiImperialCrown",
    tier: "platinum_iii",
    category: "sessions",
    xpReward: XP_BY_TIER.platinum_iii,
    requirement: 75,
    requirementUnit: "sessions",
    condition: (stats) => stats.totalSessions >= 75,
    progressCalculator: (stats) =>
      Math.min((stats.totalSessions / 75) * 100, 100),
  },

  // Time
  {
    id: "ninety_minutes",
    name: "Persistent Practitioner",
    description: "Spend 90 minutes practicing.",
    icon: "Clock",
    tier: "silver_iii",
    category: "time",
    xpReward: XP_BY_TIER.silver_iii,
    requirement: 90,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 90,
    progressCalculator: (stats) => Math.min((stats.totalTime / 90) * 100, 100),
  },
  {
    id: "six_hour_practice",
    name: "Endurance Expert",
    description: "Spend 6 hours in practice interviews.",
    icon: "Sword",
    tier: "gold_ii",
    category: "time",
    xpReward: XP_BY_TIER.gold_ii,
    requirement: 360,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 360,
    progressCalculator: (stats) => Math.min((stats.totalTime / 360) * 100, 100),
  },
  {
    id: "eight_hour_practice",
    name: "Time Titan",
    description: "Spend 8 hours in practice interviews.",
    icon: "GiTimeTrap",
    tier: "diamond_i",
    category: "time",
    xpReward: XP_BY_TIER.diamond_i,
    requirement: 480,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 480,
    progressCalculator: (stats) => Math.min((stats.totalTime / 480) * 100, 100),
  },
  {
    id: "twelve_hour_practice",
    name: "Chronos Champion",
    description: "Spend 12 hours in practice interviews.",
    icon: "GiSandsOfTime",
    tier: "diamond_ii",
    category: "time",
    xpReward: XP_BY_TIER.diamond_ii,
    requirement: 720,
    requirementUnit: "minutes",
    condition: (stats) => stats.totalTime >= 720,
    progressCalculator: (stats) => Math.min((stats.totalTime / 720) * 100, 100),
  },

  // Performance
  {
    id: "score_80",
    name: "Solid Performer",
    description: "Achieve an average score of 80% or above.",
    icon: "Star",
    tier: "gold_i",
    category: "performance",
    xpReward: XP_BY_TIER.gold_i,
    requirement: 80,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 80,
    progressCalculator: (stats) => Math.min((stats.avgScore / 80) * 100, 100),
  },
  {
    id: "score_85",
    name: "High Achiever",
    description: "Achieve an average score of 85% or above.",
    icon: "Medal",
    tier: "gold_iii",
    category: "performance",
    xpReward: XP_BY_TIER.gold_iii,
    requirement: 85,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 85,
    progressCalculator: (stats) => Math.min((stats.avgScore / 85) * 100, 100),
  },
  {
    id: "score_98",
    name: "Near Perfection",
    description: "Achieve an average score of 98% or above.",
    icon: "GiSparkSpirit",
    tier: "platinum_iii",
    category: "performance",
    xpReward: XP_BY_TIER.platinum_iii,
    requirement: 98,
    requirementUnit: "% avg score",
    condition: (stats) => stats.avgScore >= 98,
    progressCalculator: (stats) => Math.min((stats.avgScore / 98) * 100, 100),
  },

  // Streaks
  {
    id: "five_day_streak",
    name: "Midweek Momentum",
    description: "Maintain a 5-day practice streak.",
    icon: "Flame",
    tier: "bronze_iii",
    category: "streaks",
    xpReward: XP_BY_TIER.bronze_iii,
    requirement: 5,
    requirementUnit: "days",
    condition: (stats) => (stats.currentStreak || 0) >= 5,
    progressCalculator: (stats) =>
      Math.min(((stats.currentStreak || 0) / 5) * 100, 100),
  },
  {
    id: "three_day_streak",
    name: "Consistent Learner",
    description: "Maintain a 3-day practice streak.",
    icon: "GiFire",
    tier: "bronze_ii",
    category: "streaks",
    xpReward: XP_BY_TIER.bronze_ii,
    requirement: 3,
    requirementUnit: "days",
    condition: (stats) => (stats.currentStreak || 0) >= 3,
    progressCalculator: (stats) =>
      Math.min(((stats.currentStreak || 0) / 3) * 100, 100),
  },
  {
    id: "seven_day_streak",
    name: "Weekly Warrior",
    description: "Maintain a 7-day practice streak.",
    icon: "GiFire",
    tier: "silver_i",
    category: "streaks",
    xpReward: XP_BY_TIER.silver_i,
    requirement: 7,
    requirementUnit: "days",
    condition: (stats) => (stats.longestStreak || 0) >= 7,
    progressCalculator: (stats) =>
      Math.min(((stats.longestStreak || 0) / 7) * 100, 100),
  },
  {
    id: "ten_day_streak",
    name: "Tenacious",
    description: "Maintain a 10-day practice streak.",
    icon: "GiSparkSpirit",
    tier: "silver_iii",
    category: "streaks",
    xpReward: XP_BY_TIER.silver_iii,
    requirement: 10,
    requirementUnit: "days",
    condition: (stats) => (stats.longestStreak || 0) >= 10,
    progressCalculator: (stats) =>
      Math.min(((stats.longestStreak || 0) / 10) * 100, 100),
  },
  {
    id: "fourteen_day_streak",
    name: "Fortnight Focus",
    description: "Maintain a 14-day practice streak.",
    icon: "Zap",
    tier: "gold_i",
    category: "streaks",
    xpReward: XP_BY_TIER.gold_i,
    requirement: 14,
    requirementUnit: "days",
    condition: (stats) => (stats.longestStreak || 0) >= 14,
    progressCalculator: (stats) =>
      Math.min(((stats.longestStreak || 0) / 14) * 100, 100),
  },
  {
    id: "twenty_day_streak",
    name: "Streak Champion",
    description: "Maintain a 20-day practice streak.",
    icon: "GiSparkles",
    tier: "gold_ii",
    category: "streaks",
    xpReward: XP_BY_TIER.gold_ii,
    requirement: 20,
    requirementUnit: "days",
    condition: (stats) => (stats.longestStreak || 0) >= 20,
    progressCalculator: (stats) =>
      Math.min(((stats.longestStreak || 0) / 20) * 100, 100),
  },
  {
    id: "thirty_day_streak",
    name: "Monthly Master",
    description: "Maintain a 30-day practice streak.",
    icon: "GiDiamondTrophy",
    tier: "platinum_i",
    category: "streaks",
    xpReward: XP_BY_TIER.platinum_i,
    requirement: 30,
    requirementUnit: "days",
    condition: (stats) => (stats.longestStreak || 0) >= 30,
    progressCalculator: (stats) =>
      Math.min(((stats.longestStreak || 0) / 30) * 100, 100),
  },

  // Special
  {
    id: "five_perfect_scores",
    name: "Quintuple Perfect",
    description: "Achieve 5 perfect 100% scores.",
    icon: "Podium",
    tier: "platinum_ii",
    category: "special",
    xpReward: XP_BY_TIER.platinum_ii,
    requirement: 5,
    requirementUnit: "perfect scores",
    condition: (stats) => (stats.perfectScores || 0) >= 5,
    progressCalculator: (stats) =>
      Math.min(((stats.perfectScores || 0) / 5) * 100, 100),
  },
  {
    id: "ten_perfect_scores",
    name: "Perfect Decade",
    description: "Achieve 10 perfect 100% scores.",
    icon: "Rank",
    tier: "diamond_ii",
    category: "special",
    xpReward: XP_BY_TIER.diamond_ii,
    requirement: 10,
    requirementUnit: "perfect scores",
    condition: (stats) => (stats.perfectScores || 0) >= 10,
    progressCalculator: (stats) =>
      Math.min(((stats.perfectScores || 0) / 10) * 100, 100),
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
