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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PracticeQuestion {
  id: string;
  question: string;
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

  const truncateQuestion = (question: string, maxLength: number = 200) => {
    if (question.length <= maxLength) return question;
    return `${question.substring(0, maxLength)}...`;
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent =
      categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
    return IconComponent;
  };

  return (
    <section className="max-w-7xl mx-auto py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-stretch max-h-[500px]">
          {/* Cards Side - Left */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-left-8 duration-1000 delay-200">
            {questions.slice(0, 4).map((question, index) => {
              const IconComponent = getCategoryIcon(question.category);
              return (
                <Card
                  key={question.id}
                  className={`transition-all justify-between gap-2 duration-300 hover:scale-[1.02] group hover:border-primary/50 h-full flex flex-col ${index >= 2 ? "hidden sm:flex" : ""}`}
                  style={{
                    animationDelay: `${400 + index * 150}ms`,
                  }}
                >
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary" />
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
                    <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
                      {truncateQuestion(
                        question.question.replace(/[#*]/g, "").trim(),
                        200,
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col justify-end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium truncate">
                          {question.companyName}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {question.topicTags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {question.topicTags.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            +{question.topicTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Content Side - Right */}
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-1000 delay-400 text-left">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                Practice Library
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Master interview questions from top tech companies with our
                comprehensive practice library. Get AI-powered feedback and
                detailed explanations for every question.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
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
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  System Design, Algorithms, Frontend & more{" "}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Detailed solutions with explanations{" "}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Difficulty levels from easy to expert
                </span>
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                onClick={() => router.push("/practice")}
                aria-label="Explore Practice Library"
                className="group mt-4"
              >
                Explore Practice Library
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
