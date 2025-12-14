"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DashboardStats,
  PerformanceDataPoint,
  QuestionTypeStats,
  RecentSession,
  SkillPerformance,
  WeeklyActivity,
} from "@/lib/services/dashboard/dashboard-analytics";

interface DashboardContentProps {
  dashboardData: {
    stats: DashboardStats;
    performanceData: PerformanceDataPoint[];
    skillsData: SkillPerformance[];
    questionTypesData: QuestionTypeStats[];
    weeklyActivityData: WeeklyActivity[];
    recentSessions: RecentSession[];
  };
}

export function DashboardContent({ dashboardData }: DashboardContentProps) {
  const {
    stats,
    performanceData,
    skillsData: _skillsData,
    questionTypesData: _questionTypesData,
    weeklyActivityData,
    recentSessions,
  } = dashboardData;

  const hasData = stats.totalSessions > 0;
  const [timeRange, setTimeRange] = useState("all");
  const [showTeamAlert, setShowTeamAlert] = useState(true);

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const filteredPerformanceData = performanceData.filter((item) => {
    if (timeRange === "all") return true;

    const date = new Date(item.date);
    const now = new Date();
    let daysToSubtract = 90;

    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const formatTime = (minutes: number) => {
    if (
      !minutes ||
      typeof minutes !== "number" ||
      !Number.isFinite(minutes) ||
      minutes < 0
    ) {
      return "0m";
    }
    const validMinutes = Math.min(Math.floor(minutes), 60000);
    const hours = Math.floor(validMinutes / 60);
    const mins = validMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  const formatKebabCase = (str: string) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTitleCase = (value: string) => {
    if (!value) return "";
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (!hasData) {
    return (
      <div className="space-y-6 max-w-xl mx-auto md:max-w-none md:mx-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Target,
              label: "Total Interviews",
              value: "0",
              subtext: "Get started today",
            },
            {
              icon: Award,
              label: "Average Score",
              value: "-",
              subtext: "Complete an interview",
            },
            {
              icon: Clock,
              label: "Practice Time",
              value: "0m",
              subtext: "Start practicing",
            },
            {
              icon: Flame,
              label: "Current Streak",
              value: "0 days",
              subtext: "Build momentum",
            },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <Typography.Heading3 className="text-xl font-semibold mb-2">
              No Interview Data Yet
            </Typography.Heading3>
            <Typography.Body className="text-muted-foreground text-center max-w-md mb-6">
              Start your first interview to see your performance metrics,
              progress insights, and personalized recommendations.
            </Typography.Body>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/configure">Start Your First Interview</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/jobs">Browse Jobs</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto md:max-w-none md:mx-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interviews
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <div className="flex items-center text-xs mt-1">
              {stats.improvementRate > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-600" />
                  <span className="text-emerald-600">
                    +{stats.improvementRate}% from last period
                  </span>
                </>
              ) : stats.improvementRate < 0 ? (
                <>
                  <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">
                    {stats.improvementRate}% from last period
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  No change from last period
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Practice Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays} days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Experience Points
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Earned from all activities
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Score Progression</CardTitle>
              <CardDescription>
                Your interview performance over time
              </CardDescription>
            </div>
            {performanceData.length > 0 && (
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto border-primary/40 text-primary focus:ring-primary focus:ring-offset-0"
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
            {performanceData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredPerformanceData}>
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
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <Typography.Body className="text-sm text-muted-foreground">
                  Complete interviews to see your progress
                </Typography.Body>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Your practice sessions over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyActivityData.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {day.sessions} sessions
                      </span>
                      {day.avgScore > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {day.avgScore}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={
                      (day.sessions /
                        Math.max(
                          ...weeklyActivityData.map((d) => d.sessions),
                          1,
                        )) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interview Sessions</CardTitle>
          <CardDescription>
            Your latest interview performances and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography.BodyBold className="font-semibold">
                        {formatTitleCase(session.position)}
                      </Typography.BodyBold>
                      <Badge variant="secondary">
                        {formatKebabCase(session.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <Typography.Caption className="text-muted-foreground">
                          {session.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography.Caption>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <Typography.Caption className="text-muted-foreground">
                          {session.duration} minutes
                        </Typography.Caption>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography.BodyBold
                      className={`text-2xl ${getScoreColor(session.score)}`}
                    >
                      {session.score}%
                    </Typography.BodyBold>
                    {index > 0 && recentSessions[index - 1].score > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs mt-1">
                        {session.score > recentSessions[index - 1].score ? (
                          <>
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            <Typography.CaptionMedium className="text-emerald-600 font-medium">
                              +
                              {Math.abs(
                                session.score - recentSessions[index - 1].score,
                              )}
                            </Typography.CaptionMedium>
                          </>
                        ) : session.score < recentSessions[index - 1].score ? (
                          <>
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                            <Typography.CaptionMedium className="text-red-600 font-medium">
                              -
                              {Math.abs(
                                session.score - recentSessions[index - 1].score,
                              )}
                            </Typography.CaptionMedium>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography.Body className="text-sm text-muted-foreground text-center py-8">
              No recent sessions to display
            </Typography.Body>
          )}
        </CardContent>
      </Card>
      {showTeamAlert && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Typography.Heading3 className="font-semibold text-primary mb-1">
                  Join the Blairify Team
                </Typography.Heading3>
                <Typography.Body className="text-sm text-muted-foreground mb-3">
                  We're a growing team of passionate developers building the
                  future of interview preparation. We respond super fast to all
                  inquiries!
                </Typography.Body>
                <div className="mb-3">
                  <p className="text-sm font-medium text-primary mb-2">
                    We're looking for:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20"
                    >
                      Quality Engineers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20"
                    >
                      DevOps Engineers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20"
                    >
                      Fullstack Developers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20"
                    >
                      Marketing
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20"
                    >
                      Business & Finance
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" asChild>
                    <a
                      href={`mailto:blaifify.team@gmail.com?subject=Interest in Joining Blairify Team&body=Hi Blairify Team,%0A%0AI am interested in joining the Blairify team. Here are my relevant skills and experience:%0A%0A[Please tell us about yourself, your background, and why you're interested in contributing to Blairify]%0A%0ABest regards,%0A[Your Name]`}
                    >
                      Connect with Us
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href="https://github.com/blairify"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Our GitHub
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-primary hover:text-primary hover:bg-primary/20"
              onClick={() => setShowTeamAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
