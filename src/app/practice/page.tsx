import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { PracticePageClient } from "@/components/practice/templates/practice-page-client";
import { requireAuth } from "@/lib/server-auth";

export default async function PracticePage() {
  const user = await requireAuth("/practice");

  return (
    <ErrorBoundary>
      <Suspense
        fallback={<LoadingPage message="Loading practice questions..." />}
      >
        <PracticePageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
