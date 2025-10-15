// Comprehensive Interview Database - TypeScript Data Loader
// This module loads and combines all modular data files for the comprehensive interview database

import companies from "./companies-comprehensive.json";
import difficultyLevels from "./difficulty-levels.json";
import interviewFormats from "./interview-formats.json";
// Import metadata
import languages from "./languages-comprehensive.json";
import metadata from "./metadata.json";
import assessmentCriteria from "./professional/assessment-criteria.json";
import careerPaths from "./professional/career-paths.json";
import commonMistakes from "./professional/common-mistakes.json";
import continuousLearning from "./professional/continuous-learning.json";
import industryTrends from "./professional/industry-trends.json";
import interviewQuestionTemplates from "./professional/interview-question-templates.json";
import interviewTips from "./professional/interview-tips.json";
import negotiationTips from "./professional/negotiation-tips.json";
import onboardingChecklist from "./professional/onboarding-checklist.json";
import preparationResources from "./professional/preparation-resources.json";
import remoteWorkTips from "./professional/remote-work-tips.json";
// Import professional development content
import salaryRanges from "./professional/salary-ranges.json";
import backendQuestions from "./questions/backend-comprehensive.json";
import frontendQuestions from "./questions/frontend-comprehensive.json";
import mobileQuestions from "./questions/mobile-comprehensive.json";
import systemDesignQuestions from "./questions/system-design-comprehensive.json";
// Import all question categories
import technicalQuestions from "./questions/technical-comprehensive.json";
import tags from "./tags.json";

// TypeScript Interfaces
export interface Question {
  id: string;
  title: string;
  question: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  company: string;
  language: string;
  tags: string[];
  documentationLinks: {
    title: string;
    url: string;
    description: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Language {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  headquarters: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  color: string;
  description: string;
  experienceRange: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface InterviewFormat {
  id: string;
  name: string;
  description: string;
  duration: string;
  tools: string[];
}

export interface Metadata {
  version: string;
  lastUpdated: string;
  totalQuestions: number;
  totalCategories: number;
}

export interface SalaryRange {
  byLevel: {
    [key: string]: {
      title: string;
      ranges: {
        [role: string]: string;
      };
    };
  };
  byCompany: {
    [key: string]: {
      name: string;
      multiplier: number;
      description: string;
    };
  };
}

export interface CareerPath {
  path: string;
  levels: {
    level: string;
    years: string;
    responsibilities: string[];
    skills: string[];
  }[];
}

export interface InterviewTips {
  preparation: string[];
  duringInterview: string[];
  systemDesign: string[];
  behavioral: string[];
}

export interface AssessmentCriteria {
  coding: {
    [key: string]: {
      weight: number;
      description: string;
    };
  };
  systemDesign: {
    [key: string]: {
      weight: number;
      description: string;
    };
  };
}

export interface CommonMistakes {
  coding: string[];
  systemDesign: string[];
  behavioral: string[];
}

export interface NegotiationTips {
  preparation: string[];
  strategy: string[];
  commonElements: {
    element: string;
    negotiable: string;
    tips: string;
  }[];
}

export interface PreparationResource {
  category: string;
  resources: {
    title: string;
    author?: string;
    provider?: string;
    description: string;
    url: string;
    features?: string[];
  }[];
}

export interface IndustryTrend {
  [year: string]: {
    trend: string;
    description: string;
    impact: string;
    skills: string[];
  }[];
}

export interface OnboardingChecklist {
  beforeStarting: string[];
  firstWeek: string[];
  first30Days: string[];
  first90Days: string[];
}

export interface ContinuousLearning {
  technicalSkills: {
    category: string;
    recommendation: string;
    resources: string[];
  }[];
  softSkills: {
    skill: string;
    importance: string;
    development: string[];
  }[];
}

export interface RemoteWorkTips {
  setup: string[];
  productivity: string[];
  collaboration: string[];
}

export interface InterviewQuestionTemplate {
  behavioral: {
    question: string;
    followups: string[];
    lookingFor: string[];
  }[];
  technical: {
    question: string;
    followups: string[];
    lookingFor: string[];
  }[];
}

// Comprehensive Database Interface
export interface ComprehensiveDatabase {
  categories: Category[];
  languages: Language[];
  companies: Company[];
  difficultyLevels: DifficultyLevel[];
  tags: Tag[];
  interviewFormats: InterviewFormat[];
  metadata: Metadata;
  salaryRanges: SalaryRange;
  careerPaths: CareerPath[];
  interviewTips: InterviewTips;
  assessmentCriteria: AssessmentCriteria;
  commonMistakes: CommonMistakes;
  negotiationTips: NegotiationTips;
  preparationResources: PreparationResource[];
  industryTrends: IndustryTrend;
  onboardingChecklist: OnboardingChecklist;
  continuousLearning: ContinuousLearning;
  remoteWorkTips: RemoteWorkTips;
  interviewQuestionTemplates: InterviewQuestionTemplate;
}

// Data Assembly Function
export const getComprehensiveDatabase = (): ComprehensiveDatabase => {
  // Assemble categories with their questions
  const categories: Category[] = [
    {
      id: "technical",
      name: "Technical Skills",
      description: "Core technical programming and system design questions",
      questions: technicalQuestions as Question[],
    },
    {
      id: "system-design",
      name: "System Design",
      description: "Large-scale architecture and distributed systems questions",
      questions: systemDesignQuestions as Question[],
    },
    {
      id: "frontend",
      name: "Frontend Development",
      description:
        "User interface, web technologies, and client-side development",
      questions: frontendQuestions as Question[],
    },
    {
      id: "backend",
      name: "Backend Development",
      description: "Server-side development, APIs, and data management",
      questions: backendQuestions as Question[],
    },
    {
      id: "mobile",
      name: "Mobile Development",
      description: "iOS, Android, and cross-platform mobile development",
      questions: mobileQuestions as Question[],
    },
  ];

  return {
    categories,
    languages: languages as Language[],
    companies: companies as Company[],
    difficultyLevels: difficultyLevels as DifficultyLevel[],
    tags: tags as Tag[],
    interviewFormats: interviewFormats as InterviewFormat[],
    metadata: metadata as Metadata,
    salaryRanges: salaryRanges as SalaryRange,
    careerPaths: careerPaths as CareerPath[],
    interviewTips: interviewTips as InterviewTips,
    assessmentCriteria: assessmentCriteria as AssessmentCriteria,
    commonMistakes: commonMistakes as CommonMistakes,
    negotiationTips: negotiationTips as NegotiationTips,
    preparationResources: preparationResources as PreparationResource[],
    industryTrends: industryTrends as IndustryTrend,
    onboardingChecklist: onboardingChecklist as OnboardingChecklist,
    continuousLearning: continuousLearning as ContinuousLearning,
    remoteWorkTips: remoteWorkTips as RemoteWorkTips,
    interviewQuestionTemplates:
      interviewQuestionTemplates as InterviewQuestionTemplate,
  };
};

// Utility Functions
export const getAllQuestions = (): Question[] => {
  const database = getComprehensiveDatabase();
  return database.categories.flatMap((category) => category.questions);
};

export const getQuestionsByCategory = (categoryId: string): Question[] => {
  const database = getComprehensiveDatabase();
  const category = database.categories.find((cat) => cat.id === categoryId);
  return category ? category.questions : [];
};

export const getQuestionsByDifficulty = (difficulty: string): Question[] => {
  const allQuestions = getAllQuestions();
  return allQuestions.filter((question) => question.difficulty === difficulty);
};

export const getQuestionsByCompany = (companyId: string): Question[] => {
  const allQuestions = getAllQuestions();
  return allQuestions.filter((question) => question.company === companyId);
};

export const getQuestionsByLanguage = (languageId: string): Question[] => {
  const allQuestions = getAllQuestions();
  return allQuestions.filter((question) => question.language === languageId);
};

export const getQuestionsByTag = (tagId: string): Question[] => {
  const allQuestions = getAllQuestions();
  return allQuestions.filter((question) => question.tags.includes(tagId));
};

export const searchQuestions = (searchTerm: string): Question[] => {
  const allQuestions = getAllQuestions();
  const lowercaseSearch = searchTerm.toLowerCase();

  return allQuestions.filter(
    (question) =>
      question.title.toLowerCase().includes(lowercaseSearch) ||
      question.question.toLowerCase().includes(lowercaseSearch) ||
      question.tags.some((tag) => tag.toLowerCase().includes(lowercaseSearch)),
  );
};

// Statistics Functions
export const getDatabaseStats = () => {
  const database = getComprehensiveDatabase();
  const allQuestions = getAllQuestions();

  return {
    totalQuestions: allQuestions.length,
    totalCategories: database.categories.length,
    totalLanguages: database.languages.length,
    totalCompanies: database.companies.length,
    questionsByDifficulty: {
      beginner: getQuestionsByDifficulty("beginner").length,
      intermediate: getQuestionsByDifficulty("intermediate").length,
      advanced: getQuestionsByDifficulty("advanced").length,
      expert: getQuestionsByDifficulty("expert").length,
    },
    questionsByCategory: database.categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: category.questions.length,
    })),
  };
};

// Export the default database instance
export default getComprehensiveDatabase;
