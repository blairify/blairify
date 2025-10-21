"use client";

import { Activity, Target, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
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
            <AreaChart data={weeklyActivityData}>
              <defs>
                <linearGradient
                  id="sessionsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="oklch(74.6% 0.16 232.661)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(74.6% 0.16 232.661)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="oklch(74.6% 0.16 232.661)"
                strokeWidth={2}
                fill="url(#sessionsGradient)"
              />
            </AreaChart>
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
