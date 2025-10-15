"use client";

import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Filter,
  FilterX,
  Plus,
  Search,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import practiceData, {
  type Category,
  type Company,
  type DocumentationLink,
  type Language,
  type Question,
} from "@/data/practice-data";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/providers/auth-provider";

interface ExtendedQuestion extends Question {
  categoryName: string;
  categoryId: string;
}

export default function PracticePage() {
  const { user, loading } = useAuth();
  const { loading: authLoading } = useAuthGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Search states for filter sections
  const [languageSearch, setLanguageSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    practiceData.categories.forEach((category: Category) => {
      category.questions.forEach((question: Question) => {
        question.tags.forEach((tag: string) => {
          tagSet.add(tag);
        });
      });
    });
    return Array.from(tagSet).sort();
  }, []);

  const filteredQuestions = useMemo(() => {
    const allQuestions: ExtendedQuestion[] = [];

    practiceData.categories.forEach((category: Category) => {
      category.questions.forEach((question: Question) => {
        allQuestions.push({
          ...question,
          categoryName: category.name,
          categoryId: category.id,
        });
      });
    });

    return allQuestions.filter((question: ExtendedQuestion) => {
      const matchesSearch =
        searchQuery === "" ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(question.categoryId);
      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(question.difficulty);
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag: string) => question.tags.includes(tag));
      const matchesCompany =
        selectedCompanies.length === 0 ||
        (question.company && selectedCompanies.includes(question.company));
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (question.language && selectedLanguages.includes(question.language));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesTags &&
        matchesCompany &&
        matchesLanguage
      );
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedDifficulties,
    selectedTags,
    selectedCompanies,
    selectedLanguages,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  // Reset pagination when question count changes
  const _questionCount = filteredQuestions.length;
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Filtered data for search functionality
  const filteredLanguages = useMemo(() => {
    return practiceData.languages.filter((language: Language) =>
      language.name.toLowerCase().includes(languageSearch.toLowerCase()),
    );
  }, [languageSearch]);

  const filteredCompanies = useMemo(() => {
    return practiceData.companies.filter(
      (company: Company) =>
        company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        company.industry.toLowerCase().includes(companySearch.toLowerCase()),
    );
  }, [companySearch]);

  const filteredTags = useMemo(() => {
    return allTags.filter((tag: string) =>
      tag.toLowerCase().replace(/-/g, " ").includes(tagSearch.toLowerCase()),
    );
  }, [tagSearch, allTags]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company],
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSelectedCompanies([]);
    setSelectedLanguages([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedTags.length > 0 ||
    selectedCompanies.length > 0 ||
    selectedLanguages.length > 0 ||
    searchQuery !== "";

  const getCompanyInfo = (companyId: string): Company | undefined => {
    return practiceData.companies.find((c: Company) => c.id === companyId);
  };

  const getLanguageInfo = (languageId: string): Language | undefined => {
    return practiceData.languages.find((l: Language) => l.id === languageId);
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user) {
    window.location.href = "/auth";
    return <LoadingPage />;
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

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
            {/* Header and Statistics */}
            <div className="flex flex-col mb-6 sm:mb-8 gap-3 sm:gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Questions
                        </p>
                        <p className="text-2xl font-bold">
                          {practiceData.metadata.totalQuestions}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Categories
                        </p>
                        <p className="text-2xl font-bold">
                          {practiceData.metadata.totalCategories}
                        </p>
                      </div>
                      <Tag className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Filtered Results
                        </p>
                        <p className="text-2xl font-bold">
                          {filteredQuestions.length}
                        </p>
                      </div>
                      <Filter className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Updated
                        </p>
                        <p className="text-sm font-medium">
                          {practiceData.metadata.lastUpdated}
                        </p>
                      </div>
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search questions, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Start Filters */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="relative flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"></div>
                      <span className="text-foreground">Quick Start</span>
                      {/* Advanced Filter State Indicator */}
                      {hasActiveFilters && (
                        <div className="relative">
                          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse shadow-sm" />
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        </div>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground font-normal">
                    Popular filter combinations to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDifficulties(["beginner"]);
                        setSelectedCategories([]);
                        setSelectedTags([]);
                        setSelectedLanguages([]);
                        setSelectedCompanies([]);
                      }}
                      className="h-12 flex items-center justify-start gap-3 px-4 hover:bg-emerald-50/80 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 bg-background/50 backdrop-blur-sm font-medium text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm flex-shrink-0" />
                      <span className="text-center leading-tight truncate">
                        Beginner Friendly
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategories(["technical"]);
                        setSelectedDifficulties([]);
                        setSelectedTags([]);
                        setSelectedLanguages([]);
                        setSelectedCompanies([]);
                      }}
                      className="h-12 flex items-center justify-start gap-3 px-4 hover:bg-blue-50/80 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:border-blue-700 dark:hover:text-blue-300 transition-all duration-200 bg-background/50 backdrop-blur-sm font-medium text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm flex-shrink-0" />
                      <span className="text-center leading-tight truncate">
                        Coding Challenges
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategories(["system-design"]);
                        setSelectedDifficulties([]);
                        setSelectedTags([]);
                        setSelectedLanguages([]);
                        setSelectedCompanies([]);
                      }}
                      className="h-12 flex items-center justify-start gap-3 px-4 hover:bg-orange-50/80 hover:border-orange-300 hover:text-orange-700 dark:hover:bg-orange-950/50 dark:hover:border-orange-700 dark:hover:text-orange-300 transition-all duration-200 bg-background/50 backdrop-blur-sm font-medium text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-orange-500 shadow-sm flex-shrink-0" />
                      <span className="text-center leading-tight truncate">
                        System Design
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCompanies([
                          "google",
                          "meta",
                          "amazon",
                          "apple",
                          "microsoft",
                        ]);
                        setSelectedCategories([]);
                        setSelectedDifficulties([]);
                        setSelectedTags([]);
                        setSelectedLanguages([]);
                      }}
                      className="h-12 flex items-center justify-start gap-3 px-4 hover:bg-purple-50/80 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-950/50 dark:hover:border-purple-700 dark:hover:text-purple-300 transition-all duration-200 bg-background/50 backdrop-blur-sm font-medium text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-purple-500 shadow-sm flex-shrink-0" />
                      <span className="text-center leading-tight truncate">
                        FAANG Companies
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <Card className="shadow-sm border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary/30 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                          <Filter className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold text-primary dark:text-primary-foreground text-sm">
                            Active Filters
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                            {selectedCategories.length +
                              selectedDifficulties.length +
                              selectedTags.length +
                              selectedCompanies.length +
                              selectedLanguages.length}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-primary hover:text-primary hover:bg-primary/20 dark:text-primary-foreground dark:hover:text-primary-foreground dark:hover:bg-primary/20 font-medium transition-all duration-200"
                      >
                        <FilterX className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedCategories.map((categoryId) => {
                        const category = practiceData.categories.find(
                          (c: Category) => c.id === categoryId,
                        );
                        return (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="bg-background/80 border-primary/30 text-foreground hover:bg-background/90 dark:bg-background/60 dark:border-primary/40 dark:text-foreground shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                            onClick={() => toggleCategory(categoryId)}
                          >
                            {category?.name}
                            <X className="h-3 w-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        );
                      })}
                      {selectedDifficulties.map((difficulty) => (
                        <Badge
                          key={difficulty}
                          variant="secondary"
                          className="bg-background/80 border-primary/30 text-foreground hover:bg-background/90 dark:bg-background/60 dark:border-primary/40 dark:text-foreground capitalize shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                          onClick={() => toggleDifficulty(difficulty)}
                        >
                          {difficulty}
                          <X className="h-3 w-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      ))}
                      {selectedLanguages.map((languageId) => {
                        const language = getLanguageInfo(languageId);
                        return (
                          <Badge
                            key={languageId}
                            variant="secondary"
                            className="bg-background/80 border-primary/30 text-foreground hover:bg-background/90 dark:bg-background/60 dark:border-primary/40 dark:text-foreground flex items-center shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                            onClick={() => toggleLanguage(languageId)}
                          >
                            <div
                              className="h-2 w-2 mr-2 rounded-full shadow-sm"
                              style={{
                                backgroundColor: language?.color || "#6b7280",
                              }}
                            />
                            {language?.name || languageId}
                            <X className="h-3 w-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        );
                      })}
                      {selectedCompanies.map((companyId) => {
                        const company = getCompanyInfo(companyId);
                        return (
                          <Badge
                            key={companyId}
                            variant="secondary"
                            className="bg-background/80 border-primary/30 text-foreground hover:bg-background/90 dark:bg-background/60 dark:border-primary/40 dark:text-foreground flex items-center shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                            onClick={() => toggleCompany(companyId)}
                          >
                            {company && (
                              <Image
                                src={company.logo}
                                alt={company.name}
                                width={12}
                                height={12}
                                className="h-3 w-3 mr-2 rounded shadow-sm"
                              />
                            )}
                            {company?.name || companyId}
                            <X className="h-3 w-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        );
                      })}
                      {selectedTags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-background/80 border-primary/30 text-foreground hover:bg-background/90 dark:bg-background/60 dark:border-primary/40 dark:text-foreground shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag.replace(/-/g, " ")}
                          <X className="h-3 w-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      ))}
                      {selectedTags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-background/80 border-primary/30 text-foreground dark:bg-background/60 dark:border-primary/40 dark:text-foreground shadow-sm font-medium"
                        >
                          +{selectedTags.length - 3} more tags
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advanced Filters */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Card className="shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm bg-background/95 hover:bg-background">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground leading-tight">
                              Advanced Filters
                            </h3>
                            <p className="text-sm text-muted-foreground font-normal mt-1">
                              Customize your search criteria with detailed
                              options
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasActiveFilters && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                              <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 font-medium text-xs">
                                {selectedCategories.length +
                                  selectedDifficulties.length +
                                  selectedTags.length +
                                  selectedCompanies.length +
                                  selectedLanguages.length}{" "}
                                active
                              </Badge>
                            </div>
                          )}
                          <div className="p-1 rounded transition-colors">
                            {filtersOpen ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Categories Card */}
                    <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4 border-b border-border/20">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                          </div>
                          Categories
                          {selectedCategories.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                            >
                              {selectedCategories.length} selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                          {practiceData.categories.map((category: Category) => (
                            <Button
                              key={category.id}
                              variant={
                                selectedCategories.includes(category.id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleCategory(category.id)}
                              className={`justify-between h-10 px-3 font-medium transition-all duration-200 ${
                                selectedCategories.includes(category.id)
                                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-blue-500"
                                  : "bg-background hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 border-border/60"
                              }`}
                            >
                              <span className="truncate text-sm">
                                {category.name}
                              </span>
                              {selectedCategories.includes(category.id) ? (
                                <X className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 flex-shrink-0 ml-2 opacity-40" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Difficulty Card */}
                    <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4 border-b border-border/20">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                          </div>
                          Difficulty Level
                          {selectedDifficulties.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                            >
                              {selectedDifficulties.length} selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          {[
                            {
                              id: "beginner",
                              color: "from-emerald-500 to-green-500",
                              bgColor: "bg-emerald-500",
                              hoverColor: "hover:bg-emerald-600",
                              label: "Beginner",
                            },
                            {
                              id: "intermediate",
                              color: "from-amber-500 to-yellow-500",
                              bgColor: "bg-amber-500",
                              hoverColor: "hover:bg-amber-600",
                              label: "Intermediate",
                            },
                            {
                              id: "advanced",
                              color: "from-orange-500 to-red-500",
                              bgColor: "bg-orange-500",
                              hoverColor: "hover:bg-orange-600",
                              label: "Advanced",
                            },
                            {
                              id: "expert",
                              color: "from-red-500 to-pink-500",
                              bgColor: "bg-red-500",
                              hoverColor: "hover:bg-red-600",
                              label: "Expert",
                            },
                          ].map((difficulty) => (
                            <Button
                              key={difficulty.id}
                              variant={
                                selectedDifficulties.includes(difficulty.id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleDifficulty(difficulty.id)}
                              className={`w-full justify-between h-10 px-3 font-medium transition-all duration-200 ${
                                selectedDifficulties.includes(difficulty.id)
                                  ? `${difficulty.bgColor} ${difficulty.hoverColor} text-white shadow-sm border-transparent`
                                  : "bg-background hover:bg-accent hover:text-accent-foreground border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-3 w-3 rounded-full bg-gradient-to-r ${difficulty.color}`}
                                ></div>
                                <span className="text-sm">
                                  {difficulty.label}
                                </span>
                              </div>
                              {selectedDifficulties.includes(difficulty.id) ? (
                                <X className="h-3.5 w-3.5 flex-shrink-0" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Programming Languages Card */}
                    <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4 border-b border-border/20">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                          </div>
                          Programming Languages
                          {selectedLanguages.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                            >
                              {selectedLanguages.length} selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-3">
                          <Input
                            placeholder="Search languages..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                          {filteredLanguages.map((language: Language) => (
                            <Button
                              key={language.id}
                              variant={
                                selectedLanguages.includes(language.id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleLanguage(language.id)}
                              className={`justify-between h-10 px-3 font-medium transition-all duration-200 ${
                                selectedLanguages.includes(language.id)
                                  ? "bg-purple-500 hover:bg-purple-600 text-white shadow-sm border-purple-500"
                                  : "bg-background hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300 border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="h-3 w-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: language.color }}
                                />
                                <span className="truncate text-sm">
                                  {language.name}
                                </span>
                              </div>
                              {selectedLanguages.includes(language.id) ? (
                                <X className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 flex-shrink-0 ml-2 opacity-40" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Companies Card */}
                    <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4 border-b border-border/20">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                          </div>
                          Companies
                          {selectedCompanies.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                            >
                              {selectedCompanies.length} selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-3">
                          <Input
                            placeholder="Search companies..."
                            value={companySearch}
                            onChange={(e) => setCompanySearch(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                          {filteredCompanies.map((company: Company) => (
                            <Button
                              key={company.id}
                              variant={
                                selectedCompanies.includes(company.id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleCompany(company.id)}
                              className={`justify-between h-12 px-3 font-medium transition-all duration-200 ${
                                selectedCompanies.includes(company.id)
                                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm border-orange-500"
                                  : "bg-background hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-700 dark:hover:text-orange-300 border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Image
                                  src={company.logo}
                                  alt={company.name}
                                  width={16}
                                  height={16}
                                  className="h-4 w-4 rounded flex-shrink-0"
                                />
                                <div className="min-w-0 text-left">
                                  <div className="truncate font-medium text-sm">
                                    {company.name}
                                  </div>
                                  <div className="text-xs opacity-70 truncate">
                                    {company.industry}
                                  </div>
                                </div>
                              </div>
                              {selectedCompanies.includes(company.id) ? (
                                <X className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 flex-shrink-0 ml-2 opacity-40" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Topics & Tags Card */}
                    <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4 border-b border-border/20">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                          </div>
                          Topics & Tags
                          {selectedTags.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                            >
                              {selectedTags.length} selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-3">
                          <Input
                            placeholder="Search topics & tags..."
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="max-h-64 overflow-y-auto pr-2">
                          <div className="flex flex-wrap gap-2">
                            {filteredTags.map((tag) => (
                              <Button
                                key={tag}
                                variant={
                                  selectedTags.includes(tag)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => toggleTag(tag)}
                                className={`h-8 text-xs px-3 font-medium transition-all duration-200 ${
                                  selectedTags.includes(tag)
                                    ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm border-indigo-500"
                                    : "bg-background hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 border-border/60"
                                }`}
                              >
                                <span className="truncate max-w-[120px]">
                                  {tag.replace(/-/g, " ")}
                                </span>
                                {selectedTags.includes(tag) ? (
                                  <X className="h-3 w-3 ml-2 flex-shrink-0" />
                                ) : (
                                  <Plus className="h-3 w-3 ml-2 flex-shrink-0 opacity-40" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Active filters:
                    </span>
                    {selectedCategories.map((categoryId) => {
                      const category = practiceData.categories.find(
                        (c: Category) => c.id === categoryId,
                      );
                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category?.name}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleCategory(categoryId)}
                          />
                        </Badge>
                      );
                    })}
                    {selectedDifficulties.map((difficulty) => (
                      <Badge
                        key={difficulty}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {difficulty}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleDifficulty(difficulty)}
                        />
                      </Badge>
                    ))}
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.replace("-", " ")}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        />
                      </Badge>
                    ))}
                    {selectedCompanies.map((companyId) => {
                      const company = getCompanyInfo(companyId);
                      return (
                        <Badge
                          key={companyId}
                          variant="secondary"
                          className="text-xs flex items-center"
                        >
                          {company && (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              width={12}
                              height={12}
                              className="h-3 w-3 mr-1 rounded"
                            />
                          )}
                          {company?.name || companyId}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleCompany(companyId)}
                          />
                        </Badge>
                      );
                    })}
                    {selectedLanguages.map((languageId) => {
                      const language = getLanguageInfo(languageId);
                      return (
                        <Badge
                          key={languageId}
                          variant="secondary"
                          className="text-xs flex items-center"
                        >
                          <div
                            className="h-2 w-2 mr-1 rounded-full"
                            style={{
                              backgroundColor: language?.color || "#6b7280",
                            }}
                          />
                          {language?.name || languageId}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleLanguage(languageId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            {/* Results Header */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-lg font-semibold">
                  {filteredQuestions.length} Question
                  {filteredQuestions.length !== 1 ? "s" : ""} Found
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {hasActiveFilters && (
                    <span>
                      Filtered from {practiceData.metadata.totalQuestions} total
                      questions
                    </span>
                  )}
                  {totalPages > 1 && (
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            {/* Question Results */}
            <div className="space-y-4 sm:space-y-6">
              {filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No questions found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search terms or filters to find
                      practice questions.
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearAllFilters}>
                        <FilterX className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                paginatedQuestions.map((question: ExtendedQuestion) => (
                  <Card
                    key={question.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {question.title}
                            </CardTitle>
                            {question.company && (
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const company = getCompanyInfo(
                                    question.company,
                                  );
                                  return company ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                                      <Image
                                        src={company.logo}
                                        alt={company.name}
                                        width={16}
                                        height={16}
                                        className="h-4 w-4 rounded"
                                      />
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {company.name}
                                      </span>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
                            {question.language && (
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const language = getLanguageInfo(
                                    question.language,
                                  );
                                  return language ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                                      <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                          backgroundColor: language.color,
                                        }}
                                      />
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {language.name}
                                      </span>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
                          </div>
                          <CardDescription className="text-sm text-muted-foreground mb-3">
                            {question.categoryName}
                          </CardDescription>
                        </div>
                        <Badge
                          className={getDifficultyColor(question.difficulty)}
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-4">
                        {question.question}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Documentation Links */}
                      {question.documentationLinks &&
                        question.documentationLinks.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">
                              Documentation & Resources:
                            </h4>
                            <div className="space-y-2">
                              {question.documentationLinks.map(
                                (link: DocumentationLink) => (
                                  <div
                                    key={link.title}
                                    className="flex items-start space-x-2"
                                  >
                                    <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                      <Link
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-medium text-sm"
                                      >
                                        {link.title}
                                      </Link>
                                      <p className="text-xs text-muted-foreground">
                                        {link.description}
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {/* Pagination */}
            {filteredQuestions.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * questionsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * questionsPerPage,
                    filteredQuestions.length,
                  )}{" "}
                  of {filteredQuestions.length} questions
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={1 === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className="w-10 h-10"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                      </>
                    )}

                    {/* Current page range */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page >= Math.max(1, currentPage - 2) &&
                          page <= Math.min(totalPages, currentPage + 2),
                      )
                      .map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={
                            totalPages === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
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
