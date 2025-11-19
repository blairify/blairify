# Practice Library Database Schema

Human-readable reference for `src/practice-library-db/schema.ts`.

The practice library uses **4 tables**:

1. `practice_questions` – one row per question (any type)
2. `practice_mcq_options` – answer options for MCQ questions
3. `practice_matching_pairs` – left/right pairs for matching questions
4. `practice_system_design_charts` – system design charts for system-design questions

---

## Table: `practice_questions`

**Purpose**

All questions live here, regardless of type. Type-specific details are either:

- stored directly on this table (open, true/false, some code/matching flags), or
- stored in linked tables (MCQ options, matching pairs, code test cases).

**Columns**

- `id` (text, PK)
  - Unique ID of the question.

- `type` (text → `QuestionType`)
  - Question format: `"mcq" | "open" | "matching" | "truefalse" | "system-design"`.

- `difficulty` (text → `DifficultyLevel`)
  - Difficulty: `"entry" | "junior" | "middle" | "senior"`.

- `status` (text → `QuestionStatus`)
  - Lifecycle state: `"draft" | "published" | "archived"`.

- `isDemoMode` (boolean)
  - Whether this question is a demo question.

- `companyType` (text → `CompanyType`)
  - Company type: `"faang" | "startup" | "enterprise"`.

- `title` (text)
  - Short, human-readable title.

- `description` (text)
  - Longer explanation / extended context.

- `prompt` (text)
  - Actual question prompt shown in the UI and to the AI.

- `topic` (text)
  - Main topic (e.g. `"frontend"`, `"system-design"`).

- `subtopics` (text[], default `[]`)
  - Additional subtopics for more granular filtering.

- `tags` (text[], default `[]`)
  - Tags used for search and filtering.

- `estimatedTimeMinutes` (integer, default `0`)
  - Approximate time to solve the question.

- `aiEvaluationHint` (text, nullable)
  - Optional guidance text for how the AI should evaluate or respond to answers for this question.

- `multiChoiceAnswers` (text[], nullable)
  - Array of correct answers for MCQ questions.

- `companies` (jsonb, nullable)
  - Optional list of companies for which this question is relevant.
  - Each entry:
    - `name`: company name (e.g. `"Google"`).
    - `logo`: icon name (e.g. `"SiGoogle"`).
    - `size?`: array of segments (e.g. `["faang"]`, `["startup"]`).
    - `description`: description of the company.

- `positions` (text[], default `[]`)
  - Relevant roles (e.g. `"Frontend Engineer"`, `"Full Stack Developer"`).

- `primaryTechStack` (text[], default `[]`)
  - Tech stack labels (e.g. `"react"`, `"typescript"`, `"nodejs"`).

- `interviewTypes` (text[], default `[]`)
  - Where this question is used in interviews:
    - `"regular" | "practice" | "flash" | "play" | "competitive" | "teacher"`.

- `seniorityLevels` (text[], default `[]`)
  - Seniority levels this question targets.

- `createdAt` (timestamp with timezone)
  - When the question was created.

- `updatedAt` (timestamp with timezone)
  - When the question was last updated.

- `createdBy` (text)
  - ID of the user/admin who created the question.

### System design questions (type = `"system-design"`)

- System design diagrams/charts are stored in the `practice_system_design_charts` table.
- Each chart row contains a `chart` (jsonb, default `[]`) with structured nodes and relationships so the UI and AI can understand the system.

### Open questions (type = `"open"`)

- `openReferenceAnswers` (jsonb, nullable)
  - Array of reference answers used as **guidance**, not strict strings.
  - Each entry (`ReferenceAnswer`):
    - `id`: internal identifier.
    - `text`: sample / reference answer.
    - `weight`: importance (0–1).

### True/False questions (type = `"truefalse"`)

- `trueFalseCorrectAnswer` (boolean, nullable)
  - Whether the statement is true or false.

- `trueFalseExplanation` (text, nullable)
  - Explanation for why the statement is true or false.

### Matching questions (type = `"matching"`)

- `matchingShuffleLeft` (boolean, nullable)
  - Whether to shuffle the left side.

- `matchingShuffleRight` (boolean, nullable)
  - Whether to shuffle the right side.

- `matchingPairs` (jsonb, nullable)
  - Array of left/right pairs for matching questions.

## Table: `practice_mcq_options`

**Purpose**

Stores answer options for MCQ questions.

**Columns**

- `id` (text, PK)
  - Unique option ID.

- `questionId` (text, FK → `practice_questions.id`)
  - MCQ question this option belongs to.
  - `onDelete: "cascade"` – deleting a question removes its options.

- `text` (text)
  - Text of the option shown to the user.

- `isCorrect` (boolean)
  - Whether this option is correct.

- `explanation` (text, nullable)
  - Optional explanation why the option is correct/incorrect.

Notes:

- MCQ “answers” are represented by the set of options where `isCorrect = true`.
- This supports single or multiple correct answers.

---

## Table: `practice_matching_pairs`

**Purpose**

Stores the left/right pairs for matching questions.

**Columns**

- `id` (text, PK)
  - Unique pair ID.

- `questionId` (text, FK → `practice_questions.id`)
  - Matching question this pair belongs to.

- `left` (text)
  - Left-hand item shown in the UI.

- `right` (text)
  - Right-hand item that is the correct match.

- `explanation` (text, nullable)
  - Optional explanation describing the relationship.

Notes:

- The correct matching solution is the set of (left, right) pairs stored here.

---

## Table: `practice_system_design_charts`

**Purpose**

Stores structured system design charts for `"system-design"` questions.

**Columns**

- `id` (text, PK)
  - Unique chart ID.

- `questionId` (text, FK → `practice_questions.id`)
  - System-design question this chart belongs to.
  - `onDelete: "cascade"` – deleting a question removes its charts.

- `chart` (jsonb, default `[]`)
  - Structured data for system-design diagrams or nodes.
  - Flexible JSON structure so the UI can render charts/graphs later.
  - Contains information about the system design chart, including nodes and their relationships.

Notes:

- Typically you'll store one chart per question, but multiple charts per question are allowed if needed.