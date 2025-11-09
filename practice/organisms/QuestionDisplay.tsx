/**
 * Question Display Component
 * Polymorphic component that renders different question types
 */

"use client";

import { Building2, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type {
  CodeQuestion,
  MatchingQuestion,
  MCQQuestion,
  OpenQuestion,
  Question,
  TrueFalseQuestion,
  UserAnswer,
} from "@/types/practice-question";

// ============================================================================
// Props Interface
// ============================================================================

interface QuestionDisplayProps {
  question: Question;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting?: boolean;
  timeSpentSeconds?: number;
}

// ============================================================================
// Main Component
// ============================================================================

export function QuestionDisplay({
  question,
  onSubmit,
  isSubmitting = false,
  timeSpentSeconds = 0,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <QuestionHeader question={question} timeSpentSeconds={timeSpentSeconds} />

      {/* Question Content */}
      <Card className="p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
          {question.description && (
            <p className="text-muted-foreground mb-4">{question.description}</p>
          )}
          <div className="text-lg">{question.prompt}</div>
        </div>

        {/* Type-specific Answer Input */}
        <AnswerInput
          question={question}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}

// ============================================================================
// Question Header
// ============================================================================

function QuestionHeader({
  question,
  timeSpentSeconds,
}: {
  question: Question;
  timeSpentSeconds: number;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={getDifficultyVariant(question.difficulty)}>
          {question.difficulty}
        </Badge>
        <Badge variant="outline">{question.type.toUpperCase()}</Badge>
        <Badge variant="secondary">
          <Tag className="h-3 w-3 mr-1" />
          {question.topic}
        </Badge>
        {question.companies?.[0]?.name && (
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            {question.companies[0].name}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeSpentSeconds)}</span>
        </div>
        <span>~{question.estimatedTimeMinutes} min</span>
      </div>
    </div>
  );
}

// ============================================================================
// Answer Input (Polymorphic)
// ============================================================================

function AnswerInput({
  question,
  onSubmit,
  isSubmitting,
}: {
  question: Question;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  switch (question.type) {
    case "mcq":
      return (
        <MCQInput
          question={question as MCQQuestion}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "open":
      return (
        <OpenInput
          question={question as OpenQuestion}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "code":
      return (
        <CodeInput
          question={question as CodeQuestion}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "matching":
      return (
        <MatchingInput
          question={question as MatchingQuestion}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "truefalse":
      return (
        <TrueFalseInput
          question={question as TrueFalseQuestion}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    default:
      return <div>Unsupported question type</div>;
  }
}

// ============================================================================
// MCQ Input
// ============================================================================

function MCQInput({
  question,
  onSubmit,
  isSubmitting,
}: {
  question: MCQQuestion;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit({
      questionType: "mcq",
      selectedOptionIds: selectedOptions,
    });
  };

  const handleOptionToggle = (optionId: string) => {
    if (question.allowMultipleAnswers) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {question.allowMultipleAnswers
          ? "Select all that apply"
          : "Select one answer"}
      </p>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            type="button"
            key={option.id}
            className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer w-full text-left"
            onClick={() => handleOptionToggle(option.id)}
          >
            {question.allowMultipleAnswers ? (
              <Checkbox
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={() => handleOptionToggle(option.id)}
              />
            ) : (
              <RadioGroupItem
                value={option.id}
                checked={selectedOptions.includes(option.id)}
              />
            )}
            <Label className="flex-1 cursor-pointer">{option.text}</Label>
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedOptions.length === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Answer"}
      </Button>
    </div>
  );
}

// ============================================================================
// Open Input
// ============================================================================

function OpenInput({
  question,
  onSubmit,
  isSubmitting,
}: {
  question: OpenQuestion;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  const [answerText, setAnswerText] = useState("");
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = () => {
    onSubmit({
      questionType: "open",
      answerText,
      wordCount,
    });
  };

  const isValid =
    answerText.trim().length > 0 &&
    (!question.minWords || wordCount >= question.minWords) &&
    (!question.maxWords || wordCount <= question.maxWords);

  return (
    <div className="space-y-4">
      <Textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[200px]"
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {wordCount} words
          {question.minWords && ` (min: ${question.minWords})`}
          {question.maxWords && ` (max: ${question.maxWords})`}
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Answer"}
      </Button>
    </div>
  );
}

// ============================================================================
// Code Input
// ============================================================================

function CodeInput({
  question,
  onSubmit,
  isSubmitting,
}: {
  question: CodeQuestion;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  const [code, setCode] = useState(question.starterCode || "");

  const handleSubmit = () => {
    onSubmit({
      questionType: "code",
      code,
      language: question.language,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Your Solution ({question.language})</Label>
        <Badge variant="outline">{question.language}</Badge>
      </div>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Write your ${question.language} code here...`}
        className="min-h-[300px] font-mono text-sm"
      />

      {/* Test Cases Preview */}
      <div className="space-y-2">
        <Label>Test Cases</Label>
        {question.testCases
          .filter((tc) => !tc.isHidden)
          .map((tc, idx) => (
            <div key={tc.id} className="text-sm p-3 bg-muted rounded">
              <div>
                <span className="font-medium">Test {idx + 1}:</span> Input:{" "}
                <code>{tc.input}</code> → Expected:{" "}
                <code>{tc.expectedOutput}</code>
              </div>
            </div>
          ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={code.trim().length === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Running Tests..." : "Submit & Run Tests"}
      </Button>
    </div>
  );
}

// ============================================================================
// Matching Input
// ============================================================================

function MatchingInput({
  question,
  onSubmit,
  isSubmitting,
}: {
  question: MatchingQuestion;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  const [matches, setMatches] = useState<Map<string, string>>(new Map());

  const leftItems = question.pairs.map((p) => ({ id: p.id, text: p.left }));
  const rightItems = question.pairs.map((p) => ({ id: p.id, text: p.right }));

  const handleMatch = (leftId: string, rightId: string) => {
    setMatches((prev) => {
      const newMatches = new Map(prev);
      newMatches.set(leftId, rightId);
      return newMatches;
    });
  };

  const handleSubmit = () => {
    const matchesArray = Array.from(matches.entries()).map(
      ([leftId, rightId]) => ({
        leftId,
        rightId,
      }),
    );

    onSubmit({
      questionType: "matching",
      matches: matchesArray,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Match items from the left column with items from the right column
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <div key={item.id} className="p-3 border rounded">
              {item.text}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {rightItems.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // Simple matching - in production, use drag-and-drop
                const firstUnmatched = leftItems.find(
                  (l) => !matches.has(l.id),
                );
                if (firstUnmatched) {
                  handleMatch(firstUnmatched.id, item.id);
                }
              }}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Matched: {matches.size} / {question.pairs.length}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={matches.size !== question.pairs.length || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Matches"}
      </Button>
    </div>
  );
}

// ============================================================================
// True/False Input
// ============================================================================

function TrueFalseInput({
  question: _question,
  onSubmit,
  isSubmitting,
}: {
  question: TrueFalseQuestion;
  onSubmit: (answer: Partial<UserAnswer>) => void;
  isSubmitting: boolean;
}) {
  const [answer, setAnswer] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (answer !== null) {
      onSubmit({
        questionType: "truefalse",
        answer,
      });
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={answer === null ? undefined : answer.toString()}
        onValueChange={(value) => setAnswer(value === "true")}
      >
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true" className="flex-1 cursor-pointer">
            True
          </Label>
        </div>
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false" className="flex-1 cursor-pointer">
            False
          </Label>
        </div>
      </RadioGroup>

      <Button
        onClick={handleSubmit}
        disabled={answer === null || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Answer"}
      </Button>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDifficultyVariant(difficulty: string) {
  switch (difficulty) {
    case "entry":
      return "secondary";
    case "junior":
      return "default";
    case "middle":
      return "default";
    case "senior":
      return "destructive";
    default:
      return "outline";
  }
}
