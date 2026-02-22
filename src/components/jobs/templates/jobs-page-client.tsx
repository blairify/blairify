"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/lib/services/auth/auth";

interface JobsPageClientProps {
  user: UserData;
}

export function JobsPageClient({ user: _user }: JobsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center overflow-auto">
          <Image
            src="/assets/under-construction-building-site-illustration-svg-download-png-3518829.webp"
            alt="Page under construction"
            width={400}
            height={400}
            className="max-w-[220px] sm:max-w-[320px] mb-6"
            priority
          />
          <Typography.Body color="secondary" className="max-w-md mb-6">
            We&apos;re building something great. The Jobs page will be available
            soon with curated tech opportunities from top companies.
          </Typography.Body>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </main>
      </div>
    </div>
  );
}
