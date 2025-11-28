"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
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
      "Start a new mock interview from the 'New Interview' option in the sidebar. The AI interviewer will use curated questions tailored to your role and difficulty. The dedicated Practice Library is being reworked and will return soon.",
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
      "Yes. When configuring a new interview, select your target company so the AI focuses on that company's style and expectations.",
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
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16 max-w-6xl">
            <div className="mb-10 sm:mb-14 border-b pb-8">
              <div className="flex items-start gap-4 mb-3">
                <div className="p-2.5 bg-muted rounded-lg">
                  <HelpCircle className="h-7 w-7 text-foreground" />
                </div>
                <div>
                  <Typography.Heading1 className="text-foreground tracking-tight">
                    Help & Support
                  </Typography.Heading1>
                  <p className="text-muted-foreground mt-2 text-base">
                    Find answers to common questions and get assistance
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10 sm:space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <BookOpen className="h-5 w-5 text-foreground" />
                        </div>
                        <h3 className="font-semibold text-base">
                          Documentation
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Browse our comprehensive guides and tutorials
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <MessageSquare className="h-5 w-5 text-foreground" />
                        </div>
                        <h3 className="font-semibold text-base">Live Chat</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Chat with our support team in real-time
                      </p>
                      <Badge variant="secondary" className="text-xs w-fit">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <Mail className="h-5 w-5 text-foreground" />
                        </div>
                        <h3 className="font-semibold text-base">
                          Email Support
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Get help via email within 24 hours
                      </p>
                      <Badge variant="secondary" className="text-xs w-fit">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl sm:text-2xl font-semibold">
                    Frequently Asked Questions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Quick answers to common questions about using Blairify
                  </p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <Collapsible
                        key={faq.id}
                        open={openItems.includes(faq.id)}
                        onOpenChange={() => toggleItem(faq.id)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex w-full justify-between p-5 text-left hover:bg-muted/50 items-center rounded-none h-auto"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <span className="text-xs font-medium text-muted-foreground min-w-[2rem]">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="font-medium text-sm sm:text-base pr-3 text-foreground leading-relaxed">
                                  {faq.question}
                                </span>
                              </div>
                              {openItems.includes(faq.id) ? (
                                <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-5 pb-5 pt-2 bg-muted/20 border-t">
                              <div className="pl-0 sm:pl-10">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-8 sm:p-10">
                  <div className="text-center space-y-5 max-w-2xl mx-auto">
                    <div className="inline-flex p-3 bg-background rounded-lg border">
                      <MessageSquare className="h-7 w-7 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">
                        Need Additional Assistance?
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        If you can't find the answer you're looking for, our
                        support team is ready to help you.
                      </p>
                      <Button size="lg" disabled className="gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Support Team
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Coming Soon
                        </Badge>
                      </Button>
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
