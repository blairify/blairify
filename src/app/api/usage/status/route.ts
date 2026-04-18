import { type NextRequest, NextResponse } from "next/server";
import { getUsageStatus } from "@/lib/services/users/usage-limits.server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { success: false, error: "Missing uid" },
      { status: 400 },
    );
  }

  const status = await getUsageStatus(uid);

  return NextResponse.json({ success: true, ...status });
}
