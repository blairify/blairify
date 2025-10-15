"use client";

import Link from "next/link";

interface LogoProps {
  variant?: "stacked" | "minimal";
  className?: string;
  repeatCount?: number;
}

const DEFAULT_REPEAT_COUNT = 7;

export const LogoText = () => (
  <>
    the<span className="!text-primary dark:text-foreground">:</span>mockr
  </>
);

export default function Logo({
  variant = "minimal",
  className = "",
  repeatCount = DEFAULT_REPEAT_COUNT,
}: LogoProps) {
  const linkClasses =
    `!flex !flex-col !items-center !justify-center ${className}`.trim();
  const logoTextClasses = "!font-stretch-extra-expanded !font-extrabold";

  if (variant === "minimal") {
    return (
      <Link href="/" className={linkClasses}>
        <span className={logoTextClasses}>
          <LogoText />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className={linkClasses}>
      <div
        className={`${logoTextClasses} !flex !flex-col !items-center !justify-center !mx-auto !text-6xl`}
      >
        {Array.from({ length: repeatCount }, (_, i) => {
          const stableKey = `logo-element-${repeatCount}-position-${i + 1}`;
          return (
            <span key={stableKey}>
              <LogoText />
            </span>
          );
        })}
      </div>
    </Link>
  );
}
