"use client";

import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatabaseService } from "@/lib/database";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";
import type { UserData } from "@/lib/services/auth/auth";
import { cookieUtils } from "@/lib/utils/cookies";
import {
  normalizeCompanyProfileValue,
  normalizePositionValue,
} from "@/lib/utils/interview-normalizers";
import { useAuth } from "@/providers/auth-provider";
import type { UserPreferences } from "@/types/firestore";
import type { PositionValue } from "@/types/global";

interface OnboardingPageClientProps {
  user: UserData;
}

const ROLE_OPTIONS = [
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "mobile",
  "data-engineer",
  "data-scientist",
  "cybersecurity",
  "product",
  "other",
] as const;

const EXPERIENCE_OPTIONS = ["entry", "junior", "mid", "senior"] as const;

const SENIORITY_VALUES: SeniorityLevel[] = ["entry", "junior", "mid", "senior"];

const resolveSeniorityValue = (
  value?: string | null,
  fallback?: string | null,
): SeniorityLevel => {
  const allowed = new Set<SeniorityLevel>(SENIORITY_VALUES);
  if (value && allowed.has(value as SeniorityLevel)) {
    return value as SeniorityLevel;
  }
  if (fallback && allowed.has(fallback as SeniorityLevel)) {
    return fallback as SeniorityLevel;
  }
  return "mid";
};

const resolvePositionValue = (
  primary?: string | null,
  fallback?: string | null,
): PositionValue => {
  if (primary) {
    return normalizePositionValue(primary);
  }
  if (fallback) {
    return normalizePositionValue(fallback);
  }
  return "frontend";
};

function getRoleLabel(role: (typeof ROLE_OPTIONS)[number]) {
  switch (role) {
    case "frontend":
      return "Frontend";
    case "backend":
      return "Backend";
    case "fullstack":
      return "Full Stack";
    case "devops":
      return "DevOps";
    case "mobile":
      return "Mobile";
    case "data-engineer":
      return "Data Engineer";
    case "data-scientist":
      return "Data Scientist";
    case "cybersecurity":
      return "Cybersecurity";
    case "product":
      return "Product Manager";
    case "other":
      return "Other";
    default: {
      const _never: never = role;
      throw new Error(`Unhandled role: ${_never}`);
    }
  }
}

function getExperienceLabel(level: (typeof EXPERIENCE_OPTIONS)[number]) {
  switch (level) {
    case "entry":
      return "Entry";
    case "junior":
      return "Junior";
    case "mid":
      return "Mid";
    case "senior":
      return "Senior";
    default: {
      const _never: never = level;
      throw new Error(`Unhandled experience: ${_never}`);
    }
  }
}

function normalizeRole(value: string): (typeof ROLE_OPTIONS)[number] | "" {
  if (ROLE_OPTIONS.includes(value as (typeof ROLE_OPTIONS)[number])) {
    return value as (typeof ROLE_OPTIONS)[number];
  }

  switch (value) {
    case "Frontend Developer":
      return "frontend";
    case "Backend Developer":
      return "backend";
    case "Full Stack Developer":
      return "fullstack";
    case "DevOps Engineer":
      return "devops";
    case "Mobile Developer":
      return "mobile";
    case "Data Engineer":
      return "data-engineer";
    case "Data Scientist":
      return "data-scientist";
    case "Cybersecurity Engineer":
      return "cybersecurity";
    case "Product Manager":
      return "product";
    case "Other":
      return "other";
    default:
      return "";
  }
}

function normalizeExperience(
  value: string,
): (typeof EXPERIENCE_OPTIONS)[number] | "" {
  if (
    EXPERIENCE_OPTIONS.includes(value as (typeof EXPERIENCE_OPTIONS)[number])
  ) {
    return value as (typeof EXPERIENCE_OPTIONS)[number];
  }

  switch (value) {
    case "Entry level":
      return "entry";
    case "Junior":
      return "junior";
    case "Middle":
      return "mid";
    case "Senior":
      return "senior";
    default:
      return "";
  }
}

const EMPLOYMENT_TYPE_OPTIONS = [
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;

const WORK_MODE_OPTIONS = ["Remote-first", "Hybrid", "On-site"] as const;

function getEmploymentTypeLabel(
  type: (typeof EMPLOYMENT_TYPE_OPTIONS)[number],
) {
  switch (type) {
    case "full-time":
      return "Full-time";
    case "part-time":
      return "Part-time";
    case "contract":
      return "Contract";
    case "internship":
      return "Internship";
    default: {
      const _never: never = type;
      throw new Error(`Unhandled employment type: ${_never}`);
    }
  }
}

function normalizeEmploymentType(
  value: string,
): (typeof EMPLOYMENT_TYPE_OPTIONS)[number] | null {
  if (
    EMPLOYMENT_TYPE_OPTIONS.includes(
      value as (typeof EMPLOYMENT_TYPE_OPTIONS)[number],
    )
  ) {
    return value as (typeof EMPLOYMENT_TYPE_OPTIONS)[number];
  }

  switch (value) {
    case "Full-time":
      return "full-time";
    case "Part-time":
      return "part-time";
    case "Contract / Freelance":
    case "Contract":
    case "Freelance":
      return "contract";
    case "Internship":
      return "internship";
    default:
      return null;
  }
}

const STRUGGLE_OPTIONS = [
  "System design",
  "Algorithms & data structures",
  "Live coding",
  "Behavioral questions",
  "Talking through my thinking",
  "Time management during interviews",
  "Confidence / nerves",
  "Other",
] as const;

const GOAL_OPTIONS = [
  "Get my first full-time job",
  "Land a better / higher-paying role",
  "Switch into a new tech stack",
  "Practice for upcoming interviews",
  "Stay sharp between job searches",
  "Explore my strengths and weaknesses",
  "Other",
] as const;

type StepId =
  | "role"
  | "experience"
  | "employment-type"
  | "work-mode"
  | "struggle-areas"
  | "career-goals"
  | "early-job-matching"
  | "next-action";

const STEPS: StepId[] = [
  "role",
  "experience",
  "employment-type",
  "work-mode",
  "struggle-areas",
  "career-goals",
  "early-job-matching",
  "next-action",
];

export function OnboardingPageClient({
  user: _serverUser,
}: OnboardingPageClientProps) {
  const router = useRouter();
  const { user, userData, refreshUserData, loading } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "forward" | "back"
  >("forward");

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [struggleAreas, setStruggleAreas] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [earlyJobMatchingEnabled, setEarlyJobMatchingEnabled] = useState(false);
  const [hasHover, setHasHover] = useState(false);

  const [nextActionView, setNextActionView] = useState<"choose" | "paste">(
    "choose",
  );
  const [isStartingNextAction, setIsStartingNextAction] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasHover(mq.matches);
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!userData) return;

    if (userData.onboardingCompleted) {
      cookieUtils.set("onboarding-complete", "1", { path: "/" });
      router.replace("/my-progress");
      return;
    }

    setRole(userData.role ? normalizeRole(userData.role) : "");
    setExperience(
      userData.experience ? normalizeExperience(userData.experience) : "",
    );

    const savedWorkTypes = userData.preferences?.preferredWorkTypes ?? [];

    const savedEmploymentTypes = savedWorkTypes
      .map(normalizeEmploymentType)
      .filter((value): value is (typeof EMPLOYMENT_TYPE_OPTIONS)[number] =>
        Boolean(value),
      );
    const savedWorkModes = savedWorkTypes
      .filter((value): value is (typeof WORK_MODE_OPTIONS)[number] =>
        WORK_MODE_OPTIONS.includes(value as (typeof WORK_MODE_OPTIONS)[number]),
      )
      .map((value) => value as (typeof WORK_MODE_OPTIONS)[number]);

    setEmploymentTypes(savedEmploymentTypes);
    setWorkModes(savedWorkModes);
    setEarlyJobMatchingEnabled(
      Boolean(userData.preferences?.earlyJobMatchingEnabled),
    );
  }, [router, userData]);

  const totalSteps = STEPS.length;
  const currentStep = STEPS[stepIndex];

  const shouldAutoAdvance =
    currentStep === "role" ||
    currentStep === "experience" ||
    currentStep === "next-action";

  const goNext = () => {
    if (isSaving) return;
    setTransitionDirection("forward");
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const canNext = (() => {
    if (isSaving) return false;

    switch (currentStep) {
      case "role":
        return role.trim().length > 0;
      case "experience":
        return experience.trim().length > 0;
      case "employment-type":
        return employmentTypes.length > 0;
      case "work-mode":
        return workModes.length > 0;
      case "struggle-areas":
        return struggleAreas.length > 0;
      case "career-goals":
        return careerGoals.length > 0;
      case "early-job-matching":
      case "next-action":
        return true;
      default: {
        const _never: never = currentStep;
        throw new Error(`Unhandled step: ${_never}`);
      }
    }
  })();

  const toggleArrayValue = (
    value: string,
    setter: (next: string[]) => void,
    state: string[],
  ) => {
    if (state.includes(value)) {
      setter(state.filter((v) => v !== value));
      return;
    }

    setter([...state, value]);
  };

  const startPasteDescriptionFlow = async () => {
    if (isSaving || isStartingNextAction) return;
    setNextActionView("paste");
    setIsStartingNextAction(true);
    await completeOnboarding();
    router.push("/configure?flow=paste&step=description");
  };

  const handleBack = () => {
    if (isSaving) return;
    if (stepIndex === 0) return;
    setTransitionDirection("back");
    setStepIndex((prev) => prev - 1);
  };

  const savePreferencesOnly = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const existingProfile = await DatabaseService.getUserProfile(user.uid);

      const basePreferences: UserPreferences = existingProfile?.preferences ?? {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical"],
        targetCompanies: [],
        notificationsEnabled: true,
        language: "en",
      };

      const preferencesUpdate: UserPreferences = {
        ...basePreferences,
        earlyJobMatchingEnabled,
        ...(employmentTypes.length > 0 || workModes.length > 0
          ? {
              preferredWorkTypes: [...employmentTypes, ...workModes],
            }
          : {}),
        ...(struggleAreas.length > 0 && { struggleAreas }),
        ...(careerGoals.length > 0 && { careerGoals }),
      };

      await DatabaseService.updateUserProfile(user.uid, {
        role,
        experience,
        preferences: preferencesUpdate,
      });
      await refreshUserData();
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await DatabaseService.updateUserProfile(user.uid, {
        onboardingCompleted: true,
      });
      cookieUtils.set("onboarding-complete", "1", { path: "/" });
    } catch (err) {
      console.error("Failed to complete onboarding", err);
    } finally {
      setIsSaving(false);
    }
  };

  const buildTrainingInterviewParams = (
    override?: Partial<InterviewConfig>,
  ) => {
    const seniority = resolveSeniorityValue(
      experience || override?.seniority,
      override?.seniority,
    );
    const interviewMode: InterviewMode = override?.interviewMode ?? "regular";
    const interviewType: InterviewType = override?.interviewType ?? "technical";

    const position = resolvePositionValue(override?.position, role);

    const config: InterviewConfig = {
      position,
      seniority,
      technologies: override?.technologies ?? [],
      companyProfile: normalizeCompanyProfileValue(
        override?.companyProfile ?? undefined,
      ),
      specificCompany: override?.specificCompany,
      interviewMode,
      interviewType,
      duration: override?.duration ?? "30",
      isDemoMode: false,
      contextType: override?.contextType ?? "preferences",
      jobDescription: override?.jobDescription,
      jobRequirements: override?.jobRequirements,
      company: override?.company,
    };

    return buildSearchParamsFromInterviewConfig(config);
  };

  const startTrainingInterview = async () => {
    setIsStartingNextAction(true);
    await completeOnboarding();
    router.push(`/interview?${buildTrainingInterviewParams().toString()}`);
  };

  const handleNext = async () => {
    if (!canNext) return;

    if (currentStep === "early-job-matching") {
      await savePreferencesOnly();
      setTransitionDirection("forward");
      setStepIndex((prev) => prev + 1);
      return;
    }

    const isLast = stepIndex === totalSteps - 1;
    if (!isLast) {
      setTransitionDirection("forward");
      setStepIndex((prev) => prev + 1);
    }
  };

  const infoChipClassName =
    "inline-flex items-center gap-2 rounded-sm border bg-background/70 px-3 py-1.5 shadow-sm hover:bg-background";
  const infoContentClassName = "max-w-sm p-3";

  const onlyOurBestContent = (
    <div className="flex flex-col">
      <Typography.SubCaption color="secondary" className="leading-snug">
        This is not guaranteed.
      </Typography.SubCaption>
      <Typography.SubCaption color="secondary" className="leading-snug">
        We pitch to companies only our best users with
      </Typography.SubCaption>
      <Typography.SubCaption color="secondary" className="leading-snug">
        actual progress tracking and strong performance.
      </Typography.SubCaption>
    </div>
  );

  const whatGetsSharedContent = (
    <div className="space-y-2">
      <ul className="list-disc space-y-1 pl-4">
        <li>
          <Typography.SubCaption color="secondary">
            Your target role, experience level, and technical skills
          </Typography.SubCaption>
        </li>
        <li>
          <Typography.SubCaption color="secondary">
            Interview practice performance and improvement trends
          </Typography.SubCaption>
        </li>
        <li>
          <Typography.SubCaption color="secondary">
            Work type preferences
          </Typography.SubCaption>
        </li>
      </ul>
      <Typography.SubCaption color="secondary" className="leading-snug">
        You control everything. Change this setting anytime in your profile.
      </Typography.SubCaption>
    </div>
  );

  const renderInfoOverlay = (params: {
    label: string;
    ariaLabel: string;
    content: ReactNode;
  }) => {
    if (hasHover) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className={infoChipClassName}>
              <Typography.SubCaptionMedium color="secondary">
                {params.label}
              </Typography.SubCaptionMedium>
              <Info className="size-4 " />
            </TooltipTrigger>
            <TooltipContent>{params.content}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    const trigger = (
      <button
        type="button"
        className={infoChipClassName}
        aria-label={params.ariaLabel}
        disabled={isSaving}
      >
        <Typography.SubCaptionMedium color="secondary">
          {params.label}
        </Typography.SubCaptionMedium>
        <Info className="size-4 text-muted-foreground" />
      </button>
    );

    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className={`w-auto ${infoContentClassName}`}>
          {params.content}
        </PopoverContent>
      </Popover>
    );
  };

  if (loading || !user) {
    return <LoadingPage message="Loading onboarding..." />;
  }

  if (!userData) {
    return <LoadingPage message="Preparing your onboarding..." />;
  }

  return (
    <main className="flex min-h-screen flex-col justify-center overflow-x-hidden bg-secondary dark:bg-secondary-dark px-3 py-10 md:block md:px-4 md:pt-[18vh] md:pb-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          {currentStep === "next-action" ? (
            <div className="flex justify-end">
              {stepIndex === 7 ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={isSaving}
                  aria-label="Go back"
                  className="hidden gap-1 md:inline-flex"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 md:space-y-0">
              <div className="flex flex-col items-center gap-3 md:flex-row md:items-baseline md:justify-between md:gap-4">
                <Typography.Heading1 className="text-center sm:text-3xl md:text-left">
                  Personalize your{" "}
                  <span className="text-primary">Blairify</span> experience
                </Typography.Heading1>
              </div>
            </div>
          )}
        </div>

        <section className="rounded-xl">
          <div
            key={stepIndex}
            className={
              transitionDirection === "forward"
                ? "animate-in fade-in slide-in-from-right-2 duration-300"
                : "animate-in fade-in slide-in-from-left-2 duration-300"
            }
          >
            {currentStep === "role" && (
              <div className="space-y-4">
                <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                  Target role
                </Typography.CaptionMedium>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        role === option
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => {
                        setRole(option);
                        goNext();
                      }}
                      disabled={isSaving}
                    >
                      {getRoleLabel(option)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "experience" && (
              <div className="space-y-4">
                <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                  Experience level
                </Typography.CaptionMedium>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        experience === option
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => {
                        setExperience(option);
                        goNext();
                      }}
                      disabled={isSaving}
                    >
                      {getExperienceLabel(option)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "employment-type" && (
              <div className="space-y-4">
                <div className="flex flex-row gap-4 items-baseline">
                  <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                    Employment type
                  </Typography.CaptionMedium>
                  <Typography.SubCaption color="secondary" className="italic">
                    Feel free to pick more than one
                  </Typography.SubCaption>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        employmentTypes.includes(option)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() =>
                        toggleArrayValue(
                          option,
                          setEmploymentTypes,
                          employmentTypes,
                        )
                      }
                      disabled={isSaving}
                    >
                      {getEmploymentTypeLabel(option)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "work-mode" && (
              <div className="space-y-4">
                <div className="flex flex-row gap-4 items-baseline">
                  <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                    Work mode
                  </Typography.CaptionMedium>
                  <Typography.SubCaption color="secondary" className="italic">
                    Feel free to pick more than one
                  </Typography.SubCaption>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {WORK_MODE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        workModes.includes(option)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() =>
                        toggleArrayValue(option, setWorkModes, workModes)
                      }
                      disabled={isSaving}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "struggle-areas" && (
              <div className="space-y-4">
                <div className="flex flex-row gap-4 items-baseline">
                  <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                    Main areas you struggle with
                  </Typography.CaptionMedium>
                  <Typography.SubCaption color="secondary" className="italic">
                    Feel free to pick more than one
                  </Typography.SubCaption>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {STRUGGLE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        struggleAreas.includes(option)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() =>
                        toggleArrayValue(
                          option,
                          setStruggleAreas,
                          struggleAreas,
                        )
                      }
                      disabled={isSaving}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "career-goals" && (
              <div className="space-y-4">
                <div className="flex flex-row gap-4 items-baseline">
                  <Typography.CaptionMedium className="mb-2 block text-center md:text-left">
                    What are you looking for right now?
                  </Typography.CaptionMedium>
                  <Typography.SubCaption color="secondary" className="italic">
                    Feel free to pick more than one
                  </Typography.SubCaption>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {GOAL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cursor-pointer font-medium px-4 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                        careerGoals.includes(option)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() =>
                        toggleArrayValue(option, setCareerGoals, careerGoals)
                      }
                      disabled={isSaving}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "early-job-matching" && (
              <div className="ejm-gradient-animate rounded-xl border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-4">
                      <Typography.Heading2 className=" font-extrabold">
                        Early Job Matching
                      </Typography.Heading2>
                      <Typography.SubCaption className="text-sm">
                        We work closely with top companies to proactively
                        identify their hiring needs and present them with the
                        strongest candidates.{" "}
                      </Typography.SubCaption>
                    </div>
                  </div>

                  <Switch
                    checked={earlyJobMatchingEnabled}
                    onCheckedChange={setEarlyJobMatchingEnabled}
                    disabled={isSaving}
                    className="h-7 w-12 rounded-full border-0 shadow-inner transition-colors data-[state=unchecked]:bg-red-500 dark:data-[state=unchecked]:bg-red-500 data-[state=checked]:bg-emerald-500 dark:bg-emerald-700 [&_[data-slot=switch-thumb]]:size-6 [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:shadow-md [&_[data-slot=switch-thumb]]:ring-1 [&_[data-slot=switch-thumb]]:ring-black/5 dark:[&_[data-slot=switch-thumb]]:ring-white/10 [&_[data-slot=switch-thumb]]:data-[state=unchecked]:!translate-x-0.5 [&_[data-slot=switch-thumb]]:data-[state=checked]:!translate-x-[20px]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {renderInfoOverlay({
                    label: "Only Our Best",
                    ariaLabel: "Only Our Best",
                    content: onlyOurBestContent,
                  })}
                  {renderInfoOverlay({
                    label: "What gets shared",
                    ariaLabel: "What gets shared",
                    content: whatGetsSharedContent,
                  })}
                </div>
              </div>
            )}

            {currentStep === "next-action" && (
              <div className="space-y-5">
                <div className="text-center">
                  <Typography.Heading1 className="text-4xl mb-16">
                    What would you like to do next?
                  </Typography.Heading1>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mb-16">
                  <button
                    type="button"
                    onClick={startPasteDescriptionFlow}
                    disabled={isSaving || isStartingNextAction}
                    className={`rounded-xl border bg-background/70 p-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-background ${
                      nextActionView === "paste"
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <Typography.Heading3 className="text-left mb-3">
                      Paste description
                    </Typography.Heading3>
                    <Typography.SubCaption className="mt-1 text-left">
                      Drop a job description and let AI configure a{" "}
                      <span className="text-primary">
                        personalized interview.{" "}
                      </span>
                    </Typography.SubCaption>
                  </button>
                  <button
                    type="button"
                    onClick={startTrainingInterview}
                    disabled={isSaving || isStartingNextAction}
                    className="rounded-xl border bg-background/70 p-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-background"
                  >
                    <Typography.Heading3 className="text-left mb-3">
                      Training interview{" "}
                    </Typography.Heading3>

                    <Typography.SubCaption className=" text-left ">
                      <span>
                        Start a{" "}
                        <span className="text-primary">
                          preconfigured interview{" "}
                        </span>
                      </span>
                    </Typography.SubCaption>
                    <Typography.SubCaption className="mt-1 text-left ">
                      <span>and begin learning about your career.</span>
                    </Typography.SubCaption>
                  </button>
                </div>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={isSaving}
                    aria-label="Go back"
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>

          {shouldAutoAdvance ? null : (
            <div className="mt-6 flex justify-center md:justify-start gap-2">
              {stepIndex === 0 ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={isSaving}
                  aria-label="Go back"
                  className="gap-1 !min-h-0 !min-w-0 !h-auto rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={!canNext}
              >
                {stepIndex === totalSteps - 1
                  ? isSaving
                    ? "Saving..."
                    : "Continue"
                  : "Next"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
