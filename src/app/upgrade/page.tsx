"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Rocket, Shield, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

const LOOKUP_KEY = process.env.NEXT_PUBLIC_STRIPE_LOOKUP_KEY || "Pro-a746dd1"; // Fallback lookup key
const PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1SqtVBKUNDmoEPuuxeeZQzXK"; // Live price ID from env

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
          priceId: PRICE_ID,
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

      <div className="container relative z-10 max-w-6xl py-20 px-4 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 justify-center max-w-4xl mx-auto"
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
                      Unlimited interviews
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
                    className="w-full h-11 text-base font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF8E53] hover:to-[#FF6B6B] text-white border-none shadow-[0_10px_20px_-10px_rgba(255,107,107,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(255,107,107,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => router.push("/my-progress")}
          >
            <ArrowLeft className="size-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to my progress
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
