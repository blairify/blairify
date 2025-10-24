"use client";
import { Cookie, FileText, Lock, Scale, Shield } from "lucide-react";
import Link from "next/link";

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

  return (
    <footer className="bg-[color:var(--background)] text-[color:var(--muted-foreground)] border-t border-[color:var(--border)] transition-colors duration-300 mt-auto">
      {/* 
        MOBILE-FIRST FOOTER DESIGN:
        - Responsive padding: px-4 → px-6 → px-8
        - Vertical spacing adapts to screen size
        - Touch-friendly link targets (44px minimum)
        - Proper content hierarchy for mobile
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        {/* 
          MAIN CONTENT SECTION:
          - Mobile: Stacked layout (flex-col)
          - Desktop: Horizontal layout (lg:flex-row)
          - Responsive gaps and alignment
        */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 mb-6">
          {/* 
            BRAND AND NAVIGATION:
            - Logo prominently displayed on mobile
            - Legal links in responsive grid
            - Touch-friendly spacing
          */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 w-full lg:w-auto">
            <h3 className="font-extrabold font-stretch-extra-expanded text-lg sm:text-xl text-[color:var(--foreground)] whitespace-nowrap">
              Blairify
            </h3>

            {/* 
              LEGAL LINKS - MOBILE OPTIMIZED:
              - Grid layout for better mobile organization
              - Larger touch targets (min 44px height)
              - Responsive text sizing
            */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-2 text-sm sm:text-base lg:text-sm w-full lg:w-auto">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-[color:var(--foreground)] transition-colors flex items-center gap-2 py-2 lg:py-0 touch-manipulation"
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 flex-shrink-0" />
                    <span className="text-xs sm:text-sm lg:text-xs">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 
            COMPLIANCE BADGES:
            - Centered on mobile for prominence
            - Responsive sizing and spacing
            - Clear visual hierarchy
          */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end w-full lg:w-auto">
            <span className="flex items-center gap-1.5 sm:gap-2 bg-[color:var(--muted)] bg-opacity-30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm whitespace-nowrap">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 bg-[color:var(--muted)] bg-opacity-30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm whitespace-nowrap">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              SSL Secured
            </span>
          </div>
        </div>

        {/* 
          FOOTER BOTTOM SECTION:
          - Copyright and contact info
          - Responsive layout and typography
          - Touch-friendly email link
        */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[color:var(--border)] text-xs sm:text-sm">
          <p className="text-center sm:text-left">
            © {currentYear} Mateusz Jakubowski. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            <span className="block sm:inline">Data Protection: </span>
            <Link
              href="mailto:blairiy.team@gmail.com"
              className="underline hover:text-[color:var(--foreground)] transition-colors py-1 px-1 -mx-1 touch-manipulation"
            >
              blairiy.team@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
