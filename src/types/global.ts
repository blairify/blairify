export type PositionValue =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "mobile"
  | "data-engineer"
  | "data-scientist"
  | "cybersecurity"
  | "product"
  | "other";

export type SeniorityValue = "entry" | "junior" | "mid" | "senior";

export type CompanyProfileValue = "generic" | "faang" | "startup";

export type TechnologyValue =
  | "react"
  | "typescript"
  | "javascript"
  | "html"
  | "css"
  | "java"
  | "python"
  | "go"
  | "csharp"
  | "rust"
  | "php"
  | "docker"
  | "kubernetes"
  | "terraform"
  | "aws"
  | "gcp"
  | "azure"
  | "swift"
  | "kotlin"
  | "sql"
  | "security";

export interface CompanyContext {
  company?: string;
  companyProfile?: CompanyProfileValue;
  specificCompany?: string;
}

export interface JobContext {
  jobDescription?: string;
  jobRequirements?: string;
  jobLocation?: string;
  jobType?: string;
}
