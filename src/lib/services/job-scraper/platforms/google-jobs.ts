import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    // Google Careers SPA: wait for job detail content to render
    await page.waitForSelector(
      "[data-id='job-detail'], .gc-card, .VfPpkd-WsjYwc, .pE8vnd, .HBvzbc, h2",
      { timeout: 15_000 },
    );
    // Extra wait for SPA hydration
    await page.waitForTimeout(3000);
  } catch {
    await page.waitForTimeout(5000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  // google.com/about/careers uses different selectors than jobs.google.com
  const title =
    root.querySelector("h2.p1N2lc")?.textContent ??
    root.querySelector("[data-id='job-detail'] h2")?.textContent ??
    root.querySelector(".KLsYvd, h2.p6N3Vb")?.textContent ??
    root.querySelector("h2")?.textContent ??
    "";

  const company = "Google";

  const descriptionEl =
    root.querySelector("[data-id='job-detail']") ??
    root.querySelector(".gc-card__content") ??
    root.querySelector(".HBvzbc, .YgLbBe") ??
    root.querySelector(".description");

  const description = descriptionEl?.innerHTML ?? "";

  const location =
    root.querySelector(".pwO9Dc")?.textContent ??
    root.querySelector(".sMzDkb")?.textContent ??
    root.querySelector(".location")?.textContent ??
    "";

  // Google Careers pages are heavy SPAs — if selectors fail, try extracting
  // all visible text from the main content area as a fallback
  if (!description.trim()) {
    const mainContent =
      root.querySelector("main")?.textContent ??
      root.querySelector("[role='main']")?.textContent ??
      root.querySelector("body")?.textContent ??
      "";

    const cleaned = mainContent
      .replace(/\s{2,}/g, "\n")
      .trim()
      .slice(0, 8000);

    if (cleaned.length > 100) {
      return assembleJobText({
        title: title.trim(),
        company,
        location: location.trim(),
        description: cleaned,
      });
    }
  }

  return assembleJobText({
    title: title.trim(),
    company,
    location: location.trim(),
    description,
  });
}
