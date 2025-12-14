"use client";

import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import type { Question } from "@/types/practice-question";

interface PracticeFlashcardsProps {
  user: UserData;
}

export function PracticeFlashcards({ user: _user }: PracticeFlashcardsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "/api/practice/questions?limit=1000&status=published",
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const result = (await response.json()) as {
          success: boolean;
          questions: Question[];
        };

        if (!result.success) {
          throw new Error("Failed to load questions");
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

  // Filter questions
  useEffect(() => {
    let filtered = questions;

    // Search filter
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

    // Topic filter
    if (selectedTopic !== "all") {
      filtered = filtered.filter((q) => q.topic === selectedTopic);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [searchTerm, selectedTopic, selectedDifficulty, questions]);

  // Get unique topics and difficulties
  const topics = Array.from(new Set(questions.map((q) => q.topic))).sort();
  const difficulties = ["entry", "junior", "middle", "senior"];

  const currentQuestion = filteredQuestions[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, filteredQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleShuffle = () => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious, handleFlip]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "entry":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "junior":
        return "bg-primary/10 text-primary dark:text-primary/80 border-primary/20";
      case "middle":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "senior":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <Typography.Body color="secondary">
            Loading flashcards...
          </Typography.Body>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <Typography.Heading2 color="primary" className="mb-2">
            Error Loading Questions
          </Typography.Heading2>
          <Typography.Body color="secondary" className="mb-4">
            {error}
          </Typography.Body>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </main>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <Typography.Heading2 color="primary" className="mb-2">
            No Questions Found
          </Typography.Heading2>
          <Typography.Body color="secondary" className="mb-4">
            Try adjusting your filters or search term
          </Typography.Body>
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedTopic("all");
              setSelectedDifficulty("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography.Heading1 color="primary" className="mb-2">
                Practice Flashcards
              </Typography.Heading1>
              <Typography.Body color="secondary">
                Master interview questions one card at a time
              </Typography.Body>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-4 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onValueChange={setSelectedDifficulty}
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

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {filteredQuestions.length} question
                  {filteredQuestions.length !== 1 ? "s" : ""} available
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShuffle}>
                    <Shuffle className="size-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="size-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {currentQuestion.topic}
              </Badge>
              <Badge
                variant="outline"
                className={`capitalize ${getDifficultyColor(currentQuestion.difficulty)}`}
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-8">
          <button
            type="button"
            className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer border-0 bg-transparent p-0 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={handleFlip}
            aria-label="Flip flashcard"
            style={{
              transformStyle: "preserve-3d",
              minHeight: "500px",
            }}
          >
            {/* Front of card (Question) */}
            <div
              className={`absolute inset-0 bg-card border-2 rounded-2xl shadow-2xl p-8 backface-hidden ${
                isFlipped ? "invisible" : "visible"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="flex flex-col h-full min-h-[500px]">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Typography.Heading3 className="text-lg">
                        {currentQuestion.title}
                      </Typography.Heading3>
                      <div className="flex items-center gap-2 mt-1">
                        {currentQuestion.companies?.[0] && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {currentQuestion.companies[0].name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Click to flip
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none text-center"
                    dangerouslySetInnerHTML={parseFullMarkdown(
                      currentQuestion.prompt,
                    )}
                  />
                </div>

                {/* Tags */}
                {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                    {currentQuestion.tags.slice(0, 5).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {currentQuestion.tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{currentQuestion.tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Back of card (Answer) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl shadow-2xl p-8 backface-hidden ${
                isFlipped ? "visible" : "invisible"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col h-full min-h-[500px]">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Typography.Heading3 className="text-lg">
                        Answer
                      </Typography.Heading3>
                      <Typography.Body color="secondary" className="text-sm">
                        {currentQuestion.title}
                      </Typography.Body>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                    Click to flip back
                  </div>
                </div>

                {/* Answer Content */}
                <div className="flex-1 overflow-y-auto">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={parseFullMarkdown(
                      currentQuestion.description ||
                        "Answer will be revealed after submission.",
                    )}
                  />
                </div>

                {/* Tech Stack */}
                {currentQuestion.primaryTechStack &&
                  currentQuestion.primaryTechStack.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <Typography.BodyMedium className="text-sm mb-2">
                        Tech Stack:
                      </Typography.BodyMedium>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.primaryTechStack.map(
                          (tech: string) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs bg-primary/5"
                            >
                              {tech}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-5" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant={isFlipped ? "default" : "outline"}
              size="lg"
              onClick={handleFlip}
              className="gap-2"
            >
              <RotateCcw className="size-5" />
              {isFlipped ? "Show Question" : "Show Answer"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Tip: Use <kbd className="px-2 py-1 bg-muted rounded">←</kbd> and{" "}
            <kbd className="px-2 py-1 bg-muted rounded">→</kbd> to navigate,{" "}
            <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to flip
          </p>
        </div>
      </div>
    </main>
  );
}
