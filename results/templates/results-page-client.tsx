"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { ResultsContent } from "@/components/results/templates/results-content";
import type { UserData } from "@/lib/services/auth/auth";

interface ResultsPageClientProps {
  user: UserData;
}

export function ResultsPageClient({ user }: ResultsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <ResultsContent user={user} />
      </div>
    </div>
  );
}
