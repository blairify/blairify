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
  google:
    "Focus on scalability, algorithmic thinking, and large-scale system design. Emphasize data structures and algorithms.",
  meta: "Emphasize user engagement, real-time systems, and social platform challenges. Focus on frontend and backend integration.",
  apple:
    "Focus on user experience, attention to detail, and elegant solutions. Emphasize clean code and design patterns.",
  amazon:
    "Incorporate leadership principles, customer obsession, and large-scale distributed systems.",
  netflix:
    "Focus on microservices, streaming technologies, and high-availability systems.",
  microsoft:
    "Emphasize collaboration, enterprise solutions, and cloud technologies.",
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
