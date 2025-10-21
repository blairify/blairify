"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { ConfigureContent } from "@/components/configure/templates/configure-content";
import type { UserData } from "@/lib/services/auth/auth";

interface ConfigurePageClientProps {
  user: UserData;
}

export function ConfigurePageClient({ user }: ConfigurePageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <ConfigureContent user={user} />
      </div>
    </div>
  );
}
