"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTab } from "./activity-tab";
import { OverviewTab } from "./overview-tab";
import { PerformanceTab } from "./performance-tab";
import { SkillsTab } from "./skills-tab";

interface DashboardTabsProps {
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
  skillsData: Array<{
    skill: string;
    score: number;
    sessions: number;
    color: string;
  }>;
  questionTypesData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  weeklyActivityData: Array<{
    day: string;
    sessions: number;
    avgScore: number;
  }>;
}

export function DashboardTabs({
  performanceData,
  sessions,
  skillsData,
  questionTypesData,
  weeklyActivityData,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="activity" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="overview" className="text-xs md:text-sm">
          Overview
        </TabsTrigger>
        <TabsTrigger value="performance" className="text-xs md:text-sm">
          Performance
        </TabsTrigger>
        <TabsTrigger value="skills" className="text-xs md:text-sm">
          Skills
        </TabsTrigger>
        <TabsTrigger value="activity" className="text-xs md:text-sm">
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab performanceData={performanceData} sessions={sessions} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceTab
          performanceData={performanceData}
          questionTypesData={questionTypesData}
        />
      </TabsContent>

      <TabsContent value="skills" className="space-y-6">
        <SkillsTab skills={skillsData} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        <ActivityTab weeklyActivityData={weeklyActivityData} />
      </TabsContent>
    </Tabs>
  );
}
