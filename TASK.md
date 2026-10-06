# Coyote — Task

## Current Objective
Completed feature implementation on both macOS web client and OnePlus Android mobile app with identical iconography, streamlined 4-section architecture (Academic domain removed), and Task Archive pattern.

## Immediate goals
- [x] Initialize Git repository, `.gitignore`, and configure remote `https://github.com/byte-Raccoon/coyote.git`.
- [x] Create project structure (`backend/`, `web/`, `mobile/`).
- [x] Choose and document the technology stack (React + Tailwind, React Native, FastAPI, SQLite).
- [x] Define the synchronization architecture (Local Wi-Fi / Hotspot REST API).
- [x] Define the high-level shared data model.
- [x] Establish the backend API on `0.0.0.0:3335`.
- [x] Establish the macOS frontend UI on `localhost:3333`.
- [x] Establish the Android application UI (React Native Expo).
- [x] Connect full real feature logic and validation on both platforms.
- [x] Remove Academic domain across both platforms and documentation.
- [x] Implement Task Archive pattern across web and mobile (completed tasks move to Archive with unarchive/restore capability).
- [x] Synchronize icons across mobile and web using identical Lucide visual mapping (`LayoutDashboard`, `CheckSquare`, `Code2`, `Lightbulb`, `Archive`).
- [x] Build real usable dynamic Dashboard with zero dummy numbers on both platforms.
- [ ] Verify data consistency across physical OnePlus device over live hotspot.

## macOS features (Implemented & Verified)
- [x] Dashboard (Real-time dynamic metrics, priorities list, hotspot guide, zero dummy data)
- [x] Task Command: Daily (Auto-locked to current date, full CRUD, priority tags)
- [x] Task Command: Weekly, Yearly, Custom (Date pickers, priority tags, full CRUD)
- [x] Task Command: Archive (Completed tasks stored separately, restore to active, clear archive)
- [x] DSA Arena: Feature 1 (Weekly Target sprint progress bar & editor)
- [x] DSA Arena: Feature 2 (Questions Done Today quick +1/-1 counter & problem logger)
- [x] DSA Arena: Feature 3 (The Grind interactive monthly activity heatmap calendar)
- [x] Project Ideas Vault (Domain tags #Systems, #AI, etc., status Concept/Prototyping/Shipped, full CRUD)

## Android features (Implemented & Verified)
- [x] Horizontal Swipe Navigation between sections
- [x] Unified Lucide Icons matching web (`Dashboard`, `Tasks`, `DSA`, `Ideas`, `Archive`)
- [x] Task Command: Daily (Auto-locked to current date, full CRUD, move to Archive on completion)
- [x] Task Command: Weekly, Yearly, Custom (Date selection, deadlines, full CRUD)
- [x] Task Command: Archive (Dedicated tab for completed tasks with restore & clear options)
- [x] DSA Arena: Feature 1 (Weekly Target & progress), Feature 2 (Today's counter & logger), Feature 3 (The Grind monthly heatmap)
- [x] Project Ideas Vault (Domain tags #Systems, #AI, etc., status tags, full CRUD)
- [x] Dynamic Dashboard: Metrics calculated live from real data (zero dummy data)
- [x] Persistent Local Storage: AsyncStorage integration so data persists offline across app restarts

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
