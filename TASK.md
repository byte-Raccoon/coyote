# Coyote — Task

## Current Objective
Establish the Coyote project foundation from `PROJECT.md`.

> **Notice:** Mobile version and web version are just dummies, not a real working app and site, we still have to implement all the feature.

## Immediate goals
- [x] Initialize Git repository, `.gitignore`, and configure remote `https://github.com/byte-Raccoon/coyote.git`.
- [x] Create project structure (`backend/`, `web/`, `mobile/`).
- [x] Choose and document the technology stack (React + Tailwind, React Native, FastAPI, SQLite).
- [x] Define the synchronization architecture (Local Wi-Fi / Hotspot REST API).
- [x] Define the high-level shared data model.
- [x] Establish the backend API on `0.0.0.0:3335`.
- [x] Establish the macOS frontend UI prototype on `localhost:3333`.
- [x] Establish the Android application UI prototype (React Native Expo template).
- [ ] Connect full real feature logic and validation on both platforms.
- [ ] Build end-to-end production sync path.
- [ ] Build real usable Dashboard on both platforms.

## macOS features (Pending real implementation)
- [ ] Dashboard
- [ ] Daily Task
- [ ] Weekly Task
- [ ] Yearly Task
- [ ] Journal
- [ ] Academic
- [ ] DSA
- [ ] Project Ideas
- [ ] General Notes

## Android features (Pending real implementation)
- [ ] Dashboard
- [ ] Weekly Planner
- [ ] Monthly Planner
- [ ] Yearly Planner
- [ ] DSA Target
- [ ] Academic Target
- [ ] Vault / Journal
- [ ] Vault / Project Ideas
- [ ] Vault / General Notes

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
