# Deployment Guide

## Overview

This guide covers the deployment process for the Grant Guide application, including environment setup, build processes, Python scraper deployment, CI/CD pipelines, and production monitoring.

## Deployment Architecture

```
Production Environment
├── Vercel (Full-Stack Hosting)
│   ├── Next.js Application
│   ├── Static Assets
│   ├── TypeScript API Routes
│   ├── Python Serverless Functions
│   └── Edge Functions
├── Firebase (Backend Services)
│   ├── Authentication
│   ├── Firestore Database
│   ├── Cloud Functions
│   └── File Storage  
├── Python Job Scraper
│   ├── JobSpy Integration
│   ├── Multi-platform Support
│   ├── Data Processing Pipeline
│   └── Error Handling
├── Monitoring & Analytics
│   ├── Vercel Analytics
│   ├── Firebase Performance
│   ├── Job Scraper Metrics
│   └── Error Tracking
└── Domain & CDN
    ├── Custom Domain
    ├── SSL Certificates
    └── Global CDN
```

## Environment Configuration

### Development Environment

```bash
# .env.local (development)
NEXT_PUBLIC_FIREBASE_API_KEY=your_dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_dev_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_dev_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_dev_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_dev_app_id

# Environment identifier
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Python scraper configuration
PYTHON_PATH=.venv/bin/python
JOBSPY_CACHE_DIR=job_cache
JOBSPY_CACHE_DURATION=6

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
```

### Production Environment

```bash
# Environment variables (set in Vercel dashboard)
NEXT_PUBLIC_FIREBASE_API_KEY=your_prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=grantguide.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=grantguide-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=grantguide-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_prod_app_id

# Production settings
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://grant-guide.vercel.app
NEXT_PUBLIC_SITE_URL=https://grant-guide.vercel.app

# Python scraper settings (Vercel handles Python runtime automatically)
VERCEL_URL=grant-guide.vercel.app

# Analytics and monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://grant-guide.vercel.app
```

## Build Process

### Local Build

```bash
# Install dependencies
pnpm install

# Set up Python environment for job scraper
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r api/requirements.txt

# Type checking
pnpm run type-check

# Linting and formatting
pnpm run lint
pnpm run format

# Build application
pnpm run build

# Start production server locally
pnpm run start
```

## Python Scraper Deployment

### Development Setup

1. **Python Environment**
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r api/requirements.txt
pip install -r requirements.txt  # Optional: additional dev tools
```

2. **Dependencies (api/requirements.txt)**
```txt
python-jobspy==1.1.31
pandas>=2.0.0
requests>=2.31.0
```

3. **Test Local Scraper**
```bash
# Test the scraper directly
python scripts/jobspy_scraper.py

# Test via API bridge
echo '{"search_term": "python developer", "location": "remote", "results_wanted": 5}' | python scripts/jobspy_api_bridge.py
```

### Production Setup (Vercel)

1. **Vercel Configuration (vercel.json)**
```json
{
  "functions": {
    "api/index.py": {
      "runtime": "python3.9"
    }
  },
  "build": {
    "env": {
      "PYTHON_VERSION": "3.9"
    }
  }
}
```

2. **Python Runtime Requirements**
```txt
# api/requirements.txt (production)
python-jobspy==1.1.31
pandas>=2.0.0,<3.0.0
requests>=2.31.0,<3.0.0
```

3. **Deployment Process**
```bash
# Deploy to Vercel
vercel --prod

# Monitor deployment
vercel logs --follow
```

### Build Configuration

#### `next.config.ts`
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Build output configuration
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google avatars
      'avatars.githubusercontent.com', // GitHub avatars
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
  
  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundlePagesRouterDependencies: true,
    },
  }),
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### TypeScript Configuration

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/providers/*": ["./src/providers/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## Deployment Platforms

### Vercel Deployment

#### Project Setup
1. Connect GitHub repository to Vercel
2. Configure build and output settings
3. Set environment variables
4. Configure custom domain

#### `vercel.json`
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://grantguide.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/interview/:path*",
      "destination": "/api/interview/:path*"
    }
  ]
}
```

#### Deployment Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
```

### Alternative: Netlify Deployment

#### `netlify.toml`
```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  PNPM_VERSION = "8"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "origin-when-cross-origin"
```

## Firebase Configuration

### Project Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy functions (if using)
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Validate user profile structure
      allow create: if request.auth != null && 
                       request.auth.uid == userId &&
                       validateUserProfile(request.resource.data);
      
      allow update: if request.auth != null && 
                       request.auth.uid == userId &&
                       validateUserProfileUpdate(request.resource.data);
      
      // Skills subcollection
      match /skills/{skillId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Job matches subcollection
      match /jobMatches/{matchId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Interviews subcollection
      match /interviews/{interviewId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Helper functions
    function validateUserProfile(data) {
      return data.keys().hasAll(['email', 'displayName', 'uid']) &&
             data.email is string &&
             data.displayName is string &&
             data.uid is string &&
             data.email.matches('.*@.*\\..*');
    }
    
    function validateUserProfileUpdate(data) {
      return !('uid' in data) && !('createdAt' in data);
    }
  }
}
```

### Firebase Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "jobMatches",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "matchScore",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "skills",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "proficiencyLevel",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm run type-check
      
      - name: Lint
        run: pnpm run lint
      
      - name: Run tests
        run: pnpm run test
        env:
          CI: true
      
      - name: Build
        run: pnpm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Quality Gates

#### Pre-deployment Checks
```yaml
# Additional quality gates
- name: Security Audit
  run: pnpm audit --audit-level moderate

- name: Bundle Size Check
  run: |
    pnpm run build
    npx bundlesize

- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    configPath: './lighthouserc.js'
    uploadArtifacts: true
```

#### `lighthouserc.js`
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'pnpm start',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Monitoring & Analytics

### Performance Monitoring

```typescript
// Performance monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

// Measure all Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

```typescript
// Error boundary with reporting
import * as Sentry from '@sentry/nextjs';

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Health Checks

```typescript
// API health check endpoint
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    await db.collection('health').doc('check').get();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

## Security Configuration

### Content Security Policy

```typescript
// CSP configuration in next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

### Environment Security

```bash
# Production security checklist
✅ HTTPS enforced
✅ Security headers configured
✅ Environment variables secured
✅ API keys rotated regularly
✅ Database access restricted
✅ CORS properly configured
✅ Authentication tokens secured
✅ Dependency vulnerabilities checked
```

## Rollback Strategy

### Automated Rollback

```yaml
# Rollback workflow
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      deployment_id:
        description: 'Deployment ID to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Vercel Deployment
        run: |
          vercel rollback ${{ github.event.inputs.deployment_id }} --token ${{ secrets.VERCEL_TOKEN }}
```

### Manual Rollback Process

1. **Identify Issue**: Monitor alerts and user reports
2. **Assess Impact**: Determine severity and affected users
3. **Execute Rollback**: Use automated scripts or manual process
4. **Verify Rollback**: Confirm application is working correctly
5. **Communicate**: Update stakeholders and users
6. **Post-Mortem**: Analyze root cause and prevent recurrence

---

*This deployment guide ensures reliable, secure, and scalable deployment of the Grant Guide application with comprehensive monitoring and rollback capabilities.*