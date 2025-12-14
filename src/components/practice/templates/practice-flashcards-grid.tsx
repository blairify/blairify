"use client";

import {
  BookOpen,
  Building2,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  Shuffle,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserData } from "@/lib/services/auth/auth";
import { parseFullMarkdown } from "@/lib/utils/markdown-parser";
import type { DifficultyLevel, Question } from "@/types/practice-question";

interface PracticeFlashcardsGridProps {
  user: UserData;
}

export function PracticeFlashcardsGrid({
  user: _user,
}: PracticeFlashcardsGridProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | DifficultyLevel
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/practice/questions?limit=1000&status=published",
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to load questions");
        }

        setQuestions(result.questions);
        setFilteredQuestions(result.questions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load questions",
        );
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(lower) ||
          q.prompt.toLowerCase().includes(lower) ||
          q.topic.toLowerCase().includes(lower) ||
          q.tags.some((tag: string) => tag.toLowerCase().includes(lower)) ||
          q.companies?.some((c) => c.name.toLowerCase().includes(lower)),
      );
    }

    if (selectedTopic !== "all") {
      filtered = filtered.filter((q) => q.topic === selectedTopic);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
    setFlippedCards(new Set());
  }, [searchTerm, selectedTopic, selectedDifficulty, questions]);

  const topics = Array.from(new Set(questions.map((q) => q.topic))).sort();
  const difficulties: DifficultyLevel[] = [
    "entry",
    "junior",
    "middle",
    "senior",
  ];

  const getAnswerText = (question: Question): string => {
    switch (question.type) {
      case "open": {
        return question.referenceAnswers[0]?.text || "Answer not available.";
      }
      case "mcq":
      case "matching":
      case "code":
      case "truefalse":
        return "Answer not available.";
    }

    const _never: never = question;
    throw new Error(`Unhandled question type: ${_never}`);
  };

  const handleFlip = (questionId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleShuffle = () => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    setFlippedCards(new Set());
  };

  const handleReset = () => {
    setFlippedCards(new Set());
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "entry":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "junior":
        return "bg-primary/10 text-primary dark:text-primary/80 border-primary/20";
      case "middle":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "senior":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }

    const _never: never = difficulty;
    throw new Error(`Unhandled difficulty: ${_never}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <Typography.Body color="secondary">
            Loading questions...
          </Typography.Body>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <Typography.BodyMedium color="error">
              Error Loading Questions
            </Typography.BodyMedium>
            <Typography.Caption color="secondary" className="mt-2 block">
              {error}
            </Typography.Caption>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <BookOpen className="size-12 mx-auto text-muted-foreground" />
          <Typography.Body color="secondary">
            No questions available yet.
          </Typography.Body>
        </div>
      </div>
    );
  }

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 border border-border rounded-xl bg-card pb-8">
        <div className="pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <Typography.Heading1 color="primary">
                Practice Library
              </Typography.Heading1>
              <Typography.Body color="secondary">
                Study interview questions with interactive flashcards
              </Typography.Body>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="gap-2"
            >
              <Shuffle className="size-4" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Reset All
            </Button>
            <div className="ml-auto flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span className="text-sm font-medium">
                {filteredQuestions.length} question
                {filteredQuestions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-background border border-border rounded-lg p-4 mb-6 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="search-input"
                    className="text-sm font-medium mb-2 block"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="search-input"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        aria-label="Clear search"
                      >
                        <X className="size-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="topic-select"
                    className="text-sm font-medium mb-2 block"
                  >
                    Topic
                  </label>
                  <Select
                    value={selectedTopic}
                    onValueChange={setSelectedTopic}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="difficulty-select"
                    className="text-sm font-medium mb-2 block"
                  >
                    Difficulty
                  </label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value) =>
                      setSelectedDifficulty(value as "all" | DifficultyLevel)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flashcards Grid */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <Typography.Body color="secondary">
              No questions match your filters. Try adjusting your search.
            </Typography.Body>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => {
              const isFlipped = flippedCards.has(question.id);
              return (
                <div key={question.id} className="perspective-1000">
                  <button
                    type="button"
                    className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer border-0 bg-transparent p-0 ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                    onClick={() => handleFlip(question.id)}
                    aria-label="Flip flashcard"
                    style={{
                      transformStyle: "preserve-3d",
                      minHeight: "360px",
                    }}
                  >
                    <div
                      className={`absolute inset-0 rounded-lg border border-border bg-background shadow-sm hover:shadow-lg px-5 pt-5 pb-6 backface-hidden transition-shadow duration-300 ${
                        isFlipped ? "invisible" : "visible"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(0deg)",
                      }}
                    >
                      <div className="flex flex-col h-full min-h-[340px]">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge
                              variant="outline"
                              className={`${getDifficultyColor(question.difficulty)} px-3 py-1.5 font-semibold shadow-sm`}
                            >
                              {question.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <RotateCcw className="size-3" />
                              <span>Tap to flip</span>
                            </div>
                          </div>
                          <Typography.Heading3
                            color="primary"
                            className="mb-2 line-clamp-2"
                          >
                            {question.title}
                          </Typography.Heading3>
                          {question.companies?.[0] && (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                              <Building2 className="size-3.5" />
                              <span className="font-medium">
                                {question.companies[0].name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none line-clamp-6 text-sm text-center prose-p:text-slate-700 dark:prose-p:text-slate-300"
                            dangerouslySetInnerHTML={parseFullMarkdown(
                              question.prompt,
                            )}
                          />
                        </div>

                        {question.tags && question.tags.length > 0 && (
                          <div className="mt-4 pt-3 pb-2 px-3 border-t border-border/60">
                            <div className="flex flex-wrap gap-1.5">
                              {question.tags.slice(0, 3).map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[11px] px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-2 py-0.5 rounded-full text-muted-foreground"
                                >
                                  +{question.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`absolute inset-0 rounded-lg border border-border bg-background shadow-sm hover:shadow-lg px-5 pt-5 pb-6 backface-hidden transition-shadow duration-300 ${
                        isFlipped ? "visible" : "invisible"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="flex flex-col h-full min-h-[340px]">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm shadow-emerald-500/30">
                                <CheckCircle2 className="size-4 text-white" />
                              </div>
                              <Typography.BodyBold className="text-emerald-900 dark:text-emerald-100 block">
                                Answer
                              </Typography.BodyBold>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-900/50">
                              <RotateCcw className="size-3" />
                              <span className="font-medium">Flip back</span>
                            </div>
                          </div>
                          <Typography.SubCaptionMedium className="text-emerald-700 dark:text-emerald-300 line-clamp-1 block">
                            {question.title}
                          </Typography.SubCaptionMedium>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-sm prose-headings:text-emerald-900 dark:prose-headings:text-emerald-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-emerald-900 dark:prose-strong:text-emerald-100"
                            dangerouslySetInnerHTML={parseFullMarkdown(
                              getAnswerText(question),
                            )}
                          />
                        </div>

                        {question.primaryTechStack &&
                          question.primaryTechStack.length > 0 && (
                            <div className="mt-4 pt-3 pb-2 px-3 border-t border-emerald-200 dark:border-emerald-900/50">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <Typography.SubCaptionBold className="text-emerald-900 dark:text-emerald-100 block">
                                  Tech Stack
                                </Typography.SubCaptionBold>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {question.primaryTechStack
                                  .slice(0, 4)
                                  .map((tech: string) => (
                                    <Badge
                                      key={tech}
                                      variant="outline"
                                      className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                {question.primaryTechStack.length > 4 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                                  >
                                    +{question.primaryTechStack.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
