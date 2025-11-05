/**
 * Interview configuration constants and settings
 * Centralized configuration for the interview system
 */

import type {
  CompanyPrompts,
  InterviewType,
  QuestionType,
  SeniorityExpectations,
  SeniorityLevel,
} from "@/types/interview";

// Seniority Level Configurations
export const SENIORITY_EXPECTATIONS: Record<
  SeniorityLevel,
  SeniorityExpectations
> = {
  entry: {
    score: 55,
    description:
      "Entry-level candidates must demonstrate basic understanding of fundamental concepts and eagerness to learn.",
  },
  junior: {
    score: 60,
    description:
      "Junior candidates must demonstrate basic understanding of core concepts and show learning potential.",
  },
  mid: {
    score: 70,
    description:
      "Mid-level candidates must show solid technical knowledge and independent problem-solving ability.",
  },
  senior: {
    score: 80,
    description:
      "Senior candidates must demonstrate deep expertise, architectural thinking, and leadership capability.",
  },
};

export const SENIORITY_DETAILED_EXPECTATIONS: Record<SeniorityLevel, string> = {
  entry: `
- **Technical Knowledge**: Foundational understanding of programming concepts and basic syntax
- **Problem Solving**: Can solve simple problems with clear instructions
- **Communication**: Can articulate basic technical concepts and ask clarifying questions
- **Learning**: Demonstrates strong willingness to learn and adapt
- **Examples**: Focus on coursework, personal projects, bootcamp assignments, or internship work`,

  junior: `
- **Technical Knowledge**: Basic understanding of core concepts and technologies
- **Problem Solving**: Can solve straightforward problems with guidance
- **Communication**: Can explain their thinking process clearly
- **Learning**: Shows eagerness to learn and asks thoughtful questions
- **Examples**: Focus on academic projects, tutorials, or simple implementations`,

  mid: `
- **Technical Knowledge**: Solid understanding of frameworks, tools, and best practices
- **Problem Solving**: Can independently solve complex problems and consider trade-offs
- **Communication**: Can explain technical decisions and their reasoning
- **Experience**: 2-5 years of practical experience with real-world applications
- **Examples**: Focus on production systems, optimization, and architectural decisions`,

  senior: `
- **Technical Leadership**: Deep expertise in technologies and ability to guide technical decisions
- **System Design**: Can design scalable, maintainable systems and consider non-functional requirements
- **Communication**: Can mentor others and communicate complex concepts to various audiences
- **Business Impact**: Understands how technical decisions affect business outcomes
- **Examples**: Focus on system architecture, team leadership, and strategic technical initiatives`,
};

// Company-Specific Prompts
export const COMPANY_PROMPTS: CompanyPrompts = {
  // 🏆 Top-tier, ultra-competitive & high-paying
  google:
    "Focus on scalability, algorithmic thinking, and large-scale system design. Emphasize data structures and algorithms.",
  openai:
    "Focus on AI research, large language models, and API design. Emphasize machine learning and NLP.",
  apple:
    "Focus on user experience, attention to detail, and elegant solutions. Emphasize clean code and design patterns.",
  meta: "Emphasize user engagement, real-time systems, and social platform challenges. Focus on frontend and backend integration.",
  amazon:
    "Incorporate leadership principles, customer obsession, and large-scale distributed systems.",
  microsoft:
    "Emphasize collaboration, enterprise solutions, and cloud technologies.",
  nvidia:
    "Emphasize GPU computing, CUDA programming, and AI hardware optimization. Focus on parallel processing.",
  stripe:
    "Focus on API design, payment processing, and developer experience. Emphasize reliability and financial compliance.",
  tesla:
    "Focus on embedded software, autonomous systems, and real-time control. Emphasize safety-critical systems.",
  netflix:
    "Focus on microservices, streaming technologies, and high-availability systems.",

  // 💎 High-paying, prestigious tech & data companies
  anthropic:
    "Emphasize AI safety, responsible AI development, and large language model research.",
  palantir:
    "Focus on data analytics, government systems, and large-scale data processing. Emphasize security and privacy.",
  databricks:
    "Focus on big data processing, machine learning pipelines, and data engineering. Emphasize Spark and analytics.",
  snowflake:
    "Emphasize cloud data warehousing, data sharing, and analytics. Focus on SQL optimization and data architecture.",
  cloudflare:
    "Emphasize edge computing, CDN technologies, and web security. Focus on performance and distributed systems.",
  figma:
    "Focus on collaborative design, real-time synchronization, and design systems. Emphasize frontend and UX.",
  github:
    "Focus on developer collaboration, version control, and CI/CD. Emphasize Git workflows and developer experience.",

  // 💰 Well-known, solid compensation & impact
  uber: "Focus on real-time systems, geolocation, and optimization algorithms. Emphasize scalability and logistics.",
  airbnb:
    "Emphasize marketplace trust systems, booking platforms, and user experience. Focus on two-sided markets.",
  spotify:
    "Focus on audio streaming, recommendation systems, and music technology. Emphasize personalization and big data.",
  atlassian:
    "Focus on team collaboration, project management, and developer tools. Emphasize Jira and Confluence ecosystems.",
  elastic:
    "Emphasize search technologies, observability, and distributed systems. Focus on Elasticsearch and logging.",
  shopify:
    "Focus on e-commerce platforms, merchant services, and scalable commerce solutions. Emphasize API design.",
  deepl:
    "Focus on AI translation, natural language processing, and machine learning. Emphasize linguistic accuracy.",
  klarna:
    "Emphasize buy-now-pay-later systems, risk assessment, and consumer fintech. Focus on payment processing.",
  revolut:
    "Emphasize fintech innovation, banking as a service, and regulatory compliance. Focus on scalable financial systems.",
  plandek:
    "Focus on software development analytics, engineering metrics, and data-driven insights for development teams.",
  gamingrealms:
    "Focus on gaming systems, real-time multiplayer architecture, and scalable game backend development.",
  blik: "Emphasize payment gateway systems, financial transaction processing, and secure payment infrastructure.",
  wise: "Focus on international money transfers, currency exchange, and cost-effective financial solutions.",

  // ⚙️ Stable, mid-sized, respected companies
  twilio:
    "Emphasize communications APIs, messaging systems, and telephony. Focus on real-time communications.",
  zapier:
    "Focus on workflow automation, API integrations, and no-code solutions. Emphasize system integrations.",
  canva:
    "Emphasize design SaaS, frontend engineering, and user-friendly interfaces. Focus on creative tools.",
  notion:
    "Focus on knowledge management, collaborative editing, and productivity tools. Emphasize real-time collaboration.",
  sap: "Focus on enterprise software, ERP systems, and business applications. Emphasize large-scale enterprise solutions.",
  dassault:
    "Emphasize 3D design software, PLM systems, and engineering simulations. Focus on CAD and manufacturing.",
  qualcomm:
    "Emphasize mobile chipsets, wireless technologies, and embedded systems. Focus on IoT and 5G.",
  nokia:
    "Focus on telecommunications, 5G networks, and embedded systems. Emphasize network infrastructure.",
  softteco:
    "Focus on software development consulting, custom solutions, and client-focused engineering. Emphasize full-stack development.",
  allegro:
    "Emphasize marketplace optimization, e-commerce systems, and large-scale transaction processing.",
};

// Question Type Mappings
export const QUESTION_TYPE_MAPPINGS: Record<InterviewType, QuestionType[]> = {
  technical: ["conceptual", "practical", "architectural", "debugging"],
  bullet: ["core-concept", "quick-assessment", "essential-skill"],
  coding: ["algorithms", "data-structures", "optimization", "implementation"],
  "system-design": ["architecture", "scalability", "trade-offs", "components"],
};

// Interview Mode Configurations
export const MODE_SPECIFIC_CONFIGS = {
  timed: {
    maxDuration: 60, // minutes
    questionTimeout: 5, // minutes per question
    allowPause: true,
  },
  untimed: {
    maxDuration: Infinity,
    questionTimeout: Infinity,
    allowPause: true,
  },
  bullet: {
    maxDuration: 15,
    questionTimeout: 3,
    allowPause: false,
    maxQuestions: 3,
  },
  whiteboard: {
    maxDuration: 45,
    questionTimeout: 15,
    allowPause: true,
    requiresVisual: true,
  },
} as const;

// Response Validation Patterns
export const VALIDATION_PATTERNS = {
  noAnswer: [
    /^\s*\[question skipped\]\s*$/i,
    /^\s*skip(?:ped)?\s*$/i,
    /^\s*pass\s*$/i,
    /^\s*next\s*$/i,
    /^\s*i\s*don'?t\s*know\s*\.?$/i,
    /^\s*idk\s*\.?$/i,
    /^\s*dunno\s*\.?$/i,
    /^\s*no\s*idea\s*\.?$/i,
    /^\s*not\s*sure\s*\.?$/i,
    /^\s*i'?m\s*not\s*sure\s*\.?$/i,
    /^\s*i\s*have\s*no\s*idea\s*\.?$/i,
    /^\s*don'?t\s*know\s*\.?$/i,
    /^\s*no\s*clue\s*\.?$/i,
    /^\s*unsure\s*\.?$/i,
    /^\s*unknown\s*\.?$/i,
    /^\s*maybe\s*\.?$/i,
    /^\s*perhaps\s*\.?$/i,
    /^\s*possibly\s*\.?$/i,
    /^\s*i\s*think\s*\.?$/i,
    /^\s*not\s*really\s*\.?$/i,
    /^\s*kind\s*of\s*\.?$/i,
    /^\s*sort\s*of\s*\.?$/i,
    /^\s*um+\s*\.?$/i,
    /^\s*uh+\s*\.?$/i,
    /^\s*er+\s*\.?$/i,
    /^\s*hmm+\s*\.?$/i,
    /^\s*well+\s*\.?$/i,
    /^\s*\.+\s*$/,
    /^\s*\?+\s*$/,
  ],

  gibberish: [
    /^(.)\1{5,}$/,
    /^[^a-zA-Z0-9\s]{5,}$/,
    /^\s*lol+\s*$/i,
    /^\s*haha+\s*$/i,
    /^\s*ok+\s*$/i,
    /^\s*okay+\s*$/i,
    /^\s*yes\s*$/i,
    /^\s*no\s*$/i,
    /^\s*nope\s*$/i,
    /^\s*yep\s*$/i,
    /^\s*sure\s*$/i,
    /^\s*fine\s*$/i,
    /^\s*whatever\s*$/i,
    /^[0-9]+$/,
    /^[a-z]$/,
  ],

  inappropriate: [
    /I cannot help with that/i,
    /I'm not able to assist/i,
    /This violates/i,
    /I can't provide/i,
    /As an AI/i,
  ],
};

// Scoring Thresholds
export const SCORING_THRESHOLDS = {
  minResponseLength: 20,
  minWordCount: 4,
  maxResponseLength: 2000,
  maxSentences: 8,

  qualityScoreWeights: {
    substantiveResponse: 2,
    hasCodeExample: 2,
    hasExplanation: 2,
    mentionsTechnology: 1,
    appropriateLength: 1,
  },

  followUpScoreThreshold: 2,
  maxConsecutiveFollowUps: 2,
} as const;

// Default Interview Settings
export const DEFAULT_INTERVIEW_CONFIG = {
  totalQuestions: {
    demo: 3,
    bullet: 3,
    technical: 8,
    coding: 6,
    "system-design": 5,
  },

  defaultDurations: {
    timed: 30,
    untimed: Infinity,
    bullet: 15,
    whiteboard: 45,
  },
} as const;
