"use client";

import { Activity, Target, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityTabProps {
  weeklyActivityData: Array<{
    day: string;
    sessions: number;
    avgScore: number;
  }>;
}

export function ActivityTab({ weeklyActivityData }: ActivityTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Weekly Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Weekly Activity
          </CardTitle>
          <CardDescription>
            Your practice sessions throughout the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="sessions"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Activity Insights</CardTitle>
          <CardDescription>Patterns and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Practice Patterns</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Most active day</span>
                <Badge variant="secondary">Wednesday</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Best performance day</span>
                <Badge variant="secondary">Friday</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Average session length</span>
                <Badge variant="secondary">35 min</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Recommendations</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm">
                  <Zap className="h-4 w-4 inline mr-1 text-primary" />
                  Try practicing on Tuesday to maintain consistency
                </p>
              </div>
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm">
                  <Target className="h-4 w-4 inline mr-1 text-primary" />
                  Your Friday sessions show best results - consider longer
                  sessions that day
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
