# Coyote — Agent Instructions

## Source of truth
- Read `PROJECT.md` before planning product work.
- Read `PROGRESS.md` before continuing existing work.
- Read `TASK.md` for the current objective.
- Read `ARCHITECTURE.md` for structural changes.
- Read `DECISIONS.md` before making or changing major decisions.

## Product scope
Coyote targets:
- MacBook Air / macOS, hosted locally on port `3333`
- OnePlus / Android application

### macOS
Dashboard, Task (Daily/Weekly/Yearly), Journal, Academic, DSA, Project Ideas, General Notes.

### Android
Dashboard, Planner (Weekly/Monthly/Yearly), DSA Target, Academic Target, Vault (Journal/Project Ideas/General Notes).

The synchronization between Mac and OnePlus is a core requirement.

## Rules
1. Do not invent requirements and present them as established.
2. Prefer small, verifiable changes.
3. Preserve working code unless there is a reason to change it.
4. Do not add dependencies without justification.
5. Keep the project runnable after meaningful changes.
6. Verify implementation before marking work complete.
7. Update `PROGRESS.md` after meaningful phases.
8. Update `ARCHITECTURE.md` when structure changes.
9. Record major decisions in `DECISIONS.md`.
10. Use `DESIGN` folder for UI design of WEB and APP.
11. Use `TBD` when the project documentation does not define an answer.

## Agent engineering
Coyote is also a learning project for Skills, Hooks, MCP, Subagents, Multiple Agents, and Orchestration. Introduce these progressively and only when they solve a real development problem.

## Safety
Ask before destructive operations such as deleting major project areas, resetting history, or other irreversible changes.

## Completion
A task is complete only after:
Implementation → relevant verification → documentation update → actual state matches documentation.
