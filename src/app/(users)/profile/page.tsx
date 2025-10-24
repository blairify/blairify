import { Suspense } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { ProfilePageClient } from "@/components/profile/templates/profile-page-client";
import { requireAuth } from "@/lib/server-auth";

export default async function ProfilePage() {
  // Server-side authentication check - will redirect if not authenticated
  const user = await requireAuth("/profile");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage message="Loading profile..." />}>
        <ProfilePageClient user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}
