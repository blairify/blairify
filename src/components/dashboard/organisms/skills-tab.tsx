import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillsBreakdown } from "../molecules/skills-breakdown";

interface SkillsTabProps {
  skills: Array<{
    skill: string;
    score: number;
    sessions: number;
    color: string;
  }>;
}

export function SkillsTab({ skills }: SkillsTabProps) {
  return (
    <div className="grid gap-6">
      <SkillsBreakdown skills={skills} />

      {/* Skills Recommendations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Skill Recommendations</CardTitle>
          <CardDescription>
            Areas to focus on for maximum improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-chart-4/20 bg-chart-4/5">
              <h4 className="font-semibold text-chart-4 mb-2">
                Priority: System Design
              </h4>
              <p className="text-sm text-muted-foreground">
                Your lowest scoring area. Focus on scalability patterns and
                distributed systems concepts.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-chart-3/20 bg-chart-3/5">
              <h4 className="font-semibold text-chart-3 mb-2">
                Improve: Algorithms
              </h4>
              <p className="text-sm text-muted-foreground">
                Practice more dynamic programming and graph algorithms to boost
                your coding interview performance.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-chart-2/20 bg-chart-2/5">
              <h4 className="font-semibold text-chart-2 mb-2">
                Strength: Communication
              </h4>
              <p className="text-sm text-muted-foreground">
                Excellent communication skills! Use this strength to explain
                technical concepts clearly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
