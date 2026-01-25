"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";

type WalkthroughStepId =
  | "start-interview"
  | "real-offers"
  | "progress-achievements"
  | "interview-history"
  | "profile-settings";

interface WalkthroughStep {
  id: WalkthroughStepId;
  selector: string;
  headline: string;
  body: string;
}

const FORCE_KEY = "blairify-dashboard-tour-force";

function getRect(element: Element | null) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return rect;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function DashboardWalkthrough(): ReactNode {
  const { user, userData, refreshUserData } = useAuth();
  const searchParams = useSearchParams();

  const steps = useMemo<WalkthroughStep[]>(
    () => [
      {
        id: "start-interview",
        selector: "[data-tour='start-interview']",
        headline: "Where the Magic (and Sweating) Happens",
        body: "Pick one of our preset roles or paste a link to a job ad you're eyeing. Our AI will read the description and grill you on exactly what they require. Better to sweat here than in front of the real recruiter, right?",
      },
      {
        id: "real-offers",
        selector: "[data-tour='real-offers']",
        headline: "The Real Deal 🎯",
        body: "We pull the freshest job listings from top sites. See something you like? Click it and practice specifically for that offer. It’s like getting the exam questions before you even walk into the room.",
      },
      {
        id: "progress-achievements",
        selector: "[data-tour='my-progress']",
        headline: "Leveling Up 🚀",
        body: "Charts, stats, and shiny badges. Nothing beats seeing your XP bar grow and knowing you are getting technically sharper every day.",
      },
      {
        id: "interview-history",
        selector: "[data-tour='interview-history']",
        headline: "Your Flight Recorder ✈️",
        body: "All your interview reports land here. Come back to analyze the feedback, see what crashed and burned, and make sure you never make the same mistake twice.",
      },
      {
        id: "profile-settings",
        selector: "[data-tour='profile-settings']",
        headline: "Mission Control ⚙️",
        body: "Upload your CV, tweak your preferences, and manage your data. A bit boring, sure, but necessary to keep the engine running smoothly.",
      },
    ],
    [],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const activeStep = steps[stepIndex] ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userData) return;

    const forced = window.localStorage.getItem(FORCE_KEY) === "1";
    const forcedByQuery = searchParams.get("tour") === "1";

    const shouldAutoStart =
      userData.onboardingCompleted === true &&
      userData.hasSeenDashboardTour !== true;

    if (!forced && !forcedByQuery && !shouldAutoStart) return;

    setIsOpen(true);
    setStepIndex(0);

    if (forced) {
      window.localStorage.removeItem(FORCE_KEY);
    }
  }, [searchParams, userData]);

  useEffect(() => {
    if (!isOpen) return;
    if (!activeStep) return;

    const update = () => {
      const element = document.querySelector(activeStep.selector);
      if (!element) {
        setRect(null);
        return;
      }

      const nextRect = getRect(element);
      if (!nextRect) {
        setRect(null);
        return;
      }

      element.scrollIntoView({ block: "center", inline: "center" });
      setRect(nextRect);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [activeStep, isOpen]);

  const complete = useCallback(
    async (_reason: "skip" | "done") => {
      setIsOpen(false);

      if (!user) return;

      try {
        await DatabaseService.updateUserProfile(user.uid, {
          hasSeenDashboardTour: true,
        });
        await refreshUserData();
      } catch {
        console.warn("Failed to persist dashboard walkthrough completion");
      }
    },
    [refreshUserData, user],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void complete("skip");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete, isOpen]);

  const totalSteps = steps.length;

  if (!isOpen || !activeStep || !portalTarget) return null;

  const viewportW = typeof window === "undefined" ? 0 : window.innerWidth;
  const viewportH = typeof window === "undefined" ? 0 : window.innerHeight;

  const padding = 10;
  const hole = rect
    ? {
        x: clamp(rect.left - padding, 0, Math.max(0, viewportW - 1)),
        y: clamp(rect.top - padding, 0, Math.max(0, viewportH - 1)),
        w: clamp(rect.width + padding * 2, 0, viewportW),
        h: clamp(rect.height + padding * 2, 0, viewportH),
        r: 12,
      }
    : null;

  const popover = (() => {
    if (!hole) {
      return {
        top: 96,
        left: 24,
        width: 420,
      };
    }

    const width = 420;
    const gap = 16;

    const preferRight = hole.x + hole.w + gap + width <= viewportW - 24;
    const left = preferRight
      ? hole.x + hole.w + gap
      : Math.max(24, hole.x - gap - width);

    const top = clamp(
      hole.y + hole.h / 2 - 120,
      80,
      Math.max(80, viewportH - 280),
    );

    return { top, left, width };
  })();

  const portal = createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close walkthrough"
        onClick={() => void complete("skip")}
      />

      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="h-full w-full"
          width={viewportW}
          height={viewportH}
          aria-hidden="true"
        >
          <defs>
            <mask id="dashboard-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {hole && (
                <rect
                  x={hole.x}
                  y={hole.y}
                  width={hole.w}
                  height={hole.h}
                  rx={hole.r}
                  ry={hole.r}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#dashboard-tour-mask)"
          />
        </svg>
      </div>

      <div
        className="absolute z-10 rounded-xl border bg-background shadow-lg"
        style={{
          top: popover.top,
          left: popover.left,
          width: popover.width,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard walkthrough"
      >
        <div className="p-4 space-y-3">
          <div className="text-xs text-muted-foreground">
            Step {stepIndex + 1} of {totalSteps}
          </div>
          <div className="text-base font-semibold text-foreground">
            {activeStep.headline}
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {activeStep.body}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStepIndex((p) => Math.max(0, p - 1))}
              disabled={stepIndex === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void complete("skip")}
              >
                Close
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const isLast = stepIndex === totalSteps - 1;
                  if (isLast) {
                    void complete("done");
                    return;
                  }
                  setStepIndex((p) => Math.min(totalSteps - 1, p + 1));
                }}
              >
                {stepIndex === totalSteps - 1 ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  );

  return portal as ReactNode;
}
