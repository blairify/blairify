import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ConfigurePageClient } from "@/components/configure/templates/configure-page-client";

export default async function ConfigurePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading configuration..." />}>
        <ConfigurePageClient />
      </Suspense>
    </ErrorBoundary>
  );
}
