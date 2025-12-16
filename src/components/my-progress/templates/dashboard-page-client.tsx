"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardContent } from "@/components/my-progress/templates/dashboard-content";
import { DashboardLayout } from "@/components/my-progress/templates/dashboard-layout";
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
import { useAuth } from "@/providers/auth-provider";

interface DashboardPageClientProps {
  user: UserData;
}

export function DashboardPageClient({ user }: DashboardPageClientProps) {
  const router = useRouter();
  const { user: authUser, userData } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    performanceData: PerformanceDataPoint[];
    skillsData: SkillPerformance[];
    questionTypesData: QuestionTypeStats[];
    weeklyActivityData: WeeklyActivity[];
    recentSessions: RecentSession[];
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

  useEffect(() => {
    if (!authUser || !userData) return;
    if (userData.onboardingCompleted) return;
    router.replace("/onboarding");
  }, [authUser, router, userData]);

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
            <Typography.Heading2 className="text-2xl font-bold text-foreground mb-2">
              Error Loading Dashboard
            </Typography.Heading2>
            <Typography.Body className="text-muted-foreground mb-4">
              {error || "Failed to load dashboard data"}
            </Typography.Body>
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
