# Grant Guide - Quick Reference

## 🚀 Overview

Grant Guide is a comprehensive career development platform that combines job interview preparation with real-time job market analysis. Built with Next.js, Firebase, and Python-based job scraping technology.

## 🏗️ Architecture Summary

### Frontend Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: SWR for data fetching, React hooks for local state
- **Authentication**: Firebase Auth

### Backend Stack
- **Database**: Firebase Firestore
- **API**: Next.js API Routes + Python serverless functions
- **Job Scraping**: JobSpy library with multi-platform support
- **Hosting**: Vercel (supports both Node.js and Python)

## 📊 Key Features

### 1. Job Market Analysis
- **Multi-platform scraping**: Indeed, LinkedIn, ZipRecruiter, Google Jobs, Glassdoor
- **Real-time search**: SWR-powered caching and data fetching
- **Advanced filtering**: Location, job type, remote work, salary range
- **Smart caching**: Development caching + production SWR optimization

### 2. AI-Powered Interview System
- **Adaptive Interviews**: AI-driven technical interviews with Mistral AI
- **Multiple Types**: Technical, coding, system design, and bullet interviews
- **Seniority Matching**: Questions adapt to junior, mid, or senior level
- **Comprehensive Analysis**: 100-point scoring system with detailed feedback
- **Voice Integration**: Speech-to-text input for natural conversation
- **Demo Mode**: Risk-free exploration of the interview system
- **Company Customization**: Interview style adaptation for specific companies

### 3. User Management
- **Firebase Authentication**: Email/password + OAuth (GitHub)
- **Profile system**: Complete user profiles with preferences
- **Session management**: Secure, persistent authentication
- **Data persistence**: Firestore integration for all user data

## 🔧 Development Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd grant-guide
pnpm install

# 2. Set up Python environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r api/requirements.txt

# 3. Configure environment
cp .env.example .env.local
# Add Firebase config and other environment variables

# 4. Start development server
pnpm dev

# 5. Test job scraper
curl -X POST http://localhost:3000/api/jobs/scrape \
  -H "Content-Type: application/json" \
  -d '{"search_term": "software engineer", "location": "remote", "results_wanted": 10}'
```

## 🌐 API Endpoints

### Job Scraping API
- **POST** `/api/jobs/scrape` - Search for jobs across multiple platforms
- **GET** `/api/jobs/scrape` - Get API configuration and supported options

### Authentication API
- Built-in Firebase Authentication handlers
- Custom profile creation and management

### Interview API
- **POST** `/api/interview` - AI-powered question generation and follow-up logic
- **POST** `/api/interview/analyze` - Comprehensive performance analysis and scoring

## 📁 Project Structure

```
grant-guide/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── api/                 # API routes
│   │   │   └── jobs/scrape/     # Job scraping endpoint
│   │   ├── jobs/                # Job market page
│   │   ├── dashboard/           # User dashboard  
│   │   └── auth/                # Authentication pages
│   ├── components/              # React components
│   │   ├── atoms/               # Basic UI elements
│   │   ├── molecules/           # Composed components
│   │   ├── organisms/           # Complex components
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   │   └── useJobSearch.ts      # Job search SWR hook
│   ├── lib/                     # Utility libraries
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Helper functions
├── api/                         # Python serverless functions
│   ├── index.py                 # Main Vercel function
│   ├── jobspy_scraper.py        # Core scraper class
│   └── requirements.txt         # Python dependencies
├── scripts/                     # Development scripts
│   ├── jobspy_scraper.py        # Enhanced scraper with caching
│   └── jobspy_api_bridge.py     # Development API bridge
└── docs/                        # Documentation
    ├── api/                     # API documentation
    └── architecture/            # System architecture docs
```

## 🔍 Job Scraper Details

### Supported Platforms
| Platform | ID | Features | Notes |
|----------|----|---------|----- |
| Indeed | `indeed` | ✅ Full support | Most reliable |
| LinkedIn | `linkedin` | ✅ Full support | Requires description flag |
| ZipRecruiter | `zip_recruiter` | ✅ Full support | Good salary data |
| Google Jobs | `google` | ✅ Full support | Aggregated results |
| Glassdoor | `glassdoor` | ✅ Full support | Company insights |

### Usage Example
```typescript
import { useJobSearch } from '@/hooks/useJobSearch';

function JobSearchComponent() {
  const { data: jobs, error, isLoading } = useJobSearch({
    search_term: "React Developer",
    location: "San Francisco, CA",
    site_names: ["indeed", "linkedin"],
    results_wanted: 25,
    job_type: "fulltime",
    is_remote: false
  });

  // Handle loading, error, and data states
}
```

## 🚀 Deployment

### Development
- Local Next.js server: `pnpm dev`
- Python virtual environment for scraper
- Firebase emulators for testing

### Production (Vercel)
- Automatic TypeScript/Python deployment
- Environment variables via Vercel dashboard
- Serverless functions for job scraping
- Global CDN and edge optimization

## 🔐 Environment Variables

### Required
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration  
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_NODE_ENV=
```

### Optional (Development)
```bash
# Python Configuration
PYTHON_PATH=.venv/bin/python
JOBSPY_CACHE_DIR=job_cache
JOBSPY_CACHE_DURATION=6

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=
```

## 📚 Documentation

- **[System Architecture](./architecture/system-architecture.md)** - High-level system design
- **[Job Scraper API](./api/job-scraper-api.md)** - Complete job scraping documentation
- **[Database Services](./api/database-services.md)** - Firestore operations
- **[Authentication Services](./api/authentication-services.md)** - User management
- **[Deployment Guide](./deployment-guide.md)** - Production deployment

## 🐛 Common Issues & Solutions

### Job Scraper Issues
1. **No results found**
   - Try broader search terms
   - Remove restrictive filters
   - Check location spelling

2. **Timeout errors**
   - Reduce `results_wanted` parameter
   - Use fewer `site_names`
   - Try more specific search terms

3. **Python dependency errors**
   - Ensure virtual environment is activated
   - Run `pip install -r api/requirements.txt`

### Development Issues
1. **Build errors**
   - Run `pnpm run type-check`
   - Check for missing environment variables
   - Ensure Python environment is set up

2. **Firebase connection issues**
   - Verify Firebase configuration
   - Check network connectivity
   - Review Firebase console for project status

## 🛠️ Development Commands

```bash
# Package management
pnpm install              # Install dependencies
pnpm update               # Update packages

# Development
pnpm dev                  # Start development server
pnpm build                # Build for production
pnpm start                # Start production server
pnpm lint                 # Run linting
pnpm format               # Format code

# Python scraper
python scripts/jobspy_scraper.py  # Test scraper directly
source .venv/bin/activate          # Activate Python env

# Testing
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
```

## 📞 Support & Contribution

For questions, issues, or contributions:
1. Check existing documentation in `/docs`
2. Review the troubleshooting section above
3. Create detailed issues with reproduction steps
4. Follow TypeScript and Python best practices for contributions

---

*This quick reference provides essential information for developers working with Grant Guide. For detailed documentation, refer to the specific files in the `/docs` directory.*