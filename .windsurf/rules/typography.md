---
trigger: always_on
---

Never use raw HTML text elements. Never restyle Typography components.

## Mandatory component

`Typography.*` is the only permitted way to render text. Raw elements are banned everywhere — no exceptions.

```tsx
// ✅
<Typography.Heading2>Account settings</Typography.Heading2>
<Typography.Body>{user.bio}</Typography.Body>
<Typography.Caption>{timestamp}</Typography.Caption>

// ❌ — banned, always
<h2>Account settings</h2>
<p>{user.bio}</p>
<span>{timestamp}</span>
<div className="text-sm text-gray-500">{timestamp}</div>
```

Banned elements: `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` `<p>` `<span>` when used to render text.

---

## Variant → element map

| Variant | Element | Use for |
|---|---|---|
| `Heading1` | `h1` | Page title — one per page maximum |
| `Heading2` | `h2` | Section titles |
| `Heading3` | `h3` | Subsection titles |
| `Body` / `BodyMedium` / `BodyBold` | `p` | Prose, descriptions, labels |
| `Caption` / `CaptionMedium` / `CaptionBold` | `span` | Labels, badges, metadata |
| `SubCaption` / `SubCaptionMedium` / `SubCaptionBold` | `span` | Timestamps, helper text, fine print |

Heading levels must follow document outline order — never skip levels.

---

## Variants are already styled — never restyle them

Banned `className` values on any `Typography.*` component:

- `text-{size}` — `text-sm`, `text-base`, `text-xl`, …
- `font-{weight}` — `font-bold`, `font-medium`, `font-semibold`, …
- `text-{color}` — `text-gray-500`, `text-red-700`, `text-primary`, …
- `leading-{value}` — `leading-tight`, `leading-6`, …
- `tracking-{value}` — `tracking-wide`, …

`className` is for layout and spacing only:

```tsx
// ✅ — layout only
<Typography.Caption className="truncate max-w-xs">{user.email}</Typography.Caption>
<Typography.Body className="mt-2">{description}</Typography.Body>

// ❌ — restyles the variant
<Typography.Caption className="text-base font-bold text-gray-900">{user.email}</Typography.Caption>
```

If no variant fits the design, add a new entry to `VARIANT_VALUES` in `typography.tsx` — never inline a one-off style.

---

## Color prop

Use the `color` prop — never Tailwind color classes:

| Value | Use for |
|---|---|
| `primary` (default) | All body copy |
| `secondary` | De-emphasised / supporting text |
| `error` | Validation errors only |
| `success` | Validation success only |
| `disabled` | Set via `disabled` prop — never pass manually |
| `brand` / `brandLight` / `brandDark` | Interactive or decorative accents only — never body copy |

---

## Clickable text

```tsx
// ✅ — hover and cursor styles applied automatically
<Typography.Caption onClick={handleTagClick}>{tag.name}</Typography.Caption>

// ❌
<span className="text-sm cursor-pointer hover:text-primary">{tag.name}</span>
```

---

## Disabled text

```tsx
// ✅ — also applies pointer-events-none
<Typography.Body disabled>{plan.description}</Typography.Body>

// ❌ — skips pointer-events-none
<Typography.Body color="disabled">{plan.description}</Typography.Body>
```

---

## Review checklist — reject if any of these appear

- `<p>`, `<h1>`–`<h6>`, or `<span>` rendering text content
- `className` on a `Typography.*` containing `text-`, `font-`, `leading-`, or `tracking-`
- `color="disabled"` passed as a prop
- Raw Tailwind color classes on any text-rendering element