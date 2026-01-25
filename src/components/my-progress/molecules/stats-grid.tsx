import { Activity, Award, BarChart3, Flame, Timer } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/services/dashboard/dashboard-analytics";
import { formatTime } from "../utils/formatters";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="p-0">
            <Typography.SubCaptionMedium className="text-muted-foreground">
              Total Interviews
            </Typography.SubCaptionMedium>
          </CardTitle>
          <BarChart3 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">
            {stats.totalSessions}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="p-0">
            <Typography.SubCaptionMedium className="text-muted-foreground">
              Total Practice Time
            </Typography.SubCaptionMedium>
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">
            {formatTime(stats.totalTime)}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="p-0">
            <Typography.SubCaptionMedium className="text-muted-foreground">
              Average Score
            </Typography.SubCaptionMedium>
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">
            {stats.averageScore}%
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="p-0">
            <Typography.SubCaptionMedium className="text-muted-foreground">
              Current Streak
            </Typography.SubCaptionMedium>
          </CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">
            {stats.streakDays} days
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="p-0">
            <Typography.SubCaptionMedium className="text-muted-foreground">
              Experience Points
            </Typography.SubCaptionMedium>
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">
            {stats.totalXP}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
