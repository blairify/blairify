"use client";

import { LogOut, Menu, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/common/atoms/logo-blairify";
import { ThemeToggle } from "@/components/common/atoms/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { AvatarIconDisplay } from "../common/atoms/avatar-icon-selector";

interface NavbarProps {
  scrollThreshold?: number;
}

export default function Navbar({ scrollThreshold = 100 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userData, signOut, loading } = useAuth();
  const router = useRouter();

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
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    let ticking = false;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          clearTimeout(timeoutId);

          timeoutId = setTimeout(() => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > scrollThreshold);
          }, 16); // Small debounce to smooth out rapid scroll events

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollThreshold]);

  return (
    <>
      {/* 
        MOBILE-FIRST NAVIGATION BAR:
        - Fixed positioning with proper z-index stacking
        - Backdrop blur for modern glass effect
        - Touch-friendly 44px minimum height
        - Responsive padding and spacing
      */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* 
              LOGO SECTION:
              - Responsive sizing for different screen sizes
              - Touch-friendly click area
            */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* 
              DESKTOP NAVIGATION:
              - Hidden on mobile (hidden md:flex)
              - Proper spacing and touch targets
              - Hover states for desktop interaction
            */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <ThemeToggle />

              {!loading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                        {userData?.avatarIcon ? (
                          <AvatarIconDisplay
                            iconId={userData.avatarIcon}
                            size="sm"
                            className="w-8 h-8"
                          />
                        ) : (
                          <Avatar className="w-8 h-8 border-2 border-primary/20">
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
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {(userData?.displayName || user.displayName) && (
                          <p className="font-medium">
                            {userData?.displayName || user.displayName}
                          </p>
                        )}
                        {user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push("/auth")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 lg:px-6"
                  size="sm"
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* 
              MOBILE MENU BUTTON:
              - Only visible on mobile (md:hidden)
              - 44px touch target for accessibility
              - Clear visual feedback on press
            */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 
        MOBILE MENU OVERLAY:
        - Full-screen overlay for mobile navigation
        - Slide-in animation from top
        - Touch-friendly menu items with proper spacing
        - Backdrop blur for modern feel
      */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsMobileMenuOpen(false);
              }
            }}
            aria-label="Close mobile menu"
          />

          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-6">
              {!loading && user ? (
                <div className="space-y-4">
                  {/* User Info Section */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50">
                    <div className="w-10 h-10 rounded-full">
                      {userData?.avatarIcon ? (
                        <AvatarIconDisplay
                          iconId={userData.avatarIcon}
                          size="sm"
                          className="w-10 h-10"
                        />
                      ) : (
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
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
                    <div className="flex flex-col">
                      {(userData?.displayName || user.displayName) && (
                        <p className="font-medium text-sm">
                          {userData?.displayName || user.displayName}
                        </p>
                      )}
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      router.push("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
