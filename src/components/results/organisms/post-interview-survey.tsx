"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatabaseService } from "@/lib/database";
import {
  hasUserSubmittedSurvey,
  savePostInterviewSurveyResponse,
} from "@/lib/services/surveys/database-surveys";
import type { UserProfile } from "@/types/firestore";
import type { InterviewResults } from "@/types/interview";

type SurveyField = "jobMatchScore" | "realismScore" | "gapInsightScore";

const RATING_OPTIONS_QUESTION_1 = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Partial" },
  { value: 3, label: "Good" },
  { value: 4, label: "Strong" },
  { value: 5, label: "Perfect" },
] as const;

const RATING_OPTIONS_QUESTION_2 = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Very Good" },
  { value: 5, label: "Excellent" },
] as const;

const RATING_OPTIONS_QUESTION_3 = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "A little bit" },
  { value: 3, label: "Moderately" },
  { value: 4, label: "Quite a bit" },
  { value: 5, label: "Extremely" },
] as const;

const RATING_OPTIONS_BY_FIELD: Record<
  SurveyField,
  readonly { value: number; label: string }[]
> = {
  jobMatchScore: RATING_OPTIONS_QUESTION_1,
  realismScore: RATING_OPTIONS_QUESTION_2,
  gapInsightScore: RATING_OPTIONS_QUESTION_3,
};

const SURVEY_QUESTIONS: Array<{
  id: SurveyField;
  title: string;
}> = [
  {
    id: "jobMatchScore",
    title:
      "How accurately did the questions match the specific requirements of the given job/role?",
  },
  {
    id: "realismScore",
    title:
      "How realistic did this session feel compared to a real technical interview?",
  },
  {
    id: "gapInsightScore",
    title:
      "How helpful was this session in exposing knowledge gaps you weren't aware of?",
  },
];

const getSurveyDismissKey = (userId: string) =>
  `post-interview-survey-dismissed:${userId}`;

type SurveyDismissRecord = {
  dismissed: boolean;
  interviewCount: number;
};

const parseSurveyDismissRecord = (
  value: string | null,
): SurveyDismissRecord | null => {
  if (!value) return null;
  if (value === "true") {
    return { dismissed: true, interviewCount: 1 };
  }

  try {
    const parsed = JSON.parse(value) as Partial<SurveyDismissRecord>;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.dismissed === "boolean" &&
      typeof parsed.interviewCount === "number"
    ) {
      return {
        dismissed: parsed.dismissed,
        interviewCount: parsed.interviewCount,
      };
    }
  } catch {
    // noop
  }
  return null;
};

const saveSurveyDismissRecord = (
  userId: string,
  record: SurveyDismissRecord,
) => {
  try {
    localStorage.setItem(getSurveyDismissKey(userId), JSON.stringify(record));
  } catch {
    // noop
  }
};

const clearSurveyDismissRecord = (userId: string) => {
  try {
    localStorage.removeItem(getSurveyDismissKey(userId));
  } catch {
    // noop
  }
};

const isSurveyDismissedForInterview = (
  record: SurveyDismissRecord | null,
  interviewCount: number,
) => {
  if (!record) return false;
  if (interviewCount <= 0) {
    return record.dismissed;
  }
  return record.dismissed && record.interviewCount === interviewCount;
};

const buildSurveyDismissRecord = (
  interviewCount: number,
): SurveyDismissRecord => ({
  dismissed: true,
  interviewCount: Math.max(interviewCount, 1),
});

export type PostInterviewSurveyController = {
  requestNavigation: (path: string) => void;
};

interface PostInterviewSurveyProps {
  activeUserId?: string;
  activeUserEmail: string;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  results: InterviewResults | null;
  refreshUserData: () => Promise<void>;
  onNavigate: (path: string) => void;
  controllerRef?: React.MutableRefObject<PostInterviewSurveyController | null>;
}

export function PostInterviewSurvey({
  activeUserId,
  activeUserEmail,
  userProfile,
  setUserProfile,
  results,
  refreshUserData,
  onNavigate,
  controllerRef,
}: PostInterviewSurveyProps) {
  const [surveyDismissRecord, setSurveyDismissRecord] =
    useState<SurveyDismissRecord | null>(null);
  const [surveyEligible, setSurveyEligible] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<
    Record<SurveyField, number>
  >({
    jobMatchScore: 0,
    realismScore: 0,
    gapInsightScore: 0,
  });
  const surveyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownSurveyRef = useRef(false);
  const currentInterviewCount = userProfile?.totalInterviews ?? 0;
  const surveyDismissedForCurrentInterview = isSurveyDismissedForInterview(
    surveyDismissRecord,
    currentInterviewCount,
  );

  useEffect(() => {
    if (!activeUserId) {
      setSurveyDismissRecord(null);
      return;
    }
    const stored = parseSurveyDismissRecord(
      typeof window === "undefined"
        ? null
        : localStorage.getItem(getSurveyDismissKey(activeUserId)),
    );
    setSurveyDismissRecord(stored);
  }, [activeUserId]);

  const persistSurveyDismissRecord = useCallback(
    (record: SurveyDismissRecord | null) => {
      if (!activeUserId) return;
      if (record) {
        saveSurveyDismissRecord(activeUserId, record);
      } else {
        clearSurveyDismissRecord(activeUserId);
      }
      setSurveyDismissRecord(record);
    },
    [activeUserId],
  );

  const qualifiesForSurvey = (() => {
    if (!userProfile) return false;
    const totalInterviews = userProfile.totalInterviews ?? 0;
    if (totalInterviews < 1) return false;
    if (userProfile.postInterviewSurveyCompleted) return false;
    return !isSurveyDismissedForInterview(surveyDismissRecord, totalInterviews);
  })();

  useEffect(() => {
    if (!activeUserId || !qualifiesForSurvey) {
      setSurveyEligible(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const alreadySubmitted = await hasUserSubmittedSurvey(activeUserId);
        if (!isMounted) return;
        if (alreadySubmitted) {
          setUserProfile((prev) =>
            prev ? { ...prev, postInterviewSurveyCompleted: true } : prev,
          );
          setSurveyEligible(false);
          persistSurveyDismissRecord(
            buildSurveyDismissRecord(currentInterviewCount),
          );
          return;
        }
        setSurveyEligible(true);
      } catch (checkError) {
        console.error("Failed to check survey submission status:", checkError);
        setSurveyEligible(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    activeUserId,
    currentInterviewCount,
    persistSurveyDismissRecord,
    qualifiesForSurvey,
    setUserProfile,
  ]);

  const clearSurveyTimer = useCallback(() => {
    if (surveyTimerRef.current) {
      clearTimeout(surveyTimerRef.current);
      surveyTimerRef.current = null;
    }
  }, []);

  const markSurveyDismissed = useCallback(() => {
    if (!activeUserId) return;
    persistSurveyDismissRecord(buildSurveyDismissRecord(currentInterviewCount));
    hasShownSurveyRef.current = true;
    clearSurveyTimer();
  }, [
    activeUserId,
    clearSurveyTimer,
    currentInterviewCount,
    persistSurveyDismissRecord,
  ]);

  const openSurvey = useCallback(() => {
    if (surveyDismissedForCurrentInterview || isSurveyOpen) return;
    hasShownSurveyRef.current = true;
    clearSurveyTimer();
    setIsSurveyOpen(true);
  }, [surveyDismissedForCurrentInterview, isSurveyOpen, clearSurveyTimer]);

  useEffect(() => {
    if (!surveyEligible || !results || hasShownSurveyRef.current) return;

    surveyTimerRef.current = setTimeout(() => {
      openSurvey();
    }, 7000);

    return () => {
      clearSurveyTimer();
    };
  }, [surveyEligible, results, openSurvey, clearSurveyTimer]);

  useEffect(() => {
    if (!surveyEligible || !results || hasShownSurveyRef.current) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      openSurvey();
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [surveyEligible, results, openSurvey]);

  const handleSurveyResponseChange = useCallback(
    (field: SurveyField, value: number) => {
      setSurveyResponses((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const isSurveySubmitDisabled = Object.values(surveyResponses).some(
    (value) => value === 0,
  );

  const handleSurveyDismiss = useCallback(() => {
    markSurveyDismissed();
    setIsSurveyOpen(false);
    if (pendingNavigation) {
      const destination = pendingNavigation;
      setPendingNavigation(null);
      onNavigate(destination);
    }
  }, [markSurveyDismissed, onNavigate, pendingNavigation]);

  const handleSurveySubmit = useCallback(async () => {
    if (!activeUserId) {
      toast.error("Missing user data. Please try again.");
      return;
    }
    setIsSubmittingSurvey(true);
    try {
      await savePostInterviewSurveyResponse(activeUserId, {
        ...surveyResponses,
        userEmail: activeUserEmail,
      });
      await DatabaseService.updateUserProfile(activeUserId, {
        postInterviewSurveyCompleted: true,
      });
      setUserProfile((prev) =>
        prev ? { ...prev, postInterviewSurveyCompleted: true } : prev,
      );
      markSurveyDismissed();
      setIsSurveyOpen(false);
      toast.success("Thanks for the feedback!");
      await refreshUserData();
      if (pendingNavigation) {
        const destination = pendingNavigation;
        setPendingNavigation(null);
        onNavigate(destination);
      }
    } catch (submitError) {
      console.error("Failed to submit post-interview survey:", submitError);
      toast.error("We couldn't save your feedback. Please try again.");
    } finally {
      setIsSubmittingSurvey(false);
    }
  }, [
    activeUserEmail,
    activeUserId,
    markSurveyDismissed,
    onNavigate,
    pendingNavigation,
    refreshUserData,
    setUserProfile,
    surveyResponses,
  ]);

  const shouldInterceptNavigation =
    surveyEligible &&
    !!results &&
    !hasShownSurveyRef.current &&
    !surveyDismissedForCurrentInterview;

  useEffect(() => {
    if (!controllerRef) return;
    controllerRef.current = {
      requestNavigation: (path: string) => {
        if (shouldInterceptNavigation) {
          setPendingNavigation(path);
          openSurvey();
          return;
        }
        onNavigate(path);
      },
    };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef, onNavigate, openSurvey, shouldInterceptNavigation]);

  const handleDialogOpenChange = useCallback(
    (openState: boolean) => {
      if (!openState) {
        handleSurveyDismiss();
      }
    },
    [handleSurveyDismiss],
  );

  return (
    <Dialog open={isSurveyOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <Star className="size-4" />
            Help us improve
          </div>
          <DialogTitle className="text-2xl">
            Quick post-interview survey
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {SURVEY_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-3">
              <Typography.BodyBold className="text-base">
                {question.title}
              </Typography.BodyBold>

              <RadioGroup
                value={
                  surveyResponses[question.id] === 0
                    ? ""
                    : String(surveyResponses[question.id])
                }
                onValueChange={(value) =>
                  handleSurveyResponseChange(question.id, Number(value))
                }
                className="grid grid-cols-1 gap-2 sm:grid-cols-5"
              >
                {RATING_OPTIONS_BY_FIELD[question.id].map((option) => {
                  const optionId = `${question.id}-${option.value}`;
                  const isSelected =
                    surveyResponses[question.id] === option.value;
                  return (
                    <div
                      key={optionId}
                      className={`rounded-lg border px-3 py-2 text-center transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <RadioGroupItem
                        value={String(option.value)}
                        id={optionId}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={optionId}
                        className="flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="text-lg font-semibold">
                          {option.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.label}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleSurveyDismiss}
          >
            Maybe later
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSurveySubmit}
            disabled={isSurveySubmitDisabled || isSubmittingSurvey}
          >
            {isSubmittingSurvey ? "Sending..." : "Submit feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
