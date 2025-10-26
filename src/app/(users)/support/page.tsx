"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/providers/auth-provider";

const faqData = [
  {
    id: "getting-started",
    question: "How do I start my first mock interview?",
    answer:
      "To start your first interview, click on 'New Interview' from the sidebar or dashboard. You can then configure your interview settings including topic focus, difficulty level, and duration before beginning.",
  },
  {
    id: "interview-types",
    question: "What types of interviews are available?",
    answer:
      "We offer various interview types including technical coding interviews, system design discussions, and frontend development questions. You can filter by company and difficulty level to match your preparation needs.",
  },
  {
    id: "practice-questions",
    question: "How can I access practice questions?",
    answer:
      "Visit the 'Practice Library' from the sidebar to browse through our comprehensive collection of questions. You can filter by company, difficulty, category, and specific tags to find relevant practice material.",
  },
  {
    id: "results-analysis",
    question: "How does the AI analysis work?",
    answer:
      "After completing an interview, our AI analyzes your responses and provides detailed feedback including strengths, areas for improvement, and personalized recommendations for your interview preparation.",
  },
  {
    id: "interview-history",
    question: "Can I review my past interviews?",
    answer:
      "Yes! Go to 'Interview History' to view all your completed sessions. You can search, filter, and sort your interviews to track your progress over time.",
  },
  {
    id: "technical-issues",
    question: "What should I do if I encounter technical problems?",
    answer:
      "If you experience any technical issues, try refreshing the page first. Make sure you have a stable internet connection. Most issues are resolved by restarting your browser session.",
  },
  {
    id: "account-settings",
    question: "How can I update my profile and settings?",
    answer:
      "Click on 'Profile' or 'Settings' in the sidebar to update your account information, preferences, and interview configurations.",
  },
  {
    id: "progress-tracking",
    question: "How do I track my improvement over time?",
    answer:
      "The dashboard provides an overview of your performance trends, success rates, and areas of focus. You can also review detailed analytics in your interview history.",
  },
  {
    id: "company-specific",
    question: "Can I practice for specific companies?",
    answer:
      "Absolutely! Our practice library includes questions tagged with specific companies where they were asked. Use the company filter to focus on your target companies.",
  },
  {
    id: "difficulty-levels",
    question: "What do the different difficulty levels mean?",
    answer:
      "Beginner: Entry-level questions suitable for new graduates. Intermediate: Mid-level questions for 2-4 years experience. Advanced: Senior-level questions for 5+ years. Expert: Principal/Staff level questions for senior engineers.",
  },
];

export default function SupportPage() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl">
            {/* Page Header */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Help & Support
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Find answers to common questions and get help
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Quick Help Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-blue-500/10 rounded-full">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="font-semibold">Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse our comprehensive guides
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-green-500/10 rounded-full">
                        <MessageSquare className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with our support team
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-purple-500/10 rounded-full">
                        <Mail className="h-6 w-6 text-purple-500" />
                      </div>
                      <h3 className="font-semibold">Email Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Get help via email
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card className="border-2">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl sm:text-2xl">
                      Frequently Asked Questions
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Quick answers to common questions about using Blairify
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    {faqData.map((faq, index) => (
                      <Collapsible
                        key={faq.id}
                        open={openItems.includes(faq.id)}
                        onOpenChange={() => toggleItem(faq.id)}
                      >
                        <Card className="border-2 hover:border-primary/30 transition-all">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex w-full justify-between p-4 sm:p-5 text-left hover:bg-primary/5 min-h-[60px] items-start rounded-lg"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <Badge
                                  variant="outline"
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {index + 1}
                                </Badge>
                                <span className="font-semibold text-sm sm:text-base pr-3 text-left leading-relaxed">
                                  {faq.question}
                                </span>
                              </div>
                              {openItems.includes(faq.id) ? (
                                <ChevronUp className="h-5 w-5 flex-shrink-0 mt-1 text-primary" />
                              ) : (
                                <ChevronDown className="h-5 w-5 flex-shrink-0 mt-1 text-muted-foreground" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                              <div className="pl-0 sm:pl-11 bg-muted/30 rounded-lg p-4 border-l-4 border-primary/50">
                                <p className="text-sm text-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-background rounded-full shadow-lg">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Still need help?
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Can't find what you're looking for? Our support team is
                        here to help.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" disabled className="gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Support
                          <Badge variant="secondary" className="ml-2">
                            Coming Soon
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
