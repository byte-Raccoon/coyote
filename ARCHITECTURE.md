# Coyote — Architecture

## 2. Logical model

```text
               MacBook Air (macOS)
┌────────────────────────────────────────────────────────┐
│                                                        │
│   Web Frontend (React + Tailwind, Lucide Icons)        │
│   http://localhost:3333                                │
│          │                                             │
│          ▼                                             │
│   FastAPI Backend (port 3335, bound to 0.0.0.0)        │
│          │                                             │
│          ├── SQLite (Initial dev: coyote.db with WAL)   │
│          └── PostgreSQL (Future production)            │
└──────────▲─────────────────────────────────────────────┘
           │
           │ Local Wi-Fi / Hotspot REST API
           │ (http://<mac-ip>:3335)
           │
┌──────────▼─────────────────────────────────────────────┐
│   OnePlus (Android App - React Native / Expo)          │
│          │                                             │
│          ├── Unified Lucide Icons via vector-icons     │
│          └── AsyncStorage / SQLite (Offline storage)   │
└────────────────────────────────────────────────────────┘
```

## 3. Product domains

- Dashboard
- Tasks / Planner (Daily, Weekly, Yearly, Custom, Archive)
- DSA Arena (Weekly Target, Questions Done Today, The Grind heatmap)
- Project Ideas Vault (Architecture concepts, domain tags, statuses)

*(Academic domain was decommissioned per user instruction in Decision D015)*

## 4. Platform mapping

### macOS
Dashboard → Tasks (Daily/Weekly/Yearly/Custom/Archive) → DSA Arena → Project Ideas Vault

### Android
Dashboard → Task Command (Daily/Weekly/Yearly/Custom/Archive) → DSA Arena (Weekly Target/Today/The Grind) → Project Ideas Vault → Sync Engine

Identical icons (`LayoutDashboard`, `CheckSquare`, `Code2`, `Lightbulb`, `Archive`) are used across both platforms for intuitive cross-device recognition.

## 5. Sync topology
- Source of truth: Mac SQLite database (`coyote.db`).
- Protocol: REST push & pull over local LAN or OnePlus hotspot.
- Conflict resolution: LWW with version increment and `updated_at`.
- Offline support: Full local offline persistence on both clients.

## 6. Logical entities
- `Task`: `id`, `title`, `description`, `category` (daily, weekly, yearly, custom), `priority`, `due_date`, `is_completed`, `completed_at`, `version`, `updated_at`.
- `DSA State`: `weeklyTarget`, `dailyLogs` (YYYY-MM-DD -> count), `questions` (id, title, difficulty, date).
- `Project Idea`: `id`, `title`, `tag` (#Systems, #AI, etc.), `status` (Concept, Prototyping, Shipped), `description`, `version`.

## 7. Future development-agent architecture

```text
              MAIN / ORCHESTRATOR
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Planner        Coder        Tester
          └────────────┼────────────┘
                       ▼
                    Reviewer
```

Major architectural decisions belong in `DECISIONS.md`.
