# Coyote — Progress

> Single source of truth for the current development state.

## Current phase
**Phase 2 — Cross-Platform Feature Parity & Streamlined Product Domains**

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
- [x] Implemented React Native (Expo) mobile application structure for OnePlus (`mobile/App.js`, `mobile/src/sync.js`).
- [x] Installed and verified Expo SDK 57 environment and dependencies for `mobile/`.
- [x] Mobile Phase 1-5 Complete: Persistent storage, horizontal swipe navigation, Task Command, DSA Arena, Project Ideas Vault, and dynamic Dashboard.
- [x] Decommissioned Academic domain across both macOS and mobile platforms (Decision D015).
- [x] Implemented Task Archive architecture across both macOS web and mobile applications (Decision D016): completed tasks move out of active lists into Archive with restore and clear capabilities.
- [x] Unified icon mapping across web and mobile (Decision D017): identical Lucide visual icons (`LayoutDashboard`, `CheckSquare`, `Code2`, `Lightbulb`, `Archive`) on both platforms.
- [x] Completed Web Client features on port `3333`:
  - Daily tasks auto-locked to current date, Weekly/Yearly custom date pickers, priority tags, full CRUD.
  - Dedicated Task Archive tab with instant restore and purge options.
  - DSA Arena: Weekly Target progress bar, Questions Done Today counter with `+1`/`-1` controls and problem logger, and The Grind monthly activity heatmap calendar.
  - Project Ideas Vault: Domain tags (`#Systems`, `#AI`, `#Mobile`, `#Web`), status tags (`Concept`, `Prototyping`, `Shipped`), and full CRUD.
  - Real-time dynamic Dashboard computing live metrics with ZERO dummy numbers.
  - Removed dummy/disclaimer banners from the application.
- [x] Verified full production builds (`vite build` on web, `expo export` on mobile, Python app check on backend).

## In progress
- Physical device testing with OnePlus phone over mobile hotspot.
- Agent engineering learning track (Skills, Hooks, MCP, Subagents).

## Next step
- Launch both servers (`fastapi` on port `3335`, `vite` on port `3333`, `expo` for OnePlus) and perform end-to-end sync verification over live hotspot.

## State
```text
Product definition      ✓
Architecture            ✓
Technology stack        ✓
Database/data model     ✓
Web Client (macOS)      ✓ (Full feature parity, archive, live dashboard)
Mobile Client (Android) ✓ (Full feature parity, swipe, archive, live dashboard)
Sync implementation     ✓ (Endpoints & client sync engine verified)
Agent infrastructure    Not started
```

## Learning track
Skills → Hooks → MCP → Subagents → Multiple Agents → Orchestration
