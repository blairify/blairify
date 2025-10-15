# Database Services API

## Overview

The Database Services provide a comprehensive API for all database operations in Grant Guide. Built on top of Firebase Firestore, these services offer type-safe, error-resilient operations with automatic retry logic and offline support.

## Service Architecture

```
DatabaseService (Main Interface)
├── UserProfileService      # User profile CRUD operations
├── SkillsService          # Skills management and progress tracking
├── SessionsService        # Interview session management
├── AnalyticsService       # User analytics and metrics
└── BatchOperations        # Bulk operations and transactions
```

## Core Database Service

### Main Interface
```typescript
export class DatabaseService {
  // User Profile Operations
  static getUserProfile: (userId: string) => Promise<UserProfile | null>
  static createUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<UserProfile>
  static updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>
  
  // Skills Operations
  static getUserSkills: (userId: string) => Promise<UserSkill[]>
  static createSkill: (userId: string, skillData: Partial<UserSkill>) => Promise<UserSkill>
  static updateSkillProgress: (userId: string, skillId: string, progress: number) => Promise<void>
  
  // Session Operations
  static getUserSessions: (userId: string, limit?: number) => Promise<InterviewSession[]>
  static createSession: (userId: string, sessionData: Partial<InterviewSession>) => Promise<InterviewSession>
  static updateSession: (userId: string, sessionId: string, updates: Partial<InterviewSession>) => Promise<void>
  
  // Analytics Operations
  static getUserAnalytics: (userId: string, type?: string) => Promise<UserAnalytics[]>
  static updateAnalytics: (userId: string, analyticsData: Partial<UserAnalytics>) => Promise<void>
  
  // Comprehensive Operations
  static createUserWithCompleteProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<UserProfile>
  static deleteUserData: (userId: string) => Promise<void>
}
```

## UserProfileService

### Methods

#### `getProfile(userId: string): Promise<UserProfile | null>`

Retrieves a user's complete profile from Firestore.

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<UserProfile | null>`: User profile data or null if not found

**Example:**
```typescript
const profile = await DatabaseService.getUserProfile(user.uid);
if (profile) {
  console.log('User profile:', profile.displayName);
} else {
  console.log('Profile not found');
}
```

**Error Handling:**
- Throws error for network issues
- Returns null for non-existent profiles
- Automatic retry for connection errors

#### `createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile>`

Creates a new user profile with comprehensive default settings.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `profileData` (Partial<UserProfile>): Profile information

**Returns:**
- `Promise<UserProfile>`: Complete created profile

**Example:**
```typescript
const profile = await DatabaseService.createUserProfile(user.uid, {
  email: user.email,
  displayName: "John Doe",
  role: "Software Engineer",
  experience: "3-5 years",
  howDidYouHear: "Google Search"
});
```

**Default Values Applied:**
- Preferences with sensible defaults
- Free tier subscription settings
- Initial timestamps
- Active status

#### `updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void>`

Updates specific fields in a user's profile.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `updates` (Partial<UserProfile>): Fields to update

**Returns:**
- `Promise<void>`

**Example:**
```typescript
await DatabaseService.updateUserProfile(user.uid, {
  role: "Senior Software Engineer",
  preferences: {
    ...currentPreferences,
    preferredDifficulty: "advanced"
  }
});
```

**Automatic Updates:**
- `lastActiveAt` timestamp
- Validates data before saving

#### `updateLastLogin(userId: string): Promise<void>`

Updates the user's last login timestamp.

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<void>`

**Example:**
```typescript
await DatabaseService.updateUserLastLogin(user.uid);
```

## SkillsService

### Methods

#### `getUserSkills(userId: string): Promise<UserSkill[]>`

Retrieves all skills for a user, ordered by category and name.

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<UserSkill[]>`: Array of user skills

**Example:**
```typescript
const skills = await DatabaseService.getUserSkills(user.uid);
console.log(`User has ${skills.length} skills`);

// Group by category
const skillsByCategory = skills.reduce((acc, skill) => {
  acc[skill.category] = acc[skill.category] || [];
  acc[skill.category].push(skill);
  return acc;
}, {});
```

#### `getSkillsByCategory(userId: string, category: string): Promise<UserSkill[]>`

Retrieves skills filtered by category.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `category` (string): Skill category to filter by

**Returns:**
- `Promise<UserSkill[]>`: Array of skills in the category

**Example:**
```typescript
const technicalSkills = await SkillsService.getSkillsByCategory(user.uid, "technical");
const softSkills = await SkillsService.getSkillsByCategory(user.uid, "soft-skills");
```

#### `createSkill(userId: string, skillData: Partial<UserSkill>): Promise<UserSkill>`

Creates a new skill for the user.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `skillData` (Partial<UserSkill>): Skill information

**Returns:**
- `Promise<UserSkill>`: Created skill with generated ID

**Example:**
```typescript
const newSkill = await DatabaseService.createSkill(user.uid, {
  name: "React Hooks",
  category: "technical",
  targetLevel: 80,
  priority: "high"
});
```

**Default Values:**
- `currentLevel: 0`
- `progress` tracking initialized
- `isActive: true`
- Timestamps set

#### `updateSkillProgress(userId: string, skillId: string, progress: number): Promise<void>`

Updates skill progress and performance metrics.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `skillId` (string): Skill identifier
- `progress` (number): New progress level (0-100)

**Returns:**
- `Promise<void>`

**Example:**
```typescript
await DatabaseService.updateSkillProgress(user.uid, skillId, 75);
```

**Automatic Updates:**
- Progress history tracking
- Performance calculations
- Last practiced timestamp

#### `createDefaultSkills(userId: string): Promise<UserSkill[]>`

Creates a set of default skills for new users.

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<UserSkill[]>`: Array of created default skills

**Default Skills Created:**
- JavaScript Fundamentals (Technical)
- System Design (Technical)  
- Communication Skills (Soft Skills)
- Problem Solving (Soft Skills)
- Leadership (Behavioral)

## SessionsService

### Methods

#### `getUserSessions(userId: string, limit?: number): Promise<InterviewSession[]>`

Retrieves user's interview sessions, ordered by creation date.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `limit` (number, optional): Maximum number of sessions to return

**Returns:**
- `Promise<InterviewSession[]>`: Array of interview sessions

**Example:**
```typescript
// Get recent 10 sessions
const recentSessions = await DatabaseService.getUserSessions(user.uid, 10);

// Get all sessions
const allSessions = await DatabaseService.getUserSessions(user.uid);
```

#### `getSessionsByStatus(userId: string, status: SessionStatus): Promise<InterviewSession[]>`

Retrieves sessions filtered by status.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `status` (SessionStatus): Session status to filter by

**Returns:**
- `Promise<InterviewSession[]>`: Filtered sessions

**Example:**
```typescript
const completedSessions = await SessionsService.getSessionsByStatus(user.uid, "completed");
const inProgressSessions = await SessionsService.getSessionsByStatus(user.uid, "in_progress");
```

#### `createSession(userId: string, sessionData: Partial<InterviewSession>): Promise<InterviewSession>`

Creates a new interview session.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `sessionData` (Partial<InterviewSession>): Session configuration

**Returns:**
- `Promise<InterviewSession>`: Created session with generated ID

**Example:**
```typescript
const session = await DatabaseService.createSession(user.uid, {
  type: "technical",
  difficulty: "intermediate",
  duration: 60,
  targetRole: "Frontend Developer"
});
```

**Default Values:**
- `status: "scheduled"`
- `createdAt` timestamp
- Empty questions and responses arrays
- Initial scoring structure

#### `updateSession(userId: string, sessionId: string, updates: Partial<InterviewSession>): Promise<void>`

Updates session data, typically used for progress and completion.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `sessionId` (string): Session identifier
- `updates` (Partial<InterviewSession>): Session updates

**Returns:**
- `Promise<void>`

**Example:**
```typescript
// Complete a session
await DatabaseService.updateSession(user.uid, sessionId, {
  status: "completed",
  endTime: Timestamp.now(),
  scores: {
    overall: 85,
    technical: 90,
    communication: 80,
    problemSolving: 85,
    culturalFit: 80
  },
  feedback: {
    strengths: ["Strong technical knowledge", "Clear communication"],
    improvements: ["Practice system design", "Ask more clarifying questions"],
    detailedFeedback: "Great performance overall...",
    nextSteps: ["Focus on scalability concepts", "Practice with mock interviews"]
  }
});
```

## AnalyticsService

### Methods

#### `getUserAnalytics(userId: string, type?: string): Promise<UserAnalytics[]>`

Retrieves analytics data for a user.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `type` (string, optional): Analytics type filter ("daily", "weekly", "monthly")

**Returns:**
- `Promise<UserAnalytics[]>`: Array of analytics records

**Example:**
```typescript
// Get all analytics
const allAnalytics = await DatabaseService.getUserAnalytics(user.uid);

// Get monthly analytics only
const monthlyAnalytics = await DatabaseService.getUserAnalytics(user.uid, "monthly");
```

#### `computeUserAnalytics(userId: string): Promise<UserAnalytics>`

Computes fresh analytics from user's sessions and skills data.

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<UserAnalytics>`: Computed analytics

**Computed Metrics:**
- Total sessions and practice time
- Average scores and improvement rates
- Skill progress and weaknesses
- Goal tracking and achievements

## Batch Operations

### Methods

#### `createUserWithCompleteProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile>`

Creates a complete user setup including profile, default skills, and analytics initialization.

**Parameters:**
- `userId` (string): Firebase Auth UID
- `profileData` (Partial<UserProfile>): Initial profile data

**Returns:**
- `Promise<UserProfile>`: Created profile

**Operations Performed:**
1. Create user profile with defaults
2. Create default skills set
3. Initialize analytics tracking
4. Set up subscription defaults

**Example:**
```typescript
const profile = await DatabaseService.createUserWithCompleteProfile(user.uid, {
  email: user.email,
  displayName: "John Doe",
  role: "Software Engineer",
  experience: "2-3 years",
  howDidYouHear: "Google Search"
});

// User now has complete setup:
// - Profile with preferences
// - 5 default skills
// - Analytics initialized
// - Free tier subscription
```

#### `deleteUserData(userId: string): Promise<void>`

Completely removes all user data from the database (GDPR compliance).

**Parameters:**
- `userId` (string): Firebase Auth UID

**Returns:**
- `Promise<void>`

**Operations Performed:**
1. Delete all user sessions
2. Delete all user skills
3. Delete analytics data
4. Delete user profile
5. Clean up any orphaned references

**Example:**
```typescript
// Complete user data deletion
await DatabaseService.deleteUserData(user.uid);
```

## Error Handling

### Error Types

#### `FirestoreError`
Standard Firestore errors with additional context:
- `permission-denied`: User lacks access rights
- `not-found`: Document doesn't exist
- `unavailable`: Service temporarily unavailable
- `deadline-exceeded`: Operation timeout

#### `ConnectionError`
Network and connectivity issues:
- Offline scenarios
- Network timeouts
- Service unavailable

#### `ValidationError`
Data validation failures:
- Required fields missing
- Invalid data types
- Business rule violations

### Retry Logic

All database operations include automatic retry logic:

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Automatic retry for connection errors
if (retryCount < MAX_RETRIES && isConnectionError(error)) {
  await wait(RETRY_DELAYS[retryCount]);
  return operation(retryCount + 1);
}
```

### Error Recovery Examples

```typescript
try {
  const profile = await DatabaseService.getUserProfile(userId);
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle authorization issues
    redirectToAuth();
  } else if (error.code === 'unavailable') {
    // Show offline message
    showOfflineIndicator();
  } else {
    // Generic error handling
    showErrorMessage('Failed to load profile');
  }
}
```

## Performance Considerations

### Caching Strategy
- Firestore automatic caching for offline support
- Memory caching for frequently accessed data
- Cache invalidation on updates

### Query Optimization
- Composite indexes for complex queries
- Pagination for large result sets
- Field selection to minimize data transfer

### Batch Operations
- Multiple reads/writes in single batch
- Atomic transactions for data consistency
- Bulk operations for efficiency

---

*This API provides a complete, type-safe interface for all database operations while handling errors gracefully and optimizing for performance.*