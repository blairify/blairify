"use client";

import { useEffect, useState } from "react";
import { FloatingNotification } from "@/components/common/molecules/floating-notification";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { InterviewContent } from "@/components/interview/templates/interview-content";
import type { UserData } from "@/lib/services/auth/auth";

interface InterviewPageClientProps {
  user: UserData;
}

export function InterviewPageClient({ user }: InterviewPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Hide notification when interview starts
  useEffect(() => {
    if (isInterviewStarted) {
      setShowNotification(false);
    }
  }, [isInterviewStarted]);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <FloatingNotification
          show={showNotification}
          onClose={() => setShowNotification(false)}
        >
          <p className="text-xs sm:text-sm font-medium text-amber-100/90 leading-relaxed">
            This experience is in testing phase. If you encounter any issues,
            type{" "}
            <span className="font-semibold text-amber-50 bg-amber-500/20 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs">
              continue
            </span>{" "}
            or press the{" "}
            <span className="font-semibold text-amber-50 bg-amber-500/20 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs">
              Skip
            </span>{" "}
            button.
          </p>
        </FloatingNotification>

        <InterviewContent
          user={user}
          onInterviewStart={() => setIsInterviewStarted(true)}
        />
      </div>
    </div>
  );
}
