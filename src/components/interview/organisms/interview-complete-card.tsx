import { ArrowRight, CheckCircle } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InterviewCompleteCardProps {
  onViewResults: () => void;
}

export function InterviewCompleteCard({
  onViewResults,
}: InterviewCompleteCardProps) {
  const handleConfirmViewResults = () => {
    onViewResults();
  };

  return (
    <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-xl">
      <CardContent className="pt-6 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
          </div>
          <Typography.Heading3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
            Interview Complete!
          </Typography.Heading3>
          <Typography.Body className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
            Congratulations! You've successfully completed the interview. Ready
            to see how you performed?
          </Typography.Body>
          <Button
            onClick={handleConfirmViewResults}
            size="lg"
            className="h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            View Results
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
