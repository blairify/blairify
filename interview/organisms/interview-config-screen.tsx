import { Building, Play, Target } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewBadge } from "../atoms/interview-badge";
import type { InterviewConfig } from "../types";

interface InterviewConfigScreenProps {
  config: InterviewConfig;
  isLoading: boolean;
  onStart: () => void;
}

export function InterviewConfigScreen({
  config,
  isLoading,
  onStart,
}: InterviewConfigScreenProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <Typography.Heading1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Ready to Start Your Interview?
          </Typography.Heading1>
          <Typography.Body className="text-sm sm:text-base text-muted-foreground">
            Your personalized interview session is configured and ready to
            begin.
          </Typography.Body>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Target className="size-4 sm:h-5 sm:w-5" />
              Interview Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Position
                </p>
                <p className="font-semibold text-sm sm:text-base capitalize">
                  {config.position}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Seniority
                </p>
                <Badge variant="secondary" className="font-semibold capitalize">
                  {config.seniority}
                </Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Interview Type
                </p>
                <InterviewBadge type={config.interviewType} showLabel />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Duration
                </p>
                <Badge variant="outline" className="font-semibold">
                  {config.interviewMode === "practice" ||
                  config.interviewMode === "teacher"
                    ? "Untimed"
                    : config.duration
                      ? `${config.duration} minutes`
                      : "Standard"}
                </Badge>
              </div>
            </div>
            {config.contextType === "job-specific" && config.company && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="size-4 sm:h-5 sm:w-5 text-primary" />
                  <Typography.Heading3 className="font-semibold text-sm sm:text-base text-primary">
                    Job-Specific Interview
                  </Typography.Heading3>
                </div>
                <Typography.Body className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  This interview is tailored for the{" "}
                  <strong>{config.position}</strong> position at{" "}
                  <strong>{config.company}</strong>
                </Typography.Body>
                {config.jobDescription && (
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Job Focus:</p>
                    <p className="line-clamp-2">
                      {config.jobDescription.substring(0, 150)}...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={onStart}
            disabled={isLoading}
            className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Starting Interview...
              </>
            ) : (
              <>
                <Play className="size-4 sm:h-5 sm:w-5 mr-2" />
                Start Interview
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
