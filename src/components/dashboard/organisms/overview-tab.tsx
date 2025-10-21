import { PerformanceChart } from "../molecules/performance-chart";
import { RecentSessions } from "../molecules/recent-sessions";

interface OverviewTabProps {
  performanceData: Array<{
    date: string;
    overall: number;
    technical: number;
    communication: number;
    problemSolving: number;
  }>;
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

export function OverviewTab({ performanceData, sessions }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <PerformanceChart data={performanceData} />
      <RecentSessions sessions={sessions} />
    </div>
  );
}
