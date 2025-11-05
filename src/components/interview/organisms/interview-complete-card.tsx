import { AlertCircle, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InterviewCompleteCardProps {
  onViewResults: () => void;
}

export function InterviewCompleteCard({
  onViewResults,
}: InterviewCompleteCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleViewResultsClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmViewResults = () => {
    onViewResults();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                  Ready to View Results?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                  This will analyze your interview responses and generate
                  detailed feedback. The analysis may take 30-90 seconds to
                  complete.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    onClick={handleConfirmViewResults}
                    size="lg"
                    className="h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Start Analysis
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="lg"
                    className="h-11 sm:h-12 px-8 text-base font-semibold"
                  >
                    Not Yet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                Interview Complete!
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                Congratulations! You've successfully completed the interview.
                Ready to see how you performed?
              </p>
              <Button
                onClick={handleViewResultsClick}
                size="lg"
                className="h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                View Results
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
