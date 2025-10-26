"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AIStatusBanner() {
  const [status, setStatus] = useState<
    "checking" | "available" | "unavailable" | null
  >(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check AI service status by attempting a simple check
    const checkAIStatus = async () => {
      try {
        // We'll check if the service responds properly
        // In production, you'd want a dedicated status endpoint
        setStatus("checking");

        // For now, we'll assume it's available and let the actual
        // API calls handle errors gracefully
        setStatus("available");
        setShowBanner(false);
      } catch (error) {
        console.error("Failed to check AI status:", error);
        setStatus("unavailable");
        setShowBanner(true);
      }
    };

    checkAIStatus();
  }, []);

  if (!showBanner || status === null || status === "checking") {
    return null;
  }

  if (status === "unavailable") {
    return (
      <Card className="mb-6 border-2 border-red-500/50 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                AI Service Not Configured
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                The AI interview and analysis features require a Mistral API
                key. Please check the{" "}
                <code className="text-xs bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded">
                  AI_SETUP.md
                </code>{" "}
                file for setup instructions. The system will use fallback
                responses until configured.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function AIStatusIndicator() {
  const [status, setStatus] = useState<
    "checking" | "available" | "unavailable"
  >("checking");

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch("/api/interview/status");
        const data = await response.json();
        setStatus(data.aiAvailable ? "available" : "unavailable");
      } catch {
        setStatus("unavailable");
      }
    };

    checkAIStatus();
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>Checking AI service...</span>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>AI service active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <XCircle className="w-4 h-4" />
      <span>AI service unavailable</span>
    </div>
  );
}
