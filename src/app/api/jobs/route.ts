/**
 * Unified Jobs API Route
 * Handles both simple featured jobs and advanced filtering
 */

import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Job } from "@/lib/validators";

const jobSelect = {
  id: true,
  jobUrl: true,
  jobUrlDirect: true,
  title: true,
  company: true,
  companyIndustry: true,
  companyUrl: true,
  companyLogo: true,
  companyUrlDirect: true,
  companyDescription: true,
  location: true,
  cityNormalized: true,
  datePosted: true,
  jobType: true,
  minAmount: true,
  maxAmount: true,
  currency: true,
  isRemote: true,
  jobLevel: true,
  seniorityLevel: true,
  jobFunction: true,
  description: true,
  skills: true,
  createdAt: true,
  updatedAt: true,
} as const;

const legacyJobSelect = {
  id: true,
  jobUrl: true,
  jobUrlDirect: true,
  title: true,
  company: true,
  companyIndustry: true,
  companyUrl: true,
  companyLogo: true,
  companyUrlDirect: true,
  companyDescription: true,
  location: true,
  datePosted: true,
  jobType: true,
  minAmount: true,
  maxAmount: true,
  currency: true,
  isRemote: true,
  jobLevel: true,
  jobFunction: true,
  description: true,
  skills: true,
  createdAt: true,
  updatedAt: true,
} as const;

type JobRow = Prisma.JobGetPayload<{ select: typeof jobSelect }>;
type LegacyJobRow = Prisma.JobGetPayload<{ select: typeof legacyJobSelect }>;

function isMissingColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") return false;
  if (!("code" in error) || error.code !== "P2022") return false;
  if ("meta" in error && typeof error.meta === "object" && error.meta) {
    if ("column" in error.meta && error.meta.column === column) return true;
  }
  if (error instanceof Error) {
    return error.message.includes(column);
  }
  return false;
}

function isUnknownFieldOrArgError(error: unknown, name: string) {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes(`Unknown field \`${name}\``) ||
    error.message.includes(`Unknown argument \`${name}\``)
  );
}

function stripSeniorityLevelWhere(where: Record<string, unknown>) {
  const and = Array.isArray(where.AND) ? (where.AND as unknown[]) : [];
  if (and.length === 0) return where;

  const nextAnd = and
    .map((clause) => {
      if (!clause || typeof clause !== "object") return clause;
      if (!("OR" in clause) || !Array.isArray(clause.OR)) return clause;

      const nextOr = (clause.OR as unknown[]).filter((sub) => {
        if (!sub || typeof sub !== "object") return true;
        return !("seniorityLevel" in sub);
      });

      if (nextOr.length === 0) return null;
      return { ...(clause as Record<string, unknown>), OR: nextOr };
    })
    .filter(Boolean);

  if (nextAnd.length > 0) return { ...where, AND: nextAnd };
  const next = { ...where };
  delete next.AND;
  return next;
}

function buildLoosePatterns(input: string) {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const noSep = lower
    .replaceAll("-", "")
    .replaceAll(" ", "")
    .replaceAll("_", "");

  const patterns = new Set<string>();
  patterns.add(raw);
  patterns.add(lower);
  patterns.add(noSep);
  patterns.add(lower.replaceAll("-", " "));
  patterns.add(lower.replaceAll("-", "_"));

  if (noSep.length > 0) {
    patterns.add(
      noSep
        .replaceAll("fulltime", "full-time")
        .replaceAll("parttime", "part-time"),
    );
    patterns.add(
      noSep
        .replaceAll("fulltime", "full time")
        .replaceAll("parttime", "part time"),
    );
  }

  return Array.from(patterns).filter(Boolean);
}

function buildRolePatterns(input: string) {
  const lower = input.trim().toLowerCase();
  const patterns = new Set(buildLoosePatterns(input));

  switch (lower) {
    case "frontend": {
      patterns.add("front end");
      patterns.add("front-end");
      break;
    }
    case "backend": {
      patterns.add("back end");
      patterns.add("back-end");
      break;
    }
    case "fullstack": {
      patterns.add("full stack");
      patterns.add("full-stack");
      break;
    }
    case "devops": {
      patterns.add("dev ops");
      patterns.add("dev-ops");
      break;
    }
    default:
      break;
  }

  return Array.from(patterns).filter(Boolean);
}

function mapJob(job: JobRow): Job {
  const nowIso = new Date().toISOString();
  const createdAtIso = job.createdAt?.toISOString?.() ?? nowIso;
  const updatedAtIso = job.updatedAt?.toISOString?.() ?? createdAtIso;
  const postedAtIso = job.datePosted?.toISOString?.() ?? createdAtIso;

  return {
    id: job.id,
    title: job.title ?? "",
    company: job.company ?? "",
    location: job.location,
    cityNormalized: job.cityNormalized,
    description: job.description,
    type: job.jobType,
    level: job.jobLevel,
    seniorityLevel: job.seniorityLevel,
    remote: job.isRemote ?? false,
    postedAt: postedAtIso,
    minAmount: job.minAmount?.toString() ?? null,
    maxAmount: job.maxAmount?.toString() ?? null,
    currency: job.currency ?? undefined,
    jobUrl: job.jobUrl ?? undefined,
    jobUrlDirect: job.jobUrlDirect ?? undefined,
    url: job.jobUrlDirect ?? job.jobUrl ?? undefined,
    category: job.jobFunction,
    skills: job.skills ?? undefined,
    companyLogo: job.companyLogo,
    companyDescription: job.companyDescription,
    companyIndustry: job.companyIndustry,
    companyUrl: job.companyUrl,
    companyUrlDirect: job.companyUrlDirect,
    createdAt: createdAtIso,
    updatedAt: updatedAtIso,
  };
}

function mapLegacyJob(job: LegacyJobRow): Job {
  const nowIso = new Date().toISOString();
  const createdAtIso = job.createdAt?.toISOString?.() ?? nowIso;
  const updatedAtIso = job.updatedAt?.toISOString?.() ?? createdAtIso;
  const postedAtIso = job.datePosted?.toISOString?.() ?? createdAtIso;

  return {
    id: job.id,
    title: job.title ?? "",
    company: job.company ?? "",
    location: job.location,
    description: job.description,
    type: job.jobType,
    level: job.jobLevel,
    remote: job.isRemote ?? false,
    postedAt: postedAtIso,
    minAmount: job.minAmount?.toString() ?? null,
    maxAmount: job.maxAmount?.toString() ?? null,
    currency: job.currency ?? undefined,
    jobUrl: job.jobUrl ?? undefined,
    jobUrlDirect: job.jobUrlDirect ?? undefined,
    url: job.jobUrlDirect ?? job.jobUrl ?? undefined,
    category: job.jobFunction,
    skills: job.skills ?? undefined,
    companyLogo: job.companyLogo,
    companyDescription: job.companyDescription,
    companyIndustry: job.companyIndustry,
    companyUrl: job.companyUrl,
    companyUrlDirect: job.companyUrlDirect,
    createdAt: createdAtIso,
    updatedAt: updatedAtIso,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const normalizeParam = (value: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };

    // Simple mode: just return featured jobs with limit
    const limit = searchParams.get("limit");
    if (limit && !searchParams.get("query") && !searchParams.get("location")) {
      let jobs: JobRow[] | LegacyJobRow[];
      let mappedJobs: Job[];

      try {
        jobs = await prisma.job.findMany({
          select: jobSelect,
          orderBy: { datePosted: "desc" },
          take: parseInt(limit, 10),
        });
        mappedJobs = (jobs as JobRow[]).map(mapJob);
      } catch (error) {
        if (
          isUnknownFieldOrArgError(error, "cityNormalized") ||
          isUnknownFieldOrArgError(error, "seniorityLevel")
        ) {
          jobs = await prisma.job.findMany({
            select: legacyJobSelect,
            orderBy: { datePosted: "desc" },
            take: parseInt(limit, 10),
          });
          mappedJobs = (jobs as LegacyJobRow[]).map(mapLegacyJob);
        } else {
          throw error;
        }
      }

      return NextResponse.json({ jobs: mappedJobs, success: true });
    }

    // Advanced mode: full filtering and pagination
    const query = normalizeParam(searchParams.get("query"));
    const location = normalizeParam(searchParams.get("location"));
    const level = normalizeParam(searchParams.get("level"));
    const type = normalizeParam(searchParams.get("type"));
    const role = normalizeParam(searchParams.get("role"));
    const remote = normalizeParam(searchParams.get("remote"));
    const company = normalizeParam(searchParams.get("company"));
    const category = normalizeParam(searchParams.get("category"));
    const jobFunction =
      normalizeParam(searchParams.get("job_function")) ?? category;
    const companySize = normalizeParam(searchParams.get("company_size"));
    const datePosted = normalizeParam(searchParams.get("date_posted"));
    const currency = normalizeParam(searchParams.get("currency"));
    const minSalary = normalizeParam(searchParams.get("min_salary"));
    const maxSalary = normalizeParam(searchParams.get("max_salary"));
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const perPage = Number.parseInt(searchParams.get("per_page") || "20", 10);

    // Build where clause for filtering
    const where: Record<string, unknown> = {};
    const and: Record<string, unknown>[] = [];

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (level) {
      const patterns = buildLoosePatterns(level);
      and.push({
        OR: patterns.flatMap((pattern) => [
          { seniorityLevel: { contains: pattern, mode: "insensitive" } },
          { jobLevel: { contains: pattern, mode: "insensitive" } },
        ]),
      });
    }

    if (role) {
      const patterns = buildRolePatterns(role);
      and.push({
        OR: patterns.flatMap((pattern) => [
          { jobFunction: { contains: pattern, mode: "insensitive" } },
          { title: { contains: pattern, mode: "insensitive" } },
          { description: { contains: pattern, mode: "insensitive" } },
        ]),
      });
    }

    if (type) {
      const patterns = buildLoosePatterns(type);
      and.push({
        OR: patterns.map((pattern) => ({
          jobType: { contains: pattern, mode: "insensitive" },
        })),
      });
    }

    if (remote !== null && remote !== undefined) {
      where.isRemote = remote === "true";
    }

    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    let companySizeClause: Record<string, unknown> | null = null;
    if (companySize) {
      const patterns = (() => {
        switch (companySize) {
          case "1-50":
            return ["1-10", "11-50", "1-50"];
          case "51-500":
            return ["51-200", "201-500", "51-500"];
          case "501-1000":
            return ["501-1000", "501–1000"];
          case "1001+":
            return ["1000+", "1001+", "10000+"];
          default:
            return [companySize];
        }
      })();

      companySizeClause = {
        OR: patterns.map((pattern) => ({
          companyNumEmployees: { contains: pattern, mode: "insensitive" },
        })),
      };

      and.push(companySizeClause);
    }

    if (jobFunction) {
      where.jobFunction = { contains: jobFunction, mode: "insensitive" };
    }

    if (currency) {
      where.currency = { equals: currency.toUpperCase() };
    }

    if (datePosted) {
      const days = Number.parseInt(datePosted, 10);
      if (!Number.isNaN(days) && days > 0) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        where.datePosted = { gte: since };
      }
    }

    if (minSalary) {
      const min = Number.parseFloat(minSalary);
      if (!Number.isNaN(min)) {
        and.push({
          OR: [{ minAmount: { gte: min } }, { maxAmount: { gte: min } }],
        });
      }
    }

    if (maxSalary) {
      const max = Number.parseFloat(maxSalary);
      if (!Number.isNaN(max)) {
        and.push({
          OR: [{ minAmount: { lte: max } }, { maxAmount: { lte: max } }],
        });
      }
    }

    if (and.length > 0) {
      where.AND = and;
    }

    let total: number;
    let jobs: JobRow[] | LegacyJobRow[];
    let mappedJobs: Job[];

    try {
      total = await prisma.job.count({ where });
      jobs = await prisma.job.findMany({
        select: jobSelect,
        where,
        orderBy: { datePosted: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      });
      mappedJobs = (jobs as JobRow[]).map(mapJob);
    } catch (error) {
      if (
        companySize &&
        isMissingColumnError(error, "jobs.company_num_employees")
      ) {
        if (companySizeClause) {
          const existingAnd = Array.isArray(where.AND)
            ? (where.AND as unknown[])
            : [];
          const nextAnd = existingAnd.filter(
            (clause) => clause !== companySizeClause,
          );
          if (nextAnd.length > 0) where.AND = nextAnd;
          else delete where.AND;
        }
        try {
          total = await prisma.job.count({ where });
          jobs = await prisma.job.findMany({
            select: jobSelect,
            where,
            orderBy: { datePosted: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
          });
          mappedJobs = (jobs as JobRow[]).map(mapJob);
        } catch (nextError) {
          if (
            isUnknownFieldOrArgError(nextError, "cityNormalized") ||
            isUnknownFieldOrArgError(nextError, "seniorityLevel")
          ) {
            const legacyWhere = stripSeniorityLevelWhere(where);
            total = await prisma.job.count({ where: legacyWhere });
            jobs = await prisma.job.findMany({
              select: legacyJobSelect,
              where: legacyWhere,
              orderBy: { datePosted: "desc" },
              skip: (page - 1) * perPage,
              take: perPage,
            });
            mappedJobs = (jobs as LegacyJobRow[]).map(mapLegacyJob);
          } else {
            throw nextError;
          }
        }
      } else if (
        isUnknownFieldOrArgError(error, "cityNormalized") ||
        isUnknownFieldOrArgError(error, "seniorityLevel")
      ) {
        const legacyWhere = stripSeniorityLevelWhere(where);
        total = await prisma.job.count({ where: legacyWhere });
        jobs = await prisma.job.findMany({
          select: legacyJobSelect,
          where: legacyWhere,
          orderBy: { datePosted: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
        });
        mappedJobs = (jobs as LegacyJobRow[]).map(mapLegacyJob);
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      results: mappedJobs,
      jobs: mappedJobs, // Keep for backward compatibility
      success: true,
      page,
      per_page: perPage,
      total,
      page_count: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("API /jobs error:", error);
    return NextResponse.json(
      {
        results: [],
        jobs: [],
        success: false,
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
        page: 1,
        per_page: 0,
        total: 0,
        page_count: 0,
      },
      { status: 500 },
    );
  }
}
