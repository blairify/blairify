import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { DashboardPageClient } from "@/components/dashboard/templates/dashboard-page-client";
import { requireAuth } from "@/lib/server-auth";

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
