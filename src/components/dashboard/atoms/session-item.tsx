import { Brain, Code, Target } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";

interface SessionItemProps {
  session: {
    id: number;
    position: string;
    score: number;
    date: string;
    duration: string;
    type: string;
    improvement: string;
  };
}

export function SessionItem({ session }: SessionItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="h-4 w-4 text-primary" />;
      case "bullet":
        return <Target className="h-4 w-4 text-primary" />;
      case "coding":
        return <Brain className="h-4 w-4 text-primary" />;
      default:
        return <Code className="h-4 w-4 text-primary" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-chart-2/20 text-chart-2";
    if (score >= 80) return "bg-chart-3/20 text-chart-3";
    return "bg-chart-4/20 text-chart-4";
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          {getTypeIcon(session.type)}
        </div>
        <div>
          <Typography.BodyMedium>{session.position}</Typography.BodyMedium>
          <Typography.SubCaption className="text-muted-foreground">
            {session.date}
          </Typography.SubCaption>
        </div>
      </div>
      <div className="text-right">
        <Badge variant="secondary" className={getScoreColor(session.score)}>
          {session.score}%
        </Badge>
        <Typography.SubCaption className="text-chart-2 mt-1">
          {session.improvement}
        </Typography.SubCaption>
      </div>
    </div>
  );
}
