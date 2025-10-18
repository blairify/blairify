/**
 * Jobs Cache Service
 * Manages cached job data in Firestore for fast retrieval
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const JOBS_COLLECTION = "cached_jobs";
const JOBS_METADATA_COLLECTION = "jobs_metadata";

export interface CachedJob {
  id: string;
  name: string;
  company: {
    name: string;
    id?: number;
  };
  locations: Array<{ name: string }>;
  levels: Array<{ name: string }>;
  categories: string[];
  refs: {
    landing_page: string;
  };
  publication_date: string;
  type?: string;
  remote?: boolean;

  // Additional fields
  description?: string;
  tags?: string[];

  // Cache metadata
  cachedAt: Timestamp;
  expiresAt: Timestamp;
  source: "muse_api";
}

export interface JobsMetadata {
  lastScrapeAt: Timestamp;
  totalJobsCached: number;
  scrapeDuration: number; // milliseconds
  jobsScraped: number;
  status: "success" | "partial" | "failed";
  error?: string;
}

/**
 * Save jobs to cache
 */
export async function cacheJobs(
  jobs: Omit<CachedJob, "cachedAt" | "expiresAt">[],
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const batch = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  for (const job of jobs) {
    const jobRef = doc(db, JOBS_COLLECTION, job.id);
    batch.push(
      setDoc(jobRef, {
        ...job,
        cachedAt: serverTimestamp(),
        expiresAt: expiresAt,
      }),
    );
  }

  // Execute all writes
  await Promise.all(batch);
}

/**
 * Get all cached jobs
 */
export async function getCachedJobs(options?: {
  maxAge?: number; // milliseconds
  limitCount?: number;
}): Promise<CachedJob[]> {
  if (!db) throw new Error("Firestore not initialized");

  const jobsRef = collection(db, JOBS_COLLECTION);
  let q = query(jobsRef, orderBy("publication_date", "desc"));

  // Filter by expiration if maxAge is specified
  if (options?.maxAge) {
    const cutoffDate = new Date(Date.now() - options.maxAge);
    q = query(q, where("cachedAt", ">=", cutoffDate));
  }

  // Limit results if specified
  if (options?.limitCount) {
    q = query(q, limit(options.limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CachedJob[];
}

/**
 * Search cached jobs
 */
export async function searchCachedJobs(
  searchTerm: string,
): Promise<CachedJob[]> {
  if (!db) throw new Error("Firestore not initialized");

  const jobsRef = collection(db, JOBS_COLLECTION);
  const snapshot = await getDocs(jobsRef);

  const lowerSearch = searchTerm.toLowerCase();

  return snapshot.docs
    .map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as CachedJob,
    )
    .filter(
      (job) =>
        job.name.toLowerCase().includes(lowerSearch) ||
        job.company.name.toLowerCase().includes(lowerSearch) ||
        job.categories?.some((cat) =>
          cat.toLowerCase().includes(lowerSearch),
        ) ||
        job.locations?.some((loc) =>
          loc.name.toLowerCase().includes(lowerSearch),
        ),
    );
}

/**
 * Filter cached jobs
 */
export async function filterCachedJobs(filters: {
  location?: string;
  level?: string;
  type?: string;
  remote?: boolean;
  company?: string;
  category?: string;
}): Promise<CachedJob[]> {
  const allJobs = await getCachedJobs();

  return allJobs.filter((job) => {
    if (
      filters.location &&
      !job.locations.some((l) =>
        l.name.toLowerCase().includes(filters.location?.toLowerCase() ?? ""),
      )
    ) {
      return false;
    }

    if (
      filters.level &&
      !job.levels.some((l) =>
        l.name.toLowerCase().includes(filters.level?.toLowerCase() ?? ""),
      )
    ) {
      return false;
    }

    if (
      filters.type &&
      job.type?.toLowerCase() !== filters.type.toLowerCase()
    ) {
      return false;
    }

    if (filters.remote !== undefined && job.remote !== filters.remote) {
      return false;
    }

    if (
      filters.company &&
      !job.company.name.toLowerCase().includes(filters.company.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.category &&
      !job.categories?.some((cat) =>
        cat.toLowerCase().includes(filters.category?.toLowerCase() ?? ""),
      )
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Clear expired jobs from cache
 */
export async function clearExpiredJobs(): Promise<number> {
  if (!db) throw new Error("Firestore not initialized");

  const jobsRef = collection(db, JOBS_COLLECTION);
  const now = new Date();

  const q = query(jobsRef, where("expiresAt", "<=", now));
  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  return snapshot.size;
}

/**
 * Clear all cached jobs
 */
export async function clearAllJobs(): Promise<number> {
  if (!db) throw new Error("Firestore not initialized");

  const jobsRef = collection(db, JOBS_COLLECTION);
  const snapshot = await getDocs(jobsRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  return snapshot.size;
}

/**
 * Save scrape metadata
 */
export async function saveJobsMetadata(
  metadata: Omit<JobsMetadata, "lastScrapeAt">,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const metadataRef = doc(db, JOBS_METADATA_COLLECTION, "latest");
  await setDoc(metadataRef, {
    ...metadata,
    lastScrapeAt: serverTimestamp(),
  });
}

/**
 * Get last scrape metadata
 */
export async function getJobsMetadata(): Promise<JobsMetadata | null> {
  if (!db) throw new Error("Firestore not initialized");

  const metadataRef = doc(db, JOBS_METADATA_COLLECTION, "latest");
  const snapshot = await getDoc(metadataRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as JobsMetadata;
}

/**
 * Check if cache needs refresh
 */
export async function needsCacheRefresh(maxAgeHours = 24): Promise<boolean> {
  const metadata = await getJobsMetadata();

  if (!metadata) {
    return true; // No metadata means never scraped
  }

  const lastScrape = metadata.lastScrapeAt.toDate();
  const hoursSinceLastScrape =
    (Date.now() - lastScrape.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastScrape >= maxAgeHours;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalJobs: number;
  lastScrape: Date | null;
  cacheAge: number; // hours
  status: string;
}> {
  const metadata = await getJobsMetadata();
  const jobs = await getCachedJobs();

  return {
    totalJobs: jobs.length,
    lastScrape: metadata?.lastScrapeAt.toDate() || null,
    cacheAge: metadata
      ? (Date.now() - metadata.lastScrapeAt.toDate().getTime()) /
        (1000 * 60 * 60)
      : 0,
    status: metadata?.status || "unknown",
  };
}
