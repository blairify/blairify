import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
            {trend && (
              <p
                className={`text-xs truncate ${
                  trend.isPositive !== false ? "text-chart-2" : "text-chart-4"
                }`}
              >
                {trend.value}
              </p>
            )}
          </div>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
