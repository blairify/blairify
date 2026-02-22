import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      ".jobs-description, .job-view-layout, .description__text",
      { timeout: 10_000 },
    );
  } catch {
    await page.waitForTimeout(3000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  const title =
    root.querySelector(".job-details-jobs-unified-top-card__job-title")
      ?.textContent ??
    root.querySelector(".jobs-unified-top-card__job-title")?.textContent ??
    root.querySelector("h1")?.textContent ??
    "";

  const company =
    root.querySelector(".jobs-unified-top-card__company-name")?.textContent ??
    root.querySelector(".job-details-jobs-unified-top-card__company-name")
      ?.textContent ??
    "";

  const description =
    root.querySelector(".jobs-description__content")?.innerHTML ??
    root.querySelector(".jobs-description")?.innerHTML ??
    root.querySelector(".description__text")?.innerHTML ??
    root.querySelector(".show-more-less-html__markup")?.innerHTML ??
    "";

  const location =
    root.querySelector(".jobs-unified-top-card__bullet")?.textContent ??
    root.querySelector(
      ".job-details-jobs-unified-top-card__primary-description-container",
    )?.textContent ??
    "";

  const partial = html.includes("Join to see full job details")
    ? "\n\n[Note: This listing may be partially visible — LinkedIn requires login for full details.]"
    : "";

  return (
    assembleJobText({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description + partial,
    }) || ""
  );
}
