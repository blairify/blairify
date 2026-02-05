/**
 * Player Rank System
 * Defines rank tiers, XP thresholds, visual styles, and progression logic
 */

export type RankTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface Rank {
  tier: RankTier;
  name: string;
  minXP: number;
  maxXP: number;
  level: 1 | 2 | 3;
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
    tier: "bronze",
    name: "Bronze",
    minXP: 1000,
    maxXP: 2499,
    level: 2,
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
    tier: "bronze",
    name: "Bronze",
    minXP: 2500,
    maxXP: 4999,
    level: 3,
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
    minXP: 5000,
    maxXP: 7499,
    level: 1,
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
    tier: "silver",
    name: "Silver",
    minXP: 7500,
    maxXP: 9999,
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
    tier: "silver",
    name: "Silver",
    minXP: 10000,
    maxXP: 14999,
    level: 3,
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
    minXP: 15000,
    maxXP: 24999,
    level: 1,
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
    tier: "gold",
    name: "Gold",
    minXP: 25000,
    maxXP: 39999,
    level: 2,
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
    tier: "gold",
    name: "Gold",
    minXP: 40000,
    maxXP: 59999,
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
    minXP: 60000,
    maxXP: 84999,
    level: 1,
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
    tier: "platinum",
    name: "Platinum",
    minXP: 85000,
    maxXP: 119999,
    level: 2,
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
    tier: "platinum",
    name: "Platinum",
    minXP: 120000,
    maxXP: 169999,
    level: 3,
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
    minXP: 170000,
    maxXP: 249999,
    level: 1,
    color: {
      primary: "#B9F2FF",
      secondary: "#7DF9FF",
      gradient: "from-cyan-300 via-cyan-200 to-cyan-400",
    },
    icon: "Gem",
    badge: {
      border: "border-cyan-300",
      bg: "bg-gradient-to-br from-cyan-300/20 to-cyan-500/20",
      text: "text-cyan-300",
      glow: "shadow-cyan-300/50",
    },
    perks: ["Diamond frame", "Animated badge", "Elite status"],
    cosmetics: {
      avatarFrame: "diamond-frame",
      profileTheme: "diamond-theme",
      titleColor: "text-cyan-300",
    },
  },
  {
    tier: "diamond",
    name: "Diamond",
    minXP: 250000,
    maxXP: 349999,
    level: 2,
    color: {
      primary: "#B9F2FF",
      secondary: "#7DF9FF",
      gradient: "from-cyan-300 via-cyan-200 to-cyan-400",
    },
    icon: "Gem",
    badge: {
      border: "border-cyan-300",
      bg: "bg-gradient-to-br from-cyan-300/20 to-cyan-500/20",
      text: "text-cyan-300",
      glow: "shadow-cyan-300/50",
    },
    perks: ["Diamond frame", "Animated badge", "Elite status"],
    cosmetics: {
      avatarFrame: "diamond-frame",
      profileTheme: "diamond-theme",
      titleColor: "text-cyan-300",
    },
  },
  {
    tier: "diamond",
    name: "Diamond",
    minXP: 350000,
    maxXP: Number.POSITIVE_INFINITY,
    level: 3,
    color: {
      primary: "#B9F2FF",
      secondary: "#7DF9FF",
      gradient: "from-cyan-300 via-cyan-200 to-cyan-400",
    },
    icon: "Gem",
    badge: {
      border: "border-cyan-300",
      bg: "bg-gradient-to-br from-cyan-300/20 to-cyan-500/20",
      text: "text-cyan-300",
      glow: "shadow-cyan-300/50",
    },
    perks: ["Diamond frame", "Animated badge", "Elite status"],
    cosmetics: {
      avatarFrame: "diamond-frame",
      profileTheme: "diamond-theme",
      titleColor: "text-cyan-300",
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
  return RANKS[0];
}

/**
 * Get next rank
 */
export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANKS.findIndex(
    (r) => r.tier === currentRank.tier && r.level === currentRank.level,
  );
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

  const oldKey = `${oldRank.tier}_${oldRank.level}`;
  const newKey = `${newRank.tier}_${newRank.level}`;

  return {
    rankedUp: oldKey !== newKey,
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
export function formatRankLevel(level: Rank["level"]): "I" | "II" | "III" {
  switch (level) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    default: {
      const _never: never = level;
      throw new Error(`Unhandled rank level: ${_never}`);
    }
  }
}

export function getRankDisplayName(rank: Rank): string {
  return `${rank.name} ${formatRankLevel(rank.level)}`;
}
