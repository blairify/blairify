"use client";

import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
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
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-4">
                  {faqData.map((faq) => (
                    <Collapsible
                      key={faq.id}
                      open={openItems.includes(faq.id)}
                      onOpenChange={() => toggleItem(faq.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-between p-4 sm:p-4 text-left hover:bg-muted/50 active:bg-muted/50 min-h-[44px] items-start"
                        >
                          <span className="font-semibold text-sm sm:text-base pr-3 text-left leading-relaxed">
                            {faq.question}
                          </span>
                          {openItems.includes(faq.id) ? (
                            <ChevronUp className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 sm:px-4 pb-4 sm:pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
