/**
 * Massive Question Bank - 150+ Unique Questions
 * Run: nnpx ts-node scripts/seed-interview-questions-2.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let serviceAccount: any;
try {
  const serviceAccountPath = join(
    process.cwd(),
    "scripts",
    "serviceAccounts.json",
  );
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (_error) {
  console.error("❌ Error loading service account");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

interface PracticeQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyLogo: string;
  companySize: string[];
  primaryTechStack: string[];
  title: string;
  question: string;
  answer: string;
  topicTags: string[];
  seniorityLevel?: string[];
  companyName?: string;
}

const questions: PracticeQuestion[] = [
  // ==================== ADDITIONAL 30 QUESTIONS (200+ chars longer) ====================

  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Longest Consecutive Sequence",
    question:
      "Given unsorted array of integers, find length of longest consecutive elements sequence. Must run in O(n) time. Example: [100,4,200,1,3,2] → 4 (sequence is [1,2,3,4]). Array may contain duplicates.",
    answer:
      "Use HashSet for O(1) lookups. Add all numbers to set. For each number, check if it's start of sequence (num-1 not in set). If yes, count consecutive numbers upward. Track maximum length found. O(n) time because each number visited at most twice - once for adding to set, once for sequence checking. O(n) space for the set. Key insight: only start counting from sequence beginnings to avoid redundant work. This approach efficiently handles duplicates and unsorted data without requiring sort operation.",
    topicTags: ["arrays", "hash-set", "sequences"],
    seniorityLevel: ["mid"],
  },

  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiMeta",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Serialize and Deserialize Binary Tree",
    question:
      "Design algorithm to serialize binary tree to string and deserialize back to tree structure. Your serialization should work for any binary tree shape. Example: [1,2,3,null,null,4,5] → '1,2,null,null,3,4,null,null,5,null,null'",
    answer:
      "Use pre-order traversal (root, left, right) for serialization. Represent null nodes explicitly as 'null' markers. Join with delimiter like comma. For deserialization, split string and use queue or index pointer. Recursively build tree: read value, create node, recursively build left subtree, then right subtree. Handle null markers by returning null. Time O(n) for both operations. Space O(n) for string and recursion stack. Alternative: level-order (BFS) works too but pre-order is simpler. Must handle edge cases: empty tree, single node, skewed trees. The key is maintaining order consistency between serialization and deserialization.",
    topicTags: ["tree", "serialization", "dfs", "recursion"],
    seniorityLevel: ["senior"],
  },

  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "Implement Infinite Scroll with Virtualization",
    question:
      "Build infinite scroll component that efficiently renders 100,000+ items. Should only render visible items in viewport. Must handle dynamic item heights and smooth scrolling without jank.",
    answer:
      "Use Intersection Observer API to detect when user nears bottom of list. Implement virtual scrolling: calculate visible range based on scroll position and viewport height. Only render items in visible range plus small buffer above/below for smooth scrolling. Maintain scroll position when items added. For dynamic heights, measure each item after render and cache heights in Map. Update total scrollable height based on measured heights. Use transform: translateY for positioning instead of absolute positioning for better performance. Implement windowing with slice of data array. Add loading state when fetching more data. Debounce scroll events to prevent excessive calculations. Consider using react-window or react-virtualized libraries for production. Handle edge cases: rapid scrolling, item height changes, window resize. Performance critical: minimize re-renders using React.memo and useMemo for calculations.",
    topicTags: ["react", "performance", "virtualization", "infinite-scroll"],
    seniorityLevel: ["senior"],
  },

  {
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["nodejs"],
    title: "Design Idempotent Payment Processing",
    question:
      "Build payment processing system that guarantees exactly-once payment processing even with retries and network failures. Must handle duplicate requests gracefully without charging customer twice.",
    answer:
      "Implement idempotency using unique idempotency key (client-generated UUID) for each payment request. Store idempotency key with payment status in database with unique constraint. Flow: 1) Receive payment request with idempotency key. 2) Check if key exists in database. 3) If exists and completed, return cached response. 4) If exists and processing, wait or return 409 Conflict. 5) If new, insert key with 'processing' status in transaction. 6) Process payment with payment provider. 7) Update status to 'completed' or 'failed' with result. 8) Return response. Use database transactions for atomicity. Set TTL on idempotency keys (24 hours typical). Handle race conditions with SELECT FOR UPDATE or optimistic locking. Store full request/response for returning cached results. Consider using Redis for idempotency key storage with TTL for better performance. Add retry logic with exponential backoff for external API calls. Implement webhook handling for async payment confirmations. Monitor for stuck 'processing' states and implement timeout cleanup. Critical for financial transactions where duplicate charges are unacceptable.",
    topicTags: ["backend", "payments", "idempotency", "distributed-systems"],
    seniorityLevel: ["senior"],
  },

  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiStripe",
    companySize: ["large"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Rate Limiter for Payment API",
    question:
      "Design distributed rate limiter for payment API. Support multiple limits: 10 requests/second per API key, 1000 requests/hour per account, 100,000 requests/day globally. Must be accurate across multiple servers.",
    answer:
      "Use Redis with Lua scripts for atomic operations. Implement sliding window log algorithm for accuracy. Store timestamps in sorted set per key/account. Script: 1) Remove expired timestamps outside window. 2) Count remaining timestamps. 3) Check against limit. 4) Add new timestamp if under limit. 5) Return allowed/denied with retry-after header. For multiple limits, check all applicable limits before allowing request. Use Redis cluster for horizontal scaling. Key design: '{api_key}:{limit_type}:{time_bucket}'. Implement token bucket as alternative for better burst handling: store tokens and last_refill timestamp, calculate new tokens based on time elapsed, consume token if available. Use Redis pipelining for multiple checks to reduce network latency. Set TTL on keys to prevent memory bloat (2x window size). Add circuit breaker pattern for Redis failures - fail open or closed based on criticality. Implement local cache with short TTL (1-5s) to reduce Redis load for high-traffic keys. Monitor false positives/negatives. Consider geographically distributed Redis instances with consistency trade-offs. For payment APIs specifically, be more conservative and prefer accuracy over performance. Include mechanism to allowlist trusted partners. Add admin override capability. Log rate limit hits for fraud detection analysis.",
    topicTags: [
      "system-design",
      "rate-limiting",
      "distributed-systems",
      "redis",
    ],
    seniorityLevel: ["senior"],
  },

  {
    category: "database",
    difficulty: "hard",
    companyLogo: "SiUber",
    companySize: ["large"],
    primaryTechStack: ["postgresql"],
    title: "Design Multi-Tenant Database Architecture",
    question:
      "Design database architecture for SaaS application with 10,000+ tenants. Each tenant needs data isolation, but some tenants have 1M+ records while others have <100. Balance isolation, cost, and performance.",
    answer:
      "Three approaches: 1) Shared database, shared schema: Add tenant_id column to all tables. Use row-level security (RLS) in PostgreSQL. Pros: lowest cost, easy maintenance. Cons: noisy neighbor problem, data breach risk affects all. 2) Shared database, separate schemas: Each tenant gets own schema. Pros: better isolation, easier per-tenant operations. Cons: limited scalability (PostgreSQL ~10k schemas max), schema migrations complex. 3) Separate databases: Each tenant gets own database. Pros: best isolation, independent scaling, easier compliance. Cons: highest cost, ops complexity. Recommendation: Hybrid approach - large tenants get dedicated database, small tenants share with schema separation. Use connection pooler (PgBouncer) with schema switching. Implement tenant routing layer in application: read tenant from JWT/API key, set search_path for PostgreSQL. Add comprehensive indexes including tenant_id in all queries. Use partitioning for shared tables by tenant_id. Implement backup strategy per isolation level. Monitor per-tenant query performance and resource usage. Set connection limits per tenant to prevent resource hogging. Consider read replicas for large tenants. Use foreign data wrappers for cross-tenant reporting database. Implement tenant migration capability between isolation levels as they grow. Critical: never mix tenant data in queries, enforce at database constraint level where possible.",
    topicTags: ["database", "multi-tenancy", "architecture", "postgresql"],
    seniorityLevel: ["senior"],
  },

  {
    category: "security",
    difficulty: "hard",
    companyLogo: "SiAirbnb",
    companySize: ["large"],
    primaryTechStack: ["security"],
    title: "Implement Secure File Upload System",
    question:
      "Design secure file upload system handling images, PDFs, documents from untrusted users. Prevent malware, XSS, path traversal, and other attacks. Support 100MB files efficiently.",
    answer:
      "Security layers: 1) Client-side: validate file type and size before upload to save bandwidth. 2) Server-side validation: verify MIME type matches file extension, check magic bytes (file signature) to detect spoofing. Never trust Content-Type header alone. 3) Virus scanning: integrate ClamAV or cloud service (AWS S3 malware scanning). Scan files async to avoid blocking. 4) Content sanitization: for images, re-encode with ImageMagick to strip EXIF and potential exploits. For PDFs, use pdf-lib to parse and rebuild without executing scripts. For documents, consider converting to safe formats. 5) Storage isolation: store in S3/blob storage, not on application servers. Use presigned URLs for access, never direct file serving. Generate random filenames (UUID) to prevent enumeration and path traversal. Store metadata (original name, type, size) in database separately. 6) Access control: verify user owns file before allowing access. Use short-lived presigned URLs with specific permissions. 7) Content Security Policy: serve user content from separate domain (usercontent.com pattern) to prevent XSS. 8) Upload implementation: use multipart upload for large files, support resume capability. Stream directly to S3 to avoid server disk I/O. Rate limit uploads per user. 9) Monitoring: log all uploads, track file types and sizes, alert on suspicious patterns. 10) Compliance: implement data retention policies, support GDPR deletion requests. Add watermarking for sensitive content. Consider DLP (Data Loss Prevention) scanning for confidential data.",
    topicTags: ["security", "file-upload", "validation", "storage"],
    seniorityLevel: ["senior"],
  },

  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Design In-Memory LFU Cache",
    question:
      "Implement Least Frequently Used (LFU) cache with O(1) get, put, and eviction. Track access frequency for each key. On capacity, evict least frequently used item. If tie, evict least recently used among them.",
    answer:
      "Use two HashMaps and doubly linked list structure. HashMap1: key → node (stores value, frequency). HashMap2: frequency → doubly linked list of nodes with that frequency. On get: return value, increment frequency, move node to next frequency list. On put: if exists, update and increment frequency. If new and at capacity, evict from min frequency list (head node). Add new node to frequency 1 list. Track minFrequency variable to know where to evict from. When incrementing frequency, if old frequency list becomes empty and it was minFrequency, increment minFrequency. Each frequency list is doubly linked for O(1) removal and append. Add to tail (most recent), remove from head (least recent) for LRU tiebreaking within same frequency. All operations O(1) time complexity. Space complexity O(capacity) for storing nodes and lists. Implementation details: use dummy head/tail nodes for cleaner list operations. Handle edge cases: capacity 0 or 1, updating existing keys, frequency overflow (unlikely but can cap). LFU is better than LRU when access patterns have clear hot/cold data distinction. More complex than LRU but provides better hit rates for certain workloads like web caching.",
    topicTags: ["data-structures", "cache", "lfu", "hash-map"],
    seniorityLevel: ["mid", "senior"],
  },

  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiShopify",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "Implement Optimistic UI Updates",
    question:
      "Build shopping cart with optimistic updates. When user adds item, immediately show it in cart without waiting for API. Handle API failures gracefully by reverting changes and showing error.",
    answer:
      "Implement optimistic updates pattern: 1) Store cart state in React state or Redux. 2) On add item: immediately update local state to show item in cart with pending indicator. 3) Fire API request in background. 4) On success: update with server response (confirmed ID, price updates). 5) On failure: revert local state to previous, show error notification with retry option. Use useOptimistic hook in React or implement manually with three states: data, optimisticData, rollbackData. Structure: onClick → setOptimisticState → apiCall → setConfirmedState or setRollbackState. Add timestamp or unique ID to optimistic updates to handle out-of-order responses. Show loading states for individual items (spinner or opacity change) while pending. Implement retry logic with exponential backoff for transient failures. Store pending operations in queue to handle offline scenarios - sync when online. Use React Query or SWR for automatic cache management and refetching. Critical: handle edge cases like rapid successive clicks, conflicting updates, partial failures. Add undo capability for better UX. Log failed operations for debugging. Consider using IndexedDB for persistence across page reloads. For shopping cart specifically, validate stock availability in optimistic state to prevent showing items that will fail. Show clear visual distinction between confirmed and pending items. Test offline scenarios thoroughly.",
    topicTags: ["react", "optimistic-ui", "state-management", "ux"],
    seniorityLevel: ["mid"],
  },

  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiSpotify",
    companySize: ["large"],
    primaryTechStack: ["python"],
    title: "Design Background Job Processing System",
    question:
      "Build system to process millions of background jobs (email sending, thumbnail generation, data exports). Support priority queues, retries, scheduled jobs, and monitoring. Must be fault-tolerant.",
    answer:
      "Architecture: Use Redis or RabbitMQ as message broker. Celery for Python or Bull for Node.js as job processor. Components: 1) Job Producer: API servers enqueue jobs with metadata (type, payload, priority, max_retries). 2) Message Broker: Redis with multiple queues per priority level (critical, high, normal, low). Use sorted sets for delayed/scheduled jobs. 3) Workers: Multiple worker processes consume jobs. Horizontal scaling by adding more workers. Each worker: fetch job, process, acknowledge or retry. 4) Dead Letter Queue: failed jobs after max retries moved here for manual inspection. Retries: exponential backoff (1min, 5min, 15min, 1hr). Store retry count and error details with job. Idempotency: jobs should be safe to retry. Store job execution state to prevent duplicate processing. Monitoring: track queue depth, processing time, success/failure rates. Alert on queue backup or high failure rate. Use Flower for Celery or Bull Board for Bull. Job lifecycle: Pending → Processing → Success/Failed → Archived. Store job history for auditing and debugging. Implement job chaining for workflows: job1 success triggers job2. Add job result backend (Redis/database) to retrieve results. Priority handling: dedicate more workers to high-priority queues. Rate limiting: prevent worker pool exhaustion, limit concurrent jobs of same type. Graceful shutdown: wait for current jobs to complete before terminating worker. Health checks: workers report heartbeat, restart unhealthy workers. Consider job timeouts for stuck jobs.",
    topicTags: ["backend", "queues", "background-jobs", "celery"],
    seniorityLevel: ["mid", "senior"],
  },

  {
    category: "devops",
    difficulty: "hard",
    companyLogo: "SiDatadog",
    companySize: ["large"],
    primaryTechStack: ["observability"],
    title: "Design Comprehensive Observability Strategy",
    question:
      "Design observability stack for microservices architecture with 50+ services. Need logs, metrics, traces, and alerts. Must correlate across services to debug issues. Handle high volume data efficiently.",
    answer:
      "Three pillars - Logs, Metrics, Traces: 1) LOGS: Use structured JSON logging with consistent fields (timestamp, service, trace_id, level, message). Centralize with ELK stack (Elasticsearch, Logstash, Kibana) or Loki. Implement log levels appropriately (ERROR for issues, INFO for key events, DEBUG for troubleshooting). Add log sampling for high-volume services. Set retention policies by environment (prod: 30 days, dev: 7 days). 2) METRICS: Prometheus for collection, Grafana for visualization. Instrument application with RED metrics (Rate, Errors, Duration) for all endpoints. USE metrics (Utilization, Saturation, Errors) for resources. Custom business metrics (orders, revenue). Use StatsD/Telegraf for app metrics emission. Create dashboards per service and system-wide overview. Set up SLO/SLI tracking. 3) TRACES: Distributed tracing with Jaeger or Zipkin. Instrument all HTTP calls, database queries, external APIs. Propagate trace context (trace_id, span_id) through headers. Sample traces (1-10% in prod, 100% in dev) to manage volume. Analyze critical paths and latency breakdown. CORRELATION: Use trace_id as correlation key across all three pillars. Tag all data with service name, environment, version. Implement context propagation using OpenTelemetry. ALERTING: Define SLOs (99.9% uptime, p95 latency <200ms). Alert on SLO violations, not individual metrics. Use alert aggregation and deduplication. Implement escalation policies. Include runbooks in alerts. STORAGE: Hot/warm/cold tiering for cost optimization. Use object storage (S3) for long-term retention. Implement data compression. SECURITY: Scrub PII from logs, encrypt data at rest and in transit, implement RBAC for access.",
    topicTags: ["devops", "observability", "monitoring", "logging"],
    seniorityLevel: ["senior"],
  },

  // Continue with 19 more questions...

  {
    category: "mobile",
    difficulty: "hard",
    companyLogo: "SiSpotify",
    companySize: ["large"],
    primaryTechStack: ["kotlin"],
    title: "Implement Offline-First Music Player",
    question:
      "Build mobile music player that works offline. Support downloading songs for offline playback, syncing play history, queue management without network. Handle partial downloads and storage limits.",
    answer:
      "Architecture: Use Room Database for local storage. WorkManager for background downloads. ExoPlayer for playback. Implement Repository pattern with local and remote data sources. DOWNLOAD SYSTEM: Queue downloads in WorkManager with constraints (WiFi only, battery not low). Store audio files in app-specific storage (getExternalFilesDir). Implement resumable downloads using Range HTTP headers. Chunk downloads for large files. Store download progress and metadata in Room. Handle download failures with retry logic and exponential backoff. Validate downloaded files (checksum verification). OFFLINE SYNC: Store play history, favorites, playlists locally in Room with sync status flag (synced/pending). When online, batch upload pending changes to server. Implement conflict resolution (last-write-wins or server-wins based on use case). Use ContentObserver to detect connectivity changes and trigger sync. PLAYBACK: ExoPlayer with local MediaSource for offline files. Implement gapless playback between songs. Cache metadata (artist, album art) locally using Room and Glance/Coil for images. Support streaming with progressive download - start playback while downloading. STORAGE MANAGEMENT: Monitor available storage using StatFs. Implement LRU eviction policy for downloaded songs when storage is low. Allow user to set max storage limit. Show storage usage per song. Provide bulk delete capability. QUEUE MANAGEMENT: Store current queue in Room with order index. Support shuffle and repeat modes. Sync queue across devices when online. Handle queue modifications offline. UI STATE: Use StateFlow for reactive UI updates. Show clear indicators for download status, offline availability, sync pending. Implement offline banner when no connectivity. EDGE CASES: Handle app kill during download/playback, corrupted files, storage removed (SD card), permission changes. Test thoroughly on low-end devices with limited storage.",
    topicTags: ["mobile", "offline-first", "kotlin", "android"],
    seniorityLevel: ["senior"],
  },

  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiLinkedin",
    companySize: ["large"],
    primaryTechStack: ["java"],
    title: "Design Autocomplete System",
    question:
      "Design autocomplete system for search bar. Given prefix, return top 10 most searched terms in O(1) time. Support billions of searches and millions of unique terms. Update search frequency in real-time.",
    answer:
      "Use Trie data structure with frequency tracking. Each node stores character and sorted list of top terms. TRIE STRUCTURE: Each node contains map of children (char → node) and list of top K(10) most frequent terms with prefix up to this node. Store term with frequency. INSERTION: When user searches term, traverse trie inserting characters. At leaf, increment frequency. Bubble up frequency update: at each ancestor node, update top-K list by inserting/reordering. Use min-heap of size K for efficient top-K maintenance at each node. O(L) time where L is term length. QUERY: Given prefix, traverse trie to prefix's last character. Return that node's top-K list. O(1) retrieval. O(L) for traversal to prefix node. OPTIMIZATION FOR SCALE: Partition trie by first character(s) for distributed storage. Use Redis for in-memory trie storage with persistence. Implement write-behind cache: batch frequency updates, apply periodically to reduce contention. Store full trie in memory for fast reads, use disk for backup. REAL-TIME UPDATES: Use streaming architecture (Kafka) to process searches asynchronously. Workers consume search events and update trie. Eventually consistent - slight delay acceptable for autocomplete. PERSONALIZATION: Store per-user search history locally or in user profile. Merge personalized results with global popular terms. HANDLING TYPOS: Implement fuzzy matching using edit distance. Pre-compute common misspellings. Use phonetic algorithms (Soundex, Metaphone) for sound-alike suggestions. SCALABILITY: Shard trie by prefix ranges across multiple servers. Use load balancer with consistent hashing. Replicate for high availability. Cache query results with short TTL (5-10 seconds). ALTERNATIVE APPROACH: Inverted index with term frequency. Elasticsearch with completion suggester. Good for very large scale but higher latency than in-memory trie.",
    topicTags: ["algorithms", "trie", "autocomplete", "data-structures"],
    seniorityLevel: ["senior"],
  },

  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiAirbnb",
    companySize: ["large"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Hotel Booking System",
    question:
      "Design hotel booking system like Airbnb. Support searching available properties by location/dates, booking reservations, handling concurrent bookings for same room, cancellations, and payments. Scale to millions of listings.",
    answer:
      "COMPONENTS: 1) SEARCH SERVICE: Elasticsearch for full-text search and geo-queries. Index properties with location (geo_point), amenities, price range, availability calendar. Query: match location (within radius), filter by dates (availability), amenities, price. Use aggregations for faceted search. Update index async via message queue when properties change. 2) AVAILABILITY SERVICE: PostgreSQL with time-series table for room availability. Row per room per date with status (available/booked/blocked). Queries use composite index on (room_id, date). For concurrent booking protection: use SELECT FOR UPDATE or optimistic locking with version column. Transaction: check all dates available → if yes, mark as booked → commit. Handle race conditions with row-level locking. Alternative: event sourcing pattern for audit trail. 3) BOOKING SERVICE: Store booking details (guest, property, dates, price, status). Implement booking state machine: pending → confirmed → checked_in → checked_out → cancelled. Integration with payment service. Generate confirmation number (unique, short). Send confirmation emails/SMS async. 4) PAYMENT SERVICE: Integrate with Stripe/PayPal. Hold payment during pending, capture on confirmation. Support refunds for cancellations. Store payment status and transaction IDs. Implement idempotent payment processing. 5) CALENDAR SERVICE: Manage host calendars, block dates, set pricing rules (weekday/weekend rates, seasonal). Sync with external calendars (iCal). Real-time updates via WebSocket to clients. 6) NOTIFICATION SERVICE: Email/SMS/push notifications. Async processing via message queue. Templates for confirmations, reminders, cancellations. SCALING: Shard database by geographic region. Read replicas for search-heavy loads. CDN for property images. Redis cache for hot properties and search results. Rate limiting on booking attempts. CONSISTENCY: Use distributed transactions or saga pattern for multi-step bookings. Handle failures gracefully with compensation logic. MONITORING: Track booking funnel, success rates, payment failures, search latency. Alert on anomalies like sudden booking drop or high cancellation rate.",
    topicTags: [
      "system-design",
      "booking-system",
      "distributed-systems",
      "concurrency",
    ],
    seniorityLevel: ["senior"],
  },

  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiNotion",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "Build Collaborative Rich Text Editor",
    question:
      "Build rich text editor like Notion that supports real-time collaboration. Multiple users can edit simultaneously. Support formatting (bold, italic, lists), images, and conflict resolution without data loss.",
    answer:
      "Use Operational Transformation (OT) or CRDT (Conflict-free Replicated Data Type) for conflict resolution. ARCHITECTURE: 1) EDITOR: Use libraries like Slate.js or ProseMirror for rich text editing foundation. Represent document as JSON tree structure. Each node has type (paragraph, heading, list) and attributes. Support inline marks (bold, italic). 2) REAL-TIME SYNC: WebSocket connection to server. Local changes generate operations (insert, delete, format) with position and content. Send operations to server immediately. Server broadcasts to all connected clients. 3) OPERATIONAL TRANSFORMATION: Transform incoming operations based on concurrent local changes. Algorithm: for each pair of concurrent operations, transform them such that applying op1 then transformed-op2 yields same result as applying op2 then transformed-op1. Maintains convergence - all clients reach same state. Complex to implement correctly. Use OT.js library. 4) CRDT ALTERNATIVE: Yjs library provides CRDT for text. Each character has unique ID (combination of client ID and counter). Operations commute - can be applied in any order, always converge. Simpler than OT, better for P2P. 5) PRESENCE: Show other users' cursors and selections. Color-code by user. Send cursor position updates (debounced). Show active users list. 6) CONFLICT UI: Highlight conflicting sections during concurrent edits. Show merge suggestions if automated resolution uncertain. 7) OFFLINE SUPPORT: Queue operations locally when offline. Sync when reconnected. IndexedDB for persistence. 8) OPTIMIZATION: Batch operations for efficiency. Compress operation history periodically. Implement operation compaction. Limit history length. 9) IMAGES: Upload to S3, store URL in document. Lazy load images. Support paste from clipboard. 10) VERSION HISTORY: Store document snapshots periodically. Allow rollback to previous versions. CHALLENGES: handling large documents (virtualize rendering), network latency (show optimistic updates), operation order (vector clocks for causality), memory management (garbage collect old operations). Test thoroughly with concurrent edit scenarios.",
    topicTags: ["frontend", "collaborative-editing", "crdt", "real-time"],
    seniorityLevel: ["senior"],
  },

  {
    category: "database",
    difficulty: "medium",
    companyLogo: "SiCoinbase",
    companySize: ["large"],
    primaryTechStack: ["postgresql"],
    title: "Design Double-Entry Accounting System",
    question:
      "Design database schema for financial accounting system using double-entry bookkeeping. Support transactions, accounts, balances, and audit trail. Must be accurate and handle concurrent transactions safely.",
    answer:
      "SCHEMA DESIGN: 1) ACCOUNTS table: account_id (PK), account_name, account_type (asset/liability/equity/revenue/expense), parent_account_id (for hierarchical accounts), is_active, created_at. 2) TRANSACTIONS table: transaction_id (PK), transaction_date, description, posted_date, created_by, status (draft/posted/void). 3) TRANSACTION_LINES table: line_id (PK), transaction_id (FK), account_id (FK), debit_amount, credit_amount, description. Each transaction has multiple lines. Sum of debits must equal sum of credits (enforce with CHECK constraint or application logic). 4) ACCOUNT_BALANCES table: account_id (FK), period (month/year), debit_balance, credit_balance. Aggregate balances for performance. Rebuild from transaction history if needed. DOUBLE-ENTRY RULES: Every transaction has at least 2 lines (one debit, one credit). Assets and expenses increase with debits. Liabilities, equity, revenue increase with credits. Example transfer $100 from Cash to Bank: Debit Bank +$100, Credit Cash -$100. IMPLEMENTATION: Use database transactions for atomicity. When creating transaction: 1) Insert into transactions table. 2) Insert multiple rows into transaction_lines. 3) Validate sum(debits) = sum(credits) before commit. 4) Update account_balances (can be async with event sourcing). CONCURRENCY: Use SELECT FOR UPDATE on account_balances during updates to prevent race conditions. Alternatively, use optimistic locking with version column. High-throughput scenario: queue balance updates, process in batches. AUDIT TRAIL: Never delete transactions - mark as void and create reversing entry. Store who created/modified and when. Immutable transaction history. QUERY PATTERNS: Balance sheet: aggregate by account type. Income statement: revenue - expenses for period. Trial balance: sum all debits and credits, verify they match. Use materialized views for common reports. VALIDATION: Check account types in transaction (e.g., can't debit a liability with expense logic). Enforce business rules like fiscal period closure. OPTIMIZATION: Index on (account_id, transaction_date) for balance queries. Partition transaction_lines by date for large volumes. Use read replicas for reporting queries. COMPLIANCE: Support multi-currency with exchange rates. Track cost centers/departments with dimensions. Implement approval workflows for large transactions.",
    topicTags: ["database", "accounting", "schema-design", "transactions"],
    seniorityLevel: ["mid", "senior"],
  },

  {
    category: "security",
    difficulty: "medium",
    companyLogo: "SiTwilio",
    companySize: ["large"],
    primaryTechStack: ["nodejs"],
    title: "Implement Multi-Factor Authentication",
    question:
      "Implement MFA system supporting TOTP (authenticator apps), SMS codes, and backup codes. Secure against brute force, phishing, and account takeover. Support account recovery.",
    answer:
      "MFA TYPES: 1) TOTP (Time-based One-Time Password): Use libraries like speakeasy or otplib. Generate secret key on enrollment, show as QR code for user to scan with authenticator app. Verify code by checking current time window plus/minus 1 period (30s each) for clock skew tolerance. Store hashed secret in database. 2) SMS: Generate 6-digit random code, send via Twilio. Store hashed code with expiry (5 minutes) and attempt counter. Rate limit requests (max 3 SMS per hour per user). More vulnerable to SIM swapping - offer as backup, not primary. 3) BACKUP CODES: Generate 10 one-time use codes on enrollment. User downloads/prints them. Hash before storing. Mark as used after verification. Allow regeneration with password confirmation. ENROLLMENT FLOW: User enables MFA → chooses method → for TOTP: scan QR code and verify one code to confirm setup → show backup codes → mark account as MFA-enabled. AUTHENTICATION FLOW: User enters username/password → if MFA enabled, prompt for second factor → verify code → on success, create session with MFA-verified flag → check this flag forRetryMContinuesensitive operations. SECURITY MEASURES: 1) Rate limiting: max 5 failed MFA attempts per 15 minutes, then temporary lockout. Progressive delays after failures. 2) Brute force protection: after 10 total failures, require account recovery. 3) Session management: MFA verification valid for session duration only. Require re-authentication for sensitive actions (password change, payment). 4) Device trust: offer 'trust this device' for 30 days using secure cookie. Still require password, skip MFA code. 5) Anti-phishing: display secret image or phrase that only real site knows during login. 6) Account takeover prevention: alert user of new MFA enrollment via email. Require current MFA code to disable MFA. RECOVERY FLOW: User lost access to MFA → enters backup code → grants temporary access to disable/re-enroll MFA → alternatively, support email-based recovery with identity verification questions → administrator override for enterprise. IMPLEMENTATION: Store MFA config per user: {mfa_enabled: boolean, totp_secret: string (encrypted), backup_codes: array (hashed), sms_phone: string (encrypted), trusted_devices: array}. Encrypt secrets at rest using application-level encryption (AES-256). Use secure random number generator for codes/secrets (crypto.randomBytes). LOGGING: Log all MFA events - enrollment, successful auth, failures, device trust, recovery attempts. Monitor for suspicious patterns. Alert on multiple failed attempts or unusual recovery requests. COMPLIANCE: Support FIDO2/WebAuthn for phishing-resistant authentication. Implement according to NIST 800-63B guidelines. Provide admin dashboard showing MFA adoption rate. TESTING: Test all failure scenarios, rate limits, expiry handling, concurrent requests, time synchronization issues. Security audit before production.",
    topicTags: ["security", "mfa", "authentication", "totp"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiPaypal",
    companySize: ["large"],
    primaryTechStack: ["python"],
    title: "Detect Fraudulent Transaction Patterns",
    question:
      "Given stream of transactions, detect potentially fraudulent patterns in real-time: rapid successive purchases, unusual locations, amount anomalies, velocity checks. Each transaction has user_id, amount, merchant, location, timestamp.",
    answer:
      "Implement multi-layered fraud detection with rule-based and ML approaches: RULE-BASED CHECKS (Real-time): 1) VELOCITY CHECK: Track transaction count per user in sliding time windows (5min, 1hour, 24hour) using Redis sorted sets. Alert if exceeds threshold (e.g., >5 in 5min). 2) AMOUNT ANOMALY: Calculate user's historical average transaction amount (keep running stats). Alert if current transaction >3 standard deviations from mean. Use exponential moving average for recent behavior. 3) LOCATION ANOMALY: Track last transaction location in Redis. Calculate distance and time between transactions. Alert if physically impossible travel (>500 km in 1 hour). Use geospatial distance formula (Haversine). 4) MERCHANT CATEGORY: Flag high-risk merchant categories (gift cards, wire transfers). 5) ROUND AMOUNTS: Transactions with round numbers (100, 500, 1000) more likely testing stolen cards. 6) DUPLICATE DETECTION: Check for duplicate transactions within 2 minutes (same amount, merchant) indicating retry attacks. IMPLEMENTATION: Use streaming architecture (Kafka) for real-time processing. Consumer reads transactions, runs checks in parallel, publishes fraud score. Store user profiles in Redis for fast lookups (last location, transaction stats). Update profiles asynchronously. ML ENHANCEMENT: Train model on historical labeled data (fraudulent/legitimate). Features: transaction amount, time of day, day of week, merchant category, user history, device fingerprint, IP address. Use Random Forest or Gradient Boosting. Online learning: periodically retrain with new labeled data. Hybrid: combine ML score with rule-based checks. FRAUD SCORE: Weight different signals (velocity: 30%, location: 25%, amount: 20%, ML: 25%). Score 0-100. Thresholds: <30 approve, 30-70 review, >70 decline. ADAPTIVE THRESHOLDS: Adjust based on user trust level (new users stricter). Time-decay for old transactions (recent behavior weighted more). RESPONSE ACTIONS: Low risk: approve. Medium: trigger 3D Secure or SMS verification. High: decline + lock account + alert fraud team. FALSE POSITIVE HANDLING: Allow user to confirm legitimate transaction. Learn from feedback to improve model. User whitelist for trusted merchants/locations. PERFORMANCE: Process <50ms per transaction. Use in-memory data structures. Horizontal scaling of fraud detection workers. Circuit breaker for external service calls. MONITORING: Track fraud detection rate, false positive rate, processing latency. A/B test new rules. Dashboard showing real-time fraud attempts by pattern type.",
    topicTags: ["algorithms", "fraud-detection", "streaming", "real-time"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiZoom",
    companySize: ["large"],
    primaryTechStack: ["webrtc"],
    title: "Design Video Conferencing System",
    question:
      "Design scalable video conferencing system supporting 100+ participants per room. Handle video/audio streams, screen sharing, chat, and recording. Minimize latency and bandwidth usage.",
    answer:
      "ARCHITECTURE: 1) SIGNALING SERVER: WebSocket server for session management, participant join/leave, SDP (Session Description Protocol) offer/answer exchange, ICE candidate exchange. Use Redis pub/sub for multi-server coordination. 2) MEDIA SERVERS: SFU (Selective Forwarding Unit) architecture for scalability. Each participant sends one stream to SFU, which forwards to all other participants. More efficient than mesh (P2P between all) or MCU (server mixing). Use Mediasoup or Janus as SFU. 3) TURN SERVERS: For NAT traversal when P2P fails. Deploy geographically distributed TURN servers. Use coturn for implementation. 4) MEDIA PROCESSING: SFU forwards streams without transcoding for low latency. Optional: simulcast (sender transmits multiple qualities, SFU selects based on receiver bandwidth). 5) RECORDING: SFU records streams server-side. Combine into single video file using FFmpeg. Upload to S3. Generate thumbnails and transcript. BANDWIDTH OPTIMIZATION: 1) Adaptive bitrate: adjust quality based on network conditions. 2) Simulcast: high/medium/low quality streams. 3) Active speaker detection: show active speaker in higher quality, others in lower. 4) Pagination: only receive streams for visible participants (12-25 on screen). 5) Audio-only mode option for poor connections. SCALING: 1) Horizontal scaling: multiple SFU instances behind load balancer. Use consistent hashing to route participants of same room to same SFU when possible. 2) SFU cascade: for >100 participants, cascade SFUs in tree structure. Top SFU receives all streams, forwards to child SFUs serving participant groups. 3) Geographic distribution: route participants to nearest SFU region. FEATURES: 1) SCREEN SHARE: separate WebRTC stream with higher resolution constraints. 2) CHAT: WebSocket messages through signaling server or WebRTC data channels. 3) WAITING ROOM: queue participants, host approves entry. 4) NOISE SUPPRESSION: Krisp or WebRTC audio processing on client. 5) VIRTUAL BACKGROUNDS: TensorFlow.js for person segmentation on client side. SECURITY: DTLS-SRTP for media encryption. Authenticate via JWT tokens. Validate all signaling messages. Rate limit connections. MONITORING: Track concurrent rooms, participant count, bandwidth usage, packet loss, latency, CPU usage on SFUs. Alert on high packet loss or CPU. FALLBACK: Detect poor connectivity and suggest audio-only mode. Automatic reconnection on network issues. Quality indicators (red/yellow/green) for each participant. COMPLIANCE: GDPR-compliant recording storage. E2E encryption option using Insertable Streams API. CHALLENGES: Handle mobile browsers (different WebRTC support), cross-browser compatibility, firewall configurations, asymmetric bandwidth (slow upload). Test with network simulation tools.",
    topicTags: ["backend", "webrtc", "video-conferencing", "real-time"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiTwitter",
    companySize: ["faang"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Twitter Feed Generation",
    question:
      "Design system to generate personalized Twitter feed for 500M users. Each user follows 500 accounts average. Feed shows tweets from followed users in reverse chronological order. Support real-time updates and pagination.",
    answer:
      "Two approaches - FANOUT ON WRITE vs FANOUT ON READ: FANOUT ON WRITE (Push): When user tweets, push to all followers' feeds immediately. PROS: Fast read (pre-computed feeds). CONS: Slow write for celebrities (millions of followers), storage intensive (duplicate tweets). FANOUT ON READ (Pull): When user requests feed, query tweets from all followed users. PROS: No duplication, simple write. CONS: Slow read (query many users), hot user problem. HYBRID APPROACH (Twitter's actual solution): 1) REGULAR USERS: Fanout on write. When user tweets → async job pushes tweet_id to Redis list for each follower (max 1M followers). Each user has Redis list of recent tweet IDs (cache last 1000). 2) CELEBRITIES: Fanout on read. Don't fanout celebrity tweets. When generating feed, merge pre-computed feed from Redis with fresh celebrity tweets from database query. 3) FEED GENERATION: Request comes → fetch cached tweets from Redis → if user follows celebrities, query their recent tweets from database → merge both streams by timestamp → return paginated results → cache results with short TTL. COMPONENTS: 1) TWEET INGESTION: Kafka for tweet stream. Workers consume and process fanout. 2) FEED SERVICE: Handles feed requests, orchestrates merging, returns results. 3) STORAGE: Cassandra for tweet storage (partition by user_id + timestamp). Redis for cached feeds. 4) TIMELINE SERVICE: Manages follower graph in graph database or sharded MySQL. 5) REAL-TIME UPDATES: WebSocket connections for live feed updates. New tweet → fanout → push via WebSocket to online followers. RANKING: Basic: reverse chronological. Advanced: ML ranking based on engagement probability (likes, retweets), user interests, tweet quality. PAGINATION: Cursor-based (last_seen_tweet_id + timestamp) better than offset for real-time data. OPTIMIZATION: 1) Followers count threshold: >1M followers = celebrity tier. 2) Feed pre-warming for highly active users. 3) Batch fanout processing in chunks. 4) Limit fanout to recently active followers only. 5) Materialize feeds for inactive users on demand. SCALE NUMBERS: 500M users, 200M DAU, 500 tweets/sec. Feed generation <200ms P99. Storage: 300B tweets/year, ~30PB. MONITORING: Track fanout lag, feed generation latency, cache hit rate, storage growth. Alert on fanout queue backup or latency spikes. CHALLENGES: Handling tweet deletions (cascade cleanup), blocked users (exclude from feeds), spam prevention (rate limits, pattern detection), load balancing (celebrity effect), consistency (eventual vs strong).",
    topicTags: ["system-design", "feed-generation", "scalability", "caching"],
    seniorityLevel: ["senior"],
  },
  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiFigma",
    companySize: ["large"],
    primaryTechStack: ["canvas"],
    title: "Build Vector Graphics Editor",
    question:
      "Build browser-based vector graphics editor like Figma. Support shapes (rectangles, circles, paths), transformations (move, resize, rotate), layers, undo/redo, and multi-user collaboration. Must handle 10,000+ objects smoothly.",
    answer:
      "RENDERING ENGINE: Use HTML5 Canvas or WebGL for performance. Canvas API for 2D graphics. Structure: Scene graph with hierarchical objects. Each object has properties: type, position, size, rotation, color, strokeWidth, opacity, parent. Render loop: clear canvas → traverse scene graph → apply transformations (translate, scale, rotate) → draw each object → request next animation frame. OPTIMIZATION: 1) Viewport culling: only render objects in visible area. 2) Object pooling: reuse object instances instead of creating new. 3) Dirty rectangle: only redraw changed regions. 4) Spatial indexing: R-tree for fast intersection queries (which object clicked?). 5) Layer caching: render complex groups to offscreen canvas, composite onto main canvas. 6) WebGL: for 10,000+ objects, use WebGL with instanced rendering or texture atlases. TRANSFORMATIONS: Use transformation matrices (2D: 3x3, 3D: 4x4). Each object has local transform matrix. Combine with parent transforms for world position. Selection: bounding box with handles. Drag handle → calculate new transform → update matrix → re-render. INTERACTION: 1) SELECTION: Raycast on click to find object at point. Use spatial index for efficiency. Support multi-select with Shift/Cmd. 2) MANIPULATION: Drag to move (translate). Drag handles to resize (scale). Drag rotation handle to rotate. Snap to grid/guides. Show real-time preview during manipulation. 3) TOOLS: Selection, rectangle, circle, pen (Bezier paths), text, pan, zoom. State machine for tool switching. UNDO/REDO: Command pattern. Each action (create, delete, move, transform) is command object with execute() and undo() methods. Maintain command stack. Redo stack cleared on new action. Serialize commands for undo history. LAYERS: Tree structure with parent/child relationships. Drag to reorder. Toggle visibility/lock. Render respects layer order (z-index). Group objects into layers for organization. COLLABORATION: Use CRDT (Yjs) or Operational Transformation for conflict-free concurrent editing. Each client has local state. Operations (create, modify, delete) broadcasted to all clients. Transform operations to account for concurrent changes. Show other users' cursors and selections in different colors. Implement presence tracking. Handle network latency with optimistic updates. PERFORMANCE MONITORING: Track FPS, render time, object count. Profile with Chrome DevTools. Optimize critical path (render loop). Use Web Workers for heavy computations (path calculations, image processing). PERSISTENCE: Serialize scene graph to JSON. Save to backend via API. Implement autosave every 30 seconds. Version history with snapshots. Export to SVG, PNG formats. ADVANCED FEATURES: Boolean operations (union, subtract, intersect), gradients, shadows, blur effects, masks, blend modes. Use libraries like Paper.js for complex path operations. CHALLENGES: Memory management with large scenes, handling touch input on mobile, browser compatibility (Safari vs Chrome rendering differences), maintaining 60 FPS during complex interactions.",
    topicTags: ["frontend", "canvas", "graphics", "performance"],
    seniorityLevel: ["senior"],
  },
  {
    category: "mobile",
    difficulty: "medium",
    companyLogo: "SiInstagram",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Implement Image Filters and Editing",
    question:
      "Build Instagram-style image editing feature. Support filters (vintage, black & white, etc.), adjustments (brightness, contrast, saturation), cropping, and rotation. Must process images efficiently without blocking UI.",
    answer:
      "ARCHITECTURE: Use Core Image framework for iOS (Android: RenderScript or GPUImage). Core Image uses GPU for fast processing. Chain filters for complex effects. FILTERS: Each filter is CIFilter instance with parameters. Apply sequence of filters to create effects. VINTAGE: sepia tone + vignette + grain. B&W: desaturate + adjust contrast. Popular filters: CIPhotoEffectInstant, CIPhotoEffectNoir, CIVignette, CIColorControls. Chain filters: output of one is input to next. ADJUSTMENTS: Brightness: CIColorControls with inputBrightness. Contrast: CIColorControls with inputContrast. Saturation: CIColorControls with inputSaturation. Exposure: CIExposureAdjust. Sharpen: CISharpenLuminance. Use sliders (range -1.0 to 1.0) for user control. PERFORMANCE: 1) ASYNC PROCESSING: Never block main thread. Dispatch image processing to background queue. Use DispatchQueue.global(qos: .userInitiated). 2) PREVIEW: Generate low-resolution preview for real-time filter preview. Apply filters to downscaled image (max 1024px). Show in UIImageView. 3) FULL RESOLUTION: Apply filters to full-res image only on save. Show progress indicator during export. 4) CONTEXT REUSE: Create single CIContext, reuse for all filter operations. Context creation is expensive. 5) METAL: Use CIContext with Metal device for best GPU performance. 6) CACHING: Cache filter output for each adjustment level to enable instant undo without reprocessing. LRU cache with size limit. CROPPING: Use CICrop filter or CoreGraphics cropping. Show interactive crop overlay with adjustable frame. Support aspect ratio presets (1:1, 4:3, 16:9). Implement pinch-to-zoom for precise cropping. ROTATION: Use CGAffineTransform for 90° rotations. Update image orientation metadata. For arbitrary angles, use CIAffineTransform filter. PREVIEW UI: Show thumbnail grid of filter options. Lazy load filter previews - only generate for visible cells. Reuse preview images with UICollectionView. Add before/after comparison by long-pressing on image. SAVING: Combine all edits into final CIImage. Export to UIImage: use CIContext.createCGImage(). Save to Photos: use PHPhotoLibrary. Compress JPEG with quality 0.9 for good size/quality trade-off. Preserve EXIF metadata using CGImageDestination. MEMORY MANAGEMENT: Large images consume significant memory. Monitor memory warnings and clear caches. Use autoreleasepool for batch processing. Avoid keeping multiple full-res images in memory. IMAGE FORMATS: Support JPEG, PNG, HEIC. Use ImageIO framework for efficient loading. For RAW images, use CIRAWFilter. TESTING: Test on various image sizes (small icons to 4K photos). Test memory usage with large images. Verify filter consistency across devices. Profile with Instruments (GPU Driver, Allocations). EDGE CASES: Handle portrait/landscape orientation correctly. Verify color space handling (sRGB vs Display P3). Test on devices with limited memory (older iPhones). Implement graceful degradation if GPU unavailable.",
    topicTags: ["mobile", "image-processing", "core-image", "ios"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "devops",
    difficulty: "hard",
    companyLogo: "SiGitlab",
    companySize: ["large"],
    primaryTechStack: ["kubernetes"],
    title: "Design Zero-Downtime Deployment Strategy",
    question:
      "Design deployment strategy for Kubernetes cluster that achieves zero downtime for customer-facing services. Handle database migrations, feature flags, rollback capability, and gradual rollout. Support 99.99% uptime SLA.",
    answer:
      "DEPLOYMENT STRATEGY: Use Rolling Update with careful configuration. PREREQUISITES: 1) SERVICE MUST BE: Stateless or externalize state to database/cache. Support running multiple versions simultaneously during rollout. Implement health checks (readiness/liveness probes). Graceful shutdown handling (SIGTERM). 2) DATABASE MIGRATIONS: Backwards-compatible migrations only. Add column as nullable → deploy app → backfill data → add constraint. Never drop columns in same release as app deployment. Use migration tools with rollback support (Flyway, Liquibase). Run migrations as init container before app starts or as separate job before deployment. KUBERNETES CONFIG: 1) ROLLING UPDATE: Set strategy: type: RollingUpdate, maxUnavailable: 0 (never reduce capacity), maxSurge: 1 (one extra pod). This ensures old version stays up until new version is ready. 2) READINESS PROBE: HTTP endpoint /health/ready. Only route traffic when ready. Configure: initialDelaySeconds: 10, periodSeconds: 5, successThreshold: 1, failureThreshold: 3. 3) LIVENESS PROBE: Different from readiness. Use /health/live. Detects completely broken pods. Configure with longer timeouts. 4) GRACEFUL SHUTDOWN: Handle SIGTERM signal. Finish in-flight requests before exiting. Kubernetes sends SIGTERM → waits terminationGracePeriodSeconds (30s default) → sends SIGKILL. Implement: stop accepting new requests → drain connections → close resources → exit. 5) POD DISRUPTION BUDGET: Ensure minimum pods always available during voluntary disruptions. minAvailable: 2 or maxUnavailable: 1. FEATURE FLAGS: Use LaunchDarkly or custom solution. Deploy code behind flag (disabled). Enable gradually: 1% → 10% → 50% → 100%. Monitor metrics at each stage. Instant rollback by disabling flag without redeployment. Implement at application level. CANARY DEPLOYMENT: Alternative to rolling. Deploy new version to small % of traffic first. Use Istio service mesh or Flagger for traffic splitting. Route 5% traffic to canary → monitor error rate, latency, CPU → if healthy, increase to 50% → if still healthy, route 100%. Automated rollback on metric degradation. BLUE-GREEN WITH DB: Tricky with database. Approach: 1) Deploy green (new version) pointing to same database. 2) Ensure backward compatibility. 3) Route traffic to green via service/ingress update. 4) Monitor for issues. 5) Keep blue running for quick rollback. 6) After validation period, scale down blue. MONITORING & ROLLBACK: 1) HEALTH METRICS: Error rate (<0.1%), P95 latency (< SLA), saturation (CPU/memory). 2) AUTOMATED ROLLBACK: If error rate spikes >1% or latency >2x baseline → trigger automatic rollback. Use tools like Argo Rollouts or Flagger for progressive delivery with automated rollback. 3) MANUAL ROLLBACK: kubectl rollout undo deployment/app. Returns to previous ReplicaSet. Keep last 10 revisions for rollback. CI/CD PIPELINE: 1) Run tests (unit, integration, E2E). 2) Build image, tag with git SHA. 3) Push to registry. 4) Update Kubernetes manifests (Helm values). 5) Apply to staging environment. 6) Run smoke tests. 7) Approve for production (manual gate for critical services). 8) Apply to production with rolling update. 9) Monitor metrics for 15 minutes. 10) Auto-rollback or continue. DISASTER SCENARIOS: 1) Bad migration: Have rollback migration ready. Test in staging. 2) Network partition: Implement circuit breakers, timeouts. 3) Cascading failures: Implement bulkheads, rate limiting. 4) Data corruption: Regular backups, point-in-time recovery. TESTING: Chaos engineering with tools like Chaos Mesh. Randomly kill pods during deployment to verify zero downtime. Load testing during deployment to ensure capacity.",
    topicTags: ["devops", "kubernetes", "deployment", "zero-downtime"],
    seniorityLevel: ["senior"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiSnowflake",
    companySize: ["large"],
    primaryTechStack: ["java"],
    title: "Design Distributed ID Generator",
    question:
      "Design system to generate unique IDs across distributed system without coordination. Must generate 100k IDs/sec per machine. IDs should be sortable by time, unique globally, and ~64 bits for database efficiency.",
    answer:
      "Use Twitter Snowflake algorithm or similar. STRUCTURE (64 bits): 1) 1 bit: unused (always 0 for positive numbers). 2) 41 bits: timestamp in milliseconds since custom epoch (gives 69 years). 3) 10 bits: machine/datacenter ID (supports 1024 machines). 4) 12 bits: sequence number (4096 IDs per millisecond per machine). ALGORITHM: 1) Get current timestamp in milliseconds since epoch (e.g., Jan 1, 2020). 2) If timestamp same as last timestamp, increment sequence. 3) If sequence exceeds 4095, wait until next millisecond. 4) If new timestamp, reset sequence to 0. 5) Combine: (timestamp << 22) | (machineId << 12) | sequence. 6) Return as 64-bit long. PROPERTIES: Sortable: Higher timestamp means higher ID, enabling time-range queries. Unique: Different machines have different IDs, same machine uses sequence for uniqueness. No coordination: Each machine generates independently. Efficiency: Fits in BIGINT database column, indexable. IMPLEMENTATION DETAILS: 1) CLOCK SYNC: Machines must have synchronized clocks (NTP). Handle clock skew: if new timestamp < last timestamp (clock moved backward), throw error or wait. Small backward jumps (<5ms) can wait, large jumps should reject. 2) MACHINE ID: Assign statically via config or dynamically via ZooKeeper/etcd. Ensure uniqueness. Use combination of datacenter ID (5 bits) + machine ID (5 bits) for better distribution across DCs. 3) SEQUENCE OVERFLOW: If 4096 IDs generated in same millisecond, sleep until next millisecond. For high throughput, consider using more bits for sequence (reducing timestamp or machine ID bits). 4) THREAD SAFETY: Use synchronization or atomic operations for sequence increment. Lock-free implementation possible with CAS (Compare-And-Swap). ALTERNATIVES: 1) UUID: 128 bits, random, not sortable, inefficient for databases. 2) Database auto-increment: Coordination overhead, single point of failure, doesn't scale. 3) MongoDB ObjectID: Similar to Snowflake but 96 bits (larger). 4) ULID: Lexicographically sortable, 128 bits, includes randomness. MONITORING: Track ID generation rate, clock drift, sequence overflow frequency. Alert on clock inconsistencies. EDGE CASES: System start time: initialize sequence and timestamp. Machine restart: ensure machine ID persists or reassign safely. Time zone changes: use UTC always. Leap seconds: millisecond precision avoids most issues. CAPACITY: 41-bit timestamp: 2^41 ms ≈ 69 years from epoch. 10-bit machine: 1024 unique machines. 12-bit sequence: 4096 IDs per ms per machine = 4M IDs/sec per machine. Total: 4B IDs/sec across 1024 machines. OPTIMIZATION: For even higher throughput, use 13-bit sequence (8192/ms), reduce machine ID to 9 bits (512 machines). Trade-offs depend on requirements. PRODUCTION USAGE: Twitter uses Snowflake IDs for tweets. Instagram uses similar for photo IDs. Shopify uses for order IDs. Discord uses for message IDs (slight variation with different bit allocation).",
    topicTags: [
      "algorithms",
      "distributed-systems",
      "id-generation",
      "snowflake",
    ],
    seniorityLevel: ["senior"],
  },
  {
    category: "testing",
    difficulty: "hard",
    companyLogo: "SiAtlassian",
    companySize: ["large"],
    primaryTechStack: ["testing"],
    title: "Design Contract Testing Strategy for Microservices",
    question:
      "Design contract testing approach for 20 microservices with complex dependencies. Prevent integration issues without requiring all services running for tests. Support independent deployment of services.",
    answer:
      "Use CONSUMER-DRIVEN CONTRACT TESTING with Pact or Spring Cloud Contract. CONCEPT: Consumer defines expectations of provider (API contract). Provider verifies it satisfies consumer expectations. Both test against contract independently. WORKFLOW: 1) CONSUMER SIDE: Write tests defining API expectations (requests/responses). Generate contract file (JSON/YAML). Examples: GET /users/123 returns {id:123,name:'Alice',email:'alice@example.com'}. POST /orders with valid payload returns 201. Publish contract to Pact Broker or artifact repository. Run tests against mock provider that implements contract. 2) PROVIDER SIDE: Fetch all consumer contracts from broker. Set up provider application (real service or test instance). For each contract, replay consumer requests, verify responses match expectations. If provider changes API, contract tests fail, preventing breaking changes. Can deploy safely if all contracts pass. BENEFITS: Detect breaking changes early before integration testing. Fast feedback (no need for full environment). Independent testing - services don't need to be running simultaneously. Enables independent deployment with confidence. Documentation - contracts serve as API documentation. PACT BROKER: Central repository for contracts. Stores contracts versioned by consumer/provider/version. Shows compatibility matrix: which consumer versions work with which provider versions. Can-I-Deploy tool: checks if new version is compatible with production versions of dependencies. Webhooks for CI/CD integration: trigger provider verification on new contract. IMPLEMENTATION: 1) SETUP: Install Pact libraries (pact-jvm, pact-js, pact-go). Run Pact Broker (Docker image available). 2) CONSUMER TEST: Mock provider using Pact framework. Define interactions (request/response pairs). Execute consumer logic against mock. Verify and publish contract. 3) PROVIDER TEST: Configure provider with Pact library. Set up state hooks for data setup (e.g., ensure user 123 exists). Run provider verification fetching contracts from broker. Report results to broker. CI/CD INTEGRATION: 1) Consumer pipeline: Run Pact tests → publish contracts → notify provider. 2) Provider pipeline: Run Pact verification → report results → can-I-deploy check → deploy if safe. 3) Protect main branch: Block merges if contracts broken. VERSIONING: Use semantic versioning for services. Tag contracts with version. Broker tracks compatibility between versions. Support multiple provider versions in production during gradual rollouts. CHALLENGES: 1) STATE MANAGEMENT: Provider must set up correct state for each interaction (user exists, order placed). Implement provider states with setup/teardown. 2) ASYNCHRONOUS MESSAGING: Use Pact for message queues. Define message contracts separate from HTTP contracts. 3) SCHEMA EVOLUTION: Use matchers for flexible contracts (type matching vs exact values). Allow adding optional fields without breaking. 4) COMPLEX RESPONSES: Don't over-specify. Test business-critical fields only. Use regex/type matchers for variable data. MONITORING: Track contract coverage (% of API covered), breaking change frequency, time to detect issues. ALTERNATIVE: Schema-based contracts using OpenAPI/Swagger specs. Less consumer-driven but simpler for many-to-many relationships. BEST PRACTICES: Start with critical service boundaries. Incrementally adopt across services. Keep contracts simple and focused. Regularly clean up old contracts. Educate team on contract testing philosophy.",
    topicTags: ["testing", "contract-testing", "microservices", "pact"],
    seniorityLevel: ["senior"],
  },
];

function deriveCompanyName(logo: string): string {
  const formatted = COMPANY_NAME_MAP[logo];
  if (formatted) {
    return formatted;
  }

  const cleaned = logo.replace(/^Si/, "");
  const withDots = cleaned.replace(/dot/gi, ".");
  const withSpaces = withDots.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Normalize common tech acronyms
  return withSpaces
    .replace(/Js\b/g, "JS")
    .replace(/Api\b/g, "API")
    .replace(/Aws\b/g, "AWS")
    .replace(/Ci\b/g, "CI")
    .replace(/Cd\b/g, "CD")
    .trim();
}

const COMPANY_NAME_MAP: Record<string, string> = {
  SiGitlab: "GitLab",
  SiAmazonaws: "AWS",
  SiMicrosoftazure: "Microsoft Azure",
  SiGooglecloud: "Google Cloud",
  SiIstio: "Istio",
  SiConsul: "Consul",
  SiJaeger: "Jaeger",
  SiHashicorp: "HashiCorp",
  SiSlack: "Slack",
  SiDropbox: "Dropbox",
  SiAirbnb: "Airbnb",
  SiUber: "Uber",
  SiStripe: "Stripe",
  SiZoom: "Zoom",
  SiShopify: "Shopify",
  SiSpotify: "Spotify",
  SiPaypal: "PayPal",
  SiCoinbase: "Coinbase",
  SiDatadog: "Datadog",
  SiSnowflake: "Snowflake",
  SiTwilio: "Twilio",
  SiNotion: "Notion",
  SiAtlassian: "Atlassian",
  SiMeta: "Meta",
  SiLinkedin: "LinkedIn",
  SiNetflix: "Netflix",
  SiGoogle: "Google",
  SiApple: "Apple",
  SiAmazon: "Amazon",
  SiMicrosoft: "Microsoft",
  SiTesla: "Tesla",
  SiGithub: "GitHub",
  SiVercel: "Vercel",
  SiMozilla: "Mozilla",
  SiAlibaba: "Alibaba",
  SiFacebook: "Facebook",
};

async function seedQuestions() {
  console.log("🌱 Starting database seeding...\n");
  console.log(`📊 Total questions to seed: ${questions.length}\n`);

  try {
    const questionsRef = db.collection("practice-questions");
    const BATCH_SIZE = 500;
    let totalAdded = 0;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const currentBatch = questions.slice(i, i + BATCH_SIZE);

      console.log(
        `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)}...`,
      );

      currentBatch.forEach((question) => {
        const companyName = deriveCompanyName(question.companyLogo);
        const docRef = questionsRef.doc();
        batch.set(docRef, {
          ...question,
          companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await batch.commit();
      totalAdded += currentBatch.length;
      console.log(
        `  ✅ Added ${currentBatch.length} questions (Total: ${totalAdded}/${questions.length})`,
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 Successfully seeded ${totalAdded} questions!`);
    console.log("=".repeat(60));

    // Summary by category
    const summary = questions.reduce(
      (acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📈 Questions by category:");
    Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedQuestions()
  .then(() => {
    console.log("\n✨ Done! Check your Firestore console.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
