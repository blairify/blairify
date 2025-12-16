"use client";

import { History, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GiDandelionFlower } from "react-icons/gi";
import { GrFlows } from "react-icons/gr";
import { IoIosRadio } from "react-icons/io";
import { LuBookAudio } from "react-icons/lu";
import { MdOutlineLocalFireDepartment } from "react-icons/md";
import { TbProgressBolt } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import Logo from "@/components/common/atoms/logo-blairify";
import { Button } from "@/components/ui/button";

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

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-sidebar text-sky-50 border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden`}
      >
        <div className="border-b border-border">
          <div className="px-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <Logo />

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-sidebar-foreground active:bg-sidebar-accent md:hover:bg-sidebar-accent transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/configure"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/configure")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Plus className="size-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/configure") ? "font-medium" : ""}`}
            >
              New Interview
            </span>
          </Link>
          <Link
            href="/jobs"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/jobs")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <MdOutlineLocalFireDepartment className="size-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/jobs") ? "font-medium" : ""}`}
            >
              Real Offers
            </span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center space-x-3 px-3 py-2  rounded-md transition-colors w-full ${
              isActive("/history")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <History className="size-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/history") ? "font-medium" : ""}`}
            >
              History
            </span>
          </Link>

          {/* Progress Section */}
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Progress
            </p>
          </div>
          <Link
            href="/my-progress"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/my-progress")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <TbProgressBolt className="size-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/my-progress") ? "font-medium" : ""}`}
            >
              My Progress
            </span>
          </Link>
          <Link
            href="/achievements"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/achievements")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <TiFlowChildren className="size-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/achievements") ? "font-medium" : ""}`}
            >
              Achievements
            </span>
          </Link>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <LuBookAudio className="size-5 flex-shrink-0" />
            <span className="truncate text-sm">Docs</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <GrFlows className="size-5 flex-shrink-0" />
            <span className="truncate text-sm">Roadmap</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <IoIosRadio className="size-5 flex-shrink-0" />
            <span className="truncate text-sm">Tech News</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <GiDandelionFlower className="size-5 flex-shrink-0" />
            <span className="truncate text-sm">BairTalk</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </nav>

        {/* Footer - Sticky at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © Rights Reserved Blairify
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
