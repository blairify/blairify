# Interview System Architecture

## Overview

This document describes the restructured interview system architecture, moving from a tightly coupled prototype to a scalable, maintainable service-oriented design.

## Architecture Principles

### 1. Separation of Concerns
- **Types & Interfaces**: Centralized in `/src/types/`
- **Configuration**: Centralized in `/src/lib/config/`
- **Business Logic**: Service layer in `/src/lib/services/`
- **API Layer**: Thin controllers in `/src/app/api/`
- **UI Layer**: React hooks and components

### 2. Dependency Injection
- Services are injected rather than tightly coupled
- AI client is configurable and mockable
- Easy to swap implementations

### 3. Error Handling
- Consistent error handling across all layers
- Graceful degradation when AI services fail
- Proper validation at API boundaries

## Directory Structure

```
src/
├── types/
│   └── interview.ts                 # Core type definitions
├── lib/
│   ├── config/
│   │   └── interview-config.ts      # Configuration constants
│   └── services/
│       ├── ai/
│       │   ├── ai-client.ts         # External AI API client
│       │   ├── prompt-generator.ts  # AI prompt generation
│       │   └── response-validator.ts # AI response validation
│       ├── interview/
│       │   ├── interview-service.ts # Core interview logic
│       │   └── analysis-service.ts  # Analysis processing
│       └── index.ts                 # Service exports
├── hooks/
│   ├── use-interview.ts             # Interview interaction hook
│   ├── use-interview-analysis.ts    # Analysis hook
│   └── index.ts                     # Hook exports
└── app/api/
    └── interview/
        ├── route-new.ts             # New interview API
        └── analyze/
            └── route-new.ts         # New analysis API
```

## Service Layer Details

### AI Services (`/src/lib/services/ai/`)

#### AIClient
- **Purpose**: Handles external AI API calls (Mistral)
- **Features**: 
  - Configurable API settings
  - Automatic fallback when unavailable
  - Error handling and retry logic
  - Mock response generation

#### PromptGenerator
- **Purpose**: Generates AI prompts for different contexts
- **Features**:
  - System prompt generation
  - User prompt generation
  - Analysis prompt generation
  - Context-aware prompt building

#### ResponseValidator
- **Purpose**: Validates and sanitizes AI responses
- **Features**:
  - Content appropriateness checking
  - Format validation
  - Response quality analysis
  - User response categorization

### Interview Services (`/src/lib/services/interview/`)

#### InterviewService
- **Purpose**: Core interview business logic
- **Features**:
  - Question type determination
  - Follow-up decision logic
  - Response quality analysis
  - Configuration validation
  - Session management utilities

#### AnalysisService
- **Purpose**: Interview analysis processing
- **Features**:
  - Analysis parsing and structuring
  - Mock analysis generation
  - Score calculation and validation
  - Feedback formatting

## API Layer

### New Route Handlers
- **Thin controllers**: Minimal logic, delegate to services
- **Proper validation**: Input validation at API boundaries
- **Error handling**: Consistent error responses
- **Type safety**: Full TypeScript integration

### Migration Strategy
1. Keep old routes for backward compatibility
2. Gradually migrate frontend to use new routes
3. Remove old routes after full migration

## Client Layer

### React Hooks
- **useInterview**: Manages interview interactions
- **useInterviewAnalysis**: Handles analysis requests
- **Error handling**: Consistent error states
- **Loading states**: Proper loading indicators

### Benefits
- Reusable across components
- Consistent API interaction patterns
- Built-in error handling
- Type-safe interfaces

## Configuration Management

### Centralized Configuration
- **Interview settings**: Question counts, durations, thresholds
- **Seniority expectations**: Score thresholds and descriptions
- **Company prompts**: Company-specific interview contexts
- **Validation patterns**: Response validation rules

### Environment-Based Configuration
- **Development**: Mock responses, debug logging
- **Production**: Real AI services, error tracking
- **Testing**: Deterministic responses, fast execution

## Error Handling Strategy

### Layered Error Handling
1. **Service Layer**: Business logic errors, validation failures
2. **API Layer**: HTTP errors, request validation
3. **Client Layer**: Network errors, user feedback
4. **UI Layer**: User-friendly error messages

### Graceful Degradation
- **AI Service Unavailable**: Fall back to mock responses
- **Network Issues**: Retry with exponential backoff
- **Validation Failures**: Clear error messages with guidance

## Testing Strategy

### Unit Tests
- **Services**: Business logic, validation, calculations
- **Utilities**: Helper functions, formatters
- **Hooks**: React hook behavior

### Integration Tests
- **API Routes**: End-to-end API testing
- **Service Integration**: Service interaction testing

### E2E Tests
- **User Flows**: Complete interview workflows
- **Error Scenarios**: Error handling validation

## Performance Considerations

### Caching
- **AI Responses**: Cache common responses
- **Configuration**: Cache static configuration
- **Analysis Results**: Cache analysis for review

### Optimization
- **Lazy Loading**: Load services on demand
- **Request Batching**: Batch multiple API calls
- **Response Streaming**: Stream long AI responses

## Security Considerations

### API Security
- **Input Validation**: Sanitize all inputs
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Secure API endpoints

### Data Privacy
- **PII Handling**: Secure handling of user data
- **AI Data**: Secure transmission to AI services
- **Storage**: Encrypted storage of sensitive data

## Deployment Considerations

### Microservice Ready
- **Service Isolation**: Services can be extracted to separate deployments
- **API Versioning**: Support for multiple API versions
- **Configuration Management**: Environment-based configuration

### Scalability
- **Horizontal Scaling**: Stateless service design
- **Load Balancing**: Distribute AI service calls
- **Monitoring**: Comprehensive logging and metrics

## Migration Path

### Phase 1: Infrastructure (Completed)
- ✅ Create new service layer
- ✅ Implement new API routes
- ✅ Create React hooks

### Phase 2: Frontend Migration (Next)
- [ ] Update interview page to use new hooks
- [ ] Update results page to use new analysis hook
- [ ] Add error boundaries and loading states

### Phase 3: Cleanup
- [ ] Remove old API routes
- [ ] Clean up old service code
- [ ] Update documentation

### Phase 4: Enhancement
- [ ] Add comprehensive testing
- [ ] Implement caching layer
- [ ] Add monitoring and metrics

## Usage Examples

### Using the New Services

```typescript
// Interview interaction
import { useInterview } from "@/hooks";
import { InterviewService } from "@/lib/services";

const { sendMessage, isLoading, error } = useInterview({
  onError: (error) => toast.error(error),
  onSuccess: (message) => console.log("AI response:", message)
});

// Send a message
const aiResponse = await sendMessage(
  userMessage,
  conversationHistory,
  interviewConfig,
  questionCount
);
```

```typescript
// Analysis
import { useInterviewAnalysis } from "@/hooks";

const { analyzeInterview, isAnalyzing, results } = useInterviewAnalysis({
  onSuccess: (results) => {
    // Handle successful analysis
    console.log("Analysis complete:", results);
  }
});

// Analyze interview
const analysisResults = await analyzeInterview(
  conversationHistory,
  interviewConfig
);
```

### Direct Service Usage

```typescript
// Direct service usage (for server-side or advanced use cases)
import { InterviewService, PromptGenerator, AIClient } from "@/lib/services";

// Generate prompts
const systemPrompt = PromptGenerator.generateSystemPrompt(config);
const userPrompt = PromptGenerator.generateUserPrompt(message, history, config, count, false);

// Get AI response
const aiClient = new AIClient({ apiKey: "your-key" });
const response = await aiClient.generateInterviewResponse(systemPrompt, userPrompt);

// Validate configuration
const validation = InterviewService.validateInterviewConfig(config);
if (!validation.isValid) {
  console.error("Invalid config:", validation.errors);
}
```

## Benefits of New Architecture

### For Developers
- **Clear separation of concerns**
- **Easy to test and mock**
- **Consistent patterns across codebase**
- **Type-safe interfaces**
- **Reusable components**

### For Product
- **Faster feature development**
- **More reliable error handling**
- **Better user experience**
- **Easier to maintain and debug**
- **Scalable for future growth**

### For Operations
- **Better monitoring and logging**
- **Easier deployment and rollback**
- **Clear service boundaries**
- **Environment-specific configuration**
- **Performance optimization opportunities**
