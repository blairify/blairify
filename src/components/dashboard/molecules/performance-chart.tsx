"use client";

import { BarChart3, Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    overall: number;
    technical: number;
    communication: number;
    problemSolving: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const hasRealData = data.length > 0 && data[0].date !== "Start Here";

  return (
    <Card className="lg:col-span-2 border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Trend
        </CardTitle>
        <CardDescription>Your interview scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasRealData ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-[300px]">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Performance Data</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Complete interviews to see your performance trends and track your
              improvement over time.
            </p>
            <Link href="/configure">
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Start Interview
              </Button>
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
