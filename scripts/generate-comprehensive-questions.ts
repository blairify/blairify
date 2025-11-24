#!/usr/bin/env npx ts-node

/**
 * Comprehensive Question Generator for All Companies and Positions
 * Generates 2000+ questions covering all companies and positions
 * Run: npx ts-node scripts/generate-comprehensive-questions.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase initialization is done lazily inside main() to allow importing
// generation utilities without requiring credentials.

export interface PracticeQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyLogo: string;
  companySize: string[];
  primaryTechStack: string[];
  title: string;
  question: string;
  answer: string;
  topicTags: string[];
  seniorityLevel?: string[];
  companyName?: string;
  position?: string;
}

// All companies from your list
const companies = [
  {
    logo: "SiAdyen",
    name: "Adyen",
    size: ["fintech"],
    focus: ["payments", "api-design", "financial-compliance"],
  },
  {
    logo: "SiAirbnb",
    name: "Airbnb",
    size: ["unicorn"],
    focus: ["marketplace", "scalability", "user-experience"],
  },
  {
    logo: "SiAllegro",
    name: "Allegro",
    size: ["ecommerce"],
    focus: ["marketplace", "performance", "microservices"],
  },
  {
    logo: "SiAmazon",
    name: "Amazon",
    size: ["faang"],
    focus: ["scale", "distributed-systems", "leadership-principles"],
  },
  {
    logo: "SiApple",
    name: "Apple",
    size: ["faang"],
    focus: ["performance", "user-experience", "hardware-software"],
  },
  {
    logo: "SiAtlassian",
    name: "Atlassian",
    size: ["enterprise"],
    focus: ["collaboration", "developer-tools", "agile"],
  },
  {
    logo: "SiCanva",
    name: "Canva",
    size: ["unicorn"],
    focus: ["design-tools", "performance", "user-experience"],
  },
  {
    logo: "SiCloudflare",
    name: "Cloudflare",
    size: ["infrastructure"],
    focus: ["networking", "security", "edge-computing"],
  },
  {
    logo: "SiDassaultsystemes",
    name: "Dassault",
    size: ["enterprise"],
    focus: ["3d-modeling", "simulation", "engineering"],
  },
  {
    logo: "SiDatabricks",
    name: "Databricks",
    size: ["data"],
    focus: ["big-data", "machine-learning", "analytics"],
  },
  {
    logo: "SiDeepl",
    name: "DeepL",
    size: ["ai"],
    focus: ["nlp", "machine-learning", "translation"],
  },
  {
    logo: "SiElasticsearch",
    name: "Elastic",
    size: ["data"],
    focus: ["search", "analytics", "observability"],
  },
  {
    logo: "SiFigma",
    name: "Figma",
    size: ["design"],
    focus: ["design-tools", "collaboration", "real-time"],
  },
  {
    logo: "SiGithub",
    name: "GitHub",
    size: ["developer-tools"],
    focus: ["version-control", "collaboration", "devops"],
  },
  {
    logo: "SiGoogle",
    name: "Google",
    size: ["faang"],
    focus: ["algorithms", "scale", "innovation"],
  },
  {
    logo: "SiKlarna",
    name: "Klarna",
    size: ["fintech"],
    focus: ["payments", "mobile", "user-experience"],
  },
  {
    logo: "SiMeta",
    name: "Meta",
    size: ["faang"],
    focus: ["social-media", "scale", "real-time"],
  },
  {
    logo: "SiNetflix",
    name: "Netflix",
    size: ["faang"],
    focus: ["streaming", "microservices", "personalization"],
  },
  {
    logo: "SiNokia",
    name: "Nokia",
    size: ["telecom"],
    focus: ["networking", "5g", "embedded-systems"],
  },
  {
    logo: "SiNotion",
    name: "Notion",
    size: ["productivity"],
    focus: ["collaboration", "real-time", "user-experience"],
  },
  {
    logo: "SiNvidia",
    name: "NVIDIA",
    size: ["hardware"],
    focus: ["gpu-computing", "ai", "parallel-processing"],
  },
  {
    logo: "SiOpenai",
    name: "OpenAI",
    size: ["ai"],
    focus: ["machine-learning", "nlp", "research"],
  },
  {
    logo: "SiPalantir",
    name: "Palantir",
    size: ["data"],
    focus: ["big-data", "analytics", "government"],
  },
  {
    logo: "SiQualcomm",
    name: "Qualcomm",
    size: ["hardware"],
    focus: ["mobile", "5g", "embedded-systems"],
  },
  {
    logo: "SiRevolut",
    name: "Revolut",
    size: ["fintech"],
    focus: ["mobile-banking", "real-time", "compliance"],
  },
  {
    logo: "SiSap",
    name: "SAP",
    size: ["enterprise"],
    focus: ["erp", "enterprise-software", "databases"],
  },
  {
    logo: "SiShopify",
    name: "Shopify",
    size: ["ecommerce"],
    focus: ["ecommerce", "scalability", "merchant-tools"],
  },
  {
    logo: "SiSnowflake",
    name: "Snowflake",
    size: ["data"],
    focus: ["data-warehouse", "cloud", "analytics"],
  },
  {
    logo: "SiSpotify",
    name: "Spotify",
    size: ["media"],
    focus: ["streaming", "recommendation", "real-time"],
  },
  {
    logo: "SiStripe",
    name: "Stripe",
    size: ["fintech"],
    focus: ["payments", "api-design", "developer-experience"],
  },
  {
    logo: "SiTesla",
    name: "Tesla",
    size: ["automotive"],
    focus: ["embedded-systems", "real-time", "automation"],
  },
  {
    logo: "SiTwilio",
    name: "Twilio",
    size: ["communication"],
    focus: ["api-design", "real-time", "communication"],
  },
  {
    logo: "SiUber",
    name: "Uber",
    size: ["mobility"],
    focus: ["real-time", "geolocation", "optimization"],
  },
  {
    logo: "SiWise",
    name: "Wise",
    size: ["fintech"],
    focus: ["international-payments", "compliance", "cost-optimization"],
  },
  {
    logo: "SiZapier",
    name: "Zapier",
    size: ["automation"],
    focus: ["integrations", "automation", "api-design"],
  },
];

// All positions from configure
const positions = [
  {
    value: "frontend",
    label: "Frontend Developer",
    skills: ["react", "javascript", "css", "html", "typescript"],
  },
  {
    value: "backend",
    label: "Backend Developer",
    skills: ["node.js", "python", "java", "databases", "api-design"],
  },
  {
    value: "fullstack",
    label: "Full Stack Developer",
    skills: ["react", "node.js", "databases", "api-design", "typescript"],
  },
  {
    value: "devops",
    label: "DevOps Engineer",
    skills: ["docker", "kubernetes", "aws", "ci-cd", "monitoring"],
  },
  {
    value: "mobile",
    label: "Mobile Developer",
    skills: ["react-native", "swift", "kotlin", "mobile-ui", "performance"],
  },
  {
    value: "data",
    label: "Data Engineer",
    skills: ["python", "sql", "spark", "airflow", "data-pipelines"],
  },
  {
    value: "data-scientist",
    label: "Data Scientist",
    skills: [
      "python",
      "machine-learning",
      "statistics",
      "pandas",
      "visualization",
    ],
  },
  {
    value: "cybersecurity",
    label: "Cybersecurity Engineer",
    skills: [
      "security",
      "penetration-testing",
      "compliance",
      "incident-response",
    ],
  },

  {
    value: "product-manager",
    label: "Product Manager",
    skills: ["product-strategy", "user-research", "analytics", "roadmapping"],
  },
];

// Question templates by category
const questionTemplates: {
  [key: string]: Array<{
    title: string;
    question: string;
    answer: string;
    tags: string[];
    difficulty: "easy" | "medium" | "hard";
  }>;
} = {
  algorithms: [
    {
      title: "Two Sum Problem",
      question:
        "Given an array of integers and a target sum, find two numbers that add up to the target. Return their indices.",
      answer:
        "Use a hash map to store value->index pairs. For each number, check if (target - number) exists in the map. O(n) time, O(n) space.",
      tags: ["arrays", "hash-map", "two-pointers"],
      difficulty: "easy" as const,
    },
    {
      title: "Binary Tree Traversal",
      question:
        "Implement inorder, preorder, and postorder traversal of a binary tree both recursively and iteratively.",
      answer:
        "Recursive: straightforward with base case. Iterative: use stack for DFS traversals. Inorder: left->root->right. Preorder: root->left->right. Postorder: left->right->root.",
      tags: ["trees", "traversal", "recursion", "stack"],
      difficulty: "medium" as const,
    },
    {
      title: "Longest Increasing Subsequence",
      question:
        "Find the length of the longest strictly increasing subsequence in an array.",
      answer:
        "Dynamic Programming: dp[i] = length of LIS ending at i. For each i, check all j < i where arr[j] < arr[i]. O(n²) time. Optimized with binary search: O(n log n).",
      tags: ["dynamic-programming", "binary-search", "subsequence"],
      difficulty: "hard" as const,
    },
  ],

  "system-design": [
    {
      title: "Design a URL Shortener",
      question:
        "Design a system like bit.ly that shortens URLs. Handle 100M URLs per day with 100:1 read/write ratio.",
      answer:
        "Components: Load balancer, app servers, cache (Redis), database (sharded). Base62 encoding for short URLs. Cache popular URLs. Use CDN for global distribution. Database sharding by URL hash.",
      tags: ["system-design", "scalability", "caching", "databases"],
      difficulty: "medium" as const,
    },
    {
      title: "Design a Chat System",
      question:
        "Design a real-time chat system like WhatsApp. Support 1B users with message delivery, online presence, and group chats.",
      answer:
        "WebSocket connections for real-time messaging. Message queue (Kafka) for reliability. Database sharding by user_id. Redis for presence/online status. Push notifications for offline users. CDN for media files.",
      tags: ["system-design", "real-time", "websockets", "messaging"],
      difficulty: "hard" as const,
    },
    {
      title: "Design a Recommendation System",
      question:
        "Design a recommendation system for an e-commerce platform. Handle user preferences, item similarity, and real-time updates.",
      answer:
        "Collaborative filtering + content-based filtering. ML pipeline with Spark for batch processing. Real-time feature store. A/B testing framework. Cold start problem solutions. Feedback loops for model improvement.",
      tags: [
        "system-design",
        "machine-learning",
        "recommendations",
        "real-time",
      ],
      difficulty: "hard" as const,
    },
  ],

  frontend: [
    {
      title: "React Component Optimization",
      question:
        "How would you optimize a React component that renders a large list of items? Discuss various techniques.",
      answer:
        "Use React.memo for pure components, useMemo/useCallback for expensive calculations, virtualization for large lists (react-window), lazy loading, code splitting, and proper key props. Avoid inline objects/functions in render.",
      tags: ["react", "performance", "optimization", "virtualization"],
      difficulty: "medium" as const,
    },
    {
      title: "CSS Layout Challenge",
      question:
        "Create a responsive layout with a fixed header, sidebar, and main content area that adapts to different screen sizes.",
      answer:
        "Use CSS Grid or Flexbox. Grid: define grid-template-areas and grid-template-rows/columns. Use media queries for responsive breakpoints. Consider mobile-first approach with progressive enhancement.",
      tags: ["css", "responsive-design", "grid", "flexbox"],
      difficulty: "easy" as const,
    },
    {
      title: "State Management Architecture",
      question:
        "Design a state management solution for a complex React application with multiple data sources and real-time updates.",
      answer:
        "Consider Redux Toolkit for complex state, Context API for simple state, React Query for server state, Zustand for lightweight solution. Implement optimistic updates, error boundaries, and proper data normalization.",
      tags: ["react", "state-management", "redux", "architecture"],
      difficulty: "hard" as const,
    },
  ],

  backend: [
    {
      title: "API Rate Limiting",
      question:
        "Implement a rate limiting system for an API. Support different limits per user and endpoint.",
      answer:
        "Use sliding window or token bucket algorithm. Redis for distributed rate limiting. Store counters with TTL. Consider different strategies: fixed window, sliding window, token bucket. Handle burst traffic gracefully.",
      tags: ["api-design", "rate-limiting", "redis", "algorithms"],
      difficulty: "medium" as const,
    },
    {
      title: "Database Query Optimization",
      question:
        "You have a slow query joining multiple tables. How would you optimize it?",
      answer:
        "Analyze execution plan, add proper indexes, consider query rewriting, use EXPLAIN. Check for N+1 queries, add covering indexes, consider denormalization, use query hints if needed. Monitor query performance over time.",
      tags: ["databases", "sql", "optimization", "indexing"],
      difficulty: "medium" as const,
    },
    {
      title: "Microservices Communication",
      question:
        "Design communication patterns between microservices. Handle failures, timeouts, and data consistency.",
      answer:
        "Use async messaging (Kafka/RabbitMQ) for loose coupling, REST/gRPC for sync calls. Implement circuit breakers, retries with exponential backoff, saga pattern for distributed transactions. Use service mesh for observability.",
      tags: ["microservices", "messaging", "distributed-systems", "resilience"],
      difficulty: "hard" as const,
    },
  ],

  devops: [
    {
      title: "CI/CD Pipeline Design",
      question:
        "Design a CI/CD pipeline for a microservices application with automated testing, security scanning, and deployment.",
      answer:
        "Multi-stage pipeline: code checkout, unit tests, integration tests, security scanning, build Docker images, deploy to staging, run E2E tests, deploy to production with blue-green deployment. Use GitOps for deployment automation.",
      tags: ["ci-cd", "docker", "kubernetes", "automation"],
      difficulty: "medium" as const,
    },
    {
      title: "Kubernetes Troubleshooting",
      question:
        "A pod is stuck in CrashLoopBackOff state. How would you debug and resolve this issue?",
      answer:
        "Check pod logs (kubectl logs), describe pod for events, check resource limits, verify image availability, check liveness/readiness probes, examine node resources, check RBAC permissions, verify secrets/configmaps.",
      tags: ["kubernetes", "troubleshooting", "debugging", "containers"],
      difficulty: "medium" as const,
    },
    {
      title: "Infrastructure as Code",
      question:
        "Design an IaC solution for a multi-environment application deployment (dev, staging, prod) with proper state management.",
      answer:
        "Use Terraform with separate state files per environment, implement modules for reusability, use remote state backend (S3+DynamoDB), implement proper variable management, use workspaces or separate directories, add policy as code validation.",
      tags: ["terraform", "infrastructure", "automation", "best-practices"],
      difficulty: "hard" as const,
    },
  ],

  mobile: [
    {
      title: "Mobile App Performance",
      question:
        "Your mobile app has slow startup time and laggy scrolling. How would you diagnose and fix these issues?",
      answer:
        "Profile app startup with tools like Flipper/Xcode Instruments. Optimize bundle size, lazy load components, use FlatList for large lists, optimize images, implement proper caching, reduce main thread work, use native modules for heavy computations.",
      tags: ["mobile", "performance", "optimization", "profiling"],
      difficulty: "medium" as const,
    },
    {
      title: "Offline-First Architecture",
      question:
        "Design an offline-first mobile app that syncs data when connectivity is restored.",
      answer:
        "Local database (SQLite/Realm), queue for offline actions, conflict resolution strategy, incremental sync, optimistic updates, background sync, proper error handling for sync failures, data versioning for conflict resolution.",
      tags: ["mobile", "offline", "sync", "architecture"],
      difficulty: "hard" as const,
    },
    {
      title: "Cross-Platform Development",
      question:
        "Compare React Native, Flutter, and native development. When would you choose each approach?",
      answer:
        "React Native: existing React team, rapid prototyping, good performance for most use cases. Flutter: consistent UI across platforms, high performance, growing ecosystem. Native: maximum performance, platform-specific features, existing native teams.",
      tags: ["mobile", "cross-platform", "react-native", "flutter"],
      difficulty: "easy" as const,
    },
  ],

  data: [
    {
      title: "Data Pipeline Architecture",
      question:
        "Design a real-time data pipeline that processes millions of events per second with exactly-once delivery guarantees.",
      answer:
        "Use Kafka for ingestion with proper partitioning, Spark Streaming or Flink for processing, implement idempotent operations, use transactional writes, implement proper checkpointing, monitor lag and throughput, handle backpressure.",
      tags: ["data-engineering", "streaming", "kafka", "spark"],
      difficulty: "hard" as const,
    },
    {
      title: "Data Quality Framework",
      question:
        "Implement a data quality monitoring system that detects anomalies and data drift in real-time.",
      answer:
        "Define data quality metrics (completeness, accuracy, consistency), implement statistical tests for anomaly detection, use Great Expectations for validation, set up alerting, implement data lineage tracking, automated data profiling.",
      tags: ["data-quality", "monitoring", "anomaly-detection", "validation"],
      difficulty: "medium" as const,
    },
    {
      title: "ETL vs ELT Strategy",
      question:
        "When would you choose ETL vs ELT? Design both approaches for a data warehouse project.",
      answer:
        "ETL: when transformation logic is complex, limited storage, need data validation before loading. ELT: with cloud data warehouses (Snowflake/BigQuery), when raw data needs to be preserved, faster loading, schema-on-read flexibility.",
      tags: ["data-engineering", "etl", "elt", "data-warehouse"],
      difficulty: "medium" as const,
    },
  ],
};

// Company-specific question variations
const companySpecificQuestions: {
  [key: string]: {
    focus: string[];
    questions: Array<{
      title: string;
      question: string;
      answer: string;
      tags: string[];
      difficulty: "easy" | "medium" | "hard";
    }>;
  };
} = {
  SiStripe: {
    focus: ["payments", "api-design", "financial-compliance"],
    questions: [
      {
        title: "Payment Processing System",
        question:
          "Design Stripe's payment processing system. Handle multiple payment methods, currencies, and compliance requirements.",
        answer:
          "Multi-region architecture with payment orchestration layer, support for various payment methods (cards, wallets, bank transfers), currency conversion service, compliance engine for different regions, fraud detection, webhook system for notifications.",
        tags: ["payments", "system-design", "compliance", "api-design"],
        difficulty: "hard" as const,
      },
    ],
  },
  SiUber: {
    focus: ["real-time", "geolocation", "optimization"],
    questions: [
      {
        title: "Real-time Location Tracking",
        question:
          "Design Uber's real-time location tracking system for drivers and riders with sub-second updates.",
        answer:
          "WebSocket connections for real-time updates, geospatial databases (PostGIS), location indexing with geohashing, efficient data structures for nearby driver queries, load balancing for geographic regions, mobile SDK optimization.",
        tags: ["real-time", "geolocation", "websockets", "optimization"],
        difficulty: "hard" as const,
      },
    ],
  },
  SiNetflix: {
    focus: ["streaming", "microservices", "personalization"],
    questions: [
      {
        title: "Video Streaming Architecture",
        question:
          "Design Netflix's video streaming system that serves millions of concurrent users globally.",
        answer:
          "CDN network for content delivery, adaptive bitrate streaming, microservices architecture, content encoding pipeline, recommendation system, A/B testing framework, chaos engineering for resilience.",
        tags: ["streaming", "cdn", "microservices", "scalability"],
        difficulty: "hard" as const,
      },
    ],
  },
};

// Generate questions for all combinations
export function generateComprehensiveQuestions(): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];

  companies.forEach((company) => {
    positions.forEach((position) => {
      // Get relevant question templates based on position
      const relevantCategories = getRelevantCategories(position.value);

      relevantCategories.forEach((category) => {
        const templates = questionTemplates[category] || [];

        templates.forEach((template) => {
          // Create company-specific variation
          const question: PracticeQuestion = {
            category: category,
            difficulty: template.difficulty,
            companyLogo: company.logo,
            companySize: company.size,
            primaryTechStack: position.skills,
            title: `${template.title} - ${company.name} ${position.label}`,
            question: adaptQuestionForCompany(
              template.question,
              company,
              position,
            ),
            answer: adaptAnswerForCompany(template.answer, company, position),
            topicTags: [...template.tags, ...company.focus],
            seniorityLevel: ["junior", "mid", "senior"],
            companyName: company.name,
            position: position.value,
          };

          questions.push(question);
        });
      });

      // Add company-specific questions if available
      const companySpecific = companySpecificQuestions[company.logo];
      if (companySpecific) {
        companySpecific.questions.forEach((template) => {
          const question: PracticeQuestion = {
            category: "system-design",
            difficulty: template.difficulty,
            companyLogo: company.logo,
            companySize: company.size,
            primaryTechStack: position.skills,
            title: `${template.title} - ${position.label}`,
            question: template.question,
            answer: template.answer,
            topicTags: template.tags,
            seniorityLevel: ["mid", "senior"],
            companyName: company.name,
            position: position.value,
          };

          questions.push(question);
        });
      }
    });
  });

  return questions;
}

function getRelevantCategories(position: string): string[] {
  const categoryMap: { [key: string]: string[] } = {
    frontend: ["algorithms", "frontend", "system-design"],
    backend: ["algorithms", "backend", "system-design"],
    fullstack: ["algorithms", "frontend", "backend", "system-design"],
    devops: ["algorithms", "devops", "system-design"],
    mobile: ["algorithms", "mobile", "system-design"],
    data: ["algorithms", "data", "system-design"],
    "data-scientist": ["algorithms", "data", "system-design"],
    cybersecurity: ["algorithms", "backend", "system-design"],
    "product-manager": ["system-design"],
  };

  return categoryMap[position] || ["algorithms"];
}

function adaptQuestionForCompany(
  question: string,
  company: any,
  position: any,
): string {
  // Add company context to the question
  const companyContext = company.focus.join(", ");
  return `${question} Consider ${company.name}'s focus on ${companyContext} and ${position.label} requirements.`;
}

function adaptAnswerForCompany(
  answer: string,
  company: any,
  _position: any,
): string {
  // Add company-specific considerations to the answer
  const focusArea = company.focus[0];
  const additionalContext = getCompanySpecificContext(company.name, focusArea);
  return `${answer} ${additionalContext}`;
}

function getCompanySpecificContext(
  companyName: string,
  focusArea: string,
): string {
  const contexts: { [key: string]: string } = {
    payments: `For ${companyName}, ensure PCI compliance, handle multiple currencies, and design for high availability.`,
    scalability: `At ${companyName} scale, consider horizontal scaling, caching strategies, and database sharding.`,
    "real-time": `${companyName} requires sub-second response times, so optimize for low latency and high throughput.`,
    security: `Security is paramount at ${companyName} - implement defense in depth, regular audits, and compliance frameworks.`,
    "machine-learning": `${companyName} leverages ML extensively - consider model serving, A/B testing, and continuous learning.`,
    "api-design": `${companyName} is API-first - focus on developer experience, versioning, and comprehensive documentation.`,
  };

  return (
    contexts[focusArea] ||
    `Consider ${companyName}'s specific requirements and scale.`
  );
}

// Main execution
async function main() {
  console.log(
    "🚀 Generating comprehensive questions for all companies and positions...",
  );

  let serviceAccount: any;
  try {
    const serviceAccountPath = join(
      process.cwd(),
      "scripts",
      "serviceAccounts.json",
    );
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  } catch (_error) {
    console.error("❌ Error loading service account");
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const questions = generateComprehensiveQuestions();

  console.log(`📊 Generated ${questions.length} questions`);
  console.log(`🏢 Companies: ${companies.length}`);
  console.log(`💼 Positions: ${positions.length}`);

  // Upload to Firestore in batches
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < questions.length; i += batchSize) {
    batches.push(questions.slice(i, i + batchSize));
  }

  console.log(`📦 Uploading ${batches.length} batches to Firestore...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = db.batch();
    const batchQuestions = batches[i];

    batchQuestions.forEach((question) => {
      const docRef = db.collection("practice_questions").doc();
      batch.set(docRef, {
        ...question,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await batch.commit();
    console.log(
      `✅ Uploaded batch ${i + 1}/${batches.length} (${batchQuestions.length} questions)`,
    );
  }

  console.log("🎉 Successfully uploaded all questions!");

  // Print summary
  console.log("\n📈 Summary:");
  console.log(`Total Questions: ${questions.length}`);

  const byCompany = questions.reduce(
    (acc, q) => {
      acc[q.companyName!] = (acc[q.companyName!] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number },
  );

  console.log("\nQuestions per Company:");
  Object.entries(byCompany).forEach(([company, count]) => {
    console.log(`  ${company}: ${count} questions`);
  });

  const byPosition = questions.reduce(
    (acc, q) => {
      acc[q.position!] = (acc[q.position!] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number },
  );

  console.log("\nQuestions per Position:");
  Object.entries(byPosition).forEach(([position, count]) => {
    console.log(`  ${position}: ${count} questions`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}
