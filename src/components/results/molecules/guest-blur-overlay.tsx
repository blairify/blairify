"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";

interface GuestBlurOverlayProps {
  children: React.ReactNode;
  enabled: boolean;
  className?: string;
  message?: string;
}

function useSignupHref(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const returnTo = search ? `${pathname}?${search}` : pathname;
  return `/auth?mode=register&redirect=${encodeURIComponent(returnTo)}`;
}

export function GuestBlurOverlay({
  children,
  enabled,
  className,
  message = "Create a free account to unlock your full results",
}: GuestBlurOverlayProps) {
  const signupHref = useSignupHref();

  if (!enabled) return <>{children}</>;

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="select-none pointer-events-none" aria-hidden="true" inert>
        <div className="blur-sm opacity-60">{children}</div>
      </div>

      <section
        aria-label="Content locked"
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-[1px] rounded-xl"
      >
        <div className="flex flex-col items-center gap-2 max-w-xs text-center">
          <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="size-5 text-primary" aria-hidden="true" />
          </div>
          <Typography.CaptionBold>{message}</Typography.CaptionBold>
        </div>
        <Button asChild size="sm" className="mt-1">
          <Link href={signupHref}>Sign up free</Link>
        </Button>
      </section>
    </div>
  );
}
