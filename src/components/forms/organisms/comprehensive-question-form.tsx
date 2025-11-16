"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CompanyLogo,
  CompanySize,
  PracticeQuestion,
  QuestionCategory,
} from "@/lib/services/practice-questions/practice-questions-service";
import type {
  APIArchitecture,
  BackendFramework,
  CachingTech,
  CICD,
  CloudProvider,
  ContainerTech,
  CSSFramework,
  FrontendFramework,
  IaC,
  LLMProvider,
  MessageQueue,
  MLFramework,
  MobileDevelopment,
  Monitoring,
  NoSQLDatabase,
  ORM,
  ProgrammingLanguage,
  Protocol,
  SearchEngine,
  SecurityTool,
  SQLDatabase,
  StateManagement,
  TestingFramework,
  VectorDatabase,
  WebServer,
} from "@/types/tech-stack";
import { MarkdownTextarea } from "../molecules/markdown-editor";

const formSchema = z.object({
  // Required fields
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "Difficulty is required",
  }),
  companyLogo: z.string().min(1, "Company is required"),
  companySize: z
    .array(z.string())
    .min(1, "At least one company size is required"),
  primaryTechStack: z
    .array(z.string())
    .min(1, "At least one primary tech stack is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  answer: z.string().min(20, "Answer must be at least 20 characters"),
  topicTags: z.array(z.string()).min(5, "At least 5 topic tags are required"),

  // Optional fields
  languages: z.array(z.string()).optional(),
  frontendFrameworks: z.array(z.string()).optional(),
  backendFrameworks: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
  cloudProviders: z.array(z.string()).optional(),
  containers: z.array(z.string()).optional(),
  cicd: z.array(z.string()).optional(),
  testing: z.array(z.string()).optional(),
  apiTypes: z.array(z.string()).optional(),
  orms: z.array(z.string()).optional(),
  cssFrameworks: z.array(z.string()).optional(),
  stateManagement: z.array(z.string()).optional(),
  mobile: z.array(z.string()).optional(),
  messageQueues: z.array(z.string()).optional(),
  caching: z.array(z.string()).optional(),
  monitoring: z.array(z.string()).optional(),
  security: z.array(z.string()).optional(),
  mlFrameworks: z.array(z.string()).optional(),
  llmProviders: z.array(z.string()).optional(),
  protocol: z.array(z.string()).optional(),
  webServers: z.array(z.string()).optional(),
  searchEngines: z.array(z.string()).optional(),
  vectorDBs: z.array(z.string()).optional(),
  iac: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ComprehensiveQuestionFormProps {
  initialData?: Partial<PracticeQuestion>;
  onSubmit: (data: Omit<PracticeQuestion, "id">) => Promise<void>;
}

export const CATEGORIES: QuestionCategory[] = [
  "algorithms",
  "data-structures",
  "system-design",
  "behavioral",
  "frontend",
  "backend",
  "database",
  "devops",
  "security",
  "testing",
  "architecture",
  "api-design",
  "cloud",
  "mobile",
  "ml-ai",
  "performance",
  "scalability",
  "debugging",
  "code-review",
  "leadership",
  "communication",
  "problem-solving",
];

export const COMPANY_LOGOS: CompanyLogo[] = [
  "SiGoogle",
  "SiMeta",
  "SiAmazon",
  "SiApple",
  "SiNetflix",
  "SiMicrosoft",
  "SiTesla",
  "SiNvidia",
  "SiOracle",
  "SiSalesforce",
  "SiIbm",
  "SiIntel",
  "SiAdobe",
  "SiSap",
  "SiCisco",
  "SiX",
  "SiLinkedin",
  "SiSnapchat",
  "SiTiktok",
  "SiReddit",
  "SiAmazonaws",
  "SiMicrosoftazure",
  "SiGooglecloud",
  "SiCloudflare",
  "SiVercel",
  "SiStripe",
  "SiSpotify",
  "SiUber",
  "SiAirbnb",
  "SiShopify",
  "SiZoom",
  "SiSlack",
  "SiDropbox",
  "SiNotion",
  "SiAtlassian",
  "SiTwilio",
  "SiDatadog",
  "SiSnowflake",
  "SiPaypal",
  "SiSquare",
  "SiCoinbase",
  "SiGithub",
  "SiGitlab",
  "SiDatabricks",
  "SiOptiver",
  "SiQualcomm",
  "SiNetguru",
  "SiHexagon",
  "SiDassaultsystemes",
];

export const COMPANY_SIZES: CompanySize[] = [
  "startup",
  "small",
  "medium",
  "large",
  "enterprise",
  "faang",
  "unicorn",
];

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
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
  "elixir",
  "clojure",
  "haskell",
  "perl",
  "r",
  "swift",
  "dart",
  "c",
  "cpp",
  "objective-c",
  "sql",
  "bash",
  "powershell",
];

export const FRONTEND_FRAMEWORKS: FrontendFramework[] = [
  "vue",
  "angular",
  "svelte",
  "solid",
  "next",
  "nuxt",
  "remix",
  "gatsby",
  "astro",
  "qwik",
  "ember",
  "backbone",
];

export const BACKEND_FRAMEWORKS: BackendFramework[] = [
  "nodejs",
  "express",
  "nestjs",
  "fastify",
  "koa",
  "hapi",
  "django",
  "flask",
  "fastapi",
  "spring-boot",
  "spring",
  "quarkus",
  "micronaut",
  "dotnet",
  "aspnet-core",
  "rails",
  "sinatra",
  "laravel",
  "symfony",
  "gin",
  "echo",
  "fiber",
  "actix",
  "rocket",
  "axum",
  "phoenix",
  "vapor",
];

export const SQL_DATABASES: SQLDatabase[] = [
  "postgresql",
  "mysql",
  "mariadb",
  "sqlite",
  "mssql",
  "oracle",
  "cockroachdb",
  "amazon-aurora",
  "google-cloud-sql",
  "azure-sql",
];

export const NOSQL_DATABASES: NoSQLDatabase[] = [
  "mongodb",
  "dynamodb",
  "cassandra",
  "couchdb",
  "redis",
  "memcached",
  "elasticsearch",
  "firebase-firestore",
  "cosmosdb",
  "neo4j",
  "arangodb",
  "rethinkdb",
  "fauna",
];

export const CLOUD_PROVIDERS: CloudProvider[] = [
  "aws",
  "gcp",
  "azure",
  "digitalocean",
  "heroku",
  "vercel",
  "netlify",
  "railway",
  "render",
  "fly-io",
  "cloudflare",
  "linode",
  "vultr",
  "oracle-cloud",
  "ibm-cloud",
  "alibaba-cloud",
];

export const CONTAINER_TECH: ContainerTech[] = [
  "docker",
  "podman",
  "containerd",
  "kubernetes",
  "openshift",
  "rancher",
  "nomad",
  "docker-compose",
  "docker-swarm",
];

export const CICD_TOOLS: CICD[] = [
  "github-actions",
  "gitlab-ci",
  "jenkins",
  "circleci",
  "travis-ci",
  "azure-devops",
  "bitbucket-pipelines",
  "teamcity",
  "bamboo",
  "drone",
  "buildkite",
  "argo-cd",
  "flux",
];

export const TESTING_FRAMEWORKS: TestingFramework[] = [
  "jest",
  "vitest",
  "mocha",
  "jasmine",
  "cypress",
  "playwright",
  "selenium",
  "puppeteer",
  "testing-library",
  "enzyme",
  "pytest",
  "unittest",
  "junit",
  "testng",
  "rspec",
  "minitest",
  "phpunit",
  "xunit",
  "nunit",
  "postman",
  "insomnia",
  "k6",
  "jmeter",
  "gatling",
  "locust",
];

export const API_TYPES: APIArchitecture[] = [
  "rest",
  "graphql",
  "grpc",
  "soap",
  "websockets",
  "server-sent-events",
  "webhooks",
  "json-rpc",
  "xml-rpc",
  "thrift",
  "protobuf",
  "trpc",
];

export const ORM_TOOLS: ORM[] = [
  "prisma",
  "typeorm",
  "sequelize",
  "drizzle",
  "knex",
  "mongoose",
  "sqlalchemy",
  "django-orm",
  "hibernate",
  "jpa",
  "entity-framework",
  "active-record",
  "gorm",
  "diesel",
];

export const CSS_FRAMEWORKS: CSSFramework[] = [
  "tailwind",
  "bootstrap",
  "material-ui",
  "chakra-ui",
  "ant-design",
  "bulma",
  "foundation",
  "semantic-ui",
  "styled-components",
  "emotion",
  "sass",
  "less",
  "postcss",
  "css-modules",
  "vanilla-extract",
];

export const STATE_MANAGEMENT: StateManagement[] = [
  "redux",
  "mobx",
  "zustand",
  "jotai",
  "recoil",
  "xstate",
  "context-api",
  "vuex",
  "pinia",
  "ngrx",
  "rxjs",
];

export const MOBILE_DEV: MobileDevelopment[] = [
  "react-native",
  "flutter",
  "swift",
  "kotlin",
  "objective-c",
  "java-android",
  "ionic",
  "xamarin",
  "cordova",
  "capacitor",
  "nativescript",
];

export const MESSAGE_QUEUES: MessageQueue[] = [
  "rabbitmq",
  "kafka",
  "redis-streams",
  "aws-sqs",
  "aws-sns",
  "google-pub-sub",
  "azure-service-bus",
  "nats",
  "activemq",
  "zeromq",
  "pulsar",
  "celery",
  "bull",
  "bee-queue",
];

export const CACHING_TECH: CachingTech[] = [
  "redis",
  "memcached",
  "varnish",
  "cloudflare-cache",
  "cdn",
  "nginx-cache",
  "hazelcast",
];

export const MONITORING_TOOLS: Monitoring[] = [
  "datadog",
  "new-relic",
  "prometheus",
  "grafana",
  "elk-stack",
  "splunk",
  "sentry",
  "pagerduty",
  "cloudwatch",
  "stackdriver",
  "uptimerobot",
  "pingdom",
  "dynatrace",
  "app-dynamics",
  "jaeger",
  "zipkin",
  "opentelemetry",
];

export const SECURITY_TOOLS: SecurityTool[] = [
  "oauth",
  "jwt",
  "auth0",
  "okta",
  "keycloak",
  "vault",
  "cert-manager",
  "lets-encrypt",
  "snyk",
  "sonarqube",
  "owasp-zap",
  "burp-suite",
  "aqua-security",
  "trivy",
  "clair",
];

export const ML_FRAMEWORKS: MLFramework[] = [
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "keras",
  "jax",
  "huggingface",
  "langchain",
  "llamaindex",
  "opencv",
  "pandas",
  "numpy",
  "scipy",
  "mlflow",
  "wandb",
  "ray",
  "xgboost",
  "lightgbm",
  "catboost",
];

export const LLM_PROVIDERS: LLMProvider[] = [
  "openai",
  "anthropic",
  "google-ai",
  "aws-bedrock",
  "azure-openai",
  "cohere",
  "replicate",
  "huggingface-inference",
  "ollama",
];

export const PROTOCOLS: Protocol[] = [
  "http",
  "https",
  "http2",
  "http3",
  "tcp",
  "udp",
  "mqtt",
  "amqp",
  "stomp",
  "webrtc",
  "ftp",
  "ssh",
  "smtp",
  "imap",
  "pop3",
];

export const WEB_SERVERS: WebServer[] = [
  "nginx",
  "apache",
  "caddy",
  "traefik",
  "envoy",
  "haproxy",
  "iis",
  "lighttpd",
];

export const SEARCH_ENGINES: SearchEngine[] = [
  "elasticsearch",
  "solr",
  "algolia",
  "meilisearch",
  "typesense",
  "opensearch",
];

export const VECTOR_DBS: VectorDatabase[] = [
  "pinecone",
  "weaviate",
  "qdrant",
  "milvus",
  "chroma",
  "pgvector",
];

export const IAC_TOOLS: IaC[] = [
  "terraform",
  "pulumi",
  "ansible",
  "chef",
  "puppet",
  "cloudformation",
  "arm-templates",
  "cdk",
  "bicep",
  "crossplane",
];

export const formatLabel = (value: string) => {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getCompanyNameFromLogo = (logo: CompanyLogo): string => {
  const base = logo.replace(/^Si/, "");
  return formatLabel(base);
};

export function ComprehensiveQuestionForm({
  initialData,
  onSubmit,
}: ComprehensiveQuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: initialData?.category || "",
      difficulty: initialData?.difficulty || "medium",
      companyLogo: initialData?.companyLogo || "",
      companySize: initialData?.companySize || [],
      primaryTechStack: initialData?.primaryTechStack || [],
      languages: initialData?.languages || [],
      frontendFrameworks: initialData?.frontendFrameworks || [],
      backendFrameworks: initialData?.backendFrameworks || [],
      databases: initialData?.databases || [],
      cloudProviders: initialData?.cloudProviders || [],
      containers: initialData?.containers || [],
      cicd: initialData?.cicd || [],
      testing: initialData?.testing || [],
      apiTypes: initialData?.apiTypes || [],
      orms: initialData?.orms || [],
      cssFrameworks: initialData?.cssFrameworks || [],
      stateManagement: initialData?.stateManagement || [],
      mobile: initialData?.mobile || [],
      messageQueues: initialData?.messageQueues || [],
      caching: initialData?.caching || [],
      monitoring: initialData?.monitoring || [],
      security: initialData?.security || [],
      mlFrameworks: initialData?.mlFrameworks || [],
      llmProviders: initialData?.llmProviders || [],
      protocol: initialData?.protocol || [],
      webServers: initialData?.webServers || [],
      searchEngines: initialData?.searchEngines || [],
      vectorDBs: initialData?.vectorDBs || [],
      iac: initialData?.iac || [],
      title: initialData?.title || "",
      question: initialData?.question || "",
      answer: initialData?.answer || "",
      topicTags: initialData?.topicTags || [],
    },
  });

  // Watch form values for reactive validation
  const watchedValues = form.watch();

  // Check if all required fields are filled
  const isFormValid =
    watchedValues.category &&
    watchedValues.difficulty &&
    watchedValues.companyLogo &&
    watchedValues.companySize &&
    watchedValues.companySize.length > 0 &&
    watchedValues.primaryTechStack &&
    watchedValues.primaryTechStack.length > 0 &&
    watchedValues.title &&
    watchedValues.title.length >= 5 &&
    watchedValues.question &&
    watchedValues.question.length >= 10 &&
    watchedValues.answer &&
    watchedValues.answer.length >= 20 &&
    watchedValues.topicTags &&
    watchedValues.topicTags.length >= 5;

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors([]);

    try {
      // Validate required fields and provide specific error messages
      const errors: string[] = [];

      if (!values.category) errors.push("Category is required");
      if (!values.difficulty) errors.push("Difficulty is required");
      if (!values.companyLogo) errors.push("Company is required");
      if (!values.companySize || values.companySize.length === 0)
        errors.push("At least one company size is required");
      if (!values.primaryTechStack || values.primaryTechStack.length === 0)
        errors.push("At least one primary tech stack is required");
      if (!values.title || values.title.length < 5)
        errors.push("Title must be at least 5 characters long");
      if (!values.question || values.question.length < 10)
        errors.push("Question must be at least 10 characters long");
      if (!values.answer || values.answer.length < 20)
        errors.push("Answer must be at least 20 characters long");
      if (!values.topicTags || values.topicTags.length < 5)
        errors.push("At least 5 topic tags are required");

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      const payload: Omit<PracticeQuestion, "id"> = {
        category: values.category as QuestionCategory,
        difficulty: values.difficulty,
        companyLogo: values.companyLogo as CompanyLogo,
        companyName:
          initialData?.companyName ??
          getCompanyNameFromLogo(values.companyLogo as CompanyLogo),
        companySize: values.companySize as CompanySize[],
        primaryTechStack:
          values.primaryTechStack as PracticeQuestion["primaryTechStack"],
        languages: values.languages as PracticeQuestion["languages"],
        frontendFrameworks:
          values.frontendFrameworks as PracticeQuestion["frontendFrameworks"],
        backendFrameworks:
          values.backendFrameworks as PracticeQuestion["backendFrameworks"],
        databases: values.databases as PracticeQuestion["databases"],
        cloudProviders:
          values.cloudProviders as PracticeQuestion["cloudProviders"],
        containers: values.containers as PracticeQuestion["containers"],
        cicd: values.cicd as PracticeQuestion["cicd"],
        testing: values.testing as PracticeQuestion["testing"],
        apiTypes: values.apiTypes as PracticeQuestion["apiTypes"],
        orms: values.orms as PracticeQuestion["orms"],
        cssFrameworks:
          values.cssFrameworks as PracticeQuestion["cssFrameworks"],
        stateManagement:
          values.stateManagement as PracticeQuestion["stateManagement"],
        mobile: values.mobile as PracticeQuestion["mobile"],
        messageQueues:
          values.messageQueues as PracticeQuestion["messageQueues"],
        caching: values.caching as PracticeQuestion["caching"],
        monitoring: values.monitoring as PracticeQuestion["monitoring"],
        security: values.security as PracticeQuestion["security"],
        mlFrameworks: values.mlFrameworks as PracticeQuestion["mlFrameworks"],
        llmProviders: values.llmProviders as PracticeQuestion["llmProviders"],
        protocol: values.protocol as PracticeQuestion["protocol"],
        webServers: values.webServers as PracticeQuestion["webServers"],
        searchEngines:
          values.searchEngines as PracticeQuestion["searchEngines"],
        vectorDBs: values.vectorDBs as PracticeQuestion["vectorDBs"],
        iac: values.iac as PracticeQuestion["iac"],
        title: values.title,
        question: values.question,
        answer: values.answer,
        topicTags: values.topicTags,
        relatedQuestions: initialData?.relatedQuestions,
        learningResources: initialData?.learningResources,
        lastUpdatedAt: initialData?.lastUpdatedAt,
      };

      await onSubmit(payload);

      // Show success toast
      toast.success(
        initialData
          ? "Question updated successfully!"
          : "Question created successfully!",
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting the form",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("topicTags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("topicTags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("topicTags");
    form.setValue(
      "topicTags",
      currentTags.filter((t) => t !== tag),
    );
  };

  const MultiSelectField = ({
    name,
    label,
    options,
    description,
    required = false,
  }: {
    name: keyof z.infer<typeof formSchema>;
    label: string;
    options: readonly string[];
    description?: string;
    required?: boolean;
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const fieldValue = (form.watch(name) || []) as string[];

    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const toggleOption = (option: string) => {
      const current = fieldValue as string[];
      if (current.includes(option)) {
        form.setValue(
          name,
          current.filter((item) => item !== option),
        );
      } else {
        form.setValue(name, [...current, option]);
      }
    };

    return (
      <FormField
        control={form.control}
        name={name}
        render={() => (
          <FormItem>
            <FormLabel>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormControl>
              <div className="space-y-2">
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No options found
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {filteredOptions.map((option) => (
                        <Badge
                          key={option}
                          variant={
                            fieldValue.includes(option) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleOption(option)}
                        >
                          {formatLabel(option)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {fieldValue.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    <span className="text-sm text-muted-foreground">
                      Selected:
                    </span>
                    {fieldValue.map((item: string) => (
                      <Badge key={item} variant="secondary">
                        {formatLabel(item)}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => toggleOption(item)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Error Display */}
        {(validationErrors.length > 0 || submitError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </h3>
                {validationErrors.length > 0 && (
                  <ul className="text-sm text-red-700 space-y-1 mb-2">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {submitError && (
                  <p className="text-sm text-red-700">{submitError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {formatLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Difficulty <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Company <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {COMPANY_LOGOS.map((logo) => (
                    <SelectItem key={logo} value={logo}>
                      {formatLabel(logo.replace("Si", ""))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <MultiSelectField
          name="companySize"
          label="Company Size"
          options={COMPANY_SIZES}
          required={true}
        />

        <MultiSelectField
          name="primaryTechStack"
          label="Primary Tech Stack"
          options={[
            ...PROGRAMMING_LANGUAGES,
            ...FRONTEND_FRAMEWORKS,
            ...BACKEND_FRAMEWORKS,
          ]}
          description="Main technologies for this question"
          required={true}
        />

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Question Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter a descriptive title for the question..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Question & Answer with Markdown Editor */}
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Question <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <MarkdownTextarea
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter the interview question..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Answer <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <MarkdownTextarea
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter the answer or key points..."
                  rows={8}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Topic Tags */}
        <FormField
          control={form.control}
          name="topicTags"
          render={() => (
            <FormItem>
              <FormLabel>
                Topic Tags <span className="text-red-500">*</span>{" "}
                <span className="text-sm text-muted-foreground">
                  (minimum 5)
                </span>
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a topic tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("topicTags").map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tech Stack Sections */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Technology Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MultiSelectField
              name="languages"
              label="Programming Languages"
              options={PROGRAMMING_LANGUAGES}
            />
            <MultiSelectField
              name="frontendFrameworks"
              label="Frontend Frameworks"
              options={FRONTEND_FRAMEWORKS}
            />
            <MultiSelectField
              name="backendFrameworks"
              label="Backend Frameworks"
              options={BACKEND_FRAMEWORKS}
            />
            <MultiSelectField
              name="databases"
              label="Databases"
              options={[...SQL_DATABASES, ...NOSQL_DATABASES]}
            />
            <MultiSelectField
              name="cloudProviders"
              label="Cloud Providers"
              options={CLOUD_PROVIDERS}
            />
            <MultiSelectField
              name="containers"
              label="Container Technologies"
              options={CONTAINER_TECH}
            />
            <MultiSelectField
              name="cicd"
              label="CI/CD Tools"
              options={CICD_TOOLS}
            />
            <MultiSelectField
              name="testing"
              label="Testing Frameworks"
              options={TESTING_FRAMEWORKS}
            />
            <MultiSelectField
              name="apiTypes"
              label="API Architecture"
              options={API_TYPES}
            />
            <MultiSelectField name="orms" label="ORMs" options={ORM_TOOLS} />
            <MultiSelectField
              name="cssFrameworks"
              label="CSS Frameworks"
              options={CSS_FRAMEWORKS}
            />
            <MultiSelectField
              name="stateManagement"
              label="State Management"
              options={STATE_MANAGEMENT}
            />
            <MultiSelectField
              name="mobile"
              label="Mobile Development"
              options={MOBILE_DEV}
            />
            <MultiSelectField
              name="messageQueues"
              label="Message Queues"
              options={MESSAGE_QUEUES}
            />
            <MultiSelectField
              name="caching"
              label="Caching Technologies"
              options={CACHING_TECH}
            />
            <MultiSelectField
              name="monitoring"
              label="Monitoring Tools"
              options={MONITORING_TOOLS}
            />
            <MultiSelectField
              name="security"
              label="Security Tools"
              options={SECURITY_TOOLS}
            />
            <MultiSelectField
              name="mlFrameworks"
              label="ML Frameworks"
              options={ML_FRAMEWORKS}
            />
            <MultiSelectField
              name="llmProviders"
              label="LLM Providers"
              options={LLM_PROVIDERS}
            />
            <MultiSelectField
              name="protocol"
              label="Protocols"
              options={PROTOCOLS}
            />
            <MultiSelectField
              name="webServers"
              label="Web Servers"
              options={WEB_SERVERS}
            />
            <MultiSelectField
              name="searchEngines"
              label="Search Engines"
              options={SEARCH_ENGINES}
            />
            <MultiSelectField
              name="vectorDBs"
              label="Vector Databases"
              options={VECTOR_DBS}
            />
            <MultiSelectField
              name="iac"
              label="Infrastructure as Code"
              options={IAC_TOOLS}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Question"
              : "Create Question"}
        </Button>
      </form>
    </Form>
  );
}
