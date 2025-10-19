/**
 * Firestore Database Seeding Script for Practice Questions
 * 
 * Usage:
 * 1. Create a file: scripts/seed-questions.ts
 * 2. Run: npx ts-node scripts/seed-questions.ts
 * 
 * Or add to package.json:
 * "scripts": {
 *   "seed:questions": "ts-node scripts/seed-questions.ts"
 * }
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './serviceAccounts.json'; // Download from Firebase Console
import { PracticeQuestion } from '@/lib/practice-questions-service';

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as any)
});

const db = getFirestore();

// Sample questions data
const sampleQuestions = [
  {
    question: "# System Design: Design Instagram\n\nDesign a photo-sharing social media platform similar to Instagram. Your design should handle:\n\n* Photo upload and storage\n* News feed generation\n* Follow/unfollow functionality\n* Like and comment features\n* Search functionality\n\nConsider scalability for millions of users.",
    answer: "## High-Level Architecture\n\n### Core Components\n\n1. **Client Applications** (iOS, Android, Web)\n2. **API Gateway** - Load balancer and request router\n3. **Application Servers** - Business logic\n4. **Database Layer** - User data, posts, relationships\n5. **Object Storage** - Photo/video storage (S3)\n6. **CDN** - Content delivery\n7. **Cache Layer** - Redis for frequently accessed data\n8. **Message Queue** - Async processing (Kafka/RabbitMQ)\n\n### Database Schema\n\n```sql\nUsers Table:\n- user_id (PK)\n- username\n- email\n- profile_photo_url\n- created_at\n\nPosts Table:\n- post_id (PK)\n- user_id (FK)\n- image_url\n- caption\n- created_at\n\nFollows Table:\n- follower_id (FK)\n- followee_id (FK)\n- created_at\n\nLikes Table:\n- user_id (FK)\n- post_id (FK)\n- created_at\n```\n\n### Key Design Decisions\n\n**Photo Upload Flow:**\n1. Client uploads to application server\n2. Server generates unique ID and uploads to S3\n3. Thumbnail generation service creates multiple sizes\n4. Metadata stored in database\n5. CDN URL returned to client\n\n**News Feed Generation:**\n- **Push Model** (for users with few followers)\n  - Pre-compute feed when post is created\n  - Store in Redis cache\n  - Fast read, slower write\n\n- **Pull Model** (for users with many followers)\n  - Fetch on-demand from followed users\n  - Merge and rank by timestamp\n  - Slower read, fast write\n\n- **Hybrid Approach** for optimal performance\n\n**Scalability Considerations:**\n\n* **Database Sharding** - Partition by user_id\n* **Read Replicas** - For read-heavy workload\n* **Caching Strategy** - Cache user feeds, popular posts\n* **CDN** - Serve images from edge locations\n* **Async Processing** - Use message queues for likes, comments\n\n### Estimated Capacity\n\n* 500M daily active users\n* 2M new photos per day\n* Average photo size: 2MB\n* Storage needed: 4TB/day\n* Read:Write ratio: 100:1\n\n### Trade-offs\n\n* **Consistency vs Availability** - Eventually consistent for likes/followers\n* **Push vs Pull** - Hybrid approach based on user follower count\n* **Storage Cost** - Multiple image sizes increase storage but improve UX",
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiMeta",
    companyName: "Meta",
    topicTags: [
      "System Design",
      "Distributed Systems",
      "Scalability",
      "CDN",
      "Caching",
      "Database Design",
      "Load Balancing",
      "Microservices"
    ],
    languages: ["Python", "Java", "Go"],
    databases: ["PostgreSQL", "Redis", "Cassandra"],
    cloudProviders: ["AWS"],
    frontendFrameworks: ["React", "React Native"],
    backendFrameworks: ["Django", "Spring Boot"],
    learningResources: [
      {
        title: "System Design Primer - Instagram",
        url: "https://github.com/donnemartin/system-design-primer",
        type: "article"
      },
      {
        title: "Designing Data-Intensive Applications",
        url: "https://dataintensive.net/",
        type: "book"
      }
    ]
  },
  {
    question: "## Algorithm: Two Sum\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\n**Example:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n```\n\n**Constraints:**\n* Each input has exactly one solution\n* Cannot use the same element twice",
    answer: "## Solution Approaches\n\n### Approach 1: Brute Force\n\n**Time Complexity:** O(n²)\n**Space Complexity:** O(1)\n\n```python\ndef two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []\n```\n\n### Approach 2: Hash Map (Optimal)\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(n)\n\n```python\ndef two_sum(nums, target):\n    seen = {}  # value -> index\n    \n    for i, num in enumerate(nums):\n        complement = target - num\n        \n        if complement in seen:\n            return [seen[complement], i]\n        \n        seen[num] = i\n    \n    return []\n```\n\n**Key Insight:** As we iterate through the array, we check if the complement (target - current number) exists in our hash map. If it does, we've found our pair. Otherwise, we store the current number and its index.\n\n### Example Walkthrough\n\n```\nnums = [2, 7, 11, 15], target = 9\n\nIteration 1: num=2, complement=7\n  seen = {}\n  7 not in seen\n  seen = {2: 0}\n\nIteration 2: num=7, complement=2\n  seen = {2: 0}\n  2 in seen! ✓\n  return [0, 1]\n```\n\n### Edge Cases to Consider\n\n* Empty array\n* Array with duplicates\n* Negative numbers\n* Target is zero\n* No solution exists (per constraints, won't happen)",
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companyName: "Google",
    topicTags: [
      "Array",
      "Hash Table",
      "Two Pointers"
    ],
    languages: ["Python", "JavaScript", "Java", "C++"],
    databases: [],
    cloudProviders: [],
    frontendFrameworks: [],
    backendFrameworks: [],
    learningResources: [
      {
        title: "LeetCode Two Sum",
        url: "https://leetcode.com/problems/two-sum/",
        type: "practice"
      },
      {
        title: "Hash Table Pattern",
        url: "https://leetcode.com/explore/learn/card/hash-table/",
        type: "tutorial"
      }
    ]
  },
  {
    question: "# Frontend: Build a Autocomplete Search Component\n\nDesign and implement an autocomplete search component in React that:\n\n* Fetches suggestions from an API as user types\n* Debounces API calls to reduce requests\n* Handles loading and error states\n* Keyboard navigation (up/down arrows, enter)\n* Highlights matching text\n* Accessible (ARIA labels, screen reader support)\n\nDiscuss performance optimizations and edge cases.",
    answer: "## Implementation\n\n```typescript\nimport { useState, useEffect, useRef, useCallback } from 'react';\n\ninterface Suggestion {\n  id: string;\n  text: string;\n}\n\ninterface AutocompleteProps {\n  fetchSuggestions: (query: string) => Promise<Suggestion[]>;\n  onSelect: (suggestion: Suggestion) => void;\n  debounceMs?: number;\n  placeholder?: string;\n}\n\nexport function Autocomplete({\n  fetchSuggestions,\n  onSelect,\n  debounceMs = 300,\n  placeholder = 'Search...'\n}: AutocompleteProps) {\n  const [query, setQuery] = useState('');\n  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n  const [selectedIndex, setSelectedIndex] = useState(-1);\n  const [isOpen, setIsOpen] = useState(false);\n  \n  const inputRef = useRef<HTMLInputElement>(null);\n  const debounceTimerRef = useRef<NodeJS.Timeout>();\n\n  // Debounced fetch\n  const debouncedFetch = useCallback((searchQuery: string) => {\n    if (debounceTimerRef.current) {\n      clearTimeout(debounceTimerRef.current);\n    }\n\n    if (!searchQuery.trim()) {\n      setSuggestions([]);\n      setIsOpen(false);\n      return;\n    }\n\n    debounceTimerRef.current = setTimeout(async () => {\n      try {\n        setLoading(true);\n        setError(null);\n        const results = await fetchSuggestions(searchQuery);\n        setSuggestions(results);\n        setIsOpen(true);\n      } catch (err) {\n        setError('Failed to fetch suggestions');\n        setSuggestions([]);\n      } finally {\n        setLoading(false);\n      }\n    }, debounceMs);\n  }, [fetchSuggestions, debounceMs]);\n\n  useEffect(() => {\n    debouncedFetch(query);\n    return () => {\n      if (debounceTimerRef.current) {\n        clearTimeout(debounceTimerRef.current);\n      }\n    };\n  }, [query, debouncedFetch]);\n\n  const handleKeyDown = (e: React.KeyboardEvent) => {\n    if (!isOpen) return;\n\n    switch (e.key) {\n      case 'ArrowDown':\n        e.preventDefault();\n        setSelectedIndex(prev => \n          prev < suggestions.length - 1 ? prev + 1 : prev\n        );\n        break;\n      case 'ArrowUp':\n        e.preventDefault();\n        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);\n        break;\n      case 'Enter':\n        e.preventDefault();\n        if (selectedIndex >= 0 && suggestions[selectedIndex]) {\n          handleSelect(suggestions[selectedIndex]);\n        }\n        break;\n      case 'Escape':\n        setIsOpen(false);\n        setSelectedIndex(-1);\n        break;\n    }\n  };\n\n  const handleSelect = (suggestion: Suggestion) => {\n    setQuery(suggestion.text);\n    setIsOpen(false);\n    setSelectedIndex(-1);\n    onSelect(suggestion);\n  };\n\n  const highlightMatch = (text: string) => {\n    if (!query) return text;\n    \n    const regex = new RegExp(`(${query})`, 'gi');\n    const parts = text.split(regex);\n    \n    return parts.map((part, i) => \n      regex.test(part) ? <strong key={i}>{part}</strong> : part\n    );\n  };\n\n  return (\n    <div className=\"autocomplete\">\n      <input\n        ref={inputRef}\n        type=\"text\"\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        onKeyDown={handleKeyDown}\n        placeholder={placeholder}\n        aria-label=\"Search\"\n        aria-autocomplete=\"list\"\n        aria-controls=\"suggestions-list\"\n        aria-expanded={isOpen}\n        className=\"autocomplete-input\"\n      />\n      \n      {loading && <div className=\"loading\">Loading...</div>}\n      {error && <div className=\"error\">{error}</div>}\n      \n      {isOpen && suggestions.length > 0 && (\n        <ul\n          id=\"suggestions-list\"\n          role=\"listbox\"\n          className=\"suggestions-list\"\n        >\n          {suggestions.map((suggestion, index) => (\n            <li\n              key={suggestion.id}\n              role=\"option\"\n              aria-selected={index === selectedIndex}\n              className={index === selectedIndex ? 'selected' : ''}\n              onClick={() => handleSelect(suggestion)}\n              onMouseEnter={() => setSelectedIndex(index)}\n            >\n              {highlightMatch(suggestion.text)}\n            </li>\n          ))}\n        </ul>\n      )}\n    </div>\n  );\n}\n```\n\n## Key Concepts\n\n### 1. Debouncing\nPrevents excessive API calls by waiting for user to stop typing\n\n### 2. Keyboard Navigation\n* Arrow keys to move through suggestions\n* Enter to select\n* Escape to close\n\n### 3. Accessibility\n* ARIA labels and roles\n* Keyboard support\n* Screen reader announcements\n\n### 4. Performance Optimizations\n* `useCallback` to memoize fetch function\n* Cleanup timers on unmount\n* Cancel previous requests if needed\n\n### 5. Edge Cases\n* Empty query\n* No results\n* API errors\n* Fast typing\n* Duplicate requests",
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiAirbnb",
    companyName: "Airbnb",
    topicTags: [
      "React",
      "TypeScript",
      "Debouncing",
      "Accessibility",
      "Keyboard Navigation",
      "Performance"
    ],
    languages: ["TypeScript", "JavaScript"],
    databases: [],
    cloudProviders: [],
    frontendFrameworks: ["React"],
    backendFrameworks: [],
    learningResources: [
      {
        title: "React Hooks Documentation",
        url: "https://react.dev/reference/react",
        type: "documentation"
      },
      {
        title: "WAI-ARIA Authoring Practices",
        url: "https://www.w3.org/WAI/ARIA/apg/",
        type: "documentation"
      }
    ]
  },
  {
    question: "# Database: Design a Database Schema for an E-commerce Platform\n\nDesign a relational database schema for an e-commerce platform that supports:\n\n* User management (customers, sellers, admins)\n* Product catalog with categories and variants\n* Shopping cart\n* Order management\n* Payment processing\n* Reviews and ratings\n* Inventory tracking\n\nInclude indexes, constraints, and normalization decisions.",
    answer: "## Database Schema Design\n\n### Core Tables\n\n```sql\n-- Users Table\nCREATE TABLE users (\n    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    email VARCHAR(255) UNIQUE NOT NULL,\n    password_hash VARCHAR(255) NOT NULL,\n    first_name VARCHAR(100),\n    last_name VARCHAR(100),\n    role VARCHAR(20) CHECK (role IN ('customer', 'seller', 'admin')),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_email (email),\n    INDEX idx_role (role)\n);\n\n-- Categories Table\nCREATE TABLE categories (\n    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    name VARCHAR(100) NOT NULL,\n    slug VARCHAR(100) UNIQUE NOT NULL,\n    parent_id UUID REFERENCES categories(category_id),\n    description TEXT,\n    INDEX idx_slug (slug),\n    INDEX idx_parent (parent_id)\n);\n\n-- Products Table\nCREATE TABLE products (\n    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    seller_id UUID REFERENCES users(user_id),\n    category_id UUID REFERENCES categories(category_id),\n    name VARCHAR(255) NOT NULL,\n    slug VARCHAR(255) UNIQUE NOT NULL,\n    description TEXT,\n    base_price DECIMAL(10, 2) NOT NULL,\n    is_active BOOLEAN DEFAULT true,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_seller (seller_id),\n    INDEX idx_category (category_id),\n    INDEX idx_slug (slug),\n    INDEX idx_active (is_active)\n);\n\n-- Product Variants (e.g., size, color)\nCREATE TABLE product_variants (\n    variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,\n    sku VARCHAR(100) UNIQUE NOT NULL,\n    name VARCHAR(100), -- e.g., \"Large Red\"\n    price DECIMAL(10, 2) NOT NULL,\n    stock_quantity INT NOT NULL DEFAULT 0,\n    attributes JSONB, -- {\"size\": \"L\", \"color\": \"red\"}\n    INDEX idx_product (product_id),\n    INDEX idx_sku (sku),\n    CONSTRAINT positive_stock CHECK (stock_quantity >= 0)\n);\n\n-- Shopping Cart\nCREATE TABLE cart_items (\n    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,\n    variant_id UUID REFERENCES product_variants(variant_id),\n    quantity INT NOT NULL DEFAULT 1,\n    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_user (user_id),\n    CONSTRAINT positive_quantity CHECK (quantity > 0),\n    UNIQUE(user_id, variant_id)\n);\n\n-- Orders\nCREATE TABLE orders (\n    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID REFERENCES users(user_id),\n    status VARCHAR(20) CHECK (status IN (\n        'pending', 'processing', 'shipped', 'delivered', 'cancelled'\n    )),\n    subtotal DECIMAL(10, 2) NOT NULL,\n    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,\n    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,\n    total DECIMAL(10, 2) NOT NULL,\n    shipping_address JSONB NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_user (user_id),\n    INDEX idx_status (status),\n    INDEX idx_created (created_at)\n);\n\n-- Order Items\nCREATE TABLE order_items (\n    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,\n    variant_id UUID REFERENCES product_variants(variant_id),\n    quantity INT NOT NULL,\n    price_at_purchase DECIMAL(10, 2) NOT NULL,\n    INDEX idx_order (order_id)\n);\n\n-- Payments\nCREATE TABLE payments (\n    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    order_id UUID REFERENCES orders(order_id),\n    amount DECIMAL(10, 2) NOT NULL,\n    payment_method VARCHAR(50),\n    status VARCHAR(20) CHECK (status IN (\n        'pending', 'completed', 'failed', 'refunded'\n    )),\n    transaction_id VARCHAR(255),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_order (order_id),\n    INDEX idx_status (status)\n);\n\n-- Reviews\nCREATE TABLE reviews (\n    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,\n    user_id UUID REFERENCES users(user_id),\n    order_id UUID REFERENCES orders(order_id),\n    rating INT CHECK (rating >= 1 AND rating <= 5),\n    title VARCHAR(200),\n    comment TEXT,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_product (product_id),\n    INDEX idx_user (user_id),\n    INDEX idx_rating (rating),\n    UNIQUE(order_id, product_id, user_id) -- One review per product per order\n);\n\n-- Inventory Logs (for tracking)\nCREATE TABLE inventory_logs (\n    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    variant_id UUID REFERENCES product_variants(variant_id),\n    change_type VARCHAR(20) CHECK (change_type IN (\n        'restock', 'sale', 'return', 'adjustment'\n    )),\n    quantity_change INT NOT NULL,\n    reason TEXT,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    INDEX idx_variant (variant_id),\n    INDEX idx_created (created_at)\n);\n```\n\n## Key Design Decisions\n\n### 1. Normalization (3NF)\n* Separate tables for products and variants\n* Categories support hierarchy with parent_id\n* Order items store price_at_purchase (denormalization for historical accuracy)\n\n### 2. Indexes\n* Foreign keys automatically indexed\n* Common query patterns (email, slug, status)\n* Composite indexes where needed\n\n### 3. Data Integrity\n* CHECK constraints for valid values\n* UNIQUE constraints to prevent duplicates\n* CASCADE deletes where appropriate\n* NOT NULL for required fields\n\n### 4. Performance Optimizations\n* JSONB for flexible attributes\n* Selective denormalization (price_at_purchase)\n* Strategic indexes\n\n### 5. Scalability Considerations\n* UUID for distributed system compatibility\n* Partitioning strategy for orders by date\n* Read replicas for product catalog\n* Caching layer for frequent queries\n\n## Common Queries\n\n```sql\n-- Get product with average rating\nSELECT \n    p.*,\n    AVG(r.rating) as avg_rating,\n    COUNT(r.review_id) as review_count\nFROM products p\nLEFT JOIN reviews r ON p.product_id = r.product_id\nWHERE p.is_active = true\nGROUP BY p.product_id;\n\n-- Get user's cart with product details\nSELECT \n    ci.*,\n    p.name,\n    pv.price,\n    pv.stock_quantity\nFROM cart_items ci\nJOIN product_variants pv ON ci.variant_id = pv.variant_id\nJOIN products p ON pv.product_id = p.product_id\nWHERE ci.user_id = ?;\n\n-- Get order history with items\nSELECT \n    o.*,\n    json_agg(\n        json_build_object(\n            'product_name', p.name,\n            'quantity', oi.quantity,\n            'price', oi.price_at_purchase\n        )\n    ) as items\nFROM orders o\nJOIN order_items oi ON o.order_id = oi.order_id\nJOIN product_variants pv ON oi.variant_id = pv.variant_id\nJOIN products p ON pv.product_id = p.product_id\nWHERE o.user_id = ?\nGROUP BY o.order_id;\n```",
    category: "database",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companyName: "Amazon",
    topicTags: [
      "Database Design",
      "SQL",
      "Normalization",
      "Indexing",
      "E-commerce",
      "PostgreSQL"
    ],
    languages: ["SQL"],
    databases: ["PostgreSQL", "MySQL"],
    cloudProviders: [],
    frontendFrameworks: [],
    backendFrameworks: [],
    learningResources: [
      {
        title: "PostgreSQL Documentation",
        url: "https://www.postgresql.org/docs/",
        type: "documentation"
      },
      {
        title: "Database Design for E-commerce",
        url: "https://www.sqlshack.com/designing-database-e-commerce-application/",
        type: "article"
      }
    ]
  },
  {
    question: "# Behavioral: Tell me about a time when you had a conflict with a team member\n\nDescribe a situation where you had a disagreement or conflict with a colleague. How did you handle it, and what was the outcome?",
    answer: "## STAR Method Framework\n\n### Situation\nProvide context about the team, project, and relationship with the team member.\n\n### Task\nExplain what needed to be accomplished and what was at stake.\n\n### Action\nDescribe the specific steps you took to address the conflict:\n\n1. **Recognized the Issue Early**\n   - Noticed communication breakdown\n   - Acknowledged different perspectives\n\n2. **Initiated Private Conversation**\n   - Chose appropriate time/place\n   - Approached with curiosity, not judgment\n\n3. **Active Listening**\n   - Let them fully explain their viewpoint\n   - Asked clarifying questions\n   - Showed empathy\n\n4. **Found Common Ground**\n   - Identified shared goals\n   - Acknowledged valid points in their perspective\n\n5. **Proposed Solutions**\n   - Brainstormed together\n   - Looked for win-win outcomes\n   - Made compromises where appropriate\n\n6. **Followed Up**\n   - Checked in after implementation\n   - Maintained positive relationship\n\n### Result\nDescribe the positive outcome:\n\n* Project completed successfully\n* Improved working relationship\n* Learned valuable lessons\n* Team became stronger\n\n## Example Response\n\n> \"During a product launch at my previous company, I had a conflict with our backend engineer about API design. I wanted to use GraphQL for flexibility, while they insisted on REST for simplicity and their team's expertise.\n>\n> Initially, we were both dug in on our positions. I realized this wasn't productive, so I scheduled a one-on-one coffee chat. I asked them to walk me through their concerns in detail. They explained their team had tight deadlines and limited GraphQL experience, making REST lower risk.\n>\n> I acknowledged these were valid concerns I hadn't fully considered. Together, we explored a hybrid approach: using REST for the initial launch with well-documented endpoints that could be wrapped in a GraphQL layer later. This gave us both what we needed - their team could move quickly, and we had a path to the flexibility I wanted.\n>\n> We implemented the solution, launched on time, and six months later successfully migrated to GraphQL. The experience taught me to dig deeper into concerns rather than defending my position, and our working relationship improved significantly.\"\n\n## Key Points to Emphasize\n\n* **Emotional Intelligence** - Self-awareness and empathy\n* **Communication Skills** - Active listening and clear expression\n* **Problem-Solving** - Focus on solutions, not blame\n* **Professionalism** - Kept it constructive and respectful\n* **Growth Mindset** - Learned from the experience\n\n## Common Mistakes to Avoid\n\n* Blaming the other person\n* Making yourself look perfect\n* Avoiding responsibility\n* Being too vague\n* Not showing resolution\n* Badmouthing previous colleagues",
    category: "behavioral",
    difficulty: "medium",
    companyLogo: "SiApple",
    companyName: "Apple",
    topicTags: [
      "Conflict Resolution",
      "Communication",
      "Teamwork",
      "Emotional Intelligence",
      "STAR Method"
    ],
    languages: [],
    databases: [],
    cloudProviders: [],
    frontendFrameworks: [],
    backendFrameworks: [],
    learningResources: [
      {
        title: "STAR Method Guide",
        url: "https://www.themuse.com/advice/star-interview-method",
        type: "article"
      },
      {
        title: "Behavioral Interview Questions",
        url: "https://www.amazon.jobs/en/landing_pages/interviewing-at-amazon",
        type: "guide"
      }
    ]
  },
  {
    question: "# Backend: Design a Rate Limiting System\n\nImplement a rate limiter that restricts the number of requests a client can make to an API. Requirements:\n\n* Support different rate limits per endpoint\n* Handle distributed systems (multiple servers)\n* Provide clear feedback to clients\n* Be performant and scalable\n\nDiscuss algorithms and trade-offs.",
    answer: "## Rate Limiting Algorithms\n\n### 1. Token Bucket Algorithm (Recommended)\n\n**Concept:** Each user has a bucket with tokens. Each request consumes a token. Tokens refill at a constant rate.\n\n```python\nimport time\nimport redis\nfrom typing import Tuple\n\nclass TokenBucketRateLimiter:\n    def __init__(self, redis_client: redis.Redis):\n        self.redis = redis_client\n    \n    def is_allowed(\n        self,\n        user_id: str,\n        max_tokens: int = 100,\n        refill_rate: float = 10.0,  # tokens per second\n        endpoint: str = 'default'\n    ) -> Tuple[bool, dict]:\n        \"\"\"\n        Check if request is allowed.\n        Returns (is_allowed, metadata)\n        \"\"\"\n        key = f\"rate_limit:{endpoint}:{user_id}\"\n        now = time.time()\n        \n        # Lua script for atomic operations\n        lua_script = \"\"\"\n        local key = KEYS[1]\n        local max_tokens = tonumber(ARGV[1])\n        local refill_rate = tonumber(ARGV[2])\n        local now = tonumber(ARGV[3])\n        \n        local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')\n        local tokens = tonumber(bucket[1])\n        local last_refill = tonumber(bucket[2])\n        \n        if tokens == nil then\n            tokens = max_tokens\n            last_refill = now\n        else\n            -- Calculate tokens to add based on time elapsed\n            local time_passed = now - last_refill\n            local tokens_to_add = time_passed * refill_rate\n            tokens = math.min(max_tokens, tokens + tokens_to_add)\n            last_refill = now\n        end\n        \n        local allowed = 0\n        if tokens >= 1 then\n            tokens = tokens - 1\n            allowed = 1\n        end\n        \n        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)\n        redis.call('EXPIRE', key, 3600)\n        \n        return {allowed, tokens}\n        \"\"\"\n        \n        result = self.redis.eval(\n            lua_script,\n            1,\n            key,\n            max_tokens,\n            refill_rate,\n            now\n        )\n        \n        is_allowed = bool(result[0])\n        remaining_tokens = int(result[1])\n        \n        metadata = {\n            'remaining': remaining_tokens,\n            'limit': max_tokens,\n            'reset': int(now + (max_tokens - remaining_tokens) / refill_rate)\n        }\n        \n        return is_allowed, metadata\n\n# Usage in API endpoint\nfrom fastapi import FastAPI, HTTPException, Request\nfrom fastapi.responses import JSONResponse\n\napp = FastAPI()\nredis_client = redis.Redis(host='localhost', port=6379)\nrate_limiter = TokenBucketRateLimiter(redis_client)\n\n@app.middleware(\"http\")\nasync def rate_limit_middleware(request: Request, call_next):\n    user_id = request.headers.get('X-User-ID', 'anonymous')\n    endpoint = request.url.path\n    \n    # Different limits per endpoint\n    limits = {\n        '/api/search': (10, 1.0),      # 10 req, 1 per second\n        '/api/upload': (5, 0.1),        # 5 req, 1 per 10 seconds\n        'default': (100, 10.0)          # 100 req, 10 per second\n    }\n    \n    max_tokens, refill_rate = limits.get(endpoint, limits['default'])\n    \n    is_allowed, metadata = rate_limiter.is_allowed(\n        user_id=user_id,\n        max_tokens=max_tokens,\n        refill_rate=refill_rate,\n        endpoint=endpoint\n    )\n    \n    if not is_allowed:\n        return JSONResponse(\n            status_code=429,\n            content={\n                'error': 'Rate limit exceeded',\n                'retry_after': metadata['reset'] - int(time.time())\n            },\n            headers={\n                'X-RateLimit-Limit': str(metadata['limit']),\n                'X-RateLimit-Remaining': str(metadata['remaining']),\n                'X-RateLimit-Reset': str(metadata['reset']),\n                'Retry-After': str(metadata['reset'] - int(time.time()))\n            }\n        )\n    \n    response = await call_next(request)\n    \n    # Add rate limit headers to response\n    response.headers['X-RateLimit-Limit'] = str(metadata['limit'])\n    response.headers['X-RateLimit-Remaining'] = str(metadata['remaining'])\n    response.headers['X-RateLimit-Reset'] = str(metadata['reset'])\n    \n    return response\n```\n\n### 2. Sliding Window Log\n\n**Concept:** Track timestamp of each request in a time window.\n\n```python\ndef sliding_window_log(\n    redis_client: redis.Redis,\n    user_id: str,\n    limit: int = 100,\n    window_seconds: int = 60\n) -> bool:\n    key = f\"rate_limit:log:{user_id}\"\n    now = time.time()\n    window_start = now - window_seconds\n    \n    pipe = redis_client.pipeline()\n    \n    # Remove old entries\n    pipe.zremrangebyscore(key, 0, window_start)\n    \n    # Count current requests\n    pipe.zcard(key)\n    \n    # Add current request\n    pipe.zadd(key, {str(now): now})\n    \n    # Set expiry\n    pipe.expire(key, window_seconds)\n    \n    results = pipe.execute()\n    request_count = results[1]\n    \n    return request_count < limit\n```\n\n## Comparison of Algorithms\n\n| Algorithm | Memory | Accuracy | Distributed | Use Case |\n|-----------|--------|----------|-------------|----------|\n| **Token Bucket** | O(1) | Good | Yes (Redis) | General purpose, bursty traffic |\n| **Leaky Bucket** | O(1) | Good | Yes | Smooth rate, queue requests |\n| **Fixed Window** | O(1) | Poor | Yes | Simple, edge case issues |\n| **Sliding Window** | O(n) | Excellent | Yes | Strict enforcement |\n| **Sliding Log** | O(n) | Perfect | Yes | High accuracy needed |\n\n## Architecture for Distributed Systems\n\n```\n┌─────────────┐\n│   Client    │\n└──────┬──────┘\n       │\n       ▼\n┌─────────────┐      ┌──────────────┐\n│ Load Balancer│─────▶│  API Server 1 │\n└──────┬──────┘      └───────┬───────┘\n       │                     │\n       │             ┌───────▼───────┐\n       │             │  API Server 2 │\n       │             └───────┬───────┘\n       │                     │\n       │             ┌───────▼───────┐\n       └────────────▶│  Redis Cluster│\n                     │  (Rate Limits)│\n                     └───────────────┘\n```\n\n## Key Considerations\n\n### 1. Headers to Return\n```\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 42\nX-RateLimit-Reset: 1640000000\nRetry-After: 30\n```\n\n### 2. Error Response\n```json\n{\n  \"error\": \"rate_limit_exceeded\",\n  \"message\": \"Too many requests\",\n  \"retry_after\": 30,\n  \"limit\": 100,\n  \"window\": 60\n}\n```\n\n### 3. User Identification\n* API Key\n* JWT token\n* IP address (less reliable)\n* User ID\n\n### 4. Different Tiers\n```python\nRATE_LIMITS = {\n    'free': (100, 60),      # 100 requests per minute\n    'basic': (1000, 60),    # 1000 requests per minute\n    'premium': (10000, 60), # 10000 requests per minute\n}\n```\n\n## Trade-offs\n\n**Token Bucket Pros:**\n* Memory efficient\n* Allows bursts\n* Simple to implement\n\n**Token Bucket Cons:**\n* Approximate (race conditions possible)\n* May allow slightly more than limit\n\n**Sliding Window Log Pros:**\n* Perfect accuracy\n* No edge cases\n\n**Sliding Window Log Cons:**\n* Higher memory usage\n* More Redis operations",
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiStripe",
    companyName: "Stripe",
    topicTags: [
      "Rate Limiting",
      "Distributed Systems",
      "Redis",
      "API Design",
      "Algorithms",
      "System Architecture"
    ],
    languages: ["Python", "Go"],
    databases: ["Redis"],
    cloudProviders: ["AWS", "GCP"],
    frontendFrameworks: [],
    backendFrameworks: ["FastAPI", "Express"],
    learningResources: [
      {
        title: "Redis Rate Limiting",
        url: "https://redis.io/docs/manual/patterns/rate-limiter/",
        type: "documentation"
      },
      {
        title: "Token Bucket Algorithm",
        url: "https://en.wikipedia.org/wiki/Token_bucket",
        type: "article"
      }
    ]
  },
  {
    question: "## CSS/Responsive Design: Create a Responsive Navigation Bar\n\nBuild a responsive navigation bar that:\n\n* Shows full menu on desktop\n* Collapses to hamburger menu on mobile\n* Smooth animations\n* Accessible (keyboard navigation, screen readers)\n* Sticky on scroll\n* No JavaScript (CSS only preferred, or minimal JS)\n\nProvide HTML, CSS, and explain your approach.",
    answer: "## Pure CSS Solution (Modern Approach)\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Responsive Navigation</title>\n    <style>\n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n        }\n\n        body {\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n        }\n\n        /* Navigation Container */\n        nav {\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            position: sticky;\n            top: 0;\n            z-index: 1000;\n            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n        }\n\n        .nav-container {\n            max-width: 1200px;\n            margin: 0 auto;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding: 1rem 2rem;\n        }\n\n        /* Logo */\n        .logo {\n            font-size: 1.5rem;\n            font-weight: bold;\n            color: white;\n            text-decoration: none;\n        }\n\n        /* Desktop Menu */\n        .nav-menu {\n            display: flex;\n            gap: 2rem;\n            list-style: none;\n        }\n\n        .nav-menu a {\n            color: white;\n            text-decoration: none;\n            padding: 0.5rem 1rem;\n            border-radius: 4px;\n            transition: all 0.3s ease;\n            position: relative;\n        }\n\n        .nav-menu a::after {\n            content: '';\n            position: absolute;\n            bottom: 0;\n            left: 50%;\n            transform: translateX(-50%);\n            width: 0;\n            height: 2px;\n            background: white;\n            transition: width 0.3s ease;\n        }\n\n        .nav-menu a:hover::after,\n        .nav-menu a:focus::after {\n            width: 80%;\n        }\n\n        .nav-menu a:hover,\n        .nav-menu a:focus {\n            background: rgba(255, 255, 255, 0.1);\n            outline: none;\n        }\n\n        /* Hamburger Menu (Hidden Checkbox) */\n        #menu-toggle {\n            display: none;\n        }\n\n        .hamburger {\n            display: none;\n            flex-direction: column;\n            cursor: pointer;\n            gap: 4px;\n        }\n\n        .hamburger span {\n            width: 25px;\n            height: 3px;\n            background: white;\n            border-radius: 3px;\n            transition: all 0.3s ease;\n        }\n\n        /* Mobile Styles */\n        @media (max-width: 768px) {\n            .hamburger {\n                display: flex;\n            }\n\n            .nav-menu {\n                position: absolute;\n                top: 100%;\n                left: 0;\n                width: 100%;\n                flex-direction: column;\n                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n                padding: 1rem 0;\n                gap: 0;\n                max-height: 0;\n                overflow: hidden;\n                transition: max-height 0.3s ease;\n            }\n\n            .nav-menu li {\n                opacity: 0;\n                transform: translateY(-20px);\n                transition: all 0.3s ease;\n            }\n\n            .nav-menu a {\n                display: block;\n                padding: 1rem 2rem;\n                border-radius: 0;\n            }\n\n            .nav-menu a::after {\n                display: none;\n            }\n\n            /* Checked State */\n            #menu-toggle:checked ~ .nav-menu {\n                max-height: 400px;\n            }\n\n            #menu-toggle:checked ~ .nav-menu li {\n                opacity: 1;\n                transform: translateY(0);\n            }\n\n            /* Stagger animation for menu items */\n            #menu-toggle:checked ~ .nav-menu li:nth-child(1) {\n                transition-delay: 0.1s;\n            }\n            #menu-toggle:checked ~ .nav-menu li:nth-child(2) {\n                transition-delay: 0.2s;\n            }\n            #menu-toggle:checked ~ .nav-menu li:nth-child(3) {\n                transition-delay: 0.3s;\n            }\n            #menu-toggle:checked ~ .nav-menu li:nth-child(4) {\n                transition-delay: 0.4s;\n            }\n\n            /* Hamburger Animation */\n            #menu-toggle:checked ~ .hamburger span:nth-child(1) {\n                transform: rotate(45deg) translateY(8px);\n            }\n\n            #menu-toggle:checked ~ .hamburger span:nth-child(2) {\n                opacity: 0;\n            }\n\n            #menu-toggle:checked ~ .hamburger span:nth-child(3) {\n                transform: rotate(-45deg) translateY(-8px);\n            }\n        }\n\n        /* Focus styles for accessibility */\n        .hamburger:focus-within {\n            outline: 2px solid white;\n            outline-offset: 4px;\n        }\n\n        /* Active link */\n        .nav-menu a.active {\n            background: rgba(255, 255, 255, 0.2);\n        }\n\n        /* Content for demo */\n        .content {\n            padding: 4rem 2rem;\n            max-width: 1200px;\n            margin: 0 auto;\n        }\n\n        .content h1 {\n            margin-bottom: 1rem;\n            color: #333;\n        }\n\n        .content p {\n            line-height: 1.6;\n            color: #666;\n            margin-bottom: 1rem;\n        }\n    </style>\n</head>\n<body>\n    <nav>\n        <div class=\"nav-container\">\n            <a href=\"#\" class=\"logo\">MyBrand</a>\n            \n            <input type=\"checkbox\" id=\"menu-toggle\" aria-label=\"Toggle menu\">\n            <label for=\"menu-toggle\" class=\"hamburger\" tabindex=\"0\">\n                <span></span>\n                <span></span>\n                <span></span>\n            </label>\n            \n            <ul class=\"nav-menu\">\n                <li><a href=\"#home\" class=\"active\">Home</a></li>\n                <li><a href=\"#about\">About</a></li>\n                <li><a href=\"#services\">Services</a></li>\n                <li><a href=\"#contact\">Contact</a></li>\n            </ul>\n        </div>\n    </nav>\n\n    <div class=\"content\">\n        <h1>Responsive Navigation Demo</h1>\n        <p>This navigation bar is fully responsive and accessible. Try resizing your browser window to see the hamburger menu in action.</p>\n        <p>Scroll down to see the sticky navigation behavior.</p>\n        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>\n        <!-- Add more content to test sticky behavior -->\n    </div>\n</body>\n</html>\n```\n\n## Key Features Explained\n\n### 1. **Pure CSS Toggle**\nUsing a hidden checkbox and label to control menu state without JavaScript:\n```css\n#menu-toggle:checked ~ .nav-menu {\n    max-height: 400px;\n}\n```\n\n### 2. **Smooth Animations**\n* Max-height transition for smooth open/close\n* Staggered fade-in for menu items\n* Hamburger icon animation to X\n\n### 3. **Sticky Navigation**\n```css\nposition: sticky;\ntop: 0;\nz-index: 1000;\n```\n\n### 4. **Accessibility Features**\n* Semantic HTML (`<nav>`, `<ul>`, `<li>`)\n* ARIA labels on checkbox\n* Keyboard navigation support\n* Focus styles\n* Sufficient color contrast\n\n### 5. **Responsive Breakpoint**\nMobile menu activates at 768px:\n```css\n@media (max-width: 768px) { ... }\n```\n\n## Alternative: With Minimal JavaScript\n\nFor better browser support and enhanced features:\n\n```javascript\n// Optional: Close menu when clicking outside\ndocument.addEventListener('click', (e) => {\n    const nav = document.querySelector('nav');\n    const checkbox = document.getElementById('menu-toggle');\n    \n    if (!nav.contains(e.target) && checkbox.checked) {\n        checkbox.checked = false;\n    }\n});\n\n// Optional: Close menu when clicking a link\ndocument.querySelectorAll('.nav-menu a').forEach(link => {\n    link.addEventListener('click', () => {\n        document.getElementById('menu-toggle').checked = false;\n    });\n});\n\n// Optional: Handle active link on scroll\nconst sections = document.querySelectorAll('section[id]');\nconst navLinks = document.querySelectorAll('.nav-menu a');\n\nwindow.addEventListener('scroll', () => {\n    let current = '';\n    \n    sections.forEach(section => {\n        const sectionTop = section.offsetTop;\n        if (scrollY >= sectionTop - 60) {\n            current = section.getAttribute('id');\n        }\n    });\n    \n    navLinks.forEach(link => {\n        link.classList.remove('active');\n        if (link.getAttribute('href').slice(1) === current) {\n            link.classList.add('active');\n        }\n    });\n});\n```\n\n## Browser Support\n\n* ✅ Chrome/Edge (modern)\n* ✅ Firefox (modern)\n* ✅ Safari 12+\n* ⚠️ IE11 (needs flexbox prefixes)\n\n## Performance Considerations\n\n* Uses CSS transforms (GPU accelerated)\n* Minimal repaints/reflows\n* No JavaScript bundle required\n* Lazy-loads menu items on mobile",
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiNetflix",
    companyName: "Netflix",
    topicTags: [
      "CSS",
      "Responsive Design",
      "Accessibility",
      "HTML",
      "Mobile First",
      "Animations"
    ],
    languages: ["CSS", "HTML", "JavaScript"],
    databases: [],
    cloudProviders: [],
    frontendFrameworks: [],
    backendFrameworks: [],
    learningResources: [
      {
        title: "CSS Tricks - Responsive Navigation",
        url: "https://css-tricks.com/responsive-navigation-bar/",
        type: "article"
      },
      {
        title: "MDN - Responsive Design",
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
        type: "documentation"
      }
    ]
  }
];

async function seedQuestions() {
  console.log('🌱 Starting database seeding...\n');

  try {
    const questionsRef = db.collection('practice-questions');
    
    // Process in batches (Firestore batch limit is 500 operations)
    const BATCH_SIZE = 500;
    const batches: any[] = [];
    
    for (let i = 0; i < sampleQuestions.length; i += BATCH_SIZE) {
      batches.push(sampleQuestions.slice(i, i + BATCH_SIZE));
    }

    let totalAdded = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = db.batch();
      const currentBatch = batches[batchIndex];

      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length}...`);

      currentBatch.forEach((question : PracticeQuestion) => {
        const docRef = questionsRef.doc(); // Auto-generate ID
        batch.set(docRef, {
          ...question,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log(`  ➕ Queued: ${question.companyName} - ${question.category}`);
      });

      // Commit the batch
      await batch.commit();
      totalAdded += currentBatch.length;
      console.log(`  ✅ Batch ${batchIndex + 1} committed successfully!\n`);
    }

    console.log('='.repeat(50));
    console.log(`🎉 Seeding complete!`);
    console.log(`✅ Successfully added: ${totalAdded} questions`);
    console.log(`📊 Total batches: ${batches.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedQuestions()
  .then(() => {
    console.log('\n✨ All done! Check your Firebase Console to verify.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });