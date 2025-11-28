"use client";

import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import React, { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await fetch(
        "https://assets.mailerlite.com/jsonp/1884485/forms/169514911678859248/subscribe",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "fields[email]": email,
            "ml-submit": "1",
            anticsrf: "true",
          }),
        },
      );

      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Subscription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section
        className="py-16 bg-[color:var(--secondary)]"
        data-analytics-id="home-newsletter"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Typography.Heading2 className="text-2xl font-bold mb-2">
              Thank you for subscribing!
            </Typography.Heading2>
            <Typography.Body className="text-muted-foreground">
              You'll be the first to know about our latest features and updates.
            </Typography.Body>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 bg-[color:var(--secondary)]"
      aria-labelledby="newsletter-heading"
      data-analytics-id="home-newsletter"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 sm:mb-6">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <Typography.Heading2
            id="newsletter-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4"
          >
            Join Our Newsletter
          </Typography.Heading2>
          <Typography.Body className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Stay updated with new features being deployed daily! Get exclusive
            insights, tips, and be the first to know about exciting updates to
            our platform.
          </Typography.Body>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto"
          >
            <label htmlFor="email-input" className="sr-only">
              Email address
            </label>
            <Input
              id="email-input"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
              disabled={loading}
              aria-describedby="email-description"
              aria-invalid={false}
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="group whitespace-nowrap w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base px-4 sm:px-6"
            >
              {loading ? (
                <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <Typography.Body
            id="email-description"
            className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4 sm:px-0"
          >
            No spam, unsubscribe at any time. We respect your privacy.
          </Typography.Body>
        </div>
      </div>
    </section>
  );
}
