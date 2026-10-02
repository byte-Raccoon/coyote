# Coyote — Progress

> Single source of truth for the current development state.

## Current phase
**Phase 1 — Project Foundation & Scaffolding**

## Completed
- [x] Defined Coyote as a multiplatform notes/to-do project.
- [x] Defined MacBook Air / macOS and OnePlus / Android targets.
- [x] Assigned ports: macOS Web on `3333`, FastAPI backend on `3335`.
- [x] Selected tech stack: React + Tailwind (Web), React Native (Android), FastAPI (Backend).
- [x] Selected database strategy: SQLite initially for backend and clients, PostgreSQL in future.
- [x] Defined local network sync architecture (Wi-Fi / Hotspot REST).
- [x] Defined design tokens and UI mockups in `DESIGN/`.

## In progress
- Establishing directory layout (`backend/`, `web/`, `mobile/`).
- Setting up git repository with `.gitignore` and remote.
- Creating minimal FastAPI server on port 3335.
- Creating React + Tailwind frontend on port 3333.

## Next step
- Scaffold `backend/` and `web/` packages and verify local execution.

## State
```text
Product definition      ✓
Architecture            ✓
Technology stack        ✓
Database/data model     In progress
Sync implementation     Not started
macOS implementation    In progress
Android implementation   Not started
Agent infrastructure    Not started
```

## Open questions / Future considerations
- Schema design for shared entities (Task, Journal, Academic, DSA, Notes).
- Offline conflict resolution algorithm (LWW or CRDT-lite based on version/updated_at).
- Authentication implementation (Google Auth in later phases).

## Learning track
Skills → Hooks → MCP → Subagents → Multiple Agents → Orchestration
