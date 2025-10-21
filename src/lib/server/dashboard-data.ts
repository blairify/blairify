// Mock function - replace with your actual server-side data fetching
export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    // Note: Firebase Auth is primarily client-side. For server-side auth,
    // you would need Firebase Admin SDK to verify ID tokens.
    // For now, we'll let the client handle auth and return data.
    // The client-side auth guard will handle redirects with better UX.

    // Mock data - replace with actual database queries
    const mockData = {
      recentSessions: [
        {
          id: 1,
          config: { position: "Frontend Engineer", interviewType: "technical" },
          scores: {
            overall: 85,
            technical: 80,
            communication: 90,
            problemSolving: 85,
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          totalDuration: 45,
          status: "completed",
        },
        {
          id: 2,
          config: { position: "Backend Engineer", interviewType: "coding" },
          scores: {
            overall: 78,
            technical: 75,
            communication: 80,
            problemSolving: 80,
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          totalDuration: 60,
          status: "completed",
        },
      ],
      stats: {
        totalSessions: 12,
        averageScore: 82,
        improvementRate: 15,
        totalTime: 540, // minutes
        streakDays: 5,
      },
      skills: [
        { name: "React", currentLevel: 8, practiceCount: 15 },
        { name: "JavaScript", currentLevel: 9, practiceCount: 20 },
        { name: "System Design", currentLevel: 6, practiceCount: 8 },
        { name: "Algorithms", currentLevel: 7, practiceCount: 12 },
        { name: "Communication", currentLevel: 9, practiceCount: 18 },
        { name: "Problem Solving", currentLevel: 8, practiceCount: 16 },
      ],
    };

    return mockData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

// Type definitions for the data
export interface DashboardData {
  recentSessions: Array<{
    id: number;
    config?: {
      position?: string;
      interviewType?: string;
    };
    scores?: {
      overall?: number;
      technical?: number;
      communication?: number;
      problemSolving?: number;
    };
    createdAt?: string;
    totalDuration?: number;
    status?: string;
  }>;
  stats: {
    totalSessions: number;
    averageScore: number;
    improvementRate: number;
    totalTime: number;
    streakDays: number;
  };
  skills: Array<{
    name: string;
    currentLevel: number;
    practiceCount: number;
  }>;
}
