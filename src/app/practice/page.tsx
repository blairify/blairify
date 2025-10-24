import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { PracticePageClient } from "@/components/practice/templates/practice-page-client";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Practice Interview Questions | Blairify - Ace Your Next Interview",
  description:
    "Practice with hundreds of real interview questions from top tech companies. Improve your coding skills, system design knowledge, and behavioral interview responses. Get ready for your dream job.",
  keywords: [
    "interview questions",
    "coding interview",
    "system design",
    "behavioral interview",
    "tech interview prep",
    "programming questions",
    "interview practice",
    "coding challenges",
    "algorithm questions",
    "data structures",
  ],
  openGraph: {
    title: "Practice Interview Questions - Ace Your Next Interview",
    description:
      "Practice with real interview questions from top tech companies. Coding, system design, and behavioral questions.",
    url: "https://blairify.com/practice",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
