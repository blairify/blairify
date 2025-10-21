"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { JobsContent } from "@/components/jobs/templates/jobs-content";
import type { UserData } from "@/lib/services/auth/auth";

interface JobsPageClientProps {
  user: UserData;
}

export function JobsPageClient({ user: _user }: JobsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <JobsContent />
      </div>
    </div>
  );
}
