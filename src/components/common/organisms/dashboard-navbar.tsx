"use client";

import { HelpCircle, LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarIconDisplay } from "@/components/common/atoms/avatar-icon-selector";
import { BugReportButton } from "@/components/common/atoms/bug-report-button";
import { ThemeToggle } from "@/components/common/atoms/theme-toggle";
import { DashboardWalkthrough } from "@/components/common/organisms/dashboard-walkthrough";
import { RankBadgeInline } from "@/components/ranks/organisms/rank-badge";
import { XPProgressBarCompact } from "@/components/ranks/organisms/xp-progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useIsMobile from "@/hooks/use-is-mobile";
import { getProgressToNextRank, getRankByXP } from "@/lib/ranks";
import { useAuth } from "@/providers/auth-provider";

interface DashboardNavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardNavbar({
  setSidebarOpen,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { user, userData, signOut } = useAuth();
  const { isMobile, isLoading } = useIsMobile();
  const totalXP =
    typeof userData?.experiencePoints === "number" &&
    Number.isFinite(userData.experiencePoints)
      ? userData.experiencePoints
      : 0;
  const rank = getRankByXP(totalXP);
  const progressToNextRank = getProgressToNextRank(totalXP, rank);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh(); // Ensure the page updates after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Prevent rendering during mobile detection to avoid layout shifts
  if (isLoading) {
    return (
      <nav className="border-b border-border lg:bg-card/50 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-muted animate-pulse" />
            <div className="hidden lg:block">
              <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-9 bg-muted animate-pulse rounded" />
            <div className="size-9 bg-muted animate-pulse rounded" />
            <div className="size-9 bg-muted animate-pulse rounded" />
            <div className="size-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <nav className="relative z-40 border-b border-border lg:bg-card/50 backdrop-blur-sm">
        <DashboardWalkthrough />
        <div className="px-4 h-16 flex items-center justify-between w-full">
          <div className="flex my-auto items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="size-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link aria-label="View Profile" href="/profile">
                    <div className="size-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                      {userData?.avatarIcon ? (
                        <AvatarIconDisplay
                          iconId={userData.avatarIcon}
                          size="sm"
                          className="size-9"
                        />
                      ) : (
                        <Avatar className="size-9 my-auto border-2 border-primary/20">
                          <AvatarImage
                            src={user?.photoURL || userData?.photoURL}
                            alt={
                              userData?.displayName ||
                              user?.displayName ||
                              "User"
                            }
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(
                              userData?.displayName ||
                                user?.displayName ||
                                null,
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Profile</p>
                </TooltipContent>
              </Tooltip>

              {/* User info - name, rank, and XP */}
              {!isMobile && (
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {userData?.displayName || user?.displayName || "User"}
                    </span>
                    <RankBadgeInline rank={rank} className="shrink-0" />
                  </div>
                  <XPProgressBarCompact
                    currentXP={totalXP}
                    rank={rank}
                    progress={progressToNextRank}
                    className="max-w-[240px]"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <BugReportButton variant="navbar" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report Bug</p>
              </TooltipContent>
            </Tooltip>
            {!isMobile && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Settings"
                      data-tour="profile-settings"
                      onClick={() => router.push("/settings")}
                      variant="outline"
                      size="icon"
                      className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    >
                      <Settings className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => router.push("/support")}
                      aria-label="Help & Support"
                      variant="outline"
                      size="icon"
                      className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    >
                      <HelpCircle className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & Support</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
