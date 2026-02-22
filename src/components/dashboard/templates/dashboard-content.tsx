"use client";

import {
  Activity,
  BarChart3,
  ExternalLink,
  Flame,
  Target,
  Timer,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import {
  RecentSessionsCard,
  ScoreProgressCard,
  StatsGrid,
  StatsGridMobile,
  WeeklyActivityCard,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERVIEWERS } from "@/lib/interview";
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

  const filteredPerformanceData = useMemo(() => {
    if (timeRange === "all") return performanceData;
    const now = new Date();
    const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return performanceData.filter((item) => new Date(item.date) >= startDate);
  }, [performanceData, timeRange]);

  if (!hasData) {
    return (
      <div className="space-y-6 max-w-xl mx-auto md:max-w-none md:mx-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BarChart3,
              label: "Total Interviews",
              value: "0",
              subtext: "Get started today",
            },
            {
              icon: Activity,
              label: "Average Score",
              value: "-",
              subtext: "Complete an interview",
            },
            {
              icon: Timer,
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
                <CardTitle className="p-0">
                  <Typography.SubCaptionMedium className="text-muted-foreground">
                    {stat.label}
                  </Typography.SubCaptionMedium>
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-foreground block">
                  {stat.value}
                </span>
                <Typography.Caption className="text-muted-foreground mt-1 block">
                  {stat.subtext}
                </Typography.Caption>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-1 mb-4">
              <InterviewerAvatar interviewer={INTERVIEWERS[2]} size={120} />
            </div>
            <Typography.BodyBold
              color="secondary"
              className="text-xl font-semibold mb-2"
            >
              No Interview Data Yet
            </Typography.BodyBold>
            <Typography.Body
              color="secondary"
              className="text-muted-foreground text-center max-w-md mb-6"
            >
              Start your first interview to see your performance metrics,
              progress insights, and personalized recommendations.
            </Typography.Body>
            <Button variant="outline" asChild>
              <a href="/configure">Start Your First Interview</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto md:max-w-none md:mx-0">
      {/* Mobile Stats Grid - Horizontal Scroll */}
      <StatsGridMobile stats={stats} />

      {/* Desktop Stats Grid - Grid Layout */}
      <div className="hidden sm:block">
        <StatsGrid stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScoreProgressCard
          className="lg:col-span-2"
          performanceData={filteredPerformanceData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <WeeklyActivityCard weeklyActivity={weeklyActivityData} />
      </div>

      <RecentSessionsCard sessions={recentSessions} />
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
