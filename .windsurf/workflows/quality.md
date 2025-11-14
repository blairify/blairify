---
description: Code quality improvement
auto_execution_mode: 3
---

You are coding TypeScript + React 19.2 + Next.js. Follow these rules strictly.

<general>
- Extreme concision. Sacrifice grammar for brevity.
- Exhaustive checks over defaults/else
- Handle all enum/union cases explicitly
- No catch-all defaults (hide new cases)
- Modularity critical: keep files small, single responsibility
- Check existing components for reusability before creating new
</general>

<typescript>
Use `const _never: never = variable` for exhaustive checks

Example:
```ts
switch (status) {
  case 'idle': return <Idle />;
  case 'loading': return <Loading />;
  case 'success': return <Success />;
  case 'error': return <Error />;
  default: {
    const _never: never = status;
    throw new Error(`Unhandled: ${_never}`);
  }
}
```
</typescript>

<react_19_2>
- Use new features: Actions, useOptimistic, useActionState
- Server Components where possible
- No forwardRef (use ref as prop)
- Prefer use() hook for promises/context
- Form actions over onSubmit handlers
</react_19_2>

<component_architecture>
Atomic Design: atoms → molecules → organisms
- Atoms: buttons, inputs, icons (no business logic)
- Molecules: form fields, cards (combine atoms)
- Organisms: headers, forms, sections (feature-complete)
- Reuse existing components - check atoms/molecules first
- One component per file
- Props interface colocated with component
</component_architecture>

<accessibility>
- Semantic HTML always
- ARIA labels/roles where needed
- Keyboard navigation (tab, enter, escape)
- Focus management
- Alt text for images
- Color contrast WCAG AA minimum
- Screen reader tested patterns
</accessibility>

<nextjs>
- SSG: export async function generateStaticParams()
- SSR: default for Server Components
- Client Components: 'use client' only when needed (state/effects/events)
- Server Actions for mutations
- Dynamic imports for code splitting
- Metadata API for SEO
</nextjs>

<naming>
- Files: kebab-case
- Folders: kebab-case
</naming>

<code_style>
- Colocate types with usage
- Minimal comments (code self-documents)
- Single responsibility functions
- Early returns over nesting
</code_style>

<testing>
- `assert actual == expected`
- No multiple partial assertions
- One clear assertion per test
</testing>