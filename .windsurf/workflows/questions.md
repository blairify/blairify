---
description: Prepare + import a question bank JSON (legacy or JsonBatch)
---

This workflow standardizes a question bank JSON file and imports it into the practice library DB.

## Inputs
- `INPUT`: path to a JSON file (usually under `scripts/questions/`)
- Optional flags:
  - `--dry-run`: validate JSON and show counts, no DB writes
  - `--auto-difficulty`: re-assess difficulty for each question during prepare (heuristic)
  - `--fill-missing-answers`: generate missing reference answers (requires `OPENAI_API_KEY`)
  - `--model <model>`: override OpenAI model used for answer generation (default: `gpt-4.1-mini`)

## Steps

1. Prepare (normalize + enrich) input file into a `JsonBatch`.

```bash
pnpm prepare:questions INPUT [--auto-difficulty] [--fill-missing-answers] [--model <model>]
```

This writes `INPUT.prepared.json` next to the input file (unless you use `--in-place`).

2. Validate importer can parse it.

```bash
pnpm import:questions INPUT.prepared.json --dry-run
```

3. Import into DB (requires `PRACTICE_LIBRARY_DATABASE_URL`).

```bash
pnpm import:questions INPUT.prepared.json
```

## Examples

- Prepare + dry-run import:

```bash
pnpm prepare:questions scripts/questions/php-questions-bank.json --auto-difficulty
pnpm import:questions scripts/questions/php-questions-bank.prepared.json --dry-run
```

- Full import:

```bash
pnpm prepare:questions scripts/questions/php-questions-bank.json
pnpm import:questions scripts/questions/php-questions-bank.prepared.json
```
