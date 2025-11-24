"use client";

import {
  ArrowRight,
  BookOpen,
  Building2,
  Code2,
  Database,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PracticeQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyName: string;
  companyLogo: string;
  topicTags: string[];
}

interface PracticeLibraryPromoProps {
  questions: PracticeQuestion[];
}

const categoryIcons = {
  "system-design": Database,
  algorithms: Code2,
  frontend: Code2,
  backend: Database,
  behavioral: Users,
  database: Database,
} as const;

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function PracticeLibraryPromo({ questions }: PracticeLibraryPromoProps) {
  const router = useRouter();

  const truncateQuestion = (question: string, maxLength: number = 110) => {
    if (question.length <= maxLength) return question;
    return `${question.substring(0, maxLength)}...`;
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent =
      categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
    return IconComponent;
  };

  const [flippedId, setFlippedId] = useState<string | null>(null);

  const toggleFlip = (id: string) => {
    setFlippedId((current) => (current === id ? null : id));
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-[color:var(--secondary)] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-stretch auto-rows-min">
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-8 duration-1000 delay-400 flex flex-col items-center lg:items-start text-center lg:text-left order-first lg:order-last max-w-xl mx-auto lg:mx-0">
            <div className="space-y-3 sm:space-y-4">
              <Typography.Heading2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Practice Library
              </Typography.Heading2>
              <Typography.Body className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed px-2 sm:px-0">
                Master interview questions from top tech companies with our
                comprehensive practice library. Get AI-powered feedback and
                detailed explanations for every question.
              </Typography.Body>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">
                  Practice Questions
                </div>
              </div>
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <div className="text-2xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">
                  Top Companies
                </div>
              </div>
              <div className="text-center p-3 sm:px-4 rounded-lg bg-card/50 backdrop-blur-sm border hover:bg-card/70 transition-colors">
                <div className="text-2xl font-bold text-primary mb-1">AI</div>
                <div className="text-sm text-muted-foreground">
                  Powered Feedback
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="size-2 bg-primary rounded-full"></div>
                <Typography.Caption className="text-sm text-muted-foreground">
                  System Design, Algorithms, Frontend & more
                </Typography.Caption>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="size-2 bg-primary rounded-full"></div>
                <Typography.Caption className="text-sm text-muted-foreground">
                  Detailed solutions with explanations
                </Typography.Caption>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="size-2 bg-primary rounded-full"></div>
                <Typography.Caption className="text-sm text-muted-foreground">
                  Difficulty levels from easy to expert
                </Typography.Caption>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={() => router.push("/practice")}
                aria-label="Explore Practice Library"
                className="group w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium px-6 sm:px-4 mt-4"
              >
                Explore Practice Library
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-left-8 duration-1000 delay-200 order-last lg:order-first">
            {questions.slice(0, 4).map((question, index) => {
              const IconComponent = getCategoryIcon(question.category);
              const isFlipped = flippedId === question.id;
              return (
                <div
                  key={question.id}
                  className={`h-full min-h-[200px] sm:min-h-[230px] [perspective:1000px] ${
                    index >= 2 ? "hidden sm:block" : ""
                  }`}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFlip(question.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleFlip(question.id);
                      }
                    }}
                    className="relative h-full cursor-pointer transition-transform duration-500 group hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    style={{
                      animationDelay: `${400 + index * 150}ms`,
                      transformStyle: "preserve-3d",
                      transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                  >
                    <div
                      className="absolute inset-0 flex flex-col"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <CardHeader className="pt-3 pb-3 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="size-4 text-primary" />
                            <Badge
                              variant="outline"
                              className="text-xs capitalize px-2 py-1"
                            >
                              {question.category.replace("-", " ")}
                            </Badge>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-1 ${difficultyColors[question.difficulty]}`}
                          >
                            {question.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">
                          {truncateQuestion(
                            question.question.replace(/[#*]/g, "").trim(),
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="size-5 bg-muted rounded flex items-center justify-center flex-shrink-0">
                              <Building2 className="size-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium truncate">
                              {question.companyName}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          Included in the Practice Library with full solutions
                          and AI feedback.
                        </div>
                      </CardContent>
                    </div>

                    <div
                      className="absolute inset-0 flex flex-col"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <CardHeader className="pt-3 pb-3 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="size-4 text-primary" />
                            <Badge
                              variant="outline"
                              className="text-xs capitalize px-2 py-1"
                            >
                              Answer
                            </Badge>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-1 ${difficultyColors[question.difficulty]}`}
                          >
                            {question.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 flex flex-col justify-between">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {question.answer}
                        </p>
                        <div className="mt-3 text-[11px] text-muted-foreground/80">
                          Each question in the Practice Library includes
                          detailed, step-by-step solutions.
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
