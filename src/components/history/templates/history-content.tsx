"use client";

import { Calendar, Clock, Eye, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { cn } from "@/lib/utils";
import type { InterviewSession } from "@/types/firestore";

interface HistoryContentProps {
  user: UserData;
}

export function HistoryContent({ user }: HistoryContentProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userSessions = await DatabaseService.getUserSessions(user.uid, 50);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const formatDate = (timestamp: { toDate: () => Date }) =>
    new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const capitalizeTitle = (title: string) =>
    title
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <Typography.Body color="secondary">
            Loading interview history...
          </Typography.Body>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-24 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Typography.BodyBold className="text-2xl">
              Previous <span className="text-primary">Sessions</span>
            </Typography.BodyBold>
            <Typography.Body className="text-muted-foreground text-sm mt-1">
              A comprehensive record of your technical interview performances.
            </Typography.Body>
          </div>
          <Button onClick={() => router.push("/configure")}>
            New Interview
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-border/50 rounded-xl">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Trophy className="size-8 text-muted-foreground/40" />
            </div>
            <Typography.BodyBold className="text-lg mb-1">
              No sessions found
            </Typography.BodyBold>
            <Typography.Body className="text-muted-foreground mb-6 max-w-xs">
              Start your first interview to see your progress here.
            </Typography.Body>
            <Button onClick={() => router.push("/configure")}>
              Launch New Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const score = session.scores?.overall || 0;
              const isHigh = score >= 80;

              return (
                <Link
                  key={session.sessionId}
                  href={`/history/${session.sessionId}`}
                  className="group flex flex-col md:flex-row items-center gap-5 p-4 sm:p-5 bg-card border border-border/50 rounded-xl hover:border-border transition-colors"
                >
                  <div className="relative size-14 shrink-0">
                    <svg
                      className="size-full -rotate-90"
                      viewBox="0 0 80 80"
                      role="img"
                      aria-label={`Score: ${score}%`}
                    >
                      <title>{`Score: ${score}%`}</title>
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
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black">
                      {score}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <span className="text-base font-bold truncate">
                        {capitalizeTitle(session.config.position)}
                      </span>
                      <span
                        className={cn(
                          "self-center md:self-auto px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                          isHigh
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-primary/10 border-primary/20 text-primary",
                        )}
                      >
                        {isHigh ? "Excellent" : "Developing"}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(session.createdAt)}
                      </span>
                      <span className="size-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {session.totalDuration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {session.config.specificCompany && (
                      <Badge
                        variant="outline"
                        className="hidden lg:flex text-muted-foreground"
                      >
                        {session.config.specificCompany}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        Full Report
                        <Eye className="size-3.5 ml-1.5" />
                      </span>
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
