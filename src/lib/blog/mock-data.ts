import type { BlogPostCard, BlogPostFull } from "./types";

const MOCK_DATE = new Date("2025-03-20T12:00:00Z");

const MOCK_TAGS = [
  { id: "t1", name: "React", slug: "react" },
  { id: "t2", name: "TypeScript", slug: "typescript" },
  { id: "t3", name: "Career", slug: "career" },
  { id: "t4", name: "System Design", slug: "system-design" },
  { id: "t5", name: "Next.js", slug: "nextjs" },
  { id: "t6", name: "AI & ML", slug: "ai-ml" },
  { id: "t7", name: "DevOps", slug: "devops" },
] as const;

export const MOCK_TAGS_WITH_COUNTS = MOCK_TAGS.map((tag) => ({
  ...tag,
  posts: [],
  _count: { posts: 2 },
}));

const MOCK_POSTS_FULL: BlogPostFull[] = [
  {
    id: "mock-1",
    slug: "react-19-server-components-guide",
    title: "React 19 Server Components: A Practical Guide for Production Apps",
    description:
      "Server Components change how we think about React architecture. Here's how to use them effectively in production — with real patterns, gotchas, and migration tips.",
    content: `## Why Server Components Matter

React Server Components (RSC) represent the biggest architectural shift in React since hooks. They let you run components on the server, sending only the rendered HTML to the client — zero JavaScript for those components.

### The Mental Model

Think of your component tree as two layers:

- **Server layer** — data fetching, heavy computation, secrets access
- **Client layer** — interactivity, state, browser APIs

\`\`\`tsx
// Server Component (default in Next.js App Router)
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return (
    <div>
      <h2>{user.name}</h2>
      <FollowButton userId={userId} />
    </div>
  );
}
\`\`\`

### When to Use "use client"

Add \`"use client"\` only when you need:

1. **State** — \`useState\`, \`useReducer\`
2. **Effects** — \`useEffect\`, \`useLayoutEffect\`
3. **Browser APIs** — \`window\`, \`document\`, \`localStorage\`
4. **Event handlers** — \`onClick\`, \`onChange\`, etc.
5. **Custom hooks** that depend on any of the above

### Common Pitfalls

**Don't make everything a Client Component.** The biggest mistake teams make is adding \`"use client"\` at the layout level, which forces the entire subtree to be client-rendered.

**Do pass Server Component output as children.** This keeps the server benefits:

\`\`\`tsx
<ClientWrapper>
  <ServerContent />
</ClientWrapper>
\`\`\`

Server Components aren't just a performance optimization — they're a fundamentally better way to build React apps.`,
    coverImage: null,
    authorName: "Blairify Team",
    authorAvatar: null,
    readTimeMinutes: 7,
    status: "PUBLISHED",
    publishedAt: MOCK_DATE,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
    tags: [
      { id: "t1", name: "React", slug: "react" },
      { id: "t5", name: "Next.js", slug: "nextjs" },
      { id: "t2", name: "TypeScript", slug: "typescript" },
    ],
  },
  {
    id: "mock-2",
    slug: "typescript-patterns-senior-engineers",
    title: "5 TypeScript Patterns Every Senior Engineer Should Know",
    description:
      "Branded types, exhaustive checks, discriminated unions, and more — patterns that catch bugs at compile time instead of production.",
    content: `## 1. Exhaustive Switch with Never

The \`never\` type ensures you handle every case in a union:

\`\`\`typescript
type Status = "idle" | "loading" | "success" | "error";

function handleStatus(status: Status) {
  switch (status) {
    case "idle": return "Waiting...";
    case "loading": return "Loading...";
    case "success": return "Done!";
    case "error": return "Failed.";
    default: {
      const _never: never = status;
      throw new Error(\`Unhandled status: \${_never}\`);
    }
  }
}
\`\`\`

## 2. Branded Types

Prevent mixing up primitive types that represent different things:

\`\`\`typescript
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

function getUser(id: UserId) { /* ... */ }

const orderId = "abc-123" as OrderId;
getUser(orderId); // Type error!
\`\`\`

## 3. Discriminated Unions

Model state machines with tagged unions:

\`\`\`typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
\`\`\`

These patterns catch real bugs before they reach production.`,
    coverImage: null,
    authorName: "Blairify Team",
    authorAvatar: null,
    readTimeMinutes: 6,
    status: "PUBLISHED",
    publishedAt: new Date("2025-03-18T12:00:00Z"),
    createdAt: new Date("2025-03-18T12:00:00Z"),
    updatedAt: new Date("2025-03-18T12:00:00Z"),
    tags: [
      { id: "t2", name: "TypeScript", slug: "typescript" },
      { id: "t3", name: "Career", slug: "career" },
    ],
  },
  {
    id: "mock-3",
    slug: "system-design-interview-framework",
    title: "The System Design Interview Framework That Actually Works",
    description:
      "A step-by-step framework for tackling system design interviews — from requirements gathering to detailed design, with examples.",
    content: `## The 4-Step Framework

Every system design interview follows the same structure.

### Step 1: Clarify Requirements (5 minutes)

Never jump into design. Ask about functional requirements, non-functional requirements, and constraints.

### Step 2: High-Level Design (10 minutes)

Draw the big boxes: Client → Load Balancer → API Gateway → Services → Data Stores.

### Step 3: Deep Dive (15 minutes)

The interviewer will pick 1–2 areas to explore — database schema, caching layer, scaling bottlenecks, or consistency model.

### Step 4: Wrap Up (5 minutes)

Summarize tradeoffs, mention improvements, discuss monitoring.

The best candidates think out loud and engage the interviewer as a collaborator.`,
    coverImage: null,
    authorName: "Blairify Team",
    authorAvatar: null,
    readTimeMinutes: 8,
    status: "PUBLISHED",
    publishedAt: new Date("2025-03-15T12:00:00Z"),
    createdAt: new Date("2025-03-15T12:00:00Z"),
    updatedAt: new Date("2025-03-15T12:00:00Z"),
    tags: [
      { id: "t4", name: "System Design", slug: "system-design" },
      { id: "t3", name: "Career", slug: "career" },
    ],
  },
  {
    id: "mock-4",
    slug: "ai-tools-developer-productivity-2025",
    title: "AI Tools That Actually Boost Developer Productivity in 2025",
    description:
      "Beyond the hype — which AI coding tools deliver real value, and how to integrate them into your workflow without losing code quality.",
    content: `## The Landscape

AI coding tools have matured significantly. Here's what's worth your time.

### Code Completion

GitHub Copilot and Cursor lead the pack. Accept boilerplate and test scaffolding; reject business logic and security-sensitive code.

### The Bottom Line

AI tools are a productivity multiplier, not a replacement for understanding. The developers who benefit most already write clean code.`,
    coverImage: null,
    authorName: "Blairify Team",
    authorAvatar: null,
    readTimeMinutes: 5,
    status: "PUBLISHED",
    publishedAt: new Date("2025-03-10T12:00:00Z"),
    createdAt: new Date("2025-03-10T12:00:00Z"),
    updatedAt: new Date("2025-03-10T12:00:00Z"),
    tags: [
      { id: "t6", name: "AI & ML", slug: "ai-ml" },
      { id: "t3", name: "Career", slug: "career" },
    ],
  },
  {
    id: "mock-5",
    slug: "nextjs-performance-optimization-checklist",
    title: "Next.js Performance Optimization: The Complete Checklist",
    description:
      "From image optimization to bundle analysis — a practical checklist for making your Next.js app fast. Core Web Vitals approved.",
    content: `## Images

Use \`next/image\` for all images. Set \`priority\` on above-the-fold images. Always provide \`width\` and \`height\`.

## JavaScript Bundle

Use Server Components by default. Add \`"use client"\` only where needed. Dynamic import heavy libraries.

## Core Web Vitals

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| INP | < 200ms |

Following this checklist will get you a 90+ Lighthouse score.`,
    coverImage: null,
    authorName: "Blairify Team",
    authorAvatar: null,
    readTimeMinutes: 6,
    status: "PUBLISHED",
    publishedAt: new Date("2025-03-05T12:00:00Z"),
    createdAt: new Date("2025-03-05T12:00:00Z"),
    updatedAt: new Date("2025-03-05T12:00:00Z"),
    tags: [
      { id: "t5", name: "Next.js", slug: "nextjs" },
      { id: "t1", name: "React", slug: "react" },
      { id: "t7", name: "DevOps", slug: "devops" },
    ],
  },
];

export function getMockPosts(tagSlug?: string): BlogPostCard[] {
  const posts = tagSlug
    ? MOCK_POSTS_FULL.filter((p) => p.tags.some((t) => t.slug === tagSlug))
    : MOCK_POSTS_FULL;

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    coverImage: post.coverImage,
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: post.publishedAt,
    tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
  }));
}

export function getMockPostBySlug(slug: string): BlogPostFull | null {
  return MOCK_POSTS_FULL.find((p) => p.slug === slug) ?? null;
}

export function getMockPostSlugs(): string[] {
  return MOCK_POSTS_FULL.map((p) => p.slug);
}
