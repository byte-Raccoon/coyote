# Coyote — Decisions

## D001 — Target platforms
**Status:** Accepted

Coyote targets MacBook Air/macOS and OnePlus/Android.

**Reason:** Explicit scope in `PROJECT.md`.

## D002 — macOS hosting
**Status:** Accepted

The macOS version is hosted locally on port `3333`.

**Reason:** Explicit requirement in `PROJECT.md`.

## D003 — Android form
**Status:** Accepted

The Android version will be an application.

**Reason:** Explicit requirement in `PROJECT.md`.

## D004 — Synchronization
**Status:** Accepted

Synchronization between MacBook Air and OnePlus is a core requirement.

**Implementation:** TBD.

## D005 — Platform-specific organization
**Status:** Accepted

Do not force identical navigation on both platforms. `PROJECT.md` intentionally defines different structures for macOS and Android.

## D006 — Technology stack
**Status:** Accepted 
  - frontend: React + Tailwind
  - backend: FastAPI
  - Database: SQLite(offline), postgresql(server)
  - sync: REST API

## D007 — Database
**Status:** Accepted

- SQLite for local storage
- postgreSQL for server

## D008 — Sync protocol
**Status:** Accepted
- REST API

## D009 — Authentication / identity
**Status:** Open
- later phases using google auth

## D010 — Offline and conflict resolution
**Status:** Open

Every change gets:
uuid
device_id
updated_at
version

## D011 — Port assignments
**Status:** Accepted
- macOS Web frontend: port `3333`
- FastAPI backend: port `3335` (bind to `0.0.0.0` to permit LAN/hotspot sync)

**Reason:** Separation of concerns between frontend client and backend service, avoiding port conflicts while honoring the `3333` requirement for the macOS user interface.

## D012 — Mobile application framework
**Status:** Accepted
- Framework: React Native (Expo SDK 57)
- Styling: Tailwind (NativeWind) to match the Coyote Desert design system
- Local storage: SQLite for offline capabilities

**Reason:** Code/logic/design parity with React web client, rapid cross-platform delivery, and offline SQLite support.

## D013 — Backend database phased rollout
**Status:** Accepted
- Phase 1 (Local setup): SQLite (via SQLAlchemy / SQLModel) for the FastAPI backend.
- Phase 2 (Future): Migrate server database to PostgreSQL.

**Reason:** Avoids local PostgreSQL dependency initially while keeping schema portable via an ORM.

## D014 — Network sync topology
**Status:** Accepted
- Sync works over local Wi-Fi and mobile hotspot when Mac connects to phone hotspot.
- Backend exposes REST endpoints accessible from local network IP on port `3335`.

**Reason:** Simple, private, direct device-to-device local network synchronization without third-party cloud infrastructure.

## D015 — Decommission Academic domain
**Status:** Accepted
- Removed Academic Portal and academic entities from both web and mobile applications.
- Core domains streamlined to Dashboard, Tasks, DSA Arena, and Project Ideas Vault.

**Reason:** Explicit user instruction to simplify product focus on high-impact daily execution, algorithmic practice, and project blueprints.

## D016 — Task Archive pattern
**Status:** Accepted
- Rather than merely striking through completed tasks in active lists, completed tasks immediately transition into a dedicated **Archive** view.
- Active views (`daily`, `weekly`, `yearly`, `custom`) strictly display actionable, uncompleted tasks.
- Archive view provides full restore/unarchive capability (returning tasks to their active category) and clear/delete actions.

**Reason:** Prevents visual clutter in active backlogs and maintains clean operational velocity on both macOS and mobile devices.

## D017 — Unified iconography across Web and Mobile
**Status:** Accepted
- Mobile uses vector icons (`@expo/vector-icons`) mapping 1:1 to web's `lucide-react` icons:
  - Dashboard: `LayoutDashboard` (`view-dashboard-outline`)
  - Tasks: `CheckSquare` (`checkbox-marked-outline`)
  - DSA Arena: `Code2` (`code-tags`)
  - Project Ideas: `Lightbulb` (`lightbulb-outline`)
  - Task Archive: `Archive` (`archive-outline`)

**Reason:** Guarantees instantaneous visual recognition across both devices without emoji rendering discrepancies across platforms.
