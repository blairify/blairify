import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { DashboardPageClient } from "@/components/my-progress/templates/dashboard-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Progress | Blairify - Your Career Progress Hub",
  description:
    "Track your job applications, interview progress, and skill development. Access your personalized career dashboard with insights and recommendations.",
  robots: {
    index: false, // Private user area
    follow: false,
  },
};

export default async function DashboardPage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/my-progress");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading insights..." />}>
        <DashboardPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
