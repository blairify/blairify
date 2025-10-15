# Grant Guide - Firestore Schema Design

## Overview
This document outlines the complete Firestore database schema for the Grant Guide application, designed to handle user profiles, interview sessions, progress tracking, skills analysis, performance metrics, and job market integration.

## Collection Structure

### 1. Users Collection (`users/{userId}`)
**Primary user profile data**

```typescript
interface UserProfile {
  // Basic Information
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Profile Details
  role?: string;
  experience?: string;
  howDidYouHear?: string;
  
  // Preferences
  preferences: {
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    preferredInterviewTypes: string[];
    targetCompanies: string[];
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
  
  // Metadata
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActiveAt: Timestamp;
  isActive: boolean;
  
  // Subscription/Plan Info
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Timestamp;
  };
}
```

### 2. User Skills (`users/{userId}/skills/{skillId}`)
**Detailed skills tracking and assessment**

```typescript
interface UserSkill {
  skillId: string;
  category: 'technical' | 'behavioral' | 'system-design' | 'communication';
  name: string;
  
  // Current Assessment
  currentLevel: number; // 1-10 scale
  targetLevel: number;
  confidence: number; // 1-10 scale
  
  // Progress Tracking
  progressHistory: {
    date: Timestamp;
    level: number;
    confidence: number;
    assessmentSource: 'interview' | 'practice' | 'self-assessment';
  }[];
  
  // Performance Metrics
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  // Activity
  lastPracticedAt?: Timestamp;
  totalPracticeTime: number; // minutes
  practiceCount: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Interview Sessions (`users/{userId}/sessions/{sessionId}`)
**Individual interview session data**

```typescript
interface InterviewSession {
  sessionId: string;
  
  // Configuration
  config: {
    position: string;
    seniority: string;
    companyProfile?: string;
    specificCompany?: string;
    interviewMode: 'timed' | 'untimed';
    interviewType: 'technical' | 'behavioral' | 'system-design' | 'mixed';
    duration: number; // minutes
  };
  
  // Session State
  status: 'scheduled' | 'in-progress' | 'completed' | 'abandoned';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  totalDuration: number; // actual minutes spent
  
  // Performance Data
  scores: {
    overall: number; // 1-100
    technical: number;
    communication: number;
    problemSolving: number;
    codeQuality?: number;
    systemDesign?: number;
  };
  
  // Questions and Responses
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  
  // AI Analysis
  analysis: {
    strengths: string[];
    improvements: string[];
    skillsAssessed: string[];
    difficulty: number; // 1-10
    aiConfidence: number; // 1-100
    summary: string;
  };
  
  // Feedback
  userFeedback?: {
    difficulty: number;
    relevance: number;
    satisfaction: number;
    comments?: string;
    wouldRecommend: boolean;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'system-design';
  category: string;
  question: string;
  difficulty: number;
  expectedDuration: number; // minutes
  tags: string[];
}

interface InterviewResponse {
  questionId: string;
  response: string;
  duration: number; // seconds taken to respond
  confidence: number; // user's self-reported confidence
  score: number; // AI-generated score
  feedback: string; // AI-generated feedback
  keyPoints: string[];
  missedPoints: string[];
}
```

### 4. User Analytics (`users/{userId}/analytics/{period}`)
**Aggregated performance and progress data**

```typescript
interface UserAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // YYYY-MM-DD or YYYY-MM or YYYY format
  
  // Session Statistics
  sessions: {
    total: number;
    completed: number;
    abandoned: number;
    averageDuration: number;
    totalTime: number; // minutes
  };
  
  // Performance Metrics
  performance: {
    averageScore: number;
    scoreDistribution: { [key: string]: number };
    improvement: number; // percentage change from previous period
    consistency: number; // score variance metric
  };
  
  // Skills Progress
  skillsProgress: {
    skillId: string;
    startLevel: number;
    currentLevel: number;
    improvement: number;
  }[];
  
  // Activity Patterns
  activity: {
    mostActiveDay: string;
    averageSessionsPerDay: number;
    preferredTime: string; // hour of day
    streak: number; // consecutive days
  };
  
  // Goals and Achievements
  goals: {
    target: number;
    achieved: number;
    progress: number; // percentage
  };
  
  achievements: string[]; // achievement IDs unlocked this period
  
  // Metadata
  generatedAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. Progress Tracking (`users/{userId}/progress/{trackingId}`)
**Detailed progress tracking for goals and milestones**

```typescript
interface ProgressTracking {
  trackingId: string;
  type: 'skill' | 'goal' | 'milestone' | 'streak';
  
  // Target Information
  target: {
    name: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string; // 'sessions', 'points', 'level', etc.
    deadline?: Timestamp;
  };
  
  // Current Progress
  current: {
    value: number;
    percentage: number;
    lastUpdated: Timestamp;
  };
  
  // History
  history: {
    date: Timestamp;
    value: number;
    change: number;
    note?: string;
  }[];
  
  // Status
  status: 'active' | 'completed' | 'paused' | 'failed';
  priority: 'low' | 'medium' | 'high';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

### 6. Activity Log (`users/{userId}/activities/{activityId}`)
**Detailed activity and event logging**

```typescript
interface ActivityLog {
  activityId: string;
  
  // Activity Details
  type: 'session_start' | 'session_complete' | 'skill_practice' | 'goal_achieved' | 'milestone_reached';
  action: string;
  description: string;
  
  // Context
  sessionId?: string;
  skillId?: string;
  targetId?: string;
  
  // Data
  data: Record<string, any>; // flexible data storage
  
  // Impact
  impact: {
    skillsAffected: string[];
    scoreChange?: number;
    levelChange?: number;
    streakUpdate?: number;
  };
  
  // Metadata
  timestamp: Timestamp;
  source: 'user_action' | 'system_event' | 'ai_analysis';
  device?: string;
  userAgent?: string;
}
```

### 7. Achievements (`users/{userId}/achievements/{achievementId}`)
**User achievements and badges**

```typescript
interface UserAchievement {
  achievementId: string;
  
  // Achievement Details
  name: string;
  description: string;
  category: 'sessions' | 'skills' | 'streaks' | 'scores' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Requirements
  requirements: {
    type: string;
    value: number;
    timeframe?: string;
  };
  
  // Status
  isUnlocked: boolean;
  progress: number; // 0-100
  unlockedAt?: Timestamp;
  
  // Rewards
  rewards: {
    points: number;
    badges: string[];
    features?: string[];
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Indexes and Performance Optimization

### Composite Indexes Needed:
1. `users/{userId}/sessions` - (`status`, `createdAt`)
2. `users/{userId}/sessions` - (`config.interviewType`, `createdAt`)
3. `users/{userId}/activities` - (`type`, `timestamp`)
4. `users/{userId}/skills` - (`category`, `currentLevel`)
5. `users/{userId}/analytics` - (`period`, `date`)

### Query Patterns:
- Recent sessions by user
- Skills by category and level
- Analytics by time period
- Activities by type and date range
- Progress tracking by status

## Security Considerations

- All user data is scoped under their UID
- Read/write permissions only for authenticated users on their own data
- Admin collection for system-wide settings (separate from user data)
- Audit trail for sensitive operations

## Scalability Notes

- Use subcollections to avoid document size limits
- Implement pagination for large collections
- Consider data archival strategy for old sessions
- Use batch operations for related updates
- Implement caching for frequently accessed data