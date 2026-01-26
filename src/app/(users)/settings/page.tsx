import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ProfilePageClient } from "@/components/profile/templates/profile-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | Blairify - Account & Subscription Settings",
  description:
    "Manage your subscription, profile, and account settings including billing and security options.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SettingsPageProps {
  searchParams: {
    tab?: "subscription" | "profile" | "account";
  };
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const user = await requireAuth("/settings");
  const tab = searchParams.tab || "subscription";

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading settings..." />}>
        <ProfilePageClient user={user} initialTab={tab} />
      </Suspense>
    </ErrorBoundary>
  );
}
