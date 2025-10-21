"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PerformanceTabProps {
  performanceData: Array<{
    date: string;
    overall: number;
    technical: number;
    communication: number;
    problemSolving: number;
  }>;
  questionTypesData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function PerformanceTab({
  performanceData,
  questionTypesData,
}: PerformanceTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Multi-line Performance Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>
            Track improvement across different skill areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="technical"
                stroke="#68d391"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="communication"
                stroke="#4fd1c7"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="problemSolving"
                stroke="#63b3ed"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Question Types Distribution */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Question Types</CardTitle>
          <CardDescription>Distribution of practice questions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={questionTypesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {questionTypesData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {questionTypesData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
