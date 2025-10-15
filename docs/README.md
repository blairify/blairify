# Grant Guide Documentation

Welcome to the Grant Guide documentation. This guide covers the complete architecture, data flow, and services of the Grant Guide application, including the powerful job market integration.

## 📚 Table of Contents

### Architecture & Design
- [System Architecture](./architecture/system-architecture.md) - High-level system design and components
- [Database Schema](./architecture/database-schema.md) - Firestore database structure and relationships
- [Authentication Flow](./architecture/authentication-flow.md) - User authentication and authorization system
- [Data Flow](./architecture/data-flow.md) - How data moves through the application

### API Documentation
- [Database Services](./api/database-services.md) - Core database operations and services
- [Authentication Services](./api/authentication-services.md) - User authentication and management
- [Job Scraper API](./api/job-scraper-api.md) - Job scraping functionality and endpoints
- [Interview System](./api/interview-system.md) - AI-powered interview functionality and analysis

### Job Market Features
- **Multi-platform Scraping**: Indeed, LinkedIn, ZipRecruiter, Google Jobs, Glassdoor
- **Real-time Search**: SWR-powered caching and data fetching
- **Advanced Filtering**: Location, job type, remote work, salary range, posting date
- **Smart Caching**: Development caching + production SWR optimization
- **Type Safety**: Full TypeScript integration for job data and API responses

### Interview System Features
- **AI-Powered Interviews**: Adaptive technical interviews using Mistral AI
- **Multiple Interview Types**: Technical, coding, system design, and bullet interviews
- **Seniority Adaptation**: Questions automatically adjust to junior, mid, or senior level
- **Comprehensive Analysis**: 100-point scoring system with detailed performance feedback
- **Voice Integration**: Speech-to-text input for natural conversation flow
- **Demo Mode**: Risk-free exploration and system familiarization
- **Company Customization**: Interview styles adapted for specific companies (Google, Meta, etc.)

### Development & Testing
- [Testing Strategy](./testing-strategy.md) - Testing approach and best practices
- [Development Setup](./development-setup.md) - Local development environment setup
- [Deployment Guide](./deployment-guide.md) - Production deployment procedures

### User Experience
- [User Journey](./user-journey.md) - Complete user experience flow
- [Component Architecture](./component-architecture.md) - UI component organization

## 🚀 Quick Start

1. **System Overview**: Start with [System Architecture](./architecture/system-architecture.md) to understand the big picture
2. **Job Market Features**: Review [Job Scraper API](./api/job-scraper-api.md) for job market integration
3. **Development Setup**: Follow the [Quick Reference](./quick-reference.md) for essential setup steps
4. **Database Structure**: Check [Database Schema](./architecture/database-schema.md) for data organization
2. **Database Design**: Review [Database Schema](./architecture/database-schema.md) for data structure
3. **Authentication**: Learn about [Authentication Flow](./architecture/authentication-flow.md)
4. **API Reference**: Check [Database Services](./api/database-services.md) for backend operations

## 🔧 Key Technologies

- **Frontend**: Next.js 15.5.2, React 19, TypeScript
- **Backend**: Firebase v12.2.1 (Auth, Firestore, Functions)
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Context, custom hooks
- **Testing**: Jest, React Testing Library
- **Build Tools**: Turbopack, Biome

## 📖 Recent Updates

### v1.0.0 - Database Integration & Authentication
- ✅ Complete database service architecture
- ✅ User authentication with Firebase
- ✅ Real-time dashboard data
- ✅ Profile management system
- ✅ Fixed Firestore internal assertion errors
- ✅ Improved TypeScript type safety
- ✅ Integrated Python-based job scraping with JobSpy
- ✅ Added multi-platform job search capabilities
- ✅ Implemented SWR caching for optimal performance
- ✅ Created comprehensive API documentation

## 🔗 External Resources

- **JobSpy Documentation**: [python-jobspy](https://github.com/cullen-code/python-jobspy) - Core job scraping library
- **Next.js Documentation**: [nextjs.org](https://nextjs.org/docs) - Web framework documentation
- **Firebase Documentation**: [firebase.google.com](https://firebase.google.com/docs) - Backend services
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs) - Deployment platform
- **TypeScript Documentation**: [typescriptlang.org](https://www.typescriptlang.org/docs) - Language reference

---

*Last updated: October 12, 2025*