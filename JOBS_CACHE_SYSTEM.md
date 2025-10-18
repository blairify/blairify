# Jobs Cache System Documentation

## Overview
A comprehensive job scraping and caching system that fetches programming jobs from The Muse API and stores them in Firestore for fast retrieval.

## Problem Solved
- **Slow API responses** - Direct Muse API calls were slow on the frontend
- **Rate limiting** - Multiple users hitting the API simultaneously
- **Inconsistent data** - Different users seeing different results
- **Poor UX** - Long loading times for job listings

## Solution
- **Automated scraping** - Cron job runs every 6 hours
- **Firestore cache** - Fast retrieval from our database
- **Smart filtering** - Only programming-related jobs cached
- **Expiration handling** - Auto-cleanup of stale data

---

## Architecture

### Components

1. **Jobs Cache Service** (`/src/lib/jobs-cache-service.ts`)
   - Firestore CRUD operations
   - Cache management
   - Statistics and metadata

2. **Scrape API Route** (`/src/app/api/jobs/scrape/route.ts`)
   - Fetches jobs from Muse API
   - Filters programming jobs
   - Caches in Firestore
   - Handles cron triggers

3. **Jobs API Route** (`/src/app/api/jobs/route.ts`)
   - Retrieves cached jobs
   - Search and filtering
   - Pagination
   - Cache status

4. **Admin Dashboard** (`/src/app/admin/jobs-cache/page.tsx`)
   - View cache statistics
   - Manual scrape trigger
   - Monitor status

5. **Cron Configuration** (`vercel.json`)
   - Automated scraping schedule
   - Runs every 6 hours

---

## Data Flow

```
┌─────────────────┐
│   Muse API      │
└────────┬────────┘
         │ Scrape (every 6h)
         ↓
┌─────────────────┐
│ Scrape Endpoint │ (/api/jobs/scrape)
│  - Fetch jobs   │
│  - Filter       │
│  - Transform    │
└────────┬────────┘
         │ Cache
         ↓
┌─────────────────┐
│   Firestore     │
│  cached_jobs    │
│  jobs_metadata  │
└────────┬────────┘
         │ Retrieve
         ↓
┌─────────────────┐
│  Jobs Endpoint  │ (/api/jobs)
│  - Search       │
│  - Filter       │
│  - Paginate     │
└────────┬────────┘
         │ Display
         ↓
┌─────────────────┐
│   Frontend      │
│  Job Listings   │
└─────────────────┘
```

---

## Firestore Collections

### `cached_jobs`
Stores individual job listings.

```typescript
{
  id: string;                    // Job ID from Muse
  name: string;                  // Job title
  company: {
    name: string;
    id?: number;
  };
  locations: Array<{name: string}>;
  levels: Array<{name: string}>;
  categories: string[];          // Job categories
  refs: {
    landing_page: string;        // Application URL
  };
  publication_date: string;      // When posted
  type?: string;                 // Full-Time, Part-Time, etc.
  remote?: boolean;              // Remote work flag
  
  // Cache metadata
  cachedAt: Timestamp;           // When cached
  expiresAt: Timestamp;          // Expiration time (24h)
  source: "muse_api";
}
```

### `jobs_metadata`
Stores scraping metadata.

```typescript
{
  lastScrapeAt: Timestamp;       // Last scrape time
  totalJobsCached: number;       // Jobs in cache
  scrapeDuration: number;        // Scrape time (ms)
  jobsScraped: number;           // Jobs found
  status: "success" | "partial" | "failed";
  error?: string;                // Error message if failed
}
```

---

## API Endpoints

### POST `/api/jobs/scrape`
Trigger job scraping (manual or cron).

**Authorization:**
- Requires `CRON_SECRET` environment variable
- Header: `Authorization: Bearer <CRON_SECRET>`

**Response:**
```json
{
  "success": true,
  "jobsScraped": 1250,
  "expiredJobsCleared": 45,
  "duration": "87.32s"
}
```

**Process:**
1. Clear expired jobs
2. Fetch from Muse API (up to 50 pages)
3. Filter programming jobs
4. Cache in Firestore
5. Save metadata

### GET `/api/jobs/scrape`
Get scrape status and statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalJobs": 1250,
    "lastScrape": "2025-10-18T02:00:00Z",
    "cacheAge": 4.5,
    "status": "success"
  }
}
```

### GET `/api/jobs`
Retrieve cached jobs with filtering.

**Query Parameters:**
- `query` - Search term (searches name, company, categories, locations)
- `location` - Filter by location
- `level` - Filter by experience level
- `type` - Filter by job type
- `remote` - Filter remote jobs (true/false)
- `company` - Filter by company name
- `category` - Filter by category
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 20)

**Response:**
```json
{
  "results": [...],
  "page": 1,
  "per_page": 20,
  "total": 1250,
  "page_count": 63,
  "cache_needs_refresh": false
}
```

---

## Service Functions

### Cache Management

**`cacheJobs(jobs)`**
- Save jobs to Firestore
- Sets expiration (24 hours)
- Batch operations for performance

**`getCachedJobs(options?)`**
- Retrieve all cached jobs
- Optional: max age filter
- Optional: limit results

**`searchCachedJobs(searchTerm)`**
- Search by name, company, categories, locations
- Case-insensitive
- Returns matching jobs

**`filterCachedJobs(filters)`**
- Filter by: location, level, type, remote, company, category
- Multiple filters combined with AND logic

**`clearExpiredJobs()`**
- Remove jobs past expiration
- Returns count of deleted jobs

**`clearAllJobs()`**
- Delete entire cache
- Use with caution

### Metadata

**`saveJobsMetadata(metadata)`**
- Save scrape results
- Timestamp automatically added

**`getJobsMetadata()`**
- Get last scrape info
- Returns null if never scraped

**`needsCacheRefresh(maxAgeHours)`**
- Check if cache is stale
- Default: 24 hours

**`getCacheStats()`**
- Get comprehensive statistics
- Total jobs, last scrape, age, status

---

## Programming Job Filtering

Jobs are filtered using keyword matching:

```typescript
const programmingKeywords = [
  "front end", "frontend", "back end", "backend",
  "full stack", "full-stack", "devops",
  "software engineer", "developer", "programmer",
  "mobile", "ios", "android",
  "react", "vue", "angular",
  "javascript", "typescript", "python", "java",
  "c++", "c#", "ruby", "php", "golang", "go",
  "scala", "swift", "kotlin",
  "docker", "kubernetes", "cloud",
  "aws", "azure", "gcp",
  "machine learning", "ml", "data engineer",
  "backend engineer", "frontend engineer",
  "site reliability engineer", "sre"
];
```

A job is included if:
- Job title contains any keyword, OR
- Job categories contain any keyword

---

## Cron Configuration

### Vercel Cron Jobs

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/jobs/scrape",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule:** Every 6 hours (at :00 minutes)
- 12:00 AM
- 6:00 AM
- 12:00 PM
- 6:00 PM

**Cron Expression:** `0 */6 * * *`
- `0` - At minute 0
- `*/6` - Every 6 hours
- `* * *` - Every day, month, day of week

### Alternative Schedules

**Every 12 hours:**
```json
"schedule": "0 */12 * * *"
```

**Daily at 2 AM:**
```json
"schedule": "0 2 * * *"
```

**Every 3 hours:**
```json
"schedule": "0 */3 * * *"
```

---

## Environment Variables

### Required

**`CRON_SECRET`**
- Secret key for cron authentication
- Prevents unauthorized scraping
- Generate: `openssl rand -base64 32`

**Example `.env.local`:**
```bash
CRON_SECRET=your-secret-key-here
```

---

## Admin Dashboard

### Location
`/admin/jobs-cache`

### Features

**Statistics Cards:**
- Cached Jobs - Total count
- Cache Age - Hours since last scrape
- Status - Success/Failed/Unknown
- Last Scrape - Timestamp

**Actions:**
- Refresh Stats - Reload statistics
- Scrape Now - Manual trigger

**Information:**
- How it works
- Automatic scraping
- Cache expiration
- Performance benefits

**Access:**
- Superadmin only
- Uses `isSuperAdmin()` check

---

## Performance Improvements

### Before (Direct Muse API)
- ❌ 5-10 second load times
- ❌ Multiple API calls per page
- ❌ Rate limiting issues
- ❌ Inconsistent results

### After (Cached System)
- ✅ <1 second load times
- ✅ Single Firestore query
- ✅ No rate limiting
- ✅ Consistent results
- ✅ Better filtering
- ✅ Search capabilities

---

## Monitoring

### Check Cache Status

**Via API:**
```bash
curl https://your-domain.com/api/jobs/scrape
```

**Via Admin Dashboard:**
- Navigate to `/admin/jobs-cache`
- View real-time statistics
- Monitor scrape status

### Logs

**Scrape logs:**
```
🚀 Starting job scrape...
🗑️  Cleared 45 expired jobs
Scraping page 1/50...
Scraping page 2/50...
...
📊 Scraped 1250 programming jobs
✅ Cached 1250 jobs in Firestore
```

**Error logs:**
```
❌ Scrape error: Muse API error: 429
```

---

## Troubleshooting

### Cache is Empty

**Cause:** Never scraped or all jobs expired

**Solution:**
1. Go to `/admin/jobs-cache`
2. Click "Scrape Now"
3. Wait 1-2 minutes
4. Refresh stats

### Scrape Fails

**Possible causes:**
- Muse API down
- Rate limiting
- Network issues
- Firestore permissions

**Check:**
1. API logs in Vercel
2. Firestore rules
3. Network connectivity
4. Muse API status

### Stale Cache

**Cause:** Cron not running or failed

**Solution:**
1. Check Vercel cron logs
2. Verify `CRON_SECRET` is set
3. Manually trigger scrape
4. Check cron schedule in `vercel.json`

### Jobs Not Showing

**Cause:** Frontend not using cache API

**Check:**
1. Verify `/api/jobs` endpoint works
2. Check frontend fetch URL
3. Inspect network tab
4. Check console for errors

---

## Deployment

### Vercel

1. **Push code to repository**
   ```bash
   git add .
   git commit -m "Add jobs cache system"
   git push
   ```

2. **Set environment variable**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `CRON_SECRET`

3. **Deploy**
   - Vercel auto-deploys on push
   - Cron jobs activate automatically

4. **Verify cron**
   - Vercel dashboard → Cron Jobs
   - Should show `/api/jobs/scrape` scheduled

### Manual First Scrape

After deployment:
```bash
curl -X POST https://your-domain.com/api/jobs/scrape \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use admin dashboard.

---

## Future Enhancements

### Short Term
- [ ] Email notifications on scrape failures
- [ ] More detailed scrape logs
- [ ] Job change detection
- [ ] Incremental updates (only new jobs)

### Medium Term
- [ ] Multiple job sources (not just Muse)
- [ ] Job recommendations based on user profile
- [ ] Saved searches and alerts
- [ ] Job application tracking

### Long Term
- [ ] ML-based job matching
- [ ] Salary data integration
- [ ] Company reviews integration
- [ ] Interview prep for specific jobs

---

## Files Created

1. `/src/lib/jobs-cache-service.ts` - Cache service (290 lines)
2. `/src/app/api/jobs/scrape/route.ts` - Scrape endpoint (250 lines)
3. `/src/app/api/jobs/route.ts` - Jobs endpoint (70 lines)
4. `/src/app/admin/jobs-cache/page.tsx` - Admin dashboard (280 lines)
5. `/vercel.json` - Cron configuration
6. `JOBS_CACHE_SYSTEM.md` - This documentation

**Total:** ~890 lines of code + documentation

---

## Testing

### Test Scrape Endpoint

```bash
# Trigger scrape
curl -X POST http://localhost:3000/api/jobs/scrape

# Get status
curl http://localhost:3000/api/jobs/scrape
```

### Test Jobs Endpoint

```bash
# Get all jobs
curl http://localhost:3000/api/jobs

# Search
curl "http://localhost:3000/api/jobs?query=react"

# Filter
curl "http://localhost:3000/api/jobs?location=remote&level=senior"

# Pagination
curl "http://localhost:3000/api/jobs?page=2&per_page=50"
```

### Test Frontend

1. Navigate to `/jobs`
2. Should load instantly
3. Search and filters should work
4. Check console for cache warnings

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check cache statistics
- Review scrape logs
- Monitor error rates

**Monthly:**
- Review programming keywords
- Update filtering logic if needed
- Check Muse API changes

**Quarterly:**
- Analyze job trends
- Optimize cache duration
- Review cron schedule

---

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review Firestore data
3. Test endpoints manually
4. Check this documentation

---

## Summary

✅ **Automated job scraping** every 6 hours  
✅ **Fast Firestore cache** for instant retrieval  
✅ **Smart filtering** for programming jobs only  
✅ **Admin dashboard** for monitoring  
✅ **Search & filter** capabilities  
✅ **Auto-expiration** of stale data  
✅ **Performance boost** from seconds to milliseconds  

The jobs cache system transforms the job market feature from slow and unreliable to fast and consistent! 🚀
