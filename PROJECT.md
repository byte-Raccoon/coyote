# coyote
- a notes and to-do project for macAir and OnePlus 

# vision 
- this is a multiplatform project which create a sync between my macbook air and my phone(oneplus)

# scope 
- the scope of project is macbook air and oneplus i.e macOS and android 

# features
- macos 
  - for laptop it will be hosted on localhost (frontend on port 3333, backend API on port 3335)
  - it will contain features 
    - Dashboard
    - Task
      - Daily
      - Weekly
      - Yearly
    - Journal
    - Academic
    - DSA
    - Project Ideas
    - General Notes

- android phone
  - it will be as an application (OnePlus / Android, React Native Expo)
  - styled with Coyote Desert Workspace design tokens
  - swipe-enabled horizontal paging between sections
  - it will contain features:
    - Dashboard
      - 2x2 Tactical Command Metrics (Daily Tasks, DSA Velocity, Ideas Logged, Academic Status)
      - Next Tactical Objective quick jump
    - Task Command
      - Daily (Auto-locked to current date, execution completion metrics, priority tags, full CRUD)
      - Weekly, Yearly, Custom (Custom date selection, deadlines, domain filters, full CRUD)
    - Academic Portal
      - Enrolled courses with credits and syllabus (Add, Edit, Delete)
      - Milestone Exams and Midterms with horizon dates (Add, Edit, Delete)
      - Lecture schedule blocks (Add, Edit, Delete)
      - Degree audit credit tracker
    - DSA Arena
      - Feature 1: Weekly Target (Adjustable goal, live weekly progress bar)
      - Feature 2: Questions Done Today (Quick +1/-1 counter and problem detail logger)
      - Feature 3: The Grind (Monthly activity calendar heatmap with intensity levels)
    - Project Ideas Vault (Replaces Journal)
      - Architectural concepts, tech stacks, roadmap notes
      - Domain tags (#Systems, #AI, #Mobile, #Web)
      - Status tags (Concept, Prototyping, Shipped) with full CRUD
    - Sync Engine
      - Local Wi-Fi & Hotspot sync with MacBook Air backend on port 3335