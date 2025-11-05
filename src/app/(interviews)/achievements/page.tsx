import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { AchievementsPageClient } from "@/components/achievements/templates/achievements-page-client";
import { requireAuth } from "@/lib/server-auth";

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
