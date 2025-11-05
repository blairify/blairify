"use client";

import { ArrowLeft, ArrowRight, CheckCircle, Code } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  COMPANY_PROFILES,
  CONFIGURE_SPECIFIC_COMPANIES,
  CONFIGURE_STEPS,
  INTERVIEW_MODES,
  POSITIONS,
  SENIORITY_LEVELS,
  TECHNOLOGY_GROUPS,
} from "@/constants/configure";
import type { UserData } from "@/lib/services/auth/auth";

interface ConfigureContentProps {
  user: UserData;
}

interface InterviewConfig {
  position: string;
  seniority: string;
  technologies: string[];
  companyProfile: string;
  specificCompany: string;
  interviewMode: string;
  interviewType: string;
  duration: string;
}

// Use imported constants

export function ConfigureContent({ user: _ }: ConfigureContentProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdvancedSkills, setShowAdvancedSkills] = useState(false);
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

  // Use imported constants

  // All constants now imported from @/constants/configure

  const handleStartInterview = () => {
    if (
      config.position &&
      config.seniority &&
      (!showAdvancedSkills || config.technologies.length > 0) &&
      (config.companyProfile || config.specificCompany) &&
      config.interviewMode &&
      config.interviewType
    ) {
      const urlParams = new URLSearchParams();
      Object.entries(config).forEach(([key, value]) => {
        if (value) {
          if (key === "technologies" && Array.isArray(value)) {
            urlParams.append(key, JSON.stringify(value));
          } else {
            urlParams.append(key, value as string);
          }
        }
      });
      router.push(`/interview?${urlParams.toString()}`);
    }
  };

  const isConfigComplete =
    config.position &&
    config.seniority &&
    (!showAdvancedSkills || config.technologies.length > 0) &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode;

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return config.position !== "";
      case 1:
        return (
          config.seniority !== "" &&
          (!showAdvancedSkills || config.technologies.length > 0)
        );
      case 2:
        return config.companyProfile !== "" || config.specificCompany !== "";
      case 3:
        return config.interviewMode !== "";
      default:
        return false;
    }
  };

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
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">
              Select Your Experience Level
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose the level that best matches your professional experience
            </p>
          </div>
          <RadioGroup
            value={config.seniority}
            onValueChange={(value) =>
              setConfig((prev) => ({ ...prev, seniority: value }))
            }
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                  className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all h-full min-h-[130px] shadow-sm hover:shadow-md ${
                    config.seniority === level.value
                      ? "border-primary bg-primary/5 shadow-md scale-105"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-4 h-4 rounded-full ${level.color} ring-2 ring-offset-2 ring-offset-background ${config.seniority === level.value ? "ring-primary" : "ring-transparent"}`}
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

        <Separator className="my-8" />

        {/* Advanced Skills Toggle */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Advanced Skills Selection
            </h3>
            <p className="text-sm text-muted-foreground">
              Specify your tech stack for more targeted interview questions
            </p>
          </div>
          <Switch
            checked={showAdvancedSkills}
            onCheckedChange={setShowAdvancedSkills}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Technologies & Skills Selection - Only show when toggle is on */}
        {showAdvancedSkills && (
          <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="max-h-96 overflow-y-auto space-y-6 pr-2">
                {Object.entries(TECHNOLOGY_GROUPS).map(
                  ([groupName, groupTechs]) => (
                    <div key={groupName} className="space-y-4">
                      <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm py-3 border-b border-border/50">
                        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary rounded-full" />
                          {groupName}
                          <Badge
                            variant="secondary"
                            className="text-xs px-2.5 py-0.5 font-semibold"
                          >
                            {
                              groupTechs.filter((tech) =>
                                config.technologies.includes(tech),
                              ).length
                            }
                            /{groupTechs.length}
                          </Badge>
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              const newTechs = groupTechs.filter(
                                (tech) => !config.technologies.includes(tech),
                              );
                              setConfig((prev) => ({
                                ...prev,
                                technologies: [
                                  ...prev.technologies,
                                  ...newTechs,
                                ],
                              }));
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                technologies: prev.technologies.filter(
                                  (tech) => !groupTechs.includes(tech),
                                ),
                              }));
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {groupTechs.map((tech) => (
                          <Button
                            key={tech}
                            variant={
                              config.technologies.includes(tech)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={`h-10 text-xs font-medium justify-center transition-all ${
                              config.technologies.includes(tech)
                                ? "shadow-sm"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                technologies: prev.technologies.includes(tech)
                                  ? prev.technologies.filter((t) => t !== tech)
                                  : [...prev.technologies, tech],
                              }));
                            }}
                          >
                            {tech}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {config.technologies.length > 0 && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <p className="text-base font-bold text-foreground">
                      Selected Technologies
                    </p>
                    <Badge variant="default" className="font-bold">
                      {config.technologies.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, technologies: [] }))
                    }
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs px-3 py-1.5 font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                    >
                      {tech}
                      <button
                        className="hover:text-destructive transition-colors"
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            technologies: prev.technologies.filter(
                              (t) => t !== tech,
                            ),
                          }));
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
        {/* Progress Indicator - Sticky Header */}
        {/* <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {CONFIGURE_STEPS.map((step, index) => {
              const StepIcon = step.icon as React.ComponentType<{
                className?: string;
              }>;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      // Allow navigation to completed steps
                      if (isCompleted) {
                        setCurrentStep(index);
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : isCompleted
                          ? "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
                      {step.title}
                    </span>
                  </button>
                  {index < CONFIGURE_STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 sm:mx-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Main Configuration Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            {/* Step Title */}
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

        {/* Navigation Controls - Sticky Footer */}
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
