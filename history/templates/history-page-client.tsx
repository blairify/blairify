"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { HistoryContent } from "@/components/history/templates/history-content";
import type { UserData } from "@/lib/services/auth/auth";

interface HistoryPageClientProps {
  user: UserData;
}

export function HistoryPageClient({ user }: HistoryPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Content Area */}
        <HistoryContent user={user} />
      </div>
    </div>
  );
}
