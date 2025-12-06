import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ProfilePageClient } from "@/components/profile/templates/profile-page-client";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile | Blairify - Manage Your Career Profile",
  description:
    "Update your professional profile, skills, and career preferences to get better job matches and interview opportunities.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const user = await requireAuth("/profile");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading profile..." />}>
        <ProfilePageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
