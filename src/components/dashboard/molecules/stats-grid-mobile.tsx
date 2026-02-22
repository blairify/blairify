import { Activity, Award, BarChart3, Flame, Timer } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import type { DashboardStats } from "@/lib/services/dashboard/dashboard-analytics";
import { formatTime } from "../utils/formatters";

interface StatsGridMobileProps {
  stats: DashboardStats;
}

export function StatsGridMobile({ stats }: StatsGridMobileProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:hidden">
      {/* Total Interviews */}
      <div className="flex flex-col items-center min-w-[60px] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <Typography.Heading3 className="text-sm font-bold text-primary text-center">
          {stats.totalSessions}
        </Typography.Heading3>
        <Typography.Caption className="text-muted-foreground text-center">
          Interviews
        </Typography.Caption>
      </div>

      {/* Practice Time */}
      <div className="flex flex-col items-center min-w-[60px] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-1">
          <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <Typography.Heading3 className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center">
          {formatTime(stats.totalTime)}
        </Typography.Heading3>
        <Typography.Caption className="text-muted-foreground text-center">
          Time
        </Typography.Caption>
      </div>

      {/* Average Score */}
      <div className="flex flex-col items-center min-w-[60px] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-1">
          <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <Typography.Heading3 className="text-sm font-bold text-green-600 dark:text-green-400 text-center">
          {stats.averageScore}%
        </Typography.Heading3>
        <Typography.Caption className="text-muted-foreground text-center">
          Score
        </Typography.Caption>
      </div>

      {/* Current Streak */}
      <div className="flex flex-col items-center min-w-[60px] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-1">
          <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <Typography.Heading3 className="text-sm font-bold text-orange-600 dark:text-orange-400 text-center">
          {stats.streakDays}
        </Typography.Heading3>
        <Typography.Caption className="text-muted-foreground text-center">
          Streak
        </Typography.Caption>
      </div>

      {/* Experience Points */}
      <div className="flex flex-col items-center min-w-[60px] flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-1">
          <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <Typography.Heading3 className="text-sm font-bold text-purple-600 dark:text-purple-400 text-center">
          {stats.totalXP}
        </Typography.Heading3>
        <Typography.Caption className="text-muted-foreground text-center">
          XP
        </Typography.Caption>
      </div>
    </div>
  );
}
