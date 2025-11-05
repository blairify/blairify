/**
 * Massive Question Bank - 150+ Unique Questions
 * Run: npx ts-node scripts/seed-interview-questions.ts
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
  // ==================== ARRAYS & STRINGS ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Remove Duplicates from Array",
    question:
      "Remove duplicates from sorted array in-place. Return new length. [1,1,2,2,3] → 3, array becomes [1,2,3,_,_]",
    answer:
      "Two pointers. Slow pointer tracks unique position. Fast pointer scans. O(n) time, O(1) space.",
    topicTags: ["arrays", "two-pointers", "in-place"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Best Time to Buy Stock",
    question:
      "Find max profit from one buy and one sell. Prices = [7,1,5,3,6,4] → 5 (buy at 1, sell at 6)",
    answer:
      "Track min price seen. Calculate profit at each price. Keep max profit. O(n) time, O(1) space.",
    topicTags: ["arrays", "greedy", "dynamic-programming"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Merge Sorted Arrays",
    question:
      "Merge nums1=[1,2,3,0,0,0] and nums2=[2,5,6] into nums1. First array has extra space.",
    answer:
      "Start from end of both arrays. Compare and place largest at end of nums1. Work backwards. O(m+n) time.",
    topicTags: ["arrays", "two-pointers", "merge"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiFacebook",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Find Missing Number",
    question:
      "Array contains n distinct numbers from 0 to n. Find the missing number. [3,0,1] → 2",
    answer:
      "XOR all numbers 0 to n with array elements. Result is missing number. Or use sum formula. O(n) time.",
    topicTags: ["arrays", "bit-manipulation", "math"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Container With Most Water",
    question:
      "Given heights array, find two lines that form container with max water. [1,8,6,2,5,4,8,3,7] → 49",
    answer:
      "Two pointers at ends. Move pointer with smaller height inward. Track max area. O(n) time.",
    topicTags: ["two-pointers", "greedy", "arrays"],
    seniorityLevel: ["junior", "mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["javascript"],
    title: "3Sum Problem",
    question:
      "Find all unique triplets in array that sum to zero. [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]",
    answer:
      "Sort array. Fix first element, use two pointers for rest. Skip duplicates. O(n²) time.",
    topicTags: ["arrays", "two-pointers", "sorting"],
    seniorityLevel: ["junior", "mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiUber",
    companySize: ["unicorn"],
    primaryTechStack: ["python"],
    title: "Longest Palindromic Substring",
    question:
      "Find longest palindromic substring in string. 'babad' → 'bab' or 'aba'",
    answer:
      "Expand around center. Try each position as center (odd and even length). O(n²) time.",
    topicTags: ["strings", "dynamic-programming", "expand-center"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiLinkedin",
    companySize: ["large"],
    primaryTechStack: ["java"],
    title: "Product of Array Except Self",
    question:
      "Return array where output[i] equals product of all elements except nums[i]. No division. [1,2,3,4] → [24,12,8,6]",
    answer:
      "Left products pass, then right products pass. Multiply results. O(n) time, O(1) extra space.",
    topicTags: ["arrays", "prefix-sum", "math"],
    seniorityLevel: ["mid"],
  },

  // ==================== LINKED LISTS ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Reverse Linked List",
    question: "Reverse a singly linked list. 1→2→3→4→5 becomes 5→4→3→2→1",
    answer:
      "Three pointers: prev, curr, next. Reverse links iteratively. O(n) time, O(1) space.",
    topicTags: ["linked-list", "pointers", "iterative"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Middle of Linked List",
    question:
      "Find middle node of linked list. If two middles, return second. [1,2,3,4,5] → 3",
    answer:
      "Fast and slow pointers. Fast moves 2x speed. When fast reaches end, slow is at middle. O(n) time.",
    topicTags: ["linked-list", "two-pointers", "fast-slow"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Remove Nth Node From End",
    question:
      "Remove nth node from end of list in one pass. [1,2,3,4,5], n=2 → [1,2,3,5]",
    answer:
      "Two pointers n steps apart. Move both until first reaches end. Second is at target. O(n) time.",
    topicTags: ["linked-list", "two-pointers"],
    seniorityLevel: ["junior", "mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Add Two Numbers as Lists",
    question:
      "Two numbers as linked lists in reverse. Add them. [2,4,3] + [5,6,4] → [7,0,8] (342 + 465 = 807)",
    answer:
      "Traverse both lists simultaneously. Add digits with carry. Create new nodes. O(max(m,n)) time.",
    topicTags: ["linked-list", "math", "carry"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Merge K Sorted Lists Alternative",
    question: "Merge k sorted lists using divide and conquer approach.",
    answer:
      "Merge pairs recursively. Merge(merge(L1,L2), merge(L3,L4)). O(N log k) time where N is total nodes.",
    topicTags: ["linked-list", "divide-conquer", "merge"],
    seniorityLevel: ["senior"],
  },

  // ==================== TREES ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Max Depth of Binary Tree",
    question:
      "Find maximum depth of binary tree. Depth is number of nodes from root to farthest leaf.",
    answer:
      "Recursion: max(depth(left), depth(right)) + 1. Base case: null = 0. O(n) time.",
    topicTags: ["tree", "recursion", "dfs"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Same Tree",
    question:
      "Check if two binary trees are structurally identical with same values.",
    answer:
      "Recursion: both null OR values equal AND left subtrees same AND right subtrees same. O(n) time.",
    topicTags: ["tree", "recursion", "comparison"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Invert Binary Tree",
    question:
      "Invert/flip binary tree horizontally. Swap left and right children recursively.",
    answer:
      "Post-order recursion. Invert left and right subtrees, then swap them. O(n) time.",
    topicTags: ["tree", "recursion", "transformation"],
    seniorityLevel: ["junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiFacebook",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Validate Binary Search Tree",
    question:
      "Check if binary tree is valid BST. All left descendants < node < all right descendants.",
    answer:
      "Pass min/max bounds down recursion. Node must be in (min, max). Update bounds for children. O(n) time.",
    topicTags: ["tree", "bst", "validation"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["python"],
    title: "Lowest Common Ancestor",
    question: "Find lowest common ancestor of two nodes in BST.",
    answer:
      "If both nodes < root, search left. If both > root, search right. Else root is LCA. O(h) time.",
    topicTags: ["tree", "bst", "recursion"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Binary Tree Maximum Path Sum",
    question:
      "Find maximum path sum in binary tree. Path can start and end at any node.",
    answer:
      "Post-order recursion. At each node: max(left+node, right+node, left+node+right). Track global max. O(n) time.",
    topicTags: ["tree", "recursion", "path-sum"],
    seniorityLevel: ["senior"],
  },

  // ==================== DYNAMIC PROGRAMMING ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Climbing Stairs",
    question:
      "Climb n stairs. Can take 1 or 2 steps. How many distinct ways? n=3 → 3 ways",
    answer:
      "Fibonacci. dp[i] = dp[i-1] + dp[i-2]. Can optimize to O(1) space with two variables.",
    topicTags: ["dynamic-programming", "fibonacci", "recursion"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "House Robber",
    question:
      "Rob houses in line. Can't rob adjacent houses. Maximize stolen amount. [2,7,9,3,1] → 12",
    answer:
      "dp[i] = max(dp[i-1], nums[i] + dp[i-2]). Choose rob current or skip. O(n) time.",
    topicTags: ["dynamic-programming", "optimization"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Unique Paths",
    question:
      "Robot in m×n grid. Can only move right or down. Count paths to bottom-right.",
    answer:
      "dp[i][j] = dp[i-1][j] + dp[i][j-1]. Or use combinatorics: C(m+n-2, m-1). O(m*n) time.",
    topicTags: ["dynamic-programming", "grid", "combinatorics"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Burst Balloons",
    question:
      "Pop balloons to maximize coins. Popping balloon i gives nums[i-1]*nums[i]*nums[i+1] coins.",
    answer:
      "Reverse thinking: last balloon to pop. dp[i][j] = max coins from range. O(n³) time.",
    topicTags: ["dynamic-programming", "interval-dp"],
    seniorityLevel: ["senior"],
  },

  // ==================== GRAPHS ====================
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiFacebook",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Number of Islands",
    question:
      "Count islands in 2D grid. 1=land, 0=water. Connected 1s form island. [[1,1,0],[1,0,0],[0,0,1]] → 2",
    answer:
      "DFS/BFS from each unvisited land cell. Mark visited. Count connected components. O(m*n) time.",
    topicTags: ["graph", "dfs", "bfs", "connected-components"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiUber",
    companySize: ["unicorn"],
    primaryTechStack: ["java"],
    title: "Course Schedule",
    question:
      "n courses, some have prerequisites. Can you finish all? [[1,0],[2,1]] means 0→1→2",
    answer:
      "Detect cycle in directed graph. Topological sort or DFS with three colors. O(V+E) time.",
    topicTags: ["graph", "topological-sort", "cycle-detection"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Word Ladder II",
    question: "Find all shortest transformation sequences. Return all paths.",
    answer:
      "BFS to find shortest distance. Backtrack from end using distances. O(N * 26^L) time where L is word length.",
    topicTags: ["graph", "bfs", "backtracking"],
    seniorityLevel: ["senior"],
  },

  // ==================== BACKTRACKING ====================
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Generate Parentheses",
    question:
      "Generate all valid combinations of n pairs of parentheses. n=3 → ['((()))','(()())','(())()','()(())','()()()']",
    answer:
      "Backtrack. Add '(' if count < n. Add ')' if ')' count < '(' count. O(4^n / sqrt(n)) time.",
    topicTags: ["backtracking", "strings", "recursion"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Subsets",
    question:
      "Generate all subsets of array. [1,2,3] → [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
    answer:
      "Backtrack. For each element, include or exclude. Or iterative: add each element to existing subsets. O(2^n) time.",
    topicTags: ["backtracking", "recursion", "power-set"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "N-Queens",
    question:
      "Place n queens on n×n chessboard so no two attack each other. Return all solutions.",
    answer:
      "Backtrack row by row. Check column, diagonal, anti-diagonal. O(n!) time.",
    topicTags: ["backtracking", "recursion", "constraints"],
    seniorityLevel: ["senior"],
  },

  // ==================== FRONTEND SPECIFIC ====================
  {
    category: "frontend",
    difficulty: "easy",
    companyLogo: "SiMeta",
    companySize: ["medium"],
    primaryTechStack: ["react"],
    title: "Controlled vs Uncontrolled Components",
    question: "Explain difference. When to use each?",
    answer:
      "Controlled: React state controls input value. Uncontrolled: DOM controls value, use ref. Use controlled for validation/formatting.",
    topicTags: ["react", "forms", "state"],
    seniorityLevel: ["junior"],
  },
  {
    category: "frontend",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["medium"],
    primaryTechStack: ["javascript"],
    title: "Event Bubbling vs Capturing",
    question: "Explain event propagation in DOM.",
    answer:
      "Capturing: event travels down from root. Bubbling: event travels up from target. stopPropagation() stops both.",
    topicTags: ["dom", "events", "javascript"],
    seniorityLevel: ["junior"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "Custom Hook for Fetch",
    question:
      "Create useFetch hook that handles loading, error, and data states.",
    answer:
      "useState for state, useEffect for fetch. Return {data, loading, error}. Handle cleanup with AbortController.",
    topicTags: ["react", "hooks", "custom-hooks"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiMicrosoft",
    companySize: ["large"],
    primaryTechStack: ["typescript"],
    title: "Generic Type Constraints",
    question:
      "Write generic function that only accepts objects with 'id' property.",
    answer:
      "function getValue<T extends { id: number }>(obj: T) { return obj.id; } Use extends for constraints.",
    topicTags: ["typescript", "generics", "types"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiMeta",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "Implement useDebounce Hook",
    question: "Create hook that debounces value updates.",
    answer:
      "useEffect with setTimeout. Clear timeout on cleanup and when value changes. Return debounced value.",
    topicTags: ["react", "hooks", "debouncing"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiAlibaba",
    companySize: ["large"],
    primaryTechStack: ["vue"],
    title: "Custom Directive in Vue",
    question: "Create v-focus directive that focuses input on mount.",
    answer:
      "app.directive('focus', { mounted(el) { el.focus() } }). Directives manipulate DOM directly.",
    topicTags: ["vue", "directives", "dom"],
    seniorityLevel: ["mid", "senior"],
  },

  // ==================== BACKEND SPECIFIC ====================
  {
    category: "backend",
    difficulty: "easy",
    companyLogo: "SiNetflix",
    companySize: ["medium"],
    primaryTechStack: ["nodejs"],
    title: "Async vs Sync in Node",
    question: "Why use async operations in Node.js?",
    answer:
      "Single-threaded event loop. Async prevents blocking. Use callbacks, promises, async/await. Non-blocking I/O.",
    topicTags: ["nodejs", "async", "event-loop"],
    seniorityLevel: ["junior"],
  },
  {
    category: "backend",
    difficulty: "easy",
    companyLogo: "SiUber",
    companySize: ["medium"],
    primaryTechStack: ["express"],
    title: "Middleware Order Matters",
    question: "Why does middleware order matter in Express?",
    answer:
      "Executes in order defined. Early middleware can block later ones. Place error handlers last. Auth before routes.",
    topicTags: ["express", "middleware", "request-flow"],
    seniorityLevel: ["junior"],
  },
  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiDropbox",
    companySize: ["medium"],
    primaryTechStack: ["python"],
    title: "GIL in Python",
    question: "Explain Global Interpreter Lock. Impact on multithreading?",
    answer:
      "Only one thread executes Python bytecode at a time. CPU-bound tasks don't benefit from threads. Use multiprocessing instead.",
    topicTags: ["python", "concurrency", "gil"],
    seniorityLevel: ["mid"],
  },
  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["large"],
    primaryTechStack: ["go"],
    title: "Goroutine Leaks",
    question: "How do goroutines leak? How to prevent?",
    answer:
      "Blocked goroutines never terminate. Use context for cancellation. Close channels when done. Always have exit conditions.",
    topicTags: ["golang", "goroutines", "memory-leaks"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiMozilla",
    companySize: ["large"],
    primaryTechStack: ["rust"],
    title: "Ownership and Borrowing",
    question: "Explain Rust's ownership system and benefits.",
    answer:
      "Each value has one owner. Borrowing with &. Prevents data races at compile time. No garbage collector needed.",
    topicTags: ["rust", "memory-safety", "ownership"],
    seniorityLevel: ["senior"],
  },

  // ==================== DATABASE SPECIFIC ====================
  {
    category: "database",
    difficulty: "easy",
    companyLogo: "SiAirbnb",
    companySize: ["medium"],
    primaryTechStack: ["postgresql"],
    title: "Primary Key vs Unique",
    question: "Difference between PRIMARY KEY and UNIQUE constraints?",
    answer:
      "PRIMARY KEY: not null, only one per table, creates clustered index. UNIQUE: can be null, multiple allowed.",
    topicTags: ["sql", "constraints", "database-design"],
    seniorityLevel: ["junior"],
  },
  {
    category: "database",
    difficulty: "easy",
    companyLogo: "SiShopify",
    companySize: ["medium"],
    primaryTechStack: ["mysql"],
    title: "INNER vs LEFT JOIN",
    question: "Explain difference with example.",
    answer:
      "INNER: only matching rows. LEFT: all from left table, nulls for no match. Use LEFT when need all records.",
    topicTags: ["sql", "joins", "queries"],
    seniorityLevel: ["junior"],
  },
  {
    category: "database",
    difficulty: "medium",
    companyLogo: "SiStripe",
    companySize: ["large"],
    primaryTechStack: ["mongodb"],
    title: "Indexing Strategy",
    question: "Query {city: 'NYC', age: {$gt: 25}} is slow. Which index?",
    answer:
      "Compound index on (city, age). Order matters. Most selective field first. Use explain() to verify.",
    topicTags: ["mongodb", "indexing", "performance"],
    seniorityLevel: ["mid"],
  },
  {
    category: "database",
    difficulty: "medium",
    companyLogo: "SiUber",
    companySize: ["large"],
    primaryTechStack: ["postgresql"],
    title: "ACID Properties",
    question: "Explain each ACID property with example.",
    answer:
      "Atomicity: all or nothing. Consistency: valid state. Isolation: concurrent safety. Durability: persists after commit.",
    topicTags: ["database", "transactions", "acid"],
    seniorityLevel: ["mid"],
  },
  {
    category: "database",
    difficulty: "hard",
    companyLogo: "SiAmazon",
    companySize: ["enterprise"],
    primaryTechStack: ["postgresql"],
    title: "Deadlock Detection",
    question: "Two transactions deadlock. How to detect and resolve?",
    answer:
      "Database detects cycles in wait-for graph. Aborts one transaction. Prevent with consistent lock ordering. Use timeouts.",
    topicTags: ["database", "deadlock", "concurrency"],
    seniorityLevel: ["senior"],
  },

  // ==================== SYSTEM DESIGN - MORE ====================
  {
    category: "system-design",
    difficulty: "medium",
    companyLogo: "SiSlack",
    companySize: ["large"],
    primaryTechStack: ["websockets", "redis"],
    title: "Design Chat Application",
    question:
      "Real-time messaging for 10k concurrent users. Typing indicators, read receipts.",
    answer:
      "WebSockets for real-time. Redis pub/sub for message distribution. Cassandra for history. Presence tracking in Redis.",
    topicTags: ["real-time", "websockets", "chat"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "system-design",
    difficulty: "medium",
    companyLogo: "SiDropbox",
    companySize: ["large"],
    primaryTechStack: ["s3", "kafka"],
    title: "File Sync Service",
    question: "Design Dropbox. Sync files across devices. Handle conflicts.",
    answer:
      "Chunk files. S3 for storage. Metadata in DB. Version vectors for conflict detection. Delta sync for bandwidth.",
    topicTags: ["file-sync", "distributed-systems", "conflict-resolution"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiYoutube",
    companySize: ["faang"],
    primaryTechStack: ["cdn", "cassandra"],
    title: "Video Platform",
    question:
      "Design YouTube. Upload, transcode, stream videos. Recommendations.",
    answer:
      "S3 for raw videos. Transcoding pipeline with workers. CDN for delivery. BigTable for metadata. ML for recommendations.",
    topicTags: ["video", "cdn", "transcoding", "scalability"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiInstagram",
    companySize: ["faang"],
    primaryTechStack: ["postgresql", "redis"],
    title: "Photo Sharing App",
    question: "Design Instagram. Upload photos, follow users, feed, likes.",
    answer:
      "S3 for images. PostgreSQL for metadata. Redis for feed cache. Fan-out on write. CDN for image delivery.",
    topicTags: ["social-media", "images", "feed"],
    seniorityLevel: ["senior"],
  },

  // ==================== SECURITY ====================
  {
    category: "security",
    difficulty: "easy",
    companyLogo: "SiGoogle", // Was SiNodedotjs
    companySize: ["medium"],
    primaryTechStack: ["nodejs"],
    title: "XSS Prevention",
    question: "How to prevent Cross-Site Scripting attacks?",
    answer:
      "Sanitize input. Escape output. Use Content-Security-Policy headers. Never insert user input directly into HTML.",
    topicTags: ["security", "xss", "web-security"],
    seniorityLevel: ["junior"],
  },
  {
    category: "security",
    difficulty: "easy",
    companyLogo: "SiMeta", // Was SiExpress
    companySize: ["medium"],
    primaryTechStack: ["nodejs"],
    title: "CSRF Protection",
    question: "What is CSRF? How to prevent?",
    answer:
      "Cross-Site Request Forgery. Use CSRF tokens. SameSite cookies. Verify Origin/Referer headers.",
    topicTags: ["security", "csrf", "tokens"],
    seniorityLevel: ["junior"],
  },
  {
    category: "security",
    difficulty: "medium",
    companyLogo: "SiMeta", // Was SiBcrypt
    companySize: ["medium"],
    primaryTechStack: ["nodejs"],
    title: "Password Hashing",
    question: "Why bcrypt over MD5? What's salt?",
    answer:
      "bcrypt is slow (resistant to brute force). Salt prevents rainbow table attacks. Use bcrypt/argon2, never plain hash.",
    topicTags: ["security", "hashing", "passwords"],
    seniorityLevel: ["mid"],
  },
  {
    category: "security",
    difficulty: "medium",
    companyLogo: "SiAmazonaws",
    companySize: ["large"],
    primaryTechStack: ["aws"],
    title: "IAM Best Practices",
    question: "Secure AWS account. Least privilege principle.",
    answer:
      "Use IAM roles, not root. MFA enabled. Rotate keys. Least privilege policies. CloudTrail for auditing.",
    topicTags: ["security", "aws", "iam"],
    seniorityLevel: ["mid"],
  },
  {
    category: "security",
    difficulty: "hard",
    companyLogo: "SiHashicorp",
    companySize: ["large"],
    primaryTechStack: ["vault"],
    title: "Zero Trust Architecture",
    question: "Design zero trust security model for microservices.",
    answer:
      "No implicit trust. mTLS between services. Service mesh. Vault for secrets. Identity-based access. Regular attestation.",
    topicTags: ["security", "zero-trust", "microservices"],
    seniorityLevel: ["senior"],
  },

  // ==================== CLOUD & DEVOPS ====================
  {
    category: "devops",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["medium"],
    primaryTechStack: ["docker"],
    title: "Docker vs VM",
    question: "Key differences? When to use each?",
    answer:
      "Docker: shares OS kernel, lighter, faster startup. VM: full OS, isolated. Use Docker for apps, VM for OS isolation.",
    topicTags: ["docker", "containers", "virtualization"],
    seniorityLevel: ["junior"],
  },
  {
    category: "devops",
    difficulty: "easy",
    companyLogo: "SiGithub", // Was SiGithubactions
    companySize: ["medium"],
    primaryTechStack: ["github-actions"],
    title: "CI/CD Pipeline Basics",
    question: "What should CI/CD pipeline include?",
    answer:
      "Lint, test, build, security scan, deploy to staging, smoke tests, deploy to production. Rollback strategy.",
    topicTags: ["ci-cd", "automation", "devops"],
    seniorityLevel: ["junior"],
  },
  {
    category: "devops",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["large"],
    primaryTechStack: ["kubernetes"],
    title: "Pod vs Deployment",
    question: "Difference? When to use Deployment?",
    answer:
      "Pod: single instance. Deployment: manages ReplicaSet, rolling updates, rollbacks. Always use Deployment for production.",
    topicTags: ["kubernetes", "containers", "orchestration"],
    seniorityLevel: ["mid"],
  },
  {
    category: "devops",
    difficulty: "medium",
    companyLogo: "SiTerraform",
    companySize: ["large"],
    primaryTechStack: ["prometheus"],
    title: "Monitoring Strategy",
    question: "What metrics to monitor for web app?",
    answer:
      "RED: Rate, Errors, Duration. USE: Utilization, Saturation, Errors. Golden signals: latency, traffic, errors, saturation.",
    topicTags: ["monitoring", "observability", "metrics"],
    seniorityLevel: ["mid"],
  },
  {
    category: "devops",
    difficulty: "hard",
    companyLogo: "SiHashicorp", // Was SiTerraform
    companySize: ["enterprise"],
    primaryTechStack: ["terraform"],
    title: "State Management",
    question: "Terraform state best practices for team?",
    answer:
      "Remote state in S3/GCS. State locking with DynamoDB. Separate states per environment. Never commit state to git.",
    topicTags: ["terraform", "iac", "state-management"],
    seniorityLevel: ["senior"],
  },

  // ==================== MOBILE ====================
  {
    category: "mobile",
    difficulty: "easy",
    companyLogo: "SiMeta", // Was SiReact
    companySize: ["medium"],
    primaryTechStack: ["react-native"],
    title: "FlatList vs ScrollView",
    question: "When to use each in React Native?",
    answer:
      "FlatList: large lists, lazy loading, better performance. ScrollView: small lists, known size. Use FlatList by default.",
    topicTags: ["react-native", "performance", "lists"],
    seniorityLevel: ["junior"],
  },
  {
    category: "mobile",
    difficulty: "medium",
    companyLogo: "SiApple", // Was SiSwift
    companySize: ["large"],
    primaryTechStack: ["swift"],
    title: "Memory Management",
    question: "Explain ARC. Strong vs weak references.",
    answer:
      "Automatic Reference Counting. Strong: ownership, prevents deallocation. Weak: no ownership, prevents retain cycles.",
    topicTags: ["swift", "memory-management", "arc"],
    seniorityLevel: ["mid"],
  },
  {
    category: "mobile",
    difficulty: "medium",
    companyLogo: "SiGoogle", // Was SiKotlin
    companySize: ["large"],
    primaryTechStack: ["kotlin"],
    title: "Coroutines vs Threads",
    question: "Why use coroutines in Kotlin?",
    answer:
      "Lightweight, thousands possible. Structured concurrency. Easy cancellation. Better than callbacks. suspend functions.",
    topicTags: ["kotlin", "coroutines", "async"],
    seniorityLevel: ["mid"],
  },
  {
    category: "mobile",
    difficulty: "hard",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "App Store Optimization",
    question: "Reduce app bundle size by 50%. How?",
    answer:
      "App thinning. On-demand resources. Remove unused code. Compress images. Use vector graphics. Bitcode.",
    topicTags: ["ios", "optimization", "app-size"],
    seniorityLevel: ["senior"],
  },

  // ==================== TESTING ====================
  {
    category: "testing",
    difficulty: "easy",
    companyLogo: "SiMeta",
    companySize: ["medium"],
    primaryTechStack: ["jest"],
    title: "Unit vs Integration Test",
    question: "Explain difference. When to use each?",
    answer:
      "Unit: single function/component, mocked dependencies. Integration: multiple units together. Use both in pyramid.",
    topicTags: ["testing", "unit-tests", "integration-tests"],
    seniorityLevel: ["junior"],
  },
  {
    category: "testing",
    difficulty: "medium",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["cypress"],
    title: "Flaky Tests",
    question: "E2E tests fail randomly. How to fix?",
    answer:
      "Avoid fixed waits. Use proper assertions. Reset state between tests. Handle async properly. Retry flaky tests.",
    topicTags: ["testing", "e2e", "flaky-tests"],
    seniorityLevel: ["mid"],
  },
  {
    category: "testing",
    difficulty: "medium",
    companyLogo: "SiMeta", // Was SiTestinglibrary
    companySize: ["medium"],
    primaryTechStack: ["react"],
    title: "Test User Interactions",
    question: "Test button click that fetches data and updates UI.",
    answer:
      "Render component. fireEvent.click. waitFor async update. Assert DOM changes. Mock API with msw or jest.",
    topicTags: ["testing", "react", "user-interaction"],
    seniorityLevel: ["mid"],
  },

  // ==================== PERFORMANCE ====================
  {
    category: "performance",
    difficulty: "easy",
    companyLogo: "SiGoogle", // Was SiJavascript
    companySize: ["medium"],
    primaryTechStack: ["javascript"],
    title: "Memory Leaks in JS",
    question: "Common causes of memory leaks?",
    answer:
      "Event listeners not removed. Closures holding references. Global variables. Detached DOM nodes. Timers not cleared.",
    topicTags: ["javascript", "memory-leaks", "performance"],
    seniorityLevel: ["junior"],
  },
  {
    category: "performance",
    difficulty: "medium",
    companyLogo: "SiAirbnb",
    companySize: ["large"],
    primaryTechStack: ["webpack"],
    title: "Code Splitting",
    question: "App bundle is 2MB. Reduce initial load.",
    answer:
      "Dynamic imports. Route-based splitting. Vendor chunks. Tree shaking. Lazy load heavy libraries.",
    topicTags: ["webpack", "code-splitting", "optimization"],
    seniorityLevel: ["mid"],
  },
  {
    category: "performance",
    difficulty: "medium",
    companyLogo: "SiGoogle", // Was SiChrome
    companySize: ["large"],
    primaryTechStack: ["javascript"],
    title: "Web Vitals",
    question: "Explain LCP, FID, CLS. How to improve?",
    answer:
      "LCP: largest paint <2.5s (optimize images). FID: first input <100ms (reduce JS). CLS: layout shift <0.1 (reserve space).",
    topicTags: ["performance", "web-vitals", "optimization"],
    seniorityLevel: ["mid"],
  },
  {
    category: "performance",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Service Worker Caching",
    question: "Implement offline-first caching strategy.",
    answer:
      "Cache-first for static assets. Network-first for API. Stale-while-revalidate for balance. Background sync for forms.",
    topicTags: ["service-worker", "caching", "offline"],
    seniorityLevel: ["senior"],
  },

  // ==================== API DESIGN ====================
  {
    category: "api-design",
    difficulty: "easy",
    companyLogo: "SiStripe",
    companySize: ["medium"],
    primaryTechStack: ["rest"],
    title: "REST Status Codes",
    question: "Which status code for successful POST creating resource?",
    answer:
      "201 Created with Location header. 200 OK acceptable but less semantic. 204 No Content if no body returned.",
    topicTags: ["rest", "http", "status-codes"],
    seniorityLevel: ["junior"],
  },
  {
    category: "api-design",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["large"],
    primaryTechStack: ["graphql"],
    title: "Pagination in GraphQL",
    question: "Implement cursor-based pagination.",
    answer:
      "Return edges with cursor and node. PageInfo with hasNextPage. Client passes 'after' cursor. More scalable than offset.",
    topicTags: ["graphql", "pagination", "api-design"],
    seniorityLevel: ["mid"],
  },
  {
    category: "api-design",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["large"],
    primaryTechStack: ["openapi"],
    title: "API Versioning",
    question: "Breaking change needed. How to version?",
    answer:
      "URI: /v1/users, /v2/users. Header: Accept: application/vnd.api.v2+json. Query: /users?version=2. URI most common.",
    topicTags: ["api-design", "versioning", "rest"],
    seniorityLevel: ["mid"],
  },

  // ==================== BEHAVIORAL ====================
  {
    category: "behavioral",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: [],
    title: "Tight Deadline",
    question: "Impossible deadline. How do you handle?",
    answer:
      "Clarify requirements. Prioritize ruthlessly. Negotiate scope. Communicate risks early. Deliver MVP. Set expectations.",
    topicTags: ["behavioral", "project-management", "communication"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "behavioral",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: [],
    title: "Technical Debt",
    question: "Convince management to allocate time for tech debt?",
    answer:
      "Show business impact: slower features, more bugs, team morale. Propose gradual approach. ROI calculation. Examples.",
    topicTags: ["behavioral", "leadership", "tech-debt"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "behavioral",
    difficulty: "medium",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: [],
    title: "Mentoring Junior Dev",
    question: "Junior dev struggling. How to help?",
    answer:
      "Pair programming. Code reviews with explanations. Share resources. Set achievable goals. Provide feedback. Patience.",
    topicTags: ["behavioral", "mentoring", "leadership"],
    seniorityLevel: ["mid", "senior"],
  },

  // ==================== DISTRIBUTED SYSTEMS ====================
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiLinkedin",
    companySize: ["large"],
    primaryTechStack: ["kafka"],
    title: "Message Ordering",
    question: "Ensure message order in distributed system?",
    answer:
      "Partition by key. Messages with same key go to same partition. Single consumer per partition. Trade-off: lower parallelism.",
    topicTags: ["kafka", "messaging", "ordering"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["cassandra"],
    title: "CAP Theorem",
    question: "Explain CAP. Cassandra's choice?",
    answer:
      "Consistency, Availability, Partition tolerance - pick 2. Cassandra: AP system. Eventual consistency. Tunable with quorum.",
    topicTags: ["distributed-systems", "cap-theorem", "cassandra"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["large"],
    primaryTechStack: ["etcd"],
    title: "Consensus Algorithms",
    question: "When to use Raft/Paxos? Trade-offs?",
    answer:
      "Strong consistency needed. Leader election. Configuration management. Trade-off: performance for correctness. Raft simpler than Paxos.",
    topicTags: ["distributed-systems", "consensus", "raft"],
    seniorityLevel: ["senior"],
  },

  // ==================== ADDITIONAL ALGORITHMS ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["medium"],
    primaryTechStack: ["python"],
    title: "Move Zeroes",
    question:
      "Move all 0s to end while maintaining order. [0,1,0,3,12] → [1,3,12,0,0]",
    answer:
      "Two pointers. One for non-zero position. Swap when found. O(n) time, O(1) space.",
    topicTags: ["arrays", "two-pointers"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["medium"],
    primaryTechStack: ["java"],
    title: "Single Number",
    question:
      "Every element appears twice except one. Find it without extra space. [2,2,1] → 1",
    answer:
      "XOR all numbers. Duplicate pairs cancel out (a^a=0). O(n) time, O(1) space.",
    topicTags: ["bit-manipulation", "arrays"],
    seniorityLevel: ["junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["medium"],
    primaryTechStack: ["javascript"],
    title: "Rotate Array",
    question:
      "Rotate array right by k steps. [1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4]",
    answer:
      "Reverse whole array. Reverse first k elements. Reverse remaining. O(n) time, O(1) space.",
    topicTags: ["arrays", "rotation", "in-place"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiApple",
    companySize: ["medium"],
    primaryTechStack: ["cpp"],
    title: "Kth Largest Element",
    question:
      "Find kth largest element in unsorted array. [3,2,1,5,6,4], k=2 → 5",
    answer:
      "QuickSelect: O(n) average, O(n²) worst. Or min-heap of size k: O(n log k). Trade space for guaranteed time.",
    topicTags: ["arrays", "quickselect", "heap"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["medium"],
    primaryTechStack: ["python"],
    title: "Sliding Window Maximum",
    question:
      "Find max in each sliding window of size k. [1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]",
    answer:
      "Deque stores indices of useful elements (decreasing order). O(n) time, O(k) space.",
    topicTags: ["sliding-window", "deque", "arrays"],
    seniorityLevel: ["senior"],
  },

  // ==================== MORE FRONTEND ====================
  {
    category: "frontend",
    difficulty: "easy",
    companyLogo: "SiGoogle", // Was SiCss3
    companySize: ["medium"],
    primaryTechStack: ["css"],
    title: "Flexbox vs Grid",
    question: "When to use Flexbox vs CSS Grid?",
    answer:
      "Flexbox: one-dimensional (row or column). Grid: two-dimensional (rows and columns). Use both together often.",
    topicTags: ["css", "layout", "flexbox", "grid"],
    seniorityLevel: ["junior"],
  },
  {
    category: "frontend",
    difficulty: "easy",
    companyLogo: "SiGoogle", // Was SiHtml5
    companySize: ["medium"],
    primaryTechStack: ["html"],
    title: "Semantic HTML",
    question: "Why use semantic tags? Examples?",
    answer:
      "<header>, <nav>, <main>, <article>, <footer>. Better SEO. Accessibility. Clearer code structure.",
    topicTags: ["html", "semantics", "accessibility"],
    seniorityLevel: ["junior"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiMeta", // Was SiRedux
    companySize: ["large"],
    primaryTechStack: ["redux"],
    title: "Redux vs Context API",
    question: "When to use Redux over Context?",
    answer:
      "Redux: complex state, time-travel debugging, middleware. Context: simple state, prop drilling. Redux for large apps.",
    topicTags: ["react", "state-management", "redux"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiVercel",
    companySize: ["large"],
    primaryTechStack: ["nextjs"],
    title: "ISR in Next.js",
    question: "Explain Incremental Static Regeneration.",
    answer:
      "Static pages regenerate in background. Serve stale while revalidating. revalidate prop sets interval. Best of SSR+SSG.",
    topicTags: ["nextjs", "ssr", "performance"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiGoogle", // Was SiWebassembly
    companySize: ["large"],
    primaryTechStack: ["wasm"],
    title: "When to Use WebAssembly",
    question: "Use cases for WASM in web apps?",
    answer:
      "CPU-intensive tasks. Games. Video/image processing. Porting existing C/C++ code. 20-40x faster than JS for compute.",
    topicTags: ["webassembly", "performance", "wasm"],
    seniorityLevel: ["senior"],
  },

  // ==================== MORE BACKEND ====================
  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiGoogle", // Was SiDjango
    companySize: ["large"],
    primaryTechStack: ["django"],
    title: "Django Signals",
    question: "When to use signals? Pitfalls?",
    answer:
      "Use for decoupling. Post_save, pre_delete. Pitfall: hidden logic, hard to debug. Prefer explicit calls when possible.",
    topicTags: ["django", "signals", "architecture"],
    seniorityLevel: ["mid"],
  },
  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiMeta", // Was SiLaravel
    companySize: ["large"],
    primaryTechStack: ["laravel"],
    title: "Eloquent N+1",
    question: "Query causes 101 DB calls. Fix it.",
    answer:
      "Eager loading: User::with('posts')->get(). Use debugbar to detect. Lazy load causes N+1.",
    topicTags: ["laravel", "orm", "performance"],
    seniorityLevel: ["mid"],
  },
  {
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiMicrosoft", // Was SiSpringboot
    companySize: ["enterprise"],
    primaryTechStack: ["spring-boot"],
    title: "Transaction Propagation",
    question: "Explain REQUIRED vs REQUIRES_NEW.",
    answer:
      "REQUIRED: join existing transaction. REQUIRES_NEW: suspend current, start new. Use REQUIRES_NEW for audit logs.",
    topicTags: ["spring", "transactions", "database"],
    seniorityLevel: ["senior"],
  },

  // ==================== MICROSERVICES ====================
  {
    category: "system-design",
    difficulty: "medium",
    companyLogo: "SiIstio",
    companySize: ["large"],
    primaryTechStack: ["kubernetes"],
    title: "Service Mesh",
    question: "What does service mesh solve?",
    answer:
      "Traffic management. mTLS. Observability. Retry/timeout policies. Circuit breaking. Without changing application code.",
    topicTags: ["service-mesh", "microservices", "istio"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiConsul",
    companySize: ["large"],
    primaryTechStack: ["consul"],
    title: "Service Discovery",
    question: "Implement service discovery for microservices.",
    answer:
      "Service registry (Consul/etcd). Health checks. Client-side vs server-side discovery. DNS or API for lookup.",
    topicTags: ["microservices", "service-discovery", "consul"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiJaeger",
    companySize: ["large"],
    primaryTechStack: ["distributed-tracing"],
    title: "Distributed Tracing",
    question: "Debug slow request across 10 microservices.",
    answer:
      "Trace ID propagated through calls. Jaeger/Zipkin visualizes. Find bottleneck service. Sampling for performance.",
    topicTags: ["observability", "tracing", "microservices"],
    seniorityLevel: ["senior"],
  },

  // ==================== ADDITIONAL FRONTEND ====================
  {
    category: "frontend",
    difficulty: "easy",
    companyLogo: "SiMeta",
    companySize: ["medium"],
    primaryTechStack: ["react"],
    title: "React Keys in Lists",
    question:
      "Why are keys important in React lists? What happens if you use index as key?",
    answer:
      "Keys help React identify which items changed, added, or removed. Using index as key can cause issues with component state and performance when list order changes. Use stable unique IDs instead. Keys should be unique among siblings and stable across re-renders.",
    topicTags: ["react", "lists", "performance", "reconciliation"],
    seniorityLevel: ["junior"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["large"],
    primaryTechStack: ["javascript"],
    title: "Promises vs Async/Await",
    question:
      "Compare Promises and async/await. When would you use one over the other?",
    answer:
      "Async/await is syntactic sugar over Promises, making async code look synchronous. Use async/await for cleaner, more readable code and easier error handling with try/catch. Use Promises directly for parallel operations with Promise.all() or when you need fine-grained control over promise chains. Async/await can't be used in constructors or top-level code (without top-level await).",
    topicTags: ["javascript", "async", "promises", "async-await"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["large"],
    primaryTechStack: ["react"],
    title: "useMemo vs useCallback",
    question:
      "Explain the difference between useMemo and useCallback. Provide use cases for each.",
    answer:
      "useMemo memoizes a computed value, recalculating only when dependencies change. Use for expensive calculations. useCallback memoizes a function reference, preventing recreation on every render. Use when passing callbacks to optimized child components that rely on reference equality. Both help prevent unnecessary re-renders but should be used judiciously as they add overhead.",
    topicTags: ["react", "hooks", "performance", "memoization"],
    seniorityLevel: ["mid"],
  },
  {
    category: "frontend",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Event Loop Deep Dive",
    question:
      "Explain JavaScript's event loop, microtasks, and macrotasks. What's the execution order?",
    answer:
      "Event loop processes: 1) Execute synchronous code, 2) Process all microtasks (Promises, queueMicrotask), 3) Render if needed, 4) Process one macrotask (setTimeout, setInterval, I/O). Microtasks have priority over macrotasks. Order: Call stack → Microtask queue → Macrotask queue. This ensures Promises resolve before timers execute.",
    topicTags: ["javascript", "event-loop", "async", "concurrency"],
    seniorityLevel: ["senior"],
  },

  // ==================== ADDITIONAL BACKEND ====================
  {
    category: "backend",
    difficulty: "easy",
    companyLogo: "SiNetflix",
    companySize: ["medium"],
    primaryTechStack: ["nodejs"],
    title: "REST API Design Principles",
    question:
      "What are the key principles of RESTful API design? Provide examples.",
    answer:
      "1) Use HTTP methods correctly (GET for read, POST for create, PUT/PATCH for update, DELETE for remove). 2) Resource-based URLs (/users/123, not /getUser?id=123). 3) Stateless communication. 4) Use proper status codes (200, 201, 404, 500). 5) Version your API (/v1/users). 6) Support filtering, sorting, pagination. 7) HATEOAS for discoverability. 8) Consistent naming conventions.",
    topicTags: ["rest", "api-design", "http", "backend"],
    seniorityLevel: ["junior", "mid"],
  },
  {
    category: "backend",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["nodejs"],
    title: "Rate Limiting Strategies",
    question:
      "Implement rate limiting for an API. Discuss different algorithms and trade-offs.",
    answer:
      "Algorithms: 1) Token Bucket - tokens added at fixed rate, requests consume tokens. Smooth traffic, allows bursts. 2) Leaky Bucket - requests processed at fixed rate, excess dropped. Strict rate control. 3) Fixed Window - count requests per time window. Simple but can have burst at window edges. 4) Sliding Window - more accurate, combines fixed window with sliding calculation. Use Redis for distributed rate limiting. Consider per-user, per-IP, and global limits.",
    topicTags: ["rate-limiting", "api", "scalability", "redis"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "backend",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["go"],
    title: "Distributed Locks",
    question:
      "Design a distributed locking mechanism. What are the challenges and solutions?",
    answer:
      "Use Redis SETNX with expiry or Redlock algorithm for multiple Redis instances. Challenges: 1) Clock skew - use fencing tokens. 2) Process pauses - set appropriate TTL. 3) Network partitions - use quorum-based approach. 4) Lock release - only owner can release, use unique token. Alternative: Use ZooKeeper or etcd for consensus-based locks. Consider lock-free algorithms when possible. Always have timeout and retry logic.",
    topicTags: ["distributed-systems", "locking", "concurrency", "redis"],
    seniorityLevel: ["senior"],
  },

  // ==================== ADDITIONAL DATABASES ====================
  {
    category: "database",
    difficulty: "medium",
    companyLogo: "SiAirbnb",
    companySize: ["large"],
    primaryTechStack: ["postgresql"],
    title: "Database Sharding Strategies",
    question:
      "Explain database sharding. What are different sharding strategies and their trade-offs?",
    answer:
      "Sharding splits data across multiple databases. Strategies: 1) Range-based - shard by ID ranges. Simple but can have hot spots. 2) Hash-based - hash key determines shard. Even distribution but range queries difficult. 3) Geographic - shard by location. Good for latency, complex for global queries. 4) Directory-based - lookup table maps keys to shards. Flexible but adds lookup overhead. Trade-offs: complexity vs scalability, cross-shard queries, rebalancing difficulty.",
    topicTags: ["database", "sharding", "scalability", "distributed-systems"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "database",
    difficulty: "hard",
    companyLogo: "SiStripe",
    companySize: ["large"],
    primaryTechStack: ["postgresql"],
    title: "Database Replication Strategies",
    question:
      "Compare master-slave, master-master, and multi-master replication. When to use each?",
    answer:
      "Master-Slave: One write node, multiple read replicas. Simple, good for read-heavy workloads. Failover needed for master failure. Master-Master: Multiple write nodes, bidirectional replication. Better availability but conflict resolution needed. Multi-Master: Multiple write nodes in different regions. Best for global apps but complex conflict resolution. Use master-slave for most cases, master-master for high availability, multi-master for geo-distributed writes. Consider eventual consistency implications.",
    topicTags: [
      "database",
      "replication",
      "high-availability",
      "distributed-systems",
    ],
    seniorityLevel: ["senior"],
  },
  {
    category: "database",
    difficulty: "medium",
    companyLogo: "SiUber",
    companySize: ["large"],
    primaryTechStack: ["mongodb"],
    title: "NoSQL vs SQL Trade-offs",
    question:
      "When should you choose NoSQL over SQL? Discuss specific use cases and trade-offs.",
    answer:
      "Choose NoSQL for: 1) Flexible schema - rapidly changing data models. 2) Horizontal scalability - massive data volumes. 3) High write throughput - time-series, logs. 4) Document storage - nested data structures. Choose SQL for: 1) Complex queries and joins. 2) ACID transactions. 3) Structured data with relationships. 4) Data integrity constraints. Trade-offs: NoSQL sacrifices consistency for availability/partition tolerance (CAP theorem). Consider data access patterns, consistency requirements, and team expertise.",
    topicTags: ["database", "nosql", "sql", "architecture"],
    seniorityLevel: ["mid"],
  },

  // ==================== ADDITIONAL ALGORITHMS ====================
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "LRU Cache Implementation",
    question:
      "Implement an LRU (Least Recently Used) cache with O(1) get and put operations.",
    answer:
      "Use HashMap + Doubly Linked List. HashMap stores key → node mapping for O(1) access. Doubly linked list maintains order (most recent at head, least recent at tail). On get: move node to head. On put: add to head, remove tail if capacity exceeded. Update HashMap accordingly. Python: use OrderedDict. The combination gives O(1) for both operations while maintaining LRU order.",
    topicTags: ["data-structures", "cache", "linked-list", "hash-map"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiMeta",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Trie Implementation and Applications",
    question:
      "Implement a Trie (prefix tree) and explain its applications. What's the time complexity?",
    answer:
      "Trie stores strings character by character. Each node has children map and isEndOfWord flag. Insert/Search: O(m) where m is string length. Applications: 1) Autocomplete - find all words with prefix. 2) Spell checker - find similar words. 3) IP routing - longest prefix matching. 4) Dictionary - efficient word lookup. Space: O(ALPHABET_SIZE * N * M) worst case. Better than hash table for prefix operations. Can be compressed with radix tree.",
    topicTags: ["data-structures", "trie", "strings", "prefix-tree"],
    seniorityLevel: ["senior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "Topological Sort",
    question:
      "Explain topological sort. Provide use cases and implementation approaches.",
    answer:
      "Topological sort orders directed acyclic graph (DAG) vertices linearly such that for every edge u→v, u comes before v. Use cases: 1) Task scheduling with dependencies. 2) Build systems. 3) Course prerequisites. Implementations: 1) DFS - post-order traversal, reverse result. 2) Kahn's algorithm - repeatedly remove nodes with no incoming edges. Time: O(V+E). Detect cycles: if can't order all nodes, cycle exists. Used in package managers, compilation order.",
    topicTags: ["graphs", "topological-sort", "dfs", "algorithms"],
    seniorityLevel: ["mid"],
  },

  // ==================== ADDITIONAL SYSTEM DESIGN ====================
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiNetflix",
    companySize: ["faang"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Netflix Video Streaming",
    question:
      "Design a video streaming service like Netflix. Handle millions of concurrent users.",
    answer:
      "Components: 1) CDN for video delivery - reduce latency, cache popular content. 2) Adaptive bitrate streaming - adjust quality based on bandwidth. 3) Video encoding pipeline - multiple resolutions/formats. 4) Recommendation engine - ML-based personalization. 5) User service - authentication, profiles, watch history. 6) Content metadata DB - PostgreSQL for structured data. 7) Analytics - Kafka + Spark for real-time insights. 8) Search - Elasticsearch. Scale: horizontal scaling, microservices, caching layers, async processing.",
    topicTags: ["system-design", "video-streaming", "cdn", "scalability"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    companyLogo: "SiUber",
    companySize: ["faang"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Uber Ride Matching",
    question:
      "Design the ride matching system for Uber. Handle real-time location updates and matching.",
    answer:
      "Components: 1) Geospatial indexing - QuadTree or Geohash for nearby drivers. 2) WebSocket connections - real-time location updates. 3) Matching algorithm - consider distance, rating, ETA. 4) Redis for driver availability cache. 5) Kafka for event streaming. 6) PostgreSQL with PostGIS for persistent storage. 7) Load balancing by geographic regions. Challenges: handle high write throughput, low latency matching, driver state management, surge pricing calculation. Use eventual consistency for non-critical data.",
    topicTags: ["system-design", "geospatial", "real-time", "matching"],
    seniorityLevel: ["senior"],
  },
  {
    category: "system-design",
    difficulty: "medium",
    companyLogo: "SiSlack",
    companySize: ["large"],
    primaryTechStack: ["distributed-systems"],
    title: "Design Real-time Chat System",
    question:
      "Design a real-time chat application like Slack. Support channels, DMs, and presence.",
    answer:
      "Components: 1) WebSocket server - maintain persistent connections. 2) Message queue - Kafka for message delivery. 3) Cassandra for message storage - time-series data. 4) Redis for presence/online status. 5) PostgreSQL for user/channel metadata. 6) CDN for media files. Features: 1) Message ordering - use timestamps + sequence numbers. 2) Delivery guarantees - at-least-once with idempotency. 3) Presence - heartbeat mechanism. 4) Search - Elasticsearch. 5) Notifications - push service. Scale: shard by channel/user, use connection pooling.",
    topicTags: ["system-design", "real-time", "websockets", "chat"],
    seniorityLevel: ["mid", "senior"],
  },

  // ==================== ADDITIONAL SECURITY ====================
  {
    category: "security",
    difficulty: "medium",
    companyLogo: "SiStripe",
    companySize: ["large"],
    primaryTechStack: ["security"],
    title: "OAuth 2.0 Flow",
    question:
      "Explain OAuth 2.0 authorization code flow. What are the security considerations?",
    answer:
      "Flow: 1) User clicks 'Login with X'. 2) Redirect to authorization server. 3) User authenticates and grants permission. 4) Redirect back with authorization code. 5) Exchange code for access token (server-side). 6) Use token to access resources. Security: 1) Use PKCE for mobile/SPA. 2) Validate redirect URIs. 3) Short-lived codes (10 min). 4) HTTPS only. 5) State parameter prevents CSRF. 6) Store tokens securely. 7) Refresh tokens for long-lived access. Don't expose tokens in URLs or logs.",
    topicTags: ["security", "oauth", "authentication", "authorization"],
    seniorityLevel: ["mid"],
  },
  {
    category: "security",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["security"],
    title: "JWT Security Best Practices",
    question:
      "What are the security risks of JWT tokens? How to mitigate them?",
    answer:
      "Risks: 1) Token theft - store in httpOnly cookies, not localStorage. 2) No revocation - use short expiry + refresh tokens. 3) Algorithm confusion - explicitly verify 'alg' header. 4) Sensitive data exposure - don't store secrets in payload. 5) Replay attacks - use 'jti' (JWT ID) with blacklist. Mitigations: 1) Use strong secrets (256+ bits). 2) Validate issuer, audience, expiry. 3) Implement token rotation. 4) Use asymmetric keys (RS256) for microservices. 5) Add rate limiting. 6) Monitor for suspicious patterns.",
    topicTags: ["security", "jwt", "authentication", "tokens"],
    seniorityLevel: ["senior"],
  },
  {
    category: "security",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["faang"],
    primaryTechStack: ["security"],
    title: "SQL Injection Prevention",
    question:
      "Explain SQL injection attacks and comprehensive prevention strategies.",
    answer:
      "Attack: Malicious SQL inserted through user input. Example: ' OR '1'='1 bypasses authentication. Prevention: 1) Parameterized queries/prepared statements - ALWAYS use these. 2) ORM frameworks - add abstraction layer. 3) Input validation - whitelist allowed characters. 4) Least privilege - database user has minimal permissions. 5) Escape special characters - last resort. 6) WAF (Web Application Firewall). 7) Regular security audits. 8) Never concatenate user input into SQL. 9) Use stored procedures with parameters.",
    topicTags: ["security", "sql-injection", "database", "vulnerabilities"],
    seniorityLevel: ["mid"],
  },

  // ==================== ADDITIONAL DEVOPS ====================
  {
    category: "devops",
    difficulty: "medium",
    companyLogo: "SiGoogle",
    companySize: ["large"],
    primaryTechStack: ["kubernetes"],
    title: "Kubernetes Networking",
    question: "Explain Kubernetes networking model. How do pods communicate?",
    answer:
      "K8s networking principles: 1) Every pod gets unique IP. 2) Pods can communicate without NAT. 3) Nodes can communicate with pods without NAT. Implementation: CNI plugins (Calico, Flannel, Weave). Pod-to-Pod: direct IP communication within cluster. Pod-to-Service: kube-proxy manages iptables/IPVS rules. Ingress: external traffic routing to services. Network policies: firewall rules between pods. Service types: ClusterIP (internal), NodePort (external on node), LoadBalancer (cloud LB), ExternalName (DNS).",
    topicTags: ["kubernetes", "networking", "devops", "containers"],
    seniorityLevel: ["mid", "senior"],
  },
  {
    category: "devops",
    difficulty: "hard",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["aws"],
    title: "Blue-Green vs Canary Deployment",
    question:
      "Compare blue-green and canary deployment strategies. When to use each?",
    answer:
      "Blue-Green: Two identical environments. Deploy to green (inactive), test, then switch traffic. Pros: instant rollback, full testing. Cons: double infrastructure cost, all-or-nothing switch. Canary: Gradually roll out to small percentage of users, monitor metrics, increase if healthy. Pros: reduced risk, real-world testing, gradual rollout. Cons: complex routing, longer deployment time. Use blue-green for: critical systems, need instant rollback. Use canary for: large user base, want gradual validation, can tolerate mixed versions. Both require good monitoring and automated rollback.",
    topicTags: ["devops", "deployment", "ci-cd", "strategies"],
    seniorityLevel: ["senior"],
  },
  {
    category: "devops",
    difficulty: "medium",
    companyLogo: "SiHashicorp",
    companySize: ["large"],
    primaryTechStack: ["terraform"],
    title: "Infrastructure as Code Best Practices",
    question:
      "What are best practices for Infrastructure as Code with Terraform?",
    answer:
      "Best practices: 1) Version control - treat like application code. 2) Modular design - reusable modules for common patterns. 3) State management - remote backend (S3), state locking (DynamoDB). 4) Separate environments - different state files for dev/staging/prod. 5) Variables and outputs - parameterize configurations. 6) Naming conventions - consistent resource naming. 7) Documentation - README for each module. 8) CI/CD integration - automated plan/apply. 9) Secrets management - use Vault, never commit secrets. 10) Testing - terratest for validation. 11) Plan before apply - review changes.",
    topicTags: ["devops", "iac", "terraform", "automation"],
    seniorityLevel: ["mid"],
  },

  // ==================== ADDITIONAL TESTING ====================
  {
    category: "testing",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["large"],
    primaryTechStack: ["testing"],
    title: "Test Pyramid Strategy",
    question:
      "Explain the test pyramid. How should you distribute different types of tests?",
    answer:
      "Test Pyramid (bottom to top): 1) Unit tests (70%) - fast, isolated, test single functions. 2) Integration tests (20%) - test component interactions, database, APIs. 3) E2E tests (10%) - test full user flows, slowest, most brittle. Rationale: unit tests are cheap and fast, E2E are expensive and slow. Also consider: 1) Contract tests for microservices. 2) Performance tests for critical paths. 3) Security tests. Anti-pattern: inverted pyramid (too many E2E). Balance: enough coverage without slowing development. Use mocks wisely in unit tests.",
    topicTags: ["testing", "test-pyramid", "strategy", "quality"],
    seniorityLevel: ["mid"],
  },
  {
    category: "testing",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["testing"],
    title: "Property-Based Testing",
    question:
      "What is property-based testing? How does it differ from example-based testing?",
    answer:
      "Property-based testing generates random inputs to verify properties always hold. Example: 'reversing a list twice returns original' tested with 1000s of random lists. Differs from example-based (specific inputs/outputs). Tools: QuickCheck, Hypothesis, fast-check. Benefits: 1) Finds edge cases you didn't think of. 2) Tests invariants, not specific cases. 3) Automatic test case generation. 4) Shrinking - minimizes failing input. Use for: algorithms, parsers, data transformations. Challenges: defining good properties, performance, debugging random failures. Complements example-based testing.",
    topicTags: ["testing", "property-based", "quickcheck", "advanced"],
    seniorityLevel: ["senior"],
  },

  // ==================== ADDITIONAL PERFORMANCE ====================
  {
    category: "performance",
    difficulty: "hard",
    companyLogo: "SiNetflix",
    companySize: ["faang"],
    primaryTechStack: ["performance"],
    title: "Database Query Optimization",
    question:
      "A query takes 30 seconds. Walk through your optimization process.",
    answer:
      "Process: 1) EXPLAIN ANALYZE - understand query plan. 2) Check indexes - missing or unused indexes. 3) Analyze WHERE clauses - are they using indexes? 4) Check JOIN order - statistics up to date? 5) Look for N+1 queries - use eager loading. 6) Examine table scans - should be index scans. 7) Check for function calls on indexed columns - prevents index use. 8) Consider query rewrite - subquery to JOIN. 9) Partition large tables. 10) Add covering indexes. 11) Use query cache if applicable. 12) Check for locks/blocking. 13) Analyze data distribution - skewed data? 14) Consider denormalization for read-heavy workloads.",
    topicTags: ["performance", "database", "optimization", "sql"],
    seniorityLevel: ["senior"],
  },
  {
    category: "performance",
    difficulty: "medium",
    companyLogo: "SiAirbnb",
    companySize: ["large"],
    primaryTechStack: ["caching"],
    title: "Caching Strategies",
    question:
      "Compare different caching strategies: cache-aside, write-through, write-behind.",
    answer:
      "Cache-Aside (Lazy Loading): App checks cache, on miss loads from DB and updates cache. Pros: only cache what's needed. Cons: cache miss penalty, stale data possible. Write-Through: Write to cache and DB simultaneously. Pros: cache always fresh. Cons: write latency, cache pollution. Write-Behind (Write-Back): Write to cache, async write to DB. Pros: fast writes. Cons: data loss risk, complexity. Use cache-aside for read-heavy, write-through for consistency, write-behind for write-heavy. Also consider: TTL, eviction policies (LRU, LFU), cache warming, cache invalidation strategies.",
    topicTags: ["performance", "caching", "redis", "architecture"],
    seniorityLevel: ["mid"],
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
