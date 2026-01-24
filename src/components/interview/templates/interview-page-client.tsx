"use client";

import { useEffect, useState } from "react";
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

        {/* Floating notification */}
        {showNotification && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500 w-[calc(100%-2rem)] sm:w-auto">
            <div className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-xl max-w-4xl mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl sm:rounded-2xl blur-xl" />

              <div className="relative px-3 py-2.5 sm:px-5 sm:py-4 flex items-start gap-2 sm:gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-100/90 leading-relaxed">
                    This experience is in testing phase. If you encounter any
                    issues, type{" "}
                    <span className="font-semibold text-amber-50 bg-amber-500/20 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs">
                      continue
                    </span>{" "}
                    or press the{" "}
                    <span className="font-semibold text-amber-50 bg-amber-500/20 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs">
                      Skip
                    </span>{" "}
                    button.
                  </p>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setShowNotification(false)}
                  className="flex-shrink-0 size-5 sm:size-6 rounded-full hover:bg-amber-500/20 transition-colors flex items-center justify-center group"
                  aria-label="Dismiss notification"
                >
                  <svg
                    className="size-3 sm:size-4 text-amber-400/60 group-hover:text-amber-300 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Close notification</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <InterviewContent
          user={user}
          onInterviewStart={() => setIsInterviewStarted(true)}
        />
      </div>
    </div>
  );
}
