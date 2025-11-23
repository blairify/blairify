/**
 * Evaluation Feedback Component
 * Displays LLM evaluation results with detailed feedback
 */

"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EvaluationResult } from "@/types/practice-question";

// ============================================================================
// Props Interface
// ============================================================================

interface EvaluationFeedbackProps {
  evaluation: EvaluationResult;
  showDetailed?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function EvaluationFeedback({
  evaluation,
  showDetailed = true,
}: EvaluationFeedbackProps) {
  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <ScoreOverview evaluation={evaluation} />

      {/* Reasoning */}
      <Card className="p-6">
        <Typography.Heading3 className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Evaluation Summary
        </Typography.Heading3>
        <Typography.Body className="text-muted-foreground">
          {evaluation.reasoning}
        </Typography.Body>
      </Card>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <Card className="p-6 border-green-200 dark:border-green-900">
          <Typography.Heading3
            color="success"
            className="mb-3 flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Strengths
          </Typography.Heading3>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <Typography.Body>{strength}</Typography.Body>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weaknesses */}
      {evaluation.weaknesses.length > 0 && (
        <Card className="p-6 border-red-200 dark:border-red-900">
          <Typography.Heading3
            color="error"
            className="mb-3 flex items-center gap-2"
          >
            <XCircle className="h-5 w-5" />
            Areas for Improvement
          </Typography.Heading3>
          <ul className="space-y-2">
            {evaluation.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <XCircle className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                <Typography.Body>{weakness}</Typography.Body>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Suggestions */}
      {evaluation.suggestions.length > 0 && (
        <Card className="p-6 border-blue-200 dark:border-blue-900">
          <Typography.Heading3
            color="blue"
            className="mb-3 flex items-center gap-2"
          >
            <Lightbulb className="size-5" />
            Suggestions for Improvement
          </Typography.Heading3>
          <ul className="space-y-2">
            {evaluation.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <TrendingUp className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <Typography.Body>{suggestion}</Typography.Body>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Detailed Breakdown */}
      {showDetailed && <DetailedBreakdown evaluation={evaluation} />}
    </div>
  );
}

// ============================================================================
// Score Overview
// ============================================================================

function ScoreOverview({ evaluation }: { evaluation: EvaluationResult }) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Adequate";
    return "Needs Improvement";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography.Heading3 className="mb-1">Your Score</Typography.Heading3>
          <Typography.Caption className="text-muted-foreground">
            {getScoreLabel(evaluation.percentage)}
          </Typography.Caption>
        </div>
        <div className="text-right">
          <div
            className={`text-4xl font-bold ${getScoreColor(evaluation.percentage)}`}
          >
            {evaluation.percentage}%
          </div>
          <div className="text-sm text-muted-foreground">
            {evaluation.score.toFixed(2)} / {evaluation.maxScore}
          </div>
        </div>
      </div>

      <Progress value={evaluation.percentage} className="h-3" />

      <div className="mt-4 flex items-center gap-2 text-muted-foreground">
        <Award className="size-4" />
        <Typography.Caption>
          Evaluated by {evaluation.evaluationModel} • Version{" "}
          {evaluation.evaluationVersion}
        </Typography.Caption>
      </div>
    </Card>
  );
}

// ============================================================================
// Detailed Breakdown
// ============================================================================

function DetailedBreakdown({ evaluation }: { evaluation: EvaluationResult }) {
  const { breakdown } = evaluation;

  if (!breakdown) return null;

  switch (breakdown.type) {
    case "open":
      return <OpenBreakdown breakdown={breakdown} />;
    case "code":
      return <CodeBreakdown breakdown={breakdown} />;
    case "mcq":
      return <MCQBreakdown breakdown={breakdown} />;
    case "matching":
      return <MatchingBreakdown breakdown={breakdown} />;
    default:
      return null;
  }
}

// ============================================================================
// Open Question Breakdown
// ============================================================================

function OpenBreakdown({ breakdown }: { breakdown: any }) {
  const criteria = [
    { label: "Completeness", value: breakdown.completeness },
    { label: "Accuracy", value: breakdown.accuracy },
    { label: "Clarity", value: breakdown.clarity },
    { label: "Depth", value: breakdown.depth },
  ];

  return (
    <Card className="p-6">
      <Typography.Heading3 className="mb-4">
        Detailed Analysis
      </Typography.Heading3>

      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.label}>
            <div className="flex items-center justify-between mb-2">
              <Typography.CaptionMedium>
                {criterion.label}
              </Typography.CaptionMedium>
              <Typography.Caption className="text-muted-foreground">
                {Math.round(criterion.value * 100)}%
              </Typography.Caption>
            </div>
            <Progress value={criterion.value * 100} className="h-2" />
          </div>
        ))}
      </div>

      {breakdown.coveredKeyPoints && breakdown.coveredKeyPoints.length > 0 && (
        <div className="mt-6">
          <Typography.CaptionBold color="success" className="mb-2">
            Key Points Covered
          </Typography.CaptionBold>
          <ul className="space-y-1">
            {breakdown.coveredKeyPoints.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                <Typography.Body>{point}</Typography.Body>
              </li>
            ))}
          </ul>
        </div>
      )}

      {breakdown.missedKeyPoints && breakdown.missedKeyPoints.length > 0 && (
        <div className="mt-4">
          <Typography.CaptionBold color="error" className="mb-2">
            Key Points Missed
          </Typography.CaptionBold>
          <ul className="space-y-1">
            {breakdown.missedKeyPoints.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <XCircle className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                <Typography.Body>{point}</Typography.Body>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// Code Question Breakdown
// ============================================================================

function CodeBreakdown({ breakdown }: { breakdown: any }) {
  const criteria = [
    { label: "Correctness", value: breakdown.correctness },
    { label: "Efficiency", value: breakdown.efficiency },
    { label: "Code Quality", value: breakdown.codeQuality },
    { label: "Edge Cases", value: breakdown.edgeCases },
  ];

  return (
    <Card className="p-6">
      <Typography.Heading3 className="mb-4">Code Analysis</Typography.Heading3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Test Cases</span>
          <span className="text-sm">
            {breakdown.passedTestCases} / {breakdown.totalTestCases} passed
          </span>
        </div>
        <Progress
          value={(breakdown.passedTestCases / breakdown.totalTestCases) * 100}
          className="h-2"
        />
      </div>

      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{criterion.label}</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(criterion.value * 100)}%
              </span>
            </div>
            <Progress value={criterion.value * 100} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// MCQ Breakdown
// ============================================================================

function MCQBreakdown({ breakdown }: { breakdown: any }) {
  return (
    <Card className="p-6">
      <Typography.Heading3 className="mb-4">
        Answer Analysis
      </Typography.Heading3>

      <div className="space-y-4">
        {breakdown.correctSelections &&
          breakdown.correctSelections.length > 0 && (
            <div>
              <Typography.CaptionBold color="success" className="mb-2">
                Correct Selections
              </Typography.CaptionBold>
              <div className="flex flex-wrap gap-2">
                {breakdown.correctSelections.map((id: string) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className="border-green-600"
                  >
                    Option {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {breakdown.incorrectSelections &&
          breakdown.incorrectSelections.length > 0 && (
            <div>
              <Typography.CaptionBold color="error" className="mb-2">
                Incorrect Selections
              </Typography.CaptionBold>
              <div className="flex flex-wrap gap-2">
                {breakdown.incorrectSelections.map((id: string) => (
                  <Badge key={id} variant="outline" className="border-red-600">
                    Option {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {breakdown.missedCorrectOptions &&
          breakdown.missedCorrectOptions.length > 0 && (
            <div>
              <Typography.CaptionBold className="mb-2 text-yellow-700 dark:text-yellow-400">
                Missed Correct Options
              </Typography.CaptionBold>
              <div className="flex flex-wrap gap-2">
                {breakdown.missedCorrectOptions.map((id: string) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className="border-yellow-600"
                  >
                    Option {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </div>
    </Card>
  );
}

// ============================================================================
// Matching Breakdown
// ============================================================================

function MatchingBreakdown({ breakdown }: { breakdown: any }) {
  return (
    <Card className="p-6">
      <Typography.Heading3 className="text-lg font-semibold mb-4">
        Matching Results
      </Typography.Heading3>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {breakdown.correctMatches}
          </div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {breakdown.incorrectMatches}
          </div>
          <div className="text-sm text-muted-foreground">Incorrect</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{breakdown.totalMatches}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      <div className="mt-4">
        <Progress
          value={(breakdown.correctMatches / breakdown.totalMatches) * 100}
          className="h-3"
        />
      </div>
    </Card>
  );
}
