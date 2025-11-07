/**
 * Dashboard Analytics Service
 * Aggregates and processes interview session data for dashboard display
 */

import type { InterviewSession, SessionScores } from "@/types/firestore";
import { getUserSessions } from "../sessions/database-sessions";

export interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalPracticeTime: number;
  totalTime: number; // Total time in minutes for stats display
  improvementRate: number;
  streakDays: number; // Current streak of consecutive days
}

export interface PerformanceDataPoint {
  date: string;
  score: number;
  sessionType: string;
}

export interface SkillPerformance {
  skill: string;
  level: number;
  sessions: number;
}

export interface QuestionTypeStats {
  type: string;
  count: number;
  avgScore: number;
}

export interface WeeklyActivity {
  day: string;
  sessions: number;
  avgScore: number;
}

export interface RecentSession {
  id: string;
  date: Date;
  position: string;
  type: string;
  score: number;
  duration: number;
  status: string;
}

/**
 * Get dashboard statistics from user sessions
 */
export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const sessions = await getUserSessions(userId, 100); // Get last 100 sessions

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const sessionsWithScores = completedSessions.filter((s) => s.scores?.overall);

  const totalScore = sessionsWithScores.reduce(
    (sum, s) => sum + (s.scores?.overall || 0),
    0,
  );
  const averageScore =
    sessionsWithScores.length > 0
      ? Math.round(totalScore / sessionsWithScores.length)
      : 0;

  const totalPracticeTime = sessions.reduce((sum, s) => {
    const duration = s.totalDuration || 0;
    // Validate duration is a reasonable number (max 8 hours per session)
    if (typeof duration === "number" && duration > 0 && duration <= 480) {
      return sum + duration;
    }
    return sum;
  }, 0);

  // Calculate improvement rate (compare first 10 vs last 10 sessions)
  const improvementRate = calculateImprovementRate(sessionsWithScores);

  // Calculate current streak
  const streakDays = calculateStreak(sessions);

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    averageScore,
    totalPracticeTime,
    totalTime: totalPracticeTime, // Same as totalPracticeTime for now
    improvementRate,
    streakDays,
  };
}

/**
 * Get performance data over time
 */
export async function getPerformanceData(
  userId: string,
): Promise<PerformanceDataPoint[]> {
  const sessions = await getUserSessions(userId, 50);

  // Type guard to ensure session has scores
  const hasValidScores = (
    s: InterviewSession,
  ): s is InterviewSession & { scores: SessionScores } =>
    s.scores !== undefined &&
    s.scores.overall !== undefined &&
    s.completedAt !== undefined;

  return sessions
    .filter(hasValidScores)
    .map((s) => ({
      date:
        s.completedAt?.toDate().toISOString().split("T")[0] ??
        new Date().toISOString().split("T")[0],
      score: s.scores?.overall ?? 0,
      sessionType: s.config.interviewType,
    }))
    .reverse(); // Oldest first
}

/**
 * Get skill performance breakdown
 */
export async function getSkillPerformance(
  userId: string,
): Promise<SkillPerformance[]> {
  const sessions = await getUserSessions(userId, 100);

  const skillMap = new Map<
    string,
    { totalScore: number; count: number; sessions: number }
  >();

  sessions.forEach((session) => {
    const skill = session.config.interviewType;
    const score = session.scores?.overall || 0;

    if (!skillMap.has(skill)) {
      skillMap.set(skill, { totalScore: 0, count: 0, sessions: 0 });
    }

    const data = skillMap.get(skill) || {
      totalScore: 0,
      count: 0,
      sessions: 0,
    };
    data.totalScore += score;
    data.count += score > 0 ? 1 : 0;
    data.sessions += 1;
  });

  return Array.from(skillMap.entries())
    .map(([skill, data]) => ({
      skill,
      level: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      sessions: data.sessions,
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

/**
 * Get question type statistics
 */
export async function getQuestionTypeStats(
  userId: string,
): Promise<QuestionTypeStats[]> {
  const sessions = await getUserSessions(userId, 100);

  const typeMap = new Map<
    string,
    { count: number; totalScore: number; scoreCount: number }
  >();

  sessions.forEach((session) => {
    const type = session.config.interviewType;

    if (!typeMap.has(type)) {
      typeMap.set(type, { count: 0, totalScore: 0, scoreCount: 0 });
    }

    const data = typeMap.get(type) || {
      count: 0,
      totalScore: 0,
      scoreCount: 0,
    };
    data.count += 1;

    if (session.scores?.overall) {
      data.totalScore += session.scores.overall;
      data.scoreCount += 1;
    }
  });

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      avgScore:
        data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get weekly activity data
 */
export async function getWeeklyActivity(
  userId: string,
): Promise<WeeklyActivity[]> {
  const sessions = await getUserSessions(userId, 100);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter sessions from last 7 days
  const recentSessions = sessions.filter((s) => {
    if (!s.completedAt) return false;
    return s.completedAt.toDate() >= sevenDaysAgo;
  });

  const dayMap = new Map<
    string,
    { sessions: number; totalScore: number; scoreCount: number }
  >();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize all days
  days.forEach((day) => {
    dayMap.set(day, { sessions: 0, totalScore: 0, scoreCount: 0 });
  });

  // Aggregate data by day
  recentSessions.forEach((session) => {
    if (!session.completedAt) return;

    const dayName = days[session.completedAt.toDate().getDay()];
    const data = dayMap.get(dayName) || {
      sessions: 0,
      totalScore: 0,
      scoreCount: 0,
    };

    data.sessions += 1;
    if (session.scores?.overall) {
      data.totalScore += session.scores.overall;
      data.scoreCount += 1;
    }
  });

  return days.map((day) => {
    const data = dayMap.get(day) || {
      sessions: 0,
      totalScore: 0,
      scoreCount: 0,
    };
    return {
      day,
      sessions: data.sessions,
      avgScore:
        data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : 0,
    };
  });
}

/**
 * Get recent sessions
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 5,
): Promise<RecentSession[]> {
  const sessions = await getUserSessions(userId, limit);

  return sessions.map((s) => ({
    id: s.sessionId,
    date: s.completedAt?.toDate() || s.createdAt.toDate(),
    position: s.config.position,
    type: s.config.interviewType,
    score: s.scores?.overall || 0,
    duration: s.totalDuration,
    status: s.status,
  }));
}

/**
 * Calculate current streak of consecutive days with sessions
 */
function calculateStreak(sessions: InterviewSession[]): number {
  if (sessions.length === 0) return 0;

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = a.completedAt?.toMillis() || a.createdAt.toMillis();
    const dateB = b.completedAt?.toMillis() || b.createdAt.toMillis();
    return dateB - dateA; // Most recent first
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  for (const session of sortedSessions) {
    const sessionDate = (session.completedAt || session.createdAt).toDate();
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0 || daysDiff === 1) {
      if (sessionDate.getTime() < currentDate.getTime()) {
        streak++;
        currentDate = new Date(sessionDate);
      }
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate improvement rate comparing recent vs older sessions
 */
function calculateImprovementRate(sessions: InterviewSession[]): number {
  if (sessions.length < 2) return 0;

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = a.completedAt?.toMillis() || a.createdAt.toMillis();
    const dateB = b.completedAt?.toMillis() || b.createdAt.toMillis();
    return dateA - dateB;
  });

  const firstHalf = sortedSessions.slice(0, Math.floor(sessions.length / 2));
  const secondHalf = sortedSessions.slice(Math.floor(sessions.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, s) => sum + (s.scores?.overall || 0), 0) /
    firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, s) => sum + (s.scores?.overall || 0), 0) /
    secondHalf.length;

  if (firstAvg === 0) return 0;

  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
}

/**
 * Get suggested jobs based on user role and recent interview types
 */
export async function getSuggestedJobs() {
  try {
    // Fetch jobs from API route (client-safe)
    const response = await fetch("/api/jobs?limit=4");
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error("Error fetching suggested jobs:", error);
    return [];
  }
}

/**
 * Get suggested practice questions based on weak areas
 */
export async function getSuggestedPractice(userId: string) {
  try {
    const sessions = await getUserSessions(userId, 20);

    if (sessions.length === 0) {
      return [];
    }

    // Find interview types with lowest scores
    const typeScores = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      if (session.scores?.overall) {
        const type = session.config.interviewType;
        if (!typeScores.has(type)) {
          typeScores.set(type, { total: 0, count: 0 });
        }
        const data = typeScores.get(type) || { total: 0, count: 0 };
        data.total += session.scores.overall;
        data.count += 1;
      }
    });

    // Calculate averages and find weakest areas
    const weakAreas = Array.from(typeScores.entries())
      .map(([type, data]) => ({
        type,
        avgScore: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 2);

    // Return practice suggestions based on weak areas
    const suggestions = weakAreas.map((area, index) => ({
      id: `practice-${index}`,
      title: `Improve your ${area.type} skills`,
      category: area.type,
      difficulty:
        area.avgScore < 50
          ? "beginner"
          : area.avgScore < 70
            ? "intermediate"
            : "advanced",
      question: `Practice ${area.type} questions to improve from ${Math.round(area.avgScore)}%`,
    }));

    return suggestions;
  } catch (error) {
    console.error("Error fetching suggested practice:", error);
    return [];
  }
}

/**
 * Get all dashboard data in one call
 */
export async function getDashboardData(userId: string) {
  const [
    stats,
    performanceData,
    skillsData,
    questionTypesData,
    weeklyActivityData,
    recentSessions,
    suggestedJobs,
  ] = await Promise.all([
    getDashboardStats(userId),
    getPerformanceData(userId),
    getSkillPerformance(userId),
    getQuestionTypeStats(userId),
    getWeeklyActivity(userId),
    getRecentSessions(userId, 5),
    getSuggestedJobs(),
  ]);

  return {
    stats,
    performanceData,
    skillsData,
    questionTypesData,
    weeklyActivityData,
    recentSessions,
    suggestedJobs,
  };
}
