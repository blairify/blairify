import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In or Create Account — Blairify",
  description:
    "Sign in to Blairify or create a free account to access AI-powered interview practice, curated job listings, and personalized career tools.",
  openGraph: {
    title: "Sign In or Create Account — Blairify",
    description:
      "Sign in to Blairify or create a free account to access AI-powered interview practice and curated job listings.",
    url: "https://blairify.com/auth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In or Create Account — Blairify",
    description:
      "Sign in to Blairify or create a free account to access AI-powered interview practice.",
  },
  alternates: {
    canonical: "https://blairify.com/auth",
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
