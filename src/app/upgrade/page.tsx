"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Rocket, Shield, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

const LOOKUP_KEY = "Pro-a746dd1"; // Matching what the user provided

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function UpgradePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success) {
      toast.success("Subscription successful! Welcome to Pro.");
    }
    if (canceled) {
      toast.error("Subscription canceled. No charges were made.");
    }
  }, [success, canceled]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      router.push("/auth/login?redirect=/upgrade");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          lookupKey: LOOKUP_KEY,
          email: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create portal session");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const isPro =
    userData?.subscription?.plan === "pro" &&
    userData?.subscription?.status === "active";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-bounce duration-[10s]" />
        <div className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="container relative z-10 max-w-6xl py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Typography.Heading1 className="mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Upgrade Your Career Journey
          </Typography.Heading1>
          <Typography.Body className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get unlimited mock interviews, advanced AI analysis, and
            personalized career roadmaps to land your dream job faster.
          </Typography.Body>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 justify-center"
        >
          {/* Free Plan */}
          <motion.div variants={itemVariants}>
            <Card className="group flex flex-col h-full border-border/40 bg-card/40 backdrop-blur-md transition-all duration-300 hover:border-border/80 hover:shadow-xl hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for periodic practice</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    $0
                  </span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>2 interviews per 15 mins</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>Basic AI feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>Standard question bank</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full opacity-60"
                  disabled
                >
                  Current Plan
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div variants={itemVariants}>
            <Card className="group flex flex-col h-full border-primary/40 bg-primary/5 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-primary/10 transition-all duration-500 hover:border-primary hover:shadow-primary/20 hover:-translate-y-2 lg:scale-105">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider rounded-bl-lg">
                MOST POPULAR
              </div>
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Pro{" "}
                  <Zap className="h-5 w-5 fill-primary text-primary animate-pulse" />
                </CardTitle>
                <CardDescription>For serious job seekers</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    $5
                  </span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground">
                      Unlimited mock interviews
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Advanced AI performance analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Personalized skill roadmaps</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Early access to new features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {isPro ? (
                  <Button
                    variant="outline"
                    className="w-full h-11 transition-all hover:bg-primary hover:text-primary-foreground border-primary/20"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </>
                    )}
                  </Button>
                )}
                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure payment processing by Stripe
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
