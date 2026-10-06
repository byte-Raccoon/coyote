# coyote
- a notes and to-do project for macAir and OnePlus 

# vision 
- this is a multiplatform project which create a sync between my macbook air and my phone(oneplus)

# scope 
- the scope of project is macbook air and oneplus i.e macOS and android 

# features
- macos 
  - for laptop it will be hosted on localhost (frontend on port 3333, backend API on port 3335)
  - styled with Coyote Desert Workspace design tokens
  - unified Lucide icons matching the mobile app
  - features:
    - Dashboard
      - Real-time dynamic tactical metrics (Daily Pending, Archive Resolution, DSA Velocity, Ideas Vault)
      - Today's Tactical Priorities quick action list
      - OnePlus Hotspot & LAN sync guide
    - Task Command
      - Daily (Auto-locked to current date, full CRUD, move to Archive on completion)
      - Weekly, Yearly, Custom (Date pickers, priority tags, full CRUD)
      - Task Archive (Dedicated completed tasks view with restore & clear options)
    - DSA Arena
      - Feature 1: Weekly Target (Adjustable goal, live sprint progress bar)
      - Feature 2: Questions Done Today (Quick +1/-1 counter and problem detail logger)
      - Feature 3: The Grind (Monthly activity calendar heatmap with intensity levels)
    - Project Ideas Vault (Replaced Journal & Notes)
      - Architectural concepts, tech stacks, execution roadmaps
      - Domain tags (#Systems, #AI, #Mobile, #Web)
      - Status tags (Concept, Prototyping, Shipped) with full CRUD

- android phone
  - it will be as an application (OnePlus / Android, React Native Expo)
  - styled with Coyote Desert Workspace design tokens
  - unified Lucide icons matching the web client
  - swipe-enabled horizontal paging between sections
  - features:
    - Dashboard
      - 2x2 Tactical Command Metrics (Daily Tasks, DSA Sprint, Project Ideas, Task Archive)
      - Next Tactical Objective quick jump
    - Task Command
      - Daily (Auto-locked to current date, priority tags, full CRUD)
      - Weekly, Yearly, Custom (Custom date selection, deadlines, domain filters, full CRUD)
      - Task Archive (Dedicated tab for completed tasks with restore & clear options)
    - DSA Arena
      - Feature 1: Weekly Target (Adjustable goal, live weekly progress bar)
      - Feature 2: Questions Done Today (Quick +1/-1 counter and problem detail logger)
      - Feature 3: The Grind (Monthly activity calendar heatmap with intensity levels)
    - Project Ideas Vault
      - Architectural concepts, tech stacks, roadmap notes
      - Domain tags (#Systems, #AI, #Mobile, #Web)
      - Status tags (Concept, Prototyping, Shipped) with full CRUD
    - Sync Engine
      - Local Wi-Fi & Hotspot sync with MacBook Air backend on port 3335