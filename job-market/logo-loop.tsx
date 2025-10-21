"use client";

import Image from "next/image";
import type React from "react";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Logo {
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
}

interface LogoLoopProps {
  logos: Logo[];
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  className?: string;
}

export default function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  logoHeight = 48,
  gap = 40,
  pauseOnHover = true,
  scaleOnHover = true,
  fadeOut = true,
  fadeOutColor = "#000000",
  ariaLabel = "Logo carousel",
  className = "",
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  const animationDuration = `${(logos.length * speed) / 10}s`;
  const animationDirection = direction === "left" ? "normal" : "reverse";

  return (
    <section
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: `${logoHeight + 40}px` }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      aria-label={ariaLabel}
    >
      {fadeOut && (
        <>
          <div
            className="absolute left-0 top-0 z-10 h-full w-20 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 z-10 h-full w-20 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}

      <div
        className="flex items-center h-full"
        style={{
          animation: `logoLoop ${animationDuration} linear infinite ${animationDirection}`,
          animationPlayState: isPaused ? "paused" : "running",
          gap: `${gap}px`,
          width: "fit-content",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.title || logo.alt || logo.src || "logo"}-${index}`}
            className={cn(
              "flex-shrink-0 flex items-center justify-center transition-transform duration-200",
              scaleOnHover && "hover:scale-110",
            )}
            style={{
              height: `${logoHeight}px`,
              minWidth: `${logoHeight * 1.2}px`,
            }}
          >
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-full w-full"
                title={logo.title || logo.alt}
              >
                {logo.node ? (
                  <div style={{ fontSize: `${logoHeight * 0.5}px` }}>
                    {logo.node}
                  </div>
                ) : logo.src ? (
                  <Image
                    src={logo.src || "/placeholder.svg"}
                    alt={logo.alt || ""}
                    width={logoHeight * 1.1}
                    height={logoHeight * 0.7}
                    style={{
                      maxHeight: `${logoHeight * 0.7}px`,
                      maxWidth: `${logoHeight * 1.1}px`,
                      width: "auto",
                      height: "auto",
                    }}
                    className="object-contain"
                  />
                ) : null}
              </a>
            ) : logo.node ? (
              <div style={{ fontSize: `${logoHeight * 0.5}px` }}>
                {logo.node}
              </div>
            ) : logo.src ? (
              <Image
                src={logo.src || "/placeholder.svg"}
                alt={logo.alt || ""}
                width={logoHeight * 1.1}
                height={logoHeight * 0.7}
                style={{
                  maxHeight: `${logoHeight * 0.7}px`,
                  maxWidth: `${logoHeight * 1.1}px`,
                  width: "auto",
                  height: "auto",
                }}
                className="object-contain"
              />
            ) : null}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes logoLoop {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${100 / 2}%);
          }
        }
      `}</style>
    </section>
  );
}
