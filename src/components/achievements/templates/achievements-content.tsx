"use client";

import { Clock, Star, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAchievements } from "@/hooks/use-achievements";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";

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

  const { unlocked } = useAchievements(stats);
  const icons = { Trophy, Target, Star, Clock };

  console.log(
    "🏅 Unlocked achievements:",
    unlocked.map((a) => a.id),
  );

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

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Trophy className="h-7 w-7 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Track your progress and unlock milestones as you improve your
            interview skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((ach) => {
            const Icon = icons[ach.icon as keyof typeof icons];
            const achieved = unlocked.some((a) => a.id === ach.id);

            return (
              <Card
                key={ach.id}
                className={`transition-all border-2 ${
                  achieved
                    ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                    : "border-border/50 bg-card/40 opacity-70"
                }`}
              >
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-2 rounded-lg ${
                          achieved
                            ? "bg-primary/20 text-primary"
                            : "bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3
                        className={`font-semibold text-lg ${
                          achieved ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {ach.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    {achieved ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Locked</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
