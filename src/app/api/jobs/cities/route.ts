import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeCity(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === "remote") return null;
  return trimmed;
}

type CitiesResponse = {
  readonly cities: readonly string[];
  readonly success: boolean;
};

function isMissingColumn(error: unknown, column: string) {
  if (!(error instanceof Error)) return false;
  return error.message.includes(column);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitRaw = searchParams.get("limit");
    const limit = Number.parseInt(limitRaw ?? "500", 10);

    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 2000) : 500;

    try {
      const rows = await prisma.$queryRaw<Array<{ city: string | null }>>(
        Prisma.sql`
          SELECT DISTINCT city_normalized as city
          FROM jobs
          WHERE city_normalized IS NOT NULL
          ORDER BY city_normalized ASC
          LIMIT ${safeLimit}
        `,
      );

      const cities = rows
        .map((row) => normalizeCity(row.city))
        .filter((city): city is string => typeof city === "string");

      return NextResponse.json({
        cities,
        success: true,
      } satisfies CitiesResponse);
    } catch (error) {
      if (!isMissingColumn(error, "city_normalized")) throw error;

      const rows = await prisma.$queryRaw<Array<{ city: string | null }>>(
        Prisma.sql`
          SELECT DISTINCT location as city
          FROM jobs
          WHERE location IS NOT NULL
          ORDER BY location ASC
          LIMIT ${safeLimit}
        `,
      );

      const cities = rows
        .map((row) => normalizeCity(row.city))
        .filter((city): city is string => typeof city === "string");

      return NextResponse.json({
        cities,
        success: true,
      } satisfies CitiesResponse);
    }
  } catch (error) {
    console.error("API /jobs/cities error:", error);
    return NextResponse.json(
      { cities: [], success: false } satisfies CitiesResponse,
      { status: 500 },
    );
  }
}
