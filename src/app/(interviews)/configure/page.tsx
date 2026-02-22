import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ConfigurePageClient } from "@/components/configure/templates/configure-page-client";

export const metadata: Metadata = {
  title: "Configure AI Interview — Blairify",
  description:
    "Set up your personalized AI interview. Choose your position, seniority level, technologies, and company profile to practice with tailored interview questions.",
  openGraph: {
    title: "Configure AI Interview — Blairify",
    description:
      "Set up your personalized AI interview with tailored questions for your target role and company.",
    url: "https://blairify.com/configure",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Configure AI Interview — Blairify",
    description:
      "Set up your personalized AI interview with tailored questions for your target role.",
  },
  alternates: {
    canonical: "https://blairify.com/configure",
  },
};

export default async function ConfigurePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading configuration..." />}>
        <ConfigurePageClient />
      </Suspense>
    </ErrorBoundary>
  );
}
