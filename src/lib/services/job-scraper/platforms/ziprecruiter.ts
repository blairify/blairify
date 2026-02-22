import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      ".job_description, [data-testid='job-description']",
      { timeout: 10_000 },
    );
  } catch {
    await page.waitForTimeout(3000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  const title =
    root.querySelector("h1.job_title")?.textContent ??
    root.querySelector("h1")?.textContent ??
    "";

  const company =
    root.querySelector(".hiring_company_text")?.textContent ??
    root.querySelector("[data-testid='job-company']")?.textContent ??
    "";

  const description =
    root.querySelector(".job_description")?.innerHTML ??
    root.querySelector("[data-testid='job-description']")?.innerHTML ??
    "";

  const location =
    root.querySelector(".location_text")?.textContent ??
    root.querySelector("[data-testid='job-location']")?.textContent ??
    "";

  return assembleJobText({
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    description,
  });
}
