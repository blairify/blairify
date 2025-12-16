import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillProgress } from "../atoms/skill-progress";

interface SkillsBreakdownProps {
  skills: Array<{
    skill: string;
    score: number;
    sessions: number;
    color: string;
  }>;
}

export function SkillsBreakdown({ skills }: SkillsBreakdownProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Skills Performance</CardTitle>
        <CardDescription>
          Detailed breakdown of your performance by skill area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {skills.map((skill) => (
            <SkillProgress key={skill.skill} skill={skill} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
