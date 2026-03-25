"use client";

import { Calendar, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { ScoreRadialChart } from "@/components/results/atoms/score-radial-chart";
import { Button } from "@/components/ui/button";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
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
        <div className="flex flex-row  items-center  justify-between gap-4 mb-6">
          <div>
            <Typography.BodyBold className="text-2xl">
              Previous Sessions
            </Typography.BodyBold>
            <Typography.Body className="text-muted-foreground text-sm mt-1 hidden sm:block">
              A comprehensive record of your technical interview performances.
            </Typography.Body>
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/configure")}
          >
            <Plus className="size-4 mr-1" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New Interview</span>{" "}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sessions.map((session) => {
              const score = session.scores?.overall || 0;

              return (
                <Link
                  key={session.sessionId}
                  href={`/history/${session.sessionId}`}
                  className="group aspect-square w-full flex flex-col items-center justify-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/50 hover:bg-card/50 transition-all duration-300 text-center shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    <ScoreRadialChart
                      score={score}
                      passed={session.analysis?.passed}
                      size={90}
                      strokeWidth={10}
                      textSize="text-xl"
                    />
                    <div className="absolute -inset-2 bg-primary/5 rounded-full -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex flex-col gap-1 items-center min-w-0 w-full">
                    <Typography.BodyBold className="text-sm sm:text-base truncate w-full px-2">
                      {capitalizeTitle(session.config.position)}
                    </Typography.BodyBold>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-[10px] sm:text-xs">
                      <Calendar className="size-3 sm:size-3.5 shrink-0" />
                      <span className="truncate">
                        {formatDate(session.createdAt)}
                      </span>
                    </div>
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
