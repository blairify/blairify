# Database Schema

## Overview

Grant Guide uses Firebase Firestore as its primary database. The schema is designed to be scalable, efficient, and supports real-time updates. All collections follow a consistent naming convention and include proper indexing for optimal performance. The schema supports both interview preparation features and job market integration.

## Collections Structure

```
firestore/
├── users/                          # Main user profiles
│   ├── {userId}/                   # Document per user
│   │   ├── skills/                 # Subcollection: User skills
│   │   │   └── {skillId}           # Individual skill documents
│   │   ├── sessions/               # Subcollection: Interview sessions
│   │   │   └── {sessionId}         # Individual session documents
│   │   └── analytics/              # Subcollection: User analytics
│   │       └── {analyticsId}       # Analytics documents
├── skills_library/                 # Global skills reference
│   └── {skillId}                   # Skill definitions
├── companies/                      # Company information
│   └── {companyId}                 # Company profiles
└── system/                         # System-wide settings
    ├── config                      # Application configuration
    └── maintenance                 # Maintenance mode settings
```

## Detailed Schema

### 1. Users Collection (`/users/{userId}`)

**Main User Profile Document**
```typescript
interface UserProfile {
  // Identity
  uid: string;                      // Firebase Auth UID
  email: string;                    // User email
  displayName?: string;             // User display name
  photoURL?: string;                // Profile picture URL
  
  // Profile Information
  role: string;                     // Target role (e.g., "Software Engineer")
  experience: string;               // Experience level
  howDidYouHear: string;           // How they discovered the app
  
  // Preferences
  preferences: {
    preferredDifficulty: "beginner" | "intermediate" | "advanced";
    preferredInterviewTypes: InterviewType[];
    targetCompanies: string[];
    notificationsEnabled: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
    
    // Job Market Preferences
    jobSearchPreferences: {
      preferredJobTypes: ("fulltime" | "parttime" | "internship" | "contract")[];
      preferredLocations: string[];
      remotePreference: boolean;
      salaryRange: {
        min?: number;
        max?: number;
        currency: string;
      };
      preferredJobSites: string[];
      alertFrequency: "daily" | "weekly" | "monthly" | "disabled";
    };
  };
  
  // Subscription & Billing
  subscription: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "cancelled" | "past_due";
    features: string[];
    limits: {
      sessionsPerMonth: number;
      skillsTracking: number;
      analyticsRetention: number;
    };
  };
  
  // Timestamps
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActiveAt: Timestamp;
  isActive: boolean;
}
```

### 2. Skills Subcollection (`/users/{userId}/skills/{skillId}`)

**User Skills Document**
```typescript
interface UserSkill {
  skillId: string;                  // Unique skill identifier
  name: string;                     // Skill name
  category: SkillCategory;          // Skill category
  
  // Progress Tracking
  currentLevel: number;             // 0-100 proficiency
  targetLevel: number;              // Desired proficiency
  progress: {
    practiceHours: number;
    questionsAnswered: number;
    correctAnswers: number;
    averageScore: number;
    lastPracticed: Timestamp;
  };
  
  // Performance Data
  strengths: string[];              // Identified strengths
  weaknesses: string[];             // Areas for improvement
  recommendations: string[];        // AI-generated suggestions
  
  // Metadata
  isActive: boolean;                // Currently being practiced
  priority: "low" | "medium" | "high";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Sessions Subcollection (`/users/{userId}/sessions/{sessionId}`)

**Interview Session Document**
```typescript
interface InterviewSession {
  sessionId: string;                // Unique session identifier
  
  // Session Configuration
  type: InterviewType;              // Type of interview
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;                 // Planned duration in minutes
  targetRole: string;               // Role being practiced for
  
  // Session Content
  questions: InterviewQuestion[];   // Questions asked
  responses: UserResponse[];        // User responses
  
  // Performance & Scoring
  scores: {
    overall: number;                // Overall score (0-100)
    technical: number;              // Technical competency
    communication: number;          // Communication skills
    problemSolving: number;         // Problem-solving ability
    culturalFit: number;           // Cultural fit assessment
  };
  
  // Timing & Progress
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  startTime: Timestamp;
  endTime?: Timestamp;
  totalDuration?: number;           // Actual duration in minutes
  
  // Analysis & Feedback
  feedback: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
    nextSteps: string[];
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. Analytics Subcollection (`/users/{userId}/analytics/{analyticsId}`)

**User Analytics Document**
```typescript
interface UserAnalytics {
  analyticsId: string;              // Unique analytics identifier
  type: "daily" | "weekly" | "monthly" | "session";
  
  // Time Period
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Performance Metrics
  metrics: {
    totalSessions: number;
    totalTime: number;              // Minutes practiced
    averageScore: number;
    improvementRate: number;        // Percentage improvement
    streakDays: number;
    questionsAnswered: number;
  };
  
  // Skill Breakdown
  skillProgress: Array<{
    skillId: string;
    skillName: string;
    timeSpent: number;
    improvement: number;
    sessionsCount: number;
  }>;
  
  // Session Types
  sessionBreakdown: Array<{
    type: InterviewType;
    count: number;
    averageScore: number;
    totalTime: number;
  }>;
  
  // Goals & Achievements
  goals: Array<{
    goalId: string;
    description: string;
    target: number;
    current: number;
    achieved: boolean;
  }>;
  
  // Metadata
  createdAt: Timestamp;
  computedAt: Timestamp;
}
```

### 5. Skills Library Collection (`/skills_library/{skillId}`)

**Global Skill Definition**
```typescript
interface SkillDefinition {
  skillId: string;                  // Unique skill identifier
  name: string;                     // Skill name
  category: SkillCategory;          // Primary category
  
  // Skill Details
  description: string;              // Detailed description
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;           // Hours to master
  
  // Learning Resources
  resources: Array<{
    type: "article" | "video" | "course" | "book";
    title: string;
    url: string;
    description: string;
  }>;
  
  // Question Bank
  questions: Array<{
    questionId: string;
    question: string;
    difficulty: string;
    tags: string[];
    expectedAnswer: string;
    scoringCriteria: string[];
  }>;
  
  // Prerequisites & Related Skills
  prerequisites: string[];          // Required skills
  relatedSkills: string[];          // Related skills
  
  // Metadata
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                // Admin user ID
}
```

### 6. Companies Collection (`/companies/{companyId}`)

**Company Profile Document**
```typescript
interface CompanyProfile {
  companyId: string;                // Unique company identifier
  name: string;                     // Company name
  domain: string;                   // Company website domain
  
  // Company Information
  industry: string;                 // Industry sector
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  headquarters: string;             // Location
  description: string;              // Company description
  
  // Interview Information
  interviewProcess: {
    stages: string[];               // Interview stages
    averageDuration: number;        // Process duration in days
    commonQuestions: string[];      // Frequently asked questions
    tips: string[];                 // Interview tips
  };
  
  // Skills & Requirements
  commonSkills: string[];           // Frequently required skills
  techStack: string[];              // Technology stack
  
  // Metadata
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Indexing Strategy

### Composite Indexes

**User Sessions Query Optimization**
```
Collection: users/{userId}/sessions
Fields: status ASC, createdAt DESC
Use: Recent active sessions
```

**Skills Progress Tracking**
```
Collection: users/{userId}/skills
Fields: category ASC, currentLevel DESC
Use: Skills by category and proficiency
```

**Analytics Time Series**
```
Collection: users/{userId}/analytics
Fields: type ASC, startDate DESC
Use: Time-based analytics queries
```

### Single Field Indexes

- `createdAt` (DESC) on all collections
- `updatedAt` (DESC) on all collections  
- `isActive` (ASC) on relevant collections
- `status` (ASC) on sessions
- `category` (ASC) on skills

## Security Rules

### User Data Access
```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  // Subcollections inherit the same rules
  match /{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

### Public Collections
```javascript
// Skills library is read-only for authenticated users
match /skills_library/{skillId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    request.auth.token.admin == true;
}

// Companies are read-only for authenticated users
match /companies/{companyId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    request.auth.token.admin == true;
}
```

## Data Relationships

### 1. User → Skills Relationship
- One-to-Many: User has multiple skills
- Skills are user-specific instances of global skill definitions
- Progress tracking is personal to each user

### 2. User → Sessions Relationship  
- One-to-Many: User has multiple interview sessions
- Sessions contain references to practiced skills
- Historical data for progress tracking

### 3. Skills → Questions Relationship
- Many-to-Many: Skills can have multiple questions, questions can test multiple skills
- Questions are stored in the global skills library
- User responses are stored in session documents

### 4. User → Analytics Relationship
- One-to-Many: User has multiple analytics records
- Analytics are computed from sessions and skills data
- Different time granularities (daily, weekly, monthly)

## Migration & Versioning

### Schema Versioning
- Each document includes a `schemaVersion` field
- Migration scripts handle schema updates
- Backward compatibility maintained for at least 2 versions

### Data Migration Strategy
1. **Additive Changes**: Add new fields with default values
2. **Field Modifications**: Create new field, migrate data, remove old field
3. **Breaking Changes**: Version the entire collection structure

---

*This schema supports current functionality while being designed for future scalability and feature additions.*