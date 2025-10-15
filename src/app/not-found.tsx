import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Error Content Card */}
        <Card className="p-8 border-2 border-muted shadow-lg backdrop-blur-sm bg-card/50 animate-fade-in-up delay-100 ">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-8xl md:text-9xl font-bold text-primary/80 tracking-tight">
                404
              </h1>
              <Separator className="w-24 mx-auto bg-primary/30" />
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                The page you're looking for doesn't exist or has been moved to a
                different location.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="default" size="lg" asChild className="min-w-32">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-w-32 hover:text-primary hover:border-primary"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Additional Help Text */}
        <div className="text-sm text-muted-foreground animate-fade-in-up delay-200">
          <p>
            If you believe this is an error, please{" "}
            <Link
              href="mailto:the-mockr-support@gmail.com"
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
