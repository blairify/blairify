import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ConfigurePageClient } from "@/components/configure/templates/configure-page-client";
import { requireAuth } from "@/lib/server-auth";

export default async function ConfigurePage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/configure");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading configuration..." />}>
        <ConfigurePageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
