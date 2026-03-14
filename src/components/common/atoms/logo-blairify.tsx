"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

type LogoVariant = "iconOnly" | "textOnly" | "iconText" | "iconTextVertical";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  textClassName?: string;
  iconSize?: number;
}

const ICON_PATH = "/icon0.svg";

export const LogoText = () => (
  <Typography.Heading3>Blairify</Typography.Heading3>
);

export default function Logo({
  variant = "iconText",
  className = "",
  textClassName = "",
  iconSize = 22,
}: LogoProps) {
  const renderIcon = () => (
    <Image
      src={ICON_PATH}
      alt="Blairify logo icon"
      width={iconSize}
      height={iconSize}
      className="shrink-0 mr-1"
      priority
    />
  );

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
