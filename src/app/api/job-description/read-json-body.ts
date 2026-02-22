import type { NextRequest } from "next/server";

type AnyRequest = NextRequest | Request;

export async function readJsonBody(request: AnyRequest): Promise<unknown> {
  const candidate = request as {
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
  };

  if (typeof candidate.json === "function") {
    return candidate.json();
  }

  if (typeof candidate.text === "function") {
    const raw = await candidate.text();
    return raw ? JSON.parse(raw) : {};
  }

  throw new Error("UNSUPPORTED_BODY");
}
