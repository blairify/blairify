"use client";

import { motion } from "framer-motion";
import { History, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useAuth } from "@/providers/auth-provider";
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
  const { userData } = useAuth();
  const isPro =
    userData?.subscription?.plan === "pro" &&
    userData?.subscription?.status === "active";

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
              className="px-3 py-2"
            >
              <Link
                href="/upgrade"
                title="Upgrade to Pro"
                aria-label="Upgrade to Pro"
                className={`relative group flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 w-full overflow-hidden ${
                  collapsed ? "justify-center max-w-10 mx-auto" : "space-x-3"
                } ${
                  isActive("/upgrade")
                    ? "bg-gradient-to-r from-[#10B981] to-[#34D399] text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]"
                    : "bg-[#10B981]/5 hover:bg-[#10B981]/10 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] shadow-sm"
                }`}
              >
                {/* Subtle Pulse Background */}
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
          <Link
            href="/roadmap"
            title="Roadmap"
            aria-label="Roadmap"
            className={`flex items-center px-3 py-2 rounded-md transition-colors w-full ${
              collapsed ? "justify-center max-w-9 mx-auto" : "space-x-3"
            } ${
              isActive("/roadmap")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <GrFlows className="size-5 flex-shrink-0" />
            <span
              className={`${collapsed ? "sr-only" : "truncate"} ${
                isActive("/roadmap") ? "font-medium" : ""
              }`}
            >
              Roadmap
            </span>
          </Link>
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

        {/* Footer - Sticky at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <p
            className={`text-xs text-sidebar-foreground/60 text-center ${
              collapsed ? "sr-only" : ""
            }`}
          >
            &copy; Rights Reserved Blairify
          </p>
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
