import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { DashboardPageClient } from "@/components/dashboard/templates/dashboard-page-client";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Dashboard | Blairify - Your Career Progress Hub",
  description:
    "Track your job applications, interview progress, and skill development. Access your personalized career dashboard with insights and recommendations.",
  robots: {
    index: false, // Private user area
    follow: false,
  },
};

export default async function DashboardPage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/dashboard");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading dashboard..." />}>
        <DashboardPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
