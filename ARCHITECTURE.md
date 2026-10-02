# Coyote — Architecture

## 2. Logical model

```text
               MacBook Air (macOS)
┌────────────────────────────────────────────────────────┐
│                                                        │
│   Web Frontend (React + Tailwind)                      │
│   http://localhost:3333                                │
│          │                                             │
│          ▼                                             │
│   FastAPI Backend (port 3335, bound to 0.0.0.0)        │
│          │                                             │
│          ├── SQLite (Initial dev)                      │
│          └── PostgreSQL (Future production)            │
└──────────▲─────────────────────────────────────────────┘
           │
           │ Local Wi-Fi / Hotspot REST API
           │ (http://<mac-ip>:3335)
           │
┌──────────▼─────────────────────────────────────────────┐
│   OnePlus (Android App - React Native / Expo)          │
│          │                                             │
│          ▼                                             │
│   Local SQLite (Offline-first storage & change queue)  │
└────────────────────────────────────────────────────────┘
```

## 3. Product domains

- Dashboard
- Tasks / Planner
- Journal
- Academic
- DSA
- Project Ideas
- General Notes

## 4. Platform mapping

### macOS
Dashboard → Task (Daily/Weekly/Yearly) → Journal → Academic → DSA → Project Ideas → General Notes

### Android
Dashboard → Planner (Weekly/Monthly/Yearly) → DSA Target → Academic Target → Vault (Journal/Project Ideas/General Notes)

The platform-specific organization comes directly from `PROJECT.md`.

## 5. Sync questions to resolve
- Where is canonical data stored?
- How do both clients read/write it?
- What happens offline?
- What happens when both devices edit the same item?
- How are deletions synchronized?

## 6. Logical entities
Likely entities derived from the product scope:
Task, Journal Entry, Academic Item, DSA Item/Target, Project Idea, General Note, Goal/Planner Item.

This is not yet a finalized database schema.

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

This is a future learning target, not the application's current architecture.

Major architectural decisions belong in `DECISIONS.md`.
