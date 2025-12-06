import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ResultsPageClient } from "@/components/results/templates/results-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/results");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading results..." />}>
        <ResultsPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
