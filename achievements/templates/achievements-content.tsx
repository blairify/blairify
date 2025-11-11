"use client";

import {
  Award,
  Clock,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RankBadge } from "@/components/ranks/rank-badge";
import { XPProgressBar } from "@/components/ranks/xp-progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievements } from "@/hooks/use-achievements";
import type { AchievementTier } from "@/lib/achievements";
import { DatabaseService } from "@/lib/database";
import { formatXP } from "@/lib/ranks";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";

interface AchievementsContentProps {
  user: UserData;
}

export function AchievementsContent({ user }: AchievementsContentProps) {
  const [stats, setStats] = useState({
    avgScore: 0,
    totalSessions: 0,
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const sessions = await DatabaseService.getUserSessions(user.uid, 100);
        console.log("📊 Loaded sessions:", sessions);

        if (!sessions.length) {
          console.warn("⚠️ No sessions found for user:", user.uid);
        }

        if (!sessions.length) return;

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

        const computedStats = {
          avgScore: Math.round(avgScore),
          totalSessions,
          totalTime,
        };

        console.log("📈 Computed stats:", computedStats);
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
    achievementsByTier,
    totalXP,
    level,
    xpProgress,
    stats: achievementStats,
    nextAchievement,
    rank,
    nextRank,
    progressToNextRank,
    xpToNextRank,
  } = achievementData;

  const icons: Record<string, React.ElementType> = {
    Trophy,
    Target,
    Star,
    Clock,
    Award,
    Crown,
    Zap,
    Flame,
    Sparkles,
  };

  console.log("🏅 Achievement Stats:", achievementStats);
  console.log("📊 XP:", totalXP, "Level:", level);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </main>
    );
  }

  // Tier colors and styles
  const tierStyles: Record<
    AchievementTier,
    { bg: string; border: string; text: string; badge: string }
  > = {
    bronze: {
      bg: "bg-amber-950/20",
      border: "border-amber-700/50",
      text: "text-amber-600",
      badge: "bg-amber-900/30 text-amber-500 border-amber-700/50",
    },
    silver: {
      bg: "bg-slate-900/20",
      border: "border-slate-500/50",
      text: "text-slate-400",
      badge: "bg-slate-800/30 text-slate-300 border-slate-600/50",
    },
    gold: {
      bg: "bg-yellow-950/20",
      border: "border-yellow-600/50",
      text: "text-yellow-500",
      badge: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
    },
    platinum: {
      bg: "bg-cyan-950/20",
      border: "border-cyan-500/50",
      text: "text-cyan-400",
      badge: "bg-cyan-900/30 text-cyan-300 border-cyan-600/50",
    },
    diamond: {
      bg: "bg-purple-950/20",
      border: "border-purple-500/50",
      text: "text-purple-400",
      badge: "bg-purple-900/30 text-purple-300 border-purple-600/50",
    },
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and unlock milestones as you improve your
            interview skills.
          </p>
        </div>

        {/* Rank Overview - Hero Section */}
        <Card
          className={cn(
            "border-2 overflow-hidden relative",
            rank.badge.border,
            rank.badge.bg,
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Rank Display */}
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Current Rank
                </h3>
                <RankBadge rank={rank} size="xl" showGlow showLabel animated />
                <div className="space-y-1">
                  <p className={cn("text-2xl font-bold", rank.badge.text)}>
                    {rank.name} {rank.level}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatXP(totalXP)} Total XP
                  </p>
                </div>
              </div>

              {/* Progress to Next Rank */}
              <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Rank Progression
                  </h3>
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

                {/* Perks */}
                {rank.perks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Current Perks:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rank.perks.map((perk, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn(
                            rank.badge.bg,
                            rank.badge.text,
                            rank.badge.border,
                            "border",
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
                        <p className="text-sm text-muted-foreground">
                          Next Rank:
                        </p>
                        <p className={cn("font-semibold", nextRank.badge.text)}>
                          {nextRank.name} {nextRank.level}
                        </p>
                      </div>
                      <RankBadge rank={nextRank} size="md" showGlow={false} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total XP
                </span>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-4xl font-bold text-foreground">
                {formatXP(totalXP)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                From {achievementStats.unlockedCount} achievements
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold text-foreground">
                {achievementStats.completionPercentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {achievementStats.unlockedCount} /{" "}
                {achievementStats.totalAchievements} unlocked
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Level
                </span>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold text-foreground">{level}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {xpProgress} / 100 XP to next level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Achievement Recommendation */}
        {nextAchievement && (
          <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Next Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {(() => {
                  const Icon = icons[nextAchievement.icon];
                  const progress = nextAchievement.progressCalculator
                    ? nextAchievement.progressCalculator(stats)
                    : 0;
                  return (
                    <>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {nextAchievement.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={tierStyles[nextAchievement.tier].badge}
                          >
                            {nextAchievement.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {nextAchievement.description}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reward:{" "}
                          <span className="text-primary font-medium">
                            +{nextAchievement.xpReward} XP
                          </span>
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements by Tier */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bronze">Bronze</TabsTrigger>
            <TabsTrigger value="silver">Silver</TabsTrigger>
            <TabsTrigger value="gold">Gold</TabsTrigger>
            <TabsTrigger value="platinum">Platinum</TabsTrigger>
            <TabsTrigger value="diamond">Diamond</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsWithProgress.map((item) => (
                <AchievementCard
                  key={item.achievement.id}
                  item={item}
                  icons={icons}
                  tierStyles={tierStyles}
                />
              ))}
            </div>
          </TabsContent>

          {(
            [
              "bronze",
              "silver",
              "gold",
              "platinum",
              "diamond",
            ] as AchievementTier[]
          ).map((tier) => (
            <TabsContent key={tier} value={tier} className="mt-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {achievementStats.byTier[tier].unlocked} /{" "}
                  {achievementStats.byTier[tier].total} unlocked
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsByTier[tier].map((item) => (
                  <AchievementCard
                    key={item.achievement.id}
                    item={item}
                    icons={icons}
                    tierStyles={tierStyles}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}

// Achievement Card Component
function AchievementCard({
  item,
  icons,
  tierStyles,
}: {
  item: {
    achievement: any;
    isUnlocked: boolean;
    progress: number;
    xpEarned: number;
  };
  icons: Record<string, React.ElementType>;
  tierStyles: Record<
    AchievementTier,
    { bg: string; border: string; text: string; badge: string }
  >;
}) {
  const { achievement, isUnlocked, progress } = item;
  const Icon = icons[achievement.icon] || Trophy;
  const tierStyle = tierStyles[achievement.tier as AchievementTier];

  return (
    <Card
      className={cn(
        "transition-all duration-300 border-2 group hover:shadow-lg",
        isUnlocked
          ? `${tierStyle.border} ${tierStyle.bg} hover:scale-[1.02]`
          : "border-border/50 bg-card/40 opacity-70 hover:opacity-85",
      )}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "p-2.5 rounded-lg transition-transform group-hover:scale-110",
              isUnlocked
                ? `${tierStyle.bg} ${tierStyle.text}`
                : "bg-muted/30 text-muted-foreground",
            )}
          >
            {isUnlocked ? (
              <Icon className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-base truncate",
                isUnlocked ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {achievement.name}
            </h3>
            <Badge
              variant="outline"
              className={cn("text-xs mt-1", tierStyle.badge)}
            >
              {achievement.tier}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress Bar for Locked Achievements */}
        {!isUnlocked && progress > 0 && (
          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Requirement Display */}
        {achievement.requirement && (
          <p className="text-xs text-muted-foreground mb-3">
            Requirement: {achievement.requirement} {achievement.requirementUnit}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          {isUnlocked ? (
            <Badge
              variant="default"
              className="bg-primary/20 text-primary border-primary/30"
            >
              ✓ Unlocked
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted/50">
              Locked
            </Badge>
          )}
          <span className="text-xs font-medium text-muted-foreground">
            +{achievement.xpReward} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
