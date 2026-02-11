"use client";

import { motion } from "framer-motion";
import {
  Clock,
  History,
  Infinity as InfinityIcon,
  Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GiDandelionFlower } from "react-icons/gi";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { GrFlows } from "react-icons/gr";
import { IoIosRadio } from "react-icons/io";
import { LuBookAudio } from "react-icons/lu";
import { MdOutlineLocalFireDepartment } from "react-icons/md";
import { TbProgressBolt } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import Logo from "@/components/common/atoms/logo-blairify";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUsageStatus } from "@/hooks/use-usage-status";
import { useSidebar } from "@/providers/sidebar-provider";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userAdmin?: boolean;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  userAdmin: _,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOpen = () => setSidebarOpen(true);
    const onClose = () => setSidebarOpen(false);
    window.addEventListener("blairify-sidebar-open", onOpen);
    window.addEventListener("blairify-sidebar-close", onClose);
    return () => {
      window.removeEventListener("blairify-sidebar-open", onOpen);
      window.removeEventListener("blairify-sidebar-close", onClose);
    };
  }, [setSidebarOpen]);
  const {
    isPro,
    currentCount,
    maxInterviews,
    remainingInterviews,
    timeRemaining,
    usagePercentage,
    isLoading: usageLoading,
  } = useUsageStatus();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-sidebar text-sky-50 border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="border-b border-border">
          <div className="px-4 h-16 flex items-center">
            <div
              className={`flex items-center justify-between w-full ${collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"}`}
            >
              {!collapsed && (
                <div className="transition-transform">
                  <Logo variant="textOnly" />
                </div>
              )}
              <div
                className="hidden items-center gap-1 lg:flex"
                aria-hidden="true"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`flex  size-9 shadow-none mx-auto items-center p-3 rounded-full  ${
                    collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
                  } `}
                  onClick={() => setCollapsed((prev) => !prev)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <GoSidebarCollapse className="size-5" />
                  ) : (
                    <GoSidebarExpand className="size-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <nav
          className={`flex-1 ${collapsed ? "px-2" : "px-4"} py-6 space-y-2 overflow-y-auto`}
        >
          <Link
            href="/configure"
            title="New Interview"
            aria-label="New Interview"
            data-tour="start-interview"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/configure")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Plus className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/configure") ? "font-medium" : ""
              }`}
            >
              New Interview
            </span>
          </Link>
          <Link
            href="/jobs"
            title="Real Offers"
            aria-label="Real Offers"
            data-tour="real-offers"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/jobs")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <MdOutlineLocalFireDepartment className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/jobs") ? "font-medium" : ""
              }`}
            >
              Real Offers
            </span>
          </Link>

          <Link
            href="/history"
            title="History"
            aria-label="History"
            data-tour="interview-history"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/history")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <History className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/history") ? "font-medium" : ""
              }`}
            >
              History
            </span>
          </Link>

          {!isPro && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="py-2"
            >
              <Link
                href="/settings?tab=subscription"
                title="Upgrade to Pro"
                aria-label="Upgrade to Pro"
                className={`relative group flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 w-full overflow-hidden ${
                  collapsed ? "justify-center max-w-10 mx-auto" : "space-x-2"
                } "bg-[#10B981]/5 hover:bg-[#10B981]/10 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] shadow-sm"
                `}
              >
                {!isActive("/upgrade") && (
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-primary/10 pointer-events-none group-hover:opacity-0 transition-opacity"
                  />
                )}

                <div
                  className={`relative flex items-center shrink-0 ${collapsed ? "" : "w-5"}`}
                >
                  <Zap
                    className={`size-4 transition-colors ${isActive("/upgrade") ? "fill-white text-white" : "text-[#10B981] fill-[#10B981]"}`}
                  />
                </div>

                {!collapsed && (
                  <span className="relative font-bold text-sm tracking-tight truncate">
                    Upgrade to Pro
                  </span>
                )}

                {/* Shine effect on hover */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              </Link>
            </motion.div>
          )}

          {/* Progress Section */}
          <div className={`pt-4 pb-2 ${collapsed ? "px-0" : "px-3"}`}>
            <p
              className={`text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider ${
                collapsed ? "sr-only" : ""
              }`}
            >
              Progress
            </p>
          </div>
          <Link
            href="/my-progress"
            title="My Progress"
            aria-label="My Progress"
            data-tour="my-progress"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/my-progress")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <TbProgressBolt className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/my-progress") ? "font-medium" : ""
              }`}
            >
              My Progress
            </span>
          </Link>
          <Link
            href="/achievements"
            title="Achievements"
            aria-label="Achievements"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/achievements")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <TiFlowChildren className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/achievements") ? "font-medium" : ""
              }`}
            >
              Achievements
            </span>
          </Link>
          <button
            type="button"
            disabled
            title="Roadmap (Temporarily Disabled)"
            aria-label="Roadmap (Temporarily Disabled)"
            className={`flex items-center px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            }`}
          >
            <GrFlows className="size-5 flex-shrink-0" />
            <span className={`${collapsed ? "sr-only" : "truncate text-sm"}`}>
              Roadmap
            </span>
            {!collapsed && (
              <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </button>
          <button
            type="button"
            disabled
            className={`flex items-center px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            }`}
            aria-label="Docs coming soon"
          >
            <LuBookAudio className="size-5 flex-shrink-0" />
            <span className={`${collapsed ? "sr-only" : "truncate text-sm"}`}>
              Docs
            </span>
            {!collapsed && (
              <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </button>

          <button
            type="button"
            disabled
            className={`flex items-center px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            }`}
            aria-label="Tech news coming soon"
          >
            <IoIosRadio className="size-5 flex-shrink-0" />
            <span className={`${collapsed ? "sr-only" : "truncate text-sm"}`}>
              Tech News
            </span>
            {!collapsed && (
              <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </button>

          <button
            type="button"
            disabled
            className={`flex items-center px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            }`}
            aria-label="BairTalk coming soon"
          >
            <GiDandelionFlower className="size-5 flex-shrink-0" />
            <span className={`${collapsed ? "sr-only" : "truncate text-sm"}`}>
              BairTalk
            </span>
            {!collapsed && (
              <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </button>
        </nav>

        {/* Footer - Sticky at bottom with Usage Counter */}
        <div className="mt-auto border-t border-sidebar-border">
          {/* Interview Usage Counter */}
          <TooltipProvider>
            <div className={`p-4 ${collapsed ? "px-2" : ""}`}>
              {collapsed ? (
                /* Collapsed view - show icon with tooltip */
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      {isPro ? (
                        <div className="flex items-center justify-center size-9 rounded-lg bg-[#10B981]/10">
                          <InfinityIcon className="size-4 text-[#10B981]" />
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center size-9 rounded-lg bg-sidebar-accent/20">
                          <span className="text-xs font-bold text-sidebar-foreground">
                            {remainingInterviews}/{maxInterviews}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    {isPro ? (
                      <p className="text-sm">Unlimited Interviews</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Interviews: {currentCount}/{maxInterviews}
                        </p>
                        {timeRemaining.formatted && (
                          <p className="text-xs text-muted-foreground">
                            Limits reset in {timeRemaining.formatted}
                          </p>
                        )}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                /* Expanded view - show full counter */
                <div className="space-y-3">
                  {isPro ? (
                    /* Pro user - show unlimited */
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#10B981]/10">
                      <InfinityIcon className="size-4 text-[#10B981] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#10B981]">
                        Unlimited Interviews
                      </span>
                    </div>
                  ) : (
                    /* Free user - show counter with reset timer */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-sidebar-foreground/80">
                          Interviews
                        </span>
                        <span className="text-xs font-bold text-sidebar-foreground">
                          {currentCount}/{maxInterviews}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {!usageLoading && (
                        <Progress
                          value={usagePercentage}
                          className="h-1.5 bg-sidebar-accent/30"
                        />
                      )}

                      {/* Reset timer */}
                      {timeRemaining.formatted && (
                        <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60">
                          <Clock className="size-3" />
                          <span>Limits reset in {timeRemaining.formatted}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipProvider>

          {/* Copyright */}
          <div className="px-4 pb-4">
            <p
              className={`text-xs text-sidebar-foreground/60 text-center ${
                collapsed ? "sr-only" : ""
              }`}
            >
              &copy; Rights Reserved Blairify
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-background/80 z-40 lg:hidden border-0 p-0 w-full h-full"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}
