// /**
//  * Firestore Database Seeding Script for Practice Questions
//  *
//  * Usage:
//  * 1. Create a file: scripts/seed-questions.ts
//  * 2. Run: npx ts-node scripts/seed-questions.ts
//  *
//  * Or add to package.json:
//  * "scripts": {
//  *   "seed:questions": "ts-node scripts/seed-interview-questions.ts"
//  * }
//  *
//  *
//  * run npx ts-node scripts/seed-interview-questions.ts
//  */

// import { initializeApp, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { PracticeQuestion } from '@/lib/services/practice-questions/practice-questions-service';
// import { readFileSync } from 'fs';
// import { join } from 'path';

// // Load service account
// let serviceAccount: any;
// try {
//   const serviceAccountPath = join(process.cwd(), 'scripts', 'serviceAccounts.json');
//   serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
// } catch (error) {
//   console.error('❌ Error loading service account:');
//   console.error('Please ensure you have downloaded the Firebase service account JSON file');
//   console.error('and placed it at: scripts/serviceAccounts.json');
//   console.error('\nTo get the service account file:');
//   console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
//   console.error('2. Click "Generate new private key"');
//   console.error('3. Save the file as scripts/serviceAccounts.json');
//   process.exit(1);
// }

// // Initialize Firebase Admin
// initializeApp({
//   credential: cert(serviceAccount)
// });

// const db = getFirestore();

// const sampleQuestions = [
//  {
//     category: "algorithms",
//     difficulty: "easy",
//     companyLogo: "SiGoogle",
//     companySize: ["large", "faang"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Two Sum Problem",
//     question: "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
//     answer: "Use a hash map to store seen numbers. For each number, check if target - number exists in map. Time: O(n), Space: O(n).",
//     topicTags: ["arrays", "hash-map", "two-pointers", "optimization", "time-complexity"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiMeta",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["java", "spring-boot", "kafka"],
//     languages: ["java"],
//     backendFrameworks: ["spring-boot"],
//     messageQueues: ["kafka"],
//     databases: ["cassandra", "redis"],
//     title: "Design Facebook News Feed",
//     question: "Design a scalable news feed system that shows personalized posts to users.",
//     answer: "Use fan-out on write for small followings, fan-out on read for celebrities. Store feeds in Redis, posts in Cassandra. Use Kafka for real-time updates. Implement ranking algorithm based on engagement.",
//     topicTags: ["system-design", "scalability", "caching", "distributed-systems", "real-time"]
//   },
//   {
//     category: "frontend",
//     difficulty: "medium",
//     companyLogo: "SiAirbnb",
//     companySize: ["unicorn", "large"],
//     primaryTechStack: ["react", "typescript"],
//     languages: ["typescript"],
//     frontendFrameworks: ["react"],
//     cssFrameworks: ["styled-components"],
//     stateManagement: ["redux"],
//     title: "Build a Date Picker Component",
//     question: "Create a reusable, accessible date picker with range selection.",
//     answer: "Use React hooks for state, ARIA labels for accessibility. Handle keyboard navigation, edge cases like leap years. Memoize calendar calculations. Test with screen readers.",
//     topicTags: ["react", "components", "accessibility", "user-interface", "form-controls"]
//   },
//   {
//     category: "backend",
//     difficulty: "medium",
//     companyLogo: "SiStripe",
//     companySize: ["unicorn", "large"],
//     primaryTechStack: ["ruby", "rails"],
//     languages: ["ruby"],
//     backendFrameworks: ["rails"],
//     databases: ["postgresql"],
//     security: ["jwt", "oauth"],
//     title: "Implement Idempotent API Requests",
//     question: "Design an API that handles duplicate requests safely for payment processing.",
//     answer: "Use idempotency keys in headers. Store request signatures in Redis with TTL. Check key before processing. Return cached response for duplicates. Handle race conditions with locks.",
//     topicTags: ["api-design", "idempotency", "payments", "distributed-systems", "concurrency"]
//   },
//   {
//     category: "database",
//     difficulty: "hard",
//     companyLogo: "SiAmazon",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["postgresql"],
//     databases: ["postgresql"],
//     title: "Optimize Slow Query Performance",
//     question: "A query joining 3 tables with millions of rows is timing out. How do you fix it?",
//     answer: "Add indexes on join columns. Use EXPLAIN ANALYZE. Consider partitioning, materialized views, or denormalization. Optimize WHERE clauses. Check statistics are up to date.",
//     topicTags: ["sql", "performance", "indexing", "query-optimization", "database-tuning"]
//   },
//   {
//     category: "devops",
//     difficulty: "medium",
//     companyLogo: "SiNetflix",
//     companySize: ["faang", "large"],
//     primaryTechStack: ["kubernetes", "docker"],
//     containers: ["kubernetes", "docker"],
//     cloudProviders: ["aws"],
//     monitoring: ["prometheus", "grafana"],
//     cicd: ["github-actions"],
//     title: "Zero-Downtime Deployment Strategy",
//     question: "Explain how to deploy updates without service interruption.",
//     answer: "Use rolling updates in Kubernetes. Implement health checks and readiness probes. Blue-green or canary deployments. Monitor metrics during rollout. Have rollback plan ready.",
//     topicTags: ["kubernetes", "deployment", "ci-cd", "reliability", "devops"]
//   },
//   {
//     category: "security",
//     difficulty: "hard",
//     companyLogo: "SiOkta",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["nodejs", "jwt"],
//     languages: ["javascript"],
//     backendFrameworks: ["express"],
//     security: ["jwt", "oauth", "auth0"],
//     title: "Design Secure Authentication System",
//     question: "Build authentication with OAuth, JWT, and refresh tokens.",
//     answer: "Use OAuth for third-party. Issue short-lived access tokens (15min) and long-lived refresh tokens. Store refresh tokens securely (httpOnly cookies). Implement token rotation. Add rate limiting.",
//     topicTags: ["authentication", "security", "oauth", "jwt", "best-practices"]
//   },
//   {
//     category: "testing",
//     difficulty: "easy",
//     companyLogo: "SiGithub",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["typescript", "jest"],
//     languages: ["typescript"],
//     testing: ["jest", "testing-library"],
//     title: "Write Unit Tests for Async Function",
//     question: "Test a function that fetches user data from an API.",
//     answer: "Mock fetch with jest.fn(). Use async/await in tests. Test success case, error handling, loading states. Verify correct API calls. Use jest.mock() for modules.",
//     topicTags: ["testing", "jest", "unit-tests", "mocking", "async"]
//   },
//   {
//     category: "mobile",
//     difficulty: "medium",
//     companyLogo: "SiUber",
//     companySize: ["unicorn", "large"],
//     primaryTechStack: ["react-native"],
//     mobile: ["react-native"],
//     languages: ["typescript"],
//     title: "Handle Offline Mode in Mobile App",
//     question: "Design offline-first architecture for ride-sharing app.",
//     answer: "Use AsyncStorage for local data. Queue actions when offline. Sync on reconnection. Use optimistic updates. Handle conflicts with timestamps. Cache map tiles.",
//     topicTags: ["mobile", "offline-first", "react-native", "sync", "architecture"]
//   },
//   {
//     category: "data-structures",
//     difficulty: "medium",
//     companyLogo: "SiApple",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["swift"],
//     languages: ["swift"],
//     title: "Implement LRU Cache",
//     question: "Build a Least Recently Used cache with O(1) operations.",
//     answer: "Use HashMap + Doubly Linked List. HashMap for O(1) lookup. DLL for O(1) insertion/deletion. Move accessed items to front. Remove from tail when full.",
//     topicTags: ["data-structures", "cache", "linked-list", "hash-map", "algorithms"]
//   },
//   {
//     category: "cloud",
//     difficulty: "hard",
//     companyLogo: "SiMicrosoftazure",
//     companySize: ["enterprise", "large"],
//     primaryTechStack: ["terraform", "azure"],
//     cloudProviders: ["azure"],
//     iac: ["terraform"],
//     title: "Multi-Region Disaster Recovery",
//     question: "Design DR strategy with RPO < 1 hour, RTO < 4 hours.",
//     answer: "Use geo-replication for databases. Deploy in multiple regions with Traffic Manager. Automated backups every 15min. Regular DR drills. Terraform for infrastructure. Monitor replication lag.",
//     topicTags: ["disaster-recovery", "cloud", "high-availability", "infrastructure", "terraform"]
//   },
//   {
//     category: "performance",
//     difficulty: "medium",
//     companyLogo: "SiSpotify",
//     companySize: ["unicorn", "large"],
//     primaryTechStack: ["python", "fastapi"],
//     languages: ["python"],
//     backendFrameworks: ["fastapi"],
//     caching: ["redis"],
//     title: "Optimize API Response Time",
//     question: "API response time is 3s. Target is 200ms. How to optimize?",
//     answer: "Add Redis caching layer. Use database connection pooling. Implement pagination. Add indexes. Use async operations. Consider CDN for static assets. Profile with tools.",
//     topicTags: ["performance", "optimization", "caching", "profiling", "api"]
//   },
//   {
//     category: "scalability",
//     difficulty: "hard",
//     companyLogo: "SiTiktok",
//     companySize: ["unicorn", "enterprise"],
//     primaryTechStack: ["go", "kafka"],
//     languages: ["go"],
//     messageQueues: ["kafka"],
//     databases: ["cassandra"],
//     title: "Handle 1M Concurrent Video Uploads",
//     question: "Design system to process millions of video uploads simultaneously.",
//     answer: "Use object storage (S3). Queue uploads with Kafka. Process async with worker pools. Shard by user_id. Use CDN for delivery. Implement backpressure. Monitor queue depth.",
//     topicTags: ["scalability", "distributed-systems", "video-processing", "queues", "architecture"]
//   },
//   {
//     category: "api-design",
//     difficulty: "medium",
//     companyLogo: "SiTwilio",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["rest", "graphql"],
//     apiTypes: ["rest", "graphql"],
//     title: "Design RESTful vs GraphQL API",
//     question: "When would you choose REST over GraphQL and vice versa?",
//     answer: "REST: Simple CRUD, caching important, public APIs. GraphQL: Complex queries, mobile apps (reduce requests), rapid frontend iteration. Consider learning curve and tooling.",
//     topicTags: ["api-design", "rest", "graphql", "architecture", "trade-offs"]
//   },
//   {
//     category: "debugging",
//     difficulty: "easy",
//     companyLogo: "SiDatadog",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["javascript"],
//     languages: ["javascript"],
//     monitoring: ["datadog", "sentry"],
//     title: "Debug Memory Leak in Node.js",
//     question: "App memory usage grows over time. How do you identify the leak?",
//     answer: "Use heap snapshots. Compare snapshots over time. Look for growing arrays/objects. Use Chrome DevTools. Check for event listener leaks. Profile with --inspect flag.",
//     topicTags: ["debugging", "memory-leak", "nodejs", "performance", "profiling"]
//   },
//   {
//     category: "behavioral",
//     difficulty: "medium",
//     companyLogo: "SiMicrosoft",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: [],
//     title: "Conflict Resolution with Team Member",
//     question: "Tell me about a time you disagreed with a teammate on technical approach.",
//     answer: "Use STAR format. Explain situation, your perspective, their perspective. How you found common ground. Data-driven decision. Emphasize collaboration and outcome.",
//     topicTags: ["behavioral", "teamwork", "communication", "conflict-resolution", "leadership"]
//   },
//   {
//     category: "architecture",
//     difficulty: "hard",
//     companyLogo: "SiOracle",
//     companySize: ["enterprise", "large"],
//     primaryTechStack: ["microservices"],
//     backendFrameworks: ["spring-boot"],
//     messageQueues: ["rabbitmq"],
//     title: "Monolith to Microservices Migration",
//     question: "How would you break down a monolithic application into microservices?",
//     answer: "Start with bounded contexts. Use strangler pattern. Extract services gradually. Implement API gateway. Use message queues for async. Maintain data consistency. Monitor extensively.",
//     topicTags: ["architecture", "microservices", "migration", "design-patterns", "distributed-systems"]
//   },
//   {
//     category: "ml-ai",
//     difficulty: "hard",
//     companyLogo: "SiOpenai",
//     companySize: ["startup", "unicorn"],
//     primaryTechStack: ["python", "pytorch"],
//     languages: ["python"],
//     mlFrameworks: ["pytorch", "huggingface"],
//     llmProviders: ["openai"],
//     title: "Fine-tune LLM for Domain Task",
//     question: "How to fine-tune GPT for customer support?",
//     answer: "Collect quality training data. Use LoRA for efficient fine-tuning. Validate on holdout set. Monitor for hallucinations. Implement safety filters. A/B test against base model.",
//     topicTags: ["llm", "fine-tuning", "machine-learning", "nlp", "pytorch"]
//   },
//   {
//     category: "code-review",
//     difficulty: "medium",
//     companyLogo: "SiGitlab",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["ruby"],
//     languages: ["ruby"],
//     title: "Best Practices for Code Reviews",
//     question: "What do you look for in code reviews?",
//     answer: "Check correctness, readability, tests. Look for edge cases, security issues. Ensure consistent style. Verify documentation. Be constructive. Focus on learnings, not blame.",
//     topicTags: ["code-review", "best-practices", "collaboration", "quality", "communication"]
//   },
//   {
//     category: "leadership",
//     difficulty: "hard",
//     companyLogo: "SiTesla",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: [],
//     title: "Leading Technical Project Under Pressure",
//     question: "Describe leading a project with tight deadline and technical challenges.",
//     answer: "Prioritize ruthlessly. Break into MVPs. Delegate effectively. Unblock team daily. Communicate risks early. Make trade-off decisions. Celebrate wins. Retrospect learnings.",
//     topicTags: ["leadership", "project-management", "prioritization", "communication", "team-building"]
//   },
//   {
//     category: "communication",
//     difficulty: "medium",
//     companyLogo: "SiSlack",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: [],
//     title: "Explain Complex Technical Concept",
//     question: "Explain how databases work to a non-technical person.",
//     answer: "Use analogies (library with card catalog). Avoid jargon. Check understanding. Use visuals. Start simple, add complexity. Relate to their experience. Be patient.",
//     topicTags: ["communication", "teaching", "simplification", "collaboration", "soft-skills"]
//   },
//   {
//     category: "problem-solving",
//     difficulty: "medium",
//     companyLogo: "SiShopify",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["rails", "ruby"],
//     languages: ["ruby"],
//     backendFrameworks: ["rails"],
//     title: "Production Issue Resolution",
//     question: "Walk through how you'd handle a critical production outage.",
//     answer: "Assess impact. Communicate to stakeholders. Check monitoring/logs. Form hypothesis. Test fixes in staging. Deploy fix. Verify resolution. Write postmortem. Implement preventive measures.",
//     topicTags: ["problem-solving", "incident-response", "debugging", "communication", "operations"]
//   },
//   {
//     category: "frontend",
//     difficulty: "easy",
//     companyLogo: "SiVercel",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["next", "react"],
//     frontendFrameworks: ["next"],
//     languages: ["typescript"],
//     title: "Server-Side Rendering vs Client-Side",
//     question: "When to use SSR vs CSR in Next.js?",
//     answer: "SSR: SEO critical, initial load speed, dynamic data per request. CSR: Highly interactive apps, authenticated content, frequent updates. Consider ISR for best of both.",
//     topicTags: ["nextjs", "ssr", "performance", "seo", "react"]
//   },
//   {
//     category: "database",
//     difficulty: "medium",
//     companyLogo: "SiMongodb",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["mongodb"],
//     databases: ["mongodb"],
//     title: "Schema Design for MongoDB",
//     question: "Design schema for e-commerce products with variants and inventory.",
//     answer: "Embed variants in product doc if < 100. Reference inventory separately. Index on SKU, category. Use aggregation for queries. Consider sharding by category for scale.",
//     topicTags: ["mongodb", "nosql", "schema-design", "database", "performance"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiAmazon",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Find Kth Largest Element",
//     question: "Find kth largest element in unsorted array efficiently.",
//     answer: "Use QuickSelect algorithm. Average O(n), worst O(n²). Or use min-heap of size k: O(n log k). Trade-offs: QuickSelect faster average, heap more predictable.",
//     topicTags: ["algorithms", "sorting", "heap", "quickselect", "optimization"]
//   },
//   {
//     category: "security",
//     difficulty: "medium",
//     companyLogo: "SiCloudflare",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["nodejs"],
//     languages: ["javascript"],
//     security: ["oauth", "jwt"],
//     title: "Prevent SQL Injection",
//     question: "How do you protect against SQL injection attacks?",
//     answer: "Use parameterized queries/prepared statements. Never concatenate user input. Use ORM safely. Input validation. Least privilege DB accounts. Regular security audits.",
//     topicTags: ["security", "sql-injection", "best-practices", "vulnerabilities", "backend"]
//   },
//   {
//     category: "cloud",
//     difficulty: "medium",
//     companyLogo: "SiAmazonaws",
//     companySize: ["enterprise", "large"],
//     primaryTechStack: ["aws", "lambda"],
//     cloudProviders: ["aws"],
//     title: "Serverless vs Traditional Architecture",
//     question: "When to use Lambda vs EC2?",
//     answer: "Lambda: Sporadic traffic, event-driven, microservices, quick scaling. EC2: Sustained load, long processes, custom runtime, cost optimization. Consider cold starts.",
//     topicTags: ["serverless", "aws", "lambda", "architecture", "cost-optimization"]
//   },
//   {
//     category: "testing",
//     difficulty: "medium",
//     companyLogo: "SiCypress",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["cypress"],
//     testing: ["cypress"],
//     languages: ["javascript"],
//     title: "E2E Testing Strategy",
//     question: "Design end-to-end testing approach for web app.",
//     answer: "Test critical user journeys. Use page object pattern. Mock external APIs. Run in CI/CD. Parallel execution. Monitor flakiness. Balance coverage vs speed.",
//     topicTags: ["e2e-testing", "cypress", "testing-strategy", "automation", "ci-cd"]
//   },
//   {
//     category: "performance",
//     difficulty: "hard",
//     companyLogo: "SiNetflix",
//     companySize: ["faang", "large"],
//     primaryTechStack: ["react"],
//     frontendFrameworks: ["react"],
//     title: "Optimize React App Performance",
//     question: "App is slow with large lists. How to improve?",
//     answer: "Use React.memo for expensive components. Implement virtualization (react-window). Code splitting with lazy(). Optimize re-renders with useMemo/useCallback. Profile with React DevTools.",
//     topicTags: ["react", "performance", "optimization", "virtualization", "profiling"]
//   },
//   {
//     category: "devops",
//     difficulty: "hard",
//     companyLogo: "SiDocker",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["docker", "kubernetes"],
//     containers: ["docker", "kubernetes"],
//     title: "Container Security Best Practices",
//     question: "How to secure Docker containers in production?",
//     answer: "Use minimal base images. Scan for vulnerabilities (Trivy). Run as non-root user. Use secrets management. Limit resources. Regular updates. Network policies in K8s.",
//     topicTags: ["docker", "security", "containers", "best-practices", "devops"]
//   },
//   {
//     category: "backend",
//     difficulty: "easy",
//     companyLogo: "SiExpress",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["express", "nodejs"],
//     backendFrameworks: ["express"],
//     languages: ["javascript"],
//     title: "Error Handling in Express",
//     question: "Implement centralized error handling middleware.",
//     answer: "Create error middleware with 4 params (err, req, res, next). Use try-catch in async routes. Create custom error classes. Log errors. Return appropriate status codes. Don't leak stack traces.",
//     topicTags: ["express", "error-handling", "middleware", "backend", "nodejs"]
//   },
//   {
//     category: "mobile",
//     difficulty: "hard",
//     companyLogo: "SiFlutter",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["flutter", "dart"],
//     mobile: ["flutter"],
//     languages: ["dart"],
//     title: "State Management in Flutter",
//     question: "Compare Provider, Riverpod, and BLoC for state management.",
//     answer: "Provider: Simple, good for small apps. Riverpod: Type-safe, testable, compile-time. BLoC: Complex, reactive, scalable. Choose based on app size and team expertise.",
//     topicTags: ["flutter", "state-management", "mobile", "architecture", "dart"]
//   },
//   {
//     category: "api-design",
//     difficulty: "medium",
//     companyLogo: "SiPostman",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["rest"],
//     apiTypes: ["rest"],
//     title: "API Versioning Strategies",
//     question: "How to version APIs without breaking clients?",
//     answer: "URI versioning (/v1/users), header versioning, or query params. Maintain backward compatibility. Deprecation warnings. Clear documentation. Sunset old versions gracefully.",
//     topicTags: ["api-design", "versioning", "rest", "backward-compatibility", "best-practices"]
//   },
//   {
//     category: "scalability",
//     difficulty: "medium",
//     companyLogo: "SiRedis",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["redis"],
//     caching: ["redis"],
//     databases: ["redis"],
//     title: "Redis as Cache vs Database",
//     question: "When to use Redis for caching vs primary data store?",
//     answer: "Cache: Temporary data, high read load, TTL needed. Database: Persistent data, simple data structures, pub/sub. Consider durability requirements and data size.",
//     topicTags: ["redis", "caching", "architecture", "data-storage", "performance"]
//   },
//   {
//     category: "data-structures",
//     difficulty: "medium",
//     companyLogo: "SiGoogle",
//     companySize: ["faang", "large"],
//     primaryTechStack: ["cpp"],
//     languages: ["cpp"],
//     title: "Implement Trie for Autocomplete",
//     question: "Build trie data structure for word suggestions.",
//     answer: "Each node has children map. Insert: O(m) where m = word length. Search: O(m). DFS for suggestions. Store frequency for ranking. Optimize memory with compressed tries.",
//     topicTags: ["trie", "data-structures", "autocomplete", "algorithms", "trees"]
//   },
//   {
//     category: "frontend",
//     difficulty: "medium",
//     companyLogo: "SiVue",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["vue"],
//     frontendFrameworks: ["vue"],
//     languages: ["javascript"],
//     title: "Vuex vs Pinia State Management",
//     question: "When to use Vuex vs Pinia in Vue 3?",
//     answer: "Pinia: Simpler API, TypeScript support, better DevTools, Vue 3 recommended. Vuex: Legacy projects, familiar to team. Pinia is Vue 3 default now.",
//     topicTags: ["vue", "state-management", "pinia", "vuex", "frontend"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "medium",
//     companyLogo: "SiMeta",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Binary Search Variants",
//     question: "Find first occurrence of element in sorted array with duplicates.",
//     answer: "Modified binary search. When found, continue searching left half. Track first occurrence. Time: O(log n). Handle edge cases: empty array, not found.",
//     topicTags: ["binary-search", "algorithms", "arrays", "searching", "optimization"]
//   },
//   {
//     category: "database",
//     difficulty: "hard",
//     companyLogo: "SiCockroachdb",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["cockroachdb"],
//     databases: ["cockroachdb"],
//     title: "Distributed SQL Transactions",
//     question: "How does CockroachDB handle transactions across nodes?",
//     answer: "Uses Raft consensus. Serializable isolation. Distributed transactions with 2PC. Automatic rebalancing. Consider latency of distributed commits. Use follower reads for performance.",
//     topicTags: ["distributed-systems", "database", "transactions", "consistency", "cockroachdb"]
//   },
//   {
//     category: "ml-ai",
//     difficulty: "medium",
//     companyLogo: "SiTensorflow",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["python", "tensorflow"],
//     languages: ["python"],
//     mlFrameworks: ["tensorflow"],
//     title: "Prevent Model Overfitting",
//     question: "What techniques prevent overfitting in neural networks?",
//     answer: "Use dropout, L2 regularization, early stopping. Data augmentation. Cross-validation. Simpler architecture. More training data. Monitor train vs validation loss.",
//     topicTags: ["machine-learning", "overfitting", "neural-networks", "tensorflow", "model-training"]
//   },
//   {
//     category: "security",
//     difficulty: "hard",
//     companyLogo: "SiVault",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["vault"],
//     security: ["vault"],
//     title: "Secrets Management Architecture",
//     question: "Design secrets management system for microservices.",
//     answer: "Use Vault for centralized secrets. Dynamic secrets with TTL. Rotate regularly. Audit all access. Encrypt in transit and at rest. Service authentication with AppRole.",
//     topicTags: ["secrets-management", "security", "vault", "microservices", "encryption"]
//   },
//   {
//     category: "cloud",
//     difficulty: "medium",
//     companyLogo: "SiGooglecloud",
//     companySize: ["enterprise", "large"],
//     primaryTechStack: ["gcp"],
//     cloudProviders: ["gcp"],
//     title: "GCP vs AWS Service Comparison",
//     question: "Compare GCP and AWS for startup deployment.",
//     answer: "AWS: More services, mature, complex pricing. GCP: Better AI/ML tools, simpler pricing, BigQuery. Consider team expertise, specific needs, multi-cloud strategy.",
//     topicTags: ["cloud", "gcp", "aws", "comparison", "architecture"]
//   },
//   {
//     category: "devops",
//     difficulty: "medium",
//     companyLogo: "SiJenkins",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["jenkins"],
//     cicd: ["jenkins"],
//     title: "CI/CD Pipeline Best Practices",
//     question: "Design CI/CD pipeline for Node.js app.",
//     answer: "Build: lint, test, security scan. Automated tests at each stage. Deploy to staging first. Use blue-green deployment. Rollback strategy. Monitor after deploy.",
//     topicTags: ["ci-cd", "jenkins", "devops", "automation", "deployment"]
//   },
//   {
//     category: "performance",
//     difficulty: "medium",
//     companyLogo: "SiNginx",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["nginx"],
//     webServers: ["nginx"],
//     title: "Nginx Load Balancing Configuration",
//     question: "Configure Nginx for optimal load balancing.",
//     answer: "Use upstream blocks. Round-robin, least_conn, or ip_hash. Health checks. Timeouts. Connection pooling. SSL termination at load balancer. Monitor backend health.",
//     topicTags: ["nginx", "load-balancing", "performance", "scalability", "web-servers"]
//   },
//   {
//     category: "frontend",
//     difficulty: "hard",
//     companyLogo: "SiAngular",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["angular", "typescript"],
//     frontendFrameworks: ["angular"],
//     languages: ["typescript"],
//     title: "Angular Change Detection Optimization",
//     question: "App has performance issues with change detection. Fix it.",
//     answer: "Use OnPush strategy. Immutable data patterns. Detach change detector for complex components. Use pure pipes. Profile with Angular DevTools. Avoid function calls in templates.",
//     topicTags: ["angular", "performance", "change-detection", "optimization", "frontend"]
//   },
//   {
//     category: "testing",
//     difficulty: "easy",
//     companyLogo: "SiPlaywright",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["playwright"],
//     testing: ["playwright"],
//     title: "Playwright vs Selenium",
//     question: "Compare Playwright and Selenium for E2E testing.",
//     answer: "Playwright: Modern, fast, auto-wait, better debugging. Selenium: More mature, wider browser support, larger community. Playwright recommended for new projects.",
//     topicTags: ["testing", "playwright", "selenium", "e2e", "automation"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiGraphql",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["graphql"],
//     apiTypes: ["graphql"],
//     title: "GraphQL N+1 Problem Solution",
//     question: "Resolve N+1 query problem in GraphQL.",
//     answer: "Use DataLoader for batching. Implement query depth limiting. Cache results. Use look-ahead for optimization. Monitor query complexity. Consider persisted queries.",
//     topicTags: ["graphql", "performance", "optimization", "n+1-problem", "api-design"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiApple",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["swift"],
//     languages: ["swift"],
//     title: "Dynamic Programming - Coin Change",
//     question: "Find minimum coins needed to make amount with given denominations.",
//     answer: "Use DP array where dp[i] = min coins for amount i. For each amount, try each coin. dp[i] = min(dp[i], dp[i-coin] + 1). Time: O(amount * coins). Space: O(amount).",
//     topicTags: ["dynamic-programming", "algorithms", "optimization", "recursion", "memoization"]
//   },
//   {
//     category: "mobile",
//     difficulty: "medium",
//     companyLogo: "SiAndroid",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["kotlin"],
//     languages: ["kotlin"],
//     mobile: ["kotlin"],
//     title: "Android Jetpack Compose vs XML",
//     question: "When to use Compose vs traditional XML layouts?",
//     answer: "Compose: Modern, declarative, less boilerplate, easier animations. XML: Legacy support, design tools, team familiarity. New projects should use Compose.",
//     topicTags: ["android", "jetpack-compose", "mobile", "kotlin", "ui-development"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiTwitter",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["scala", "kafka"],
//     languages: ["scala"],
//     messageQueues: ["kafka"],
//     databases: ["cassandra", "redis"],
//     title: "Design Twitter Timeline",
//     question: "Design system for Twitter's home timeline at scale.",
//     answer: "Fan-out on write for regular users, fan-out on read for celebrities. Redis for timeline cache. Cassandra for tweets. Kafka for real-time events. CDN for media. Load shedding for spikes.",
//     topicTags: ["system-design", "distributed-systems", "scalability", "social-media", "real-time"]
//   },
//   {
//     category: "database",
//     difficulty: "medium",
//     companyLogo: "SiElasticsearch",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["elasticsearch"],
//     searchEngines: ["elasticsearch"],
//     title: "Elasticsearch Indexing Strategy",
//     question: "Design indexing for log search with 10TB daily data.",
//     answer: "Time-based indices (daily/weekly). Use ILM for lifecycle. Hot-warm-cold architecture. Optimize mappings. Set appropriate shards. Use rollover API. Curator for cleanup.",
//     topicTags: ["elasticsearch", "indexing", "search", "logs", "performance"]
//   },
//   {
//     category: "security",
//     difficulty: "medium",
//     companyLogo: "SiSnyk",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["nodejs"],
//     security: ["snyk"],
//     title: "Dependency Vulnerability Management",
//     question: "How to handle vulnerable dependencies in production?",
//     answer: "Use Snyk/Dependabot. Automated scanning in CI/CD. Prioritize by severity. Test updates in staging. Keep dependencies current. Security advisories subscription. Have patching SLA.",
//     topicTags: ["security", "dependencies", "vulnerabilities", "devops", "best-practices"]
//   },
//   {
//     category: "frontend",
//     difficulty: "easy",
//     companyLogo: "SiSvelte",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["svelte"],
//     frontendFrameworks: ["svelte"],
//     title: "Svelte Reactivity System",
//     question: "How does Svelte's reactivity differ from React?",
//     answer: "Svelte compiles to vanilla JS, no virtual DOM. Assignments trigger updates. Less boilerplate. Smaller bundles. Better performance. No useEffect/useState needed.",
//     topicTags: ["svelte", "reactivity", "frontend", "performance", "compilation"]
//   },
//   {
//     category: "devops",
//     difficulty: "hard",
//     companyLogo: "SiArgo",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["kubernetes"],
//     cicd: ["argo-cd"],
//     containers: ["kubernetes"],
//     title: "GitOps with ArgoCD",
//     question: "Implement GitOps workflow for Kubernetes deployments.",
//     answer: "Git as single source of truth. ArgoCD monitors repo. Auto-sync on changes. Use app-of-apps pattern. Environment promotion via branches. Rollback via Git revert.",
//     topicTags: ["gitops", "argocd", "kubernetes", "ci-cd", "automation"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "medium",
//     companyLogo: "SiLinkedin",
//     companySize: ["large", "faang"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Merge K Sorted Lists",
//     question: "Merge k sorted linked lists efficiently.",
//     answer: "Use min-heap of size k. Add first node from each list. Pop min, add result. Push next node from same list. Time: O(n log k), Space: O(k).",
//     topicTags: ["algorithms", "heap", "linked-lists", "merging", "optimization"]
//   },
//   {
//     category: "backend",
//     difficulty: "medium",
//     companyLogo: "SiDjango",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["django", "python"],
//     backendFrameworks: ["django"],
//     languages: ["python"],
//     orms: ["django-orm"],
//     title: "Django ORM Query Optimization",
//     question: "Optimize Django queries causing N+1 problems.",
//     answer: "Use select_related for FK. Use prefetch_related for M2M. Use only() for specific fields. Add db_index. Use iterator() for large querysets. Check query count.",
//     topicTags: ["django", "orm", "optimization", "performance", "database"]
//   },
//   {
//     category: "cloud",
//     difficulty: "medium",
//     companyLogo: "SiHeroku",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["heroku"],
//     cloudProviders: ["heroku"],
//     title: "When to Use Heroku vs AWS",
//     question: "Compare Heroku and AWS for deployment.",
//     answer: "Heroku: Fast setup, managed, higher cost, good for MVPs. AWS: More control, cheaper at scale, steeper learning curve. Start Heroku, migrate to AWS when needed.",
//     topicTags: ["cloud", "heroku", "aws", "deployment", "cost-optimization"]
//   },
//   {
//     category: "testing",
//     difficulty: "medium",
//     companyLogo: "SiJest",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["jest"],
//     testing: ["jest"],
//     languages: ["javascript"],
//     title: "Testing Async Code with Jest",
//     question: "Best practices for testing async functions.",
//     answer: "Use async/await in tests. Use done callback for callbacks. Mock timers with jest.useFakeTimers(). Test error cases. Use waitFor for async updates. Clear mocks between tests.",
//     topicTags: ["jest", "testing", "async", "javascript", "best-practices"]
//   },
//   {
//     category: "ml-ai",
//     difficulty: "hard",
//     companyLogo: "SiAnthropic",
//     companySize: ["startup", "unicorn"],
//     primaryTechStack: ["python", "langchain"],
//     languages: ["python"],
//     mlFrameworks: ["langchain"],
//     llmProviders: ["anthropic"],
//     title: "Build AI Agent with Tool Use",
//     question: "Create AI agent that uses external tools.",
//     answer: "Define tools with clear schemas. Use function calling API. Implement retry logic. Validate tool outputs. Chain tools when needed. Handle errors gracefully. Log all actions.",
//     topicTags: ["ai-agents", "llm", "langchain", "function-calling", "automation"]
//   },
//   {
//     category: "performance",
//     difficulty: "hard",
//     companyLogo: "SiCdn",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["cloudflare"],
//     cloudProviders: ["cloudflare"],
//     caching: ["cloudflare-cache", "cdn"],
//     title: "Global CDN Strategy",
//     question: "Design CDN architecture for global app.",
//     answer: "Edge caching with Cloudflare. Cache-Control headers. Purge strategy. Regional origins. Dynamic content acceleration. Image optimization. DDoS protection.",
//     topicTags: ["cdn", "performance", "caching", "global-infrastructure", "optimization"]
//   },
//   {
//     category: "data-structures",
//     difficulty: "hard",
//     companyLogo: "SiMicrosoft",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["csharp"],
//     languages: ["csharp"],
//     title: "Design LFU Cache",
//     question: "Implement Least Frequently Used cache.",
//     answer: "Use HashMap + frequency buckets (doubly linked lists). Track min frequency. O(1) get, put, eviction. Update frequency on access. Handle ties with recency.",
//     topicTags: ["data-structures", "cache", "algorithms", "design", "optimization"]
//   },
//   {
//     category: "backend",
//     difficulty: "medium",
//     companyLogo: "SiLaravel",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["laravel", "php"],
//     backendFrameworks: ["laravel"],
//     languages: ["php"],
//     title: "Laravel Queue Performance",
//     question: "Optimize Laravel queue processing for high throughput.",
//     answer: "Use Redis/SQS for queue. Multiple workers. Use horizon for monitoring. Batch jobs. Timeout handling. Failed job handling. Scale workers with load.",
//     topicTags: ["laravel", "queues", "performance", "php", "scalability"]
//   },
//   {
//     category: "mobile",
//     difficulty: "medium",
//     companyLogo: "SiIonic",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["ionic"],
//     mobile: ["ionic"],
//     languages: ["typescript"],
//     title: "Hybrid vs Native Mobile Apps",
//     question: "When to choose Ionic vs native development?",
//     answer: "Ionic: Cross-platform, web skills, faster development, good for MVPs. Native: Better performance, full API access, better UX. Consider team, timeline, requirements.",
//     topicTags: ["mobile", "hybrid-apps", "ionic", "architecture", "trade-offs"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiZoom",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["webrtc"],
//     protocol: ["webrtc", "websockets"],
//     title: "Design Video Conferencing System",
//     question: "Build scalable video conferencing like Zoom.",
//     answer: "WebRTC for peer connections. SFU for routing. TURN servers for NAT. Adaptive bitrate. Recording to cloud storage. Chat with WebSockets. Load balancing by region.",
//     topicTags: ["system-design", "webrtc", "video", "real-time", "scalability"]
//   },
//   {
//     category: "security",
//     difficulty: "hard",
//     companyLogo: "SiAuth0",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["oauth"],
//     security: ["oauth", "auth0"],
//     title: "Implement OAuth 2.0 Flow",
//     question: "Explain and implement OAuth 2.0 authorization code flow.",
//     answer: "User redirects to auth server. User approves. Auth code returned. Exchange code for token. Use PKCE for mobile. Refresh token rotation. Store tokens securely.",
//     topicTags: ["oauth", "authentication", "security", "authorization", "protocols"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "easy",
//     companyLogo: "SiDropbox",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Valid Parentheses",
//     question: "Check if string has valid balanced parentheses.",
//     answer: "Use stack. Push opening brackets. Pop and match closing brackets. Stack should be empty at end. O(n) time, O(n) space.",
//     topicTags: ["stack", "algorithms", "strings", "validation", "data-structures"]
//   },
//   {
//     category: "database",
//     difficulty: "hard",
//     companyLogo: "SiPinecone",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["pinecone"],
//     vectorDBs: ["pinecone"],
//     title: "Vector Database for Similarity Search",
//     question: "When to use vector database vs traditional database?",
//     answer: "Vector DB: Semantic search, recommendations, RAG, image similarity. Traditional: Exact matches, structured data. Use hybrid approach for best results.",
//     topicTags: ["vector-database", "similarity-search", "embeddings", "ai", "database"]
//   },
//   {
//     category: "frontend",
//     difficulty: "medium",
//     companyLogo: "SiTailwindcss",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["tailwind"],
//     cssFrameworks: ["tailwind"],
//     title: "Tailwind CSS Best Practices",
//     question: "Optimize Tailwind CSS for production.",
//     answer: "Enable JIT mode. Purge unused styles. Use @apply sparingly. Create component classes. Configure theme. Use plugins. Minimize bundle size.",
//     topicTags: ["tailwind", "css", "optimization", "frontend", "performance"]
//   },
//   {
//     category: "devops",
//     difficulty: "medium",
//     companyLogo: "SiAnsible",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["ansible"],
//     iac: ["ansible"],
//     title: "Infrastructure as Code with Ansible",
//     question: "Design Ansible playbooks for infrastructure management.",
//     answer: "Use roles for reusability. Variables in separate files. Idempotent tasks. Use handlers for services. Vault for secrets. Test with molecule. Version control playbooks.",
//     topicTags: ["ansible", "iac", "automation", "devops", "configuration-management"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiGo",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["go"],
//     languages: ["go"],
//     backendFrameworks: ["gin"],
//     title: "Goroutines and Channels",
//     question: "Implement worker pool pattern in Go.",
//     answer: "Create channel for jobs. Spawn N workers as goroutines. Workers read from channel. Use WaitGroup for completion. Buffered channel for backpressure. Close channel when done.",
//     topicTags: ["golang", "concurrency", "goroutines", "channels", "patterns"]
//   },
//   {
//     category: "ml-ai",
//     difficulty: "medium",
//     companyLogo: "SiScikit",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["python", "scikit-learn"],
//     languages: ["python"],
//     mlFrameworks: ["scikit-learn"],
//     title: "Feature Engineering for ML",
//     question: "Best practices for preparing features for ML models.",
//     answer: "Handle missing values. Scale numerical features. Encode categorical. Create interaction features. Remove correlations. Feature selection. Cross-validation throughout.",
//     topicTags: ["machine-learning", "feature-engineering", "data-preprocessing", "scikit-learn", "ml-pipeline"]
//   },
//   {
//     category: "testing",
//     difficulty: "easy",
//     companyLogo: "SiMocha",
//     companySize: ["medium", "large"],
//     primaryTechStack: ["mocha"],
//     testing: ["mocha"],
//     languages: ["javascript"],
//     title: "BDD Testing with Mocha",
//     question: "Write behavior-driven tests with Mocha.",
//     answer: "Use describe/it blocks. Clear test names. Arrange-Act-Assert pattern. Use chai for assertions. Before/after hooks. Test one thing per test.",
//     topicTags: ["mocha", "bdd", "testing", "javascript", "best-practices"]
//   },
//   {
//     category: "cloud",
//     difficulty: "hard",
//     companyLogo: "SiTerraform",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["terraform"],
//     iac: ["terraform"],
//     cloudProviders: ["aws", "gcp", "azure"],
//     title: "Multi-Cloud Terraform Strategy",
//     question: "Manage infrastructure across AWS, GCP, Azure with Terraform.",
//     answer: "Separate providers per cloud. Shared modules. Remote state in S3/GCS. Workspaces per environment. Use locals for common config. Test with terratest.",
//     topicTags: ["terraform", "multi-cloud", "iac", "devops", "infrastructure"]
//   },
//   {
//     category: "performance",
//     difficulty: "medium",
//     companyLogo: "SiWebpack",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["webpack"],
//     languages: ["javascript"],
//     title: "Webpack Bundle Optimization",
//     question: "Reduce webpack bundle size for faster loads.",
//     answer: "Code splitting with dynamic imports. Tree shaking. Minification. Analyze with bundle analyzer. Use CDN for vendors. Lazy load routes. Cache chunks.",
//     topicTags: ["webpack", "optimization", "bundling", "performance", "frontend"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "medium",
//     companyLogo: "SiPaypal",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Detect Cycle in Linked List",
//     question: "Detect if linked list has a cycle.",
//     answer: "Floyd's cycle detection (two pointers). Slow moves 1, fast moves 2. If they meet, cycle exists. O(n) time, O(1) space. Find cycle start if needed.",
//     topicTags: ["linked-list", "algorithms", "two-pointers", "cycle-detection", "optimization"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiAirbnb",
//     companySize: ["unicorn", "large"],
//     primaryTechStack: ["react", "rails"],
//     frontendFrameworks: ["react"],
//     backendFrameworks: ["rails"],
//     databases: ["postgresql", "elasticsearch"],
//     title: "Design Airbnb Search System",
//     question: "Build search system for properties with filters.",
//     answer: "Elasticsearch for full-text search. Postgres for ACID. Cache popular searches in Redis. Geospatial indexing. Faceted search. Ranking algorithm. Pagination.",
//     topicTags: ["system-design", "search", "elasticsearch", "scalability", "geospatial"]
//   },
//   {
//     category: "security",
//     difficulty: "medium",
//     companyLogo: "SiOwasp",
//     companySize: ["enterprise", "large"],
//     primaryTechStack: ["nodejs"],
//     security: ["owasp-zap"],
//     title: "OWASP Top 10 Prevention",
//     question: "How to prevent OWASP Top 10 vulnerabilities?",
//     answer: "Input validation, parameterized queries, authentication, encryption, logging, dependency updates, rate limiting, CORS, CSP headers, security headers.",
//     topicTags: ["security", "owasp", "vulnerabilities", "best-practices", "web-security"]
//   },
//   {
//     category: "mobile",
//     difficulty: "hard",
//     companyLogo: "SiApple",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["swift"],
//     languages: ["swift"],
//     mobile: ["swift"],
//     title: "iOS App Architecture Patterns",
//     question: "Compare MVC, MVVM, VIPER for iOS.",
//     answer: "MVC: Simple, Apple default, tight coupling. MVVM: Better testability, SwiftUI default. VIPER: Enterprise scale, complex. Choose based on app complexity.",
//     topicTags: ["ios", "architecture", "patterns", "swift", "mobile"]
//   },
//   {
//     category: "database",
//     difficulty: "medium",
//     companyLogo: "SiFirebase",
//     companySize: ["large", "enterprise"],
//     primaryTechStack: ["firebase-firestore"],
//     databases: ["firebase-firestore"],
//     title: "Firestore Data Modeling",
//     question: "Design Firestore schema for social media app.",
//     answer: "Denormalize for reads. Use subcollections. Avoid deep nesting. Index frequently queried fields. Use batch writes. Consider document size limits.",
//     topicTags: ["firestore", "nosql", "data-modeling", "firebase", "database"]
//   },
//   {
//     category: "backend",
//     difficulty: "medium",
//     companyLogo: "SiRust",
//     companySize: ["startup", "medium"],
//     primaryTechStack: ["rust", "actix"],
//     languages: ["rust"],
//     backendFrameworks: ["actix"],
//     title: "Rust for High-Performance APIs",
//     question: "When to use Rust for backend services?",
//     answer: "Use when: Performance critical, memory safety important, low latency needed. Trade-off: Steeper learning curve. Great for: API gateways, microservices, data processing.",
//     topicTags: ["rust", "performance", "backend", "systems-programming", "actix"]
//   }
// ,
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiGoogle",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Serialize and Deserialize Binary Tree",
//     question: `Design an algorithm to serialize and deserialize a binary tree. Serialization converts the tree to a string, deserialization converts the string back to the original tree structure.

// Example:
//     1
//    / \\
//   2   3
//      / \\
//     4   5

// serialize(root) → "1,2,null,null,3,4,null,null,5,null,null"
// deserialize(data) → original tree

// Write both functions with optimal time/space complexity.`,
//     answer: `\`\`\`python
// class TreeNode:
//     def __init__(self, val=0, left=None, right=None):
//         self.val = val
//         self.left = left
//         self.right = right

// def serialize(root):
//     """Preorder traversal with null markers"""
//     if not root:
//         return "null"
    
//     left = serialize(root.left)
//     right = serialize(root.right)
//     return f"{root.val},{left},{right}"

// def deserialize(data):
//     """Reconstruct tree from preorder string"""
//     def build():
//         val = next(vals)
//         if val == "null":
//             return None
        
//         node = TreeNode(int(val))
//         node.left = build()
//         node.right = build()
//         return node
    
//     vals = iter(data.split(','))
//     return build()
// \`\`\`

// Time: O(n) for both, Space: O(n)`,
//     topicTags: ["binary-tree", "recursion", "serialization", "dfs", "string-manipulation"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiAmazon",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Median of Two Sorted Arrays",
//     question: `Given two sorted arrays nums1 and nums2, find the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).

// Example:
// nums1 = [1, 3], nums2 = [2]
// Output: 2.0

// nums1 = [1, 2], nums2 = [3, 4]
// Output: 2.5`,
//     answer: `\`\`\`java
// public double findMedianSortedArrays(int[] nums1, int[] nums2) {
//     if (nums1.length > nums2.length) {
//         return findMedianSortedArrays(nums2, nums1);
//     }
    
//     int m = nums1.length, n = nums2.length;
//     int left = 0, right = m;
    
//     while (left <= right) {
//         int partition1 = (left + right) / 2;
//         int partition2 = (m + n + 1) / 2 - partition1;
        
//         int maxLeft1 = (partition1 == 0) ? Integer.MIN_VALUE : nums1[partition1 - 1];
//         int minRight1 = (partition1 == m) ? Integer.MAX_VALUE : nums1[partition1];
        
//         int maxLeft2 = (partition2 == 0) ? Integer.MIN_VALUE : nums2[partition2 - 1];
//         int minRight2 = (partition2 == n) ? Integer.MAX_VALUE : nums2[partition2];
        
//         if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
//             if ((m + n) % 2 == 0) {
//                 return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2.0;
//             }
//             return Math.max(maxLeft1, maxLeft2);
//         } else if (maxLeft1 > minRight2) {
//             right = partition1 - 1;
//         } else {
//             left = partition1 + 1;
//         }
//     }
//     throw new IllegalArgumentException();
// }
// \`\`\`

// Binary search on smaller array. Time: O(log(min(m,n))), Space: O(1)`,
//     topicTags: ["binary-search", "arrays", "divide-and-conquer", "median", "optimization"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiMeta",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["cpp"],
//     languages: ["cpp"],
//     title: "Longest Valid Parentheses",
//     question: `Given a string containing just '(' and ')', find the length of the longest valid (well-formed) parentheses substring.

// Example:
// Input: "(()"
// Output: 2 (The longest valid substring is "()")

// Input: ")()())"
// Output: 4 (The longest valid substring is "()()")

// Solve in O(n) time with O(1) space.`,
//     answer: `\`\`\`cpp
// int longestValidParentheses(string s) {
//     int maxLen = 0, left = 0, right = 0;
    
//     // Left to right scan
//     for (char c : s) {
//         if (c == '(') left++;
//         else right++;
        
//         if (left == right) {
//             maxLen = max(maxLen, 2 * right);
//         } else if (right > left) {
//             left = right = 0;
//         }
//     }
    
//     // Right to left scan
//     left = right = 0;
//     for (int i = s.length() - 1; i >= 0; i--) {
//         if (s[i] == '(') left++;
//         else right++;
        
//         if (left == right) {
//             maxLen = max(maxLen, 2 * left);
//         } else if (left > right) {
//             left = right = 0;
//         }
//     }
    
//     return maxLen;
// }
// \`\`\`

// Two passes handle different invalid cases. Time: O(n), Space: O(1)`,
//     topicTags: ["strings", "stack", "two-pointers", "greedy", "parentheses"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiApple",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["swift"],
//     languages: ["swift"],
//     title: "Trapping Rain Water",
//     question: `Given n non-negative integers representing an elevation map where width of each bar is 1, compute how much water can be trapped after raining.

// Example:
// height = [0,1,0,2,1,0,1,3,2,1,2,1]
// Output: 6

// Visualize the bars and calculate trapped water between them.`,
//     answer: `\`\`\`swift
// func trap(_ height: [Int]) -> Int {
//     guard height.count > 2 else { return 0 }
    
//     var left = 0, right = height.count - 1
//     var leftMax = 0, rightMax = 0
//     var water = 0
    
//     while left < right {
//         if height[left] < height[right] {
//             if height[left] >= leftMax {
//                 leftMax = height[left]
//             } else {
//                 water += leftMax - height[left]
//             }
//             left += 1
//         } else {
//             if height[right] >= rightMax {
//                 rightMax = height[right]
//             } else {
//                 water += rightMax - height[right]
//             }
//             right -= 1
//         }
//     }
    
//     return water
// }
// \`\`\`

// Two pointers approach. Time: O(n), Space: O(1)`,
//     topicTags: ["arrays", "two-pointers", "greedy", "stack", "dynamic-programming"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiMicrosoft",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["csharp"],
//     languages: ["csharp"],
//     title: "Regular Expression Matching",
//     question: `Implement regular expression matching with '.' and '*' where:
// - '.' matches any single character
// - '*' matches zero or more of the preceding element

// Example:
// isMatch("aa", "a") → false
// isMatch("aa", "a*") → true
// isMatch("ab", ".*") → true
// isMatch("aab", "c*a*b") → true`,
//     answer: `\`\`\`csharp
// public bool IsMatch(string s, string p) {
//     bool[,] dp = new bool[s.Length + 1, p.Length + 1];
//     dp[0, 0] = true;
    
//     // Handle patterns like a*, a*b*, etc.
//     for (int j = 1; j <= p.Length; j++) {
//         if (p[j - 1] == '*') {
//             dp[0, j] = dp[0, j - 2];
//         }
//     }
    
//     for (int i = 1; i <= s.Length; i++) {
//         for (int j = 1; j <= p.Length; j++) {
//             if (p[j - 1] == s[i - 1] || p[j - 1] == '.') {
//                 dp[i, j] = dp[i - 1, j - 1];
//             } else if (p[j - 1] == '*') {
//                 // Zero occurrences
//                 dp[i, j] = dp[i, j - 2];
                
//                 // One or more occurrences
//                 if (p[j - 2] == s[i - 1] || p[j - 2] == '.') {
//                     dp[i, j] = dp[i, j] || dp[i - 1, j];
//                 }
//             }
//         }
//     }
    
//     return dp[s.Length, p.Length];
// }
// \`\`\`

// DP solution. Time: O(m*n), Space: O(m*n)`,
//     topicTags: ["dynamic-programming", "string-matching", "recursion", "backtracking", "regex"]
//   },
//   {
//     category: "data-structures",
//     difficulty: "hard",
//     companyLogo: "SiGoogle",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "LRU Cache Implementation",
//     question: `Design and implement an LRU (Least Recently Used) cache with O(1) time complexity for both get and put operations.

// Implement LRUCache class:
// - LRUCache(int capacity)
// - int get(int key)
// - void put(int key, int value)

// When cache reaches capacity, invalidate least recently used item before inserting new item.`,
//     answer: `\`\`\`python
// class Node:
//     def __init__(self, key=0, val=0):
//         self.key = key
//         self.val = val
//         self.prev = None
//         self.next = None

// class LRUCache:
//     def __init__(self, capacity: int):
//         self.capacity = capacity
//         self.cache = {}
//         self.head = Node()
//         self.tail = Node()
//         self.head.next = self.tail
//         self.tail.prev = self.head
    
//     def get(self, key: int) -> int:
//         if key not in self.cache:
//             return -1
//         node = self.cache[key]
//         self._remove(node)
//         self._add_to_head(node)
//         return node.val
    
//     def put(self, key: int, value: int) -> None:
//         if key in self.cache:
//             self._remove(self.cache[key])
        
//         node = Node(key, value)
//         self._add_to_head(node)
//         self.cache[key] = node
        
//         if len(self.cache) > self.capacity:
//             lru = self.tail.prev
//             self._remove(lru)
//             del self.cache[lru.key]
    
//     def _remove(self, node):
//         node.prev.next = node.next
//         node.next.prev = node.prev
    
//     def _add_to_head(self, node):
//         node.next = self.head.next
//         node.prev = self.head
//         self.head.next.prev = node
//         self.head.next = node
// \`\`\`

// HashMap + Doubly Linked List. O(1) operations.`,
//     topicTags: ["hash-map", "linked-list", "cache", "design", "data-structures"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiNetflix",
//     companySize: ["faang", "large"],
//     primaryTechStack: ["java", "kafka"],
//     languages: ["java"],
//     messageQueues: ["kafka"],
//     databases: ["cassandra", "redis"],
//     title: "Design Rate Limiter",
//     question: `Design a distributed rate limiter that limits the number of requests a user can make to an API. Requirements:

// - Support different rate limits per user tier (free: 100/hour, premium: 1000/hour)
// - Work across multiple API servers
// - Return 429 when limit exceeded with retry-after header
// - Minimize latency overhead
// - Handle clock skew

// Which algorithm would you use and why?`,
//     answer: `Use **Token Bucket** with Redis:

// \`\`\`java
// public class RateLimiter {
//     private RedisTemplate<String, String> redis;
    
//     public boolean allowRequest(String userId, String tier) {
//         String key = "rate_limit:" + userId;
//         long now = System.currentTimeMillis();
        
//         RateLimit limit = LIMITS.get(tier);
        
//         // Lua script for atomic operation
//         String script = 
//             "local tokens = tonumber(redis.call('get', KEYS[1])) or ARGV[1] " +
//             "local lastRefill = tonumber(redis.call('get', KEYS[2])) or ARGV[3] " +
//             "local now = tonumber(ARGV[3]) " +
//             "local timePassed = now - lastRefill " +
//             "local refill = math.floor(timePassed / ARGV[2]) " +
//             "tokens = math.min(tokens + refill, ARGV[1]) " +
//             "if tokens >= 1 then " +
//             "  redis.call('set', KEYS[1], tokens - 1) " +
//             "  redis.call('set', KEYS[2], now) " +
//             "  return 1 " +
//             "else return 0 end";
        
//         Long result = redis.execute(
//             script,
//             Arrays.asList(key, key + ":last"),
//             limit.maxTokens,
//             limit.refillRate,
//             now
//         );
        
//         return result == 1;
//     }
// }
// \`\`\`

// **Why Token Bucket?**
// - Allows burst traffic
// - Smooth rate limiting
// - Easy to implement in distributed system with Redis
// - Better UX than fixed window`,
//     topicTags: ["rate-limiting", "distributed-systems", "redis", "system-design", "algorithms"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiAmazon",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["javascript"],
//     languages: ["javascript"],
//     title: "Word Ladder",
//     question: `Given two words (beginWord and endWord) and a dictionary, find the length of shortest transformation sequence from beginWord to endWord, changing only one letter at a time. Each transformed word must exist in the dictionary.

// Example:
// beginWord = "hit"
// endWord = "cog"
// wordList = ["hot","dot","dog","lot","log","cog"]

// Output: 5
// Explanation: "hit" -> "hot" -> "dot" -> "dog" -> "cog"`,
//     answer: `\`\`\`javascript
// function ladderLength(beginWord, endWord, wordList) {
//     const wordSet = new Set(wordList);
//     if (!wordSet.has(endWord)) return 0;
    
//     const queue = [[beginWord, 1]];
//     const visited = new Set([beginWord]);
    
//     while (queue.length > 0) {
//         const [word, level] = queue.shift();
        
//         if (word === endWord) return level;
        
//         // Try all possible one-letter transformations
//         for (let i = 0; i < word.length; i++) {
//             for (let c = 97; c <= 122; c++) { // 'a' to 'z'
//                 const newWord = word.slice(0, i) + 
//                               String.fromCharCode(c) + 
//                               word.slice(i + 1);
                
//                 if (wordSet.has(newWord) && !visited.has(newWord)) {
//                     queue.push([newWord, level + 1]);
//                     visited.add(newWord);
//                 }
//             }
//         }
//     }
    
//     return 0;
// }
// \`\`\`

// BFS finds shortest path. Time: O(M² × N) where M = word length, N = words in list`,
//     topicTags: ["bfs", "graph", "string-manipulation", "shortest-path", "backtracking"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiStripe",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["go"],
//     languages: ["go"],
//     databases: ["postgresql"],
//     title: "Implement Idempotent Payment API",
//     question: `Design an API endpoint for processing payments that handles duplicate requests safely (idempotency). Requirements:

// - Same request (identified by idempotency key) should return same result
// - Handle concurrent duplicate requests
// - Idempotency keys expire after 24 hours
// - Return cached result for duplicates within 24h

// Write the handler function with proper error handling and concurrency control.`,
//     answer: `\`\`\`go
// type PaymentRequest struct {
//     IdempotencyKey string
//     Amount         int64
//     Currency       string
//     CustomerID     string
// }

// type PaymentResult struct {
//     ID        string
//     Status    string
//     CreatedAt time.Time
// }

// var (
//     mu sync.Map // For in-flight requests
// )

// func ProcessPayment(req PaymentRequest) (*PaymentResult, error) {
//     // Check if already processed
//     cached, err := getFromCache(req.IdempotencyKey)
//     if err == nil {
//         return cached, nil
//     }
    
//     // Acquire lock for this idempotency key
//     lockKey := "lock:" + req.IdempotencyKey
//     actual, loaded := mu.LoadOrStore(lockKey, &sync.Mutex{})
//     lock := actual.(*sync.Mutex)
    
//     lock.Lock()
//     defer lock.Unlock()
//     defer mu.Delete(lockKey)
    
//     // Double-check after acquiring lock
//     cached, err = getFromCache(req.IdempotencyKey)
//     if err == nil {
//         return cached, nil
//     }
    
//     // Process payment
//     tx, err := db.Begin()
//     if err != nil {
//         return nil, err
//     }
//     defer tx.Rollback()
    
//     // Store idempotency record first
//     _, err = tx.Exec(
//         "INSERT INTO idempotency_keys (key, request_hash, status) VALUES ($1, $2, 'processing')",
//         req.IdempotencyKey, hashRequest(req),
//     )
//     if err != nil {
//         // Already exists - another request won
//         return getFromCache(req.IdempotencyKey)
//     }
    
//     // Process actual payment
//     result, err := chargePayment(req)
//     if err != nil {
//         tx.Exec("UPDATE idempotency_keys SET status='failed' WHERE key=$1", 
//                 req.IdempotencyKey)
//         return nil, err
//     }
    
//     // Store result
//     tx.Exec("UPDATE idempotency_keys SET status='completed', result=$1 WHERE key=$2",
//             toJSON(result), req.IdempotencyKey)
    
//     tx.Commit()
    
//     // Cache for 24 hours
//     cacheResult(req.IdempotencyKey, result, 24*time.Hour)
    
//     return result, nil
// }
// \`\`\`

// Uses database + in-memory locks for safety`,
//     topicTags: ["idempotency", "concurrency", "distributed-systems", "payments", "api-design"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiMeta",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Find Minimum Window Substring",
//     question: `Given strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If no such substring exists, return empty string.

// Example:
// s = "ADOBECODEBANC", t = "ABC"
// Output: "BANC"

// Must be O(m + n) time complexity.`,
//     answer: `\`\`\`python
// def minWindow(s: str, t: str) -> str:
//     if not s or not t:
//         return ""
    
//     target = Counter(t)
//     required = len(target)
//     formed = 0
    
//     left = 0
//     window_counts = {}
//     result = float('inf'), None, None  # length, left, right
    
//     for right in range(len(s)):
//         char = s[right]
//         window_counts[char] = window_counts.get(char, 0) + 1
        
//         if char in target and window_counts[char] == target[char]:
//             formed += 1
        
//         # Contract window
//         while left <= right and formed == required:
//             if right - left + 1 < result[0]:
//                 result = (right - left + 1, left, right)
            
//             char = s[left]
//             window_counts[char] -= 1
//             if char in target and window_counts[char] < target[char]:
//                 formed -= 1
            
//             left += 1
    
//     return "" if result[0] == float('inf') else s[result[1]:result[2] + 1]
// \`\`\`

// Sliding window. Time: O(m + n), Space: O(m + n)`,
//     topicTags: ["sliding-window", "hash-map", "two-pointers", "strings", "optimization"]
//   },
//   {
//     category: "frontend",
//     difficulty: "hard",
//     companyLogo: "SiAirbnb",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["javascript"],
//     languages: ["javascript"],
//     title: "Implement Deep Clone",
//     question: `Write a function to deep clone a JavaScript object, handling:
// - Nested objects and arrays
// - Circular references
// - Special types (Date, RegExp, Map, Set)
// - Functions (preserve reference)
// - Symbols as keys

// Example:
// const obj = { a: 1, b: { c: 2 }, d: [3, 4] };
// obj.self = obj; // circular reference
// const cloned = deepClone(obj);`,
//     answer: `\`\`\`javascript
// function deepClone(obj, hash = new WeakMap()) {
//     // Handle primitives and null
//     if (obj === null || typeof obj !== 'object') {
//         return obj;
//     }
    
//     // Handle circular references
//     if (hash.has(obj)) {
//         return hash.get(obj);
//     }
    
//     // Handle Date
//     if (obj instanceof Date) {
//         return new Date(obj);
//     }
    
//     // Handle RegExp
//     if (obj instanceof RegExp) {
//         return new RegExp(obj.source, obj.flags);
//     }
    
//     // Handle Map
//     if (obj instanceof Map) {
//         const cloned = new Map();
//         hash.set(obj, cloned);
//         obj.forEach((value, key) => {
//             cloned.set(deepClone(key, hash), deepClone(value, hash));
//         });
//         return cloned;
//     }
    
//     // Handle Set
//     if (obj instanceof Set) {
//         const cloned = new Set();
//         hash.set(obj, cloned);
//         obj.forEach(value => {
//             cloned.add(deepClone(value, hash));
//         });
//         return cloned;
//     }
    
//     // Handle Array
//     if (Array.isArray(obj)) {
//         const cloned = [];
//         hash.set(obj, cloned);
//         obj.forEach((item, index) => {
//             cloned[index] = deepClone(item, hash);
//         });
//         return cloned;
//     }
    
//     // Handle Object
//     const cloned = Object.create(Object.getPrototypeOf(obj));
//     hash.set(obj, cloned);
    
//     // Clone symbols and regular keys
//     Reflect.ownKeys(obj).forEach(key => {
//         cloned[key] = deepClone(obj[key], hash);
//     });
    
//     return cloned;
// }
// \`\`\`

// WeakMap tracks visited objects for circular refs`,
//     topicTags: ["javascript", "recursion", "data-structures", "object-manipulation", "algorithms"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiGoogle",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Merge K Sorted Lists",
//     question: `You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.

// Example:
// Input: [[1,4,5],[1,3,4],[2,6]]
// Output: [1,1,2,3,4,4,5,6]

// Optimize for time complexity.`,
//     answer: `\`\`\`java
// public ListNode mergeKLists(ListNode[] lists) {
//     if (lists == null || lists.length == 0) return null;
    
//     PriorityQueue<ListNode> heap = new PriorityQueue<>(
//         (a, b) -> a.val - b.val
//     );
    
//     // Add first node from each list
//     for (ListNode node : lists) {
//         if (node != null) {
//             heap.offer(node);
//         }
//     }
    
//     ListNode dummy = new ListNode(0);
//     ListNode current = dummy;
    
//     while (!heap.isEmpty()) {
//         ListNode smallest = heap.poll();
//         current.next = smallest;
//         current = current.next;
        
//         if (smallest.next != null) {
//             heap.offer(smallest.next);
//         }
//     }
    
//     return dummy.next;
// }
// \`\`\`

// Min-heap approach. Time: O(N log k) where N = total nodes, k = lists
// Space: O(k) for heap

// Alternative: Divide and conquer merge pairs recursively - O(N log k) time, O(log k) space`,
//     topicTags: ["heap", "linked-list", "merge-sort", "divide-and-conquer", "priority-queue"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiUber",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["python", "redis"],
//     languages: ["python"],
//     databases: ["redis", "postgresql"],
//     title: "Design Geospatial Index",
//     question: `Implement a system to find nearby drivers within a radius. Requirements:

// - Store driver locations (lat, lng)
// - Query: find all drivers within X km of a point
// - Handle 100k+ active drivers
// - Sub-100ms query latency
// - Update driver locations frequently (every 5 seconds)

// Which data structure and algorithm would you use?`,
//     answer: `Use **Redis GeoHash** with sorted sets:

// \`\`\`python
// import redis
// from math import radians, cos, sin, asin, sqrt

// class DriverLocationService:
//     def __init__(self):
//         self.redis = redis.Redis()
//         self.key = "driver:locations"
    
//     def update_location(self, driver_id: str, lat: float, lng: float):
//         """Update driver location - O(log N)"""
//         self.redis.geoadd(self.key, lng, lat, driver_id)
        
//         # Set expiry for inactive cleanup
//         self.redis.expire(f"driver:{driver_id}:active", 300)
    
//     def find_nearby(self, lat: float, lng: float, 
//                    radius_km: float, limit: int = 50):
//         """Find drivers within radius - O(N log N)"""
//         # Redis GEORADIUS command
//         results = self.redis.georadius(
//             self.key,
//             lng, lat,
//             radius_km,
//             unit='km',
//             withdist=True,
//             withcoord=True,
//             count=limit,
//             sort='ASC'
//         )
        
//         return [{
//             'driver_id': r[0].decode(),
//             'distance': r[1],
//             'location': {'lat': r[2][1], 'lng': r[2][0]}
//         } for r in results]
    
//     def remove_driver(self, driver_id: str):
//         """Remove inactive driver"""
//         self.redis.zrem(self.key, driver_id)
// \`\`\`

// **Why GeoHash?**
// - O(log N) insertion
// - O(N + log M) range queries
// - Redis native support
// - Handles millions of points
// - < 100ms queries

// **Alternative:** QuadTree for in-memory, R-tree for spatial databases`,
//     topicTags: ["geospatial", "redis", "data-structures", "indexing", "system-design"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiTesla",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["cpp"],
//     languages: ["cpp"],
//     title: "Longest Increasing Path in Matrix",
//     question: `Given an m x n matrix, return the length of the longest increasing path. You can move in 4 directions (up, down, left, right).

// Example:
// matrix = [
//   [9,9,4],
//   [6,6,8],
//   [2,1,1]
// ]
// Output: 4
// Explanation: The longest path is [1,2,6,9]`,
//     answer: `\`\`\`cpp
// class Solution {
// private:
//     int dirs[4][2] = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    
//     int dfs(vector<vector<int>>& matrix, vector<vector<int>>& memo, 
//             int i, int j) {
//         if (memo[i][j] != 0) return memo[i][j];
        
//         int maxLen = 1;
//         for (auto& dir : dirs) {
//             int x = i + dir[0], y = j + dir[1];
            
//             if (x >= 0 && x < matrix.size() && 
//                 y >= 0 && y < matrix[0].size() && 
//                 matrix[x][y] > matrix[i][j]) {
//                 maxLen = max(maxLen, 1 + dfs(matrix, memo, x, y));
//             }
//         }
        
//         memo[i][j] = maxLen;
//         return maxLen;
//     }
    
// public:
//     int longestIncreasingPath(vector<vector<int>>& matrix) {
//         if (matrix.empty()) return 0;
        
//         int m = matrix.size(), n = matrix[0].size();
//         vector<vector<int>> memo(m, vector<int>(n, 0));
//         int result = 0;
        
//         for (int i = 0; i < m; i++) {
//             for (int j = 0; j < n; j++) {
//                 result = max(result, dfs(matrix, memo, i, j));
//             }
//         }
        
//         return result;
//     }
// };
// \`\`\`

// DFS + Memoization. Time: O(m*n), Space: O(m*n)`,
//     topicTags: ["dfs", "memoization", "dynamic-programming", "matrix", "graph"]
//   },
//   {
//     category: "system-design",
//     difficulty: "hard",
//     companyLogo: "SiTwitter",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["scala", "redis"],
//     languages: ["scala"],
//     databases: ["redis", "cassandra"],
//     messageQueues: ["kafka"],
//     title: "Design Twitter Feed",
//     question: `Design a Twitter-like feed system. Requirements:

// - Users can post tweets
// - Users can follow other users
// - Timeline shows tweets from followed users
// - Must handle 100M users, 500M tweets/day
// - Timeline loads in < 200ms
// - Support both fan-out on write and read

// What's your approach for storing and serving timelines?`,
//     answer: `**Hybrid Approach:**

// **For Regular Users (< 10k followers): Fan-out on Write**
// \`\`\`scala
// def postTweet(userId: String, tweetId: String) {
//   // Store tweet
//   cassandra.insert("tweets", tweetId, tweet)
  
//   // Get followers
//   val followers = getFollowers(userId)
  
//   // Fan-out to each follower's timeline
//   followers.foreach { followerId =>
//     redis.zadd(s"timeline:$followerId", timestamp, tweetId)
//     redis.zremrangebyrank(s"timeline:$followerId", 0, -801) // Keep 800
//   }
  
//   // Publish to Kafka for async processing
//   kafka.publish("tweet-posted", TweetEvent(userId, tweetId))
// }
// \`\`\`

// **For Celebrities (> 10k followers): Fan-out on Read**
// \`\`\`scala
// def getTimeline(userId: String, page: Int) {
//   val timeline = mutable.PriorityQueue[(Long, String)]()
  
//   // Get from pre-computed timeline (regular users)
//   val cached = redis.zrevrange(s"timeline:$userId", 0, 99)
//   timeline ++= cached
  
//   // Fetch from celebrities user follows
//   val celebrities = getCelebrityFollowees(userId)
//   celebrities.foreach { celeb =>
//     val tweets = cassandra.query(
//       "SELECT * FROM tweets WHERE user_id = ? ORDER BY time DESC LIMIT 50",
//       celeb
//     )
//     timeline ++= tweets
//   }
  
//   // Merge and sort
//   timeline.take(50).sortBy(-_._1)
// }
// \`\`\`

// **Key Design Decisions:**
// - Redis sorted sets for timelines (O(log N) insert)
// - Cassandra for tweet storage (write-optimized)
// - Hybrid approach: < 10k followers → fan-out write, > 10k → fan-out read
// - Cache celebrity tweets in Redis (hot data)
// - Kafka for async processing`,
//     topicTags: ["system-design", "scalability", "caching", "fan-out", "social-network"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiApple",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["swift"],
//     languages: ["swift"],
//     title: "Wildcard Pattern Matching",
//     question: `Implement wildcard pattern matching with '?' and '*':
// - '?' matches any single character
// - '*' matches any sequence of characters (including empty)

// Example:
// isMatch("aa", "a") → false
// isMatch("aa", "*") → true
// isMatch("cb", "?a") → false
// isMatch("adceb", "*a*b") → true`,
//     answer: `\`\`\`swift
// func isMatch(_ s: String, _ p: String) -> Bool {
//     let s = Array(s), p = Array(p)
//     var sIdx = 0, pIdx = 0
//     var starIdx = -1, match = 0
    
//     while sIdx < s.count {
//         // Current characters match or pattern has '?'
//         if pIdx < p.count && (p[pIdx] == s[sIdx] || p[pIdx] == "?") {
//             sIdx += 1
//             pIdx += 1
//         }
//         // Pattern has '*'
//         else if pIdx < p.count && p[pIdx] == "*" {
//             starIdx = pIdx
//             match = sIdx
//             pIdx += 1
//         }
//         // No match, backtrack to last '*'
//         else if starIdx != -1 {
//             pIdx = starIdx + 1
//             match += 1
//             sIdx = match
//         }
//         // No match and no '*' to backtrack
//         else {
//             return false
//         }
//     }
    
//     // Check remaining pattern characters are all '*'
//     while pIdx < p.count && p[pIdx] == "*" {
//         pIdx += 1
//     }
    
//     return pIdx == p.count
// }
// \`\`\`

// Greedy with backtracking. Time: O(min(s,p)) average, O(s*p) worst
// Space: O(1)`,
//     topicTags: ["string-matching", "greedy", "backtracking", "pattern-matching", "algorithms"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiShopify",
//     companySize: ["large", "unicorn"],
//     primaryTechStack: ["ruby", "rails"],
//     languages: ["ruby"],
//     backendFrameworks: ["rails"],
//     databases: ["postgresql", "redis"],
//     title: "Implement Distributed Lock",
//     question: `Implement a distributed lock using Redis to prevent race conditions in a distributed system. Requirements:

// - Lock acquisition with timeout
// - Auto-release after expiry
// - Handle network failures
// - Prevent deadlocks
// - Atomic operations

// Write the acquire and release methods.`,
//     answer: `\`\`\`ruby
// class DistributedLock
//   def initialize(redis, key, ttl: 30)
//     @redis = redis
//     @key = "lock:#{key}"
//     @ttl = ttl
//     @token = SecureRandom.uuid
//   end
  
//   def acquire(timeout: 10)
//     deadline = Time.now + timeout
    
//     loop do
//       # Try to acquire lock with SET NX EX
//       acquired = @redis.set(
//         @key, 
//         @token, 
//         nx: true,    # Only set if not exists
//         ex: @ttl     # Expire after TTL seconds
//       )
      
//       return true if acquired
      
//       # Timeout exceeded
//       return false if Time.now >= deadline
      
//       # Wait a bit before retry
//       sleep(0.01 + rand(0.05))
//     end
//   end
  
//   def release
//     # Lua script for atomic check-and-delete
//     script = <<~LUA
//       if redis.call("get", KEYS[1]) == ARGV[1] then
//         return redis.call("del", KEYS[1])
//       else
//         return 0
//       end
//     LUA
    
//     @redis.eval(script, keys: [@key], argv: [@token]) == 1
//   end
  
//   def extend(additional_ttl)
//     # Extend lock if still owned
//     script = <<~LUA
//       if redis.call("get", KEYS[1]) == ARGV[1] then
//         return redis.call("expire", KEYS[1], ARGV[2])
//       else
//         return 0
//       end
//     LUA
    
//     @redis.eval(script, keys: [@key], argv: [@token, @ttl + additional_ttl])
//   end
  
//   def with_lock(timeout: 10)
//     if acquire(timeout: timeout)
//       begin
//         yield
//       ensure
//         release
//       end
//     else
//       raise LockTimeout, "Could not acquire lock within #{timeout}s"
//     end
//   end
// end

// # Usage
// lock = DistributedLock.new($redis, "order:123")
// lock.with_lock do
//   # Critical section
//   process_order(order)
// end
// \`\`\`

// Uses Redis SET NX EX + Lua for atomicity. Token prevents accidental release.`,
//     topicTags: ["distributed-systems", "concurrency", "redis", "locks", "race-conditions"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiMicrosoft",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python"],
//     languages: ["python"],
//     title: "Edit Distance (Levenshtein)",
//     question: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. Operations allowed:
// - Insert a character
// - Delete a character
// - Replace a character

// Example:
// word1 = "horse", word2 = "ros"
// Output: 3
// Explanation: horse -> rorse -> rose -> ros`,
//     answer: `\`\`\`python
// def minDistance(word1: str, word2: str) -> int:
//     m, n = len(word1), len(word2)
    
//     # dp[i][j] = min operations to convert word1[0:i] to word2[0:j]
//     dp = [[0] * (n + 1) for _ in range(m + 1)]
    
//     # Base cases
//     for i in range(m + 1):
//         dp[i][0] = i  # Delete all characters
//     for j in range(n + 1):
//         dp[0][j] = j  # Insert all characters
    
//     # Fill DP table
//     for i in range(1, m + 1):
//         for j in range(1, n + 1):
//             if word1[i - 1] == word2[j - 1]:
//                 dp[i][j] = dp[i - 1][j - 1]  # No operation needed
//             else:
//                 dp[i][j] = 1 + min(
//                     dp[i - 1][j],      # Delete
//                     dp[i][j - 1],      # Insert
//                     dp[i - 1][j - 1]   # Replace
//                 )
    
//     return dp[m][n]

// # Space-optimized version (O(n) space)
// def minDistanceOptimized(word1: str, word2: str) -> int:
//     m, n = len(word1), len(word2)
    
//     # Only need current and previous row
//     prev = list(range(n + 1))
    
//     for i in range(1, m + 1):
//         curr = [i] + [0] * n
//         for j in range(1, n + 1):
//             if word1[i - 1] == word2[j - 1]:
//                 curr[j] = prev[j - 1]
//             else:
//                 curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
//         prev = curr
    
//     return prev[n]
// \`\`\`

// Classic DP. Time: O(m*n), Space: O(n) optimized`,
//     topicTags: ["dynamic-programming", "strings", "edit-distance", "optimization", "algorithms"]
//   },
//   {
//     category: "frontend",
//     difficulty: "hard",
//     companyLogo: "SiGoogle",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["typescript", "react"],
//     languages: ["typescript"],
//     frontendFrameworks: ["react"],
//     title: "Implement Virtual Scroll",
//     question: `Implement a virtual scrolling component that renders only visible items from a large list (10,000+ items). Requirements:

// - Render only visible items + buffer
// - Smooth scrolling with no jank
// - Dynamic item heights
// - Handle rapid scrolling
// - Memory efficient

// Write the core logic with React hooks.`,
//     answer: `\`\`\`typescript
// import { useState, useEffect, useRef, useCallback } from 'react';

// interface VirtualScrollProps {
//   items: any[];
//   itemHeight: number;
//   containerHeight: number;
//   renderItem: (item: any, index: number) => JSX.Element;
//   overscan?: number;
// }

// function VirtualScroll({
//   items,
//   itemHeight,
//   containerHeight,
//   renderItem,
//   overscan = 3
// }: VirtualScrollProps) {
//   const [scrollTop, setScrollTop] = useState(0);
//   const containerRef = useRef<HTMLDivElement>(null);
  
//   // Calculate visible range
//   const startIndex = Math.max(
//     0,
//     Math.floor(scrollTop / itemHeight) - overscan
//   );
//   const endIndex = Math.min(
//     items.length,
//     Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
//   );
  
//   const visibleItems = items.slice(startIndex, endIndex);
  
//   // Total height for scrollbar
//   const totalHeight = items.length * itemHeight;
  
//   // Offset for positioning
//   const offsetY = startIndex * itemHeight;
  
//   // Scroll handler with RAF throttle
//   const handleScroll = useCallback(() => {
//     if (containerRef.current) {
//       const scrollTop = containerRef.current.scrollTop;
//       requestAnimationFrame(() => {
//         setScrollTop(scrollTop);
//       });
//     }
//   }, []);
  
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;
    
//     container.addEventListener('scroll', handleScroll, { passive: true });
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, [handleScroll]);
  
//   return (
//     <div
//       ref={containerRef}
//       style={{
//         height: containerHeight,
//         overflow: 'auto',
//         position: 'relative'
//       }}
//     >
//       <div style={{ height: totalHeight, position: 'relative' }}>
//         <div
//           style={{
//             transform: \`translateY(\${offsetY}px)\`,
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0
//           }}
//         >
//           {visibleItems.map((item, i) => (
//             <div key={startIndex + i} style={{ height: itemHeight }}>
//               {renderItem(item, startIndex + i)}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
// \`\`\`

// Only renders visible items. Handles 100k+ items smoothly.`,
//     topicTags: ["react", "performance", "virtualization", "optimization", "frontend"]
//   },
//   {
//     category: "algorithms",
//     difficulty: "hard",
//     companyLogo: "SiNetflix",
//     companySize: ["large", "faang"],
//     primaryTechStack: ["java"],
//     languages: ["java"],
//     title: "Shortest Path with Obstacles",
//     question: `Given an m x n grid where 0 = empty, 1 = obstacle, find the shortest path from top-left to bottom-right. You can eliminate at most k obstacles.

// Example:
// grid = [
//   [0,0,0],
//   [1,1,0],
//   [0,0,0]
// ], k = 1
// Output: 6`,
//     answer: `\`\`\`java
// public int shortestPath(int[][] grid, int k) {
//     int m = grid.length, n = grid[0].length;
//     if (k >= m + n - 2) return m + n - 2; // Can eliminate all
    
//     // BFS with state (x, y, obstacles_remaining)
//     Queue<int[]> queue = new LinkedList<>();
//     Set<String> visited = new HashSet<>();
    
//     queue.offer(new int[]{0, 0, k, 0}); // x, y, k, steps
//     visited.add("0,0," + k);
    
//     int[][] dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    
//     while (!queue.isEmpty()) {
//         int[] curr = queue.poll();
//         int x = curr[0], y = curr[1];
//         int remaining = curr[2], steps = curr[3];
        
//         // Reached destination
//         if (x == m - 1 && y == n - 1) {
//             return steps;
//         }
        
//         // Try all 4 directions
//         for (int[] dir : dirs) {
//             int nx = x + dir[0], ny = y + dir[1];
            
//             // Out of bounds
//             if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;
            
//             int newRemaining = remaining - grid[nx][ny];
            
//             // Too many obstacles
//             if (newRemaining < 0) continue;
            
//             String key = nx + "," + ny + "," + newRemaining;
//             if (visited.contains(key)) continue;
            
//             visited.add(key);
//             queue.offer(new int[]{nx, ny, newRemaining, steps + 1});
//         }
//     }
    
//     return -1; // No path found
// }
// \`\`\`

// BFS with state tracking. Time: O(m*n*k), Space: O(m*n*k)`,
//     topicTags: ["bfs", "graph", "shortest-path", "grid", "state-space-search"]
//   },
//   {
//     category: "backend",
//     difficulty: "hard",
//     companyLogo: "SiAmazon",
//     companySize: ["faang", "enterprise"],
//     primaryTechStack: ["python", "dynamodb"],
//     languages: ["python"],
//     databases: ["dynamodb"],
//     cloudProviders: ["aws"],
//     title: "Design Inventory System",
//     question: `Design an inventory management system that handles:

// - Reserve items during checkout (soft lock)
// - Release reserved items if order expires (15 min)
// - Prevent overselling with concurrent requests
// - Handle distributed servers

// Use DynamoDB. Write the reserve and release functions with optimistic locking.`,
//     answer: `\`\`\`python
// import boto3
// from datetime import datetime, timedelta
// from decimal import Decimal

// dynamodb = boto3.resource('dynamodb')
// inventory_table = dynamodb.Table('inventory')
// reservations_table = dynamodb.Table('reservations')

// def reserve_inventory(product_id: str, quantity: int, 
//                      order_id: str) -> bool:
//     """Reserve inventory with optimistic locking"""
//     try:
//         # Get current inventory with version
//         response = inventory_table.get_item(
//             Key={'product_id': product_id}
//         )
        
//         if 'Item' not in response:
//             return False
        
//         item = response['Item']
//         available = item['available_quantity']
//         version = item['version']
        
//         # Check availability
//         if available < quantity:
//             return False
        
//         # Update with condition (optimistic lock)
//         inventory_table.update_item(
//             Key={'product_id': product_id},
//             UpdateExpression="""
//                 SET available_quantity = available_quantity - :qty,
//                     reserved_quantity = reserved_quantity + :qty,
//                     version = version + :inc
//             """,
//             ConditionExpression="""
//                 version = :current_version AND
//                 available_quantity >= :qty
//             """,
//             ExpressionAttributeValues={
//                 ':qty': quantity,
//                 ':current_version': version,
//                 ':inc': 1
//             }
//         )
        
//         # Create reservation record
//         expiry = datetime.utcnow() + timedelta(minutes=15)
//         reservations_table.put_item(
//             Item={
//                 'reservation_id': f"{order_id}:{product_id}",
//                 'order_id': order_id,
//                 'product_id': product_id,
//                 'quantity': quantity,
//                 'expires_at': int(expiry.timestamp()),
//                 'status': 'active'
//             }
//         )
        
//         return True
        
//     except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
//         # Concurrent modification - retry or fail
//         return False

// def release_reservation(order_id: str, product_id: str):
//     """Release reserved inventory"""
//     reservation_id = f"{order_id}:{product_id}"
    
//     # Get reservation
//     response = reservations_table.get_item(
//         Key={'reservation_id': reservation_id}
//     )
    
//     if 'Item' not in response:
//         return
    
//     reservation = response['Item']
//     quantity = reservation['quantity']
    
//     # Return to available inventory
//     inventory_table.update_item(
//         Key={'product_id': product_id},
//         UpdateExpression="""
//             SET available_quantity = available_quantity + :qty,
//                 reserved_quantity = reserved_quantity - :qty,
//                 version = version + :inc
//         """,
//         ExpressionAttributeValues={
//             ':qty': quantity,
//             ':inc': 1
//         }
//     )
    
//     # Mark reservation as released
//     reservations_table.update_item(
//         Key={'reservation_id': reservation_id},
//         UpdateExpression="SET #status = :status",
//         ExpressionAttributeNames={'#status': 'status'},
//         ExpressionAttributeValues={':status': 'released'}
//     )

// # Background job to expire old reservations
// def cleanup_expired_reservations():
//     """Lambda function to release expired reservations"""
//     now = int(datetime.utcnow().timestamp())
    
//     response = reservations_table.scan(
//         FilterExpression="expires_at < :now AND #status = :active",
//         ExpressionAttributeNames={'#status': 'status'},
//         ExpressionAttributeValues={
//             ':now': now,
//             ':active': 'active'
//         }
//     )
    
//     for item in response['Items']:
//         release_reservation(item['order_id'], item['product_id'])
// \`\`\`

// Optimistic locking prevents race conditions. TTL handles expiry.`,
//     topicTags: ["distributed-systems", "concurrency", "dynamodb", "optimistic-locking", "inventory-management"]
//   }
// ];


// async function seedQuestions() {
//   console.info('🌱 Starting database seeding...\n');

//   try {
//     const questionsRef = db.collection('practice-questions');

//     // Process in batches (Firestore batch limit is 500 operations)
//     const BATCH_SIZE = 500;
//     const batches: any[] = [];

//     for (let i = 0; i < sampleQuestions.length; i += BATCH_SIZE) {
//       batches.push(sampleQuestions.slice(i, i + BATCH_SIZE));
//     }

//     let totalAdded = 0;

//     for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
//       const batch = db.batch();
//       const currentBatch = batches[batchIndex];

//       console.info(`📦 Processing batch ${batchIndex + 1}/${batches.length}...`);

//       currentBatch.forEach((question : PracticeQuestion) => {
//         const docRef = questionsRef.doc(); // Auto-generate ID
//         batch.set(docRef, {
//           ...question,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });

//         console.info(`  ➕ Queued: ${question.companyLogo} - ${question.category}`);
//       });

//       // Commit the batch
//       await batch.commit();
//       totalAdded += currentBatch.length;
//       console.info(`  ✅ Batch ${batchIndex + 1} committed successfully!\n`);
//     }

//     console.info('='.repeat(50));
//     console.info(`🎉 Seeding complete!`);
//     console.info(`✅ Successfully added: ${totalAdded} questions`);
//     console.info(`📊 Total batches: ${batches.length}`);
//     console.info('='.repeat(50));

//   } catch (error) {
//     console.error('❌ Seeding failed:', error);
//     process.exit(1);
//   }
// }

// // Run the seeding
// seedQuestions()
//   .then(() => {
//     console.info('\n✨ All done! Check your Firebase Console to verify.');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('Fatal error:', error);
//     process.exit(1);
//   });
