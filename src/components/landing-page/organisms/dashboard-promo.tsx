"use client";
import { Activity, ArrowRight, Award, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPromo() {
  const weeklyActivityData = [
    { day: "Mon", sessions: 3, height: 60 },
    { day: "Tue", sessions: 1, height: 20 },
    { day: "Wed", sessions: 4, height: 80 },
    { day: "Thu", sessions: 2, height: 40 },
    { day: "Fri", sessions: 5, height: 100 },
    { day: "Sat", sessions: 2, height: 40 },
    { day: "Sun", sessions: 1, height: 20 },
  ];

  const router = useRouter();

  return (
    <section
      className="w-full bg-[color:var(--card)] py-12 sm:py-16 lg:py-20 overflow-hidden"
      data-analytics-id="home-dashboard-promo"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left-8 duration-1000 delay-200 flex flex-col items-center lg:items-start justify-center text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <div className="space-y-4 sm:space-y-6">
              <Typography.Heading2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Performance Analytics
              </Typography.Heading2>
              <Typography.Body className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Get detailed insights into your performance. Monitor your
                scores, identify strengths, and focus on areas for improvement.
              </Typography.Body>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto" />
                <div className="text-xs sm:text-sm font-medium">Analytics</div>
              </div>
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto" />
                <div className="text-xs sm:text-sm font-medium">Insights</div>
              </div>
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto" />
                <div className="text-xs sm:text-sm font-medium">
                  Achievements
                </div>
              </div>
            </div>

            <ul className="space-y-2 max-w-xl mx-auto lg:mx-0">
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="size-2 bg-primary rounded-full" />
                <Typography.Caption className="text-sm text-muted-foreground">
                  Real-time performance tracking
                </Typography.Caption>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="size-2 bg-primary rounded-full" />
                <Typography.Caption className="text-sm text-muted-foreground">
                  Personalized improvement recommendations
                </Typography.Caption>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="size-2 bg-primary rounded-full" />
                <Typography.Caption className="text-sm text-muted-foreground">
                  Detailed session history and analytics
                </Typography.Caption>
              </li>
            </ul>
            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={() => router.push("/auth")}
                aria-label="View Analytics Dashboard"
                className="group w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium px-6 sm:px-4"
              >
                View Analytics Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-8 duration-1000 delay-400 flex flex-col justify-center order-last max-w-xl w-full mx-auto lg:mx-0">
            <Card className="border-border bg-card w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>
                  Your practice sessions throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <ResponsiveContainer width="100%" aspect={2.2}>
                  <AreaChart data={weeklyActivityData}>
                    <defs>
                      <linearGradient
                        id="sessionsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(74.6% 0.16 232.661)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(74.6% 0.16 232.661)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--foreground)" }}
                    />
                    <YAxis
                      stroke="var(--foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--foreground)" }}
                    />

                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="oklch(74.6% 0.16 232.661)"
                      strokeWidth={2}
                      fill="url(#sessionsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
