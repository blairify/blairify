"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { ProfileContent } from "@/components/profile/templates/profile-content";
import type { UserData } from "@/lib/services/auth/auth";

interface ProfilePageClientProps {
  user: UserData;
  initialTab?: "subscription" | "profile" | "account";
}

export function ProfilePageClient({
  user,
  initialTab = "subscription",
}: ProfilePageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <ProfileContent user={user} initialTab={initialTab} />
      </div>
    </div>
  );
}
