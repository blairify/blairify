// /lib/achievements.ts
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (stats: {
        avgScore: number;
        totalSessions: number;
        totalTime: number;
    }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "first_interview",
        name: "Getting Started",
        description: "Complete your first interview.",
        icon: "Trophy",
        condition: (stats) => stats.totalSessions >= 1,
    },
    {
        id: "ten_interviews",
        name: "Dedicated",
        description: "Complete 10 interviews.",
        icon: "Target",
        condition: (stats) => stats.totalSessions >= 10,
    },
    {
        id: "score_90",
        name: "Ace Communicator",
        description: "Achieve an average score of 90% or above.",
        icon: "Star",
        condition: (stats) => stats.avgScore >= 90,
    },
    {
        id: "hour_practice",
        name: "The Grinder",
        description: "Spend over 1 hour in practice interviews.",
        icon: "Clock",
        condition: (stats) => stats.totalTime >= 60,
    },
];
