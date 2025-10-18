"use client";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
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
import { useState } from "react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { SiAmazon, SiApple, SiMeta, SiNetflix } from "react-icons/si";
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/useAuthGuard";

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
    title: "Experience",
    description: "Choose your level",
    icon: Target,
  },
  {
    id: "technologies",
    title: "Technologies",
    description: "Select relevant tech stack",
    icon: Server,
  },
  {
    id: "company",
    title: "Company",
    description: "Pick your target",
    icon: Building,
  },
  {
    id: "type",
    title: "Interview Type",
    description: "Select interview focus",
    icon: Briefcase,
  },
  {
    id: "mode",
    title: "Mode & Settings",
    description: "Configure preferences",
    icon: Timer,
  },
];

export default function ConfigurePage() {
  const { loading: authLoading } = useAuthGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<InterviewConfig>({
    position: "",
    seniority: "",
    technologies: [],
    companyProfile: "",
    specificCompany: "",
    interviewMode: "",
    interviewType: "",
    duration: "30",
  });

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingPage message="Setting up your interview configuration..." />;
  }

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
      icon: Brain,
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
      icon: Brain,
    },
  ];

  const technologyGroups = {
    Frontend: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Angular",
      "Vue.js",
      "Svelte",
      "jQuery",
      "Backbone.js",
      "Sass",
      "Less",
      "Tailwind CSS",
      "Bootstrap",
      "Material UI",
      "Webpack",
      "Rollup",
      "Parcel",
      "Vite",
      "Redux",
      "MobX",
      "Zustand",
      "Vuex",
      "Pinia",
    ],
    "Backend Languages": [
      "Java",
      "Python",
      "Node.js",
      "C#",
      "Go",
      "PHP",
      "Ruby",
      "Kotlin",
      "Rust",
      "Swift",
      "Objective-C",
      "Dart",
      "Assembly",
    ],
    "Backend Frameworks": [
      "Express.js",
      "NestJS",
      "Django",
      "Flask",
      "Spring Boot",
      "Ruby on Rails",
      "Laravel",
      "ASP.NET",
    ],
    Databases: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Cassandra",
      "Oracle",
      "Firebase",
      "DynamoDB",
      "SQLite",
      "Realm",
    ],
    "Mobile Development": [
      "Xcode",
      "UIKit",
      "SwiftUI",
      "Android Studio",
      "Jetpack Compose",
      "Flutter",
      "React Native",
      "Xamarin",
      "Ionic",
    ],
    "DevOps & Cloud": [
      "Jenkins",
      "GitLab CI",
      "GitHub Actions",
      "CircleCI",
      "Docker",
      "Kubernetes",
      "Helm",
      "OpenShift",
      "AWS",
      "Azure",
      "GCP",
      "DigitalOcean",
      "Terraform",
      "Ansible",
      "Pulumi",
      "CloudFormation",
      "Prometheus",
      "Grafana",
      "ELK stack",
      "Datadog",
    ],
    "Data & ML": [
      "Hadoop",
      "Spark",
      "Flink",
      "Airflow",
      "Beam",
      "Talend",
      "Informatica",
      "dbt",
      "Scikit-learn",
      "Keras",
      "TensorFlow",
      "PyTorch",
      "XGBoost",
      "LightGBM",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "MLflow",
      "Sagemaker",
      "TensorFlow Serving",
    ],
    Testing: [
      "Jest",
      "Mocha",
      "Cypress",
      "Selenium",
      "Testing Library",
      "JUnit",
      "pytest",
      "Chai",
      "XCTest",
      "Espresso",
      "Detox",
      "Appium",
    ],
    "APIs & Integration": [
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "AJAX",
      "Fetch API",
      "GraphQL",
      "REST",
      "WebSockets",
      "OAuth2",
      "JWT",
      "OpenID Connect",
      "SAML",
      "RabbitMQ",
      "Kafka",
      "Webhooks",
      "Apigee",
      "Kong",
      "Postman",
      "Swagger",
    ],
    "Game Development": [
      "Unity",
      "Unreal Engine",
      "Godot",
      "CryEngine",
      "OpenGL",
      "DirectX",
      "Vulkan",
      "WebGL",
      "Metal",
      "Blender",
      "Maya",
      "Photoshop",
      "Substance Painter",
      "Photon",
      "Mirror",
      "Steamworks SDK",
    ],
    "Serverless & Functions": [
      "AWS Lambda",
      "Azure Functions",
      "Cloudflare Workers",
    ],
    "AR/VR": ["Unity XR", "ARKit", "ARCore", "Vuforia"],
    "Embedded & Security": [
      "Keil",
      "PlatformIO",
      "OpenOCD",
      "GDB",
      "I2C",
      "SPI",
      "UART",
      "CAN",
      "Wireshark",
      "Metasploit",
      "Burp Suite",
      "Nessus",
      "OpenSSL",
    ],
    Architecture: ["LAMP stack", "JAMstack", "MEAN stack"],
  };

  // Flatten for backward compatibility
  const _technologies = Object.values(technologyGroups).flat();

  const interviewTypes = [
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
      config.technologies.length > 0 &&
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
      window.location.href = `/interview?${urlParams.toString()}`;
    }
  };

  const isConfigComplete =
    config.position &&
    config.seniority &&
    config.technologies.length > 0 &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode &&
    config.interviewType;

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return config.position !== "";
      case 1:
        return config.seniority !== "";
      case 2:
        return config.technologies.length > 0;
      case 3:
        return config.companyProfile !== "" || config.specificCompany !== "";
      case 4:
        return config.interviewType !== "";
      case 5:
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

  const getStepProgress = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  function renderPositionStep() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((position) => {
          const Icon = position.icon;
          return (
            <Card
              key={position.value}
              className={`cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full ${
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
              <CardContent className="p-4 h-full flex  flex-col">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{position.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
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
      <RadioGroup
        value={config.seniority}
        onValueChange={(value) =>
          setConfig((prev) => ({ ...prev, seniority: value }))
        }
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
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
              className={`flex flex-col p-6 rounded-lg border cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full min-h-[120px] ${
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
    );
  }

  function renderTechnologiesStep() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Select Technologies & Skills
          </h3>
          <p className="text-muted-foreground mb-6">
            Choose the technologies, frameworks, and tools relevant to your
            interview. This helps us tailor questions to your tech stack.
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-6 pr-2">
          {Object.entries(technologyGroups).map(([groupName, groupTechs]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                  {groupName}
                  <span className="text-xs text-muted-foreground font-normal">
                    (
                    {
                      groupTechs.filter((tech) =>
                        config.technologies.includes(tech),
                      ).length
                    }
                    /{groupTechs.length})
                  </span>
                </h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
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
                    className="h-6 px-2 text-xs"
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {groupTechs.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    className={`p-2 rounded-md border cursor-pointer transition-all hover:scale-105 text-left text-xs ${
                      config.technologies.includes(tech)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
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
                    <span className="font-medium">{tech}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {config.technologies.length > 0 && (
          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-3">
              Selected Technologies ({config.technologies.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {config.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 text-xs hover:text-destructive"
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
                  className={`cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full ${
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
                  className={`cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 hover:scale-105 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full ${
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

  function renderInterviewTypeStep() {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full ${
                config.interviewType === type.value
                  ? "ring-2 ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  interviewType: type.value,
                }))
              }
            >
              <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {type.description}
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

  function renderModeStep() {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {interviewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.value}
                className={`cursor-pointer transition-all hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 h-full ${
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
        return renderTechnologiesStep();
      case 3:
        return renderCompanyStep();
      case 4:
        return renderInterviewTypeStep();
      case 5:
        return renderModeStep();
      default:
        return null;
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Step {currentStep + 1} of {STEPS.length}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {Math.round(getStepProgress())}% complete
                </span>
              </div>
              <Progress value={getStepProgress()} className="w-full" />

              {/* Step Navigation Breadcrumb */}
              <div className="flex items-center mt-4 space-x-2 overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon as React.ComponentType<{
                    className?: string;
                  }>;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StepIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {step.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Configuration Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const StepIcon = STEPS[currentStep]
                      .icon as React.ComponentType<{ className?: string }>;
                    return <StepIcon className="h-5 w-5 text-primary" />;
                  })()}
                  {STEPS[currentStep].title}
                </CardTitle>
                <CardDescription>
                  {STEPS[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px] relative overflow-hidden">
                <div
                  key={currentStep}
                  className="animate-in slide-in-from-right-4 fade-in duration-300 py-2"
                >
                  {renderStepContent()}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentStep === STEPS.length - 1 ? (
                  <Button
                    onClick={handleStartInterview}
                    disabled={!isConfigComplete}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    Start Interview
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Configuration Summary */}
            {isConfigComplete && (
              <Card className="border-primary/20 bg-primary/5 mt-6">
                <CardHeader>
                  <CardTitle className="text-primary">
                    Configuration Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        positions.find((p) => p.value === config.position)
                          ?.label
                      }
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        seniorityLevels.find(
                          (s) => s.value === config.seniority,
                        )?.label
                      }
                    </Badge>
                    {config.specificCompany ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        {
                          specificCompanies.find(
                            (c) => c.value === config.specificCompany,
                          )?.label
                        }
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        {
                          companyProfiles.find(
                            (c) => c.value === config.companyProfile,
                          )?.label
                        }
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        interviewTypes.find(
                          (t) => t.value === config.interviewType,
                        )?.label
                      }
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        interviewModes.find(
                          (m) => m.value === config.interviewMode,
                        )?.label
                      }
                    </Badge>
                    {config.interviewMode === "timed" && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        {config.duration} minutes
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
