import { Clock, Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionItem } from "../atoms/session-item";

interface RecentSessionsProps {
  sessions: Array<{
    id: number;
    position: string;
    score: number;
    date: string;
    duration: string;
    type: string;
    improvement: string;
  }>;
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Sessions
        </CardTitle>
        <CardDescription>Latest interview practice</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Sessions Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Start your first interview to track your progress and see your
              performance metrics here.
            </p>
            <Link href="/configure">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Start First Interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 4).map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
