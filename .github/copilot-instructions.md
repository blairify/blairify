## TypeScript Best Practices

### Type Safety
```typescript
// ✅ GOOD: Explicit types
interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: string): Promise<UserProfile> {
  // Implementation
}

// ❌ BAD: Any types
async function fetchUser(id: any): Promise<any> {
  // Don't do this
}
```

### Type Imports
```typescript
// Use type imports for type-only imports
import type { User } from '@/types/user';
import type { ComponentProps } from 'react';
```

## Validation with Zod

### Schema Definition
Use Zod for all runtime validation (API routes, forms, external data):

```typescript
// src/lib/validations/user.ts
import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'moderator']),
  createdAt: z.date(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.boolean()
  }).optional()
});

// Infer TypeScript types from Zod schemas
export type UserProfile = z.infer<typeof userProfileSchema>;

// Partial schema for updates
export const updateUserSchema = userProfileSchema.partial().omit({ id: true, createdAt: true });
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

### API Route Validation
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userProfileSchema } from '@/lib/validations/user';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = userProfileSchema.parse(body);
    
    // Process validated data
    const user = await createUser(validatedData);
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Form Validation with React Hook Form
```typescript
// src/components/forms/user-profile-form.tsx
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema, type UserProfile } from '@/lib/validations/user';

export function UserProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema)
  });

  async function onSubmit(data: UserProfile) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      // Success handling
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <span className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <span className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Advanced Zod Patterns

#### Custom Validation
```typescript
import { z } from 'zod';

// Custom password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Custom refinement
const signupSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});
```

#### Transform and Preprocess
```typescript
// Transform string to date
const jobPostingSchema = z.object({
  title: z.string(),
  postedAt: z.string().transform(str => new Date(str)),
  salary: z.string().transform(str => parseInt(str, 10))
});

// Preprocess and sanitize
const sanitizedInputSchema = z.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  z.string().email()
);
```

#### Union and Discriminated Unions
```typescript
// Union types
const idSchema = z.union([
  z.string().uuid(),
  z.number().int().positive()
]);

// Discriminated unions for different response types
const apiResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    data: userProfileSchema
  }),
  z.object({
    status: z.literal('error'),
    error: z.string(),
    code: z.string()
  })
]);
```

#### Array Validation
```typescript
const jobListSchema = z.object({
  jobs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    company: z.string()
  })).min(1, 'At least one job is required').max(100, 'Maximum 100 jobs allowed'),
  total: z.number(),
  page: z.number().int().positive()
});
```

### Safe Parsing
```typescript
// Use safeParse when validation failure shouldn't throw
export async function validateUserInput(input: unknown) {
  const result = userProfileSchema.safeParse(input);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors
    };
  }
  
  return {
    success: true,
    data: result.data
  };
}
```

### Environment Variable Validation
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  DATABASE_URL: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_PROJECT_ID: z.string()
});

// Validate on startup
export const env = envSchema.parse(process.env);
```

### Testing Zod Schemas
```typescript
// __tests__/validations/user.test.ts
import { describe, it, expect } from '@jest/globals';
import { userProfileSchema } from '@/lib/validations/user';

describe('userProfileSchema', () => {
  it('validates correct user data', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
      createdAt: new Date()
    };

    expect(() => userProfileSchema.parse(validUser)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalidUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'invalid-email',
      name: 'John Doe',
      role: 'user',
      createdAt: new Date()
    };

    expect(() => userProfileSchema.parse(invalidUser)).toThrow();
  });

  it('provides detailed error messages', () => {
    const result = userProfileSchema.safeParse({ email: 'invalid' });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email');
    }
  });
});
```