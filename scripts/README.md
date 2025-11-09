# Scripts Directory

## 🎯 Active Scripts (New Practice Library)

### Main Migration Script
- **`seed-all-questions.ts`** - Complete migration script (USE THIS!)
  - Converts all questions to new schema
  - Seeds to Firestore
  - Run: `npx ts-node scripts/seed-all-questions.ts --clear`

### Supporting Files
- **`questions-data-only.ts`** - Extracted question data (146 questions)
- **`convert-old-questions.ts`** - Conversion utilities
- **`extract-questions.js`** - Question extraction helper
- **`run-migration.sh`** - Interactive migration runner
- **`serviceAccounts.json`** - Firebase admin credentials (not in git)

## 🗑️ Deprecated (Old System)
These scripts are no longer needed:
- ~~`seed-interview-questions.ts`~~ - Removed
- ~~`seed-interview-questions-2.ts`~~ - Removed
- ~~`seed-practice-questions.ts`~~ - Removed
- ~~`seed-from-existing.ts`~~ - Removed
- ~~`question-bank.ts`~~ - Removed

## 📚 Question Generation (Optional)
- **`generate-comprehensive-questions.ts`** - Generate new questions with AI
- **`generate-500-questions.py`** - Python question generator
- **`run-question-generation.sh`** - Question generation runner

## 🔧 Utilities
- **`verify-services.ts`** - Verify Firebase services
- **`tsconfig.json`** - TypeScript configuration

## New Question Schema

The new schema supports 5 question types:

1. **Open** - Essay-style with semantic LLM evaluation
2. **MCQ** - Multiple choice (single/multiple answers)
3. **Code** - Programming challenges with test cases
4. **Matching** - Pair matching questions
5. **TrueFalse** - Binary questions with explanations

## Usage

### Basic Seeding

```bash
# Seed questions (adds to existing)
npx ts-node scripts/seed-practice-questions.ts
```

### Clear and Reseed

```bash
# Clear existing questions and seed fresh
npx ts-node scripts/seed-practice-questions.ts --clear
```

## Question Structure Examples

### Open Question
```typescript
{
  type: "open",
  difficulty: "junior",
  status: "published",
  title: "Explain React Hooks",
  prompt: "What are React Hooks...",
  topic: "Frontend Development",
  data: {
    referenceAnswers: [{
      text: "React Hooks are...",
      keyPoints: ["State management", "Lifecycle"]
    }],
    evaluationCriteria: {
      completeness: 0.3,
      accuracy: 0.4,
      clarity: 0.2,
      depth: 0.1
    }
  }
}
```

### Code Question
```typescript
{
  type: "code",
  difficulty: "entry",
  title: "Two Sum Problem",
  data: {
    language: "javascript",
    starterCode: "function twoSum(nums, target) {...}",
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" }
    ],
    evaluationCriteria: {
      correctness: 0.5,
      efficiency: 0.2,
      codeQuality: 0.2,
      edgeCases: 0.1
    }
  }
}
```

### MCQ Question
```typescript
{
  type: "mcq",
  difficulty: "entry",
  title: "React Component Lifecycle",
  data: {
    options: [
      { id: "a", text: "useEffect(() => {}, [])", isCorrect: true },
      { id: "b", text: "useState()", isCorrect: false }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true
  }
}
```

## Adding New Questions

### Option 1: Edit question-bank.ts

Add questions directly to the `questionBank` array:

```typescript
export const questionBank = [
  // ... existing questions
  {
    type: "open",
    difficulty: "middle",
    status: "published",
    title: "Your Question Title",
    // ... rest of the fields
  }
];
```

### Option 2: Create Separate Question File

```typescript
// scripts/my-questions.ts
import { FieldValue } from "firebase-admin/firestore";

export const myQuestions = [
  {
    type: "open",
    // ... question data
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }
];
```

Then import in seed script:

```typescript
import { myQuestions } from "./my-questions";
const allQuestions = [...questionBank, ...myQuestions];
```

## Migrating Old Questions

To convert questions from the old format:

1. **Old format** had: `category`, `difficulty: "easy|medium|hard"`, `question`, `answer`
2. **New format** needs: `type`, `difficulty: "entry|junior|middle|senior"`, `prompt`, `data`

### Conversion Example

```typescript
// Old format
{
  category: "algorithms",
  difficulty: "medium",
  question: "Explain binary search",
  answer: "Binary search is..."
}

// New format (Open)
{
  type: "open",
  difficulty: "junior", // medium → junior
  prompt: "Explain binary search",
  topic: "Algorithms & Data Structures",
  data: {
    referenceAnswers: [{
      text: "Binary search is...",
      keyPoints: ["Sorted array", "O(log n)", "Divide and conquer"]
    }]
  }
}
```

## Difficulty Mapping

| Old | New |
|-----|-----|
| easy | entry |
| medium | junior |
| hard | middle |
| - | senior |

## Question Type Guidelines

### When to use Open
- Conceptual explanations
- System design
- Best practices discussions
- "How would you..." questions

### When to use Code
- Algorithm implementation
- Data structure problems
- Coding challenges
- "Write a function..." questions

### When to use MCQ
- Quick knowledge checks
- Concept verification
- Multiple valid approaches
- Terminology questions

### When to use TrueFalse
- Fact verification
- Common misconceptions
- Quick assessments

## Validation

Before seeding, ensure:

1. ✅ All required fields present
2. ✅ `type` is one of: open, mcq, code, matching, truefalse
3. ✅ `difficulty` is one of: entry, junior, middle, senior
4. ✅ `status` is "published"
5. ✅ `data` object matches question type
6. ✅ `evaluationCriteria` weights sum to 1.0

## Troubleshooting

### Error: "Service account not found"
- Ensure `serviceAccounts.json` exists in scripts folder
- Check file permissions

### Error: "Batch write limit exceeded"
- Script automatically batches in chunks of 500
- If still failing, reduce BATCH_SIZE in script

### Error: "Invalid question structure"
- Verify all required fields are present
- Check `data` object matches question type
- Ensure timestamps use `FieldValue.serverTimestamp()`

## Best Practices

1. **Group related questions** - Keep similar topics together
2. **Use consistent naming** - Follow title conventions
3. **Add comprehensive tags** - Helps with filtering
4. **Include company context** - When relevant
5. **Test evaluation criteria** - Ensure weights make sense
6. **Write clear prompts** - Be specific and unambiguous
7. **Provide good reference answers** - Include key points
8. **Add test cases for code** - Cover edge cases

## Next Steps

After seeding:

1. Verify questions in Firestore console
2. Test evaluation with sample answers
3. Monitor LLM costs
4. Gather user feedback
5. Iterate on question quality

## Support

For issues or questions about seeding:
- Check Firestore console for seeded data
- Review `PRACTICE_LIBRARY_IMPLEMENTATION_GUIDE.md`
- Check Firebase Admin SDK logs
