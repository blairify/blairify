"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Eye,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentSession } from "@/lib/services/dashboard/dashboard-analytics";
import { cn } from "@/lib/utils";

interface RecentSessionsCardProps {
  sessions: RecentSession[];
}

export function RecentSessionsCard({ sessions }: RecentSessionsCardProps) {
  const formatTitleCase = (title: string) => {
    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (sessions.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border/50 bg-card text-center p-12 sm:p-20 rounded-[32px]">
        <CardHeader className="p-0">
          <CardTitle className="p-0">
            <Typography.BodyBold>Recent Interview Sessions</Typography.BodyBold>
          </CardTitle>
          <CardDescription className="p-0">
            <Typography.Caption className="text-muted-foreground">
              Your latest interview performances and results
            </Typography.Caption>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="size-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="size-10 text-muted-foreground/40" />
          </div>
          <Typography.Heading3 className="text-2xl font-black text-foreground mb-3">
            No sessions found
          </Typography.Heading3>
          <Typography.Body className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Your journey is waiting to begin. Start your first session to see
            your progress here.
          </Typography.Body>
          <Button
            asChild
            className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105"
          >
            <Link href="/configure">Launch New Session</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography.BodyBold className="text-lg">
            Recent Interview Sessions
          </Typography.BodyBold>
          <Typography.Caption className="text-muted-foreground">
            Your latest interview performances and results
          </Typography.Caption>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/history">View All History</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.slice(0, 3).map((session, index) => {
          const score = session.score;
          const isHigh = score >= 80;

          return (
            <div key={session.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

              <Link
                href={`/history/${session.id}`}
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
                      {formatTitleCase(session.position)}
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
                        {session.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="size-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-4" />
                      <span className="text-xs font-semibold">
                        {session.duration || 30} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto md:border-l border-border/50 md:pl-8">
                  {index > 0 && sessions[index - 1].score > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      {session.score > sessions[index - 1].score ? (
                        <>
                          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">
                            +
                            {Math.abs(
                              session.score - sessions[index - 1].score,
                            )}
                          </span>
                        </>
                      ) : session.score < sessions[index - 1].score ? (
                        <>
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                          <span className="text-red-600 font-semibold">
                            -
                            {Math.abs(
                              session.score - sessions[index - 1].score,
                            )}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-semibold">
                          No change
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex-1 md:flex-none rounded-2xl border border-border bg-card px-8 h-12 font-black transition-all flex items-center justify-center gap-2 group/btn">
                    View Report
                    <Eye className="size-4 group-hover/btn:scale-110 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
