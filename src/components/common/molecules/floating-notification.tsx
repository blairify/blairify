"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

interface FloatingNotificationProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function FloatingNotification({
  show,
  onClose,
  children,
}: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      // Delay hiding for animation
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-x-0 bottom-4 z-50 px-4">
      <div className="flex justify-center animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-xl max-w-4xl w-full sm:w-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl sm:rounded-2xl blur-xl" />

          <div className="relative px-3 py-2.5 sm:px-5 sm:py-4 flex items-start gap-2 sm:gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0">{children}</div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 size-5 sm:size-6 rounded-full hover:bg-amber-500/20 transition-colors flex items-center justify-center group"
              aria-label="Dismiss notification"
            >
              <X className="size-3 sm:size-4 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
