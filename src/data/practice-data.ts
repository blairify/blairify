// Legacy compatibility layer for practice page
// This file provides the same interface as the old practice-data but uses the new comprehensive database

import {
  type Company as ComprehensiveCompany,
  type Language as ComprehensiveLanguage,
  type Question as ComprehensiveQuestion,
  getComprehensiveDatabase,
} from "./comprehensive-data-loader";

// Re-export types for backward compatibility
export type Question = ComprehensiveQuestion;
export type Language = ComprehensiveLanguage;
export type Company = ComprehensiveCompany;

export interface DocumentationLink {
  title: string;
  url: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

// Legacy data structure interface
export interface PracticeData {
  categories: Category[];
  languages: Language[];
  companies: Company[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalQuestions: number;
    totalCategories: number;
  };
}

// Get the comprehensive database and format it for the practice page
const getFormattedData = (): PracticeData => {
  const database = getComprehensiveDatabase();

  return {
    categories: database.categories,
    languages: database.languages,
    companies: database.companies,
    metadata: database.metadata,
  };
};

// Export the formatted data as default
const practiceData = getFormattedData();
export default practiceData;

// Export individual data arrays for convenience
export const { categories, languages, companies, metadata } = practiceData;
