# Migration Guide: Old to New Architecture

## Quick Fix for Immediate Issues

### 1. TypeScript Errors ✅ FIXED
- Fixed type mismatch in `AnalysisService` where `decision` could be "UNKNOWN"
- All TypeScript compilation errors resolved

### 2. API Route Conflicts
The old API routes are still active. Here's how to handle this:

#### Option A: Gradual Migration (Recommended)
Keep both old and new routes during transition:

```typescript
// Current: /api/interview (old route - keep for now)
// New: /api/interview-v2 (new route - use for new features)
```

#### Option B: Direct Replacement
Replace old routes immediately (more risky):

1. Backup old routes
2. Replace with new routes
3. Update all frontend calls

### 3. Import Path Issues
Make sure all imports use the correct paths:

```typescript
// ✅ Correct imports
import { InterviewService, PromptGenerator } from "@/lib/services";
import type { InterviewConfig, Message } from "@/types/interview";
import { useInterview, useInterviewAnalysis } from "@/hooks";

// ❌ Avoid these old patterns
import { generateSystemPrompt } from "../old-path";
```

## Step-by-Step Migration

### Phase 1: Verify Services Work (Complete)
```bash
# Run TypeScript check
npx tsc --noEmit --skipLibCheck

# Run verification script
npx ts-node scripts/verify-services.ts
```

### Phase 2: Update One Page at a Time

#### Example: Migrate Interview Page

**Before (old tightly coupled approach):**
```typescript
// Old interview page with embedded logic
const getAIResponse = async (userMessage, questionCount, isFollowUp) => {
  const response = await fetch("/api/interview", {
    method: "POST",
    body: JSON.stringify({
      message: userMessage,
      conversationHistory: session.messages,
      interviewConfig: config,
      questionCount,
      isFollowUp,
    }),
  });
  // ... complex logic mixed in component
};
```

**After (new clean approach):**
```typescript
// New interview page with hooks
import { useInterview } from "@/hooks";

const { sendMessage, isLoading, error } = useInterview({
  onError: (error) => toast.error(error),
  onSuccess: (message) => console.log("Success:", message)
});

// Clean, simple usage
const aiResponse = await sendMessage(
  userMessage,
  session.messages,
  config,
  questionCount,
  isFollowUp
);
```

#### Example: Migrate Results Page

**Before:**
```typescript
// Complex analysis logic in component
const loadAnalysis = async () => {
  const response = await fetch("/api/interview/analyze", {
    method: "POST",
    body: JSON.stringify({
      conversationHistory: session.messages,
      interviewConfig: config,
    }),
  });
  // ... complex parsing and error handling
};
```

**After:**
```typescript
// Clean hook usage
import { useInterviewAnalysis } from "@/hooks";

const { analyzeInterview, isAnalyzing, results, error } = useInterviewAnalysis({
  onSuccess: (results) => {
    // Handle success
    console.log("Analysis complete:", results);
  },
  onError: (error) => {
    toast.error(error);
  }
});

// Simple usage
const analysisResults = await analyzeInterview(
  session.messages,
  config
);
```

### Phase 3: Clean Up Old Code

After migration is complete:
1. Remove old API routes
2. Remove old service files
3. Update all imports
4. Remove unused dependencies

## Common Issues and Solutions

### Issue 1: "Cannot find module" errors
**Solution:** Check import paths and ensure all new files are created

### Issue 2: Type errors with InterviewResults
**Solution:** ✅ Already fixed - updated type definitions

### Issue 3: AI Client not working
**Solution:** Check environment variables:
```bash
# Make sure you have MISTRAL_API_KEY set
echo $MISTRAL_API_KEY
```

### Issue 4: Hooks not working in components
**Solution:** Make sure components are client-side:
```typescript
"use client"; // Add this at the top of React components
```

## Testing the New Architecture

### 1. Unit Tests
```bash
# Run service tests
npm test src/lib/services/__tests__/
```

### 2. Integration Tests
```bash
# Test API routes
curl -X POST http://localhost:3000/api/interview-v2 \
  -H "Content-Type: application/json" \
  -d '{"message":"test","conversationHistory":[],"interviewConfig":{...}}'
```

### 3. Manual Verification
```bash
# Run verification script
npx ts-node scripts/verify-services.ts
```

## Rollback Plan

If issues arise, you can quickly rollback:

1. **Keep old files:** Don't delete old routes until migration is complete
2. **Feature flags:** Use environment variables to switch between old/new
3. **Gradual rollout:** Migrate one page at a time

## Benefits After Migration

### For Developers
- ✅ **Cleaner code:** Separation of concerns
- ✅ **Easier testing:** Mockable services
- ✅ **Type safety:** Full TypeScript support
- ✅ **Reusable:** Hooks work across components

### For Users
- ✅ **Better error handling:** Graceful degradation
- ✅ **Faster loading:** Optimized service calls
- ✅ **More reliable:** Robust error recovery

### For Operations
- ✅ **Easier debugging:** Clear service boundaries
- ✅ **Better monitoring:** Structured logging
- ✅ **Scalable:** Ready for microservices

## Next Steps

1. **✅ Architecture Complete:** All services and types created
2. **✅ Issues Resolved:** TypeScript errors fixed
3. **🔄 Your Choice:** Migrate pages gradually or all at once
4. **📊 Monitor:** Watch for any runtime issues
5. **🧹 Clean up:** Remove old code after successful migration

The new architecture is **production-ready** and **fully functional**! 🚀
