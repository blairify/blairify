"use client";

import {
  Calendar,
  Clock,
  Code,
  Eye,
  Filter,
  Grid3x3,
  LayoutGrid,
  List,
  Search,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import type { InterviewSession, InterviewType } from "@/types/firestore";

interface HistoryContentProps {
  user: UserData;
}

type HistoryFilterType = "all" | InterviewType;

type HistorySortBy = "date" | "score" | "duration";

export function HistoryContent({ user }: HistoryContentProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<HistoryFilterType>("all");
  const [sortBy, setSortBy] = useState<HistorySortBy>("date");
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("list");
  const [viewLayoutInitialized, setViewLayoutInitialized] = useState(false);
  const { isMobile, isLoading: isMobileLoading } = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (viewLayoutInitialized) return;
    if (isMobileLoading) return;

    setViewLayout(isMobile ? "grid" : "list");
    setViewLayoutInitialized(true);
  }, [isMobile, isMobileLoading, viewLayoutInitialized]);

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userSessions = await DatabaseService.getUserSessions(user.uid, 50);
      setSessions(userSessions);
      setFilteredSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    let filtered = [...sessions];

    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.config.position
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.config.interviewType
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.config.specificCompany
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(
        (session) => session.config.interviewType === filterType,
      );
    }

    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.createdAt.toDate()).getTime() -
            new Date(a.createdAt.toDate()).getTime()
          );
        case "score":
          return (b.scores?.overall || 0) - (a.scores?.overall || 0);
        case "duration":
          return b.totalDuration - a.totalDuration;
      }

      const _never: never = sortBy;
      throw new Error(`Unhandled sortBy: ${_never}`);
    });

    setFilteredSessions(sorted);
  }, [sessions, searchTerm, filterType, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (score >= 80) return "text-green-500 bg-green-50 dark:bg-green-900/10";
    if (score >= 70)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    if (score >= 60)
      return "text-orange-500 bg-orange-50 dark:bg-orange-900/10";
    return "text-red-500 bg-red-50 dark:bg-red-900/10";
  };

  const getInterviewIcon = (type: InterviewType) => {
    switch (type) {
      case "technical":
      case "coding":
        return <Code className="h-4 w-4" />;
      case "bullet":
      case "system-design":
        return <Target className="h-4 w-4" />;
    }

    const _never: never = type;
    throw new Error(`Unhandled interview type: ${_never}`);
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const capitalizeTitle = (title: string) => {
    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const calculateStats = () => {
    if (sessions.length === 0)
      return { avgScore: 0, totalSessions: 0, totalTime: 0 };

    const avgScore =
      sessions.reduce(
        (sum, session) => sum + (session.scores?.overall || 0),
        0,
      ) / sessions.length;
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => {
      const duration = session.totalDuration || 0;

      if (
        typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration <= 0 ||
        duration > 480
      ) {
        return sum;
      }

      return sum + duration;
    }, 0);

    return { avgScore: Math.round(avgScore), totalSessions, totalTime };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Typography.Body color="secondary">
              Loading interview history...
            </Typography.Body>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="border-b bg-gradient-to-br from-muted/30 via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-lg mb-6">
            <div className="grid grid-cols-3 items-center divide-x divide-border/50">
              <div className="flex flex-col items-center gap-2 px-2 md:px-6 md:flex-row md:items-center md:justify-center md:gap-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {stats.avgScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 px-2 md:px-6 md:flex-row md:items-center md:justify-center md:gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg border border-blue-500/20">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stats.totalSessions}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Sessions
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 px-2 md:px-6 md:flex-row md:items-center md:justify-center md:gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg border border-purple-500/20">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">
                    {Math.round(stats.totalTime / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Practice Time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-lg">
            <details className="rounded-lg border border-border/50 bg-muted/20">
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    Filters
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-lg p-1">
                    <Button
                      variant={viewLayout === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewLayout("grid")}
                      className="h-8 px-3 hover:bg-secondary/80 transition-colors"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewLayout === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewLayout("list")}
                      className="h-8 px-3 hover:bg-secondary/80 transition-colors"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </summary>

              <div className="space-y-4 px-3 pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      placeholder="Search by position, company, or interview type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                      <Select
                        value={filterType}
                        onValueChange={(value) =>
                          setFilterType(value as HistoryFilterType)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-48 h-11 pl-10 border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                          <SelectValue placeholder="Interview Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="bullet">Bullet</SelectItem>
                          <SelectItem value="system-design">
                            System Design
                          </SelectItem>
                          <SelectItem value="coding">Coding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative group">
                      <Grid3x3 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                      <Select
                        value={sortBy}
                        onValueChange={(value) =>
                          setSortBy(value as HistorySortBy)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-48 h-11 pl-10 border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="score">Score</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {filteredSessions.length > 10 && (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {filteredSessions.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {sessions.length}
                      </span>{" "}
                      sessions
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {viewLayout === "list" ? (
          <div className="border border-border/50 rounded-xl overflow-hidden shadow-lg bg-card">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold pl-6 text-xs sm:text-sm whitespace-nowrap">
                      Position
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Company
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Score
                    </TableHead>
                    <TableHead className="text-right font-semibold pr-6 text-xs sm:text-sm whitespace-nowrap">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 px-4">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-muted/50 rounded-full">
                            <Trophy className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                          <div>
                            <Typography.Heading2
                              color="primary"
                              className="mb-2"
                            >
                              No interviews found
                            </Typography.Heading2>
                            <Typography.Body color="secondary" className="mb-4">
                              {sessions.length === 0
                                ? "Start your first interview to see your history here."
                                : "Try adjusting your search or filter criteria."}
                            </Typography.Body>
                            <Button
                              onClick={() => router.push("/configure")}
                              size="lg"
                              className="shadow-lg hover:shadow-xl transition-shadow"
                            >
                              Start First Interview
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow
                        key={session.sessionId}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() =>
                          router.push(`/history/${session.sessionId}`)
                        }
                      >
                        <TableCell className="pl-6 pr-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          <div className="font-semibold text-foreground">
                            {capitalizeTitle(session.config.position)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                              {getInterviewIcon(session.config.interviewType)}
                            </div>
                            <span className="capitalize text-sm">
                              {session.config.interviewType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          {session.config.specificCompany ? (
                            <Badge variant="secondary" className="font-medium">
                              {session.config.specificCompany}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(session.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {session.totalDuration} min
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          <div
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm ${getScoreColor(session.scores?.overall || 0)}`}
                          >
                            {session.scores?.overall || 0}%
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/history/${session.sessionId}`);
                            }}
                            variant="default"
                            size="sm"
                            className="h-9 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSessions.length === 0 ? (
              <Card className="border-2 border-dashed border-border/50 bg-card/50 col-span-full shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                    <Trophy className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <Typography.Heading2 color="primary" className="mb-3">
                    No interviews found
                  </Typography.Heading2>
                  <Typography.Body
                    color="secondary"
                    className="mb-6 max-w-md mx-auto"
                  >
                    {sessions.length === 0
                      ? "Start your first interview to see your history here."
                      : "Try adjusting your search or filter criteria."}
                  </Typography.Body>
                  <Button
                    onClick={() => router.push("/configure")}
                    aria-label="Start First Interview"
                    size="lg"
                    className="h-11 px-8 font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Start First Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredSessions.map((session) => (
                <Link
                  key={session.sessionId}
                  href={`/history/${session.sessionId}`}
                  className="group border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header with Icon and Score */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20">
                          {getInterviewIcon(session.config.interviewType)}
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize font-medium"
                        >
                          {session.config.interviewType}
                        </Badge>
                      </div>
                      <div
                        className={`text-xl font-bold px-3 py-1.5 rounded-lg shadow-sm border border-border/60 ${getScoreColor(session.scores?.overall || 0)}`}
                      >
                        {session.scores?.overall || 0}%
                      </div>
                    </div>

                    {/* Title */}
                    <Typography.Heading3
                      color="primary"
                      className="mb-1 line-clamp-2 group-hover:text-primary transition-colors"
                    >
                      {capitalizeTitle(session.config.position)}
                    </Typography.Heading3>

                    {session.config.specificCompany && (
                      <div className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {session.config.specificCompany}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50 mb-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {session.totalDuration} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium capitalize"
                        >
                          {session.config.seniority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {session.questions?.length || 0}
                        </Badge>
                      </div>
                    </div>

                    <div className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
