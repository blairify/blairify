"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";

type LogoVariant =
  | "iconOnly"
  | "textOnly"
  | "iconText"
  | "iconTextVertical"
  | "transparent";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  textClassName?: string;
  iconSize?: number;
}

const ICON_PATH = "/icon0.svg";
const TRANSPARENT_ICON_PATH_DARK = "/assets/white-black-logo.svg";
const TRANSPARENT_ICON_PATH_LIGHT = "/assets/black-white-logo.svg";

export const LogoText = () => (
  <Typography.Heading3>Blairify</Typography.Heading3>
);

export default function Logo({
  variant = "iconText",
  className = "",
  textClassName = "",
  iconSize = 22,
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the current theme (dark/light)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = mounted && currentTheme === "dark";

  const renderIcon = () => {
    let iconPath = ICON_PATH;

    if (variant === "transparent") {
      iconPath = isDarkMode
        ? TRANSPARENT_ICON_PATH_DARK
        : TRANSPARENT_ICON_PATH_LIGHT;
    }

    return (
      <Image
        key={iconPath}
        src={iconPath}
        alt="Blairify logo icon"
        width={iconSize}
        height={iconSize}
        className={clsx(
          "shrink-0 mr-1",
          variant === "transparent" && "object-contain",
        )}
        priority
      />
    );
  };

  const renderText = () => (
    <div className={clsx(textClassName)}>
      <LogoText />
    </div>
  );

  const content = (() => {
    switch (variant) {
      case "iconOnly":
        return renderIcon();
      case "textOnly":
        return renderText();
      case "iconTextVertical":
        return (
          <div className="flex flex-col items-center gap-1">
            {renderIcon()}
            {renderText()}
          </div>
        );
      case "transparent":
        return renderIcon();
      default:
        return (
          <div className="flex items-center gap-2">
            {renderIcon()}
            {renderText()}
          </div>
        );
    }
  })();

  return (
    <Link
      aria-label="Home"
      href="/"
      className={clsx("inline-flex items-center justify-center", className)}
    >
      {content}
    </Link>
  );
}
