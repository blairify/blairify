# Job Scraper API Documentation

## Overview

The Job Scraper API provides comprehensive job search capabilities by aggregating data from multiple job boards including Indeed, LinkedIn, ZipRecruiter, Google Jobs, and Glassdoor. Built with JobSpy for reliable data extraction and optimized for both development and production environments.

## Architecture

```
Frontend (Next.js) → API Route (/api/jobs/scrape) → Python Scraper
    ↓                      ↓                           ↓
Job Market Page    →    Route Handler         →    JobSpy Library
    ↓                      ↓                           ↓
React Hook         →    Validation/Execution  →    Data Processing
    ↓                      ↓                           ↓
SWR Caching        →    Response Formatting   →    JSON Output
```

### Components

1. **Frontend Integration**
   - `src/app/jobs/page.tsx` - Job market interface
   - `src/hooks/useJobSearch.ts` - SWR-powered data fetching
   - `src/types/job-market.ts` - TypeScript definitions

2. **API Layer**
   - `src/app/api/jobs/scrape/route.ts` - Next.js API route
   - Request validation and parameter sanitization
   - Environment-aware execution (development vs production)

3. **Python Scrapers**
   - `api/index.py` - Vercel serverless function (production)
   - `api/jobspy_scraper.py` - Core scraper implementation
   - `scripts/jobspy_api_bridge.py` - Development bridge script
   - `scripts/jobspy_scraper.py` - Enhanced version with caching

## API Reference

### POST /api/jobs/scrape

Scrape jobs from multiple job boards based on search criteria.

#### Request Body

```typescript
interface JobSearchRequest {
  search_term: string;                    // Required: Job search query
  location?: string;                      // Location to search in
  site_names?: string[];                  // Job boards to scrape from
  results_wanted?: number;                // Number of results (1-100)
  job_type?: "fulltime" | "parttime" | "internship" | "contract";
  is_remote?: boolean;                    // Filter for remote jobs
  hours_old?: number;                     // Jobs posted within X hours
  distance?: number;                      // Search radius in miles
  country_indeed?: string;                // Country for Indeed search
  easy_apply?: boolean;                   // Filter for easy apply jobs
  linkedin_fetch_description?: boolean;   // Fetch full descriptions
  google_search_term?: string;            // Custom Google Jobs query
  description_format?: "markdown" | "html";
  offset?: number;                        // Pagination offset
  enforce_annual_salary?: boolean;        // Convert salaries to annual
}
```

#### Example Request

```bash
curl -X POST '/api/jobs/scrape' \
  -H 'Content-Type: application/json' \
  -d '{
    "search_term": "software engineer",
    "location": "San Francisco, CA",
    "site_names": ["indeed", "linkedin"],
    "results_wanted": 20,
    "job_type": "fulltime",
    "hours_old": 72,
    "is_remote": false,
    "distance": 50,
    "country_indeed": "USA"
  }'
```

#### Response Format

```typescript
interface JobSearchResponse {
  success: boolean;
  data?: JobData[];
  count?: number;
  error?: string;
  message?: string;
}

interface JobData {
  id: string;
  title: string;
  company: string;
  company_url?: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    full_location?: string;
  };
  job_url?: string;
  is_remote: boolean;
  job_type?: string;
  description?: string;
  salary: {
    min_amount?: number;
    max_amount?: number;
    interval?: string;
    currency?: string;
  };
  date_posted?: string;
  site: string;
  scraped_at: string;
  search_term: string;
  search_location: string;
  company_industry?: string;
  job_level?: string;
  emails?: string[];
  skills?: string[];
}
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "indeed_1234567890",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "company_url": "https://techcorp.com",
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "full_location": "San Francisco, CA"
      },
      "job_url": "https://indeed.com/viewjob?jk=1234567890",
      "is_remote": false,
      "job_type": "fulltime",
      "description": "We are looking for a senior software engineer...",
      "salary": {
        "min_amount": 120000,
        "max_amount": 180000,
        "interval": "yearly",
        "currency": "USD"
      },
      "date_posted": "2025-10-10",
      "site": "indeed",
      "scraped_at": "2025-10-12T10:30:00.000Z",
      "search_term": "software engineer",
      "search_location": "San Francisco, CA"
    }
  ],
  "count": 1,
  "message": "Successfully scraped 1 jobs"
}
```

### GET /api/jobs/scrape

Get API configuration and supported options.

#### Response

```json
{
  "success": true,
  "message": "Job scraping API endpoint",
  "supported_sites": [
    "indeed", "linkedin", "zip_recruiter", 
    "google", "glassdoor", "bayt", "naukri", "bdjobs"
  ],
  "supported_job_types": ["fulltime", "parttime", "internship", "contract"],
  "supported_countries": ["USA", "UK", "Canada", "Australia", "..."],
  "limits": {
    "max_results_per_request": 100,
    "timeout_seconds": 55
  },
  "example_request": {
    "search_term": "software engineer",
    "location": "San Francisco, CA",
    "site_names": ["indeed", "linkedin"],
    "results_wanted": 20,
    "job_type": "fulltime",
    "hours_old": 72,
    "is_remote": false,
    "distance": 50,
    "country_indeed": "USA"
  }
}
```

## Supported Job Boards

| Site | ID | Features | Notes |
|------|----|---------|----- |
| Indeed | `indeed` | ✅ Full support | Most reliable, fastest |
| LinkedIn | `linkedin` | ✅ Full support | Requires `linkedin_fetch_description` for full descriptions |
| ZipRecruiter | `zip_recruiter` | ✅ Full support | Good salary data |
| Google Jobs | `google` | ✅ Full support | Aggregates multiple sources |
| Glassdoor | `glassdoor` | ✅ Full support | Company reviews and salary insights |
| Bayt | `bayt` | ✅ Full support | Middle East focused |
| Naukri | `naukri` | ✅ Full support | India focused |
| BDJobs | `bdjobs` | ✅ Full support | Bangladesh focused |

## Environment Configuration

### Development Environment

The scraper runs locally using Python scripts in the `scripts/` directory:

```bash
# Development flow
Frontend → /api/jobs/scrape → jobspy_api_bridge.py → jobspy_scraper.py
```

**Requirements:**
- Python 3.8+ with jobspy library installed
- Virtual environment recommended: `.venv/bin/python`
- Cache directory: `job_cache/` (automatic)

### Production Environment (Vercel)

The scraper runs as a serverless function using `api/index.py`:

```bash
# Production flow
Frontend → /api/jobs/scrape → Vercel Function (api/index.py) → jobspy_scraper.py
```

**Features:**
- Automatic dependency management
- 55-second timeout limit
- No caching (serverless constraints)
- CORS headers for cross-origin requests

## Caching Strategy

### Development Caching

The development version includes intelligent caching to improve performance:

```python
# Cache configuration
cache_duration_hours = 6  # 6-hour cache TTL
cache_dir = "job_cache"   # Cache directory
```

**Cache Key Format:**
```
{search_term}_{location}_{sites}_{job_type}_{hours_old}_{results_wanted}.pkl
```

**Cache Management:**
```bash
# Force refresh (bypass cache)
{ "force_refresh": true }

# Get cache statistics
{ "cache_stats_only": true }

# Clear all cache
{ "clear_cache": true }
```

### Production Caching

Production uses SWR (Stale-While-Revalidate) caching on the frontend:

```typescript
// SWR configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
  dedupingInterval: 300000,  // 5 minutes
  errorRetryCount: 2,
  errorRetryInterval: 5000,
};
```

## Frontend Integration

### React Hook Usage

```typescript
import { useJobSearch } from '@/hooks/useJobSearch';

function JobSearchComponent() {
  const [searchParams, setSearchParams] = useState<JobSearchParams | null>(null);

  const {
    data: jobs,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useJobSearch(searchParams);

  const handleSearch = () => {
    setSearchParams({
      search_term: "software engineer",
      location: "San Francisco, CA",
      site_names: ["indeed", "linkedin"],
      results_wanted: 20,
    });
  };

  if (isLoading) return <div>Searching jobs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleSearch}>Search Jobs</button>
      {jobs?.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company} - {job.location.full_location}</p>
        </div>
      ))}
    </div>
  );
}
```

### Manual Search Trigger

```typescript
import { useJobSearchMutation } from '@/hooks/useJobSearch';

function SearchButton() {
  const { trigger } = useJobSearchMutation();

  const handleSearch = async () => {
    try {
      const jobs = await trigger({
        search_term: "developer",
        location: "New York, NY",
        site_names: ["indeed"],
        results_wanted: 10,
      });
      console.log('Found jobs:', jobs);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return <button onClick={handleSearch}>Search Now</button>;
}
```

## Error Handling

### Common Error Scenarios

1. **Validation Errors (400)**
   ```json
   {
     "success": false,
     "error": "Invalid request parameters. search_term is required."
   }
   ```

2. **Timeout Errors (500)**
   ```json
   {
     "success": false,
     "error": "Request timeout: Scraping took longer than 55 seconds"
   }
   ```

3. **Dependency Errors (500)**
   ```json
   {
     "success": false,
     "error": "JobSpy library not available - please check deployment"
   }
   ```

4. **Rate Limiting**
   ```json
   {
     "success": false,
     "error": "Rate limit exceeded. Please try again later."
   }
   ```

### Frontend Error Handling

```typescript
const { data, error } = useJobSearch(params);

if (error) {
  if (error.message.includes('400')) {
    // Handle validation error
    return <div>Please check your search parameters</div>;
  } else if (error.message.includes('timeout')) {
    // Handle timeout
    return <div>Search is taking longer than expected. Please try a more specific query.</div>;
  } else {
    // Generic error
    return <div>Something went wrong. Please try again.</div>;
  }
}
```

## Performance Optimization

### Request Optimization

1. **Limit Results**: Keep `results_wanted` ≤ 50 for faster responses
2. **Site Selection**: Use 1-3 sites maximum for best performance
3. **Location Specificity**: More specific locations return faster results
4. **Time Filters**: Use `hours_old` to limit result scope

### Caching Best Practices

1. **Development**: Enable caching for repeated searches
2. **Production**: Leverage SWR automatic caching
3. **Cache Invalidation**: Use `mutate()` to refresh stale data

## Security Considerations

### Input Validation

All inputs are validated and sanitized:

```typescript
// Search term validation
if (!body.search_term || typeof body.search_term !== "string") {
  return null; // Invalid request
}

// Site name validation
const validSites = ["indeed", "linkedin", "zip_recruiter", "google", "glassdoor"];
const filteredSites = body.site_names?.filter(site => validSites.includes(site));

// Numeric limits
const results = Math.min(Math.max(1, safeParseInt(body.results_wanted, 20)), 100);
```

### Rate Limiting

- Production: Vercel's built-in rate limiting
- Development: Client-side SWR deduplication
- Recommended: Implement additional rate limiting for production use

## Troubleshooting

### Common Issues

1. **"No jobs found"**
   - Try broader search terms
   - Remove restrictive filters (job_type, hours_old)
   - Check location spelling

2. **Timeout errors**
   - Reduce `results_wanted`
   - Use fewer `site_names`
   - Try more specific search terms

3. **Python dependency errors**
   - Development: Ensure virtual environment is activated
   - Production: Check Vercel deployment logs

### Debug Mode

Enable debug logging in development:

```python
# In jobspy_scraper.py
scraper = JobMarketScraper(verbose=2)  # Increased verbosity
```

### Monitoring

Production monitoring via Vercel:
- Function execution time
- Memory usage
- Error rates
- Request volume

## API Limits and Quotas

### Vercel Serverless Limits

- **Execution Time**: 55 seconds maximum
- **Memory**: 1008 MB maximum
- **Request Size**: 4.5 MB maximum
- **Response Size**: 4.5 MB maximum

### Recommended Limits

- **Results per request**: 20-50 (optimal performance)
- **Sites per request**: 1-3 (fastest response)
- **Concurrent requests**: 5 maximum (avoid rate limiting)

### JobSpy Library Limits

- Varies by job board
- Generally 1000+ results per site
- Some sites may implement their own rate limiting

## Examples and Use Cases

### Basic Job Search

```typescript
const searchParams = {
  search_term: "React Developer",
  location: "Remote",
  site_names: ["indeed", "linkedin"],
  results_wanted: 25,
  is_remote: true
};
```

### Advanced Filtering

```typescript
const searchParams = {
  search_term: "Senior Software Engineer",
  location: "San Francisco, CA",
  site_names: ["indeed", "linkedin", "glassdoor"],
  results_wanted: 50,
  job_type: "fulltime",
  hours_old: 48,
  distance: 25,
  easy_apply: true,
  enforce_annual_salary: true
};
```

### Multi-location Search

```typescript
const locations = ["New York, NY", "San Francisco, CA", "Austin, TX"];
const searchPromises = locations.map(location => 
  trigger({
    search_term: "JavaScript Developer",
    location,
    site_names: ["indeed"],
    results_wanted: 20
  })
);

const allJobs = await Promise.all(searchPromises);
```

## Migration Guide

### From v1 to v2 (if applicable)

Key changes in API structure and new features.

### Upgrading JobSpy

```bash
pip install --upgrade python-jobspy
```

Update any breaking changes in scraper configuration.

## Contributing

### Adding New Job Boards

1. Update `SUPPORTED_SITES` in `jobspy_scraper.py`
2. Add site validation in API route
3. Test with sample searches
4. Update documentation

### Improving Performance

1. Optimize Python dependencies
2. Implement better caching strategies
3. Add request deduplication
4. Monitor and optimize slow queries

---

For more information, see the [API Reference](#api-reference) or check the [troubleshooting guide](#troubleshooting).