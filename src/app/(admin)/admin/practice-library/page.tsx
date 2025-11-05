"use client";

import {
  Edit,
  Grid3x3,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import {
  CATEGORIES,
  COMPANY_LOGOS,
  COMPANY_SIZES,
  ComprehensiveQuestionForm,
  formatLabel,
} from "@/components/forms/organisms/comprehensive-question-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { isSuperAdmin } from "@/lib/services/auth/auth-roles";
import {
  type CompanyLogo,
  type CompanySize,
  createPracticeQuestion,
  deletePracticeQuestion,
  getAllPracticeQuestions,
  type PracticeQuestion,
  updatePracticeQuestion,
} from "@/lib/services/practice-questions/practice-questions-service";
import { useAuth } from "@/providers/auth-provider";

// SWR fetcher function
const fetcher = async () => {
  return await getAllPracticeQuestions();
};

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
      (_match, text, href, title) => {
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

// Helper function to get company name from logo
const getCompanyNameFromLogo = (logo: CompanyLogo): string => {
  const logoToName: Record<CompanyLogo, string> = {
    // FAANG/Big Tech
    SiGoogle: "Google",
    SiMeta: "Meta",
    SiAmazon: "Amazon",
    SiApple: "Apple",
    SiNetflix: "Netflix",
    SiMicrosoft: "Microsoft",

    // Other Tech Giants
    SiTesla: "Tesla",
    SiNvidia: "NVIDIA",
    SiOracle: "Oracle",
    SiSalesforce: "Salesforce",
    SiIbm: "IBM",
    SiIntel: "Intel",
    SiAdobe: "Adobe",
    SiSap: "SAP",
    SiCisco: "Cisco",
    SiX: "X (Twitter)",
    SiLinkedin: "LinkedIn",
    SiSnapchat: "Snapchat",
    SiTiktok: "TikTok",
    SiReddit: "Reddit",

    // Cloud & Infrastructure
    SiAmazonaws: "AWS",
    SiMicrosoftazure: "Microsoft Azure",
    SiGooglecloud: "Google Cloud",
    SiCloudflare: "Cloudflare",
    SiVercel: "Vercel",

    // Payment & Fintech
    SiStripe: "Stripe",
    SiPaypal: "PayPal",
    SiSquare: "Square",
    SiCoinbase: "Coinbase",

    // Other Tech Companies
    SiSpotify: "Spotify",
    SiUber: "Uber",
    SiAirbnb: "Airbnb",
    SiShopify: "Shopify",

    // Communication & Collaboration
    SiZoom: "Zoom",
    SiSlack: "Slack",
    SiDropbox: "Dropbox",
    SiNotion: "Notion",
    SiAtlassian: "Atlassian",
    SiTwilio: "Twilio",

    // Developer Tools & Platforms
    SiGithub: "GitHub",
    SiGitlab: "GitLab",

    // Data & Analytics
    SiDatadog: "Datadog",
    SiSnowflake: "Snowflake",
    SiDatabricks: "Databricks",

    // Financial & Trading
    SiOptiver: "Optiver",

    // Hardware & Semiconductors
    SiQualcomm: "Qualcomm",

    // International Tech Companies
    SiNetguru: "Netguru",
    SiHexagon: "Hexagon AB",
    SiDassaultsystemes: "Dassault Systèmes",
  };
  return logoToName[logo] || logo;
};

export default function ManagePracticeLibraryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [companySizeFilter, setCompanySizeFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewLayout, setViewLayout] = useState<"grid" | "compact" | "list">(
    "grid",
  );

  // Check authorization
  useEffect(() => {
    if (!loading && !isSuperAdmin(user)) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Use SWR for data fetching
  const {
    data: questions = [],
    error,
    isLoading,
    mutate,
  } = useSWR<PracticeQuestion[]>("practice-questions", fetcher, {
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions. Please try again.");
    },
  });

  // DO NOT ADD QUESTIONS TO THIS ARRAY DEPENDENCY MATI

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional stable dependency
  const stableQuestions = useMemo(() => questions, [JSON.stringify(questions)]);

  useEffect(() => {
    let filtered = stableQuestions;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCompanyNameFromLogo(q.companyLogo)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          q.topicTags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((q) => q.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((q) => q.companyLogo === companyFilter);
    }

    if (companySizeFilter !== "all") {
      filtered = filtered.filter((q) =>
        q.companySize?.includes(companySizeFilter as CompanySize),
      );
    }

    setFilteredQuestions(filtered);
  }, [
    stableQuestions,
    searchTerm,
    categoryFilter,
    difficultyFilter,
    companyFilter,
    companySizeFilter,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deletePracticeQuestion(id);
      toast.success("Question deleted successfully");
      mutate(); // Revalidate SWR cache
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Using imported constants for consistent filtering
  // const categories = Array.from(new Set(stableQuestions.map((q) => q.category)));
  // const companies = Array.from(new Set(stableQuestions.map((q) => q.companyLogo)));

  if (loading || !isSuperAdmin(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          {/* Filters Bar */}
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Speed run mock dla chłopaków
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new practice question for the library
                      </DialogDescription>
                    </DialogHeader>
                    <ComprehensiveQuestionForm
                      onSubmit={async (data) => {
                        try {
                          await createPracticeQuestion(data);
                          toast.success("Question created successfully");
                          setShowAddDialog(false);
                          mutate(); // Revalidate SWR cache
                        } catch (error) {
                          console.error("Error creating question:", error);
                          toast.error("Failed to create question");
                        }
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stableQuestions.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {COMPANY_LOGOS.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {CATEGORIES.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Medium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        stableQuestions.filter((q) => q.difficulty === "medium")
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Select
                    value={companyFilter}
                    onValueChange={setCompanyFilter}
                  >
                    <SelectTrigger id="company">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {COMPANY_LOGOS.map((logo) => (
                        <SelectItem key={logo} value={logo}>
                          {getCompanyNameFromLogo(logo)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {formatLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={companySizeFilter}
                    onValueChange={setCompanySizeFilter}
                  >
                    <SelectTrigger id="companySize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {formatLabel(size)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

                <Button variant="outline" size="sm" onClick={() => mutate()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Badge variant="secondary">
                  {filteredQuestions.length} of {stableQuestions.length}{" "}
                  questions
                </Badge>
              </div>
            </div>
          </div>

          {/* Questions Content */}
          <div className="container mx-auto px-6 py-6">
            {/* Questions List */}
            {viewLayout === "list" ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="mt-4 text-muted-foreground">
                            Loading questions...
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <p className="text-destructive mb-4">
                            Failed to load questions. Please try again.
                          </p>
                          <Button onClick={() => mutate()}>Retry</Button>
                        </TableCell>
                      </TableRow>
                    ) : paginatedQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <p className="text-muted-foreground">
                            No questions found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedQuestions.map((question) => (
                        <TableRow
                          key={question.id}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="max-w-md">
                              <h3
                                className="font-semibold text-sm line-clamp-2 mb-1"
                                dangerouslySetInnerHTML={renderMarkdown(
                                  question.title,
                                )}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getCompanyNameFromLogo(question.companyLogo)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {question.category.replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {question.difficulty.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-xs">
                              {question.topicTags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {question.topicTags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.topicTags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog
                                open={editingQuestionId === question.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingQuestionId(null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingQuestionId(question.id || null);
                                    }}
                                    className="h-8"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Question</DialogTitle>
                                    <DialogDescription>
                                      Update the practice question details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ComprehensiveQuestionForm
                                    initialData={question}
                                    onSubmit={async (data) => {
                                      if (!question.id) return;
                                      try {
                                        await updatePracticeQuestion(
                                          question.id,
                                          data,
                                        );
                                        toast.success(
                                          "Question updated successfully",
                                        );
                                        setEditingQuestionId(null);
                                        mutate();
                                      } catch (error) {
                                        console.error(
                                          "Error updating question:",
                                          error,
                                        );
                                        toast.error(
                                          "Failed to update question",
                                        );
                                      }
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!question.id) return;
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this question?",
                                    )
                                  ) {
                                    try {
                                      await deletePracticeQuestion(question.id);
                                      toast.success(
                                        "Question deleted successfully",
                                      );
                                      mutate();
                                    } catch (error) {
                                      console.error(
                                        "Error deleting question:",
                                        error,
                                      );
                                      toast.error("Failed to delete question");
                                    }
                                  }
                                }}
                                className="h-8"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewLayout === "grid"
                    ? "grid-cols-1 lg:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {isLoading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-4 text-muted-foreground">
                        Loading questions...
                      </p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-destructive mb-4">
                        Failed to load questions. Please try again.
                      </p>
                      <Button onClick={() => mutate()}>Retry</Button>
                    </CardContent>
                  </Card>
                ) : paginatedQuestions.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No questions found
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedQuestions.map((question) => (
                    <Card key={question.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="font-semibold"
                              >
                                {getCompanyNameFromLogo(question.companyLogo)}
                              </Badge>
                              <Badge
                                variant={
                                  question.difficulty === "easy"
                                    ? "default"
                                    : question.difficulty === "medium"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {question.difficulty.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {question.category.replace("-", " ")}
                              </Badge>
                            </div>
                            <h3
                              className="font-bold text-xl prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={renderMarkdown(
                                question.title,
                              )}
                            />
                            <div className="flex gap-2 flex-wrap">
                              {question.topicTags.slice(0, 5).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {question.topicTags.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.topicTags.length - 5} more
                                </Badge>
                              )}
                            </div>
                            {/* Tech Stack Preview */}
                            {(question.languages ||
                              question.databases ||
                              question.cloudProviders) && (
                              <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                                {question.languages &&
                                  question.languages.length > 0 && (
                                    <span>
                                      💻{" "}
                                      {question.languages
                                        .slice(0, 3)
                                        .join(", ")}
                                    </span>
                                  )}
                                {question.databases &&
                                  question.databases.length > 0 && (
                                    <span>
                                      🗄️{" "}
                                      {question.databases
                                        .slice(0, 2)
                                        .join(", ")}
                                    </span>
                                  )}
                                {question.cloudProviders &&
                                  question.cloudProviders.length > 0 && (
                                    <span>
                                      ☁️ {question.cloudProviders.join(", ")}
                                    </span>
                                  )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog
                              open={editingQuestionId === question.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingQuestionId(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setEditingQuestionId(question.id || null)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Question</DialogTitle>
                                  <DialogDescription>
                                    Update the practice question details
                                  </DialogDescription>
                                </DialogHeader>
                                <ComprehensiveQuestionForm
                                  initialData={question}
                                  onSubmit={async (data) => {
                                    if (!question.id) return;
                                    try {
                                      await updatePracticeQuestion(
                                        question.id,
                                        data,
                                      );
                                      toast.success(
                                        "Question updated successfully",
                                      );
                                      setEditingQuestionId(null);
                                      mutate();
                                    } catch (error) {
                                      console.error(
                                        "Error updating question:",
                                        error,
                                      );
                                      toast.error("Failed to update question");
                                    }
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                question.id && handleDelete(question.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredQuestions.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredQuestions.length)} of{" "}
                  {filteredQuestions.length} questions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ),
                    )}
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
