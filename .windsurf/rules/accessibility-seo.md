---
trigger: always_on
---

Every interface must be operable by keyboard, readable by screen readers, and indexable by search engines. These are not optional enhancements — they are correctness requirements.

---

## Semantic HTML

Use the element that matches the meaning. Never use a `div` or `span` where a semantic element exists.

| Intent | Correct element |
|---|---|
| Page title | `<Typography.Heading1>` → `h1` |
| Navigation | `<nav>` |
| Primary content | `<main>` |
| Complementary content | `<aside>` |
| Page footer | `<footer>` |
| Interactive control | `<button>` |
| Navigation link | `<a href="...">` |
| Data table | `<table>` + `<th scope="...">` |
| Form grouping | `<fieldset>` + `<legend>` |
| Progress indicator | `<progress>` |

```tsx
// ✅
<button onClick={handleDelete}>Delete</button>
<a href="/profile">View profile</a>

// ❌ — div/span with click handlers are invisible to assistive technology
<div onClick={handleDelete}>Delete</div>
<span onClick={() => router.push('/profile')}>View profile</span>
```

---

## ARIA — use only when semantic HTML is insufficient

ARIA augments HTML; it never replaces it. If a semantic element covers the case, use that instead.

```tsx
// ✅ — semantic element, no ARIA needed
<button>Close</button>

// ✅ — ARIA required because the role is non-native
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">...</div>

// ❌ — ARIA on an element that already has the role
<button role="button">Close</button>
```

### Required ARIA attributes by pattern

| Pattern | Required attributes |
|---|---|
| Icon-only button | `aria-label` |
| Toggle button | `aria-pressed` |
| Expandable section | `aria-expanded` on the trigger |
| Modal / dialog | `role="dialog"` `aria-modal="true"` `aria-labelledby` |
| Loading state | `aria-busy="true"` on the container |
| Live region | `aria-live="polite"` (use `"assertive"` only for critical errors) |
| Error message | `role="alert"` or `aria-describedby` linking input to message |
| Tooltip | `role="tooltip"` + `aria-describedby` on the trigger |

---

## Interactive elements

Every interactive element must be:

- **Reachable** — in the natural tab order or explicitly given `tabIndex={0}`
- **Operable** — responds to `Enter` and `Space` (buttons), `Enter` (links)
- **Labelled** — has visible text, `aria-label`, or `aria-labelledby`
- **Focusable** — has a visible `:focus-visible` ring; never `outline: none` without a replacement

```tsx
// ✅ — icon button correctly labelled
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>

// ❌ — no label, invisible to screen readers
<button onClick={onClose}>
  <CloseIcon />
</button>
```

Always set `aria-hidden="true"` on decorative icons and images so they are skipped by screen readers.

---

## Keyboard navigation

| Key | Expected behaviour |
|---|---|
| `Tab` / `Shift+Tab` | Moves focus forward / backward through interactive elements |
| `Enter` | Activates buttons and links |
| `Space` | Activates buttons, checkboxes |
| `Escape` | Closes modals, dropdowns, tooltips |
| `Arrow keys` | Navigates within composite widgets (menus, tabs, sliders) |

Focus must be managed explicitly when content changes:

```tsx
// ✅ — return focus when a modal closes
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setOpen(false);
  triggerRef.current?.focus();
};
```

Trap focus inside modals and dialogs while they are open. Release it on close.

---

## Forms

Every input must have an associated, visible label. Never use `placeholder` as the only label — it disappears on input and has insufficient contrast.

```tsx
// ✅
<label htmlFor="email">Email address</label>
<input id="email" type="email" aria-describedby="email-error" />
{error && <span id="email-error" role="alert">{error}</span>}

// ❌ — placeholder is not a label
<input type="email" placeholder="Email address" />
```

Group related inputs with `<fieldset>` and `<legend>`:

```tsx
// ✅
<fieldset>
  <legend>Shipping address</legend>
  {/* inputs */}
</fieldset>
```

---

## Images and media

```tsx
// ✅ — informative image
<img src={hero.src} alt="A developer typing at a standing desk" />

// ✅ — decorative image
<img src={divider.src} alt="" aria-hidden="true" />

// ❌ — missing alt
<img src={hero.src} />

// ❌ — redundant alt that adds no information
<img src={logo.src} alt="image" />
```

Videos must have captions. Audio must have transcripts.

---

## Color and contrast

- Text contrast ratio: **4.5 : 1** minimum against the background (WCAG AA)
- Large text (≥ 18pt / 14pt bold): **3 : 1** minimum
- Interactive element boundaries: **3 : 1** against adjacent colors
- Never convey meaning through color alone — always pair with text, icon, or pattern

---

## Motion and animation

Respect the user's motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## SEO

### Next.js Metadata API — always set per page

```tsx
// app/account/page.tsx
export const metadata: Metadata = {
  title: "Account settings — Acme",
  description: "Manage your profile, billing, and notification preferences.",
  openGraph: {
    title: "Account settings — Acme",
    description: "Manage your profile, billing, and notification preferences.",
    url: "https://acme.com/account",
    type: "website",
  },
};
```

- `title`: unique per page, format `Page name — Site name`, 50–60 characters
- `description`: unique per page, 120–160 characters, no keyword stuffing
- `openGraph` and `twitter` blocks required on every public page
- Use `generateMetadata` for dynamic routes:

```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  return {
    title: `${post.title} — Acme Blog`,
    description: post.excerpt,
  };
}
```

### Document structure

- One `h1` per page — matches the page `title`
- Heading levels follow document outline order; never skip a level
- Every page has a `<main>` landmark wrapping primary content
- Navigation landmarks use `<nav aria-label="...">` when multiple navs exist

### Structured data (JSON-LD)

Add structured data for content-heavy pages:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      datePublished: post.publishedAt,
      author: { "@type": "Person", name: post.author.name },
    }),
  }}
/>
```

### Performance signals (Core Web Vitals)

- Images: always use `next/image` — never `<img>` for product images
- Set `priority` on above-the-fold images
- Set explicit `width` and `height` to prevent layout shift
- Avoid large layout shifts (CLS): reserve space for async content with skeleton loaders
- Prefer Server Components to reduce JavaScript sent to the client

```tsx
// ✅
import Image from "next/image";
<Image src={hero.src} alt="..." width={1200} height={630} priority />

// ❌
<img src={hero.src} alt="..." />
```

### Links

- Anchor text must describe the destination — never "click here" or "read more"
- External links: `rel="noopener noreferrer"`
- Internal navigation: use `<Link href="...">` from `next/link`, never `<a href="...">` for client-side routes

```tsx
// ✅
<Link href="/pricing">View pricing plans</Link>
<a href="https://docs.example.com" rel="noopener noreferrer">Read the docs</a>

// ❌
<a href="/pricing">Click here</a>
<a href="https://docs.example.com">Read more</a>
```

---

## Review checklist — reject if any of these appear

- `<div>` or `<span>` with `onClick` instead of `<button>` or `<a>`
- Interactive element without a visible label or `aria-label`
- `<input>` without an associated `<label htmlFor>`
- `placeholder` used as the only label
- `<img>` without `alt` attribute
- `outline: none` or `outline: 0` without a visible focus replacement
- Missing `aria-label` on icon-only buttons
- Missing `metadata` export or `generateMetadata` on a page file
- `<img>` instead of `next/image` for product images
- Anchor text that reads "click here", "here", or "read more"
- Multiple `h1` elements on a single page
- Heading levels that skip (e.g. `h1` → `h3`)