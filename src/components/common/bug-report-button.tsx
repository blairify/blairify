"use client";

import {
  addDoc,
  collection,
  type FieldValue,
  serverTimestamp,
} from "firebase/firestore";
import { Bug, Loader2, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

interface BugReportData {
  name: string;
  pageUrl: string;
  description: string;
  severity: "critical" | "low" | "preference";
  userId: string | null;
  userEmail: string | null;
  createdAt: FieldValue;
}

export function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, userData } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    severity: "low" as "critical" | "low" | "preference",
  });

  // Pre-fill user data when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.displayName || userData.email || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description required", {
        description: "Please describe the bug you encountered.",
      });
      return;
    }

    setSubmitting(true);

    try {
      if (!db) {
        throw new Error("Database not initialized");
      }

      const bugReport: BugReportData = {
        name: formData.name || "Anonymous",
        pageUrl: window.location.href,
        description: formData.description,
        severity: formData.severity,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        createdAt: serverTimestamp(),
      };

      const bugReportsRef = collection(db, "bug_reports");
      await addDoc(bugReportsRef, bugReport);

      toast.success("✅ Bug report submitted", {
        description: "Thank you for your feedback! We'll look into it.",
      });

      // Reset form
      setFormData({
        name: userData?.displayName || userData?.email || "",
        description: "",
        severity: "low",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast.error("Failed to submit report", {
        description: "Please try again later or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-lg max-h-10 shadow-lg hover:shadow-2xl transition-all z-50 h-12 px-5 bg-gray-900 hover:to-red-600 text-white border-0 group"
          variant="outline"
        >
          <Bug className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Report Bug</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        side="top"
        sideOffset={8}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Report a Bug</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This app is building. You are an early adopter. Help us improve by
              reporting issues you encounter
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="bug-name">Name (Optional)</Label>
              <Input
                id="bug-name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            {/* Page URL (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="bug-url">Page URL</Label>
              <Input
                id="bug-url"
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="bug-severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: "critical" | "low" | "preference") =>
                  setFormData({ ...formData, severity: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="bug-severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Critical
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Low Importance
                    </span>
                  </SelectItem>
                  <SelectItem value="preference">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Preference
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="bug-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bug-description"
                placeholder="Describe the bug you encountered..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={submitting}
                rows={4}
                maxLength={500}
                className="resize-none max-h-32 overflow-y-auto"
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          <div className="p-4 border-t bg-muted/30">
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !formData.description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
