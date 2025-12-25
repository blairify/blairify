/**
 * Player Rank System
 * Defines rank tiers, XP thresholds, visual styles, and progression logic
 */

export type RankTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster"
  | "legend";

export interface Rank {
  tier: RankTier;
  name: string;
  minXP: number;
  maxXP: number;
  level: number;
  color: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  icon: string;
  badge: {
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
  perks: string[];
  cosmetics?: {
    avatarFrame?: string;
    profileTheme?: string;
    titleColor?: string;
  };
}

// Rank definitions with XP thresholds
export const RANKS: Rank[] = [
  {
    tier: "bronze",
    name: "Bronze",
    minXP: 0,
    maxXP: 999,
    level: 1,
    color: {
      primary: "#CD7F32",
      secondary: "#8B4513",
      gradient: "from-amber-700 via-amber-600 to-amber-800",
    },
    icon: "GiTurtleShell",
    badge: {
      border: "border-amber-600",
      bg: "bg-gradient-to-br from-amber-700/20 to-amber-900/20",
      text: "text-amber-600",
      glow: "shadow-amber-500/50",
    },
    perks: ["Basic profile", "Achievement tracking"],
  },
  {
    tier: "silver",
    name: "Silver",
    minXP: 1000,
    maxXP: 2499,
    level: 2,
    color: {
      primary: "#C0C0C0",
      secondary: "#A8A8A8",
      gradient: "from-slate-400 via-slate-300 to-slate-500",
    },
    icon: "GiTurtleShell",
    badge: {
      border: "border-slate-400",
      bg: "bg-gradient-to-br from-slate-400/20 to-slate-600/20",
      text: "text-slate-400",
      glow: "shadow-slate-400/50",
    },
    perks: ["Custom avatar frame", "Profile badge"],
    cosmetics: {
      avatarFrame: "silver-frame",
    },
  },
  {
    tier: "gold",
    name: "Gold",
    minXP: 2500,
    maxXP: 4999,
    level: 3,
    color: {
      primary: "#FFD700",
      secondary: "#FFA500",
      gradient: "from-yellow-500 via-yellow-400 to-yellow-600",
    },
    icon: "GiFlowerTwirl",
    badge: {
      border: "border-yellow-500",
      bg: "bg-gradient-to-br from-yellow-500/20 to-yellow-700/20",
      text: "text-yellow-500",
      glow: "shadow-yellow-500/50",
    },
    perks: ["Gold avatar frame", "Priority support", "Exclusive badge"],
    cosmetics: {
      avatarFrame: "gold-frame",
      titleColor: "text-yellow-500",
    },
  },
  {
    tier: "platinum",
    name: "Platinum",
    minXP: 5000,
    maxXP: 9999,
    level: 4,
    color: {
      primary: "#00CED1",
      secondary: "#00B4D8",
      gradient: "from-cyan-500 via-cyan-400 to-cyan-600",
    },
    icon: "Crown",
    badge: {
      border: "border-cyan-400",
      bg: "bg-gradient-to-br from-cyan-400/20 to-cyan-600/20",
      text: "text-cyan-400",
      glow: "shadow-cyan-400/50",
    },
    perks: ["Platinum frame", "Custom profile theme", "VIP badge"],
    cosmetics: {
      avatarFrame: "platinum-frame",
      profileTheme: "platinum-theme",
      titleColor: "text-cyan-400",
    },
  },
  {
    tier: "diamond",
    name: "Diamond",
    minXP: 10000,
    maxXP: 19999,
    level: 5,
    color: {
      primary: "#B9F2FF",
      secondary: "#7DF9FF",
      gradient: "from-blue-400 via-cyan-300 to-blue-500",
    },
    icon: "Gem",
    badge: {
      border: "border-blue-400",
      bg: "bg-gradient-to-br from-blue-400/20 to-blue-600/20",
      text: "text-blue-400",
      glow: "shadow-blue-400/50",
    },
    perks: ["Diamond frame", "Animated badge", "Elite status"],
    cosmetics: {
      avatarFrame: "diamond-frame",
      profileTheme: "diamond-theme",
      titleColor: "text-blue-400",
    },
  },
  {
    tier: "master",
    name: "Master",
    minXP: 20000,
    maxXP: 39999,
    level: 6,
    color: {
      primary: "#9B59B6",
      secondary: "#8E44AD",
      gradient: "from-purple-600 via-purple-500 to-purple-700",
    },
    icon: "Star",
    badge: {
      border: "border-purple-500",
      bg: "bg-gradient-to-br from-purple-500/20 to-purple-700/20",
      text: "text-purple-500",
      glow: "shadow-purple-500/50",
    },
    perks: ["Master frame", "Particle effects", "Legendary badge"],
    cosmetics: {
      avatarFrame: "master-frame",
      profileTheme: "master-theme",
      titleColor: "text-purple-500",
    },
  },
  {
    tier: "grandmaster",
    name: "Grandmaster",
    minXP: 40000,
    maxXP: 79999,
    level: 7,
    color: {
      primary: "#E74C3C",
      secondary: "#C0392B",
      gradient: "from-red-600 via-red-500 to-red-700",
    },
    icon: "Flame",
    badge: {
      border: "border-red-500",
      bg: "bg-gradient-to-br from-red-500/20 to-red-700/20",
      text: "text-red-500",
      glow: "shadow-red-500/50",
    },
    perks: ["Grandmaster frame", "Exclusive effects", "Hall of Fame"],
    cosmetics: {
      avatarFrame: "grandmaster-frame",
      profileTheme: "grandmaster-theme",
      titleColor: "text-red-500",
    },
  },
  {
    tier: "legend",
    name: "Legend",
    minXP: 80000,
    maxXP: Number.POSITIVE_INFINITY,
    level: 8,
    color: {
      primary: "#FF6B9D",
      secondary: "#C44569",
      gradient: "from-pink-600 via-rose-500 to-red-600",
    },
    icon: "Trophy",
    badge: {
      border: "border-pink-500",
      bg: "bg-gradient-to-br from-pink-500/20 to-rose-700/20",
      text: "text-pink-500",
      glow: "shadow-pink-500/50",
    },
    perks: ["Legendary frame", "Ultimate prestige", "Immortalized"],
    cosmetics: {
      avatarFrame: "legend-frame",
      profileTheme: "legend-theme",
      titleColor: "text-pink-500",
    },
  },
];

/**
 * Get rank based on XP
 */
export function getRankByXP(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // Default to Bronze
}

/**
 * Get next rank
 */
export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANKS.findIndex((r) => r.tier === currentRank.tier);
  if (currentIndex === -1 || currentIndex === RANKS.length - 1) {
    return null; // Already at max rank
  }
  return RANKS[currentIndex + 1];
}

/**
 * Calculate progress to next rank (0-100)
 */
export function getProgressToNextRank(xp: number, currentRank: Rank): number {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) {
    return 100; // Max rank reached
  }

  const xpInCurrentRank = xp - currentRank.minXP;
  const xpNeededForNextRank = nextRank.minXP - currentRank.minXP;

  return Math.min(
    Math.round((xpInCurrentRank / xpNeededForNextRank) * 100),
    100,
  );
}

/**
 * Get XP needed for next rank
 */
export function getXPToNextRank(xp: number, currentRank: Rank): number {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) {
    return 0; // Max rank reached
  }
  return Math.max(nextRank.minXP - xp, 0);
}

/**
 * Check if user ranked up
 */
export function checkRankUp(
  oldXP: number,
  newXP: number,
): {
  rankedUp: boolean;
  oldRank: Rank;
  newRank: Rank;
} {
  const oldRank = getRankByXP(oldXP);
  const newRank = getRankByXP(newXP);

  return {
    rankedUp: oldRank.tier !== newRank.tier,
    oldRank,
    newRank,
  };
}

/**
 * Get rank by tier name
 */
export function getRankByTier(tier: RankTier): Rank | undefined {
  return RANKS.find((r) => r.tier === tier);
}

/**
 * Get all ranks
 */
export function getAllRanks(): Rank[] {
  return RANKS;
}

/**
 * Format XP with commas
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get rank display name with level
 */
export function getRankDisplayName(rank: Rank): string {
  return `${rank.name} ${rank.level}`;
}
