"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSuperAdmin } from "@/lib/auth-roles";
import { useAuth } from "@/providers/auth-provider";

interface CacheStats {
  totalJobs: number;
  lastScrape: string | null;
  cacheAge: number;
  status: string;
}

export default function JobsCachePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin(user))) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load cache stats
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/jobs/scrape");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load cache statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isSuperAdmin(user)) {
      loadStats();
    }
  }, [user, loadStats]);

  const handleScrape = async () => {
    if (
      !confirm(
        "This will scrape jobs from Muse API and update the cache. Continue?",
      )
    ) {
      return;
    }

    try {
      setIsScraping(true);
      toast.info("Starting job scrape... This may take a few minutes.");

      const response = await fetch("/api/jobs/scrape", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Successfully scraped ${data.jobsScraped} jobs in ${data.duration}!`,
        );
        loadStats();
      } else {
        toast.error("Failed to scrape jobs");
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to trigger job scrape");
    } finally {
      setIsScraping(false);
    }
  };

  if (loading || !user || !isSuperAdmin(user)) {
    return null;
  }

  const cacheAgeHours = stats?.cacheAge || 0;
  const isStale = cacheAgeHours > 24;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Jobs Cache Management</h1>
                <p className="text-muted-foreground">
                  Monitor and manage the job listings cache
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={loadStats}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh Stats
                </Button>
                <Button onClick={handleScrape} disabled={isScraping}>
                  <Database
                    className={`h-4 w-4 mr-2 ${isScraping ? "animate-pulse" : ""}`}
                  />
                  {isScraping ? "Scraping..." : "Scrape Now"}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Cached Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stats?.totalJobs.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cache Age
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : `${cacheAgeHours.toFixed(1)}h`}
                  </div>
                  {isStale && (
                    <Badge variant="destructive" className="mt-2">
                      Stale
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {stats?.status === "success" ? (
                      <Badge variant="default">Success</Badge>
                    ) : stats?.status === "failed" ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Last Scrape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {isLoading
                      ? "..."
                      : stats?.lastScrape
                        ? new Date(stats.lastScrape).toLocaleString()
                        : "Never"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle>About Jobs Cache</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How it works</h3>
                  <p className="text-sm text-muted-foreground">
                    The jobs cache system scrapes programming jobs from The Muse
                    API every 6 hours and stores them in Firestore. This
                    provides fast job listings on the frontend without hitting
                    external APIs repeatedly.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Automatic Scraping</h3>
                  <p className="text-sm text-muted-foreground">
                    A cron job runs every 6 hours (configured in vercel.json) to
                    automatically refresh the cache. You can also manually
                    trigger a scrape using the button above.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cache Expiration</h3>
                  <p className="text-sm text-muted-foreground">
                    Cached jobs expire after 24 hours. Expired jobs are
                    automatically cleared during the next scrape. The cache is
                    considered stale if it's older than 24 hours.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Performance Benefits</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Instant job listings (no API delays)</li>
                    <li>Reduced external API calls</li>
                    <li>Better filtering and search capabilities</li>
                    <li>Consistent user experience</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Scrape Log */}
            {isScraping && (
              <Card>
                <CardHeader>
                  <CardTitle>Scraping in Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Fetching jobs from The Muse API... This may take 1-2
                      minutes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
