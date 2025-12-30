import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { RoadmapPageClient } from "@/components/roadmap/templates/roadmap-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roadmap | Blairify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RoadmapPage() {
  const user = await requireAuth("/roadmap");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading roadmap..." />}>
        <RoadmapPageClient userId={user.uid} />
      </Suspense>
    </ErrorBoundary>
  );
}
