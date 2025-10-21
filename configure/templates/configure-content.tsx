"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserData } from "@/lib/services/auth/auth";

interface ConfigureContentProps {
  user: UserData;
}

export function ConfigureContent({ user }: ConfigureContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfigSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Default configuration for now
      const config = {
        position: "Frontend Engineer",
        seniority: "mid",
        technologies: ["React", "TypeScript"],
        companyProfile: "faang",
        specificCompany: "",
        interviewMode: "timed",
        interviewType: "technical",
        duration: "30",
        isDemoMode: false,
      };

      // Store configuration in localStorage for the interview
      localStorage.setItem("interviewConfig", JSON.stringify(config));

      // Navigate to interview page
      router.push("/interview");
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configure Your Interview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your interview parameters to get the most relevant practice
            experience.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interview Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Interview configuration form will be implemented here.
            </p>
            <Button
              onClick={handleConfigSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Starting Interview..." : "Start Interview"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
