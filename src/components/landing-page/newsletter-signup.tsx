"use client";

import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Thank you for subscribing!
            </h2>
            <p className="text-muted-foreground">
              You'll be the first to know about our latest features and updates.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary/5">
      {/* 
        RESPONSIVE CONTAINER:
        - Responsive padding adapts to screen size
        - Container provides consistent max-width
        - Centered layout with proper spacing
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 
            RESPONSIVE ICON:
            - Size adapts: w-12 h-12 → w-16 h-16
            - Consistent spacing and visual hierarchy
          */}
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 sm:mb-6">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          {/* 
            RESPONSIVE TYPOGRAPHY:
            - Heading scales: text-xl → text-2xl → text-3xl
            - Description adapts: text-sm → text-base → text-lg
            - Responsive spacing between elements
          */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Stay updated with new features being deployed daily! Get exclusive
            insights, tips, and be the first to know about exciting updates to
            our platform.
          </p>

          {/* 
            RESPONSIVE FORM LAYOUT:
            - Mobile: Stacked layout (flex-col)
            - Tablet+: Side-by-side (sm:flex-row)
            - Input takes available space (flex-1)
            - Button maintains fixed width on desktop
          */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
            />

            {/* 
              RESPONSIVE BUTTON:
              - Full width on mobile (w-full)
              - Auto width on desktop (sm:w-auto)
              - Touch-friendly sizing
            */}
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="group whitespace-nowrap w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base px-4 sm:px-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* 
            RESPONSIVE DISCLAIMER:
            - Smaller text on mobile for space efficiency
            - Proper spacing and readability
          */}
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4 sm:px-0">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
