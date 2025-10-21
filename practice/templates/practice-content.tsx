"use client";

import {
  AlertCircle,
  BookOpen,
  Building2,
  Cloud,
  Code,
  Database,
  ExternalLink,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as SimpleIcons from "react-icons/si";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/lib/services/auth/auth";
import {
  getAllPracticeQuestions,
  type PracticeQuestion,
  searchPracticeQuestions,
} from "@/lib/services/practice-questions/practice-questions-service";

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
      /\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)/g,
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

// Modal Component
function QuestionModal({
  question,
  onClose,
}: {
  question: PracticeQuestion;
  onClose: () => void;
}) {
  const CompanyIcon =
    (SimpleIcons as any)[question.companyLogo] || SimpleIcons.SiApple;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <CompanyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {question.companyName}
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {question.category.replace("-", " ")}
              </span>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Question
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  question.difficulty === "easy"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : question.difficulty === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {question.difficulty.toUpperCase()}
              </span>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={renderMarkdown(question.question)}
            />
          </div>

          {/* Tags */}
          {question.topicTags && question.topicTags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {question.topicTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Answer */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Answer
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={renderMarkdown(question.answer)}
            />
          </div>

          {/* Learning Resources */}
          {question.learningResources &&
            question.learningResources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Learning Resources
                </h4>
                <div className="space-y-2">
                  {question.learningResources.map((resource) => (
                    <a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all group"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {resource.type}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
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
              q.question.toLowerCase().includes(lower) ||
              q.category.toLowerCase().includes(lower) ||
              q.companyName.toLowerCase().includes(lower) ||
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
    const icons: Record<string, any> = {
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
    const Icon = (SimpleIcons as any)[logoName];
    return Icon || SimpleIcons.SiApple;
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
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
      <main className="flex-1 flex items-center justify-center">
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
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Practice Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Master your interview skills with real company questions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search questions, tags, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="algorithms">Algorithms</option>
              <option value="data-structures">Data Structures</option>
              <option value="system-design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="devops">DevOps</option>
              <option value="security">Security</option>
              <option value="testing">Testing</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((q) => {
            const CategoryIcon = getCategoryIcon(q.category);
            const CompanyIcon = getCompanyIcon(q.companyLogo);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <CompanyIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {q.companyName}
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
                    <CategoryIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {q.category.replace("-", " ")}
                    </span>
                  </div>

                  {/* Question Preview */}
                  <div
                    className="text-sm text-gray-800 dark:text-gray-300 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={renderMarkdown(q.question)}
                  />

                  {/* Tags */}
                  {q.topicTags && q.topicTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {q.topicTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {q.topicTags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{q.topicTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* See More Button */}
                  <Button
                    onClick={() => setSelectedQuestion(q)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    See More
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

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
