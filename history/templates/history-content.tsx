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
  const router = useRouter();

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
      case "mixed":
      case "case-study":
      case "culture-fit":
        return <Trophy className="h-4 w-4" />;
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
    const totalTime = sessions.reduce(
      (sum, session) => sum + session.totalDuration,
      0,
    );

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
        <div className="container mx-auto px-6 py-6">
          <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {stats.avgScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>

              <div className="h-12 w-px bg-border/50 hidden sm:block" />

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg border border-blue-500/20">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalSessions}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Sessions
                  </p>
                </div>
              </div>

              <div className="h-12 w-px bg-border/50 hidden sm:block" />

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg border border-purple-500/20">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(stats.totalTime / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Practice Time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
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

                <div className="flex gap-3">
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

              <div className="flex items-center justify-between">
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {viewLayout === "list" ? (
          <div className="border border-border/50 rounded-xl overflow-hidden shadow-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold pl-8">Position</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Score</TableHead>
                  <TableHead className="text-right font-semibold pr-9">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted/50 rounded-full">
                          <Trophy className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <div>
                          <Typography.Heading2 color="primary" className="mb-2">
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
                      <TableCell>
                        <div className="font-semibold text-foreground pl-6">
                          {capitalizeTitle(session.config.position)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                            {getInterviewIcon(session.config.interviewType)}
                          </div>
                          <span className="capitalize text-sm">
                            {session.config.interviewType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(session.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {session.totalDuration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm ${getScoreColor(session.scores?.overall || 0)}`}
                        >
                          {session.scores?.overall || 0}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <Card
                  key={session.sessionId}
                  className="group border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/history/${session.sessionId}`)}
                >
                  <CardContent className="p-5">
                    {/* Header with Icon and Score */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 group-hover:scale-110 transition-transform">
                        {getInterviewIcon(session.config.interviewType)}
                      </div>
                      <div
                        className={`text-2xl font-bold px-3.5 py-1.5 rounded-lg shadow-sm ${getScoreColor(session.scores?.overall || 0)}`}
                      >
                        {session.scores?.overall || 0}%
                      </div>
                    </div>

                    {/* Title */}
                    <Typography.Heading3
                      color="primary"
                      className="mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                    >
                      {capitalizeTitle(session.config.position)}
                    </Typography.Heading3>

                    {/* Type Badge */}
                    <Badge
                      variant="secondary"
                      className="mb-3 text-xs capitalize font-medium"
                    >
                      {session.config.interviewType}
                    </Badge>

                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
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

                    {/* Company Badge */}
                    {session.config.specificCompany && (
                      <Badge
                        variant="outline"
                        className="mb-3 text-xs font-medium"
                      >
                        {session.config.specificCompany}
                      </Badge>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-xs mb-3">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <span className="text-muted-foreground block mb-0.5">
                          Level
                        </span>
                        <span className="font-semibold capitalize text-foreground">
                          {session.config.seniority}
                        </span>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <span className="text-muted-foreground block mb-0.5">
                          Questions
                        </span>
                        <span className="font-semibold text-foreground">
                          {session.questions?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/history/${session.sessionId}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
