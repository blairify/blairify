import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roadmap | Blairify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RoadmapPage() {
  const _user = await requireAuth("/roadmap");

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">
            Roadmap Temporarily Disabled
          </h1>
          <p className="text-muted-foreground max-w-md">
            The roadmap feature is currently under maintenance. We'll be back as
            soon with improvements!
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}
