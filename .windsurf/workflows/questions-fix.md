---
auto_execution_mode: 1
---

# Question Bank Refinement Workflow

I am refining multiple question banks to ensure consistency and accuracy across all fields. Please analyze and fix the following issues:

## 1. Seniority Level Refinement

### Rules:
- **Entry-level questions**: Any junior-level question that covers basic, foundational concepts should ALSO include `"entry"` in the seniority levels array
  - Example: `"seniorityLevels": ["entry", "junior"]`
  
- **Overlapping levels**: Questions can span multiple adjacent levels:
  - Junior + Mid: `"seniorityLevels": ["junior", "mid"]` - for questions that bridge foundational and intermediate knowledge
  - Mid + Senior: `"seniorityLevels": ["mid", "senior"]` - for advanced topics that senior developers should master but mid-level developers should be learning

### Evaluation Criteria:
- **Entry/Junior**: "What is X?", basic syntax, fundamental concepts, common patterns
- **Junior/Mid**: Implementation details, best practices, common pitfalls, framework-specific features
- **Mid/Senior**: Architecture decisions, performance optimization, security deep-dives, complex patterns

---

## 2. Position Assignment

### Available Positions:
```typescript
type RoleTopic =
  | "frontend"      // UI/UX, client-side development
  | "backend"       // Server-side, APIs, databases
  | "fullstack"     // Both frontend and backend
  | "devops"        // Infrastructure, CI/CD, deployment
  | "mobile"        // iOS, Android, cross-platform
  | "data-engineer" // Data pipelines, ETL, data infrastructure
  | "data-scientist"// ML, analytics, statistical modeling
  | "cybersecurity" // Security engineering and practices
```

### Assignment Rules:

#### Always Include Multiple Positions When:
1. **Web framework questions** → `["fullstack", "backend"]` (minimum)
2. **Security topics** (CORS, CSRF, XSS, authentication) → `["fullstack", "backend", "cybersecurity"]`
3. **API development** → `["fullstack", "backend"]`
4. **Database/ORM topics** → `["fullstack", "backend", "data-engineer"]`
5. **Frontend-specific** (Razor, Tag Helpers, View Components) → `["frontend", "fullstack"]`
6. **General architecture** → `["fullstack", "backend"]` (minimum)

#### Never Leave Empty:
- `"positions": []` is NEVER acceptable
- Every question must have at least 1 position, most should have 2-3

#### Think Broadly:
- Don't restrict questions to narrow specializations
- Ask: "Who else would need to know this in their daily work?"

---

## 3. Interview Type Assignment

### Rules:
- **Competitive interview type**: Add `"competitive"` to the `interviewTypes` array for:
  - All `"senior"` level questions
  - `"mid"` level questions with `"difficulty": "mid"` that cover advanced topics
  
### Result Format:
```json
"interviewTypes": ["regular", "practice", "flash", "teacher", "competitive"]
```

**Note**: Keep existing interview types, just ADD `"competitive"` where appropriate.

---

## 4. Company Type Standardization

### Rule:
**Every question** should support all company types:
```json
"companyType": ["faang", "startup", "enterprise"]
```

### Rationale:
- Core technical concepts are universal across company types
- The question bank should be flexible for various contexts
- Company-specific filtering can happen at the application level

---

## Example Transformation

### Before:
```json
{
  "id": "aspnet-core-questions-bank-24",
  "difficulty": "mid",
  "companyType": "enterprise",
  "positions": ["cybersecurity"],
  "interviewTypes": ["regular", "practice", "flash", "teacher"],
  "seniorityLevels": ["mid", "senior"]
}
```

### After:
```json
{
  "id": "aspnet-core-questions-bank-24",
  "difficulty": "mid",
  "companyType": ["faang", "startup", "enterprise"],
  "positions": ["fullstack", "backend", "cybersecurity"],
  "interviewTypes": ["regular", "practice", "flash", "teacher", "competitive"],
  "seniorityLevels": ["mid", "senior"]
}
```

---

## Action Items

For each question in the question bank:

1. ✅ Review difficulty level and adjust `seniorityLevels` array
2. ✅ Expand `positions` array to include all relevant roles
3. ✅ Add `"competitive"` to `interviewTypes` if senior or advanced mid-level
4. ✅ Change `companyType` from string to array with all three values
5. ✅ Verify no `positions` arrays are empty

---

## Quality Checklist

Before completing:
- [ ] No questions have `"positions": []`
- [ ] All easy junior questions include `"entry"` in seniority levels
- [ ] All security questions include cybersecurity + relevant dev roles
- [ ] All senior questions have `"competitive"` interview type
- [ ] All questions have `"companyType": ["faang", "startup", "enterprise"]`
- [ ] Database/ORM questions include data-engineer position
- [ ] Frontend-specific questions include frontend + fullstack