import { parse } from "node-html-parser";
import type { Page } from "playwright";
import { assembleJobText } from "../assemble";

export async function wait(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      "[data-testid='job-offer-description'], .css-1wbz3t9",
      { timeout: 10_000 },
    );
  } catch {
    await page.waitForTimeout(3000);
  }
}

export function extractText(html: string): string {
  const root = parse(html);

  const title = root.querySelector("h1")?.textContent ?? "";

  const company =
    root.querySelector("[data-testid='text-company-name']")?.textContent ??
    root.querySelector(".css-1x9zltl")?.textContent ??
    "";

  const description =
    root.querySelector("[data-testid='job-offer-description']")?.innerHTML ??
    root.querySelector(".css-1wbz3t9")?.innerHTML ??
    "";

  const chips = root
    .querySelectorAll("[data-testid='chip'], .css-1eroaag")
    .map((el) => el.textContent.trim())
    .filter(Boolean);

  const technologies = chips.length > 0 ? chips.join(", ") : undefined;

  const location =
    root.querySelector("[data-testid='text-location']")?.textContent ??
    root.querySelector(".css-1o4wo1x")?.textContent ??
    "";

  return assembleJobText({
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    description,
    technologies,
  });
}
