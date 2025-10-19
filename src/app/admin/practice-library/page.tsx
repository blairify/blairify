"use client";

import { Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ComprehensiveQuestionForm } from "@/components/forms/comprehensive-question-form";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
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
import { isSuperAdmin } from "@/lib/auth-roles";
import {
  type CompanyLogo,
  createPracticeQuestion,
  deletePracticeQuestion,
  getAllPracticeQuestions,
  type PracticeQuestion,
  updatePracticeQuestion,
} from "@/lib/practice-questions-service";
import { useAuth } from "@/providers/auth-provider";

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
  };
  return logoToName[logo] || logo;
};

export default function ManagePracticeLibraryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );

  // Check authorization
  useEffect(() => {
    if (!loading && !isSuperAdmin(user)) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllPracticeQuestions();
      setQuestions(data);
      setFilteredQuestions(data);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Filter questions
  useEffect(() => {
    let filtered = questions;

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

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, categoryFilter, difficultyFilter, companyFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deletePracticeQuestion(id);
      toast.success("Question deleted successfully");
      loadQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const companies = Array.from(new Set(questions.map((q) => q.companyLogo)));

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
          <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Manage Practice Library</h1>
                <p className="text-muted-foreground">
                  Add, edit, and manage practice questions in Firestore
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
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
                        loadQuestions();
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Total Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{questions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Medium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {questions.filter((q) => q.difficulty === "medium").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        {companies.map((logo) => (
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
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace("-", " ").toUpperCase()}
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
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={loadQuestions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Badge variant="secondary">
                    {filteredQuestions.length} of {questions.length} questions
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">
                      Loading questions...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No questions found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="font-semibold">
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
                          <h3 className="font-semibold text-lg">
                            {question.question}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {question.answer}
                          </p>
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
                                    {question.languages.slice(0, 3).join(", ")}
                                  </span>
                                )}
                              {question.databases &&
                                question.databases.length > 0 && (
                                  <span>
                                    🗄️{" "}
                                    {question.databases.slice(0, 2).join(", ")}
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
                                    loadQuestions();
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
          </div>
        </main>
      </div>
    </div>
  );
}
