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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPromo() {
  // Mock weekly activity data for chart
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
    <section className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left-8 duration-1000 delay-200 flex flex-col justify-center text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Performance Analytics
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Get detailed insights into your performance. Monitor your
                scores, identify strengths, and focus on areas for improvement.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Real-time performance tracking
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Personalized improvement recommendations
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Detailed session history and analytics
                </span>
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

          {/* 
            DASHBOARD PREVIEW - MOBILE OPTIMIZED:
            - Responsive spacing and sizing
            - Touch-friendly chart interactions
            - Proper visual hierarchy for small screens
          */}
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-8 duration-1000 delay-400 flex flex-col justify-center order-first lg:order-last">
            {/* Weekly Activity Chart - Mobile Enhanced */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>
                  Your practice sessions throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
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
