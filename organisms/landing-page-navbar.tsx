"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/atoms/logo-the-mockr";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
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
import { AvatarIconDisplay } from "../molecules/avatar-icon-selector";

interface NavbarProps {
  scrollThreshold?: number;
}

export default function Navbar({ scrollThreshold = 100 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userData, signOut, loading } = useAuth();

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
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
                    <Link href="/dashboard" className="flex items-center gap-2">
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
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
