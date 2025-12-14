/**
 * Badge System - Different types of badges users can earn
 * Badges are visual representations of achievements and milestones
 */

export type BadgeCategory =
  | "achievement" // Earned from completing achievements
  | "milestone" // Special milestones (100 sessions, etc.)
  | "seasonal" // Limited-time seasonal badges
  | "special" // Rare/special event badges
  | "skill" // Skill mastery badges
  | "streak" // Consistency/streak badges
  | "community"; // Community participation badges

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  imageUrl?: string;
  color: string;
  unlockCondition: string; // Human-readable description
  isHidden?: boolean; // Hidden until unlocked
  relatedAchievementId?: string; // Link to achievement if applicable
  earnedDate?: Date; // When the user earned it
  metadata?: Record<string, any>; // Additional data
}

// Badge color schemes by rarity
export const BADGE_RARITY_COLORS: Record<
  BadgeRarity,
  { border: string; bg: string; text: string }
> = {
  common: {
    border: "border-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  },
  uncommon: {
    border: "border-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
  },
  rare: {
    border: "border-primary/70 dark:border-primary/50",
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary dark:text-primary/80",
  },
  epic: {
    border: "border-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
  },
  legendary: {
    border: "border-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
  },
};

// Predefined badge definitions
export const BADGE_DEFINITIONS: Badge[] = [
  // Achievement Badges (linked to achievements)
  {
    id: "badge_first_steps",
    name: "First Steps",
    description: "Completed your first interview",
    category: "achievement",
    rarity: "common",
    icon: "Trophy",
    color: "#CD7F32", // Bronze
    unlockCondition: "Complete 1 interview session",
    relatedAchievementId: "first_interview",
  },
  {
    id: "badge_dedicated_learner",
    name: "Dedicated Learner",
    description: "Completed 10 interviews",
    category: "achievement",
    rarity: "uncommon",
    icon: "Target",
    color: "#C0C0C0", // Silver
    unlockCondition: "Complete 10 interview sessions",
    relatedAchievementId: "ten_interviews",
  },
  {
    id: "badge_ace_communicator",
    name: "Ace Communicator",
    description: "Achieved 90% average score",
    category: "achievement",
    rarity: "rare",
    icon: "Star",
    color: "#FFD700", // Gold
    unlockCondition: "Maintain 90% average score",
    relatedAchievementId: "score_90",
  },
  {
    id: "badge_interview_master",
    name: "Interview Master",
    description: "Completed 50 interviews",
    category: "achievement",
    rarity: "epic",
    icon: "Crown",
    color: "#00CED1", // Platinum
    unlockCondition: "Complete 50 interview sessions",
    relatedAchievementId: "fifty_interviews",
  },
  {
    id: "badge_legend",
    name: "Interview Legend",
    description: "Completed 100 interviews",
    category: "achievement",
    rarity: "legendary",
    icon: "Trophy",
    color: "#9B59B6", // Diamond
    unlockCondition: "Complete 100 interview sessions",
    relatedAchievementId: "hundred_interviews",
  },

  // Milestone Badges
  {
    id: "badge_level_10",
    name: "Rising Star",
    description: "Reached level 10",
    category: "milestone",
    rarity: "uncommon",
    icon: "Star",
    color: "#3498DB",
    unlockCondition: "Reach level 10",
  },
  {
    id: "badge_level_25",
    name: "Experienced Pro",
    description: "Reached level 25",
    category: "milestone",
    rarity: "rare",
    icon: "GiFlowerTwirl",
    color: "#9B59B6",
    unlockCondition: "Reach level 25",
  },
  {
    id: "badge_level_50",
    name: "Elite Interviewer",
    description: "Reached level 50",
    category: "milestone",
    rarity: "legendary",
    icon: "Crown",
    color: "#F39C12",
    unlockCondition: "Reach level 50",
  },

  // Skill Badges
  {
    id: "badge_technical_expert",
    name: "Technical Expert",
    description: "Mastered technical interviews",
    category: "skill",
    rarity: "rare",
    icon: "Code",
    color: "#2ECC71",
    unlockCondition: "Complete 20 technical interviews with 85%+ average",
  },
  {
    id: "badge_system_designer",
    name: "System Designer",
    description: "Excelled in system design",
    category: "skill",
    rarity: "rare",
    icon: "Network",
    color: "#E74C3C",
    unlockCondition: "Complete 15 system design interviews with 85%+ average",
  },
  {
    id: "badge_bullet_master",
    name: "STAR Method Master",
    description: "Perfected behavioral interviews",
    category: "skill",
    rarity: "rare",
    icon: "MessageSquare",
    color: "#3498DB",
    unlockCondition: "Complete 20 behavioral interviews with 90%+ average",
  },

  // Streak Badges
  {
    id: "badge_week_streak",
    name: "Weekly Warrior",
    description: "7-day practice streak",
    category: "streak",
    rarity: "uncommon",
    icon: "Flame",
    color: "#E67E22",
    unlockCondition: "Practice for 7 consecutive days",
  },
  {
    id: "badge_month_streak",
    name: "Monthly Champion",
    description: "30-day practice streak",
    category: "streak",
    rarity: "epic",
    icon: "Flame",
    color: "#E74C3C",
    unlockCondition: "Practice for 30 consecutive days",
  },
  {
    id: "badge_year_streak",
    name: "Unstoppable Force",
    description: "365-day practice streak",
    category: "streak",
    rarity: "legendary",
    icon: "Flame",
    color: "#C0392B",
    unlockCondition: "Practice for 365 consecutive days",
    isHidden: true,
  },

  // Special Badges
  {
    id: "badge_perfectionist",
    name: "Perfectionist",
    description: "Achieved a perfect score",
    category: "special",
    rarity: "epic",
    icon: "Sparkles",
    color: "#F1C40F",
    unlockCondition: "Score 100% in any interview",
    relatedAchievementId: "perfect_score",
  },
  {
    id: "badge_early_adopter",
    name: "Early Adopter",
    description: "Joined during beta",
    category: "special",
    rarity: "rare",
    icon: "Rocket",
    color: "#9B59B6",
    unlockCondition: "Join during beta period",
    isHidden: false,
  },
  {
    id: "badge_bug_hunter",
    name: "Bug Hunter",
    description: "Reported a verified bug",
    category: "community",
    rarity: "uncommon",
    icon: "Bug",
    color: "#E74C3C",
    unlockCondition: "Report a bug that gets verified and fixed",
  },
  {
    id: "badge_feedback_champion",
    name: "Feedback Champion",
    description: "Provided valuable feedback",
    category: "community",
    rarity: "uncommon",
    icon: "MessageCircle",
    color: "#3498DB",
    unlockCondition: "Submit 10+ feedback reports",
  },

  // Seasonal Badges (examples)
  {
    id: "badge_winter_2024",
    name: "Winter Warrior 2024",
    description: "Practiced during winter season",
    category: "seasonal",
    rarity: "rare",
    icon: "Snowflake",
    color: "#5DADE2",
    unlockCondition: "Complete 10 interviews in December 2024",
    isHidden: false,
  },
];

// Helper functions
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGE_DEFINITIONS.filter((b) => b.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return BADGE_DEFINITIONS.filter((b) => b.rarity === rarity);
}

export function getVisibleBadges(unlockedBadgeIds: string[]): Badge[] {
  return BADGE_DEFINITIONS.filter(
    (b) => !b.isHidden || unlockedBadgeIds.includes(b.id),
  );
}

export function getBadgeForAchievement(
  achievementId: string,
): Badge | undefined {
  return BADGE_DEFINITIONS.find(
    (b) => b.relatedAchievementId === achievementId,
  );
}

/**
 * Check if a user has earned a specific badge
 */
export function hasBadge(userBadges: string[], badgeId: string): boolean {
  return userBadges.includes(badgeId);
}

/**
 * Get badge progress (for badges with trackable progress)
 */
export function getBadgeProgress(
  badge: Badge,
  userStats: {
    level?: number;
    totalSessions?: number;
    avgScore?: number;
    streak?: number;
  },
): number {
  // This is a simplified version - extend based on badge requirements
  switch (badge.id) {
    case "badge_level_10":
      return Math.min(((userStats.level || 1) / 10) * 100, 100);
    case "badge_level_25":
      return Math.min(((userStats.level || 1) / 25) * 100, 100);
    case "badge_level_50":
      return Math.min(((userStats.level || 1) / 50) * 100, 100);
    default:
      return 0;
  }
}

/**
 * Sort badges by rarity (legendary first)
 */
export function sortBadgesByRarity(badges: Badge[]): Badge[] {
  const rarityOrder: Record<BadgeRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  };

  return [...badges].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity],
  );
}
