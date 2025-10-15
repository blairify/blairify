# System Architecture

## Overview

Grant Guide is a modern web application built with Next.js and Firebase that provides comprehensive career guidance, including job interview preparation and real-time job market analysis. The system follows a modular, service-oriented architecture with clear separation of concerns and includes both TypeScript/React frontend and Python-based job scraping services.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  Pages & Components     │  Hooks & State      │  UI Components   │
│  • Dashboard            │  • useDashboardData │  • Atoms         │
│  • Profile              │  • useProfile       │  • Molecules     │
│  • Interview            │  • useAuth          │  • Organisms     │
│  • Jobs (Job Market)    │  • useJobSearch     │  • Layouts       │
│  • Auth                 │  • useAuthGuard     │                  │
├─────────────────────────────────────────────────────────────────┤
│                       Service Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Database Services      │  Auth Services      │  Job Services    │
│  • UserProfileService  │  • Authentication   │  • Job Scraper   │
│  • SkillsService        │  • Authorization    │  • SWR Caching   │
│  • SessionsService      │  • User Management  │  • Data Processing│
│  • AnalyticsService     │                     │                  │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Services                           │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Backend       │  Python Job Scraper │  API Layer       │
│  • Authentication      │  • JobSpy Integration│  • REST Endpoints│
│  • Firestore Database  │  • Multi-site Support│  • Request       │
│  • Users Collection     │  • Data Caching     │    Validation    │
│  • Skills Collection    │  • Serverless Exec. │  • Error Handling│
│  • Sessions Collection  │                     │                  │
│  • Analytics Collection │                     │                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Layer (Next.js 15.5.2)

**Pages & Routing**
- App Router with TypeScript
- Server-side rendering (SSR) and static generation
- Dynamic routing for user-specific content

**Component Architecture**
- **Atoms**: Basic UI elements (Button, Input, Badge)
- **Molecules**: Composed components (PixelCard, Features Grid)
- **Organisms**: Complex components (Navbar, Hero Section, Auth Form)
- **Layouts**: Page structure and common elements

**State Management**
- React Context for global state (Auth, Theme)
- Custom hooks for data fetching and state logic
- Local component state for UI interactions

### 2. Service Layer

**Database Services (`/src/lib/database.ts`)**
```typescript
export class UserProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null>
  static async createProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void>
}

export class SkillsService {
  static async getUserSkills(userId: string): Promise<UserSkill[]>
  static async updateSkillProgress(userId: string, skillId: string, progress: number): Promise<void>
}

export class SessionsService {
  static async createSession(userId: string, sessionData: Partial<InterviewSession>): Promise<InterviewSession>
  static async getUserSessions(userId: string, limit?: number): Promise<InterviewSession[]>
}
```

**Job Market Services (`/src/hooks/useJobSearch.ts`)**
```typescript
export function useJobSearch(params: JobSearchParams | null): UseJobSearchResult {
  // SWR-powered job search with automatic caching
  // Returns: { data, error, isLoading, isValidating, mutate }
}

export function useJobSearchMutation() {
  // Manual job search trigger
  return { trigger: async (params: JobSearchParams) => Promise<JobData[]> }
}
```

**Authentication Services (`/src/lib/auth.ts`)**
- Firebase Authentication integration
- User session management
- Profile creation and updates
- OAuth providers (GitHub)

**Utility Services**
- Firestore connection management
- Error handling and retry logic
- Performance monitoring
- Offline support

### 3. Backend Layer (Firebase + Python Services)

**Authentication (Firebase)**
- Email/password authentication
- OAuth providers (GitHub)
- Session management and security rules

**Firestore Database**
- Document-based NoSQL database
- Real-time data synchronization
- Offline support with caching
- Security rules for data access

**Job Scraping Services (Python)**
- **Production**: Vercel serverless functions (`/api/index.py`)
- **Development**: Local Python scripts (`/scripts/jobspy_api_bridge.py`)
- **Core Engine**: JobSpy library integration
- **Multi-platform Support**: Indeed, LinkedIn, ZipRecruiter, Google Jobs, Glassdoor
- **Data Processing**: Pandas-based data transformation and cleaning

**API Layer (`/src/app/api/`)**
- REST endpoints for job scraping
- Request validation and sanitization
- Environment-aware execution routing
- Error handling and timeout management

## Data Flow Architecture

### 1. Authentication Flow
```
User Login → Firebase Auth → Auth Provider → Global State → Protected Routes
```

### 2. Data Fetching Flow
```
Component → Custom Hook → Database Service → Firestore Utils → Firebase → Response
```

### 3. Job Market Data Flow
```
User Search → useJobSearch Hook → SWR Cache Check → API Route → Python Scraper → JobSpy → External APIs
                                       ↓
UI Component ← Formatted Data ← Response Processing ← Data Transformation ← Raw Job Data
```

### 4. State Update Flow
```
User Action → Component → Service Call → Database Update → State Refresh → UI Update
```

## Job Market Architecture Details

### Frontend Job Search Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                       Job Market Page                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Search Form   │  │   Filters UI    │  │   Results List  │ │
│  │   useJobSearch  │  │   Site Selection│  │   Job Cards     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SWR Caching Layer                         │
│  • Automatic deduplication                                     │
│  • 5-minute cache TTL                                          │
│  • Background revalidation                                     │
│  • Error retry logic                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Route                           │
│                   /api/jobs/scrape                              │
│  • Request validation                                          │
│  • Parameter sanitization                                      │
│  • Environment detection                                       │
│  • Timeout management (55s)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Job Scraping Architecture

#### Production Environment (Vercel)
```
API Route → Vercel Serverless Function (api/index.py) → JobSpy Library
    ↓              ↓                                      ↓
Request        Python Runtime                          External APIs
Validation  →  JobMarketScraper                    →    • Indeed API
              • Data processing                         • LinkedIn API  
              • Format conversion                       • ZipRecruiter API
              • Error handling                          • Google Jobs API
                                                       • Glassdoor API
```

#### Development Environment (Local)
```
API Route → Python Subprocess → jobspy_api_bridge.py → jobspy_scraper.py
    ↓              ↓                    ↓                      ↓
Request        Local Python        Bridge Script           Scraper Class
Validation  →  Environment     →   • Parameter parsing  →   • Caching system
              • Virtual env         • Cache management      • Multi-site support
              • Script execution    • Response formatting   • Data transformation
```

### Data Processing Pipeline
```
Raw Scraped Data → Data Cleaning → Format Standardization → API Response
       ↓                ↓                    ↓                    ↓
• Multiple formats   • Remove nulls     • Standardized      • JSON structure
• Site-specific     • Clean strings    • Location object   • Type validation
• Inconsistent      • Parse numbers    • Salary object     • Error messages
  structures        • Handle errors    • Consistent IDs    • Success flags
```

## Key Design Principles

### 1. **Separation of Concerns**
- Clear boundaries between UI, business logic, and data layers
- Each service has a single responsibility
- Components focus only on presentation

### 2. **Error Resilience**
- Comprehensive error handling at every layer
- Retry mechanisms for network operations
- Graceful degradation for offline scenarios

### 3. **Type Safety**
- Full TypeScript integration
- Comprehensive type definitions for all data models
- Runtime type validation where needed

### 4. **Performance Optimization**
- Lazy loading of components and data
- Efficient caching strategies
- Minimal re-renders with proper memoization

### 5. **Scalability**
- Modular service architecture
- Easy to add new features and services
- Database schema designed for growth

## Security Architecture

### 1. **Authentication Security**
- Firebase Auth handles all authentication logic
- Secure token management
- Session timeout and refresh

### 2. **Data Security**
- Firestore security rules enforce access control
- User data isolation
- Input validation and sanitization

### 3. **Frontend Security**
- Protected routes with authentication guards
- Secure API key management
- XSS and CSRF protection

## Monitoring & Observability

### 1. **Error Monitoring**
- Custom Firebase monitor for connection issues
- Comprehensive error logging
- Real-time error alerts

### 2. **Performance Monitoring**
- Database operation timing
- Component render performance
- User interaction tracking

### 3. **Usage Analytics**
- User journey tracking
- Feature usage statistics
- Performance metrics

## Development Environment

### 1. **Local Development**
- Next.js development server
- Firebase emulators for local testing
- Hot module replacement for fast development

### 2. **Build Process**
- TypeScript compilation
- Turbopack for fast builds
- Biome for code quality

### 3. **Testing Strategy**
- Unit tests for services and utilities
- Integration tests for data flows
- Component tests for UI interactions

---

*This architecture supports the current needs while being flexible enough to accommodate future growth and feature additions.*