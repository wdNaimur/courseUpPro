# Implementation Plan: CourseUp Mobile App

**Branch**: `[001-mobile-app]` | **Date**: 2026-03-16 | **Spec**: [spec.md](C:\Naimur\Projects\courseUpPro\specs\001-mobile-app\spec.md)
**Input**: Feature specification from `/specs/001-mobile-app/spec.md`

## Summary

Preserve the existing React/Vite browser-based local course player under a dedicated `web/` workspace and add a new cross-platform mobile app under `mobile/` using Expo and React Native, replacing browser-only storage and file-access APIs in the mobile implementation while preserving offline import, playback, progress tracking, and course metadata management.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Expo SDK 53-compatible React Native stack  
**Primary Dependencies**: Expo, React Native, Expo Router, `expo-video`, `expo-file-system`, `expo-document-picker`, `expo-sqlite`, NativeWind  
**Storage**: SQLite for structured metadata/progress, app document directory for copied thumbnails and imported metadata snapshots  
**Testing**: Vitest for shared logic, React Native Testing Library for component behavior, Expo/manual device validation for file import and playback flows  
**Target Platform**: Android 10+ and iOS 16+  
**Project Type**: multi-project monorepo (`web` + `mobile`)  
**Performance Goals**: First playable lesson available within 2 minutes of import, course outline interactive within 3 seconds for 500 lessons, smooth 60 fps playback controls on typical mid-range phones  
**Constraints**: Offline-first, browser-only APIs must be removed, large video files must remain in device-accessible storage instead of being copied into app storage by default, one-handed mobile UX, limited background processing  
**Scale/Scope**: One preserved web app plus one new mobile app in the same repository, local-only data, hundreds of lessons per course, tens to low hundreds of imported courses per device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file at [constitution.md](C:\Naimur\Projects\courseUpPro\.specify\memory\constitution.md) is still an unfilled template with placeholder principles and no enforceable project-specific rules.

- Gate status: PASS
- Rationale: There are no concrete constitutional requirements to violate or justify.
- Post-design re-check: PASS, because the design artifacts introduce no additional conflicts beyond the same placeholder-only constitution state.
- Follow-up note: Governance should be defined separately if this repository intends to enforce design or testing standards through `specify`.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
web/
├── public/
├── src/
├── package.json
└── vite.config.ts

mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── library/
│   ├── course/
│   └── settings/
├── src/
│   ├── components/
│   ├── features/
│   │   ├── courses/
│   │   ├── player/
│   │   └── import/
│   ├── storage/
│   ├── services/
│   ├── types/
│   └── utils/
├── assets/
└── package.json

tests/
├── unit/
├── integration/
└── contract/
```

**Structure Decision**: Convert the repository into a small monorepo with the current Vite app moved into `web/` and the new Expo app created in `mobile/`. This preserves the working web experience, isolates mobile-specific dependencies, and allows incremental sharing of domain logic where useful without forcing both runtimes into one app shell.

## Complexity Tracking

No constitution violations currently require justification.
