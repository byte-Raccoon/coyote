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
- [x] Installed and verified Expo SDK 57 environment and dependencies for `mobile/`.
- [x] Analyzed `DESIGN/coyote_mobile` and updated `PROJECT.md` with complete Android feature scope.
- [x] Implemented React Native mobile application (`mobile/App.js`) matching `DESIGN/coyote_mobile` specification with Task Command, Academic Portal, Dashboard, DSA Arena, Field Journal, and Sync Engine.
- [x] Verified Vite frontend production build and FastAPI backend database/sync models.
- [x] Mobile Phase 1 Complete: Installed `@react-native-async-storage/async-storage`, configured `tokens.js`, and implemented persistent local storage layer (`storage.js`).
- [x] Mobile Phase 2 Complete: Swipe-enabled horizontal navigation linking bottom nav and header badges seamlessly.
- [x] Mobile Phase 3 Complete: Task Command (Daily auto-date, custom date selection, priority tags, full CRUD) and Project Ideas Vault (replacing Journal with domain tags, status, full CRUD).
- [x] Mobile Phase 4 Complete: DSA Arena redesign (Weekly Target, Today's counter & logger, The Grind monthly heatmap); Academic Portal with clean icon badges and full CRUD for courses, exams, lectures, and degree audit.
- [x] Mobile Phase 5 Complete: Removed all dummy/hardcoded data across all sections; dynamic Dashboard deriving metrics in real time; persistent offline storage verified.

## In progress
- Web macOS implementation: Connecting full real features on localhost:3333 to match mobile feature parity.
- Physical sync verification between MacBook Air and OnePlus phone over local Wi-Fi / Hotspot.
- Agent engineering learning track (Skills, Hooks, MCP, Subagents).

## Next step
- Bring macOS web client to full feature parity with mobile (Weekly/Yearly tasks, Academic manager, DSA targets, Ideas vault).

## State
```text
Product definition      ✓
Architecture            ✓
Technology stack        ✓
Database/data model     ✓
Sync implementation     In progress (Basic endpoints & client ready)
macOS implementation    In progress (UI prototype; backend connected)
Android implementation   ✓ (Full features, persistent storage, swipe navigation)
Agent infrastructure    Not started
```

## Open questions / Future considerations
- Schema design for shared entities (Task, Journal, Academic, DSA, Notes).
- Offline conflict resolution algorithm (LWW or CRDT-lite based on version/updated_at).
- Authentication implementation (Google Auth in later phases).

## Learning track
Skills → Hooks → MCP → Subagents → Multiple Agents → Orchestration
