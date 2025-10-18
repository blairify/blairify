"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import JobList from "@/components/organisms/job-list";

export default function JobMarketPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <section className="relative py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Explore Programming Jobs
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Discover the latest active programming roles from top companies
                around the world. Filter by keyword, page size, and find your
                next opportunity.
              </p>
            </div>
          </section>

          {/* Jobs Section */}
          <section className="container mx-auto px-6">
            <JobList initialQuery="developer" initialPerPage={50} />
          </section>
        </main>
      </div>
    </div>
  );
}
