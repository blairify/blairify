"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiBriefcase,
  FiClock,
  FiGlobe,
  FiGrid,
  FiList,
  FiMapPin,
} from "react-icons/fi";
import { Button } from "../ui/button";

interface Job {
  id: number;
  name: string;
  company: { name: string };
  locations: { name: string }[];
  levels: { name: string }[];
  refs: { landing_page: string };
  publication_date: string;
  type?: string;
  remote?: boolean;
  categories?: string[];
}

interface JobListProps {
  initialQuery?: string;
  initialPerPage?: number;
}

export default function JobList({
  initialQuery = "developer",
  initialPerPage = 20,
}: JobListProps) {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch jobs from cache
  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs?query=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Show warning if cache needs refresh
      if (data.cache_needs_refresh) {
        // Job cache is stale. Consider triggering a refresh.
      }

      setAllJobs(data.results || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  const filteredJobs = allJobs.filter((job) => {
    const matchesLocation = locationFilter
      ? job.locations.some((l) =>
          l.name.toLowerCase().includes(locationFilter.toLowerCase()),
        )
      : true;
    const matchesLevel = levelFilter
      ? job.levels.some((l) =>
          l.name.toLowerCase().includes(levelFilter.toLowerCase()),
        )
      : true;
    const matchesType = typeFilter
      ? job.type?.toLowerCase() === typeFilter.toLowerCase()
      : true;
    const matchesRemote =
      remoteFilter === "remote"
        ? job.remote
        : remoteFilter === "onsite"
          ? !job.remote
          : true;
    const matchesCompany = companyFilter
      ? job.company?.name.toLowerCase().includes(companyFilter.toLowerCase())
      : true;

    return (
      matchesLocation &&
      matchesLevel &&
      matchesType &&
      matchesRemote &&
      matchesCompany
    );
  });

  const startIdx = (page - 1) * perPage;
  const paginatedJobs = filteredJobs.slice(startIdx, startIdx + perPage);
  const totalPages = Math.ceil(filteredJobs.length / perPage);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 border border-border rounded-xl bg-card pb-6">
        {/* View Mode Toggle */}
        <div className="pt-6 px-6">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <FiGrid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <FiList className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 p-4 rounded-lg bg-background shadow-sm"
          >
            <input
              type="text"
              placeholder="Keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              type="text"
              placeholder="Company..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Levels</option>
              <option value="Internship">Internship</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Director">Director</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
            <select
              value={remoteFilter}
              onChange={(e) => setRemoteFilter(e.target.value)}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full p-2 md:p-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <Button
              type="submit"
              className="w-full p-2 md:p-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Jobs */}
        {loading ? (
          <p className="text-muted-foreground animate-pulse mt-4">
            Loading jobs...
          </p>
        ) : error ? (
          <p className="text-destructive mt-4">{error}</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-muted-foreground mt-4">
            No active programming jobs found.
          </p>
        ) : (
          <div className="px-6">
            {viewMode === "grid" ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-col justify-between p-4 border border-border rounded-lg bg-background shadow hover:shadow-lg transition group"
                  >
                    <div className="space-y-1">
                      <h3 className="text-md md:text-lg font-semibold text-primary">
                        {job.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job.company?.name || "Unknown Company"}
                      </p>
                      <div className="flex flex-wrap text-xs text-muted-foreground gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="inline" />
                          {job.locations.map((l) => l.name).join(", ") ||
                            "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBriefcase className="inline" />
                          {job.levels.map((l) => l.name).join(", ") ||
                            "Level N/A"}
                        </span>
                        {job.type && <span>{job.type}</span>}
                        <span className="flex items-center gap-1">
                          <FiClock className="inline" />
                          {new Date(job.publication_date).toLocaleDateString()}
                        </span>
                        {job.remote !== undefined && (
                          <span className="flex items-center gap-1">
                            <FiGlobe className="inline" />
                            {job.remote ? "Remote" : "On-site"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a
                        href={job.refs.landing_page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:opacity-90 transition"
                      >
                        View Job
                      </a>
                      <Button className="flex-1 px-3 py-2 border rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition">
                        Prepare
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-4">
                {paginatedJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg bg-background shadow hover:shadow-lg transition group"
                  >
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {job.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {job.company?.name || "Unknown Company"}
                        </p>
                      </div>
                      <div className="flex flex-wrap text-xs text-muted-foreground gap-4">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="inline" />
                          {job.locations.map((l) => l.name).join(", ") ||
                            "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBriefcase className="inline" />
                          {job.levels.map((l) => l.name).join(", ") ||
                            "Level N/A"}
                        </span>
                        {job.type && <span>{job.type}</span>}
                        <span className="flex items-center gap-1">
                          <FiClock className="inline" />
                          {new Date(job.publication_date).toLocaleDateString()}
                        </span>
                        {job.remote !== undefined && (
                          <span className="flex items-center gap-1">
                            <FiGlobe className="inline" />
                            {job.remote ? "Remote" : "On-site"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0 md:ml-4">
                      <a
                        href={job.refs.landing_page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:opacity-90 transition"
                      >
                        View Job
                      </a>
                      <Button className="px-4 py-2 border rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition">
                        Prepare
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-border pb-6">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-md bg-secondary hover:bg-accent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-md bg-secondary hover:bg-accent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
