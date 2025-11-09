"use client";

import {
  AlertCircle,
  BookOpen,
  Building2,
  Cloud,
  Code,
  Database,
  Grid3x3,
  LayoutGrid,
  List,
  Loader2,
  Search,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import * as SimpleIcons from "react-icons/si";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserData } from "@/lib/services/auth/auth";
import { queryQuestions } from "@/lib/services/questions/question-repository";
import { parseSimpleMarkdown } from "@/lib/utils/markdown-parser";
import type { Question } from "@/types/practice-question";
import { QuestionModal } from "../modals/question-modal";

interface PracticeContentProps {
  user: UserData;
}

export function PracticeContent({ user: _user }: PracticeContentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewLayout, setViewLayout] = useState<"grid" | "compact" | "list">(
    "grid",
  );

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const { questions: data } = await queryQuestions({
          filters: { status: "published" },
          limit: 1000,
        });
        setQuestions(data);
        setFilteredQuestions(data);
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

    // Topic filter (replacing category)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((q) => q.topic === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedDifficulty, questions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getCategoryIcon = (topic: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      "System Design": Building2,
      "Algorithms & Data Structures": Code,
      Frontend: Code,
      Backend: Database,
      Database: Database,
      Cloud: Cloud,
    };
    return icons[topic] || BookOpen;
  };

  const getCompanyIcon = (logoName: string | undefined) => {
    if (!logoName) return Building2;
    const Icon = (
      SimpleIcons as Record<string, React.ComponentType<{ className?: string }>>
    )[logoName];
    return Icon || Building2;
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading practice questions...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Questions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <section className="border-b bg-gradient-to-b from-muted/50 to-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          {/* Search and Filters */}
          <div className="space-y-5">
            {/* Primary Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions, tags, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm focus:shadow-md transition-shadow"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  onValueChange={setSelectedCategory}
                  value={selectedCategory}
                >
                  <SelectTrigger className="w-[180px] h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="algorithms">Algorithms</SelectItem>
                    <SelectItem value="data-structures">
                      Data Structures
                    </SelectItem>
                    <SelectItem value="system-design">System Design</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={setSelectedDifficulty}
                  value={selectedDifficulty}
                >
                  <SelectTrigger className="w-[160px] h-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[20px]" />

              {(searchTerm ||
                selectedCategory !== "all" ||
                selectedDifficulty !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                  className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Practice Questions</h2>
              <Badge variant="secondary">
                {filteredQuestions.length} questions
              </Badge>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  onValueChange={(val) => setItemsPerPage(Number(val))}
                  value={itemsPerPage.toString()}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout view options */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewLayout === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewLayout("grid")}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewLayout === "compact" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewLayout("compact")}
                  className="h-8 px-2"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewLayout === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewLayout("list")}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Questions Content */}
      <section className="container mx-auto px-6 py-8">
        {/* Questions Grid/Table */}
        {viewLayout === "list" ? (
          <div className="mb-8 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuestions.map((q) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="max-w-md">
                        <h3
                          className="font-semibold text-sm line-clamp-2 text-foreground prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={parseSimpleMarkdown(q.title)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {q.companies?.[0]?.name || "Company"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {q.topic}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-xs">
                        {q.tags?.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {q.tags && q.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{q.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => setSelectedQuestion(q)}
                        size="sm"
                        className="h-8"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div
            className={`grid gap-6 mb-8 ${
              viewLayout === "grid"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {paginatedQuestions.map((q) => {
              const CategoryIcon = getCategoryIcon(q.topic);
              const CompanyIcon = getCompanyIcon(q.companies?.[0]?.logo);

              return (
                <div
                  key={q.id}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <CompanyIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {q.companies?.[0]?.name || "Company"}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Topic */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {q.topic}
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3
                      className="font-semibold text-base text-foreground mb-2 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={parseSimpleMarkdown(q.title)}
                    />

                    {/* Question Preview */}
                    <div
                      className="text-sm text-muted-foreground mb-4 line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={parseSimpleMarkdown(q.prompt)}
                    />

                    {/* Tags */}
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {q.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {q.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                            +{q.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* See More Button */}
                    <Button
                      onClick={() => setSelectedQuestion(q)}
                      className="w-full"
                    >
                      See More
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredQuestions.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={`page-${pageNum}`}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No questions found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </main>
  );
}
