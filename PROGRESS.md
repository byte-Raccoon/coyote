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
- [x] Initialized Git repository, configured remote and comprehensive `.gitignore`.
- [x] Established monorepo layout: `backend/`, `web/`, and `mobile/`.
- [x] Implemented FastAPI backend on port `3335` with SQLite WAL mode, health check, tasks, notes, and sync endpoints.
- [x] Implemented React + Tailwind web app on port `3333` with Coyote Desert Workspace design.
- [x] Verified Vite frontend production build and FastAPI backend database/sync models.

## In progress
- Connecting frontend state to backend REST & sync endpoints.
- Scaffolding the React Native mobile application for OnePlus.

## Next step
- Connect web frontend live task/note creation to the FastAPI backend API on port 3335.

## State
```text
Product definition      ✓
Architecture            ✓
Technology stack        ✓
Database/data model     ✓
Sync implementation     In progress (REST endpoints ready)
macOS implementation    ✓ (Foundation running on 3333)
Android implementation   In progress (Architecture defined)
Agent infrastructure    Not started
```

## Open questions / Future considerations
- Schema design for shared entities (Task, Journal, Academic, DSA, Notes).
- Offline conflict resolution algorithm (LWW or CRDT-lite based on version/updated_at).
- Authentication implementation (Google Auth in later phases).

## Learning track
Skills → Hooks → MCP → Subagents → Multiple Agents → Orchestration
