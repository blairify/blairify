"use client";
import {
  Cookie,
  Copyright,
  Database,
  FileText,
  Instagram,
  Linkedin,
  Lock,
  Scale,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { SiX } from "react-icons/si";
import { Typography } from "../atoms/typography";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy", icon: Lock },
    { href: "/terms-of-service", label: "Terms of Service", icon: FileText },
    { href: "/cookie-policy", label: "Cookie Policy", icon: Cookie },
    { href: "/gdpr-rights", label: "GDPR/RODO Rights", icon: Shield },
    {
      href: "/data-processing-agreement",
      label: "Data Processing",
      icon: Database,
    },
    { href: "/legal-notice", label: "Legal Notice", icon: Scale },
  ];

  const socialLinks = [
    {
      href: "https://www.instagram.com/blairtalk",
      label: "Blairify on Instagram",
      icon: Instagram,
    },
    {
      href: "https://x.com/BlairifyTeam",
      label: "Blairify on X (Twitter)",
      icon: SiX,
    },
    {
      href: "https://www.linkedin.com/company/blairify",
      label: "Blairify on LinkedIn",
      icon: Linkedin,
    },
  ] as const;

  return (
    <footer
      className="bg-[color:var(--card)] text-[color:var(--muted-foreground)] border-t border-[color:var(--border)] transition-colors duration-300 mt-auto"
      data-analytics-id="home-footer"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        {/* Top Section: Brand + Links + Badges */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6">
          {/* Brand + Legal Links */}
          <div className="w-full flex flex-col items-center lg:items-start gap-4 sm:gap-6">
            {/* Legal Links */}
            <div className="grid w-full grid-cols-3 justify-items-center gap-x-3 gap-y-2 sm:grid-cols-3 sm:justify-items-start sm:gap-x-6 lg:w-auto lg:grid-cols-3">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 py-2 text-xs sm:text-sm hover:text-[color:var(--foreground)] transition-colors touch-manipulation underline-offset-4 hover:underline"
                  >
                    <Icon className="hidden sm:block size-4 flex-shrink-0" />
                    <Typography.Caption
                      color="secondary"
                      className="whitespace-nowrap"
                    >
                      {link.label}
                    </Typography.Caption>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 py-2 transition-colors touch-manipulation underline-offset-4 hover:underline"
            >
              <Typography.Caption color="secondary">
                Tech News & Blog
              </Typography.Caption>
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center lg:justify-end">
              <Typography.Caption color="secondary">
                BY ENGINEERS FOR ENGINEERS
              </Typography.Caption>
              <Typography.Caption color="secondary">
                support@blairify.com
              </Typography.Caption>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright, Contact & Social */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 pt-2 sm:pt-3 text-xs sm:text-sm">
          <div className="flex flex-row items-center gap-2 text-center sm:text-left">
            <Copyright className="size-4" />
            <Typography.Caption color="secondary">
              {currentYear} Blairify. All rights reserved.
            </Typography.Caption>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((socialLink) => {
              const Icon = socialLink.icon;
              return (
                <Link
                  key={socialLink.href}
                  href={socialLink.href}
                  aria-label={socialLink.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--background)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors touch-manipulation"
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
