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
import {
  getAllPracticeQuestions,
  type PracticeQuestion,
  searchPracticeQuestions,
} from "@/lib/services/practice-questions/practice-questions-service";
import { QuestionModal } from "../modals/question-modal";

// Simple markdown renderer with XSS protection
function renderMarkdown(text: string | null | undefined): { __html: string } {
  if (!text) return { __html: "" };

  // Basic XSS protection - escape HTML
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Process markdown
  let html = escapeHtml(text)
    // Headers
    .replace(
      /^### (.*$)/gim,
      '</p><h3 class="text-lg font-bold mt-6 mb-2">$1</h3><p class="mt-2">',
    )
    .replace(
      /^## (.*$)/gim,
      '</p><h2 class="text-xl font-bold mt-6 mb-3">$1</h2><p class="mt-2">',
    )
    .replace(
      /^# (.*$)/gim,
      '</p><h1 class="text-2xl font-bold mt-6 mb-4">$1</h1><p class="mt-2">',
    )

    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Code blocks
    .replace(
      /```([\s\S]*?)```/g,
      '</p><pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded my-3 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre><p class="mt-2">',
    )

    // Inline code
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )

    // Links (with security attributes)
    .replace(
      /\[([^\]]+)\]$$([^\s)]+)(?:\s+"([^"]+)")?$$/g,
      (text: string, href: string, title?: string) => {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(href)}" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer"${titleAttr}>${escapeHtml(text)}</a>`;
      },
    )

    // Lists
    .replace(/^\s*\* (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-6 list-decimal">$1</li>')

    // Blockquotes
    .replace(
      /^> (.*$)/gm,
      '</p><blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-600 dark:text-gray-400">$1</blockquote><p>',
    )

    // Horizontal rule
    .replace(
      /^\*\*\*$/gm,
      '<hr class="my-4 border-gray-200 dark:border-gray-700" />',
    )

    // Paragraphs and line breaks
    .replace(/\n\n+/g, '</p><p class="mt-4">')
    .replace(/\n/g, "<br />");

  // Wrap in a paragraph if needed
  if (
    !html.startsWith("<h") &&
    !html.startsWith("<p>") &&
    !html.startsWith("<ul>") &&
    !html.startsWith("<ol>") &&
    !html.startsWith("<pre>")
  ) {
    html = `<p>${html}`;
  }
  if (
    !html.endsWith("</p>") &&
    !html.endsWith("</h1>") &&
    !html.endsWith("</h2>") &&
    !html.endsWith("</h3>") &&
    !html.endsWith("</ul>") &&
    !html.endsWith("</ol>") &&
    !html.endsWith("</pre>")
  ) {
    html = `${html}</p>`;
  }

  return { __html: html };
}

interface PracticeContentProps {
  user: UserData;
}

export function PracticeContent({ user: _user }: PracticeContentProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedQuestion, setSelectedQuestion] =
    useState<PracticeQuestion | null>(null);
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
        const data = await getAllPracticeQuestions();
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
    const filterQuestions = async () => {
      try {
        let filtered = questions;

        if (searchTerm) {
          filtered = await searchPracticeQuestions(searchTerm);
        }

        if (selectedCategory !== "all") {
          filtered = filtered.filter((q) => q.category === selectedCategory);
        }

        if (selectedDifficulty !== "all") {
          filtered = filtered.filter(
            (q) => q.difficulty === selectedDifficulty,
          );
        }

        setFilteredQuestions(filtered);
      } catch (err) {
        console.error("Error filtering questions:", err);
        let filtered = questions;

        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (q) =>
              (q.title || "").toLowerCase().includes(lower) ||
              q.question.toLowerCase().includes(lower) ||
              q.category.toLowerCase().includes(lower) ||
              (q.companyLogo || "").toLowerCase().includes(lower) ||
              q.topicTags.some((tag) => tag.toLowerCase().includes(lower)),
          );
        }

        if (selectedCategory !== "all") {
          filtered = filtered.filter((q) => q.category === selectedCategory);
        }

        if (selectedDifficulty !== "all") {
          filtered = filtered.filter(
            (q) => q.difficulty === selectedDifficulty,
          );
        }

        setFilteredQuestions(filtered);
      }
    };

    filterQuestions();
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      "system-design": Building2,
      algorithms: Code,
      frontend: Code,
      backend: Database,
      database: Database,
      cloud: Cloud,
    };
    return icons[category] || BookOpen;
  };

  const getCompanyIcon = (logoName: string) => {
    const Icon = (
      SimpleIcons as Record<string, React.ComponentType<{ className?: string }>>
    )[logoName];
    return Icon || SimpleIcons.SiApple;
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
                          className="font-semibold text-sm line-clamp-2 text-foreground"
                          dangerouslySetInnerHTML={renderMarkdown(q.title)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {q.companyLogo?.replace("Si", "") || "Company"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {q.category.replace("-", " ")}
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
                        {q.topicTags?.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {q.topicTags && q.topicTags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{q.topicTags.length - 3}
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
              const CategoryIcon = getCategoryIcon(q.category);
              const CompanyIcon = getCompanyIcon(q.companyLogo);

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
                          {q.companyLogo?.replace("Si", "") || "Company"}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {q.category.replace("-", " ")}
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3
                      className="font-semibold text-base text-foreground mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={renderMarkdown(q.title)}
                    />

                    {/* Question Preview */}
                    <div
                      className="text-sm text-muted-foreground mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={renderMarkdown(q.question)}
                    />

                    {/* Tags */}
                    {q.topicTags && q.topicTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {q.topicTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {q.topicTags.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                            +{q.topicTags.length - 3}
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
