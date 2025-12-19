# Question banks (JSON) - prepare + import

This folder contains source question banks (often in a legacy format) that can be standardized and imported into the Practice Library DB.

## Quick start

1. Put your bank JSON in this folder, e.g. `scripts/questions/php-questions-bank.json`.

2. Prepare (convert + normalize + enrich):

```bash
pnpm prepare:questions scripts/questions/php-questions-bank.json --auto-difficulty
```

This writes:
- `scripts/questions/php-questions-bank.prepared.json`

3. Validate importer can parse the prepared file:

```bash
pnpm import:questions scripts/questions/php-questions-bank.prepared.json --dry-run
```

4. Import into DB (requires `PRACTICE_LIBRARY_DATABASE_URL`):

```bash
pnpm import:questions scripts/questions/php-questions-bank.prepared.json
```

## What “prepare” does

`pnpm prepare:questions <input.json>` (script: `scripts/prepare-question-bank.ts`)

- Accepts either:
  - **Legacy format**: `{ extractedAt, questions: [{ id, level, title, answer, ... }] }`
  - **JsonBatch format**: `{ mcq_questions, open_questions, truefalse_questions, matching_questions, system_design_questions }`
- Produces a **JsonBatch** output file (`*.prepared.json`) suitable for import.
- Normalizes/enriches open questions:
  - `title`: short label
  - `description`: the actual question (ends with `?`)
  - `prompt`: AI-ready evaluation prompt
  - `referenceAnswers[*].keyPoints`: expected key points derived from the question
  - `tags`/`subtopics`: derived from question text
  - fills reasonable defaults for `topic`, `positions`, `primaryTechStack`, `interviewTypes`, etc.

### Flags

- `--auto-difficulty`
  - Re-assesses difficulty (`entry|junior|mid|senior`) deterministically.
  - Recomputes `seniorityLevels` + `estimatedTimeMinutes`.

- `--out <output.json>`
  - Write to a custom output path.

- `--in-place`
  - Overwrite the input file.

- `--fill-missing-answers`
  - Generates missing answers (only when `referenceAnswers` is missing/empty).
  - Requires `OPENAI_API_KEY`.

- `--model <model>`
  - OpenAI model override for `--fill-missing-answers`.

## What “import” does

`pnpm import:questions <prepared.json> [--dry-run]` (script: `scripts/import-practice-library-from-json.ts`)

- `--dry-run` parses and prints counts (no DB writes).
- Without `--dry-run`, inserts records into the Practice Library DB.

## Notes

- Prefer running `--dry-run` first.
- Prepared JSON is the artifact that should be imported.
