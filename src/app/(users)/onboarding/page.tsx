import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { OnboardingPageClient } from "@/components/onboarding/templates/onboarding-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireAuth("/onboarding");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading onboarding..." />}>
        <OnboardingPageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
