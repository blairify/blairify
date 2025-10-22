"use client";

import LoadingPage from "@/components/common/atoms/loading-page";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsGrid } from "../molecules/stats-grid";
import { DashboardTabs } from "../organisms/dashboard-tabs";

export function DashboardContent() {
  const dashboardData = useDashboardData();

  // Use dashboard data from hook
  const data = dashboardData;

  if (dashboardData.loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  // Show error if dashboard data failed to load
  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            {dashboardData.error || "Failed to load dashboard data"}
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  // Ensure data is not null before destructuring
  if (!data) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  const { recentSessions, stats, skills } = data;

  // Convert session data for display
  const displaySessions = recentSessions
    .slice(0, 5)
    .map((session, index: number) => ({
      id: index + 1,
      position: session.config?.position || "Interview Session",
      score: session.scores?.overall || 0,
      date: session.createdAt
        ? session.createdAt.toDate().toLocaleDateString()
        : "Unknown",
      duration: `${session.totalDuration || 0} min`,
      type: session.config?.interviewType || "general",
      improvement: "+0%", // TODO: Calculate improvement from historical data
    }));

  // Performance over time data from real sessions
  const performanceData = recentSessions
    .filter(
      (session) =>
        session.status === "completed" &&
        session.scores &&
        session.scores.overall > 0,
    )
    .slice(-7) // Last 7 sessions
    .map((session, index: number) => ({
      date: session.createdAt
        ? session.createdAt.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : `Session ${index + 1}`,
      overall: session.scores?.overall || 0,
      technical: session.scores?.technical || 0,
      communication: session.scores?.communication || 0,
      problemSolving: session.scores?.problemSolving || 0,
    }));

  // Fallback data if no sessions exist yet
  const fallbackPerformanceData = [
    {
      date: "Start Here",
      overall: 50,
      technical: 50,
      communication: 50,
      problemSolving: 50,
    },
  ];

  // Skills breakdown data from real database
  const skillsData = skills
    .slice(0, 6)
    .map(
      (
        skill: { name: string; currentLevel: number; practiceCount?: number },
        index: number,
      ) => ({
        skill: skill.name,
        score: skill.currentLevel * 10, // Convert 1-10 scale to percentage
        sessions: skill.practiceCount || 0,
        color: [
          "#68d391",
          "#4fd1c7",
          "#63b3ed",
          "#f6ad55",
          "#fc8181",
          "#d69e2e",
        ][index % 6],
      }),
    );

  // Question types distribution
  const questionTypesData = [
    { name: "Technical", value: 45, color: "#68d391" },
    { name: "Bullet", value: 25, color: "#4fd1c7" },
    { name: "Coding", value: 20, color: "#63b3ed" },
    { name: "System Design", value: 10, color: "#f6ad55" },
  ];

  // Weekly activity data
  const weeklyActivityData = [
    { day: "Mon", sessions: 2, avgScore: 82 },
    { day: "Tue", sessions: 1, avgScore: 78 },
    { day: "Wed", sessions: 3, avgScore: 85 },
    { day: "Thu", sessions: 2, avgScore: 80 },
    { day: "Fri", sessions: 1, avgScore: 88 },
    { day: "Sat", sessions: 2, avgScore: 84 },
    { day: "Sun", sessions: 1, avgScore: 79 },
  ];

  return (
    <>
      <StatsGrid stats={stats} />
      <DashboardTabs
        performanceData={
          performanceData.length > 0 ? performanceData : fallbackPerformanceData
        }
        sessions={displaySessions}
        skillsData={skillsData}
        questionTypesData={questionTypesData}
        weeklyActivityData={weeklyActivityData}
      />
    </>
  );
}
