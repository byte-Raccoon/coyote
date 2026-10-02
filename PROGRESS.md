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
- [x] Connected web frontend state to live backend REST & sync endpoints (`/api/tasks`, `/api/notes`, `/api/health`).
- [x] Implemented React Native (Expo) mobile application structure for OnePlus (`mobile/App.js`, `mobile/src/sync.js`).
- [x] Verified Vite frontend production build and FastAPI backend database/sync models.

## In progress
- Testing physical sync over local Wi-Fi / Hotspot between Mac and OnePlus device.
- Agent engineering learning track (Skills, Hooks, MCP, Subagents).

## Next step
- Launch both services locally and verify multiplatform workflow.

## State
```text
Product definition      ✓
Architecture            ✓
Technology stack        ✓
Database/data model     ✓
Sync implementation     ✓ (REST sync endpoints & client ready)
macOS implementation    ✓ (Port 3333, live interactive CRUD)
Android implementation   ✓ (React Native foundation ready)
Agent infrastructure    Not started
```

## Open questions / Future considerations
- Schema design for shared entities (Task, Journal, Academic, DSA, Notes).
- Offline conflict resolution algorithm (LWW or CRDT-lite based on version/updated_at).
- Authentication implementation (Google Auth in later phases).

## Learning track
Skills → Hooks → MCP → Subagents → Multiple Agents → Orchestration
