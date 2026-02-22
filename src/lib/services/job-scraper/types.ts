import type { Page } from "playwright";

export interface PlatformModule {
  wait: (page: Page) => Promise<void>;
  extractText: (html: string) => string;
}

export type Platform =
  | "linkedin"
  | "indeed"
  | "justjoin"
  | "google-jobs"
  | "ziprecruiter"
  | "flexjobs"
  | "unsupported";
