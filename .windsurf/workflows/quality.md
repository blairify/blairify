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
- Constants: SNAKE_CAPS
- Functions: camelCase
- No abbreviations; use descriptive names
- Be concrete: `retryAfterMs` > `timeout`, `emailValidator` > `validator`
- Avoid vague terms: `data`, `item`, `list`, `component`
- Remove redundancy: `users` not `userList`, `userPayment` not `userPaymentData`
- Avoid hollow suffixes: `Manager`, `Helper`, `Service` unless essential
- Use nested objects for context: `config.public.ENV_NAME` not `ENV_NAME`
</naming>

<code_style>
- Colocate types with usage
- No comments — convert to named functions or variables instead
- Single responsibility functions
- Early returns over nesting; flat code over indentation
- Prefer hash-maps over switch-case:

```ts
const handlers = {
  create: handleCreate,
  update: handleUpdate,
  delete: handleDelete,
} as const;
const handler = handlers[action];
```

- Prefer string literals over concatenation
- No magic strings — extract to named constants or enums
- Don't declare constants or functions inside components; keep them pure
- Extract all logic outside component scope
</code_style>

<data_fetching>
- Never fetch data in useEffect — use React Query
- Avoid useEffect in general; prefer use(), useTransition, startTransition
- Use enum/factory for React Query cache keys — no magic strings:

```ts
enum QueryKey {
  UserProfile = 'user-profile',
  UserOrders  = 'user-orders',
}
```

- Prefer <Suspense> + useSuspenseQuery over isLoading checks
- Wrap data-fetching boundaries in errorBoundary with a retry button
</data_fetching>

<monitoring_and_error_handling>
- Use Higher Order Functions for monitoring, error handling, and profiling
- Wrap side-effecting HOFs at the call-site, not inside components
- errorBoundary required at every async/data boundary; include retry button
- Surface errors to observability tooling (e.g. Sentry) inside the HOF layer
</monitoring_and_error_handling>

<software_engineering>
- e2e type-safety: share types across client/server; no `any`
- Accessibility: WCAG 2.0 AA minimum on every PR
- Security: follow OWASP best practices; sanitise inputs, validate server-side
- No premature optimisation — KISS and YAGNI
- Avoid useless abstractions:
  - Helper functions used only once
  - Functions that mainly call one other function
</software_engineering>

<testing>

## Assertion style
- `assert actual == expected` — actual first, expected second, always
- One clear, complete assertion per test — no multiple partial assertions
- Never use `should` — use 3rd person present tense verbs:
  - ✅ `renders the submit button`
  - ❌ `should render the submit button`

## describe organisation
Abuse `describe` blocks for nested organisation. Every layer of context gets its own block:

```ts
describe('CheckoutForm', () => {
  describe('renders', () => {
    describe('with valid cart', () => {
      it('displays the total price', () => { ... });
      it('enables the submit button', () => { ... });
    });
    describe('with empty cart', () => {
      it('disables the submit button', () => { ... });
      it('shows the empty cart message', () => { ... });
    });
  });

  describe('submits', () => {
    describe('on success', () => {
      it('redirects to the confirmation page', () => { ... });
    });
    describe('on network failure', () => {
      it('displays the retry error boundary', () => { ... });
    });
  });
});
```

## Naming
- Mirror the production naming rules: no abbreviations, concrete names
- Test file: `<subject>.test.ts` colocated with the module it tests
- Factory/fixture file: `<subject>.fixture.ts` — no inline magic literals

## Monitoring & error handling tests
- Wrap the HOF under test; assert the wrapped behaviour:

```ts
describe('withErrorMonitoring', () => {
  describe('when the wrapped function throws', () => {
    it('reports the error to the observability service', () => { ... });
    it('re-throws the original error', () => { ... });
  });
  describe('when the wrapped function resolves', () => {
    it('returns the resolved value untouched', () => { ... });
  });
});
```

- Assert on the observability spy, not console output

## Component purity tests
- Import the extracted helper/validator directly; test it in isolation
- Never import a component just to test a function declared inside it
- Assert the pure function's output — do not render the component:

```ts
describe('formatOrderTotal', () => {
  describe('given a positive amount', () => {
    it('returns the amount formatted with a currency symbol', () => {
      assert formatOrderTotal(1999) == '$19.99';
    });
  });
  describe('given zero', () => {
    it('returns the zero-value formatted string', () => {
      assert formatOrderTotal(0) == '$0.00';
    });
  });
});
```

## Data fetching tests (React Query)
- Use `createWrapper` with `QueryClientProvider` — one per test to avoid cache bleed
- Test against `useSuspenseQuery` with `<Suspense>` wrapping in the render:

```ts
describe('useUserOrders', () => {
  describe('while fetching', () => {
    it('renders the Suspense fallback', () => { ... });
  });
  describe('on success', () => {
    it('renders the order list with the correct item count', () => { ... });
  });
  describe('on error', () => {
    it('triggers the nearest errorBoundary', () => { ... });
  });
});
```

- Use `QueryKey` enum values as cache keys in tests — no magic strings

## Error boundary tests
- Render the errorBoundary wrapping a component that throws
- Assert the retry button is present
- Assert calling retry re-renders the child:

```ts
describe('QueryErrorBoundary', () => {
  describe('when the child throws', () => {
    it('displays the error message', () => { ... });
    it('renders a retry button', () => { ... });
  });
  describe('when the retry button is activated', () => {
    it('re-renders the child component', () => { ... });
  });
});
```

## Accessibility tests
- Assert semantic roles, not implementation details:
  - `getByRole('button', { name: /submit order/i })` ✅
  - `getByTestId('submit-btn')` ❌
- Assert keyboard interactions (Tab, Enter, Escape) explicitly
- Assert `aria-label` / `aria-describedby` on every interactive element test

## Security tests
- Sanitisation: assert XSS payloads are escaped, not rendered as HTML
- Assert server-side validation rejects malformed input before it reaches the DB layer

## Anti-patterns to reject in review
- `it('works')` — rename to describe what it actually does
- `expect(thing).toBeTruthy()` — assert the exact value
- Shared mutable state between tests — use `beforeEach` resets
- `// TODO: add test` comments — write the test or delete the line
</testing>