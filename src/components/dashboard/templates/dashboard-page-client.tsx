"use client";

import { useEffect, useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { ProfileOnboardingModal } from "@/components/dashboard/organisms/profile-onboarding-modal";
import { DashboardContent } from "@/components/dashboard/templates/dashboard-content";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DatabaseService } from "@/lib/database";
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
import type { UserPreferences } from "@/types/firestore";

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
  const { user: authUser, userData, refreshUserData } = useAuth();
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

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
    if (typeof window === "undefined") return;
    if (!authUser || !userData) return;

    const hasProfileBasics = Boolean(
      userData.role && userData.experience && userData.howDidYouHear,
    );

    if (hasProfileBasics) return;

    const key = `blairify-onboarding-dismissed-${authUser.uid}`;
    const dismissed = window.localStorage.getItem(key);
    if (dismissed) return;

    setShowOnboarding(true);
  }, [authUser, userData]);

  const handleOnboardingSave = async (values: {
    role: string;
    experience: string;
    howDidYouHear: string;
    preferredLocation?: string;
    technologies?: string[];
    preferredWorkTypes?: string[];
    expectedSalary?: string;
    struggleAreas?: string[];
    careerGoals?: string[];
  }) => {
    if (!authUser) return;
    try {
      setSavingOnboarding(true);
      let preferencesUpdate: UserPreferences | null = null;

      if (
        values.preferredLocation ||
        (values.technologies && values.technologies.length > 0) ||
        (values.preferredWorkTypes && values.preferredWorkTypes.length > 0) ||
        (values.expectedSalary && values.expectedSalary.trim().length > 0) ||
        (values.struggleAreas && values.struggleAreas.length > 0) ||
        (values.careerGoals && values.careerGoals.length > 0)
      ) {
        const existingProfile = await DatabaseService.getUserProfile(
          authUser.uid,
        );

        const basePreferences: UserPreferences =
          existingProfile?.preferences ?? {
            preferredDifficulty: "intermediate",
            preferredInterviewTypes: ["technical"],
            targetCompanies: [],
            notificationsEnabled: true,
            darkMode: false,
            language: "en",
            timezone:
              typeof Intl !== "undefined"
                ? Intl.DateTimeFormat().resolvedOptions().timeZone
                : "UTC",
          };

        preferencesUpdate = {
          ...basePreferences,
          ...(values.preferredLocation && {
            preferredLocation: values.preferredLocation,
          }),
          ...(values.technologies &&
            values.technologies.length > 0 && {
              preferredTechnologies: values.technologies,
            }),
          ...(values.preferredWorkTypes &&
            values.preferredWorkTypes.length > 0 && {
              preferredWorkTypes: values.preferredWorkTypes,
            }),
          ...(values.expectedSalary &&
            values.expectedSalary.trim().length > 0 && {
              expectedSalary: values.expectedSalary.trim(),
            }),
          ...(values.struggleAreas &&
            values.struggleAreas.length > 0 && {
              struggleAreas: values.struggleAreas,
            }),
          ...(values.careerGoals &&
            values.careerGoals.length > 0 && {
              careerGoals: values.careerGoals,
            }),
        };
      }

      const updates: Record<string, unknown> = {
        role: values.role,
        experience: values.experience,
        ...(values.howDidYouHear && {
          howDidYouHear: values.howDidYouHear,
        }),
        ...(preferencesUpdate && {
          preferences: preferencesUpdate,
        }),
      };

      await DatabaseService.updateUserProfile(authUser.uid, updates);

      const key = `blairify-onboarding-dismissed-${authUser.uid}`;
      window.localStorage.setItem(key, "1");
      await refreshUserData();
      setShowOnboarding(false);
    } catch (err) {
      console.error("Error saving onboarding profile:", err);
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleOnboardingClose = () => {
    if (!authUser) {
      setShowOnboarding(false);
      return;
    }

    const key = `blairify-onboarding-dismissed-${authUser.uid}`;
    window.localStorage.setItem(key, "1");
    setShowOnboarding(false);
  };

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
      <ProfileOnboardingModal
        open={showOnboarding}
        initialRole={userData?.role}
        initialExperience={userData?.experience}
        initialHowDidYouHear={userData?.howDidYouHear}
        isSaving={savingOnboarding}
        onSave={handleOnboardingSave}
        onClose={handleOnboardingClose}
      />
    </DashboardLayout>
  );
}
