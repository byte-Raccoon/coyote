# Coyote — Task

## Current Objective
Establish the Coyote project foundation from `PROJECT.md`.

## Immediate goals
- [x] Initialize Git repository, `.gitignore`, and configure remote `https://github.com/byte-Raccoon/coyote.git`.
- [x] Create project structure (`backend/`, `web/`, `mobile/`).
- [x] Choose and document the technology stack (React + Tailwind, React Native, FastAPI, SQLite).
- [x] Define the synchronization architecture (Local Wi-Fi / Hotspot REST API).
- [x] Define the high-level shared data model.
- [x] Establish the backend API on `0.0.0.0:3335`.
- [x] Establish the macOS frontend experience on `localhost:3333`.
- [x] Establish the Android application foundation (React Native Expo template).
- [x] Connect web client interactive state directly to backend REST endpoints.
- [x] Build a minimal end-to-end sync path.
- [x] Build the first usable Dashboard on both platforms.

## macOS features
- [x] Dashboard
- [x] Daily Task
- [x] Weekly Task
- [x] Yearly Task
- [x] Journal
- [x] Academic
- [x] DSA
- [x] Project Ideas
- [x] General Notes

## Android features
- [x] Dashboard
- [x] Weekly Planner
- [x] Monthly Planner
- [x] Yearly Planner
- [x] DSA Target
- [x] Academic Target
- [x] Vault / Journal
- [x] Vault / Project Ideas
- [x] Vault / General Notes

## Sync
- [x] Decide source of truth (Mac SQLite as canonical hub, client as offline-first replica).
- [x] Decide sync mechanism (Local Wi-Fi / Hotspot REST push & pull).
- [x] Decide offline behaviour (Offline storage with version metadata).
- [x] Decide conflict handling (Version + updated_at LWW resolution).
- [x] Implement basic sync.
- [ ] Verify data consistency across physical OnePlus device over live hotspot.

## Agent-learning track
- [ ] Skills
- [ ] Hooks
- [ ] MCP
- [ ] One subagent
- [ ] Multiple specialized agents
- [ ] Orchestration

These are learning goals, not MVP requirements.

## Definition of done
A feature is complete only when implemented, appropriately verified, and reflected in `PROGRESS.md`.
