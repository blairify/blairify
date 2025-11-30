# Practice Library Database Schema (v2)

Human-readable reference for `src/practice-library-db/schema.ts`.

The v2 practice library uses **5 tables**, one per question type:

1. `mcq_questions` – multiple-choice questions (with nested options)
2. `open_questions` – open-ended questions (with nested reference answers)
3. `truefalse_questions` – true/false questions
4. `matching_questions` – matching questions (with nested pairs)
5. `system_design_questions` – system-design questions (with nested charts)

Each table shares a common core shape, then adds type-specific fields.

---

## Shared Columns (all tables)

Every `*_questions` table has these columns:

- `id` (text, PK)
  - Unique question ID.

- `status` (text → `QuestionStatus`)
  - Lifecycle: `"draft" | "published" | "archived"`.

- `reviewerId` (text, nullable)
  - User ID of the last reviewer.

- `reviewedAt` (timestamptz, nullable)
  - When the question was last reviewed.

- `difficulty` (text → `DifficultyLevel`)
  - `"entry" | "junior" | "middle" | "senior"`.

- `isDemoMode` (boolean)
  - Whether this is a demo question.

- `companyType` (text → `CompanyType`)
  - `"faang" | "startup" | "enterprise"`.

- `title` (text)
  - Short, human-readable title.

- `description` (text)
  - User-facing description of the question.

- `prompt` (text)
  - AI-facing prompt; may extend the description with evaluation instructions.

- `topic` (text)
  - Main topic (e.g. `"frontend"`, `"system-design"`).

- `subtopics` (text[], default `[]`)
  - Additional subtopics for filtering.

- `tags` (text[], default `[]`)
  - Tags for search/filter.

- `estimatedTimeMinutes` (integer, default `0`)
  - Approximate time to solve.

- `aiEvaluationHint` (text, nullable)
  - Optional guidance for AI evaluation.
  - Required and non-empty for open and system-design questions.

- `companies` (jsonb, nullable)
  - Optional list of companies this question is relevant for.
  - Each entry:
    - `name`: company name (e.g. `"Google"`).
    - `logo`: icon name (e.g. `"SiGoogle"`).
    - `size?`: segments like `["faang"]`, `["startup"]`.
    - `description`: company description.

- `positions` (text[], default `[]`)
  - Relevant roles (e.g. `"Frontend Engineer"`, `"Backend Engineer"`).

- `primaryTechStack` (text[], default `[]`)
  - Tech stack labels (e.g. `"react"`, `"typescript"`, `"nodejs"`).

- `interviewTypes` (text[] → `QuestionInterviewMode[]`, default `[]`)
  - Where the question is used: `"regular" | "practice" | "flash" | "play" | "competitive" | "teacher"`.

- `seniorityLevels` (text[], default `[]`)
  - Target seniority levels.

- `createdAt` (timestamptz)
  - When the question was created.

- `updatedAt` (timestamptz)
  - When the question was last updated.

- `createdBy` (text)
  - ID of the user/admin who created the question.

---

## Table: `mcq_questions`

**Purpose**

Multiple-choice questions where we only store the single correct answer text.

**Additional Columns**

- `correctAnswerText` (text)
  - The single fully correct option text for this MCQ.

Notes:

- Additional incorrect options (distractors) can be generated later based on `correctAnswerText`.

---

## Table: `open_questions`

**Purpose**

Open-ended questions evaluated by AI with structured reference answers.

**Additional Columns**

- `referenceAnswers` (jsonb, nullable → `ReferenceAnswer[]`)
  - Array of reference answers used as guidance:
    - `id`: internal identifier.
    - `text`: sample/reference answer.
    - `weight`: importance (0–1).
    - `keyPoints`: key concepts/phrases that should appear.

Notes:

- `aiEvaluationHint` is required and describes how to grade that specific question.
- `referenceAnswers` are examples/guidance; they do not need explicit weights if you prefer to rely on `aiEvaluationHint`.

---

## Table: `truefalse_questions`

**Purpose**

True/false questions with deterministic scoring and explanation.

**Additional Columns**

- `correctAnswer` (boolean)
  - Whether the statement is true or false.

- `explanation` (text)
  - Why the statement is true or false.

- `trickinessLevel` (integer, nullable)
  - Optional 1–5 scale for how tricky the question is.

---

## Table: `matching_questions`

**Purpose**

Matching questions with left/right pairs represented as nested JSON.

**Additional Columns**

- `shuffleLeft` / `shuffleRight` (boolean, nullable)
  - Whether to shuffle the left/right side in the UI.

- `minPairs` / `maxPairs` (integer, nullable)
  - Optional constraints on number of pairs.

- `pairs` (jsonb, nullable → `MatchingPair[]`)
  - Array of pairs:
    - `id`: pair ID.
    - `left`: left-hand item.
    - `right`: right-hand item.
    - `explanation`: relationship explanation.

Notes:

- The correct matching solution is the set of `(left, right)` pairs.

---

## Table: `system_design_questions`

**Purpose**

System-design questions with structured constraints and charts.

**Additional Columns**

- `complexityLevel` (text, nullable)
  - Perceived complexity: `"entry" | "junior" | "middle" | "senior"`.

- `nonFunctionalRequirements` (text[], default `[]`)
  - Non-functional requirements (e.g. `"high availability"`, `"low latency"`).

- `constraints` (text[], default `[]`)
  - Key constraints (e.g. `"EU data residency"`, `"mobile-first"`).

- `scalingFocus` (text, nullable)
  - Freeform description of scaling profile.

- `hints` (text[], default `[]`)
  - Optional hints that can be surfaced to the user.

- `charts` (jsonb, nullable)
  - Array of charts. Each chart:
    - `id`: chart ID.
    - `nodes`: array of nodes:
      - `id`: node ID.
      - `type`: node type (e.g. `"service"`, `"db"`, `"cache"`, `"queue"`, `"client"`, `"external"`).
      - `label`: display label.
      - `description`: what the node does.
      - `connections`: list of IDs of connected nodes.

Notes:

- `aiEvaluationHint` is required and should describe what a good design includes, what to reward, and what to penalize.

---

### Commands to run scripts

From the repo root (`../js/blairify`):

- `npx ts-node --project scripts/tsconfig.json scripts/seed-practice-library.ts`
- `npx ts-node --project scripts/tsconfig.json scripts/import-practice-library-from-json.ts`