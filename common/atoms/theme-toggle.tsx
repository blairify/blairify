"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // Cycle: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getTooltipText = () => {
    if (!mounted) return "Toggle Theme";
    if (theme === "system") {
      return `System (${systemTheme === "dark" ? "Dark" : "Light"})`;
    }
    return theme === "dark" ? "Dark Mode" : "Light Mode";
  };

  const getIcon = () => {
    if (!mounted) {
      return <Sun className="size-[1.2rem]" />;
    }

    if (theme === "system") {
      return <Monitor className="size-[1.2rem]" />;
    }

    return theme === "dark" ? (
      <Moon className="size-[1.2rem]" />
    ) : (
      <Sun className="size-[1.2rem]" />
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle Theme"
            className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            onClick={cycleTheme}
          >
            {getIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
