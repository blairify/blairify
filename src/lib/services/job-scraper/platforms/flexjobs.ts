import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    await page.waitForSelector("#job-description, .job-details", {
      timeout: 10_000,
    });
  } catch {
    await page.waitForTimeout(3000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  const title = root.querySelector("h1")?.textContent ?? "";

  const company =
    root.querySelector(".company-name")?.textContent ??
    root.querySelector("[data-testid='company-name']")?.textContent ??
    "";

  const description =
    root.querySelector("#job-description")?.innerHTML ??
    root.querySelector(".job-details")?.innerHTML ??
    root.querySelector(".job-description-content")?.innerHTML ??
    "";

  const location =
    root.querySelector(".job-location")?.textContent ??
    root.querySelector("[data-testid='job-location']")?.textContent ??
    "";

  return assembleJobText({
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    description,
  });
}
