"use client";

import { ArrowRight, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  SiKotlin,
  SiKubernetes,
  SiPhp,
  SiPython,
  SiReact,
  SiRust,
  SiSwift,
  SiTerraform,
  SiTypescript,
} from "react-icons/si";
import { TiFlowChildren } from "react-icons/ti";
import { toast } from "sonner";
import { PaginationIndicator } from "@/components/common/atoms/pagination-indicator";
import { Typography } from "@/components/common/atoms/typography";
import { EditableExtractedTags } from "@/components/configure/molecules/editable-extracted-tags";
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
  INTERVIEW_MODES,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import useIsMobile from "@/hooks/use-is-mobile";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig as DomainInterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";
import { parseSimpleMarkdown } from "@/lib/utils/markdown-parser";
import type { CompanyProfileValue, PositionValue } from "@/types/global";

function getTechChoices(position: string): TechChoice[] {
  switch (position) {
    case "frontend":
      return [
        { value: "react", label: "React", icon: SiReact },
        { value: "typescript", label: "TypeScript", icon: SiTypescript },
        { value: "javascript", label: "JavaScript", icon: SiJavascript },
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
        { value: "swift", label: "Swift", icon: SiSwift },
        { value: "kotlin", label: "Kotlin", icon: SiKotlin },
      ];
    case "data-engineer":
      return [
        { value: "python", label: "Python", icon: SiPython },
        { value: "java", label: "Java", icon: FaJava },
        { value: "go", label: "Go", icon: SiGo },
      ];
    case "data-scientist":
      return [{ value: "python", label: "Python", icon: SiPython }];
    case "cybersecurity":
      return [{ value: "security", label: "Security", icon: Shield }];
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
const HUMANIZED_FIELDS: Record<string, string> = {
  summary: "Refined job brief",
  requirements: "Key requirements",
};

type ValidationIssue = {
  message?: string;
  code?: string;
  path?: string[];
  minimum?: number;
};

function formatAnalysisError(error: unknown): string {
  if (!error) return "Failed to analyze description.";
  if (typeof error === "string") return error;
  if (Array.isArray(error) && error.length > 0) {
    const first = error[0] as ValidationIssue | undefined;
    const fieldKey = first?.path?.[0];
    const friendlyField = fieldKey ? HUMANIZED_FIELDS[fieldKey] : undefined;
    if (friendlyField && typeof first?.minimum === "number") {
      return `${friendlyField} must be at least ${first.minimum} characters.`;
    }
    if (first?.message) return first.message;
    if (first?.code) return `Validation error: ${first.code}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) return maybeMessage;
  }
  return "Failed to analyze description.";
}

export function ConfigureContent() {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<InterviewConfig>({
    flowMode: "custom",
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
  });
  const [isAnalyzingDescription, setIsAnalyzingDescription] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<MarkdownField>(null);

  const visibleSteps = useMemo(() => {
    if (config.flowMode === "paste") {
      return CONFIGURE_STEPS.filter((step) => PASTE_FLOW_STEP_IDS.has(step.id));
    }
    return CONFIGURE_STEPS.filter((step) => !PASTE_ONLY_STEP_IDS.has(step.id));
  }, [config.flowMode]);

  useEffect(() => {
    if (currentStep >= visibleSteps.length) {
      setCurrentStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [currentStep, visibleSteps]);

  const currentStepId = visibleSteps[currentStep]?.id ?? "flow";

  const techChoicesForCurrentPosition = useMemo(
    () => getTechChoices(config.position),
    [config.position],
  );

  const autoAdvanceTechChoices = useMemo(() => {
    if (currentStepId !== "technologies") return null;
    if (!isTechRequired(config.position)) return null;
    const filtered = techChoicesForCurrentPosition.filter((tech) =>
      BANK_TECH_VALUES.has(tech.value),
    );
    return filtered.length === 1 ? filtered : null;
  }, [config.position, currentStepId, techChoicesForCurrentPosition]);

  const updateConfig = useCallback(
    <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
      setConfig((prev) => ({
        ...prev,
        [key]: value,
      }));
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

  const filteredTechChoices = useMemo(() => {
    if (!isTechRequired(config.position)) return [];
    return techChoicesForCurrentPosition.filter((tech) =>
      BANK_TECH_VALUES.has(tech.value),
    );
  }, [config.position, techChoicesForCurrentPosition]);

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

  const handleStartInterview = () => {
    if (!canStartInterview(config)) return;

    const domainConfig: DomainInterviewConfig = {
      position: (config.position || "frontend") as PositionValue,
      seniority: (config.seniority || "mid") as SeniorityLevel,
      technologies: config.technologies || [],
      companyProfile: (config.companyProfile ||
        "generic") as CompanyProfileValue,
      company: config.company || undefined,
      interviewMode: (config.interviewMode || "regular") as InterviewMode,
      interviewType: (config.interviewType || "technical") as InterviewType,
      duration: config.duration || "30",
      isDemoMode: false,
      contextType: config.contextType || undefined,
      jobId: config.jobId || undefined,
      jobDescription: config.jobDescription || undefined,
      jobRequirements: config.jobRequirements || undefined,
      jobLocation: config.jobLocation || undefined,
      jobType: config.jobType || undefined,
    };

    const urlParams = buildSearchParamsFromInterviewConfig(domainConfig);
    router.push(`/interview?${urlParams.toString()}`);
  };

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

  const renderPrimaryAction = () => {
    const shouldHidePrimaryAction =
      currentStepId === "technologies" &&
      !!autoAdvanceTechChoices &&
      autoAdvanceTechChoices.length === 1;

    if (shouldHidePrimaryAction) {
      return null;
    }

    if (currentStep === totalSteps - 1) {
      return (
        <Button
          onClick={handleStartInterview}
          disabled={!isConfigComplete}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 "
        >
          <span className="inline">Start Interview</span>
          <ArrowRight className="size-4 sm:size-5" />
        </Button>
      );
    }

    if (isAnalysisStep && config.flowMode === "paste") {
      return (
        <Button
          onClick={handleStartInterview}
          disabled={!isConfigComplete}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <span className="inline">Start Interview</span>
          <ArrowRight className="size-4 sm:size-5" />
        </Button>
      );
    }

    if (isDescriptionStep && config.flowMode === "paste") {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={
              isAnalyzingDescription || !config.pastedDescription.trim()
            }
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
        </div>
      );
    }

    return (
      <Button
        onClick={handleNext}
        disabled={!canGoNext()}
        size="sm"
        className="flex items-center gap-2"
      >
        Next
      </Button>
    );
  };

  const handleFlowSelect = (mode: ConfigureFlowMode) => {
    setConfig((prev) => ({
      ...prev,
      flowMode: mode,
      pastedDescription: mode === "custom" ? "" : prev.pastedDescription,
    }));
    setAnalysisError(null);
  };

  const handleAnalyzeDescription = async () => {
    const trimmedDescription = config.pastedDescription.trim();
    if (!trimmedDescription) {
      toast.error("Paste a job description first.");
      return;
    }
    if (trimmedDescription.length < 50) {
      toast.error(
        "Please provide a job description with at least 50 characters.",
      );
      return;
    }
    setIsAnalyzingDescription(true);
    setAnalysisError(null);
    try {
      const response = await fetch("/api/job-description/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: config.pastedDescription }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(formatAnalysisError(payload?.error));
      }

      const {
        summary,
        position,
        seniority,
        technologies,
        company,
        requirements,
        companyProfile,
      } = payload.data;

      setConfig((prev) => ({
        ...prev,
        flowMode: "paste",
        jobDescription: summary ?? prev.jobDescription,
        jobRequirements: requirements ?? prev.jobRequirements,
        position: position ?? prev.position,
        seniority: seniority ?? prev.seniority,
        technologies: technologies ?? prev.technologies,
        company: company ?? prev.company,
        companyProfile: companyProfile ?? prev.companyProfile,
        contextType: "job-specific",
      }));
      const analysisIndex = visibleSteps.findIndex(
        (step) => step.id === ANALYSIS_STEP_ID,
      );
      setCurrentStep(analysisIndex >= 0 ? analysisIndex : currentStep);
      toast.success("Job description analyzed");
    } catch (error) {
      const message = formatAnalysisError(error);
      setAnalysisError(message);
      toast.error(message);
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
        description: "Manually configure position, tech stack, and company.",
        icon: TiFlowChildren,
      },
      {
        value: "paste",
        title: "Paste description",
        description:
          "Paste a job post and let AI extract role, seniority, tech, and company.",
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
          <div className="flex gap-4">
            {FLOW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = config.flowMode === option.value;
              return (
                <Card
                  key={option.value}
                  className={`cursor-pointer w-60 transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                    isSelected
                      ? "ring-1 ring-primary border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleFlowSelect(option.value)}
                >
                  <CardContent className="flex flex-col items-start gap-4">
                    <Icon className="size-5 text-primary flex-shrink-0" />
                    <div>
                      <Typography.BodyBold>{option.title}</Typography.BodyBold>
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
            <Typography.CaptionMedium className="text-muted-foreground">
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
            <div className="relative flex items-start gap-3 rounded-4xl border border-border/60 bg-card/95 px-5 py-3.5 shadow-2xl backdrop-blur">
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
                rows={3}
                className="max-h-[50vh] flex-1 resize-none border-none shadow-none !bg-transparent pr-28 text-base focus-visible:ring-0"
                autoFocus
              />
              <Button
                onClick={handleAnalyzeDescription}
                size="sm"
                disabled={
                  isAnalyzingDescription || !config.pastedDescription.trim()
                }
                className="flex items-center gap-2 mt-2"
              >
                {isAnalyzingDescription && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Analyze
              </Button>
            </div>
          </form>
        </div>

        {analysisError && (
          <Typography.CaptionMedium className="text-destructive">
            {analysisError}
          </Typography.CaptionMedium>
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
            <CardContent className="flex flex-col items-left gap-1">
              <div className="flex items-center gap-3 mb-3">
                <Typography.BodyBold>{level.label}</Typography.BodyBold>
              </div>
              <Typography.CaptionMedium>
                {level.description}
              </Typography.CaptionMedium>
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
          <Typography.CaptionMedium className="text-muted-foreground">
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

      return <tech.icon className="size-6 text-primary mr-2 flex-shrink-0" />;
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 max-w-fit">
          {filteredTechChoices.map((tech) => (
            <Card
              key={tech.value}
              className={`cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                selected.has(tech.value)
                  ? "ring-1 border-primary ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() => handleToggleTechnology(tech.value)}
            >
              <CardContent className="flex flex-row items-center gap-2">
                {renderTechIcon(tech)}
                <div className="flex-1">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-fit ">
          {INTERVIEW_MODES.map((mode) => {
            const isComingSoon = mode.description.includes("Coming soon");
            return (
              <Card
                key={mode.value}
                className={`transition-all  ${
                  isComingSoon
                    ? "opacity-60 cursor-not-allowed"
                    : `cursor-pointer hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                        config.interviewMode === mode.value
                          ? "ring-1 border-primary ring-primary bg-primary/10"
                          : "border-border"
                      }`
                }`}
                onClick={() => {
                  if (!isComingSoon) {
                    setConfig((prev) => ({
                      ...prev,
                      interviewMode: mode.value,
                    }));
                  }
                }}
              >
                <CardContent className="px-4 h-full flex flex-col ">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-1">
                      <Typography.BodyBold
                        className={`${isComingSoon ? "text-muted-foreground" : ""}`}
                      >
                        {mode.label}
                      </Typography.BodyBold>
                      <Typography.CaptionMedium className="mt-2">
                        {mode.description}
                      </Typography.CaptionMedium>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 lg:items-start lg:justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Typography.Heading1>
                      {visibleSteps[currentStep]?.title ??
                        CONFIGURE_STEPS[0].title}
                    </Typography.Heading1>
                  </div>
                  <Typography.Body className="text-muted-foreground text-sm sm:text-base">
                    {visibleSteps[currentStep]?.description ??
                      CONFIGURE_STEPS[0].description}
                  </Typography.Body>
                </div>
                <div className="flex flex-row items-stretch  gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    size="sm"
                    className="flex items-center gap-2 "
                  >
                    <span className="inline">Previous</span>
                  </Button>
                  {renderPrimaryAction()}
                </div>
              </div>
            </div>

            <div
              key={currentStepId}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              {renderStepContent(currentStepId)}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6">
          <div className="max-w-5xl mx-auto flex justify-center">
            <PaginationIndicator total={totalSteps} current={currentStep} />
          </div>
        </div>
      </div>
    </main>
  );
}
