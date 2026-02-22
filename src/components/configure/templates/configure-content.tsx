"use client";

import {
  ArrowRight,
  ArrowUp,
  Crown,
  Link2Icon,
  Loader2,
  Shield,
  Timer,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
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
import { PaginationIndicator } from "@/components/common/atoms/pagination-indicator";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { EditableExtractedTags } from "@/components/configure/molecules/editable-extracted-tags";
import { ModeSelectionStep } from "@/components/configure/templates/mode-selection-step";
import type { MarkdownField } from "@/components/configure/types/markdown";
import type { TechChoice } from "@/components/configure/types/tech-choice";
import {
  canStartInterview,
  canGoNext as checkCanGoNext,
  isConfigComplete as checkIsConfigComplete,
  isAutoFlow,
  isTechRequired,
} from "@/components/configure/utils/configure-helpers";
import type {
  ConfigureFlowMode,
  InterviewConfig,
} from "@/components/configure/utils/types";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CONFIGURE_STEPS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import { INTERVIEWERS } from "@/lib/config/interviewers";
import { DatabaseService } from "@/lib/database";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig as DomainInterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";
import type { ExtractedJobDescription } from "@/lib/services/job-description/extractor";
import { useAuth } from "@/providers/auth-provider";
import type { CompanyProfileValue, PositionValue } from "@/types/global";

const TECH_CHOICES = {
  frontend: [
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
  ],
  backend: [
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
  ],
  fullstack: [
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
  ],
  devops: [
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
  ],
  mobile: [
    { value: "reactnative", label: "React Native", icon: SiReact },
    { value: "flutter", label: "Flutter", icon: SiFlutter },
    { value: "docker", label: "Docker", icon: SiDocker },
    { value: "swift", label: "Swift", icon: TbBrandSwift },
    { value: "kotlin", label: "Kotlin", icon: TbBrandKotlin },
  ],
  "data-engineer": [
    { value: "python", label: "Python", icon: SiPython },
    { value: "java", label: "Java", icon: FaJava },
    { value: "go", label: "Go", icon: SiGo },
  ],
  "data-scientist": [
    { value: "python", label: "Python", icon: SiPython },
    { value: "go", label: "Go", icon: SiGo },
    { value: "java", label: "Java", icon: FaJava },
    { value: "rust", label: "Rust", icon: SiRust },
    { value: "docker", label: "Docker", icon: SiDocker },
  ],
  cybersecurity: [
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
  ],
} as const;

const getTechChoices = (position: string): TechChoice[] => {
  return (
    (TECH_CHOICES[
      position as keyof typeof TECH_CHOICES
    ] as unknown as TechChoice[]) || []
  );
};

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
  "mode",
]);
const ANALYSIS_DOTS = [0, 1, 2];
type ExtractDescriptionResponse = {
  success?: boolean;
  error?: unknown;
  data?: ExtractedJobDescription;
};

function getVisibleStepsForFlow(flowMode: ConfigureFlowMode | null) {
  if (isAutoFlow(flowMode)) {
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
    "We couldn't analyze this job description. Please try a different link.";

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
    // Unsupported platform error - pass through the exact message
    if (
      errorString.includes("isn't supported") ||
      errorString.includes("Try LinkedIn, Indeed, JustJoin")
    ) {
      return errorString;
    }

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
    if (flow === "url") return "url";
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
    interviewType: "mixed",
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
  const [_editingField, setEditingField] = useState<MarkdownField>(null);

  const visibleSteps = getVisibleStepsForFlow(config.flowMode);

  useEffect(() => {
    if (currentStep >= visibleSteps.length) {
      setCurrentStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [currentStep, visibleSteps.length]);

  const currentStepId = visibleSteps[currentStep]?.id ?? "flow";

  // Check usage status when reaching the last step (mode step)
  useEffect(() => {
    const isLastStep = currentStep === visibleSteps.length - 1;

    if (isLastStep && user?.uid && !usageStatus.checked) {
      DatabaseService.checkUsageStatus(user.uid).then((status) => {
        setUsageStatus({
          canStart: status.canStart,
          remainingMinutes: status.remainingMinutes,
          isPro: status.isPro,
          checked: true,
        });
      });
    }
  }, [currentStep, visibleSteps.length, user?.uid, usageStatus.checked]);

  const techChoicesForCurrentPosition = getTechChoices(config.position);

  const autoAdvanceTechChoices = (() => {
    if (currentStepId !== "technologies") return null;
    if (!isTechRequired(config.position)) return null;
    const filtered = techChoicesForCurrentPosition.filter((tech: TechChoice) =>
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
      if (key === "pastedDescription" || key === "pastedUrl") {
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
    }
  }, [autoAdvanceTechChoices, config.technologies, updateConfig]);

  const filteredTechChoices = (() => {
    if (!isTechRequired(config.position)) return [];
    return techChoicesForCurrentPosition.filter((tech: TechChoice) =>
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

    const isStartStep = currentStep === totalSteps - 1;

    // Show upgrade CTA if user hit the limit
    if (
      isStartStep &&
      usageStatus.checked &&
      !usageStatus.canStart &&
      !usageStatus.isPro
    ) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/settings?tab=subscription"
            title="Upgrade to Pro"
            aria-label="Upgrade to Pro"
            className="relative group flex items-center px-3 h-8 rounded-lg transition-all duration-300 w-full overflow-hidden bg-[#10B981]/5 hover:bg-[#10B981]/10 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] shadow-sm"
          >
            <div className="relative flex items-center shrink-0 w-5">
              <Zap className="size-4 transition-colors text-[#10B981] fill-[#10B981]" />
            </div>

            <span className=" relative font-bold text-sm tracking-tight truncate hidden sm:inline">
              Upgrade to Pro
            </span>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          </Link>
        </motion.div>
      );
    }

    if (isStartStep) {
      return (
        <Button
          data-tour="configure-start"
          onClick={() => handleStartInterview()}
          disabled={!isConfigComplete}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 !min-h-0"
        >
          <span className="inline">Next</span>
          <ArrowRight className="size-4 sm:size-5" />
        </Button>
      );
    }

    if (isDescriptionStep && isAutoFlow(config.flowMode)) {
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
      Back
    </Button>
  );

  const handleFlowSelect = (mode: ConfigureFlowMode) => {
    setConfig((prev) => ({
      ...prev,
      flowMode: mode,
      pastedDescription: mode === "custom" ? "" : prev.pastedDescription,
      pastedUrl: mode === "url" ? prev.pastedUrl : "",
    }));
    setAnalysisError(null);

    // Auto-advance to next step
    setCurrentStep(1);
  };

  const runAnalysis = async (
    endpoint: string,
    body: Record<string, string>,
    _successMessage: string,
  ) => {
    setIsAnalyzingDescription(true);
    setAnalysisError(null);
    const stepBefore = currentStep;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let payload: ExtractDescriptionResponse;
      try {
        payload = await response.json();
      } catch {
        console.error("Server returned an invalid response");
        setAnalysisError(
          "Server returned an invalid response. Please try again.",
        );
        setCurrentStep(stepBefore);
        return;
      }

      if (!response.ok) {
        console.error(`Server error: ${response.status}`);
        setAnalysisError(`Server error: ${response.status}. Please try again.`);
        setCurrentStep(stepBefore);
        return;
      }

      if (!payload || typeof payload !== "object") {
        console.error("Server returned an empty response");
        setAnalysisError(
          "Server returned an empty response. Please try again.",
        );
        setCurrentStep(stepBefore);
        return;
      }

      if (!payload.success) {
        console.error("Analysis failed:", payload.error);
        setAnalysisError(formatAnalysisError(payload.error));
        setCurrentStep(stepBefore);
        return;
      }

      const data = payload.data as ExtractedJobDescription | undefined;
      if (!data) {
        console.error("Invalid analysis response");
        setAnalysisError("Invalid analysis response. Please try again.");
        setCurrentStep(stepBefore);
        return;
      }

      updateConfig("position", data.position);
      updateConfig("seniority", data.seniority);
      updateConfig("technologies", data.technologies);
      updateConfig("company", data.company ?? "");
      updateConfig("jobDescription", data.jobDescription);
      updateConfig("jobRequirements", data.jobRequirements);
      updateConfig(
        "companyProfile",
        data.companyProfile ?? config.companyProfile,
      );
      updateConfig("contextType", "job-specific");

      const analysisIndex = visibleSteps.findIndex(
        (step) => step.id === ANALYSIS_STEP_ID,
      );
      setCurrentStep(analysisIndex >= 0 ? analysisIndex : currentStep);
    } finally {
      setIsAnalyzingDescription(false);
    }
  };

  const handleAnalyzeDescription = async (
    event?: React.FormEvent | React.MouseEvent,
  ) => {
    event?.preventDefault();

    const trimmed = config.pastedDescription.trim();
    if (!trimmed) {
      setAnalysisError("Paste a job description first.");
      return;
    }
    if (/^https?:\/\/\S+$/i.test(trimmed)) {
      setAnalysisError(
        'Looks like you pasted a URL. Switch to "Paste job link" flow to analyze a link, or paste the full job description text here.',
      );
      return;
    }
    if (trimmed.length < 50) {
      setAnalysisError(
        "Please provide a job description with at least 50 characters.",
      );
      return;
    }
    await runAnalysis(
      "/api/job-description/extract",
      { description: config.pastedDescription },
      "Job description analyzed",
    );
  };

  const handleAnalyzeUrl = async (
    event?: React.FormEvent | React.MouseEvent,
  ) => {
    event?.preventDefault();
    const url = config.pastedUrl?.trim() ?? "";
    if (!url) {
      setAnalysisError("Paste a job URL first.");
      return;
    }
    if (!url.startsWith("https://")) {
      setAnalysisError("Please use a valid https:// URL.");
      return;
    }
    await runAnalysis(
      "/api/job-description/extract-from-url",
      { url },
      "Job offer analyzed",
    );
  };

  const _handlePreviewKey = (
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
        title: "Paste job decription",
        description: "Provide the job description for AI analysis.",
        icon: FiCopy,
      },
      {
        value: "url",
        title: "Paste job link",
        description: "Paste a job offer URL to auto-fill everything.",
        icon: Link2Icon,
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
                  {config.flowMode === "url"
                    ? "Analyzing job offer…"
                    : "Analyzing job description…"}
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <CardContent className="space-y-3">
              <Typography.BodyBold>No description needed</Typography.BodyBold>
              <Typography.CaptionMedium color="secondary">
                You chose manual setup. Skip ahead or switch back to paste flow
                to use AI.
              </Typography.CaptionMedium>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (config.flowMode === "url") {
      return (
        <div className="flex flex-col items-center justify-center space-y-6 min-h-[80vh] sm:min-h-[70vh]">
          <Typography.Heading1 className="!text-4xl sm:!text-5xl tracking-tight drop-shadow !text-primary text-center">
            Paste link to an offer
          </Typography.Heading1>
          <div className="relative w-full max-w-3xl space-y-6 text-center">
            <form
              onSubmit={handleAnalyzeUrl}
              className="mx-auto w-full max-w-3xl"
            >
              <div className="relative flex items-center gap-3 rounded-4xl border border-border/60 bg-card/95 px-5 py-3.5 shadow-2xl backdrop-blur">
                <PromptInput
                  value={config.pastedUrl ?? ""}
                  onValueChange={(value: string) =>
                    updateConfig("pastedUrl", value)
                  }
                  isLoading={isAnalyzingDescription}
                  onSubmit={handleAnalyzeUrl}
                  className="w-full"
                >
                  <PromptInputTextarea
                    id="ai-message-landing"
                    value={config.pastedUrl ?? ""}
                    onChange={(e) => updateConfig("pastedUrl", e.target.value)}
                    placeholder="Paste a LinkedIn, Indeed, JustJoin, ZipRecruiter or FlexJobs URL…"
                    className="flex-1 resize-none border-none shadow-none !bg-transparent pr-12 sm:pr-28 text-base focus-visible:ring-0"
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLTextAreaElement>,
                    ) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        handleAnalyzeUrl();
                      }
                    }}
                    rows={3}
                    autoFocus
                  />
                  <PromptInputActions className="justify-end pt-2">
                    <PromptInputAction
                      tooltip={
                        isAnalyzingDescription
                          ? "Stop generation"
                          : "Send message"
                      }
                    >
                      <Button
                        type="submit"
                        variant="default"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        {isAnalyzingDescription ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <ArrowUp className="size-5" />
                        )}
                      </Button>
                    </PromptInputAction>
                  </PromptInputActions>
                </PromptInput>
              </div>
              <Typography.Caption
                color="secondary"
                className="mt-3 block text-center sm:text-center"
              >
                <span className="inline-flex items-center gap-1 flex-wrap justify-center sm:justify-start">
                  <a
                    href="https://www.linkedin.com/jobs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    LinkedIn
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="https://www.indeed.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    Indeed
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="https://justjoin.it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    JustJoin.it
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="https://www.google.com/search?q=jobs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    Google Jobs
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="https://www.ziprecruiter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    ZipRecruiter
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="https://www.flexjobs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline transition-colors"
                  >
                    FlexJobs
                  </a>
                </span>
              </Typography.Caption>
            </form>
          </div>

          {analysisError && (
            <div className="flex gap-4 items-center">
              <InterviewerAvatar interviewer={INTERVIEWERS[2]} size={40} />
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 py-2">
                <Typography.CaptionMedium
                  color="error"
                  className="flex items-center gap-2"
                >
                  {analysisError}
                </Typography.CaptionMedium>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-[60vh]">
        <Typography.Heading1 className="!text-4xl sm:!text-5xl tracking-tight drop-shadow !text-primary text-center">
          Paste job description
        </Typography.Heading1>
        <div className="relative w-full max-w-3xl space-y-6 text-center">
          <form
            onSubmit={handleAnalyzeDescription}
            className="mx-auto w-full max-w-3xl"
          >
            <div className="relative flex items-center gap-3 rounded-4xl border border-border/60 bg-card/95 px-5 py-3.5 shadow-2xl backdrop-blur">
              <PromptInput
                value={config.pastedDescription}
                onValueChange={(value: string) =>
                  updateConfig("pastedDescription", value)
                }
                isLoading={isAnalyzingDescription}
                onSubmit={handleAnalyzeDescription}
                className="w-full"
              >
                <PromptInputTextarea
                  value={config.pastedDescription}
                  onChange={(e) =>
                    updateConfig("pastedDescription", e.target.value)
                  }
                  placeholder="Paste the full job post. We'll extract role, seniority, tech stack, and company..."
                  className="flex-1 resize-none border-none shadow-none !bg-transparent pr-12 sm:pr-28 text-base focus-visible:ring-0"
                  onKeyDown={(
                    event: React.KeyboardEvent<HTMLTextAreaElement>,
                  ) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      handleAnalyzeDescription();
                    }
                  }}
                  rows={3}
                  autoFocus
                />
                <PromptInputActions className="justify-end pt-2">
                  <PromptInputAction
                    tooltip={
                      isAnalyzingDescription
                        ? "Stop generation"
                        : "Send message"
                    }
                  >
                    <Button
                      type="submit"
                      variant="default"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      {isAnalyzingDescription ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <ArrowUp className="size-5" />
                      )}
                    </Button>
                  </PromptInputAction>
                </PromptInputActions>
              </PromptInput>
            </div>
          </form>
        </div>

        {analysisError && (
          <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <Typography.CaptionMedium
              color="error"
              className="flex items-start gap-2"
            >
              <svg
                className="size-4 shrink-0 mt-0.5"
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
              <div className="flex-1">
                <div>{analysisError}</div>
                {analysisError.includes("isn't supported") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => updateConfig("flowMode", "paste")}
                  >
                    Switch to paste job description
                  </Button>
                )}
              </div>
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

    return (
      <div className="space-y-6">
        {!config.jobDescription?.trim() && !config.jobRequirements?.trim() && (
          <div className="flex gap-4 items-center">
            <InterviewerAvatar interviewer={INTERVIEWERS[2]} size={40} />

            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div>
                <Typography.BodyBold className="text-yellow-700 dark:text-yellow-400">
                  No job details extracted
                </Typography.BodyBold>
                <Typography.CaptionMedium className="text-yellow-600/80 dark:text-yellow-400/70">
                  The pasted content didn't match typical job offer criteria.
                  You can still fill in the description and requirements
                  manually below.
                </Typography.CaptionMedium>
              </div>
            </div>
          </div>
        )}
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="space-y-6 px-0">
            <EditableExtractedTags
              config={config}
              filteredTechChoices={filteredTechChoices}
              techChoicesForPosition={techChoicesForCurrentPosition}
              isTechRequired={isTechRequired(config.position)}
              onUpdateConfig={updateConfig}
              onToggleTechnology={handleToggleTechnology}
            />
            <Separator className="my-5 bg-gray-500" />

            <TextArea
              label="Job Description"
              value={config.jobDescription}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateConfig("jobDescription", event.target.value)
              }
              placeholder="Describe the role, responsibilities, and mission…"
            />
            <Separator className="my-5 bg-gray-500" />
            <TextArea
              label="Job Requirements"
              value={config.jobRequirements || ""}
              placeholder="List here key requirements, bullet points, benefits…"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateConfig("jobRequirements", event.target.value)
              }
            />
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
            className="size-5 flex-shrink-0 rounded-sm text-primary"
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

      return <tech.icon className="size-5 text-primary flex-shrink-0" />;
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 max-w-fit">
          {filteredTechChoices.map((tech: TechChoice) => (
            <label
              key={tech.value}
              htmlFor={`tech-${tech.value}`}
              className="flex items-center gap-3 cursor-pointer rounded-md border border-border/60 bg-background/50 hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 px-4 py-2 transition-all"
            >
              <Checkbox
                id={`tech-${tech.value}`}
                type="button"
                checked={selected.has(tech.value)}
                className="size-5"
                onCheckedChange={(checked) => {
                  if (checked !== undefined) {
                    handleToggleTechnology(tech.value);
                  }
                }}
              />
              <Typography.BodyBold>{tech.label}</Typography.BodyBold>
              {renderTechIcon(tech)}
            </label>
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
            setConfig((prev) => ({
              ...prev,
              interviewMode: mode,
            }));
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 space-y-4 hidden lg:block">
              <div className="flex flex-col gap-2 lg:items-start lg:justify-between text-center lg:text-left">
                <Typography.BodyBold className="text-2xl">
                  {(() => {
                    const step = visibleSteps[currentStep];
                    if (step?.id === "description") {
                      if (
                        config.flowMode === "url" ||
                        config.flowMode === "paste"
                      )
                        return;
                    }
                    return step?.title ?? CONFIGURE_STEPS[0].title;
                  })()}
                </Typography.BodyBold>
                <Typography.Body className="text-muted-foreground text-sm sm:text-base">
                  {(() => {
                    const step = visibleSteps[currentStep];
                    if (step?.id === "description" || step?.id === "paste")
                      return;

                    return step?.description ?? CONFIGURE_STEPS[0].description;
                  })()}
                </Typography.Body>
              </div>
            </div>
            {usageStatus.checked &&
              !usageStatus.canStart &&
              !usageStatus.isPro &&
              currentStep === totalSteps - 1 && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900 p-2">
                      <InterviewerAvatar
                        interviewer={INTERVIEWERS[2]}
                        size={40}
                      />
                    </div>
                    <div className="flex-1">
                      <Typography.BodyBold className="text-amber-800 dark:text-amber-200">
                        Interview Limit Reached
                      </Typography.BodyBold>
                      <Typography.CaptionMedium className="text-amber-700 dark:text-amber-300 mt-1">
                        You&apos;ve reached the temporary interview limit.
                        {usageStatus.remainingMinutes > 0 && (
                          <span className="flex items-center gap-2 mt-4">
                            <Timer className="size-4" />
                            Please wait {usageStatus.remainingMinutes} minute
                            {usageStatus.remainingMinutes !== 1 ? "s" : ""}{" "}
                            before starting another session.
                          </span>
                        )}
                      </Typography.CaptionMedium>
                      <div className="mt-1 flex items-center gap-2">
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
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 ">
          <div className="max-w-5xl mx-auto flex items-center w-full">
            <div className="flex-1 flex justify-start">
              {currentStepId !== "flow" && renderPreviousButton()}
            </div>
            <div className="flex-1 flex justify-center">
              <PaginationIndicator total={totalSteps} current={currentStep} />
            </div>
            <div className="flex-1 flex justify-end">
              {currentStepId !== "flow" && renderNextButton()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
