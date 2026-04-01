import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Career", slug: "career" },
  { name: "System Design", slug: "system-design" },
  { name: "DevOps", slug: "devops" },
  { name: "AI & ML", slug: "ai-ml" },
  { name: "Node.js", slug: "nodejs" },
  { name: "Next.js", slug: "nextjs" },
] as const;

const POSTS = [
  {
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
      <FollowButton userId={userId} /> {/* Client Component */}
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
// ✅ Good — ServerContent stays on the server
<ClientWrapper>
  <ServerContent />
</ClientWrapper>
\`\`\`

### Migration Strategy

1. Start with leaf components — buttons, forms, interactive widgets
2. Move data fetching to Server Components
3. Remove \`useEffect\` data fetching patterns
4. Use \`Suspense\` boundaries for loading states

Server Components aren't just a performance optimization — they're a fundamentally better way to build React apps.`,
    coverImage: null,
    authorName: "Blairify Team",
    readTimeMinutes: 7,
    tags: ["react", "nextjs", "typescript"],
  },
  {
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

If someone adds a new status like \`"cancelled"\`, TypeScript will error at compile time.

## 2. Branded Types

Prevent mixing up primitive types that represent different things:

\`\`\`typescript
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

function getUser(id: UserId) { /* ... */ }

const orderId = "abc-123" as OrderId;
getUser(orderId); // ❌ Type error!
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

TypeScript narrows the type automatically when you check \`status\`.

## 4. Template Literal Types

Create precise string types:

\`\`\`typescript
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIRoute = \`/api/\${string}\`;
type Endpoint = \`\${HTTPMethod} \${APIRoute}\`;

const endpoint: Endpoint = "GET /api/users"; // ✅
const bad: Endpoint = "PATCH /api/users";    // ❌
\`\`\`

## 5. Const Assertions for Configuration

Lock down object shapes:

\`\`\`typescript
const ROUTES = {
  home: "/",
  blog: "/blog",
  settings: "/settings",
} as const;

type Route = (typeof ROUTES)[keyof typeof ROUTES];
// Route = "/" | "/blog" | "/settings"
\`\`\`

These patterns aren't theoretical — they catch real bugs before they reach production.`,
    coverImage: null,
    authorName: "Blairify Team",
    readTimeMinutes: 6,
    tags: ["typescript", "career"],
  },
  {
    slug: "system-design-interview-framework",
    title: "The System Design Interview Framework That Actually Works",
    description:
      "A step-by-step framework for tackling system design interviews — from requirements gathering to detailed design, with examples.",
    content: `## The 4-Step Framework

Every system design interview follows the same structure. Master these four steps and you can tackle any problem.

### Step 1: Clarify Requirements (5 minutes)

Never jump into design. Ask:

- **Functional**: What does the system do? What are the core features?
- **Non-functional**: Scale, latency, consistency, availability
- **Constraints**: Budget, team size, timeline

**Example for "Design Twitter":**
- How many DAU? → 300M
- Read:write ratio? → 100:1
- Average tweet size? → 300 bytes
- Do we need real-time? → Feed can be slightly delayed

### Step 2: High-Level Design (10 minutes)

Draw the big boxes:

1. Client → Load Balancer → API Gateway
2. Core services (Tweet Service, User Service, Feed Service)
3. Data stores (SQL for users, NoSQL for tweets, Cache for feeds)
4. Message queue for async processing

### Step 3: Deep Dive (15 minutes)

The interviewer will pick 1–2 areas to explore. Common deep dives:

- **Database schema** — table design, indexing strategy
- **Caching layer** — what to cache, invalidation strategy
- **Scaling bottlenecks** — how to handle 100K tweets/second
- **Consistency model** — strong vs eventual, tradeoffs

### Step 4: Wrap Up (5 minutes)

- Summarize tradeoffs you made
- Mention what you'd improve with more time
- Discuss monitoring and alerting

## Common Mistakes

1. **Jumping to solutions** — always clarify first
2. **Over-engineering** — start simple, scale when needed
3. **Ignoring tradeoffs** — every decision has a cost
4. **Monologue mode** — treat it as a conversation

The best candidates think out loud and engage the interviewer as a collaborator, not an examiner.`,
    coverImage: null,
    authorName: "Blairify Team",
    readTimeMinutes: 8,
    tags: ["system-design", "career"],
  },
  {
    slug: "ai-tools-developer-productivity-2025",
    title: "AI Tools That Actually Boost Developer Productivity in 2025",
    description:
      "Beyond the hype — which AI coding tools deliver real value, and how to integrate them into your workflow without losing code quality.",
    content: `## The Landscape

AI coding tools have matured significantly. Here's what's worth your time in 2025.

### Code Completion

**GitHub Copilot** and **Cursor** lead the pack. The key is knowing when to accept and when to reject:

- ✅ Accept: boilerplate, test scaffolding, type definitions
- ❌ Reject: business logic, security-sensitive code, complex algorithms

### Code Review

AI-powered review tools catch:
- Potential null pointer exceptions
- Missing error handling
- Performance anti-patterns
- Accessibility issues

### Debugging

AI excels at:
- Explaining error messages
- Suggesting fixes for common patterns
- Tracing data flow through complex systems

### Documentation

The best use case for AI in development:
- Generate JSDoc from function signatures
- Create README files from codebases
- Write API documentation from route handlers

## Productivity Tips

1. **Write clear function names** — AI predictions improve dramatically
2. **Use TypeScript** — type information helps AI understand intent
3. **Review every suggestion** — AI generates plausible-looking bugs
4. **Keep context small** — smaller files = better suggestions
5. **Learn the shortcuts** — \`Tab\` to accept, \`Esc\` to reject, \`Alt+]\` for alternatives

## The Bottom Line

AI tools are a productivity multiplier, not a replacement for understanding. The developers who benefit most are those who already write clean, well-structured code.`,
    coverImage: null,
    authorName: "Blairify Team",
    readTimeMinutes: 5,
    tags: ["ai-ml", "career"],
  },
  {
    slug: "nextjs-performance-optimization-checklist",
    title: "Next.js Performance Optimization: The Complete Checklist",
    description:
      "From image optimization to bundle analysis — a practical checklist for making your Next.js app fast. Core Web Vitals approved.",
    content: `## Images

- [ ] Use \`next/image\` for all images — never raw \`<img>\`
- [ ] Set \`priority\` on above-the-fold images
- [ ] Always provide \`width\` and \`height\` to prevent CLS
- [ ] Use \`sizes\` prop for responsive images
- [ ] Serve WebP/AVIF formats via the built-in optimizer

## JavaScript Bundle

- [ ] Use Server Components by default
- [ ] Add \`"use client"\` only where needed
- [ ] Dynamic import heavy libraries: \`dynamic(() => import("./HeavyChart"))\`
- [ ] Analyze bundle with \`@next/bundle-analyzer\`
- [ ] Tree-shake unused exports

## Data Fetching

- [ ] Fetch data in Server Components, not \`useEffect\`
- [ ] Use \`React.cache()\` to deduplicate requests
- [ ] Set appropriate \`revalidate\` times for ISR
- [ ] Use streaming with \`loading.tsx\` or \`<Suspense>\`

## Fonts

- [ ] Use \`next/font\` for zero-layout-shift font loading
- [ ] Subset fonts to only needed characters
- [ ] Preload critical fonts

## Caching

- [ ] Leverage the Next.js Data Cache
- [ ] Use \`unstable_cache\` for expensive computations
- [ ] Set proper \`Cache-Control\` headers for static assets
- [ ] Use ISR (\`revalidate\`) instead of SSR where possible

## Core Web Vitals

| Metric | Target | Key Optimization |
|--------|--------|-----------------|
| LCP | < 2.5s | Optimize hero images, use \`priority\` |
| FID | < 100ms | Minimize client-side JS |
| CLS | < 0.1 | Set image dimensions, use \`next/font\` |
| INP | < 200ms | Use \`useTransition\` for expensive updates |

## Monitoring

- [ ] Set up Vercel Speed Insights or Lighthouse CI
- [ ] Track Core Web Vitals in production
- [ ] Set performance budgets in CI

Following this checklist will get you a 90+ Lighthouse score and happy users.`,
    coverImage: null,
    authorName: "Blairify Team",
    readTimeMinutes: 6,
    tags: ["nextjs", "react", "devops"],
  },
];

async function seedBlogPosts() {
  console.log("🌱 Seeding blog tags...");

  const tagRecords = await Promise.all(
    TAGS.map((tag) =>
      prisma.blogTag.upsert({
        where: { slug: tag.slug },
        update: { name: tag.name },
        create: { name: tag.name, slug: tag.slug },
      }),
    ),
  );

  const tagMap = new Map(tagRecords.map((t) => [t.slug, t.id]));

  console.log(`✅ Created ${tagRecords.length} tags`);
  console.log("🌱 Seeding blog posts...");

  for (const post of POSTS) {
    const tagConnections = post.tags
      .map((slug) => tagMap.get(slug))
      .filter((id): id is string => id !== undefined)
      .map((id) => ({ id }));

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        description: post.description,
        content: post.content,
        coverImage: post.coverImage,
        authorName: post.authorName,
        readTimeMinutes: post.readTimeMinutes,
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: {
          set: tagConnections,
        },
      },
      create: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        coverImage: post.coverImage,
        authorName: post.authorName,
        readTimeMinutes: post.readTimeMinutes,
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: {
          connect: tagConnections,
        },
      },
    });

    console.log(`  📝 ${post.title}`);
  }

  console.log(`✅ Seeded ${POSTS.length} blog posts`);
}

seedBlogPosts()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
