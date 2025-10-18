// ============= FRONTEND =============
export type FrontendFramework =
  | "react"
  | "vue"
  | "angular"
  | "svelte"
  | "solid"
  | "next"
  | "nuxt"
  | "remix"
  | "gatsby"
  | "astro"
  | "qwik"
  | "preact"
  | "ember"
  | "backbone"
  | "jquery"
  | "alpine";

export type MobileDevelopment =
  | "react-native"
  | "flutter"
  | "swift"
  | "kotlin"
  | "objective-c"
  | "java-android"
  | "ionic"
  | "xamarin"
  | "cordova"
  | "capacitor"
  | "nativescript";

export type CSSFramework =
  | "tailwind"
  | "bootstrap"
  | "material-ui"
  | "chakra-ui"
  | "ant-design"
  | "bulma"
  | "foundation"
  | "semantic-ui"
  | "styled-components"
  | "emotion"
  | "sass"
  | "less"
  | "postcss"
  | "css-modules"
  | "vanilla-extract";

export type StateManagement =
  | "redux"
  | "mobx"
  | "zustand"
  | "jotai"
  | "recoil"
  | "xstate"
  | "context-api"
  | "vuex"
  | "pinia"
  | "ngrx"
  | "rxjs";

// ============= BACKEND =============
export type BackendLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "kotlin"
  | "scala"
  | "elixir"
  | "clojure"
  | "haskell"
  | "perl"
  | "r"
  | "swift-server"
  | "dart";

export type BackendFramework =
  | "nodejs"
  | "express"
  | "nestjs"
  | "fastify"
  | "koa"
  | "hapi"
  | "django"
  | "flask"
  | "fastapi"
  | "spring-boot"
  | "spring"
  | "quarkus"
  | "micronaut"
  | "dotnet"
  | "aspnet-core"
  | "rails"
  | "sinatra"
  | "laravel"
  | "symfony"
  | "gin"
  | "echo"
  | "fiber"
  | "actix"
  | "rocket"
  | "axum"
  | "phoenix"
  | "vapor";

export type APIArchitecture =
  | "rest"
  | "graphql"
  | "grpc"
  | "soap"
  | "websockets"
  | "server-sent-events"
  | "webhooks"
  | "json-rpc"
  | "xml-rpc"
  | "thrift"
  | "protobuf"
  | "trpc";

// ============= DATABASES =============
export type SQLDatabase =
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "sqlite"
  | "mssql"
  | "oracle"
  | "cockroachdb"
  | "amazon-aurora"
  | "google-cloud-sql"
  | "azure-sql";

export type NoSQLDatabase =
  | "mongodb"
  | "dynamodb"
  | "cassandra"
  | "couchdb"
  | "redis"
  | "memcached"
  | "elasticsearch"
  | "firebase-firestore"
  | "cosmosdb"
  | "neo4j"
  | "arangodb"
  | "rethinkdb"
  | "fauna";

export type SearchEngine =
  | "elasticsearch"
  | "solr"
  | "algolia"
  | "meilisearch"
  | "typesense"
  | "opensearch";

export type VectorDatabase =
  | "pinecone"
  | "weaviate"
  | "qdrant"
  | "milvus"
  | "chroma"
  | "pgvector";

export type ORM =
  | "prisma"
  | "typeorm"
  | "sequelize"
  | "drizzle"
  | "knex"
  | "mongoose"
  | "sqlalchemy"
  | "django-orm"
  | "hibernate"
  | "jpa"
  | "entity-framework"
  | "active-record"
  | "gorm"
  | "diesel";

// ============= CLOUD & INFRASTRUCTURE =============
export type CloudProvider =
  | "aws"
  | "gcp"
  | "azure"
  | "digitalocean"
  | "heroku"
  | "vercel"
  | "netlify"
  | "railway"
  | "render"
  | "fly-io"
  | "cloudflare"
  | "linode"
  | "vultr"
  | "oracle-cloud"
  | "ibm-cloud"
  | "alibaba-cloud";

export type AWSService =
  | "ec2"
  | "s3"
  | "lambda"
  | "rds"
  | "dynamodb"
  | "ecs"
  | "eks"
  | "cloudfront"
  | "route53"
  | "api-gateway"
  | "cognito"
  | "sqs"
  | "sns"
  | "eventbridge"
  | "step-functions"
  | "cloudwatch"
  | "cloudformation"
  | "elastic-beanstalk"
  | "amplify"
  | "appsync"
  | "fargate"
  | "redshift"
  | "athena"
  | "glue"
  | "kinesis"
  | "emr"
  | "sagemaker";

export type GCPService =
  | "compute-engine"
  | "cloud-storage"
  | "cloud-functions"
  | "cloud-run"
  | "gke"
  | "cloud-sql"
  | "firestore"
  | "bigquery"
  | "pub-sub"
  | "cloud-cdn"
  | "cloud-dns"
  | "firebase"
  | "app-engine"
  | "dataflow"
  | "dataproc"
  | "vertex-ai";

export type AzureService =
  | "virtual-machines"
  | "blob-storage"
  | "functions"
  | "aks"
  | "sql-database"
  | "cosmosdb"
  | "service-bus"
  | "event-grid"
  | "api-management"
  | "active-directory"
  | "devops"
  | "app-service";

// ============= DEVOPS & DEPLOYMENT =============
export type ContainerTech =
  | "docker"
  | "podman"
  | "containerd"
  | "kubernetes"
  | "openshift"
  | "rancher"
  | "nomad"
  | "docker-compose"
  | "docker-swarm";

export type CICD =
  | "github-actions"
  | "gitlab-ci"
  | "jenkins"
  | "circleci"
  | "travis-ci"
  | "azure-devops"
  | "bitbucket-pipelines"
  | "teamcity"
  | "bamboo"
  | "drone"
  | "buildkite"
  | "argo-cd"
  | "flux";

export type IaC =
  | "terraform"
  | "pulumi"
  | "ansible"
  | "chef"
  | "puppet"
  | "cloudformation"
  | "arm-templates"
  | "cdk"
  | "bicep"
  | "crossplane";

export type Monitoring =
  | "datadog"
  | "new-relic"
  | "prometheus"
  | "grafana"
  | "elk-stack"
  | "splunk"
  | "sentry"
  | "pagerduty"
  | "cloudwatch"
  | "stackdriver"
  | "uptimerobot"
  | "pingdom"
  | "dynatrace"
  | "app-dynamics"
  | "jaeger"
  | "zipkin"
  | "opentelemetry";

// ============= TESTING =============
export type TestingFramework =
  | "jest"
  | "vitest"
  | "mocha"
  | "jasmine"
  | "cypress"
  | "playwright"
  | "selenium"
  | "puppeteer"
  | "testing-library"
  | "enzyme"
  | "pytest"
  | "unittest"
  | "junit"
  | "testng"
  | "rspec"
  | "minitest"
  | "phpunit"
  | "xunit"
  | "nunit"
  | "postman"
  | "insomnia"
  | "k6"
  | "jmeter"
  | "gatling"
  | "locust";

// ============= BUILD TOOLS =============
export type BuildTool =
  | "webpack"
  | "vite"
  | "rollup"
  | "parcel"
  | "esbuild"
  | "turbopack"
  | "swc"
  | "babel"
  | "tsc"
  | "maven"
  | "gradle"
  | "ant"
  | "make"
  | "cmake"
  | "npm"
  | "yarn"
  | "pnpm"
  | "bun"
  | "pip"
  | "poetry"
  | "cargo"
  | "composer"
  | "bundler"
  | "mix";

// ============= VERSION CONTROL =============
export type VersionControl =
  | "git"
  | "github"
  | "gitlab"
  | "bitbucket"
  | "svn"
  | "mercurial"
  | "perforce";

// ============= MESSAGE QUEUES & STREAMING =============
export type MessageQueue =
  | "rabbitmq"
  | "kafka"
  | "redis-streams"
  | "aws-sqs"
  | "aws-sns"
  | "google-pub-sub"
  | "azure-service-bus"
  | "nats"
  | "activemq"
  | "zeromq"
  | "pulsar"
  | "celery"
  | "bull"
  | "bee-queue";

// ============= CACHING =============
export type CachingTech =
  | "redis"
  | "memcached"
  | "varnish"
  | "cloudflare-cache"
  | "cdn"
  | "nginx-cache"
  | "hazelcast";

// ============= WEB SERVERS =============
export type WebServer =
  | "nginx"
  | "apache"
  | "caddy"
  | "traefik"
  | "envoy"
  | "haproxy"
  | "iis"
  | "lighttpd";

// ============= SECURITY =============
export type SecurityTool =
  | "oauth"
  | "jwt"
  | "auth0"
  | "okta"
  | "keycloak"
  | "vault"
  | "cert-manager"
  | "lets-encrypt"
  | "snyk"
  | "sonarqube"
  | "owasp-zap"
  | "burp-suite"
  | "aqua-security"
  | "trivy"
  | "clair";

// ============= DATA & ANALYTICS =============
export type DataTool =
  | "airflow"
  | "dagster"
  | "prefect"
  | "dbt"
  | "spark"
  | "hadoop"
  | "flink"
  | "beam"
  | "snowflake"
  | "databricks"
  | "looker"
  | "tableau"
  | "power-bi"
  | "metabase"
  | "superset"
  | "redash";

// ============= ML & AI =============
export type MLFramework =
  | "tensorflow"
  | "pytorch"
  | "scikit-learn"
  | "keras"
  | "jax"
  | "huggingface"
  | "langchain"
  | "llamaindex"
  | "opencv"
  | "pandas"
  | "numpy"
  | "scipy"
  | "mlflow"
  | "wandb"
  | "ray"
  | "xgboost"
  | "lightgbm"
  | "catboost";

export type LLMProvider =
  | "openai"
  | "anthropic"
  | "google-ai"
  | "aws-bedrock"
  | "azure-openai"
  | "cohere"
  | "replicate"
  | "huggingface-inference"
  | "ollama";

// ============= PROTOCOLS & STANDARDS =============
export type Protocol =
  | "http"
  | "https"
  | "http2"
  | "http3"
  | "tcp"
  | "udp"
  | "mqtt"
  | "amqp"
  | "stomp"
  | "webrtc"
  | "ftp"
  | "ssh"
  | "smtp"
  | "imap"
  | "pop3";

// ============= OTHER TOOLS =============
export type DesignTool =
  | "figma"
  | "sketch"
  | "adobe-xd"
  | "invision"
  | "framer"
  | "penpot"
  | "zeplin"
  | "storybook"
  | "chromatic";

export type Documentation =
  | "swagger"
  | "openapi"
  | "postman"
  | "readme"
  | "docusaurus"
  | "mkdocs"
  | "sphinx"
  | "javadoc"
  | "jsdoc"
  | "typedoc"
  | "doxygen";

export type ProjectManagement =
  | "jira"
  | "linear"
  | "asana"
  | "trello"
  | "notion"
  | "clickup"
  | "monday"
  | "github-projects"
  | "gitlab-issues"
  | "azure-boards";

// ============= COMPREHENSIVE UNION TYPE =============
export type TechStack =
  | FrontendFramework
  | MobileDevelopment
  | CSSFramework
  | StateManagement
  | BackendLanguage
  | BackendFramework
  | APIArchitecture
  | SQLDatabase
  | NoSQLDatabase
  | SearchEngine
  | VectorDatabase
  | ORM
  | CloudProvider
  | AWSService
  | GCPService
  | AzureService
  | ContainerTech
  | CICD
  | IaC
  | Monitoring
  | TestingFramework
  | BuildTool
  | VersionControl
  | MessageQueue
  | CachingTech
  | WebServer
  | SecurityTool
  | DataTool
  | MLFramework
  | LLMProvider
  | Protocol
  | DesignTool
  | Documentation
  | ProjectManagement;

// ============= HELPER TYPE FOR CATEGORIZATION =============
export interface TechStackCategory {
  category:
    | "frontend"
    | "mobile"
    | "css"
    | "state-management"
    | "backend-language"
    | "backend-framework"
    | "api"
    | "database-sql"
    | "database-nosql"
    | "search"
    | "vector-db"
    | "orm"
    | "cloud"
    | "aws"
    | "gcp"
    | "azure"
    | "container"
    | "cicd"
    | "iac"
    | "monitoring"
    | "testing"
    | "build"
    | "vcs"
    | "message-queue"
    | "caching"
    | "web-server"
    | "security"
    | "data"
    | "ml-ai"
    | "llm"
    | "protocol"
    | "design"
    | "documentation"
    | "project-management";
  skill: TechStack;
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
}

// ============= SKILL PROFILE EXAMPLE =============
export interface UserTechProfile {
  primaryStack: TechStack[];
  secondaryStack?: TechStack[];
  learning?: TechStack[];
  categorizedSkills?: TechStackCategory[];
}
