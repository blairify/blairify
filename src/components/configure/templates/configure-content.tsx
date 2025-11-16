"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  canStartInterview,
  canGoNext as checkCanGoNext,
  isConfigComplete as checkIsConfigComplete,
} from "@/components/configure/utils/configure-helpers";
import type { InterviewConfig } from "@/components/configure/utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleStartInterview = () => {
    if (!canStartInterview(config)) return;

    const selectedCompanyMeta = CONFIGURE_SPECIFIC_COMPANIES.find(
      (company) => company.value === config.specificCompany,
    );

    const domainConfig: DomainInterviewConfig = {
      position: config.position || "Frontend Engineer",
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

  function renderPositionStep() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        {POSITIONS.map((position) => {
          const Icon = position.icon;
          return (
            <Card
              key={position.value}
              className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 ${
                config.position === position.value
                  ? "ring-2 ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  position: position.value,
                }))
              }
            >
              <CardContent className="flex flex-row items-center gap-2">
                <Icon className="size-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{position.label}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  function renderExperienceStep() {
    return (
      <div className="space-y-8">
        <div>
          <RadioGroup
            value={config.seniority}
            onValueChange={(value) =>
              setConfig((prev) => ({ ...prev, seniority: value }))
            }
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`size-4 rounded-full ${level.color} ring-2 ring-offset-2 ring-offset-background ${config.seniority === level.value ? "ring-primary" : "ring-transparent"}`}
                    />
                    <span className="font-bold text-base">{level.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {level.description}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    );
  }

  function renderCompanyStep() {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Company Type</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {COMPANY_PROFILES.map((profile) => {
              const Icon = profile.icon;
              return (
                <Card
                  key={profile.value}
                  className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 h-full ${
                    config.companyProfile === profile.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      companyProfile: profile.value,
                      specificCompany: "",
                    }))
                  }
                >
                  <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.label}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {profile.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3">Or Choose Specific Company</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CONFIGURE_SPECIFIC_COMPANIES.map((company) => {
              const isImageIcon = typeof company.icon === "string";
              const CompanyIcon = isImageIcon ? null : company.icon;

              return (
                <Card
                  key={company.value}
                  className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 hover:scale-105 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 h-full ${
                    config.specificCompany === company.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      specificCompany: company.value,
                      companyProfile: "",
                    }))
                  }
                >
                  <CardContent className="p-4 text-center h-full flex flex-col justify-center min-h-[120px]">
                    <div className="flex flex-col items-center justify-between gap-3 flex-1 ">
                      {isImageIcon ? (
                        <Image
                          width={48}
                          height={48}
                          src={company.icon as string}
                          alt={`${company.label} logo`}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        CompanyIcon && (
                          <CompanyIcon className={`h-8 w-8 ${company.color}`} />
                        )
                      )}
                      <div>
                        <h3 className="font-semibold text-sm">
                          {company.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {company.description}
                        </p>
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
                    : `cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 ${
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
                <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon
                      className={`h-6 w-6 mt-1 flex-shrink-0 ${isComingSoon ? "text-muted-foreground" : "text-primary"}`}
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${isComingSoon ? "text-muted-foreground" : ""}`}
                      >
                        {mode.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {mode.description}
                      </p>
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
        return renderCompanyStep();
      case 3:
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
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {CONFIGURE_STEPS[currentStep].title}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                {CONFIGURE_STEPS[currentStep].description}
              </p>
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
              <ArrowLeft className="h-4 w-4" />
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
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
