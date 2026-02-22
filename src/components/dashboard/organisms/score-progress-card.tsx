"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PerformanceDataPoint } from "@/lib/services/dashboard/dashboard-analytics";

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface ScoreProgressCardProps {
  className?: string;
  performanceData: PerformanceDataPoint[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function ScoreProgressCard({
  className,
  performanceData,
  timeRange,
  onTimeRangeChange,
}: ScoreProgressCardProps) {
  const filteredData = useMemo(() => {
    if (timeRange === "all") return performanceData;

    const now = new Date();
    const daysToSubtract =
      timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return performanceData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [performanceData, timeRange]);

  const hasData = performanceData.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="gap-1 flex flex-col">
            <Typography.BodyBold>Score Progression</Typography.BodyBold>
            <Typography.Caption color="secondary">
              Your interview performance over time
            </Typography.Caption>
          </CardTitle>
        </div>
        <TrendingUp className="size-5" />

        {hasData && (
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto  focus:ring-primary focus:ring-offset-0"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All time
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => [`${value}%`, "Score"]}
                  />
                }
              />
              <Area
                dataKey="score"
                type="natural"
                fill="url(#fillScore)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-[250px]">
            <Typography.Body className="text-muted-foreground mb-4">
              Complete interviews to see your progress
            </Typography.Body>
            <Link href="/configure">
              <Button variant="default" size="sm">
                Start Interview
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
