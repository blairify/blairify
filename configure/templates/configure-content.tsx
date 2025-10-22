"use client";

import {
  ArrowLeft,
  ArrowRight,
  Book,
  Building,
  ChevronRight,
  Cloud,
  Code,
  Database,
  Server,
  Smartphone,
  Target,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CgSmartphoneChip } from "react-icons/cg";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { SiAmazon, SiApple, SiMeta, SiNetflix } from "react-icons/si";
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

interface ConfigStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: ConfigStep[] = [
  {
    id: "position",
    title: "Position",
    description: "Select your target role",
    icon: Code,
  },
  {
    id: "experience",
    title: "Skills",
    description: "Choose your level and tech stack",
    icon: Target,
  },
  {
    id: "company",
    title: "Company",
    description: "Pick your target",
    icon: Building,
  },
  {
    id: "mode",
    title: "Mode",
    description: "Configure preferences",
    icon: Timer,
  },
];

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
    interviewType: "technical", // Default to technical interview
    duration: "30",
  });

  const positions = [
    {
      value: "frontend",
      label: "Frontend Engineer",
      icon: Code,
      description: "React, Vue, Angular, JavaScript",
    },
    {
      value: "backend",
      label: "Backend Engineer",
      icon: Server,
      description: "APIs, Databases, System Design",
    },
    {
      value: "fullstack",
      label: "Full Stack Engineer",
      icon: CgSmartphoneChip,
      description: "Frontend + Backend Development",
    },
    {
      value: "devops",
      label: "DevOps Engineer",
      icon: Cloud,
      description: "CI/CD, Infrastructure, Monitoring",
    },
    {
      value: "mobile",
      label: "Mobile Developer",
      icon: Smartphone,
      description: "iOS, Android, React Native",
    },
    {
      value: "data",
      label: "Data Engineer",
      icon: Database,
      description: "ETL, Analytics, Big Data",
    },
  ];

  const seniorityLevels = [
    {
      value: "junior",
      label: "Junior",
      description: "0-2 years experience",
      color: "bg-chart-2",
    },
    {
      value: "mid",
      label: "Mid-level",
      description: "2-5 years experience",
      color: "bg-chart-3",
    },
    {
      value: "senior",
      label: "Senior",
      description: "5+ years experience",
      color: "bg-chart-4",
    },
  ];

  const companyProfiles = [
    {
      value: "generic",
      label: "Generic Tech Company",
      description: "Standard technical questions",
      icon: Building,
    },
    {
      value: "faang",
      label: "FAANG-style",
      description: "Algorithm-heavy, system design focus",
      icon: Target,
    },
    {
      value: "startup",
      label: "Startup Environment",
      description: "Practical, fast-paced questions",
      icon: Zap,
    },
  ];

  const specificCompanies = [
    {
      value: "google",
      label: "Google",
      description: "Algorithm focus, system design",
      icon: FaGoogle,
      color: "text-blue-500",
    },
    {
      value: "meta",
      label: "Meta",
      description: "Product thinking, scalability",
      icon: SiMeta,
      color: "text-blue-600",
    },
    {
      value: "apple",
      label: "Apple",
      description: "Design patterns, performance",
      icon: SiApple,
      color: "text-muted-foreground",
    },
    {
      value: "amazon",
      label: "Amazon",
      description: "Leadership principles, scale",
      icon: SiAmazon,
      color: "text-orange-500",
    },
    {
      value: "netflix",
      label: "Netflix",
      description: "High performance, culture fit",
      icon: SiNetflix,
      color: "text-red-600",
    },
    {
      value: "microsoft",
      label: "Microsoft",
      description: "Collaboration, technical depth",
      icon: FaMicrosoft,
      color: "text-blue-500",
    },
  ];

  const interviewModes = [
    {
      value: "timed",
      label: "Timed Interview",
      description: "Realistic time pressure",
      icon: Timer,
    },
    {
      value: "untimed",
      label: "Practice Mode",
      description: "Take your time to think",
      icon: Book,
    },
  ];

  const technologyGroups = {
    "Programming Languages": [
      "javascript",
      "typescript",
      "python",
      "java",
      "csharp",
      "go",
      "rust",
      "php",
      "ruby",
      "kotlin",
      "scala",
      "swift",
      "dart",
      "c",
      "cpp",
    ],
    "Frontend Frameworks": [
      "react",
      "vue",
      "angular",
      "svelte",
      "next",
      "nuxt",
      "remix",
      "gatsby",
      "astro",
      "preact",
      "solid",
      "qwik",
    ],
    "Backend Frameworks": [
      "nodejs",
      "express",
      "nestjs",
      "fastify",
      "django",
      "flask",
      "fastapi",
      "spring-boot",
      "dotnet",
      "rails",
      "laravel",
      "gin",
      "actix",
    ],
    "Mobile Development": [
      "react-native",
      "flutter",
      "swift",
      "kotlin",
      "ionic",
      "xamarin",
      "cordova",
      "capacitor",
    ],
    Databases: [
      "postgresql",
      "mysql",
      "mongodb",
      "redis",
      "sqlite",
      "dynamodb",
      "elasticsearch",
      "cassandra",
      "firebase-firestore",
      "neo4j",
    ],
    "Cloud Platforms": [
      "aws",
      "gcp",
      "azure",
      "vercel",
      "netlify",
      "heroku",
      "digitalocean",
      "cloudflare",
      "railway",
      "render",
    ],
    "DevOps & Tools": [
      "docker",
      "kubernetes",
      "terraform",
      "ansible",
      "jenkins",
      "github-actions",
      "gitlab-ci",
      "prometheus",
      "grafana",
      "nginx",
      "caddy",
    ],
    Testing: [
      "jest",
      "cypress",
      "playwright",
      "selenium",
      "pytest",
      "junit",
      "testing-library",
      "vitest",
      "postman",
    ],
    "State Management": [
      "redux",
      "mobx",
      "zustand",
      "jotai",
      "recoil",
      "vuex",
      "pinia",
      "ngrx",
    ],
    "CSS & Styling": [
      "tailwind",
      "bootstrap",
      "sass",
      "styled-components",
      "emotion",
      "material-ui",
      "chakra-ui",
      "ant-design",
    ],
  };

  const _interviewTypes = [
    {
      value: "technical",
      label: "Technical Interview",
      description: "Coding and system design",
      icon: Code,
    },
    {
      value: "bullet",
      label: "Bullet Interview",
      description: "Quick 3-question session",
      icon: Target,
    },
    {
      value: "system-design",
      label: "System Design",
      description: "Architecture and scalability",
      icon: Building,
    },
    {
      value: "mixed",
      label: "Mixed Interview",
      description: "Combination of all types",
      icon: Users,
    },
  ];

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
    if (canGoNext() && currentStep < STEPS.length - 1) {
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
        {positions.map((position) => {
          const Icon = position.icon;
          return (
            <Card
              key={position.value}
              className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 h-full ${
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
              <CardContent className="p-5 h-full flex flex-col min-h-[120px]">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {position.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {position.description}
                    </p>
                  </div>
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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Experience Level</h3>
          <RadioGroup
            value={config.seniority}
            onValueChange={(value) =>
              setConfig((prev) => ({ ...prev, seniority: value }))
            }
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {seniorityLevels.map((level) => (
              <div key={level.value} className="h-full">
                <RadioGroupItem
                  value={level.value}
                  id={level.value}
                  className="sr-only"
                />
                <Label
                  htmlFor={level.value}
                  className={`flex flex-col p-5 rounded-lg border cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 h-full min-h-[120px] ${
                    config.seniority === level.value
                      ? "ring-2 ring-primary bg-primary/10 border-primary"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${level.color}`} />
                    <span className="font-semibold">{level.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">
                    {level.description}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Advanced Skills Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Advanced Skills Selection</h3>
            <p className="text-xs text-muted-foreground">
              Specify your tech stack for more targeted interview questions
            </p>
          </div>
          <Switch
            checked={showAdvancedSkills}
            onCheckedChange={setShowAdvancedSkills}
          />
        </div>

        {/* Technologies & Skills Selection - Only show when toggle is on */}
        {showAdvancedSkills && (
          <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="max-h-64 overflow-y-auto space-y-4 pr-3">
              {Object.entries(technologyGroups).map(
                ([groupName, groupTechs]) => (
                  <div key={groupName} className="space-y-3">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-3 border-b">
                      <h4 className="text-base font-semibold text-primary flex items-center gap-3">
                        {groupName}
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 min-w-fit"
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
                          className="h-7 px-3 text-xs"
                          onClick={() => {
                            const newTechs = groupTechs.filter(
                              (tech) => !config.technologies.includes(tech),
                            );
                            setConfig((prev) => ({
                              ...prev,
                              technologies: [...prev.technologies, ...newTechs],
                            }));
                          }}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-xs"
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {groupTechs.map((tech) => (
                        <Button
                          key={tech}
                          variant={
                            config.technologies.includes(tech)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="h-9 text-xs justify-start"
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

            {config.technologies.length > 0 && (
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-medium text-foreground">
                    Selected Technologies ({config.technologies.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, technologies: [] }))
                    }
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {config.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs px-3 py-1 min-w-fit flex items-center gap-1"
                    >
                      {tech}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs hover:text-destructive ml-1"
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
                      </Button>
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
            {companyProfiles.map((profile) => {
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
            {specificCompanies.map((company) => {
              const CompanyIcon = company.icon;
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
                    <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                      <CompanyIcon className={`h-8 w-8 ${company.color}`} />
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
          {interviewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.value}
                className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 h-full ${
                  config.interviewMode === mode.value
                    ? "ring-2 ring-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    interviewMode: mode.value,
                  }))
                }
              >
                <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{mode.label}</h3>
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
    <main className="flex-1 overflow-hidden">
      <div className="container mx-auto px-6 py-6 max-w-5xl h-full flex flex-col">
        {/* Progress Indicator */}
        <div className="mb-6">
          {/* Step Navigation Breadcrumb */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon as React.ComponentType<{
                className?: string;
              }>;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isCompleted
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground mx-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Configuration Content */}
        <div className="bg-background rounded-xl border border-border/50 shadow-sm flex-1 flex flex-col">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const StepIcon = STEPS[currentStep]
                    .icon as React.ComponentType<{ className?: string }>;
                  return <StepIcon className="h-5 w-5 text-primary" />;
                })()}
                <h2 className="text-xl font-bold text-foreground">
                  {STEPS[currentStep].title}
                </h2>
              </div>
              <p className="text-muted-foreground text-base">
                {STEPS[currentStep].description}
              </p>
            </div>

            <div className="flex-1 relative overflow-y-auto">
              <div
                key={currentStep}
                className="animate-in slide-in-from-right-4 fade-in duration-300"
              >
                {renderStepContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 h-11 px-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleStartInterview}
                disabled={!isConfigComplete}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 h-11 px-8 text-base font-semibold"
              >
                Start Interview
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 h-11 px-6"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
