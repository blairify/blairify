# Sample Data Examples for Grant Guide Firestore Schema

This document provides examples of how data will be structured and stored in our Firestore database according to the comprehensive schema design.

## Sample User Profile

```typescript
// Document: users/user123
const userProfile: UserProfile = {
  uid: "user123",
  email: "john.doe@example.com",
  displayName: "John Doe",
  photoURL: "https://example.com/profile-photos/user123.jpg",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-20T14:30:00Z"),
  
  // Personal Information
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: new Date("1990-05-15"),
  phoneNumber: "+1-234-567-8900",
  location: {
    city: "San Francisco",
    state: "CA",
    country: "USA",
    timezone: "America/Los_Angeles"
  },
  
  // Professional Information
  profession: "Software Engineer",
  experienceLevel: "mid",
  industry: "Technology",
  currentCompany: "Tech Corp",
  linkedinProfile: "https://linkedin.com/in/johndoe",
  resume: {
    url: "https://storage.googleapis.com/bucket/resumes/user123.pdf",
    filename: "john_doe_resume.pdf",
    uploadedAt: new Date("2024-01-15T11:00:00Z")
  },
  
  // Application Preferences
  preferences: {
    targetIndustries: ["technology", "healthcare", "finance"],
    preferredRoles: ["software-engineer", "technical-lead"],
    salaryRange: {
      min: 80000,
      max: 120000,
      currency: "USD"
    },
    workPreferences: {
      remote: true,
      hybrid: true,
      onsite: false
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  }
};
```

## Sample User Skills

```typescript
// Document: users/user123/skills/technical-communication
const communicationSkill: UserSkill = {
  skillId: "technical-communication",
  category: "communication",
  name: "Technical Communication",
  description: "Ability to explain complex technical concepts clearly",
  currentLevel: 7,
  targetLevel: 9,
  assessmentHistory: [
    {
      date: new Date("2024-01-15"),
      score: 6,
      assessmentType: "self-assessment"
    },
    {
      date: new Date("2024-01-20"),
      score: 7,
      assessmentType: "interview-performance"
    }
  ],
  improvementPlan: {
    goals: ["Practice explaining algorithms", "Record technical presentations"],
    resources: ["Toastmasters", "Technical Writing Course"],
    targetDate: new Date("2024-03-01")
  },
  certifications: [],
  lastUpdated: new Date("2024-01-20T16:00:00Z")
};

// Document: users/user123/skills/javascript
const technicalSkill: UserSkill = {
  skillId: "javascript",
  category: "technical",
  name: "JavaScript",
  description: "Proficiency in JavaScript programming language",
  currentLevel: 8,
  targetLevel: 9,
  assessmentHistory: [
    {
      date: new Date("2024-01-10"),
      score: 7,
      assessmentType: "coding-challenge"
    },
    {
      date: new Date("2024-01-18"),
      score: 8,
      assessmentType: "technical-interview"
    }
  ],
  improvementPlan: {
    goals: ["Learn advanced async patterns", "Master ES6+ features"],
    resources: ["MDN Documentation", "JavaScript: The Good Parts"],
    targetDate: new Date("2024-02-15")
  },
  certifications: [
    {
      name: "JavaScript Developer Certification",
      issuer: "Tech Academy",
      dateEarned: new Date("2023-12-01"),
      url: "https://certificates.com/js-cert-123"
    }
  ],
  lastUpdated: new Date("2024-01-18T09:30:00Z")
};
```

## Sample Interview Session

```typescript
// Document: users/user123/sessions/session456
const interviewSession: InterviewSession = {
  sessionId: "session456",
  userId: "user123",
  
  // Session Configuration
  config: {
    sessionType: "technical",
    difficulty: "intermediate",
    duration: 60, // minutes
    targetSkills: ["javascript", "problem-solving", "technical-communication"],
    customInstructions: "Focus on data structures and algorithms"
  },
  
  // Session Status
  status: "completed",
  scheduledFor: new Date("2024-01-20T15:00:00Z"),
  startedAt: new Date("2024-01-20T15:02:00Z"),
  completedAt: new Date("2024-01-20T16:05:00Z"),
  
  // Session Content
  questions: [
    {
      questionId: "q001",
      text: "Implement a function to reverse a linked list",
      category: "algorithms",
      difficulty: "medium",
      timeAllocated: 20,
      timeSpent: 18,
      answer: {
        code: "function reverseList(head) { /* implementation */ }",
        explanation: "I used the iterative approach with three pointers...",
        isCorrect: true
      },
      feedback: {
        score: 8,
        strengths: ["Clear logic", "Good time complexity"],
        improvements: ["Could explain edge cases better"],
        detailedFeedback: "Great implementation with O(n) time complexity..."
      }
    }
  ],
  
  // Overall Performance
  performance: {
    overallScore: 85,
    skillScores: {
      "javascript": 88,
      "problem-solving": 82,
      "technical-communication": 85
    },
    timeManagement: {
      totalTimeUsed: 58,
      averageTimePerQuestion: 19,
      timeEfficiency: 0.92
    }
  },
  
  // AI Analysis
  aiAnalysis: {
    strengths: [
      "Strong understanding of data structures",
      "Clear communication style",
      "Good problem-solving approach"
    ],
    weaknesses: [
      "Could improve edge case handling",
      "Need to practice explaining time complexity"
    ],
    recommendations: [
      "Practice more dynamic programming problems",
      "Work on technical presentation skills"
    ],
    confidenceLevel: 0.85,
    readinessAssessment: {
      level: "intermediate",
      recommendedNextSteps: ["Practice advanced algorithms", "Mock interviews"]
    }
  },
  
  // Metadata
  createdAt: new Date("2024-01-20T15:00:00Z"),
  updatedAt: new Date("2024-01-20T16:10:00Z"),
  metadata: {
    deviceInfo: "Chrome/Mac",
    sessionNotes: "User seemed confident with basic algorithms"
  }
};
```

## Sample User Analytics

```typescript
// Document: users/user123/analytics/monthly-202401
const monthlyAnalytics: UserAnalytics = {
  userId: "user123",
  period: "monthly",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  
  // Session Statistics
  sessionStats: {
    totalSessions: 8,
    completedSessions: 7,
    averageScore: 82.5,
    totalTimeSpent: 420, // minutes
    sessionTypes: {
      "technical": 4,
      "behavioral": 2,
      "case-study": 1
    }
  },
  
  // Skill Performance
  skillPerformance: {
    "javascript": {
      sessionsCount: 5,
      averageScore: 85,
      improvement: 8, // points improved
      trend: "improving"
    },
    "technical-communication": {
      sessionsCount: 6,
      averageScore: 78,
      improvement: 5,
      trend: "stable"
    }
  },
  
  // Progress Metrics
  progressMetrics: {
    skillsImproved: 3,
    averageImprovement: 6.2,
    goalsAchieved: 2,
    streakDays: 12,
    consistencyScore: 0.85
  },
  
  // Insights
  insights: [
    {
      type: "strength",
      category: "technical",
      message: "Your JavaScript skills have improved significantly this month",
      confidence: 0.92
    },
    {
      type: "recommendation",
      category: "practice",
      message: "Consider focusing more on system design questions",
      confidence: 0.78
    }
  ],
  
  createdAt: new Date("2024-02-01T00:00:00Z"),
  lastUpdated: new Date("2024-02-01T00:00:00Z")
};
```

## Sample Progress Tracking

```typescript
// Document: users/user123/progress/goal789
const skillGoalProgress: ProgressTracking = {
  userId: "user123",
  type: "skill-improvement",
  category: "technical",
  
  // Goal Definition
  goal: {
    title: "Master JavaScript Advanced Concepts",
    description: "Improve JavaScript skills from level 7 to level 9",
    targetValue: 9,
    currentValue: 8,
    unit: "skill-level",
    targetDate: new Date("2024-03-01")
  },
  
  // Progress Data
  startDate: new Date("2024-01-01"),
  milestones: [
    {
      title: "Understand Closures and Scope",
      targetDate: new Date("2024-01-15"),
      completedDate: new Date("2024-01-14"),
      status: "completed"
    },
    {
      title: "Master Async/Await Patterns",
      targetDate: new Date("2024-02-01"),
      completedDate: null,
      status: "in-progress"
    },
    {
      title: "Learn Advanced ES6+ Features",
      targetDate: new Date("2024-02-15"),
      completedDate: null,
      status: "pending"
    }
  ],
  
  // Progress Metrics
  currentProgress: 0.67, // 67% complete
  progressHistory: [
    {
      date: new Date("2024-01-01"),
      value: 7,
      milestone: "Starting baseline"
    },
    {
      date: new Date("2024-01-15"),
      value: 7.5,
      milestone: "Completed closures training"
    },
    {
      date: new Date("2024-01-20"),
      value: 8,
      milestone: "Demonstrated improved skills in interview"
    }
  ],
  
  // Status
  status: "on-track",
  lastUpdated: new Date("2024-01-20T16:00:00Z"),
  
  // Analysis
  analysis: {
    projectedCompletion: new Date("2024-02-28"),
    riskLevel: "low",
    recommendations: [
      "Continue current practice schedule",
      "Focus on practical applications of concepts"
    ]
  }
};
```

## Sample Activity Log

```typescript
// Document: users/user123/activities/activity001
const practiceActivity: ActivityLog = {
  userId: "user123",
  activityId: "practice-session-456",
  timestamp: new Date("2024-01-20T15:00:00Z"),
  
  // Activity Details
  type: "practice-session",
  category: "interview-preparation",
  description: "Completed technical interview practice session",
  
  // Activity Data
  data: {
    sessionId: "session456",
    duration: 63, // minutes
    questionsAnswered: 3,
    averageScore: 85,
    skillsAssessed: ["javascript", "problem-solving", "technical-communication"]
  },
  
  // Context
  context: {
    deviceType: "desktop",
    platform: "web",
    sessionQuality: "high",
    userFeedback: {
      difficulty: "appropriate",
      satisfaction: 4, // out of 5
      technicalIssues: false
    }
  },
  
  // Metadata
  metadata: {
    ipAddress: "192.168.1.100", // hashed/anonymized
    userAgent: "Chrome/Mac",
    referrer: "/dashboard"
  }
};

// Document: users/user123/activities/activity002
const goalActivity: ActivityLog = {
  userId: "user123",
  activityId: "goal-update-789",
  timestamp: new Date("2024-01-20T16:30:00Z"),
  
  type: "goal-progress",
  category: "skill-development",
  description: "Updated progress on JavaScript mastery goal",
  
  data: {
    goalId: "goal789",
    previousLevel: 7.5,
    newLevel: 8,
    milestone: "Demonstrated improved skills in interview",
    improvementSource: "interview-performance"
  },
  
  context: {
    triggeredBy: "session-completion",
    autoGenerated: true
  },
  
  metadata: {
    calculationMethod: "ai-assessment",
    confidence: 0.88
  }
};
```

## Sample User Achievement

```typescript
// Document: users/user123/achievements/achievement001
const streakAchievement: UserAchievement = {
  userId: "user123",
  achievementId: "practice-streak-10",
  
  // Achievement Definition
  title: "Consistent Learner",
  description: "Completed practice sessions for 10 consecutive days",
  category: "consistency",
  type: "streak",
  level: "bronze", // bronze, silver, gold, platinum
  
  // Achievement Status
  unlockedAt: new Date("2024-01-20T18:00:00Z"),
  progress: {
    current: 10,
    target: 10,
    unit: "days"
  },
  
  // Achievement Data
  criteria: {
    type: "streak",
    metric: "daily-practice",
    threshold: 10,
    timeframe: "consecutive-days"
  },
  
  // Rewards
  rewards: {
    points: 100,
    badges: ["consistent-learner"],
    unlocks: ["advanced-practice-mode"]
  },
  
  // Metadata
  metadata: {
    difficulty: "easy",
    rarity: "common", // common, uncommon, rare, legendary
    category: "engagement"
  },
  
  // Verification
  verification: {
    verified: true,
    verificationData: {
      sessions: ["session453", "session454", "session455", "session456"],
      dates: [
        new Date("2024-01-11"),
        new Date("2024-01-12"),
        new Date("2024-01-13"),
        new Date("2024-01-20")
      ]
    }
  }
};

// Document: users/user123/achievements/achievement002
const skillAchievement: UserAchievement = {
  userId: "user123",
  achievementId: "javascript-expert",
  
  title: "JavaScript Expert",
  description: "Achieved expert level (8+) in JavaScript programming",
  category: "skill-mastery",
  type: "threshold",
  level: "silver",
  
  unlockedAt: new Date("2024-01-20T16:05:00Z"),
  progress: {
    current: 8,
    target: 8,
    unit: "skill-level"
  },
  
  criteria: {
    type: "skill-level",
    metric: "javascript",
    threshold: 8,
    timeframe: null
  },
  
  rewards: {
    points: 500,
    badges: ["javascript-expert"],
    unlocks: ["advanced-javascript-challenges", "mentor-program"]
  },
  
  metadata: {
    difficulty: "medium",
    rarity: "uncommon",
    category: "technical-skills"
  },
  
  verification: {
    verified: true,
    verificationData: {
      assessmentSession: "session456",
      aiConfidence: 0.92,
      manualReview: false
    }
  }
};
```

## Usage Examples

### Creating a New User Profile

```typescript
import { DatabaseService } from '@/lib/database-simple';

// Create a new user profile
const newUser = await DatabaseService.createUserProfile('user123', {
  email: 'john.doe@example.com',
  displayName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  preferences: {
    notifications: {
      email: true,
      push: false,
      sms: false
    }
  }
});
```

### Recording Interview Session Results

```typescript
// Create a new interview session
const sessionData = {
  config: {
    sessionType: 'technical' as const,
    difficulty: 'intermediate' as const,
    duration: 60,
    targetSkills: ['javascript', 'problem-solving']
  },
  questions: [
    // ... question data
  ],
  performance: {
    overallScore: 85,
    skillScores: {
      'javascript': 88,
      'problem-solving': 82
    }
  }
};

const session = await DatabaseService.createSession('user123', sessionData);
```

### Tracking Skill Progress

```typescript
// Update user skill level
const updatedSkill = await DatabaseService.updateUserSkill('user123', 'javascript', {
  currentLevel: 8,
  assessmentHistory: [
    ...existingHistory,
    {
      date: new Date(),
      score: 8,
      assessmentType: 'interview-performance'
    }
  ]
});
```

### Querying User Analytics

```typescript
// Get user's monthly analytics
const analytics = await DatabaseService.getUserAnalytics('user123', 'monthly', '2024-01');

// Get skill performance trends
const skillTrends = analytics?.skillPerformance || {};
```

This sample data demonstrates the comprehensive nature of our schema and how it supports complex user tracking, skill assessment, progress analytics, and job market integration for the Grant Guide application.