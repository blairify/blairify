"use client";

import { useEffect, useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { DashboardContent } from "@/components/dashboard/templates/dashboard-content";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/lib/services/auth/auth";
import type {
  DashboardStats,
  PerformanceDataPoint,
  QuestionTypeStats,
  RecentSession,
  SkillPerformance,
  WeeklyActivity,
} from "@/lib/services/dashboard/dashboard-analytics";
import { getDashboardData } from "@/lib/services/dashboard/dashboard-analytics";

interface Job {
  id: string;
  title?: string;
  name?: string;
  company?: string;
  location?: string;
  logoUrl?: string;
}

interface DashboardPageClientProps {
  user: UserData;
}

export function DashboardPageClient({ user }: DashboardPageClientProps) {
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    performanceData: PerformanceDataPoint[];
    skillsData: SkillPerformance[];
    questionTypesData: QuestionTypeStats[];
    weeklyActivityData: WeeklyActivity[];
    recentSessions: RecentSession[];
    suggestedJobs: Job[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardData(user.uid);
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingPage message="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "Failed to load dashboard data"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent dashboardData={dashboardData} />
    </DashboardLayout>
  );
}
