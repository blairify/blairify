"use client";

import {
  Crown,
  Flame,
  Gem,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  Star,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GiFlowerTwirl, GiTurtleShell } from "react-icons/gi";
import { AvatarIconDisplay } from "@/components/common/atoms/avatar-icon-selector";
import { BugReportButton } from "@/components/common/atoms/bug-report-button";
import { ThemeToggle } from "@/components/common/atoms/theme-toggle";
import { DashboardWalkthrough } from "@/components/common/organisms/dashboard-walkthrough";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useIsMobile from "@/hooks/use-is-mobile";
import { useUsageStatus } from "@/hooks/use-usage-status";
import {
  formatRankLevel,
  getProgressToNextRank,
  getRankByXP,
  type Rank,
} from "@/lib/ranks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const RANK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  GiTurtleShell,
  GiFlowerTwirl,
  Crown,
  Gem,
  Star,
  Flame,
  Trophy,
};

function RankIcon({ rank, className }: { rank: Rank; className?: string }) {
  const Icon = RANK_ICONS[rank.icon] ?? GiTurtleShell;
  return <Icon className={className} />;
}

interface DashboardNavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardNavbar({
  setSidebarOpen,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { user, userData, signOut } = useAuth();
  const { isMobile, isLoading } = useIsMobile();
  const { isPro } = useUsageStatus();
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
                  <Link
                    aria-label="View Profile"
                    href="/profile"
                    data-tour="profile"
                  >
                    <div
                      className={cn(
                        "relative size-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer",
                        isPro &&
                          "ring-2 ring-[#10B981] ring-offset-2 ring-offset-background",
                      )}
                    >
                      {userData?.avatarIcon ? (
                        <AvatarIconDisplay
                          iconId={userData.avatarIcon}
                          size="sm"
                          className="size-9"
                        />
                      ) : (
                        <Avatar
                          className={cn(
                            "size-9 my-auto border-2 rounded-full",
                            isPro ? "border-[#10B981]" : "border-primary/20",
                          )}
                        >
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
              <div
                className={cn(
                  "flex items-center gap-0 rounded-full h-9 border overflow-hidden",
                  "bg-background/80 backdrop-blur-sm",
                  isPro ? "border-[#10B981]/40" : rank.badge.border,
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-bold",
                    isPro
                      ? "bg-gradient-to-r from-[#10B981] to-[#34D399] text-white"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {isPro && <Crown className="size-3" />}
                  {isPro ? "PRO" : "FREE"}
                </div>

                {/* Rank + XP — right segment */}
                {!isMobile && (
                  <div className="flex items-center gap-1.5 pl-2 pr-3 py-1">
                    <RankIcon
                      rank={rank}
                      className={cn("size-3.5 shrink-0", rank.badge.text)}
                    />
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {rank.name} {formatRankLevel(rank.level)}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                          rank.color.gradient,
                        )}
                        style={{ width: `${progressToNextRank}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
                      onClick={() => router.push("/settings?tab=subscription")}
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
