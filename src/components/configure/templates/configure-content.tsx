"use client";

import {
  AlertCircle,
  ArrowRight,
  Crown,
  Loader2,
  Shield,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaJava } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import {
  SiCss3,
  SiDocker,
  SiFlutter,
  SiGo,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiPhp,
  SiPython,
  SiReact,
  SiRust,
  SiTerraform,
  SiTypescript,
} from "react-icons/si";
import { TbBrandKotlin, TbBrandSwift } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import { toast } from "sonner";
import { PaginationIndicator } from "@/components/common/atoms/pagination-indicator";
import { Typography } from "@/components/common/atoms/typography";
import { EditableExtractedTags } from "@/components/configure/molecules/editable-extracted-tags";
import { ModeSelectionStep } from "@/components/configure/templates/mode-selection-step";
import type { MarkdownField } from "@/components/configure/types/markdown";
import type { TechChoice } from "@/components/configure/types/tech-choice";
import {
  canStartInterview,
  canGoNext as checkCanGoNext,
  isConfigComplete as checkIsConfigComplete,
  isTechRequired,
} from "@/components/configure/utils/configure-helpers";
import type {
  ConfigureFlowMode,
  InterviewConfig,
} from "@/components/configure/utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CONFIGURE_STEPS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import useIsMobile from "@/hooks/use-is-mobile";
import { DatabaseService } from "@/lib/database";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig as DomainInterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";
import type { ExtractedJobDescription } from "@/lib/services/job-description/extractor";
import { parseSimpleMarkdown } from "@/lib/utils/markdown-parser";
import { useAuth } from "@/providers/auth-provider";
import type { CompanyProfileValue, PositionValue } from "@/types/global";

function getTechChoices(position: string): TechChoice[] {
  switch (position) {
    case "frontend":
      return [
        { value: "react", label: "React", icon: SiReact },
        { value: "typescript", label: "TypeScript", icon: SiTypescript },
        { value: "javascript", label: "JavaScript", icon: SiJavascript },
        {
          value: "csharp",
          label: "C#",
          icon: "/icons/csharp/csharp-plain.svg",
        },
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "html5", label: "HTML", icon: SiHtml5 },
        { value: "css", label: "CSS", icon: SiCss3 },
      ];
    case "backend":
      return [
        { value: "java", label: "Java", icon: FaJava },
        { value: "python", label: "Python", icon: SiPython },
        { value: "go", label: "Go", icon: SiGo },
        {
          value: "csharp",
          label: "C#",
          icon: "/icons/csharp/csharp-plain.svg",
        },
        { value: "typescript", label: "TypeScript", icon: SiTypescript },
        { value: "javascript", label: "JavaScript", icon: SiJavascript },
        { value: "rust", label: "Rust", icon: SiRust },
        { value: "php", label: "PHP", icon: SiPhp },
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
        {
          value: "aws",
          label: "AWS",
          icon: "/assets/icons/amazonwebServices.svg",
        },
        { value: "gcp", label: "GCP", icon: SiGooglecloud },
      ];
    case "fullstack":
      return [
        { value: "react", label: "React", icon: SiReact },
        { value: "typescript", label: "TypeScript", icon: SiTypescript },
        { value: "javascript", label: "JavaScript", icon: SiJavascript },
        { value: "html5", label: "HTML", icon: SiHtml5 },
        { value: "css", label: "CSS", icon: SiCss3 },
        { value: "java", label: "Java", icon: FaJava },
        { value: "python", label: "Python", icon: SiPython },
        { value: "go", label: "Go", icon: SiGo },
        {
          value: "csharp",
          label: "C#",
          icon: "/icons/csharp/csharp-plain.svg",
        },
        { value: "rust", label: "Rust", icon: SiRust },
        { value: "php", label: "PHP", icon: SiPhp },
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
        {
          value: "aws",
          label: "AWS",
          icon: "/assets/icons/amazonwebServices.svg",
        },
        { value: "gcp", label: "GCP", icon: SiGooglecloud },
      ];
    case "devops":
      return [
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
        { value: "terraform", label: "Terraform", icon: SiTerraform },
        {
          value: "aws",
          label: "AWS",
          icon: "/assets/icons/amazonwebServices.svg",
        },
        { value: "gcp", label: "GCP", icon: SiGooglecloud },
        {
          value: "azure",
          label: "Azure",
          icon: "/icons/azure/azure-plain.svg",
        },
      ];
    case "mobile":
      return [
        { value: "reactnative", label: "React Native", icon: SiReact },
        { value: "flutter", label: "Flutter", icon: SiFlutter },
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "swift", label: "Swift", icon: TbBrandSwift },
        { value: "kotlin", label: "Kotlin", icon: TbBrandKotlin },
      ];
    case "data-engineer":
      return [
        { value: "python", label: "Python", icon: SiPython },
        { value: "java", label: "Java", icon: FaJava },
        { value: "go", label: "Go", icon: SiGo },
      ];
    case "data-scientist":
      return [
        { value: "python", label: "Python", icon: SiPython },
        { value: "go", label: "Go", icon: SiGo },
        { value: "java", label: "Java", icon: FaJava },
        { value: "rust", label: "Rust", icon: SiRust },
        { value: "docker", label: "Docker", icon: SiDocker },
      ];
    case "cybersecurity":
      return [
        { value: "security", label: "Security", icon: Shield },
        { value: "docker", label: "Docker", icon: SiDocker },
        { value: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
        { value: "terraform", label: "Terraform", icon: SiTerraform },
        {
          value: "aws",
          label: "AWS",
          icon: "/assets/icons/amazonwebServices.svg",
        },
        { value: "gcp", label: "GCP", icon: SiGooglecloud },
        {
          value: "azure",
          label: "Azure",
          icon: "/icons/azure/azure-plain.svg",
        },
        { value: "java", label: "Java", icon: FaJava },
        { value: "go", label: "Go", icon: SiGo },
        { value: "rust", label: "Rust", icon: SiRust },
        { value: "python", label: "Python", icon: SiPython },
      ];
    default:
      return [];
  }
}

const BANK_TECH_VALUES = new Set<string>([
  "aws",
  "azure",
  "css",
  "docker",
  "flutter",
  "gcp",
  "go",
  "html5",
  "java",
  "javascript",
  "kotlin",
  "kubernetes",
  "php",
  "python",
  "react",
  "reactnative",
  "rust",
  "swift",
  "terraform",
  "typescript",
  "csharp",
]);

const DESCRIPTION_STEP_ID = "description";
const ANALYSIS_STEP_ID = "analysis";
const PASTE_ONLY_STEP_IDS = new Set([DESCRIPTION_STEP_ID, ANALYSIS_STEP_ID]);
const PASTE_FLOW_STEP_IDS = new Set([
  "flow",
  DESCRIPTION_STEP_ID,
  ANALYSIS_STEP_ID,
]);
const ANALYSIS_DOTS = [0, 1, 2];
type ExtractDescriptionResponse = {
  success?: boolean;
  error?: unknown;
  data?: ExtractedJobDescription;
};

function getVisibleStepsForFlow(flowMode: ConfigureFlowMode | null) {
  if (flowMode === "paste") {
    return CONFIGURE_STEPS.filter((step) => PASTE_FLOW_STEP_IDS.has(step.id));
  }
  if (flowMode === "custom") {
    return CONFIGURE_STEPS.filter((step) => !PASTE_ONLY_STEP_IDS.has(step.id));
  }
  return [];
}

function formatAnalysisError(error: unknown): string {
  // User-friendly fallback message
  const fallbackMessage =
    "We couldn't analyze this job description. Please try again in a moment.";

  if (!error) return fallbackMessage;

  // Extract error string from various error types
  const errorString =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? (error as { message?: string }).message
          : "";

  if (errorString) {
    // Network/server errors - suggest retry
    if (
      errorString.toLowerCase().includes("network") ||
      errorString.toLowerCase().includes("fetch") ||
      errorString.toLowerCase().includes("timeout")
    ) {
      return "Connection issue. Please check your internet and try again.";
    }

    // AI/parsing errors - these are temporary issues
    if (
      errorString.toLowerCase().includes("ai response") ||
      errorString.toLowerCase().includes("parse") ||
      errorString.toLowerCase().includes("json")
    ) {
      return "The AI had trouble processing this description. Please try again.";
    }

    // Validation errors from Zod - AI returned incomplete data
    if (
      errorString.toLowerCase().includes("at least") ||
      errorString.toLowerCase().includes("refined job brief") ||
      errorString.toLowerCase().includes("minimum")
    ) {
      return "The AI couldn't fully process this description. Please try again.";
    }
  }

  // Handle Zod validation arrays
  if (Array.isArray(error) && error.length > 0) {
    return "The AI couldn't fully process this description. Please try again.";
  }

  return fallbackMessage;
}

export function ConfigureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const { user } = useAuth();
  const [usageStatus, setUsageStatus] = useState<{
    canStart: boolean;
    remainingMinutes: number;
    isPro: boolean;
    checked: boolean;
  }>({ canStart: true, remainingMinutes: 0, isPro: false, checked: false });
  const resolveInitialFlowMode = () => {
    const flow = searchParams.get("flow");
    if (flow === "paste") return "paste";
    if (flow === "custom") return "custom";
    return null;
  };
  const [config, setConfig] = useState<InterviewConfig>(() => ({
    flowMode: resolveInitialFlowMode(),
    position: "",
    seniority: "",
    technologies: [],
    companyProfile: "generic",
    specificCompany: "",
    interviewMode: "",
    interviewType: "technical",
    duration: "30",
    company: "",
    jobDescription: "",
    jobRequirements: "",
    contextType: "",
    pastedDescription: "",
  }));
  const [currentStep, setCurrentStep] = useState(() => {
    const requestedStepId = searchParams.get("step");
    const stepsForFlow = getVisibleStepsForFlow(resolveInitialFlowMode());
    const requestedIndex = stepsForFlow.findIndex(
      (step) => step.id === requestedStepId,
    );
    return requestedIndex >= 0 ? requestedIndex : 0;
  });
  const [isAnalyzingDescription, setIsAnalyzingDescription] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<MarkdownField>(null);

  const visibleSteps = getVisibleStepsForFlow(config.flowMode);

  useEffect(() => {
    if (currentStep >= visibleSteps.length) {
      setCurrentStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [currentStep, visibleSteps.length]);

  const currentStepId = visibleSteps[currentStep]?.id ?? "flow";

  // Check usage status when reaching the last step or analysis step (for paste flow)
  useEffect(() => {
    const isLastStep = currentStep === visibleSteps.length - 1;
    const isAnalysisStepInPaste =
      currentStepId === "analysis" && config.flowMode === "paste";

    if (
      (isLastStep || isAnalysisStepInPaste) &&
      user?.uid &&
      !usageStatus.checked
    ) {
      DatabaseService.checkUsageStatus(user.uid).then((status) => {
        setUsageStatus({
          canStart: status.canStart,
          remainingMinutes: status.remainingMinutes,
          isPro: status.isPro,
          checked: true,
        });
      });
    }
  }, [
    currentStep,
    visibleSteps.length,
    currentStepId,
    config.flowMode,
    user?.uid,
    usageStatus.checked,
  ]);

  const techChoicesForCurrentPosition = getTechChoices(config.position);

  const autoAdvanceTechChoices = (() => {
    if (currentStepId !== "technologies") return null;
    if (!isTechRequired(config.position)) return null;
    const filtered = techChoicesForCurrentPosition.filter((tech) =>
      BANK_TECH_VALUES.has(tech.value),
    );
    return filtered.length === 1 ? filtered : null;
  })();

  const updateConfig = useCallback(
    <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
      setConfig((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Clear analysis error when user updates the pasted description
      if (key === "pastedDescription") {
        setAnalysisError(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!autoAdvanceTechChoices) return;
    const [onlyChoice] = autoAdvanceTechChoices;
    if (!config.technologies.includes(onlyChoice.value)) {
      updateConfig("technologies", [onlyChoice.value]);
      return;
    }
    if (
      currentStepId === "technologies" &&
      checkCanGoNext(currentStepId, config) &&
      currentStep < visibleSteps.length - 1
    ) {
      setCurrentStep((prev) => Math.min(prev + 1, visibleSteps.length - 1));
    }
  }, [
    autoAdvanceTechChoices,
    config,
    currentStep,
    currentStepId,
    updateConfig,
    visibleSteps.length,
  ]);

  const filteredTechChoices = (() => {
    if (!isTechRequired(config.position)) return [];
    return techChoicesForCurrentPosition.filter((tech) =>
      BANK_TECH_VALUES.has(tech.value),
    );
  })();

  const handleToggleTechnology = useCallback((tech: string) => {
    setConfig((prev) => {
      const nextTechnologies = prev.technologies.includes(tech)
        ? prev.technologies.filter((item) => item !== tech)
        : [...prev.technologies, tech];
      return {
        ...prev,
        technologies: nextTechnologies,
      };
    });
  }, []);

  const handleStartInterview = useCallback(
    (overrideConfig?: InterviewConfig) => {
      const interviewConfig = overrideConfig || config;
      if (!canStartInterview(interviewConfig)) return;

      const domainConfig: DomainInterviewConfig = {
        position: (interviewConfig.position || "frontend") as PositionValue,
        seniority: (interviewConfig.seniority || "mid") as SeniorityLevel,
        technologies: interviewConfig.technologies || [],
        companyProfile: (interviewConfig.companyProfile ||
          "generic") as CompanyProfileValue,
        company: interviewConfig.company || undefined,
        interviewMode: (interviewConfig.interviewMode ||
          "regular") as InterviewMode,
        interviewType: (interviewConfig.interviewType ||
          "technical") as InterviewType,
        duration: interviewConfig.duration || "30",
        isDemoMode: false,
        contextType: interviewConfig.contextType || undefined,
        jobId: interviewConfig.jobId || undefined,
        jobDescription: interviewConfig.jobDescription || undefined,
        jobRequirements: interviewConfig.jobRequirements || undefined,
        jobLocation: interviewConfig.jobLocation || undefined,
        jobType: interviewConfig.jobType || undefined,
      };

      const urlParams = buildSearchParamsFromInterviewConfig(domainConfig);
      router.push(`/interview?${urlParams.toString()}`);
    },
    [config, router],
  );

  const isConfigComplete = checkIsConfigComplete(config);
  const isDescriptionStep = currentStepId === DESCRIPTION_STEP_ID;
  const isAnalysisStep = currentStepId === ANALYSIS_STEP_ID;
  const totalSteps = visibleSteps.length;
  const canGoNext = () => checkCanGoNext(currentStepId, config);

  const handleNext = () => {
    if (canGoNext() && currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderNextButton = () => {
    const shouldHidePrimaryAction =
      currentStepId === "technologies" &&
      !!autoAdvanceTechChoices &&
      autoAdvanceTechChoices.length === 1;

    if (shouldHidePrimaryAction) {
      return <div className="w-[70px]" />; // Spacer for mobile layout alignment
    }

    const isStartStep =
      currentStep === totalSteps - 1 ||
      (isAnalysisStep && config.flowMode === "paste");

    // Show upgrade CTA if user hit the limit
    if (
      isStartStep &&
      usageStatus.checked &&
      !usageStatus.canStart &&
      !usageStatus.isPro
    ) {
      return (
        <Link href="/upgrade">
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2 !min-h-0"
          >
            <Crown className="size-4" />
            <span className="hidden sm:inline">Upgrade to Pro</span>
            <span className="sm:hidden">Upgrade</span>
          </Button>
        </Link>
      );
    }

    if (isStartStep) {
      return (
        <Button
          onClick={() => handleStartInterview()}
          disabled={!isConfigComplete}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 !min-h-0"
        >
          <span className="inline">Start</span>
          <ArrowRight className="size-4 sm:size-5" />
        </Button>
      );
    }

    if (isDescriptionStep && config.flowMode === "paste") {
      return <div className="w-[70px]" />; // Spacer
    }

    return (
      <Button
        onClick={handleNext}
        disabled={!canGoNext()}
        size="sm"
        className="flex items-center gap-2 !min-h-0"
      >
        Next
      </Button>
    );
  };

  const renderPreviousButton = () => (
    <Button
      variant="outline"
      onClick={handlePrevious}
      disabled={currentStep === 0}
      size="sm"
      className={`flex items-center gap-2 !min-h-0 ${currentStep === 0 ? "invisible" : ""}`}
    >
      <span className="inline">Previous</span>
    </Button>
  );

  const handleFlowSelect = (mode: ConfigureFlowMode) => {
    setConfig((prev) => ({
      ...prev,
      flowMode: mode,
      pastedDescription: mode === "custom" ? "" : prev.pastedDescription,
    }));
    setAnalysisError(null);

    // Auto-advance to next step after flow selection
    const nextVisibleSteps = getVisibleStepsForFlow(mode);
    if (currentStep < nextVisibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAnalyzeDescription = async (
    event?: React.FormEvent | React.MouseEvent,
  ) => {
    // Prevent form submission from reloading the page
    event?.preventDefault();

    const trimmedDescription = config.pastedDescription.trim();
    if (!trimmedDescription) {
      const message = "Paste a job description first.";
      setAnalysisError(message);
      return;
    }
    if (trimmedDescription.length < 50) {
      const message =
        "Please provide a job description with at least 50 characters.";
      setAnalysisError(message);
      return;
    }
    setIsAnalyzingDescription(true);
    setAnalysisError(null);

    // Store current step to prevent unwanted navigation during error
    const currentStepBeforeAnalysis = currentStep;

    try {
      const response = await fetch("/api/job-description/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: config.pastedDescription }),
      });

      // Safely parse JSON response
      let payload: ExtractDescriptionResponse;
      try {
        payload = await response.json();
      } catch (_parseError) {
        throw new Error("Invalid response from server.");
      }

      if (!response.ok || !payload?.success) {
        // Log the actual error for debugging
        console.error("API Error Response:", {
          status: response.status,
          ok: response.ok,
          payload,
        });
        throw new Error(formatAnalysisError(payload?.error));
      }

      const data = payload.data as ExtractedJobDescription | undefined;
      if (!data) {
        throw new Error("Invalid analysis response.");
      }

      const {
        position,
        seniority,
        technologies,
        company,
        jobDescription,
        jobRequirements,
        companyProfile,
      } = data;

      updateConfig("position", position);
      updateConfig("seniority", seniority);
      updateConfig("technologies", technologies);
      updateConfig("company", company ?? "");
      updateConfig("jobDescription", jobDescription);
      updateConfig("jobRequirements", jobRequirements);
      updateConfig("companyProfile", companyProfile ?? config.companyProfile);
      updateConfig("contextType", "job-specific");
      const analysisIndex = visibleSteps.findIndex(
        (step) => step.id === ANALYSIS_STEP_ID,
      );
      setCurrentStep(analysisIndex >= 0 ? analysisIndex : currentStep);
      toast.success("Job description analyzed");
    } catch (error) {
      // Prevent any unhandled errors from causing page reload
      console.error("Analysis error:", error);

      let message = "Failed to analyze description.";
      try {
        message = formatAnalysisError(error);
      } catch (formatError) {
        // If even formatting fails, use generic message
        console.error("Error formatting failed:", formatError);
      }

      setAnalysisError(message);

      // Ensure we stay on the current step during error
      setCurrentStep(currentStepBeforeAnalysis);
    } finally {
      setIsAnalyzingDescription(false);
    }
  };

  const handlePreviewKey = (
    event: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement>,
    field: MarkdownField,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingField(field);
    }
  };

  function renderFlowStep() {
    const FLOW_OPTIONS: {
      value: ConfigureFlowMode;
      title: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
    }[] = [
      {
        value: "custom",
        title: "Custom interview",
        description: "Manually configure stack, seniority, and role details.",
        icon: TiFlowChildren,
      },
      {
        value: "paste",
        title: "Paste description",
        description: "Simulate an interview tailored to exact position.",
        icon: FiCopy,
      },
    ];

    return (
      <div className="relative">
        {isAnalyzingDescription && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-background/90 backdrop-blur-md shadow-lg">
            <div
              className="absolute inset-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-pulse"
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-4 text-center px-6">
              <div className="size-20 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background shadow-inner">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
              <div>
                <Typography.BodyBold>
                  Analyzing job description…
                </Typography.BodyBold>
                <Typography.CaptionMedium className="text-muted-foreground">
                  Extracting position, seniority, tech stack, and company cues.
                </Typography.CaptionMedium>
              </div>
              <div className="flex items-center gap-2">
                {ANALYSIS_DOTS.map((dot) => (
                  <span
                    key={dot}
                    className="size-2 rounded-full bg-primary/80 animate-bounce"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className={`space-y-8 ${isAnalyzingDescription ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="flex gap-4 flex-col md:flex-row">
            {FLOW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = config.flowMode === option.value;
              return (
                <Card
                  key={option.value}
                  className={`cursor-pointer w-full md:w-60 transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                    isSelected
                      ? "ring-1 ring-primary border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleFlowSelect(option.value)}
                >
                  <CardContent className="flex flex-col items-start gap-4">
                    <Icon className="size-5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <Typography.BodyBold>{option.title}</Typography.BodyBold>
                      <Typography.Caption color="secondary">
                        {option.description}
                      </Typography.Caption>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderDescriptionStep() {
    if (config.flowMode === "custom") {
      return (
        <Card>
          <CardContent className="space-y-3">
            <Typography.BodyBold>No description needed</Typography.BodyBold>
            <Typography.CaptionMedium color="secondary">
              You chose manual setup. Skip ahead or switch back to paste flow to
              use AI.
            </Typography.CaptionMedium>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="relative w-full max-w-3xl space-y-6 text-start">
          <form
            onSubmit={handleAnalyzeDescription}
            className="mx-auto w-full max-w-3xl"
          >
            <label className="sr-only" htmlFor="ai-message-landing">
              Describe the interview you want to build
            </label>
            <div className="relative flex flex-col gap-3 rounded-4xl border border-border/60 bg-card/95 px-4 py-4 shadow-2xl backdrop-blur sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:py-3.5">
              <Textarea
                id="pastedDescription"
                value={config.pastedDescription}
                onChange={(event) =>
                  updateConfig("pastedDescription", event.target.value)
                }
                placeholder={
                  isMobile
                    ? "Paste job description…"
                    : "Paste the job description here..."
                }
                rows={isMobile ? 6 : 3}
                className="min-h-[180px] flex-1 resize-none border-none shadow-none !bg-transparent text-base focus-visible:ring-0 sm:min-h-0 sm:max-h-[50vh] sm:pr-10"
                autoFocus
              />
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-none">
                <Button
                  onClick={handleAnalyzeDescription}
                  size="sm"
                  disabled={
                    isAnalyzingDescription || !config.pastedDescription.trim()
                  }
                  className="flex items-center justify-center gap-2 w-full sm:mt-2 sm:w-auto"
                >
                  {isAnalyzingDescription && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Analyze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    isAnalyzingDescription || !config.pastedDescription.trim()
                  }
                  className="hidden items-center justify-center gap-2 sm:flex"
                  onClick={() => {
                    setAnalysisError(null);
                    setConfig((prev) => ({
                      ...prev,
                      pastedDescription: "",
                      jobDescription: "",
                      jobRequirements: "",
                      company: "",
                      technologies: [],
                    }));
                  }}
                >
                  Reset
                </Button>
                <Typography.Caption
                  color="secondary"
                  className="text-center sm:hidden"
                >
                  Paste the full job post. We’ll extract role, seniority, tech
                  stack, and company.
                </Typography.Caption>
              </div>
            </div>
          </form>
        </div>

        {analysisError && (
          <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <Typography.CaptionMedium
              color="error"
              className="flex items-center gap-2"
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Error"
              >
                <title>Error</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {analysisError}
            </Typography.CaptionMedium>
          </div>
        )}
      </div>
    );
  }

  function renderAnalysisStep() {
    if (config.flowMode === "custom") {
      return (
        <Card>
          <CardContent className="space-y-3">
            <Typography.BodyBold>No AI analysis needed</Typography.BodyBold>
            <Typography.CaptionMedium className="text-muted-foreground">
              You chose manual configuration. Continue to the next steps to set
              everything yourself.
            </Typography.CaptionMedium>
          </CardContent>
        </Card>
      );
    }

    if (!config.jobDescription) {
      return (
        <Card>
          <CardContent className="space-y-3">
            <Typography.BodyBold>Awaiting analysis</Typography.BodyBold>
            <Typography.CaptionMedium className="text-muted-foreground">
              Paste a job description in the previous step and tap “Analyze
              description” to review AI results here.
            </Typography.CaptionMedium>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="space-y-6 px-6">
            <EditableExtractedTags
              config={config}
              filteredTechChoices={filteredTechChoices}
              techChoicesForPosition={techChoicesForCurrentPosition}
              isTechRequired={isTechRequired(config.position)}
              onUpdateConfig={updateConfig}
              onToggleTechnology={handleToggleTechnology}
            />
            <Separator className="bg-gray-200 my-10" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography.CaptionBold>
                  Refined job brief
                </Typography.CaptionBold>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    setEditingField((prev) =>
                      prev === "summary" ? null : "summary",
                    )
                  }
                >
                  {editingField === "summary" ? "Preview" : "Edit"}
                </Button>
              </div>
              {editingField === "summary" ? (
                <Textarea
                  autoFocus
                  value={config.jobDescription}
                  onChange={(event) =>
                    updateConfig("jobDescription", event.target.value)
                  }
                  placeholder="Describe the role, responsibilities, and mission…"
                  className="min-h-[200px] bg-background border-muted font"
                />
              ) : (
                <button
                  type="button"
                  className={`w-full text-left rounded-2xl border border-border/60 bg-muted/20 p-5 min-h-fit text-base leading-relaxed text-foreground ${
                    config.jobDescription?.trim()
                      ? ""
                      : "text-muted-foreground italic flex items-center justify-center"
                  }`}
                  onClick={() => setEditingField("summary")}
                  onKeyDown={(event) => handlePreviewKey(event, "summary")}
                >
                  {config.jobDescription?.trim() ? (
                    <div
                      className="space-y-3"
                      dangerouslySetInnerHTML={parseSimpleMarkdown(
                        config.jobDescription,
                      )}
                    />
                  ) : (
                    "Click to add a refined job brief using markdown"
                  )}
                </button>
              )}
            </div>
            <Separator className="bg-gray-200" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography.CaptionBold>
                  Key requirements
                </Typography.CaptionBold>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    setEditingField((prev) =>
                      prev === "requirements" ? null : "requirements",
                    )
                  }
                >
                  {editingField === "requirements" ? "Preview" : "Edit"}
                </Button>
              </div>
              {editingField === "requirements" ? (
                <Textarea
                  autoFocus
                  value={config.jobRequirements || ""}
                  placeholder="List key requirements, bullet points, benefits…"
                  className="min-h-[160px] w-full"
                  onChange={(event) =>
                    updateConfig("jobRequirements", event.target.value)
                  }
                />
              ) : (
                <button
                  type="button"
                  className={`w-full text-left rounded-2xl border border-border/60 bg-muted/20 p-5 min-h-[160px] text-base leading-relaxed text-foreground ${
                    config.jobRequirements?.trim()
                      ? ""
                      : "text-muted-foreground italic flex items-center justify-center"
                  }`}
                  onClick={() => setEditingField("requirements")}
                  onKeyDown={(event) => handlePreviewKey(event, "requirements")}
                >
                  {config.jobRequirements?.trim() ? (
                    <div
                      className="space-y-2"
                      dangerouslySetInnerHTML={parseSimpleMarkdown(
                        config.jobRequirements,
                      )}
                    />
                  ) : (
                    "Click to add key requirements using markdown"
                  )}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderPositionStep() {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 max-w-fit gap-6">
          {POSITIONS.map((position) => {
            const Icon = position.icon;
            return (
              <Card
                key={position.value}
                className={`cursor-pointer max-w-60 transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                  config.position === position.value
                    ? "ring-1 ring-primary border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => updateConfig("position", position.value)}
              >
                <CardContent className="flex flex-col items-left gap-4">
                  <Icon className="size-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <Typography.BodyBold>{position.label}</Typography.BodyBold>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function renderExperienceStep() {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 max-w-fit gap-6">
        {SENIORITY_LEVELS.map((level) => (
          <Card
            key={level.value}
            className={`cursor-pointer max-w-60 transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
              config.seniority === level.value
                ? "ring-1 ring-primary border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => updateConfig("seniority", level.value)}
          >
            <CardContent className="flex flex-col items-left gap-2">
              <div className="flex flex-col items-left gap-4">
                {level.icon && <level.icon className="size-5 text-primary" />}
                <Typography.BodyBold>{level.label}</Typography.BodyBold>
              </div>
              <Typography.Caption
                color="secondary"
                className="max-sm:text-xs max-sm:break-words"
              >
                {level.description}
              </Typography.Caption>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderTechnologiesStep() {
    if (!isTechRequired(config.position)) {
      return (
        <div className="space-y-3">
          <Typography.BodyBold>Tech</Typography.BodyBold>
          <Typography.CaptionMedium color="secondary">
            Not required for this role.
          </Typography.CaptionMedium>
        </div>
      );
    }

    const selected = new Set(config.technologies);

    const renderTechIcon = (tech: TechChoice) => {
      if (typeof tech.icon === "string") {
        return (
          <span
            aria-label={`${tech.label} logo`}
            role="img"
            className="size-6 flex-shrink-0 rounded-sm text-primary"
            style={{
              backgroundColor: "currentColor",
              WebkitMaskImage: `url(${tech.icon})`,
              maskImage: `url(${tech.icon})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        );
      }

      return <tech.icon className="size-6 text-primary flex-shrink-0" />;
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 max-w-fit">
          {filteredTechChoices.map((tech) => (
            <Card
              key={tech.value}
              className={`cursor-pointer py-0 transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                selected.has(tech.value)
                  ? "ring-1 border-primary ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() => handleToggleTechnology(tech.value)}
            >
              <CardContent className="flex flex-row items-center gap-4 px-4 py-3">
                {renderTechIcon(tech)}
                <div className="flex-1 text-left">
                  <Typography.BodyBold>{tech.label}</Typography.BodyBold>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderModeStep() {
    return (
      <div className="space-y-6">
        <ModeSelectionStep
          config={config}
          onSelect={(mode) => {
            const updatedConfig = {
              ...config,
              interviewMode: mode,
            };
            setConfig(updatedConfig);

            // Auto-start if all conditions met
            const canAutoStart =
              canStartInterview(updatedConfig) &&
              (!usageStatus.checked ||
                usageStatus.canStart ||
                usageStatus.isPro);

            if (canAutoStart) {
              handleStartInterview(updatedConfig);
            }
          }}
        />

        {config.interviewMode === "timed" && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-300">
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Label htmlFor="duration">Interview Duration</Label>
              <Select
                value={config.duration}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, duration: value }))
                }
              >
                <SelectTrigger className="w-full bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStepContent(stepId: string) {
    switch (stepId) {
      case "flow":
        return renderFlowStep();
      case "description":
        return renderDescriptionStep();
      case "analysis":
        return renderAnalysisStep();
      case "position":
        return renderPositionStep();
      case "technologies":
        return renderTechnologiesStep();
      case "experience":
        return renderExperienceStep();
      case "mode":
        return renderModeStep();
      default:
        return null;
    }
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 space-y-4 hidden lg:block">
              <div className="flex flex-col gap-2 lg:items-start lg:justify-between text-center lg:text-left">
                <Typography.BodyBold className="text-2xl">
                  {visibleSteps[currentStep]?.title ?? CONFIGURE_STEPS[0].title}
                </Typography.BodyBold>
                <Typography.Body className="text-muted-foreground text-sm sm:text-base">
                  {visibleSteps[currentStep]?.description ??
                    CONFIGURE_STEPS[0].description}
                </Typography.Body>
              </div>
            </div>

            {/* Interview Limit Warning */}
            {usageStatus.checked &&
              !usageStatus.canStart &&
              !usageStatus.isPro &&
              (currentStep === totalSteps - 1 ||
                (isAnalysisStep && config.flowMode === "paste")) && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900 p-2">
                      <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <Typography.BodyBold className="text-amber-800 dark:text-amber-200">
                        Interview Limit Reached
                      </Typography.BodyBold>
                      <Typography.CaptionMedium className="text-amber-700 dark:text-amber-300 mt-1">
                        You&apos;ve reached the temporary interview limit.
                        {usageStatus.remainingMinutes > 0 && (
                          <span className="flex items-center gap-1 mt-1">
                            <Timer className="size-3" />
                            Please wait {usageStatus.remainingMinutes} minute
                            {usageStatus.remainingMinutes !== 1 ? "s" : ""}{" "}
                            before starting another session.
                          </span>
                        )}
                      </Typography.CaptionMedium>
                      <div className="mt-3 flex items-center gap-2">
                        <Crown className="size-4 text-amber-600 dark:text-amber-400" />
                        <Typography.CaptionMedium className="text-amber-700 dark:text-amber-300">
                          Want unlimited interviews? Upgrade to Pro for
                          unrestricted access.
                        </Typography.CaptionMedium>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div
              key={currentStepId}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              {renderStepContent(currentStepId)}
            </div>

            {currentStepId !== "flow" && (
              <div className="mt-6 hidden sm:flex justify-start">
                <div className="flex flex-row items-stretch gap-2 sm:gap-3">
                  {renderPreviousButton()}
                  {renderNextButton()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between sm:justify-center w-full">
            <div className="sm:hidden">{renderPreviousButton()}</div>
            <PaginationIndicator total={totalSteps} current={currentStep} />
            <div className="sm:hidden">{renderNextButton()}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
