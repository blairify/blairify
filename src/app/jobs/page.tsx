import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { JobsPageClient } from "@/components/jobs/templates/jobs-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tech Jobs — Blairify",
  description:
    "Browse thousands of tech job opportunities from top companies. Coming soon to Blairify.",
  openGraph: {
    title: "Tech Jobs — Blairify",
    description:
      "Browse curated tech job listings from top companies. Coming soon.",
    url: "https://blairify.com/jobs",
    type: "website",
    siteName: "Blairify",
  },
  robots: {
    index: false,
    follow: true,
  },
};

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
