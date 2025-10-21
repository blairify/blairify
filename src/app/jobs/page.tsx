import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { JobsPageClient } from "@/components/jobs/templates/jobs-page-client";
import { requireAuth } from "@/lib/server-auth";

export default async function JobsPage() {
  const user = await requireAuth("/jobs");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading jobs..." />}>
        <JobsPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
