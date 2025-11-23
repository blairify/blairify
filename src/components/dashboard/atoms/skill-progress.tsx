import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SkillProgressProps {
  skill: {
    skill: string;
    score: number;
    sessions: number;
    color: string;
  };
}

export function SkillProgress({ skill }: SkillProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded-full"
            style={{ backgroundColor: skill.color }}
          />
          <span className="font-medium">{skill.skill}</span>
          <Badge variant="secondary" className="text-xs">
            {skill.sessions} sessions
          </Badge>
        </div>
        <span className="text-sm font-medium">{skill.score}%</span>
      </div>
      <Progress value={skill.score} className="h-2" />
    </div>
  );
}
