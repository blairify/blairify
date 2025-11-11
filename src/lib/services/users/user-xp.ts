import {
  ACHIEVEMENTS,
  calculateTotalXP,
  type UserStats,
} from "@/lib/achievements";
import { getBadgeForAchievement } from "@/lib/badges";
import { getUserProfile, updateUserProfile } from "./database-users";

export interface XPResult {
  level: number;
  title: string;
  totalXP: number;
  xpGained: number;
  newAchievements: string[];
  leveledUp: boolean;
}

/**
 * Calculate XP gained from a session based on score and duration
 */
function calculateSessionXP(score: number, duration: number): number {
  // Base XP: 10 points per session
  let xp = 10;

  // Score bonus: up to 100 XP based on score (0-100)
  xp += Math.round(score);

  // Duration bonus: 1 XP per minute (capped at 30 minutes)
  xp += Math.min(duration, 30);

  return xp;
}

/**
 * Get user title based on level
 */
function getUserTitle(level: number): string {
  if (level >= 50) return "Interview Legend";
  if (level >= 40) return "Master Interviewer";
  if (level >= 30) return "Expert Communicator";
  if (level >= 20) return "Senior Developer";
  if (level >= 10) return "Intermediate Developer";
  if (level >= 5) return "Junior Developer";
  if (level >= 2) return "Aspiring Developer";
  return "Beginner";
}

/**
 * Add XP to user after completing a session
 * This function:
 * 1. Calculates XP gained from the session
 * 2. Checks for newly unlocked achievements
 * 3. Awards XP from achievements
 * 4. Updates user level and title
 * 5. Returns detailed results including new achievements
 */
export async function addUserXP(
  userId: string,
  score: number,
  duration: number,
): Promise<XPResult> {
  const user = await getUserProfile(userId);
  if (!user) throw new Error("User not found");

  // Calculate session XP
  const sessionXP = calculateSessionXP(score, duration);

  // Get current stats
  const totalInterviews = (user.totalInterviews || 0) + 1;
  const currentAvgScore = user.averageScore || 0;
  const newAvgScore =
    (currentAvgScore * (totalInterviews - 1) + score) / totalInterviews;

  // Build user stats for achievement checking
  const stats: UserStats = {
    avgScore: newAvgScore,
    totalSessions: totalInterviews,
    totalTime: duration, // This should ideally be cumulative, but we'll use current session for now
    perfectScores:
      score === 100
        ? (user.experiencePoints || 0) + 1
        : user.experiencePoints || 0,
  };

  // Check for newly unlocked achievements
  const currentBadges = user.badgesUnlocked || [];
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (ach) => ach.condition(stats) && !currentBadges.includes(ach.id),
  );

  // Get corresponding badges for newly unlocked achievements
  const newBadgeIds = newlyUnlocked
    .map((ach) => getBadgeForAchievement(ach.id))
    .filter((badge) => badge !== undefined)
    .map((badge) => badge!.id);

  // Calculate XP from newly unlocked achievements
  const achievementXP = newlyUnlocked.reduce(
    (sum, ach) => sum + ach.xpReward,
    0,
  );

  // Calculate total XP
  const previousXP = user.experiencePoints || 0;
  const totalXPGained = sessionXP + achievementXP;
  const newTotalXP = previousXP + totalXPGained;

  // Calculate level (100 XP per level)
  const previousLevel = Math.floor(previousXP / 100) + 1;
  const newLevel = Math.floor(newTotalXP / 100) + 1;
  const leveledUp = newLevel > previousLevel;

  // Get title based on level
  const title = getUserTitle(newLevel);

  // Check for level-based badges
  const levelBadges: string[] = [];
  if (newLevel >= 10 && !currentBadges.includes("badge_level_10")) {
    levelBadges.push("badge_level_10");
  }
  if (newLevel >= 25 && !currentBadges.includes("badge_level_25")) {
    levelBadges.push("badge_level_25");
  }
  if (newLevel >= 50 && !currentBadges.includes("badge_level_50")) {
    levelBadges.push("badge_level_50");
  }

  // Combine all new badges (achievement badges + level badges)
  const allNewBadges = [...newBadgeIds, ...levelBadges];

  // Update user profile
  await updateUserProfile(userId, {
    experiencePoints: newTotalXP,
    level: newLevel,
    title,
    totalInterviews,
    averageScore: Math.round(newAvgScore),
    badgesUnlocked: [
      ...currentBadges,
      ...newlyUnlocked.map((a) => a.id),
      ...allNewBadges,
    ],
  });

  return {
    level: newLevel,
    title,
    totalXP: newTotalXP,
    xpGained: totalXPGained,
    newAchievements: newlyUnlocked.map((a) => a.id),
    leveledUp,
  };
}

/**
 * Get user's current XP stats without modifying anything
 */
export async function getUserXPStats(userId: string) {
  const user = await getUserProfile(userId);
  if (!user) throw new Error("User not found");

  const totalXP = user.experiencePoints || 0;
  const level = Math.floor(totalXP / 100) + 1;
  const xpProgress = totalXP % 100;
  const xpForNextLevel = level * 100;
  const title = getUserTitle(level);

  // Calculate achievement XP
  const achievementXP = calculateTotalXP(user.badgesUnlocked || []);

  return {
    totalXP,
    level,
    xpProgress,
    xpForNextLevel,
    title,
    achievementXP,
    totalInterviews: user.totalInterviews || 0,
    averageScore: user.averageScore || 0,
    badgesUnlocked: user.badgesUnlocked || [],
  };
}
