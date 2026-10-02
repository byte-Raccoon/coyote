# Coyote Mobile (OnePlus / Android)

Android application for Coyote using **React Native** (Expo) and local SQLite offline caching.

## Target Features (from PROJECT.md)
- **Dashboard**: Quick glance at targets and day's agenda.
- **Planner**:
  - Weekly Planner
  - Monthly Planner
  - Yearly Planner
- **DSA**:
  - DSA Target
  - Academic Target
- **Vault**:
  - Journal
  - Project Ideas
  - General Notes

## Sync Mechanism
Connects to the Mac host over local Wi-Fi or phone Mobile Hotspot at:
`http://<mac-ip>:3335/api/sync`

## Running
```bash
# Initialize Expo app or run development server:
npm install
npx expo start
```
