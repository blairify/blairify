"use client";

import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SiAmazon,
  SiCss3,
  SiDocker,
  SiGo,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiPhp,
  SiPython,
  SiReact,
  SiRust,
  SiSharp,
  SiTerraform,
  SiTypescript,
} from "react-icons/si";
import { toast } from "sonner";
import { Typography } from "@/components/common/atoms/typography";
import {
  canStartInterview,
  canGoNext as checkCanGoNext,
  isConfigComplete as checkIsConfigComplete,
} from "@/components/configure/utils/configure-helpers";
import type { InterviewConfig } from "@/components/configure/utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  COMPANY_PROFILES,
  CONFIGURE_SPECIFIC_COMPANIES,
  CONFIGURE_STEPS,
  INTERVIEW_MODES,
  POSITIONS,
  SENIORITY_LEVELS,
} from "@/constants/configure";
import {
  buildSearchParamsFromInterviewConfig,
  type InterviewConfig as DomainInterviewConfig,
  type InterviewMode,
  type InterviewType,
  type SeniorityLevel,
} from "@/lib/interview";

export function ConfigureContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<InterviewConfig>({
    position: "",
    seniority: "",
    technologies: [],
    companyProfile: "",
    specificCompany: "",
    interviewMode: "",
    interviewType: "technical",
    duration: "30",
  });

  const [jobListingUrl, setJobListingUrl] = useState("");
  const [isImportingJob, setIsImportingJob] = useState(false);

  const allowedPositionValues = new Set(POSITIONS.map((p) => p.value));
  const allowedSeniorityValues = new Set(SENIORITY_LEVELS.map((s) => s.value));
  const allowedCompanyProfiles = new Set(COMPANY_PROFILES.map((p) => p.value));

  const isTechRequired = (position: string) => position !== "product";

  const getFirstIncompleteStep = (next: InterviewConfig) => {
    if (!next.position) return 0;
    if (!next.seniority) return 1;
    if (isTechRequired(next.position) && next.technologies.length === 0)
      return 2;
    if (!next.companyProfile && !next.specificCompany) return 3;
    return 4;
  };

  const importFromJobListingUrl = async () => {
    const url = jobListingUrl.trim();
    if (!url) {
      toast.error("Job listing URL required");
      return;
    }

    setIsImportingJob(true);

    try {
      const params = new URLSearchParams({ url });
      const res = await fetch(`/api/job-listing/import?${params.toString()}`);
      const data = (await res.json()) as
        | {
            success: true;
            data?: {
              position?: string;
              seniority?: string;
              technologies: string[];
              company?: string;
              companyProfile?: string;
              title?: string;
            };
          }
        | { success: false; error?: string };

      if (!res.ok || !data.success) {
        toast.error("Failed to import", {
          description:
            "error" in data && data.error ? data.error : "Please try again.",
        });
        return;
      }

      const imported = data.data;
      if (!imported) {
        toast.error("Import failed", { description: "Empty response." });
        return;
      }

      const mergedTechnologies = [
        ...new Set([...config.technologies, ...(imported.technologies ?? [])]),
      ];

      const position =
        imported.position && allowedPositionValues.has(imported.position)
          ? imported.position
          : config.position;

      const seniority =
        imported.seniority && allowedSeniorityValues.has(imported.seniority)
          ? imported.seniority
          : config.seniority;

      const companyProfile =
        imported.companyProfile &&
        allowedCompanyProfiles.has(imported.companyProfile)
          ? imported.companyProfile
          : config.companyProfile;

      const normalizedImportedCompany = imported.company
        ? imported.company.trim().toLowerCase()
        : "";

      const specificCompany = normalizedImportedCompany
        ? (CONFIGURE_SPECIFIC_COMPANIES.find((c) => {
            const normalizedLabel = c.label.trim().toLowerCase();
            if (normalizedLabel === normalizedImportedCompany) return true;
            return normalizedImportedCompany.includes(normalizedLabel);
          })?.value ?? config.specificCompany)
        : config.specificCompany;

      const finalCompanyProfile = specificCompany
        ? "faang"
        : companyProfile || "generic";

      const nextConfig: InterviewConfig = {
        ...config,
        position,
        seniority,
        companyProfile: finalCompanyProfile,
        specificCompany,
        technologies: mergedTechnologies,
      };

      setConfig(nextConfig);
      setCurrentStep(getFirstIncompleteStep(nextConfig));

      if (imported.title) {
        toast.success("Imported from job listing", {
          description: imported.title,
        });
      } else {
        toast.success("Imported from job listing");
      }
    } catch (error) {
      console.error("Failed to import job listing:", error);
      toast.error("Failed to import", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsImportingJob(false);
    }
  };

  const handleStartInterview = () => {
    if (!canStartInterview(config)) return;

    const selectedCompanyMeta = CONFIGURE_SPECIFIC_COMPANIES.find(
      (company) => company.value === config.specificCompany,
    );

    const domainConfig: DomainInterviewConfig = {
      position: config.position || "frontend",
      seniority: (config.seniority || "mid") as SeniorityLevel,
      technologies: config.technologies || [],
      companyProfile: config.companyProfile || "",
      specificCompany: config.specificCompany || undefined,
      company: selectedCompanyMeta?.label || undefined,
      interviewMode: (config.interviewMode || "regular") as InterviewMode,
      interviewType: (config.interviewType || "technical") as InterviewType,
      duration: config.duration || "30",
      isDemoMode: false,
      // No job-specific context in configure flow
      contextType: undefined,
      jobId: undefined,
      jobDescription: undefined,
      jobRequirements: undefined,
      jobLocation: undefined,
      jobType: undefined,
    };

    const urlParams = buildSearchParamsFromInterviewConfig(domainConfig);
    router.push(`/interview?${urlParams.toString()}`);
  };

  const isConfigComplete = checkIsConfigComplete(config);

  const canGoNext = () => checkCanGoNext(currentStep, config);

  const handleNext = () => {
    if (canGoNext() && currentStep < CONFIGURE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = <K extends keyof InterviewConfig>(
    key: K,
    value: InterviewConfig[K],
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  function renderPositionStep() {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="job-listing-url">Job listing URL (optional)</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="job-listing-url"
              placeholder="Paste a job URL (LinkedIn, Greenhouse, Lever, etc.)"
              value={jobListingUrl}
              onChange={(e) => setJobListingUrl(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="url"
              disabled={isImportingJob}
            />
            <Button
              type="button"
              variant="outline"
              onClick={importFromJobListingUrl}
              disabled={isImportingJob || !jobListingUrl.trim()}
              className="shrink-0"
            >
              {isImportingJob ? "Importing..." : "Import"}
            </Button>
          </div>
          {config.technologies.length > 0 && (
            <Typography.CaptionMedium className="text-muted-foreground">
              Imported tech: {config.technologies.slice(0, 8).join(", ")}
              {config.technologies.length > 8 ? "..." : ""}
            </Typography.CaptionMedium>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          {POSITIONS.map((position) => {
            const Icon = position.icon;
            return (
              <Card
                key={position.value}
                className={`cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                  config.position === position.value
                    ? "ring-2 ring-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() => updateConfig("position", position.value)}
              >
                <CardContent className="flex flex-row items-center gap-2">
                  <Icon className="size-6 text-primary flex-shrink-0" />
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
      <div className="space-y-8">
        <div>
          <RadioGroup
            value={config.seniority}
            onValueChange={(value) => updateConfig("seniority", value)}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
            {SENIORITY_LEVELS.map((level) => (
              <div key={level.value} className="h-full">
                <RadioGroupItem
                  value={level.value}
                  id={level.value}
                  className="sr-only"
                />
                <Label
                  htmlFor={level.value}
                  className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all h-full min-h-[130px] justify-center shadow-sm hover:shadow-md ${
                    config.seniority === level.value
                      ? "border-primary bg-primary/5 shadow-md scale-105"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`size-4 rounded-full ${level.color}`} />
                    <Typography.BodyBold>{level.label}</Typography.BodyBold>
                  </div>
                  <Typography.CaptionMedium>
                    {level.description}
                  </Typography.CaptionMedium>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
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

    const techChoices = (() => {
      switch (config.position) {
        case "frontend":
          return [
            { value: "react", label: "React", icon: SiReact },
            { value: "typescript", label: "TypeScript", icon: SiTypescript },
            { value: "javascript", label: "JavaScript", icon: SiJavascript },
            { value: "html", label: "HTML", icon: SiHtml5 },
            { value: "css", label: "CSS", icon: SiCss3 },
          ] as const;
        case "backend":
          return [
            { value: "java", label: "Java", icon: SiAmazon },
            { value: "python", label: "Python", icon: SiPython },
            { value: "go", label: "Go", icon: SiGo },
            { value: "csharp", label: "C#", icon: SiSharp },
            { value: "typescript", label: "TypeScript", icon: SiTypescript },
            { value: "javascript", label: "JavaScript", icon: SiJavascript },
            { value: "rust", label: "Rust", icon: SiRust },
            { value: "php", label: "PHP", icon: SiPhp },
          ] as const;
        case "fullstack":
          return [
            { value: "react", label: "React", icon: SiReact },
            { value: "typescript", label: "TypeScript", icon: SiTypescript },
            { value: "javascript", label: "JavaScript", icon: SiJavascript },
            { value: "html", label: "HTML", icon: SiHtml5 },
            { value: "css", label: "CSS", icon: SiCss3 },
            { value: "java", label: "Java", icon: SiAmazon },
            { value: "python", label: "Python", icon: SiPython },
            { value: "go", label: "Go", icon: SiGo },
            { value: "csharp", label: "C#", icon: SiSharp },
            { value: "rust", label: "Rust", icon: SiRust },
            { value: "php", label: "PHP", icon: SiPhp },
          ] as const;
        case "devops":
          return [
            { value: "docker", label: "Docker", icon: SiDocker },
            { value: "kubernetes", label: "Kubernetes", icon: SiKubernetes },
            { value: "terraform", label: "Terraform", icon: SiTerraform },
            { value: "aws", label: "AWS", icon: SiAmazon },
            { value: "gcp", label: "GCP", icon: SiGooglecloud },
            { value: "azure", label: "Azure", icon: SiGooglecloud },
          ] as const;
        case "mobile":
          return [
            { value: "swift", label: "Swift", icon: SiReact },
            { value: "kotlin", label: "Kotlin", icon: SiTypescript },
          ] as const;
        case "data-engineer":
          return [
            { value: "python", label: "Python", icon: SiPython },
            { value: "sql", label: "SQL", icon: SiTypescript },
            { value: "java", label: "Java", icon: SiAmazon },
            { value: "go", label: "Go", icon: SiGo },
          ] as const;
        case "data-scientist":
          return [
            { value: "python", label: "Python", icon: SiPython },
          ] as const;
        case "cybersecurity":
          return [
            { value: "security", label: "Security", icon: Shield },
          ] as const;
        default: {
          const _never: never = config.position as never;
          throw new Error(`Unhandled position in tech choices: ${_never}`);
        }
      }
    })();

    const selected = new Set(config.technologies);
    const toggleTechnology = (tech: string) => {
      if (selected.has(tech)) {
        updateConfig(
          "technologies",
          config.technologies.filter((t) => t !== tech),
        );
        return;
      }

      updateConfig("technologies", [...selected, tech]);
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          {techChoices.map((tech) => (
            <Card
              key={tech.value}
              className={`cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                selected.has(tech.value)
                  ? "ring-2 ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() => toggleTechnology(tech.value)}
            >
              <CardContent className="flex flex-row items-center gap-2">
                <tech.icon className="size-6 text-primary flex-shrink-0" />
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

  function renderCompanyStep() {
    return (
      <div className="space-y-6">
        <div>
          <Typography.BodyBold className="font-semibold my-10">
            Company Type
          </Typography.BodyBold>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {COMPANY_PROFILES.map((profile) => {
              const Icon = profile.icon;
              return (
                <Card
                  key={profile.value}
                  className={`cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                    config.companyProfile === profile.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() => updateConfig("companyProfile", profile.value)}
                >
                  <CardContent className="p-4 h-full flex flex-col ">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="size-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <Typography.BodyBold>
                          {profile.label}
                        </Typography.BodyBold>
                        <Typography.CaptionMedium>
                          {profile.description}
                        </Typography.CaptionMedium>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="my-10" />

        <div>
          <Typography.BodyBold className="mb-10">
            Or Choose Specific Company
          </Typography.BodyBold>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CONFIGURE_SPECIFIC_COMPANIES.map((company) => {
              const isImageIcon = typeof company.icon === "string";
              const CompanyIcon = isImageIcon ? null : company.icon;

              return (
                <Card
                  key={company.value}
                  className={`cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 hover:scale-105 dark:hover:bg-primary/10 dark:hover:border-primary/40 h-full ${
                    config.specificCompany === company.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() => {
                    updateConfig("specificCompany", company.value);
                    updateConfig("companyProfile", "faang");
                  }}
                >
                  <CardContent className="p-4 text-center h-full flex flex-col justify-center min-h-[100px]">
                    <div className="flex flex-col items-center justify-between gap-3 flex-1 ">
                      {isImageIcon ? (
                        <Image
                          width={48}
                          height={48}
                          src={company.icon as string}
                          alt={`${company.label} logo`}
                          className="size-12 object-contain"
                        />
                      ) : (
                        CompanyIcon && (
                          <CompanyIcon className={`size-9 ${company.color}`} />
                        )
                      )}
                      <div>
                        <Typography.BodyBold className="font-semibold text-sm">
                          {company.label}
                        </Typography.BodyBold>
                      </div>
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

  function renderModeStep() {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {INTERVIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            const isComingSoon = mode.description.includes("Coming soon");
            return (
              <Card
                key={mode.value}
                className={`transition-all h-full ${
                  isComingSoon
                    ? "opacity-60 cursor-not-allowed"
                    : `cursor-pointer hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40 ${
                        config.interviewMode === mode.value
                          ? "ring-2 ring-primary bg-primary/10"
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
                <CardContent className="p-4 h-full flex flex-col ">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon
                      className={`size-6 mt-1 flex-shrink-0 ${isComingSoon ? "text-muted-foreground" : "text-primary"}`}
                    />
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

  function renderStepContent() {
    switch (currentStep) {
      case 0:
        return renderPositionStep();
      case 1:
        return renderExperienceStep();
      case 2:
        return renderTechnologiesStep();
      case 3:
        return renderCompanyStep();
      case 4:
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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const StepIcon = CONFIGURE_STEPS[currentStep]
                    .icon as React.ComponentType<{ className?: string }>;
                  return <StepIcon className="h-6 w-6 text-primary" />;
                })()}
                <Typography.Body className="text-2xl sm:text-3xl font-bold text-foreground">
                  {CONFIGURE_STEPS[currentStep].title}
                </Typography.Body>
              </div>
              <Typography.Body className="text-muted-foreground text-sm sm:text-base">
                {CONFIGURE_STEPS[currentStep].description}
              </Typography.Body>
            </div>

            {/* Step Content */}
            <div
              key={currentStep}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              {renderStepContent()}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t border-border/50 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentStep + 1} / {CONFIGURE_STEPS.length}
              </span>
            </div>

            {currentStep === CONFIGURE_STEPS.length - 1 ? (
              <Button
                onClick={handleStartInterview}
                disabled={!isConfigComplete}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-8 text-sm sm:text-base font-semibold"
              >
                <span className="hidden sm:inline">Start Interview</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="size-4 sm:size-5" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
