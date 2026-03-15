"use client";

import {
  Crown,
  Flame,
  Gem,
  HelpCircle,
  LogOut,
  Menu,
  Star,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GiBurningBook, GiFlowerTwirl } from "react-icons/gi";
import { AvatarIconDisplay } from "@/components/common/atoms/avatar-icon-selector";
import { BugReportButton } from "@/components/common/atoms/bug-report-button";
import { ThemeToggle } from "@/components/common/atoms/theme-toggle";
import { Typography } from "@/components/common/atoms/typography";
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
  GiBurningBook,
  GiFlowerTwirl,
  Crown,
  Gem,
  Star,
  Flame,
  Trophy,
};

function RankIcon({ rank, className }: { rank: Rank; className?: string }) {
  const Icon = RANK_ICONS[rank.icon] ?? GiBurningBook;
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
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Subscription toggle component
  const SubscriptionToggle = () => (
    <button
      type="button"
      className={`w-18 h-9 gap-2 rounded-full border flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-colors px-3 ${
        isPro
          ? "bg-green-200 border-green-900 dark:bg-green-800 dark:border-green-600"
          : "bg-card border-gray-500 dark:bg-card dark:border-gray-400"
      }`}
      onClick={() => router.push("/settings?tab=subscription")}
    >
      {isPro ? (
        <>
          <Typography.SubCaptionBold className="relative text-black leading-none right-[2px] text-[11px]">
            PRO
          </Typography.SubCaptionBold>
          <div
            className={cn(
              "relative size-[30px] right-[5px] items-center rounded-full hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer",
            )}
          >
            {userData?.avatarIcon ? (
              <AvatarIconDisplay
                iconId={userData.avatarIcon}
                size="sm"
                className="size-7"
              />
            ) : (
              <Avatar className="size-[30px] bg-card my-auto border-[0.5px] border-green-900 rounded-full">
                <AvatarImage
                  src={user?.photoURL || userData?.photoURL}
                  alt={userData?.displayName || user?.displayName || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Typography.SubCaptionBold>
                    {getInitials(
                      userData?.displayName || user?.displayName || null,
                    )}
                  </Typography.SubCaptionBold>
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "relative size-[30px] items-center right-[10px] rounded-full hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer",
            )}
          >
            {userData?.avatarIcon ? (
              <AvatarIconDisplay
                iconId={userData.avatarIcon}
                size="sm"
                className="size-7"
              />
            ) : (
              <Avatar className="size-[30px] my-auto border-[0.5px] border-border/50 rounded-full">
                <AvatarImage
                  src={user?.photoURL || userData?.photoURL}
                  alt={userData?.displayName || user?.displayName || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Typography.SubCaptionBold>
                    {getInitials(
                      userData?.displayName || user?.displayName || null,
                    )}
                  </Typography.SubCaptionBold>
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <Typography.SubCaptionBold className="relative leading-none right-[13px] top-[0px] text-[10px] flex items-center">
            FREE
          </Typography.SubCaptionBold>
        </>
      )}
    </button>
  );

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
      <TooltipProvider>
        <nav className="border-b border-border lg:bg-card/50 backdrop-blur-sm">
          <div className="px-4 h-16 flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
              <div className="size-9 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </nav>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <nav className="relative z-40 border-b border-border/50 bg-card lg:bg-card/50 backdrop-blur-sm">
        <DashboardWalkthrough />
        <div className="px-4 h-16 flex items-center justify-between w-full">
          <div className="flex my-auto items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2"></div>
            </div>
            {/* Mobile subscription toggle - left side */}
            {isMobile && (
              <div className="flex items-center gap-2 absolute left-4">
                <SubscriptionToggle />
              </div>
            )}
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1 cursor-default">
                    <div className="flex items-center gap-1.5">
                      <RankIcon
                        rank={rank}
                        className={cn("size-4 shrink-0", rank.badge.text)}
                      />
                      <div className={cn("whitespace-nowrap", rank.badge.text)}>
                        <Typography.SubCaptionBold>
                          {rank.name} {formatRankLevel(rank.level)}
                        </Typography.SubCaptionBold>
                      </div>
                    </div>
                    <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                          rank.color.gradient,
                        )}
                        style={{ width: `${progressToNextRank}%` }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <div className="flex items-center gap-1">
                    <Typography.SubCaptionBold>
                      {totalXP.toLocaleString()} XP
                    </Typography.SubCaptionBold>
                    <Typography.SubCaption color="secondary">
                      {"·"}
                    </Typography.SubCaption>
                    <Typography.SubCaption color="secondary">
                      {progressToNextRank}% to next rank
                    </Typography.SubCaption>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop subscription toggle - right side */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <SubscriptionToggle />
              </div>
            )}
            <ThemeToggle />

            {!isMobile && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <BugReportButton variant="navbar" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography.Caption>Report Bug</Typography.Caption>
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
                    <Typography.Caption>Help & Support</Typography.Caption>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                      aria-label="Sign out"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography.Caption>Sign Out</Typography.Caption>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
