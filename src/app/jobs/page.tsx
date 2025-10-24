import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { JobsPageClient } from "@/components/jobs/templates/jobs-page-client";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Tech Jobs | Blairify - Find Your Next Career Opportunity",
  description:
    "Browse thousands of tech job opportunities from top companies. Filter by location, salary, remote work options, and more. Find your perfect job match with Blairify's curated job listings.",
  keywords: [
    "tech jobs",
    "software engineer jobs",
    "remote jobs",
    "programming jobs",
    "developer positions",
    "IT careers",
    "startup jobs",
    "tech companies",
    "job search",
    "career opportunities",
  ],
  openGraph: {
    title: "Tech Jobs - Find Your Next Opportunity",
    description:
      "Browse curated tech job listings from top companies. Remote and on-site positions available.",
    url: "https://blairify.com/jobs",
  },
  robots: {
    index: true,
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
