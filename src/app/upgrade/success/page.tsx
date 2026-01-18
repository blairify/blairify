"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUserData } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [pollMessage, setPollMessage] = useState(
    "Waiting for payment confirmation...",
  );
  const sessionId = searchParams.get("session_id");
  const pollCountRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/stripe/subscription-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (data.status === "active" && data.plan === "pro") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        await refreshUserData();
        setStatus("success");
        toast.success("Welcome to Pro! Your account has been upgraded.");
        return true;
      }

      if (data.status === "failed") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setStatus("error");
        toast.error(data.message || "Subscription activation failed.");
        return true;
      }

      setPollMessage(data.message || "Processing your subscription...");
      return false;
    } catch (error) {
      console.error("Status check error:", error);
      return false;
    }
  }, [user, refreshUserData]);

  useEffect(() => {
    if (!user || !sessionId) return;

    const startPolling = async () => {
      const isComplete = await checkSubscriptionStatus();
      if (isComplete) return;

      pollIntervalRef.current = setInterval(async () => {
        pollCountRef.current += 1;

        if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setStatus("error");
          toast.error(
            "Subscription verification timed out. Please refresh or contact support.",
          );
          return;
        }

        await checkSubscriptionStatus();
      }, POLL_INTERVAL_MS);
    };

    startPolling();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, sessionId, checkSubscriptionStatus]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background Decorative Elemets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {status === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center text-center max-w-md"
          >
            <div className="relative mb-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              />
            </div>
            <Typography.Heading2 className="text-2xl font-bold">
              Activating Your Pro Account
            </Typography.Heading2>
            <Typography.Body className="text-muted-foreground mt-3 text-lg">
              {pollMessage}
            </Typography.Body>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center max-w-md"
          >
            <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-destructive rotate-45" />
            </div>
            <Typography.Heading2 className="text-destructive text-2xl font-bold">
              Verification Failed
            </Typography.Heading2>
            <Typography.Body className="mt-3 mb-8 text-muted-foreground">
              We couldn't confirm your subscription. If you believe this is an
              error, please reach out to our support team.
            </Typography.Body>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/upgrade")}
            >
              Return to Pricing
            </Button>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="container max-w-xl relative z-10"
          >
            <Card className="border-primary/30 bg-card/50 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="h-12 w-12 text-primary/20" />
                </motion.div>
              </div>

              <CardHeader className="text-center pt-10 pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.5)]">
                    <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
                  </div>
                </motion.div>
                <CardTitle className="text-4xl font-extrabold tracking-tight">
                  You're Pro!
                </CardTitle>
                <Typography.Body className="text-muted-foreground text-lg px-8 mt-2">
                  Your journey to career excellence just got a major boost.
                  Welcome to the elite tier!
                </Typography.Body>
              </CardHeader>

              <CardContent className="space-y-8 px-8 pb-10">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-primary/5 p-5 rounded-2xl border border-primary/10"
                  >
                    <Typography.Caption className="text-primary font-bold uppercase tracking-widest text-[10px] mb-1 block">
                      Active Plan
                    </Typography.Caption>
                    <Typography.BodyBold className="text-xl">
                      Pro Member
                    </Typography.BodyBold>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10"
                  >
                    <Typography.Caption className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-1 block">
                      Billing Status
                    </Typography.Caption>
                    <Typography.BodyBold className="text-xl text-emerald-500 flex items-center gap-2">
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                      />
                      Active
                    </Typography.BodyBold>
                  </motion.div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    className="w-full text-lg h-14 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                    onClick={() => router.push("/configure")}
                  >
                    Start Your First Pro Interview
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-12 text-muted-foreground hover:text-foreground"
                    onClick={async () => {
                      const res = await fetch("/api/stripe/portal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user?.uid,
                          email: user?.email,
                        }),
                      });
                      const d = await res.json();
                      if (d.url) window.location.href = d.url;
                    }}
                  >
                    View Billing & Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-muted-foreground text-sm mt-8"
            >
              Redirecting to dashboard in a moment... or just click above!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
