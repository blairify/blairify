import { Suspense } from "react";
import { AchievementsPageClient } from "@/components/achievements/templates/achievements-page-client";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const user = await requireAuth("/achievements");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading achievements..." />}>
        <AchievementsPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
