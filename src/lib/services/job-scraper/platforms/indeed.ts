import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      "#jobDescriptionText, [data-testid='jobsearch-JobComponent']",
      { timeout: 10_000 },
    );
  } catch {
    await page.waitForTimeout(3000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  const title =
    root.querySelector(".jobsearch-JobInfoHeader-title")?.textContent ??
    root.querySelector("h1")?.textContent ??
    "";

  const company =
    root.querySelector(".jobsearch-CompanyInfoContainer")?.textContent ??
    root.querySelector("[data-testid='inlineHeader-companyName']")
      ?.textContent ??
    "";

  const description =
    root.querySelector("#jobDescriptionText")?.innerHTML ??
    root.querySelector(".jobsearch-JobComponent-description")?.innerHTML ??
    "";

  const location =
    root.querySelector("[data-testid='inlineHeader-companyLocation']")
      ?.textContent ??
    root.querySelector(".jobsearch-JobInfoHeader-subtitle")?.textContent ??
    "";

  return assembleJobText({
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    description,
  });
}
