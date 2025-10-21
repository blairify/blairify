/**
 * Dashboard Data Hook
 * Fetches real user data for the dashboard
 */

import { useEffect, useState } from "react";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";
import type {
  InterviewSession,
  UserProfile,
  UserSkill,
} from "@/types/firestore";

interface DashboardStats {
  totalSessions: number;
  averageScore: number;
  improvementRate: number;
  streakDays: number;
  totalTime: number;
  questionsAnswered: number;
}

interface DashboardData {
  profile: UserProfile | null;
  skills: UserSkill[];
  recentSessions: InterviewSession[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    skills: [],
    recentSessions: [],
    stats: {
      totalSessions: 0,
      averageScore: 0,
      improvementRate: 0,
      streakDays: 0,
      totalTime: 0,
      questionsAnswered: 0,
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.uid) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const profile = await DatabaseService.getUserProfile(user.uid);
        const skills = await DatabaseService.getUserSkills(user.uid);
        const sessions = await DatabaseService.getUserSessions(user.uid, 10);
        const stats = calculateStats(sessions);

        setData({
          profile,
          skills,
          recentSessions: sessions,
          stats,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Check if it's a Firestore internal assertion error
        if (
          error instanceof Error &&
          error.message.includes("INTERNAL ASSERTION FAILED")
        ) {
          console.error(
            "🚨 FIRESTORE INTERNAL ASSERTION ERROR detected in dashboard data:",
            error.message,
          );
        }

        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data",
        }));
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  return data;
};

// Helper function to calculate dashboard stats from sessions
const calculateStats = (sessions: InterviewSession[]): DashboardStats => {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      improvementRate: 0,
      streakDays: 0,
      totalTime: 0,
      questionsAnswered: 0,
    };
  }

  // Calculate total sessions
  const totalSessions = sessions.length;

  // Calculate average score (only for sessions with real scores)
  const completedSessionsWithScores = sessions.filter(
    (s) => s.status === "completed" && s.scores && s.scores.overall > 0,
  );
  const averageScore =
    completedSessionsWithScores.length > 0
      ? Math.round(
          completedSessionsWithScores.reduce(
            (sum, session) => sum + (session.scores?.overall || 0),
            0,
          ) / completedSessionsWithScores.length,
        )
      : 0;

  // Calculate total time (sum of totalDuration in minutes)
  const totalTime = sessions.reduce(
    (sum, session) => sum + (session.totalDuration || 0),
    0,
  );

  // Calculate total questions answered
  const questionsAnswered = sessions.reduce(
    (sum, session) => sum + (session.questions?.length || 0),
    0,
  );

  // Calculate improvement rate (comparing first half vs second half of sessions)
  let improvementRate = 0;
  if (completedSessionsWithScores.length >= 2) {
    const halfPoint = Math.floor(completedSessionsWithScores.length / 2);
    const firstHalf = completedSessionsWithScores.slice(0, halfPoint);
    const secondHalf = completedSessionsWithScores.slice(halfPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum: number, s) => sum + (s.scores?.overall || 0), 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum: number, s) => sum + (s.scores?.overall || 0), 0) /
      secondHalf.length;

    if (firstHalfAvg > 0) {
      improvementRate = Math.round(
        ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100,
      );
    }
  }

  // Calculate streak days (simplified - consecutive days with sessions)
  const streakDays = calculateStreakDays(sessions);

  return {
    totalSessions,
    averageScore,
    improvementRate,
    streakDays,
    totalTime,
    questionsAnswered,
  };
};

// Helper function to calculate consecutive days with sessions
const calculateStreakDays = (sessions: InterviewSession[]): number => {
  if (sessions.length === 0) return 0;

  const today = new Date();
  const sessionDates = sessions
    .map((session) => {
      if (session.createdAt) {
        // Handle both Firestore timestamp (with toDate) and ISO string formats
        if (typeof session.createdAt === "string") {
          return new Date(session.createdAt);
        } else if (typeof session.createdAt.toDate === "function") {
          return session.createdAt.toDate();
        }
      }
      return null;
    })
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

  if (sessionDates.length === 0) return 0;

  let streak = 0;
  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0); // Start of today

  for (const sessionDate of sessionDates) {
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0); // Start of session day

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === streak) {
      // Found a session on the expected day
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
    } else if (daysDiff > streak) {
      // Gap in the streak, stop counting
      break;
    }
    // If daysDiff < streak, it means multiple sessions on the same day, continue
  }

  return streak;
};

export default useDashboardData;
