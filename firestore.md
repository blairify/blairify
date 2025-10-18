Firebase + Firestore Setup Guide
Prerequisites

Google Cloud Project (or create one)
Firebase CLI installed: npm install -g firebase-tools
Node.js and npm installed


1. Initial Firebase Setup
Step 1: Create Firebase Project

Go to Firebase Console
Click "Create a project"
Name it (e.g., "interview-practice-platform")
Enable Google Analytics (optional)
Create the project

Step 2: Enable Firebase Services
In Firebase Console, go to each section and enable:

Authentication → Sign-in methods → Enable Email/Password, Google, GitHub
Firestore Database → Create database in production mode

Select your region (closest to your users)
Start with production rules (we'll customize them)



Step 3: Initialize Firebase Locally
bashfirebase login
firebase init firestore
# Select your project
# Accept default firestore.rules and firestore.indexes.json

2. Firestore Collection Structure
Create this exact collection hierarchy:
firebase/
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Composite indexes
└── collections/
    ├── users/
    │   ├── {userId}/
    │   │   ├── profile (main user data)
    │   │   ├── preferences (subcollection)
    │   │   └── practice-progress/
    │   │       └── {questionId}
    │   │
    ├── interview-sessions/
    │   ├── {sessionId}/
    │   │   ├── config, questions, responses, analysis
    │   │   └── related-data
    │   │
    ├── practice-questions/
    │   ├── {questionId}/
    │   │   ├── main question document
    │   │   └── stats/ (subcollection)
    │   │       └── {statType}
    │   │
    ├── practice-collections/
    │   └── {collectionId}/
    │
    ├── training-sets/
    │   └── {setId}/
    │
    ├── ai-responses/
    │   └── {responseId}/
    │
    ├── question-facets/
    │   └── current/
    │
    ├── user-skills/
    │   └── {userId}/{skillId}
    │
    ├── analytics/
    │   └── {userId}/
    │       └── {period}/{date}
    │
    ├── progress-tracking/
    │   └── {trackingId}/
    │
    ├── activity-logs/
    │   └── {activityId}/
    │
    └── achievements/
        └── {achievementId}/

3. Security Rules (firestore.rules)
javascriptrules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // ===== USERS COLLECTION =====
    match /users/{userId} {
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow write: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn();
      
      // User preferences subcollection
      match /preferences/{document=**} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
      
      // User practice progress
      match /practice-progress/{questionId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }

    // ===== INTERVIEW SESSIONS =====
    match /interview-sessions/{sessionId} {
      allow create: if isSignedIn();
      allow read, update: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || isAdmin());
      allow delete: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || isAdmin());
      
      // Subcollections
      match /{document=**} {
        allow read, write: if isSignedIn() && 
          (get(/databases/$(database)/documents/interview-sessions/$(sessionId)).data.uid == request.auth.uid || isAdmin());
      }
    }

    // ===== PRACTICE QUESTIONS (Public Read, Admin Write) =====
    match /practice-questions/{questionId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn() && isAdmin();
      
      // Usage stats subcollection
      match /stats/{statType} {
        allow read: if isSignedIn();
        allow write: if isSignedIn() && isAdmin();
      }
    }

    // ===== PRACTICE COLLECTIONS =====
    match /practice-collections/{collectionId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
        (resource.data.createdBy == request.auth.uid || isAdmin());
    }

    // ===== TRAINING SETS =====
    match /training-sets/{setId} {
      allow read: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || resource.data.isPublic == true || isAdmin());
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || isAdmin());
    }

    // ===== AI RESPONSES (Immutable, Read-Only) =====
    match /ai-responses/{responseId} {
      allow read: if isSignedIn() && 
        (get(/databases/$(database)/documents/interview-sessions/$(get(this.data.sessionId).data.uid == request.auth.uid)) || isAdmin());
      allow create: if isSignedIn() && isAdmin();
      allow delete: if false; // Immutable - no deletions
    }

    // ===== QUESTION FACETS (Public Read, Admin Write) =====
    match /question-facets/{document=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && isAdmin();
    }

    // ===== USER SKILLS =====
    match /user-skills/{userId}/{skillId} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }

    // ===== ANALYTICS (User-scoped) =====
    match /analytics/{userId}/{document=**} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }

    // ===== PROGRESS TRACKING =====
    match /progress-tracking/{trackingId} {
      allow read, write: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || isAdmin());
    }

    // ===== ACTIVITY LOGS =====
    match /activity-logs/{activityId} {
      allow read, write: if isSignedIn() && 
        (resource.data.uid == request.auth.uid || isAdmin());
    }

    // ===== ACHIEVEMENTS =====
    match /achievements/{achievementId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn() && isAdmin();
    }

    // ===== DEFAULT DENY =====
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

4. Composite Indexes (firestore.indexes.json)
json{
  "indexes": [
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" },
        { "fieldPath": "verified", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "difficulty", "order": "ASCENDING" },
        { "fieldPath": "companies", "order": "CONTAINS" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "primaryTechStack", "order": "CONTAINS" },
        { "fieldPath": "difficulty", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "programmingLanguages", "order": "CONTAINS" },
        { "fieldPath": "difficulty", "order": "ASCENDING" },
        { "fieldPath": "verified", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "popularityScore", "order": "DESCENDING" },
        { "fieldPath": "verified", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "qualityScore", "order": "DESCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "techCategories", "order": "CONTAINS" },
        { "fieldPath": "difficulty", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "practice-questions",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}

5. Deploy Rules and Indexes
bash# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes (may take 5-10 minutes)
firebase deploy --only firestore:indexes

6. Firebase Authentication Setup
In Firebase Console:

Build → Authentication
Sign-in method tab → Enable:

Email/Password
Google (add OAuth credentials)
GitHub (optional)


Users tab → Test creating a user

In your frontend code:
javascriptimport { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config (get from Firebase Console → Project settings)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

7. Initialize User Document on Sign-up
When a user signs up, create their user profile:
javascriptimport { doc, setDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function signUp(email, password, displayName) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCred.user.uid), {
      uid: userCred.user.uid,
      email: userCred.user.email,
      displayName: displayName,
      photoURL: null,
      profileCompleted: false,
      role: 'user', // 'user', 'admin', etc.
      experience: [],
      notificationsEnabled: true,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
      isActive: true,
      subscription: {
        plan: 'free',
        status: 'active',
        features: ['practice_questions', 'basic_analytics'],
        limits: {
          sessionsPerMonth: 10,
          skillsTracking: 5,
          analyticsRetention: 30
        }
      }
    });
    
    return userCred.user;
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
}

8. Create Sample Collections Structure
Example: Add a Practice Question
javascriptimport { collection, addDoc, Timestamp } from 'firebase/firestore';

async function addPracticeQuestion() {
  try {
    const questionsRef = collection(db, 'practice-questions');
    
    const question = {
      category: 'behavioral',
      subcategory: 'leadership',
      difficulty: 'medium',
      interviewType: 'behavioral',
      companies: ['Google', 'Meta'],
      primaryTechStack: ['team-management', 'agile'],
      secondaryTechStack: [],
      techCategories: ['soft-skills'],
      programmingLanguages: [],
      verified: true,
      aiGenerated: false,
      isActive: true,
      question: 'Tell me about a time you led a team through a challenging project.',
      context: 'Leadership and project management scenario',
      answer: {
        content: 'Use the STAR method to structure your response...',
        keyPoints: [
          'Clear leadership approach',
          'Measurable outcomes',
          'Team collaboration'
        ],
        starFramework: {
          situation: 'Situation description',
          task: 'Task description',
          action: 'Action taken',
          result: 'Results achieved'
        }
      },
      topicTags: ['leadership', 'teamwork', 'communication'],
      source: 'Admin',
      createdAt: Timestamp.now(),
      lastUpdatedAt: Timestamp.now(),
      version: 1,
      estimatedMinutes: 10,
      usageStats: {
        usedByCount: 0,
        totalAttempts: 0,
        avgScore: 0,
        avgTimeToComplete: 0,
        completionRate: 0,
        successRate: 0,
        usageLast7Days: 0,
        usageLast30Days: 0
      },
      popularityScore: 0,
      qualityScore: 0
    };
    
    const docRef = await addDoc(questionsRef, question);
    console.log('Question added:', docRef.id);
  } catch (error) {
    console.error('Error adding question:', error);
  }
}

9. Data Import Strategy (for 3k+ questions)
Option 1: Bulk Import via Firebase Admin SDK (Recommended)
javascript// Node.js script - run locally or in Cloud Functions
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const db = admin.firestore();

async function importQuestions() {
  const questionsData = JSON.parse(fs.readFileSync('./questions.json'));
  
  const batch = db.batch();
  let count = 0;
  
  for (const question of questionsData) {
    const docRef = db.collection('practice-questions').doc();
    batch.set(docRef, {
      ...question,
      createdAt: admin.firestore.Timestamp.now(),
      lastUpdatedAt: admin.firestore.Timestamp.now()
    });
    
    count++;
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Imported ${count} questions`);
      batch = db.batch();
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
    console.log(`Completed: ${count} questions imported`);
  }
}

importQuestions().catch(console.error);
Get serviceAccountKey.json from Firebase Console → Project settings → Service accounts.
Option 2: Use Firebase Extensions
Install the "Firestore Bulk Importer" extension via Firebase Console.

10. Key Setup Checklist

 Firebase project created
 Firestore database initialized
 Authentication enabled (Email, Google)
 firestore.rules deployed
 firestore.indexes.json deployed (wait for indexing to complete)
 Initial user collection structure created
 Sample practice questions imported
 Backend connected to Firestore
 User creation flow tested
 Authentication middleware implemented
 Error handling in place


11. Environment Configuration
Create .env.local:
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

12. Testing Your Setup
javascript// Test write access
async function testWrite() {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user signed in');
    return;
  }
  
  try {
    await setDoc(doc(db, 'users', user.uid, 'preferences', 'test'), {
      theme: 'dark',
      language: 'en'
    });
    console.log('✓ Write successful');
  } catch (error) {
    console.error('✗ Write failed:', error);
  }
}

// Test read access
async function testRead() {
  try {
    const docSnap = await getDoc(doc(db, 'practice-questions', 'sample-id'));
    console.log('✓ Read successful:', docSnap.exists());
  } catch (error) {
    console.error('✗ Read failed:', error);
  }
}

---

## 13. Implementation Scripts

### Create Firebase Admin SDK Initialization (`scripts/firebase-admin.ts`)

```typescript
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

let firebaseAdmin: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const possiblePaths = [
      path.join(process.cwd(), 'serviceAccountKey.json'),
      path.join(process.cwd(), 'config', 'serviceAccountKey.json'),
      path.join(__dirname, '..', 'serviceAccountKey.json'),
    ];

    let serviceAccountPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        serviceAccountPath = possiblePath;
        break;
      }
    }

    if (!serviceAccountPath) {
      throw new Error(
        'Service account key file not found. Download from Firebase Console.'
      );
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('✅ Firebase Admin SDK initialized');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export function getFirestore(): admin.firestore.Firestore {
  if (!firebaseAdmin) initializeFirebaseAdmin();
  return admin.firestore();
}

export { admin };
```

### Create Bulk Import Script (`scripts/import-practice-questions.ts`)

```typescript
import { getFirestore, admin, initializeFirebaseAdmin } from './firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

interface PracticeQuestion {
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interviewType: 'behavioral' | 'technical' | 'system-design';
  companies: string[];
  primaryTechStack: string[];
  secondaryTechStack: string[];
  techCategories: string[];
  programmingLanguages: string[];
  verified: boolean;
  aiGenerated: boolean;
  isActive: boolean;
  question: string;
  context?: string;
  answer: {
    content: string;
    keyPoints: string[];
    starFramework?: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  };
  topicTags: string[];
  source: string;
  estimatedMinutes: number;
  usageStats: {
    usedByCount: number;
    totalAttempts: number;
    avgScore: number;
    avgTimeToComplete: number;
    completionRate: number;
    successRate: number;
    usageLast7Days: number;
    usageLast30Days: number;
  };
  popularityScore: number;
  qualityScore: number;
}

async function importQuestions() {
  initializeFirebaseAdmin();
  const db = getFirestore();

  // Load questions from JSON file
  const questionsPath = path.join(__dirname, '../data/questions.json');
  
  if (!fs.existsSync(questionsPath)) {
    console.error('❌ questions.json not found. Please create it first.');
    return;
  }

  const questionsData: PracticeQuestion[] = JSON.parse(
    fs.readFileSync(questionsPath, 'utf8')
  );

  console.log(`📦 Importing ${questionsData.length} questions...`);

  // Process in batches (Firestore batch limit is 500)
  const batchSize = 500;
  let totalImported = 0;

  for (let i = 0; i < questionsData.length; i += batchSize) {
    const batch = db.batch();
    const questionsChunk = questionsData.slice(i, i + batchSize);

    questionsChunk.forEach((question) => {
      const docRef = db.collection('practice-questions').doc();
      batch.set(docRef, {
        ...question,
        createdAt: admin.firestore.Timestamp.now(),
        lastUpdatedAt: admin.firestore.Timestamp.now(),
        version: 1,
      });
    });

    await batch.commit();
    totalImported += questionsChunk.length;
    console.log(`✅ Imported ${totalImported}/${questionsData.length} questions`);
  }

  console.log('🎉 Import completed successfully!');
}

if (require.main === module) {
  importQuestions().catch(console.error);
}

export { importQuestions };
```

### Update User Signup (`src/lib/auth.ts` or similar)

Add this function to create proper user documents:

```typescript
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  if (!auth || !db) throw new Error('Firebase not initialized');

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCred.user.uid), {
      uid: userCred.user.uid,
      email: userCred.user.email,
      displayName: displayName,
      photoURL: null,
      profileCompleted: false,
      role: 'user',
      experience: [],
      notificationsEnabled: true,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
      isActive: true,
      subscription: {
        plan: 'free',
        status: 'active',
        features: ['practice_questions', 'basic_analytics'],
        limits: {
          sessionsPerMonth: 10,
          skillsTracking: 5,
          analyticsRetention: 30,
        },
      },
    });

    return userCred.user;
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
}
```

### Create Test Utilities (`scripts/test-firestore.ts`)

```typescript
import { getFirestore, initializeFirebaseAdmin } from './firebase-admin';

async function testFirestoreSetup() {
  initializeFirebaseAdmin();
  const db = getFirestore();

  console.log('🧪 Testing Firestore setup...\n');

  // Test 1: Check connection
  try {
    const testDoc = await db.collection('connection-test').doc('test').get();
    console.log('✅ Connection test passed');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }

  // Test 2: Check collections exist
  const collections = [
    'users',
    'practice-questions',
    'interview-sessions',
    'training-sets',
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      console.log(
        `✅ Collection '${collectionName}': ${snapshot.size} documents (sample)`
      );
    } catch (error) {
      console.error(`❌ Collection '${collectionName}' error:`, error);
    }
  }

  console.log('\n🎉 Firestore setup test completed!');
}

if (require.main === module) {
  testFirestoreSetup().catch(console.error);
}

export { testFirestoreSetup };
```

## 14. Deployment Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes (takes 5-10 minutes)
firebase deploy --only firestore:indexes

# Run import script
npx ts-node scripts/import-practice-questions.ts

# Test setup
npx ts-node scripts/test-firestore.ts
```