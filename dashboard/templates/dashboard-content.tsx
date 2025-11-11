"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface Job {
  id: string;
  title?: string;
  name?: string;
  company?: string;
  location?: string;
  logoUrl?: string;
}

interface DashboardContentProps {
  dashboardData: {
    stats: DashboardStats;
    performanceData: PerformanceDataPoint[];
    skillsData: SkillPerformance[];
    questionTypesData: QuestionTypeStats[];
    weeklyActivityData: WeeklyActivity[];
    recentSessions: RecentSession[];
    suggestedJobs: Job[];
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
    suggestedJobs,
  } = dashboardData;

  const hasData = stats.totalSessions > 0;
  const [timeRange, setTimeRange] = useState("all");
  const [showTeamAlert, setShowTeamAlert] = useState(true);

  // Chart configuration
  const chartConfig = {
    score: {
      label: "Score",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  // Filter performance data based on time range
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

  const _getTrendColor = (trend: number) => {
    if (trend > 0) return "text-emerald-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const formatKebabCase = (str: string) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
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

        {/* Empty State */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Interview Data Yet
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start your first interview to see your performance metrics,
              progress insights, and personalized recommendations.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/configure">Start Your First Interview</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/practice">Browse Practice Questions</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Interviews */}
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

        {/* Average Score */}
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

        {/* Total Practice Time */}
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

        {/* Current Streak */}
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

        {/* Total XP */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression Chart */}
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
                  className="w-[160px] rounded-lg sm:ml-auto"
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
                        stopColor="var(--color-score)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-score)"
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
                    stroke="var(--color-score)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Complete interviews to see your progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
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

      {/* Recommended Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recommended Jobs
              </CardTitle>
              <CardDescription>Positions matching your profile</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/jobs">
                View All
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedJobs && suggestedJobs.length > 0 ? (
              suggestedJobs.slice(0, 4).map((job: Job) => (
                <a
                  key={job.id}
                  href={`/jobs?id=${job.id}`}
                  className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  {/* Company Logo */}
                  {job.logoUrl && (
                    <div className="mb-3 flex items-center justify-center h-12 w-12 rounded-lg bg-muted/50 overflow-hidden">
                      <Image
                        src={job.logoUrl}
                        alt={`${job.company} logo`}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {job.title || job.name}
                  </h4>

                  <div className="space-y-1">
                    {job.company && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {job.company}
                      </p>
                    )}
                    {job.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📍</span>
                        <span className="line-clamp-1">{job.location}</span>
                      </p>
                    )}
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Loading job recommendations...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connect with Blairify Team */}
      {showTeamAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Join the Blairify Team
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  We're a growing team of passionate developers building the
                  future of interview preparation. We respond super fast to all
                  inquiries!
                </p>
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    We're looking for:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Quality Engineers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      DevOps Engineers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Cloud Engineers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Fullstack Developers
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Marketing
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
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
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              onClick={() => setShowTeamAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interview Sessions</CardTitle>
          <CardDescription>
            Your latest interview performances and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{session.position}</h4>
                      <Badge variant="secondary">
                        {formatKebabCase(session.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {session.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{session.duration} minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        session.score,
                      )}`}
                    >
                      {session.score}%
                    </div>
                    {index > 0 && recentSessions[index - 1].score > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs mt-1">
                        {session.score > recentSessions[index - 1].score ? (
                          <>
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">
                              +
                              {Math.abs(
                                session.score - recentSessions[index - 1].score,
                              )}
                            </span>
                          </>
                        ) : session.score < recentSessions[index - 1].score ? (
                          <>
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                            <span className="text-red-600 font-medium">
                              -
                              {Math.abs(
                                session.score - recentSessions[index - 1].score,
                              )}
                            </span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent sessions to display
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
