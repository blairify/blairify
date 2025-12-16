import { Award, BarChart3, Clock, Target } from "lucide-react";
import { StatCard } from "../atoms/stat-card";

interface StatsGridProps {
  stats: {
    totalSessions: number;
    averageScore: number;
    improvementRate: number;
    totalTime: number;
    streakDays: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      <StatCard
        title="Total Sessions"
        value={stats.totalSessions}
        icon={BarChart3}
        trend={{ value: "+3 this week", isPositive: true }}
      />

      <StatCard
        title="Average Score"
        value={`${stats.averageScore}%`}
        icon={Target}
        trend={{
          value: `+${stats.improvementRate}% improvement`,
          isPositive: true,
        }}
      />

      <StatCard
        title="Practice Time"
        value={`${Math.floor(stats.totalTime / 60)}h`}
        subtitle={`${stats.totalTime % 60}m total`}
        icon={Clock}
      />

      <StatCard
        title="Current Streak"
        value={stats.streakDays}
        subtitle="days"
        icon={Award}
      />
    </div>
  );
}
