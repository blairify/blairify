"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { InterviewContent } from "@/components/interview/templates/interview-content";
import type { UserData } from "@/lib/services/auth/auth";

interface InterviewPageClientProps {
  user: UserData;
}

export function InterviewPageClient({ user }: InterviewPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <div
          className="border-b border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground"
          role="note"
        >
          Beta: this interview experience is still in progress. If you hit a
          bug, type{" "}
          <span className="font-medium text-foreground">continue</span> or press
          the <span className="font-medium text-foreground">Skip</span> button.
        </div>
        <InterviewContent user={user} />
      </div>
    </div>
  );
}
