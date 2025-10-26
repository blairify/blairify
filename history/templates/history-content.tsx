"use client";

import {
  Calendar,
  Clock,
  Code,
  Eye,
  Filter,
  Target,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import type { InterviewSession } from "@/types/firestore";

interface HistoryContentProps {
  user: UserData;
}

export function HistoryContent({ user }: HistoryContentProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
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

  // Load interview sessions
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter and sort sessions
  useEffect(() => {
    let filtered = sessions;

    // Apply search filter
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

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (session) => session.config.interviewType === filterType,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
        default:
          return 0;
      }
    });

    setFilteredSessions(filtered);
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

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="h-4 w-4" />;
      case "bullet":
        return <Target className="h-4 w-4" />;
      case "system-design":
        return <Target className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
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
            <p className="text-muted-foreground">
              Loading interview history...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Interview History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your progress and review past interview sessions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {stats.avgScore}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all sessions
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                {stats.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed interviews
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Total Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                {Math.round(stats.totalTime / 60)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Practice time invested
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-2 border-border/50 shadow-md bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Filter className="h-5 w-5 text-primary" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by position, company, or interview type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48 h-11 border-border/50">
                  <SelectValue placeholder="Interview Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="bullet">Bullet</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-11 border-border/50">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredSessions.length === 0 ? (
            <Card className="border-2 border-dashed border-border/50 bg-card/50">
              <CardContent className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  No interviews found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {sessions.length === 0
                    ? "Start your first interview to see your history here."
                    : "Try adjusting your search or filter criteria."}
                </p>
                <Button
                  onClick={() => router.push("/configure")}
                  aria-label="Start First Interview"
                  size="lg"
                  className="h-11 px-8 font-semibold"
                >
                  Start First Interview
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card
                key={session.sessionId}
                className="border-2 border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-200 bg-card/80 backdrop-blur-sm"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 flex-shrink-0">
                        {getInterviewIcon(session.config.interviewType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2">
                          {capitalizeTitle(session.config.position)} Interview
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {session.totalDuration} min
                          </span>
                          {session.config.specificCompany && (
                            <Badge variant="secondary" className="font-medium">
                              {session.config.specificCompany}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-center sm:text-right">
                        <div
                          className={`text-3xl sm:text-4xl font-bold px-4 py-2 rounded-xl shadow-sm ${getScoreColor(session.scores?.overall || 0)}`}
                        >
                          {session.scores?.overall || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5 font-medium capitalize">
                          {session.config.interviewType}
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          router.push(`/history/${session.sessionId}`)
                        }
                        aria-label="View Details"
                        variant="default"
                        size="sm"
                        className="h-10 px-4 font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-5 pt-5 border-t border-border/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground font-medium">
                          Difficulty:
                        </span>
                        <span className="ml-2 font-bold capitalize text-foreground">
                          {session.config.seniority}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">
                          Status:
                        </span>
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="ml-2 font-medium"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">
                          Questions:
                        </span>
                        <span className="ml-2 font-bold text-foreground">
                          {session.questions?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">
                          Mode:
                        </span>
                        <span className="ml-2 font-bold capitalize text-foreground">
                          {session.config.interviewMode}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
