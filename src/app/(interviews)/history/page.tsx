import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { HistoryPageClient } from "@/components/history/templates/history-page-client";
import { requireAuth } from "@/lib/server-auth";

export default async function HistoryPage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/history");

  return (
    <ErrorBoundary>
      <Suspense
        fallback={<LoadingPage message="Loading interview history..." />}
      >
        <HistoryPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
