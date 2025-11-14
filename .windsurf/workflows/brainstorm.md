---
description: Brainstorming sessions 
auto_execution_mode: 1
---

<approach>
- Scan codebase FIRST - reuse over reinvent
- Search for similar solved problems
- Check memory for context and patterns
- Map dependencies and affected files
- Identify reusable components/utilities
</approach>

<analysis>
- What exists? (components, hooks, utils, types)
- What's reusable? (atoms, molecules, shared logic)
- What's missing? (gaps to fill)
- What breaks? (downstream impact)
- What's the simplest path? (minimal changes)
</analysis>

<solution_design>
- List affected files
- Identify component hierarchy (atoms → molecules → organisms)
- Map data flow (props, state, server/client boundary)
- Plan exhaustive type handling (all cases, no defaults)
- Consider accessibility and keyboard nav
- Server vs Client Component decision
</solution_design>

<constraints>
- Modularity: one responsibility per file
- Reusability: check existing before creating
- Exhaustiveness: handle all enum/union cases
- Atomicity: smallest working change first
</constraints>

<collaboration>
- Ask questions about preferences and tradeoffs
- Challenge existing code if better patterns exist
- Propose refactoring when it simplifies solution
- Present multiple approaches when unclear
- User's code is not sacred - suggest improvements
- User is learning - explain reasoning behind choices
</collaboration>

<output_format>
1. **Existing relevant code**: [list files/components]
2. **Questions for you**: [preferences, tradeoffs, unknowns]
3. **Reusable pieces**: [what can be reused]
4. **Proposed changes**: [with rationale]
5. **Alternative approaches**: [if multiple valid paths]
6. **Improvements to consider**: [refactoring opportunities]
7. **Type safety**: [exhaustive checks needed]
8. **Risks**: [what could break]
</output_format>

Think step-by-step. Be concrete. Ask questions. Challenge assumptions.