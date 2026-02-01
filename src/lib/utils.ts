import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppUrl() {
  // Local development takes priority
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL_LOCAL || "http://localhost:3000";
  }

  // Vercel preview/development deployments
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
  ) {
    return (
      process.env.NEXT_PUBLIC_APP_URL_DEV ||
      (process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "https://blairify-git-payment-gate-blairifys-projects.vercel.app")
    );
  }

  // Production
  return process.env.NEXT_PUBLIC_APP_URL || "https://blairify.com";
}
