"use client";

import { HelpCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdRestartAlt } from "react-icons/md";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const faqData = [
  {
    id: "getting-started",
    question: "How do I start my first interview?",
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
      "Start a new interview from the 'New Interview' option in the sidebar. The AI interviewer will use curated questions tailored to your role and difficulty. The dedicated Practice Library is being reworked and will return soon.",
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
      "Insights provides an overview of your performance trends, success rates, and areas of focus. You can also review detailed analytics in your interview history.",
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <div className="container  mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-8 max-w-6xl">
            <div className="flex flex-row justify-between items-start mb-8">
              <div className="flex items-end gap-4">
                <div className="p-2.5 bg-primary/5 border border-foreground dark:border-white rounded-lg">
                  <HelpCircle className="size-5.5 text-foreground dark:text-white" />
                </div>
                <div className="flex flex-col gap-0.5 items-baseline">
                  <Typography.BodyBold>Help & Support</Typography.BodyBold>
                  <Typography.Caption color="secondary">
                    Find answers to common questions and get assistance
                  </Typography.Caption>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="dark:text-white dark:border-white/20"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                      "blairify-dashboard-tour-force",
                      "1",
                    );
                  }
                  router.push("/dashboard");
                }}
              >
                <MdRestartAlt className="size-5 dark:text-white" />
                Restart Tutorial
              </Button>
            </div>

            <div className="space-y-6 mb-10">
              <Accordion defaultOpenId={faqData[0]?.id}>
                {faqData.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    id={faq.id}
                    indexText={String(index + 1).padStart(2, "0")}
                    title={
                      <Typography.BodyMedium className="text-foreground">
                        {faq.question}
                      </Typography.BodyMedium>
                    }
                  >
                    <Typography.Caption color="gray">
                      {faq.answer}
                    </Typography.Caption>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="text-left space-y-5 px-3 max-w-2xl">
              <div>
                <Typography.BodyBold className="mb-3 text-foreground">
                  Contact Support
                </Typography.BodyBold>
                <Typography.Body
                  color="secondary"
                  className="mb-6 leading-relaxed"
                >
                  If you can't find the answer you're looking for, please email
                  us at{" "}
                  <span className="font-semibold text-foreground">
                    support@blairify.com
                  </span>
                  . We typically respond within 24 hours.
                </Typography.Body>
                <Button size="lg" className="gap-2" asChild>
                  <a href="mailto:support@blairify.com">
                    <Mail className="h-4 w-4" />
                    Email Support Team
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
