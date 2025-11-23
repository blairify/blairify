import type { Metadata } from "next";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// SEO Metadata for 404 page
export const metadata: Metadata = {
  title: "Page Not Found - 404 Error",
  description:
    "The page you're looking for doesn't exist. Return to Blairify homepage or explore our interview preparation platform.",
  robots: {
    index: false, // Don't index 404 pages
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <Card className="p-8 border-2 border-muted shadow-lg backdrop-blur-sm bg-card/50 animate-fade-in-up delay-100">
          <div className="space-y-6">
            {/* Error Code */}
            <div className="space-y-2">
              <Typography.Heading1
                className="text-primary/80 tracking-tight"
                aria-label="Error 404"
              >
                404
              </Typography.Heading1>
              <Separator className="w-24 mx-auto bg-primary/30" />
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <Typography.Heading2 className="text-foreground">
                Page Not Found
              </Typography.Heading2>
              <Typography.Body
                color="secondary"
                className="max-w-md mx-auto leading-relaxed"
              >
                The page you're looking for doesn't exist or has been moved to a
                different location.
              </Typography.Body>
            </div>

            {/* Action Buttons */}
            <nav
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              aria-label="Navigation options"
            >
              <Button asChild variant="default" size="lg" className="min-w-32">
                <Link href="/" aria-label="Return to homepage">
                  Back to Home
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-32 border-[color:var(--border)] text-[color:var(--foreground)] 
                hover:text-[color:var(--secondary)] hover:border-[color:var(--primary)] transition-colors"
              >
                <Link href="/dashboard" aria-label="Navigate to dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </nav>
          </div>
        </Card>

        {/* Support Link */}
        <div className="text-sm text-muted-foreground animate-fade-in-up delay-200">
          <p>
            If you believe this is an error, please{" "}
            <Link
              href="/support"
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              aria-label="Contact support team"
            >
              contact support
            </Link>{" "}
            or email us at{" "}
            <a
              href="mailto:blairify.team@gmail.com"
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              aria-label="Email support at blairify.team@gmail.com"
            >
              blairify.team@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
