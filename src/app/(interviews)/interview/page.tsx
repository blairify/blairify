import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { InterviewPageClient } from "@/components/interview/templates/interview-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const user = await requireAuth("/interview");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading interview..." />}>
        <InterviewPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
