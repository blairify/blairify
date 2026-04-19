import { type NextRequest, NextResponse } from "next/server";
import { findUniversityByDomain } from "@/lib/services/student/university-domains";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { domain?: string };
    const domain = body.domain?.toLowerCase().trim();

    if (!domain) {
      return NextResponse.json({ isUniversity: false });
    }

    const university = await findUniversityByDomain(domain);
    return NextResponse.json({ isUniversity: !!university });
  } catch {
    return NextResponse.json({ isUniversity: false });
  }
}
