"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  History,
  Home,
  Map as MapIcon,
  Newspaper,
  Plus,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Logo from "@/components/common/atoms/logo-blairify";
import { Button } from "@/components/ui/button";
import { isSuperAdmin } from "@/lib/services/auth/auth-roles";
import { useAuth } from "@/providers/auth-provider";

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
  const { user } = useAuth();

  // Memoize admin check to prevent unnecessary re-renders
  const showAdminLinks = useMemo(() => isSuperAdmin(user), [user]);

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
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/dashboard") ? "font-medium" : ""}`}
            >
              Dashboard
            </span>
          </Link>

          <Link
            href="/configure"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/configure")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/configure") ? "font-medium" : ""}`}
            >
              New Interview
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
            <History className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/history") ? "font-medium" : ""}`}
            >
              Interview History
            </span>
          </Link>

          <Link
            href="/practice"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/practice")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/practice") ? "font-medium" : ""}`}
            >
              Practice Library
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
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/jobs") ? "font-medium" : ""}`}
            >
              Job Listings
            </span>
          </Link>

          {/* Coming Soon Section */}
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Coming Soon
            </p>
          </div>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <Award className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-sm">Achievements</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <MapIcon className="h-5 w-5 flex-shrink-0" />
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
            <Newspaper className="h-5 w-5 flex-shrink-0" />
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
            <Wallet className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-sm">Blairify Wallet</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/40 cursor-not-allowed"
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-sm">Community</span>
            <span className="ml-auto text-xs bg-sidebar-accent/20 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          {/* Superadmin Only Links */}
          {showAdminLinks && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <Link
                href="/admin/practice-library"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
                  isActive("/admin/practice-library")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`truncate ${isActive("/admin/practice-library") ? "font-medium" : ""}`}
                >
                  Manage Library
                </span>
              </Link>
              {/* <Link
                href="/admin/manage-users"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
                  isActive("/admin/manage-users")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`truncate ${isActive("/admin/manage-users") ? "font-medium" : ""}`}
                >
                  Manage Users
                </span>
              </Link> */}
            </>
          )}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden border-0 p-0 w-full h-full"
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
