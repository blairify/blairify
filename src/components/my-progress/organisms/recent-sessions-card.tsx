"use client";

import { ArrowDownRight, ArrowUpRight, Calendar } from "lucide-react";
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
import { formatTitleCase, getScoreColor } from "../utils/formatters";

interface RecentSessionsCardProps {
  sessions: RecentSession[];
}

export function RecentSessionsCard({ sessions }: RecentSessionsCardProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="p-0">
            <Typography.BodyBold>Recent Interview Sessions</Typography.BodyBold>
          </CardTitle>
          <CardDescription className="p-0">
            <Typography.Caption className="text-muted-foreground">
              Your latest interview performances and results
            </Typography.Caption>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center space-y-4">
          <Typography.Caption className="text-muted-foreground block">
            No recent sessions to display
          </Typography.Caption>
          <Button asChild size="sm">
            <Link href="/configure">Start Interview</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="p-0">
          <Typography.BodyBold>Recent Interview Sessions</Typography.BodyBold>
        </CardTitle>
        <CardDescription className="p-0">
          <Typography.Caption className="text-muted-foreground">
            Your latest interview performances and results
          </Typography.Caption>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Typography.BodyBold>
                    {formatTitleCase(session.position)}
                  </Typography.BodyBold>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    <Typography.Caption>
                      {session.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography.Caption>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Typography.BodyBold
                  className={`${getScoreColor(session.score)}`}
                >
                  {session.score}%
                </Typography.BodyBold>
                {index > 0 && sessions[index - 1].score > 0 && (
                  <div className="flex items-center justify-end gap-1 text-xs mt-1">
                    {session.score > sessions[index - 1].score ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                        <Typography.Caption className="text-emerald-600">
                          +{Math.abs(session.score - sessions[index - 1].score)}
                        </Typography.Caption>
                      </>
                    ) : session.score < sessions[index - 1].score ? (
                      <>
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                        <Typography.Caption className="text-red-600">
                          -{Math.abs(session.score - sessions[index - 1].score)}
                        </Typography.Caption>
                      </>
                    ) : (
                      <Typography.Caption className="text-muted-foreground">
                        No change
                      </Typography.Caption>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
