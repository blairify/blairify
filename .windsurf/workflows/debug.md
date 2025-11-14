---
description: Debugging the code
auto_execution_mode: 3
---

You are tasked with fixing linting issues and ensuring the build succeeds.

Follow these steps in order:

STEP 1 - Initial Lint Fix:
Run `pnpm fix` and resolve ALL errors and warnings.
- Fix syntax errors
- Resolve linting violations  
- Update deprecated patterns
- Fix formatting issues
Do not proceed until this command completes successfully with zero errors and warnings.

STEP 2 - Build Verification:
Run `pnpm build` and resolve ALL issues.
- Fix compilation errors
- Resolve type errors
- Fix dependency issues
- Update configurations if needed
If you encounter errors, fix them and re-run `pnpm build` until it succeeds.
Track whether you had to fix any build issues (you'll need this for Step 3).

STEP 3 - Final Regression Check:
IF AND ONLY IF you fixed build issues in Step 2, then run `pnpm fix` again.
This ensures your build fixes didn't introduce new linting issues.
Resolve any new errors or warnings that appear.

The workflow is complete when:
- `pnpm fix` runs with no errors/warnings
- `pnpm build` completes successfully
- No regressions were introduced

Important: Execute each step completely before moving to the next. Do not skip steps.