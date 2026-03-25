const SAFE_REDIRECT_FALLBACK = "/dashboard";

export function safeRedirect(
  param: string | null,
  fallback = SAFE_REDIRECT_FALLBACK,
): string {
  if (!param) return fallback;
  if (!param.startsWith("/") || param.startsWith("//")) return fallback;

  try {
    const url = new URL(param, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
