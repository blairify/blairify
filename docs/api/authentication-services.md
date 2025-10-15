# Authentication Services API

## Overview

The Authentication Services provide secure user management functionality using Firebase Authentication. These services handle user registration, login, session management, and profile integration with comprehensive error handling and offline support.

## Service Architecture

```
Authentication Layer
├── Firebase Auth          # Core authentication provider
├── User Management        # Profile creation and updates  
├── Session Handling       # Auth state management
├── OAuth Integration      # Third-party authentication
└── Error Management       # Comprehensive error handling
```

## Core Authentication Functions

### User Registration

#### `registerWithEmailAndPassword(email, password, displayName, additionalData)`

Creates a new user account with email and password, including complete profile setup.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 6 characters)
- `displayName` (string): User's display name
- `additionalData` (object): Additional profile information
  - `role` (string): Target job role
  - `experience` (string): Experience level
  - `howDidYouHear` (string): How they discovered the app

**Returns:**
```typescript
Promise<{
  user: User | null;
  error: string | null;
}>
```

**Example:**
```typescript
const result = await registerWithEmailAndPassword(
  'user@example.com',
  'securePassword123',
  'John Doe',
  {
    role: 'Software Engineer',
    experience: '3-5 years',
    howDidYouHear: 'Google Search'
  }
);

if (result.error) {
  console.error('Registration failed:', result.error);
} else {
  console.log('User registered:', result.user?.uid);
}
```

**Process Flow:**
1. Create Firebase Auth account
2. Update user display name
3. Create comprehensive user profile in Firestore
4. Initialize default skills
5. Set up subscription defaults
6. Return user object or error

### User Sign In

#### `signInWithEmailAndPassword(email, password)`

Authenticates user with email and password credentials.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:**
```typescript
Promise<{
  user: User | null;
  error: string | null;
}>
```

**Example:**
```typescript
const result = await signInWithEmailAndPassword(
  'user@example.com',
  'userPassword123'
);

if (result.user) {
  console.log('Sign in successful');
  // User is automatically set in auth context
} else {
  console.error('Sign in failed:', result.error);
}
```

**Process Flow:**
1. Authenticate with Firebase Auth
2. Update last login timestamp
3. Load user profile data
4. Set auth context state

### OAuth Authentication

#### `signInWithGitHub()`

Authenticates user using GitHub OAuth provider.

**Returns:**
```typescript
Promise<{
  user: User | null;
  error: string | null;
}>
```

**Example:**
```typescript
const result = await signInWithGitHub();

if (result.user) {
  console.log('GitHub sign in successful');
} else {
  console.error('GitHub sign in failed:', result.error);
}
```

**Process Flow:**
1. Open GitHub OAuth popup
2. Handle OAuth callback
3. Check if user profile exists
4. Create profile for new users
5. Update login timestamp for existing users

### User Data Management

#### `getUserData(uid)`

Retrieves comprehensive user profile data from Firestore.

**Parameters:**
- `uid` (string): Firebase Auth user ID

**Returns:**
```typescript
Promise<UserData | null>
```

**Example:**
```typescript
const userData = await getUserData(user.uid);

if (userData) {
  console.log('User profile:', userData.displayName);
  console.log('User role:', userData.role);
} else {
  console.log('No profile found or offline');
}
```

**Offline Handling:**
- Returns `null` gracefully on network errors
- Logs warnings for offline scenarios
- App continues with basic auth data

### Session Management

#### `signOutUser()`

Signs out the current user and clears session data.

**Returns:**
```typescript
Promise<{
  success: boolean;
  error: string | null;
}>
```

**Example:**
```typescript
const result = await signOutUser();

if (result.success) {
  console.log('User signed out successfully');
  // Auth context automatically updates
} else {
  console.error('Sign out failed:', result.error);
}
```

#### `onAuthStateChange(callback)`

Sets up authentication state listener for real-time auth updates.

**Parameters:**
- `callback` (function): Function called when auth state changes

**Returns:**
- `unsubscribe` (function): Function to remove the listener

**Example:**
```typescript
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.uid);
  } else {
    console.log('User signed out');
  }
});

// Clean up listener
return () => unsubscribe();
```

## Error Handling

### Error Codes and Messages

The service maps Firebase error codes to user-friendly messages:

```typescript
const errorMappings = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Invalid password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  // Generic fallback
  'default': 'An unexpected error occurred. Please try again.'
};
```

### Common Error Scenarios

#### Registration Errors
```typescript
// Email already exists
const result = await registerWithEmailAndPassword(
  'existing@example.com',
  'password123',
  'John Doe',
  {}
);
// result.error: "An account with this email already exists."

// Weak password
const result = await registerWithEmailAndPassword(
  'new@example.com',
  '123',
  'John Doe',
  {}
);
// result.error: "Password should be at least 6 characters long."
```

#### Sign In Errors
```typescript
// Invalid credentials
const result = await signInWithEmailAndPassword(
  'user@example.com',
  'wrongpassword'
);
// result.error: "Invalid password. Please try again."

// User not found
const result = await signInWithEmailAndPassword(
  'nonexistent@example.com',
  'password123'
);
// result.error: "No account found with this email address."
```

#### Network Errors
```typescript
// Offline scenario
const result = await signInWithEmailAndPassword(
  'user@example.com',
  'password123'
);
// result.error: "Network error. Please check your connection."
```

## Integration with Auth Provider

### React Context Integration

The authentication services integrate seamlessly with the React Auth Provider:

```typescript
// AuthProvider implementation
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.warn('Failed to fetch user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Provider value and methods...
};
```

### useAuth Hook

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usage in components
const { user, userData, loading, signOut } = useAuth();
```

## Security Considerations

### Client-Side Security
- All sensitive operations require authentication
- User input validation and sanitization
- Secure token storage (handled by Firebase)
- Protected routes with authentication guards

### Server-Side Security
- Firestore security rules enforce access control
- User data isolation by UID
- Rate limiting on authentication attempts
- HTTPS-only in production

### Data Privacy
- GDPR compliance for EU users
- Cookie consent management
- Data retention policies
- Right to deletion support

## Testing Authentication

### Unit Tests
```typescript
describe('Authentication Service', () => {
  test('should register user successfully', async () => {
    const result = await registerWithEmailAndPassword(
      'test@example.com',
      'password123',
      'Test User',
      { role: 'Developer' }
    );
    
    expect(result.user).toBeTruthy();
    expect(result.error).toBeNull();
  });

  test('should handle registration errors', async () => {
    const result = await registerWithEmailAndPassword(
      'invalid-email',
      'weak',
      'Test User',
      {}
    );
    
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
```

### Integration Tests
```typescript
describe('Auth Flow Integration', () => {
  test('should complete registration and profile creation', async () => {
    // Register user
    const authResult = await registerWithEmailAndPassword(
      'integration@test.com',
      'password123',
      'Integration Test',
      { role: 'Test Engineer' }
    );
    
    expect(authResult.user).toBeTruthy();
    
    // Verify profile creation
    const userData = await getUserData(authResult.user!.uid);
    expect(userData?.role).toBe('Test Engineer');
    
    // Verify default skills creation
    const skills = await DatabaseService.getUserSkills(authResult.user!.uid);
    expect(skills.length).toBeGreaterThan(0);
  });
});
```

## Performance Optimization

### Caching Strategy
- Auth state cached in React context
- User data cached with refresh mechanism
- Offline-first approach for resilience

### Error Recovery
- Automatic retry for network errors
- Graceful degradation on service unavailability
- User-friendly error messages and recovery options

### Monitoring
- Auth success/failure tracking
- Performance metrics for auth operations
- Error reporting and alerting

---

*This authentication system provides secure, scalable user management with comprehensive error handling and excellent user experience.*