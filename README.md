# Blairify - Interview Practice Platform

An AI-powered interview practice platform built with Next.js, Firebase, and Firestore.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Firestore enabled

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase config to .env.local
```

### Environment Variables

Create `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🔥 Firebase Setup

### 1. Initialize Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firestore (if not already done)
firebase init firestore
```

### 2. Deploy Security Rules and Indexes

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes (takes 5-10 minutes to build)
firebase deploy --only firestore:indexes
```

### 3. Set Up Service Account for Bulk Imports

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Project Settings → Service Accounts**
3. Click **Generate new private key**
4. Save the JSON file as `serviceAccountKey.json` in the project root
5. The file is already in `.gitignore` - never commit it!

### 4. Import Practice Questions

See `firestore.md` for detailed implementation scripts.

## 📚 Collection Structure

- **users/** - User profiles with subscription and preferences
- **practice-questions/** - Interview questions database
- **interview-sessions/** - User interview sessions
- **training-sets/** - Custom question collections
- **ai-responses/** - AI-generated feedback (immutable)
- **user-skills/** - User skill tracking
- **analytics/** - User analytics data
- **progress-tracking/** - Progress tracking
- **activity-logs/** - User activity logs
- **achievements/** - Achievement definitions

## 🛠️ Development

```bash
# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📋 Firebase Setup Checklist

- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Authentication enabled (Email/Password, Google)
- [ ] `firestore.rules` deployed
- [ ] `firestore.indexes.json` deployed (wait for indexing to complete)
- [ ] Service account key downloaded
- [ ] Environment variables configured
- [ ] Initial user collection structure created
- [ ] Practice questions imported
- [ ] User creation flow tested
- [ ] Error handling verified

## 📖 Documentation

- **firestore.md** - Complete Firebase + Firestore setup guide with implementation scripts
- **Interviewquestions.md** - Sample interview questions database

## 🔒 Security

- All sensitive credentials are in `.env.local` (gitignored)
- Service account key is in `serviceAccountKey.json` (gitignored)
- Firestore security rules enforce user-level access control
- Admin operations require `role: 'admin'` in user document

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 Deployment

The app is configured for deployment on Vercel:

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel --prod
```

## 🤝 Contributing

1. Follow the existing code structure
2. Run tests before committing
3. Use conventional commit messages
4. Update documentation as needed

## Additional Resources

- Puppeteer Installation: https://pptr.dev/guides/installation