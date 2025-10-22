"use client";

import { useCallback, useEffect, useState } from "react";

interface UseIsMobileReturn {
  isMobile: boolean;
  isLoading: boolean;
}

// Debounce function to prevent rapid state updates
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: T) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useIsMobile = (): UseIsMobileReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkIsMobile = useCallback(() => {
    // Check using media query
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Check using user agent (additional detection)
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      "android",
      "webos",
      "iphone",
      "ipad",
      "ipod",
      "blackberry",
      "windows phone",
      "mobile",
    ];

    const isMobileUA = mobileKeywords.some((keyword) =>
      userAgent.includes(keyword),
    );

    // Combine both checks - prioritize media query but consider user agent
    const isMobileDevice =
      mediaQuery.matches || (isMobileUA && window.innerWidth <= 768);

    setIsMobile((prev) => {
      if (prev !== isMobileDevice) {
        setIsLoading(false);
        return isMobileDevice;
      }
      setIsLoading(false);
      return prev;
    });
  }, []);

  // Debounced version to prevent rapid updates
  const debouncedCheckIsMobile = useCallback(debounce(checkIsMobile, 100), []);

  useEffect(() => {
    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = () => debouncedCheckIsMobile();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Listen for window resize with debouncing
    window.addEventListener("resize", debouncedCheckIsMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener("resize", debouncedCheckIsMobile);
    };
  }, [checkIsMobile, debouncedCheckIsMobile]);

  return {
    isMobile,
    isLoading,
  };
};

export default useIsMobile;
