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
import Link from "next/link";
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
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.totalTime / 60)}h
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by position, company, or interview type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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
        <div className="space-y-8">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No interviews found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {sessions.length === 0
                    ? "Start your first interview to see your history here."
                    : "Try adjusting your search or filter criteria."}
                </p>
                <Link href="/configure">
                  <Button>Start First Interview</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card
                key={session.sessionId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        {getInterviewIcon(session.config.interviewType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {capitalizeTitle(session.config.position)} Interview
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(session.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {session.totalDuration} min
                          </span>
                          {session.config.specificCompany && (
                            <Badge variant="secondary">
                              {session.config.specificCompany}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(session.scores?.overall || 0)}`}
                        >
                          {session.scores?.overall || 0}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {session.config.interviewType}
                        </div>
                      </div>
                      <Link href={`/history/${session.sessionId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 font-medium capitalize">
                          {session.config.seniority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="ml-2"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions:</span>
                        <span className="ml-2 font-medium">
                          {session.questions?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mode:</span>
                        <span className="ml-2 font-medium capitalize">
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
