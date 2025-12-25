"use client";

import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WeeklyActivity } from "@/lib/services/dashboard/dashboard-analytics";

interface WeeklyActivityCardProps {
  weeklyActivity: WeeklyActivity[];
}

export function WeeklyActivityCard({
  weeklyActivity,
}: WeeklyActivityCardProps) {
  const maxSessions = Math.max(...weeklyActivity.map((day) => day.sessions), 1);

  if (weeklyActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="p-0">
            <Typography.BodyBold>Weekly Activity</Typography.BodyBold>
          </CardTitle>
          <CardDescription className="p-0">
            <Typography.Caption className="text-muted-foreground">
              Your practice sessions over the last 7 days
            </Typography.Caption>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <Typography.Caption className="text-muted-foreground text-center block">
            No activity recorded this week
          </Typography.Caption>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="p-0">
          <Typography.BodyBold>Weekly Activity</Typography.BodyBold>
        </CardTitle>
        <CardDescription className="p-0">
          <Typography.Caption className="text-muted-foreground">
            Your practice sessions over the last 7 days
          </Typography.Caption>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyActivity.map((day) => (
            <div key={day.day} className="space-y-2">
              <div className="flex items-center justify-between">
                <Typography.SubCaptionMedium>
                  {day.day}
                </Typography.SubCaptionMedium>
                <div className="flex items-center gap-2">
                  <Typography.Caption className="text-muted-foreground">
                    {day.sessions} sessions
                  </Typography.Caption>
                  {day.avgScore > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {day.avgScore}%
                    </Badge>
                  )}
                </div>
              </div>
              <Progress
                value={(day.sessions / maxSessions) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
