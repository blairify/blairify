"use client";

import { Calendar, Clock, Eye, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";
import type { InterviewSession } from "@/types/firestore";

interface HistoryContentProps {
  user: UserData;
}

export function HistoryContent({ user }: HistoryContentProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userSessions = await DatabaseService.getUserSessions(user.uid, 50);
      setSessions(userSessions);
      setFilteredSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const capitalizeTitle = (title: string) => {
    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Typography.Body color="secondary">
              Loading interview history...
            </Typography.Body>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background animate-in fade-in duration-700">
      <div className="relative border-b bg-card overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 text-center md:text-left">
            <div className="space-y-2">
              <Typography.Heading1 className="text-4xl font-black text-foreground tracking-tight">
                Previous <span className="text-primary">Sessions</span>
              </Typography.Heading1>
              <Typography.Body className="text-muted-foreground text-lg">
                A comprehensive record of your technical interview performances.
              </Typography.Body>
            </div>

            <Button
              onClick={() => router.push("/configure")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-black px-8 h-12 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              New Interview
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 pb-24">
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card className="border-2 border-dashed border-border/50 bg-card text-center p-12 sm:p-20 rounded-[32px]">
              <div className="size-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="size-10 text-muted-foreground/40" />
              </div>
              <Typography.Heading3 className="text-2xl font-black text-foreground mb-3">
                No sessions found
              </Typography.Heading3>
              <Typography.Body className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {sessions.length === 0
                  ? "Your journey is waiting to begin. Start your first session to see your progress here."
                  : "Start a new session to see your history."}
              </Typography.Body>
              <Button
                onClick={() => router.push("/configure")}
                className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                Launch New Session
              </Button>
            </Card>
          ) : (
            filteredSessions.map((session) => {
              const score = session.scores?.overall || 0;
              const isHigh = score >= 80;

              return (
                <div key={session.sessionId} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

                  <Link
                    href={`/history/${session.sessionId}`}
                    className="relative flex flex-col md:flex-row items-center gap-6 p-5 sm:p-6 bg-card border border-border/50 rounded-3xl hover:border-border transition-all duration-300"
                  >
                    {/* Score Circle */}
                    <div className="relative size-20 shrink-0">
                      <svg
                        className="size-full transform -rotate-90"
                        viewBox="0 0 80 80"
                        aria-label="Performance score gauge"
                        role="img"
                      >
                        <title>Performance score gauge</title>
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          className="stroke-muted fill-none"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          className={cn(
                            "fill-none transition-all duration-1000",
                            isHigh ? "stroke-emerald-500" : "stroke-primary",
                          )}
                          strokeWidth="6"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * score) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-foreground">
                          {score}%
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <Typography.Heading3 className="text-xl font-black text-foreground tracking-tight truncate">
                          {capitalizeTitle(session.config.position)}
                        </Typography.Heading3>
                        <div
                          className={cn(
                            "inline-flex self-center md:self-auto px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                            isHigh
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : "bg-primary/10 border-primary/20 text-primary",
                          )}
                        >
                          {isHigh ? "Excellent" : "Developing"}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          <span className="text-xs font-semibold">
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          <span className="text-xs font-semibold">
                            {session.totalDuration} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto md:border-l border-border/50 md:pl-8">
                      {session.config.specificCompany && (
                        <Badge
                          variant="outline"
                          className="hidden lg:flex border-border bg-muted/30 text-muted-foreground font-bold px-3 py-1"
                        >
                          {session.config.specificCompany}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        asChild
                        className="flex-1 md:flex-none rounded-2xl border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary px-8 h-12 font-black transition-all group/btn"
                      >
                        <span>
                          View Report
                          <Eye className="size-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                        </span>
                      </Button>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
