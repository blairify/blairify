"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { PracticeFlashcardsGrid } from "@/components/practice/templates/practice-flashcards-grid";
import type { UserData } from "@/lib/services/auth/auth";

interface PracticePageClientProps {
  user: UserData;
}

export function PracticePageClient({ user }: PracticePageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto">
          <PracticeFlashcardsGrid user={user} />
        </div>
      </div>
    </div>
  );
}
