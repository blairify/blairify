"use client";
import {
  Cookie,
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
    { href: "/data-processing-agreement", label: "DPA", icon: FileText },
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl bg-[color:var(--muted)]/10">
        {/* Top Section: Brand + Links + Badges */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6">
          {/* Brand + Legal Links */}
          <div className="w-full flex flex-col items-center lg:items-start gap-4 sm:gap-6">
            {/* Brand */}
            <Typography.Heading3 className="whitespace-nowrap text-center lg:text-left">
              Blairify
            </Typography.Heading3>

            {/* Legal Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 justify-items-center sm:justify-items-start lg:flex lg:flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-2 text-sm sm:text-base w-full lg:w-auto">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-[color:var(--foreground)] transition-colors flex items-center gap-2 py-2 lg:py-0 touch-manipulation"
                  >
                    <Icon className="size-3 sm:size-4 lg:w-3 lg:h-3 flex-shrink-0" />
                    <span className="text-xs sm:text-sm lg:text-xs">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end w-full lg:w-auto">
            <span className="flex items-center gap-1.5 sm:gap-2 bg-[color:var(--muted)] bg-opacity-30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm whitespace-nowrap">
              <Shield className="size-3 sm:size-4" />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 bg-[color:var(--muted)] bg-opacity-30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm whitespace-nowrap">
              <Lock className="size-3 sm:size-4" />
              SSL Secured
            </span>
          </div>
        </div>

        {/* Bottom Section: Copyright, Contact & Social */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[color:var(--border)] text-xs sm:text-sm">
          <Typography.Caption
            color="secondary"
            className="text-center sm:text-left"
          >
            © {currentYear} Blairify. All rights reserved.
          </Typography.Caption>
          <div className="flex items-center gap-3">
            {socialLinks.map((socialLink) => {
              const Icon = socialLink.icon;
              return (
                <Link
                  key={socialLink.href}
                  href={socialLink.href}
                  aria-label={socialLink.label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors touch-manipulation"
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </div>
          <Typography.Caption
            color="secondary"
            className="text-center sm:text-right"
          >
            <span className="block sm:inline">Data Protection: </span>
            <Link
              href="mailto:blairiy.team@gmail.com"
              className="underline hover:text-[color:var(--foreground)] transition-colors py-1 px-1 -mx-1 touch-manipulation"
            >
              blairify.team@gmail.com
            </Link>
          </Typography.Caption>
        </div>
      </div>
    </footer>
  );
}
