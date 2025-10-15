# Authentication Flow

## Overview

Grant Guide implements a comprehensive authentication system using Firebase Authentication. The system supports multiple authentication methods, automatic user profile creation, secure session management, and integration with job market preferences.

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Application                        │
├─────────────────────────────────────────────────────────────────┤
│  Auth Components        │  Auth Provider      │  Auth Guards     │
│  • LoginForm           │  • useAuth Hook     │  • useAuthGuard  │
│  • SignUpForm          │  • Global State     │  • Protected     │
│  • AuthForm            │  • User Context     │    Routes        │
├─────────────────────────────────────────────────────────────────┤
│                       Auth Services                             │
├─────────────────────────────────────────────────────────────────┤
│  Authentication         │  User Management    │  Profile         │
│  • Email/Password       │  • Profile Creation │  • Data Sync     │
│  • OAuth (GitHub)       │  • Session Handling │  • Updates       │
│  • Session Management   │  • User Data Fetch  │  • Preferences   │
├─────────────────────────────────────────────────────────────────┤
│                      Firebase Backend                           │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Auth          │  Firestore          │  Security Rules  │
│  • User Management      │  • User Profiles    │  • Access Control│
│  • Token Management     │  • Profile Data     │  • Data Privacy  │
│  • Provider Integration │  • Skills & Sessions│  • GDPR Compliance│
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Methods

### 1. Email/Password Authentication

**Sign Up Flow**
```typescript
// 1. User submits registration form
const registrationData = {
  email: "user@example.com",
  password: "securePassword",
  displayName: "John Doe",
  role: "Software Engineer",
  experience: "3-5 years",
  howDidYouHear: "Google Search"
};

// 2. Firebase Auth creates user account
const { user, error } = await createUserWithEmailAndPasswordAuth(
  email, 
  password, 
  displayName, 
  additionalData
);

// 3. Comprehensive profile creation
await DatabaseService.createUserWithCompleteProfile(user.uid, {
  email: user.email,
  displayName,
  role,
  experience,
  howDidYouHear,
  // Default skills are automatically added
});

// 4. User is automatically signed in
```

**Sign In Flow**
```typescript
// 1. User submits login credentials
const { user, error } = await signInWithEmailAndPassword(email, password);

// 2. Update last login timestamp
await DatabaseService.updateUserLastLogin(user.uid);

// 3. Fetch user profile data
const userData = await getUserData(user.uid);

// 4. Set global auth state
setUser(user);
setUserData(userData);
```

### 2. OAuth Authentication (GitHub)

**GitHub OAuth Flow**
```typescript
// 1. User clicks "Sign in with GitHub"
const { user, error } = await signInWithGitHub();

// 2. Check if user profile exists
const userDoc = await getDoc(doc(db, "users", user.uid));

// 3a. If new user - create profile
if (!userDoc.exists()) {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    // Default values for new OAuth users
    role: "",
    experience: "",
    howDidYouHear: "GitHub OAuth"
  };
  await safeSetDoc(doc(db, "users", user.uid), userData);
}

// 3b. If existing user - update last login
else {
  await updateUserLastLogin(user.uid);
}
```

## Auth Provider Implementation

### Context Provider (`/src/providers/auth-provider.tsx`)

```typescript
interface AuthContextType {
  user: User | null;                // Firebase User object
  userData: UserData | null;        // Extended user profile
  loading: boolean;                 // Auth state loading
  signOut: () => Promise<void>;     // Sign out function
  refreshUserData: () => Promise<void>; // Refresh profile data
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch extended user data from Firestore
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          // Handle offline scenarios gracefully
          console.warn("Failed to fetch user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ... provider implementation
};
```

### useAuth Hook

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

## Authentication Guards

### useAuthGuard Hook

```typescript
export const useAuthGuard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page if not authenticated
      router.push('/auth');
    }
  }, [user, loading, router]);

  return { loading, user };
};
```

### Protected Route Implementation

```typescript
// In protected pages
export default function DashboardPage() {
  const { loading, user } = useAuthGuard();

  // Show loading while checking auth state
  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  // Render protected content
  return <DashboardContent />;
}
```

## User Profile Management

### Profile Creation Process

**1. Initial Profile Setup**
```typescript
const createUserWithCompleteProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
) => {
  // Create comprehensive user profile
  const profile: UserProfile = {
    uid: userId,
    email: profileData.email || "",
    displayName: profileData.displayName,
    photoURL: profileData.photoURL,
    role: profileData.role || "",
    experience: profileData.experience || "",
    howDidYouHear: profileData.howDidYouHear || "",
    
    // Default preferences
    preferences: {
      preferredDifficulty: "intermediate",
      preferredInterviewTypes: ["technical"],
      targetCompanies: [],
      notificationsEnabled: true,
      darkMode: false,
      language: "en",
      timezone: "America/New_York"
    },
    
    // Default subscription
    subscription: {
      plan: "free",
      status: "active",
      features: ["basic-interviews", "progress-tracking"],
      limits: {
        sessionsPerMonth: 10,
        skillsTracking: 5,
        analyticsRetention: 30
      }
    },
    
    // Timestamps
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    lastActiveAt: Timestamp.now(),
    isActive: true
  };

  // Save profile to Firestore
  await safeSetDoc(doc(db, "users", userId), profile);
  
  // Create default skills
  await createDefaultSkills(userId);
  
  return profile;
};
```

**2. Default Skills Creation**
```typescript
const createDefaultSkills = async (userId: string) => {
  const defaultSkills = [
    { name: "JavaScript Fundamentals", category: "technical" },
    { name: "System Design", category: "technical" },
    { name: "Communication Skills", category: "soft-skills" },
    { name: "Problem Solving", category: "soft-skills" },
    { name: "Leadership", category: "behavioral" }
  ];

  for (const skill of defaultSkills) {
    await SkillsService.createSkill(userId, skill);
  }
};
```

### Profile Updates

```typescript
const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const updateData = {
    ...updates,
    lastActiveAt: Timestamp.now()
  };
  
  await safeUpdateDoc(doc(db, "users", userId), updateData);
  
  // Refresh auth provider data
  await refreshUserData();
};
```

## Session Management

### Token Handling

```typescript
// Firebase handles all token management automatically
// Tokens are refreshed automatically before expiration
// Custom token handling for API calls:

const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
```

### Session Persistence

```typescript
// Configure Firebase Auth persistence
setPersistence(auth, browserSessionPersistence); // Session only
// or
setPersistence(auth, browserLocalPersistence);   // Persistent across browser sessions
```

## Error Handling

### Authentication Errors

```typescript
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Invalid password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

### Offline Handling

```typescript
// Auth provider handles offline scenarios
const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const profile = await DatabaseService.getUserProfile(uid);
    return profile ? userProfileToUserData(profile) : null;
  } catch (error) {
    // Log error but don't block authentication
    console.warn("Firebase offline or connectivity issues:", error);
    return null; // App continues with limited functionality
  }
};
```

## Security Considerations

### 1. **Client-Side Security**
- Sensitive operations require re-authentication
- User input validation and sanitization
- Secure token storage (handled by Firebase)

### 2. **Server-Side Security**
- Firestore security rules enforce access control
- User data isolation by UID
- Rate limiting on authentication attempts

### 3. **Data Privacy**
- GDPR compliance for EU users
- Data retention policies
- User consent management
- Right to deletion support

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcollections inherit user access control
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public collections (read-only for authenticated users)
    match /skills_library/{document} {
      allow read: if request.auth != null;
    }
    
    match /companies/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

## Testing Authentication

### Unit Tests
```typescript
describe('Authentication Service', () => {
  test('should create user with email and password', async () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    };
    
    const result = await createUserWithEmailAndPasswordAuth(
      mockUserData.email,
      mockUserData.password,
      mockUserData.displayName,
      {}
    );
    
    expect(result.user).toBeTruthy();
    expect(result.error).toBeNull();
  });
});
```

### Integration Tests
```typescript
describe('Auth Flow Integration', () => {
  test('should complete full registration flow', async () => {
    // Test registration → profile creation → default skills
    const user = await registerNewUser(mockUserData);
    const profile = await getUserProfile(user.uid);
    const skills = await getUserSkills(user.uid);
    
    expect(profile).toBeTruthy();
    expect(skills.length).toBeGreaterThan(0);
  });
});
```

---

*This authentication system provides secure, scalable user management while maintaining excellent user experience and offline capabilities.*