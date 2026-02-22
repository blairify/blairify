import { chromium } from "playwright";
import type { Platform, PlatformModule } from "./types";

export async function loadPlatformModule(
  platform: Platform,
): Promise<PlatformModule> {
  switch (platform) {
    case "linkedin":
      return import("./platforms/linkedin");
    case "indeed":
      return import("./platforms/indeed");
    case "justjoin":
      return import("./platforms/justjoin");
    case "google-jobs":
      return import("./platforms/google-jobs");
    case "ziprecruiter":
      return import("./platforms/ziprecruiter");
    case "flexjobs":
      return import("./platforms/flexjobs");
    case "unsupported":
      throw new Error("Unsupported platform");
    default: {
      const _never: never = platform;
      throw new Error(`Unhandled platform: ${_never}`);
    }
  }
}

export async function scrapeWithPlaywright(
  url: string,
  platform: Platform,
): Promise<string> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  try {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    } catch {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      await page.waitForTimeout(3000);
    }
    const mod = await loadPlatformModule(platform);
    await mod.wait(page);
    return await page.content();
  } finally {
    await browser.close();
  }
}
