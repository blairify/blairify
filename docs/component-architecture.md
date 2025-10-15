# Component Architecture Documentation

## Overview

The Blairify application uses a modular component architecture built with React and TypeScript. Components are organized by atomic design principles, separating concerns into atoms, molecules, organisms, and layout components. The architecture supports both interview preparation features and job market functionality.

## Component Hierarchy

```
src/components/
├── atoms/              # Basic building blocks
│   ├── company-logos.tsx
│   ├── light-rays.tsx
│   ├── loading-page.tsx
│   ├── logo-blairify.tsx
│   └── theme-toggle.tsx
├── molecules/          # Simple component combinations
│   ├── cubes.tsx
│   ├── features-grid.tsx
│   ├── job-card.tsx            # Individual job display
│   ├── search-filters.tsx      # Search filter controls
│   └── PixelCard.tsx
├── organisms/          # Complex components
│   ├── aurora.tsx
│   ├── auth-form.tsx
│   ├── cta-section.tsx
│   ├── footer.tsx
│   ├── hero-section.tsx
│   ├── job-search-form.tsx      # Job search interface
│   ├── job-results-list.tsx     # Job search results
│   ├── job-filters.tsx          # Advanced job filtering
│   ├── logo-loop.tsx
│   └── navbar.tsx
├── ui/                 # Shadcn/ui components
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── collapsible.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
└── layouts/            # Layout components (future)
```

## Atomic Design Principles

### Atoms
Basic building blocks that cannot be broken down further without losing functionality.

**Examples:**
- `theme-toggle.tsx`: Theme switching button
- `logo-grant-guide.tsx`: Application logo component
- `loading-page.tsx`: Loading spinner and states

**Characteristics:**
- Single responsibility
- No business logic
- Reusable across the application
- Minimal props interface

### Molecules
Simple combinations of atoms that work together as a unit.

**Examples:**
- `features-grid.tsx`: Grid layout of feature items
- `PixelCard.tsx`: Card component with pixel art styling
- `cubes.tsx`: 3D cube animation component

**Characteristics:**
- Composed of multiple atoms
- Basic interactive functionality
- Reusable in different contexts
- Clear props interface

### Organisms
Complex components that form distinct sections of the interface.

**Examples:**
- `auth-form.tsx`: Complete authentication form
- `navbar.tsx`: Navigation header with menu items
- `hero-section.tsx`: Landing page hero section
- `footer.tsx`: Site footer with links and information

**Characteristics:**
- Business logic integration
- Multiple molecules and atoms
- Context-specific functionality
- Rich props interface

## UI Component System

The application uses shadcn/ui components for consistent design and accessibility.

### Base Components

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Usage examples
<Button variant="default" size="lg">Primary Action</Button>
<Button variant="outline" size="sm">Secondary Action</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

#### Card Component
```typescript
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// Sub-components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Input Components
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

// Form integration
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

## Key Component Implementations

### Authentication Form (`auth-form.tsx`)

Complex organism handling user authentication with multiple states and validation.

**Key Features:**
- Dual mode: Sign In / Sign Up
- Form validation with error handling
- Loading states during authentication
- Integration with Firebase Auth
- Responsive design

**Props Interface:**
```typescript
interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  className?: string;
}
```

**Usage:**
```typescript
<AuthForm
  mode="signup"
  onSuccess={(user) => router.push('/dashboard')}
  onError={(error) => toast.error(error)}
/>
```

### Navigation Bar (`navbar.tsx`)

Responsive navigation component with authentication state awareness.

**Key Features:**
- Responsive design (mobile menu)
- Authentication state integration
- Theme switching support
- Active route highlighting
- Dropdown menu for user actions

**Implementation Highlights:**
```typescript
export function Navbar() {
  const { user, userData, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Desktop navigation */}
      <div className="hidden md:flex">
        {user ? <AuthenticatedNav /> : <PublicNav />}
      </div>
      
      {/* Mobile navigation */}
      <MobileNav isOpen={isMenuOpen} onToggle={setIsMenuOpen} />
    </nav>
  );
}
```

### Hero Section (`hero-section.tsx`)

Landing page hero component with animations and call-to-action elements.

**Key Features:**
- Animated background elements
- Responsive typography
- Call-to-action buttons
- Integration with auth state
- Performance optimized animations

### Cookie Banner (`cookie-banner.tsx`)

GDPR-compliant cookie consent component with database persistence.

**Key Features:**
- GDPR compliance
- Database persistence
- Cookie preference management
- Dismiss functionality
- Privacy policy integration

**Implementation:**
```typescript
export function CookieBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    // Save consent to database
    await DatabaseService.updateUserProfile(user.uid, {
      cookieConsent: {
        accepted: true,
        date: serverTimestamp(),
        version: '1.0'
      }
    });
    
    setIsVisible(false);
  };

  // Component JSX with Material-UI inspired design
}
```

## Component Communication Patterns

### Props Flow
Standard parent-to-child communication using props.

```typescript
// Parent component
<UserProfile
  user={userData}
  onUpdate={handleProfileUpdate}
  isEditing={isEditing}
/>

// Child component
interface UserProfileProps {
  user: UserData;
  onUpdate: (updates: Partial<UserData>) => void;
  isEditing: boolean;
}
```

### Context Integration
Components integrate with React Context for global state.

```typescript
// Using Auth Context
export function ProtectedComponent() {
  const { user, userData, loading } = useAuth();
  
  if (loading) return <LoadingPage />;
  if (!user) return <AuthForm />;
  
  return <div>Protected content for {userData?.displayName}</div>;
}

// Using Theme Context
export function ThemedComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Button onClick={toggleTheme}>
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  );
}
```

### Event Handling
Standardized event handling patterns for user interactions.

```typescript
// Form submission
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const formData = new FormData(e.currentTarget);
    await onSubmit(Object.fromEntries(formData));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Async button actions
const handleAsyncAction = async () => {
  setLoading(true);
  try {
    await performAction();
    toast.success('Action completed successfully');
  } catch (error) {
    toast.error('Action failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

## Styling Architecture

### Tailwind CSS Classes
Utility-first CSS framework for rapid development.

```typescript
// Example component with Tailwind classes
export function Card({ children, className }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}
```

### CSS Custom Properties
Design system implemented with CSS variables.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --card: 0 0% 100%;
  --card-foreground: 224 71.4% 4.1%;
  --primary: 220.9 39.3% 11%;
  --primary-foreground: 210 20% 98%;
  /* ... more variables */
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  /* ... dark theme overrides */
}
```

### Component Variants
Consistent styling patterns using class variance authority.

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Performance Optimization

### Component Memoization
Preventing unnecessary re-renders with React.memo and useMemo.

```typescript
// Memoized component
export const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});

// Memoized callback
export function ParentComponent() {
  const handleUpdate = useCallback((id: string, updates: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return <ExpensiveComponent data={items} onUpdate={handleUpdate} />;
}
```

### Lazy Loading
Code splitting for better performance.

```typescript
// Lazy loaded components
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyProfile = lazy(() => import('./Profile'));

// Route-based code splitting
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={
          <Suspense fallback={<LoadingPage />}>
            <LazyDashboard />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
}
```

## Testing Components

### Unit Testing
Testing individual components in isolation.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

### Integration Testing
Testing component interactions and data flow.

```typescript
describe('AuthForm Integration', () => {
  test('completes sign up flow', async () => {
    const mockOnSuccess = jest.fn();
    
    render(<AuthForm mode="signup" onSuccess={mockOnSuccess} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test User' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Create Account'));
    
    // Wait for success
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

## Accessibility Guidelines

### ARIA Labels and Roles
Ensuring components are accessible to screen readers.

```typescript
export function SearchInput({ onSearch }) {
  return (
    <div role="search">
      <Label htmlFor="search-input" className="sr-only">
        Search jobs
      </Label>
      <Input
        id="search-input"
        type="search"
        placeholder="Search for jobs..."
        aria-describedby="search-description"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div id="search-description" className="sr-only">
        Type to search for job opportunities
      </div>
    </div>
  );
}
```

### Keyboard Navigation
Ensuring all interactive elements are keyboard accessible.

```typescript
export function DropdownMenu({ items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelect(items[selectedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Dropdown implementation */}
    </div>
  );
}
```

## Job Market Components

### Job Search Form (`job-search-form.tsx`)

Complex organism handling job search functionality with advanced filtering.

**Key Features:**
- Search term input with autocomplete
- Location selection with geolocation
- Multi-site selection (Indeed, LinkedIn, etc.)
- Advanced filtering options
- Real-time validation
- Form state persistence

**Props Interface:**
```typescript
interface JobSearchFormProps {
  onSearch: (params: JobSearchParams) => void;
  initialParams?: Partial<JobSearchParams>;
  isLoading?: boolean;
  className?: string;
}
```

**Usage:**
```typescript
<JobSearchForm
  onSearch={handleJobSearch}
  initialParams={defaultSearchParams}
  isLoading={searchLoading}
/>
```

### Job Results List (`job-results-list.tsx`)

Organism displaying job search results with pagination and sorting.

**Key Features:**
- Virtual scrolling for performance
- Infinite scroll pagination
- Sort and filter controls
- Job card layout with expandable details
- Loading states and error handling
- Accessibility support

**Implementation:**
```typescript
export function JobResultsList({ jobs, isLoading, error }: JobResultsListProps) {
  const [sortBy, setSortBy] = useState<JobSortOption>('relevance');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const sortedJobs = useMemo(() => {
    return [...jobs].sort(getJobSorter(sortBy));
  }, [jobs, sortBy]);

  return (
    <div className="space-y-4">
      <JobResultsHeader 
        count={jobs.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      <div className="grid gap-4">
        {sortedJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            isExpanded={expandedJob === job.id}
            onToggleExpand={setExpandedJob}
          />
        ))}
      </div>
    </div>
  );
}
```

### Job Card (`job-card.tsx`)

Molecule component for displaying individual job postings.

**Key Features:**
- Company logo and branding
- Salary range display
- Location and remote indicators
- Quick apply buttons
- Bookmark functionality
- Share options

**Props Interface:**
```typescript
interface JobCardProps {
  job: JobData;
  isExpanded?: boolean;
  onToggleExpand?: (jobId: string | null) => void;
  onApply?: (job: JobData) => void;
  onBookmark?: (job: JobData) => void;
  className?: string;
}
```

### Search Filters (`search-filters.tsx`)

Molecule component for advanced job search filtering.

**Key Features:**
- Job type selection (fulltime, parttime, etc.)
- Salary range slider
- Date posted filters
- Remote work toggle
- Company size filters
- Industry selection

**Implementation:**
```typescript
export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (key: keyof JobSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Job Type</Label>
        <JobTypeSelector
          value={filters.jobTypes}
          onChange={(types) => handleFilterChange('jobTypes', types)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Salary Range</Label>
        <SalaryRangeSlider
          min={filters.salaryMin}
          max={filters.salaryMax}
          onChange={(range) => {
            handleFilterChange('salaryMin', range.min);
            handleFilterChange('salaryMax', range.max);
          }}
        />
      </div>
    </Card>
  );
}
```

## Integration with Job Market API

Components integrate seamlessly with the job scraping API using SWR hooks:

```typescript
// In job search page
export function JobMarketPage() {
  const [searchParams, setSearchParams] = useState<JobSearchParams | null>(null);
  
  const {
    data: jobs,
    error,
    isLoading,
    mutate: refetchJobs
  } = useJobSearch(searchParams);

  return (
    <div className="container mx-auto px-4 py-6">
      <JobSearchForm onSearch={setSearchParams} />
      
      {error && <ErrorAlert error={error} onRetry={() => refetchJobs()} />}
      
      <JobResultsList 
        jobs={jobs || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
```

---

*This component architecture provides a scalable, maintainable foundation for the Blairify application with consistent design patterns, excellent developer experience, and seamless integration between interview preparation and job market features.*