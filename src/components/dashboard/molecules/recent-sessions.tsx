import { Clock } from "lucide-react";
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
        <div className="space-y-4">
          {sessions.slice(0, 4).map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
