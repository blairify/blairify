"use client";

import { DashboardContent } from "@/components/dashboard/templates/dashboard-content";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";
import type { UserData } from "@/lib/services/auth/auth";

interface DashboardPageClientProps {
  user: UserData;
}

export function DashboardPageClient({ user: _user }: DashboardPageClientProps) {
  // Authentication is now handled server-side via middleware and requireAuth()
  // No need for client-side auth checks, loading states, or redirects

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
