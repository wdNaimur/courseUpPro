# Phase 0 Research: CourseUp Mobile App

## Decision: Build the mobile version with Expo and React Native

**Rationale**: The current app is already TypeScript and React, so Expo/React Native preserves the strongest shareable skills and logic while allowing Android and iOS delivery from one codebase. Expo also reduces native setup cost for media playback, file access, and SQLite.

**Alternatives considered**:
- Full native Swift/Kotlin apps: strongest platform fit, but doubles implementation effort and abandons most shared UI logic.
- Capacitor or mobile web wrapper: cannot reliably replace browser-only file APIs or deliver a native-quality offline media workflow.

## Decision: Keep web and mobile as separate top-level projects in the same repository

**Rationale**: The current web app is already functional and should not be destabilized while mobile work begins. A `web/` and `mobile/` split keeps build tools, platform dependencies, and release flows isolated while still allowing shared domain logic to be extracted deliberately later.

**Alternatives considered**:
- Replace the existing app in place: faster initial move, but risks breaking the working web version.
- Force both platforms into a single package immediately: increases build/config complexity before the mobile architecture is proven.

## Decision: Replace File System Access API import with `expo-document-picker` and persistent device URIs

**Rationale**: The web app depends on directory handles and permission prompts that do not exist on mobile. On mobile, the reliable pattern is picking files or directories through native document access, then persisting the returned content URIs and revalidating them when reopening the course.

**Alternatives considered**:
- Continue relying on browser APIs: not available in React Native.
- Copy all imported course media into app storage: simpler reopen behavior, but high storage cost and slow imports for large video libraries.

## Decision: Persist library metadata and progress in SQLite via `expo-sqlite`

**Rationale**: The current app splits state between `localStorage` and `IndexedDB`. A mobile app needs durable local structured storage for courses, lessons, imports, and playback progress. SQLite is stable, queryable, and well-supported in Expo for offline-first apps.

**Alternatives considered**:
- AsyncStorage only: simpler API, but weak for relational querying and large course datasets.
- Realm or WatermelonDB: powerful, but unnecessary complexity for a single-device offline catalog.

## Decision: Use `expo-video` for lesson playback

**Rationale**: The product is fundamentally a video course player, so native playback support with proper lifecycle handling is required. `expo-video` aligns with current Expo media tooling and works with local URIs.

**Alternatives considered**:
- Custom native media modules: unnecessary for the first mobile version.
- Embedded web views with HTML5 video: weaker platform integration and more failure points for local URIs.

## Decision: Keep imported videos in original device storage by default

**Rationale**: Courses can contain large video files. Referencing device-accessible files instead of duplicating them avoids long import times and excessive storage growth. The app should only copy lightweight derived assets like thumbnails or exported metadata snapshots when needed.

**Alternatives considered**:
- Full media copy into sandbox storage: more robust against source moves, but too expensive for large offline libraries.
- Stream from remote sources: contradicts the offline-first requirement.

## Decision: Normalize lessons during import and cache derived metadata

**Rationale**: The current app rebuilds folder trees and lesson metadata from raw files at runtime. On mobile, scanning large folders repeatedly is wasteful. Import should normalize titles, ordering, folder hierarchy, and local media references once, then persist them for fast reopen.

**Alternatives considered**:
- Re-scan every course open: simpler, but slow and battery-inefficient.
- Store only raw file references: shifts too much work to every playback session.

## Decision: Reuse domain logic, not current web UI implementation

**Rationale**: The existing UI is tightly coupled to desktop browser layout, CSS, localStorage, and DOM media behavior. Shared logic such as lesson normalization, progress calculations, and course key generation can migrate into framework-agnostic utilities, while UI should be rebuilt as native mobile screens.

**Alternatives considered**:
- Port the current web UI line-by-line: high friction and poor mobile UX.
- Rewrite everything from scratch: unnecessary loss of working business logic.

## Decision: Treat missing or invalid course URIs as a first-class course state

**Rationale**: Mobile file references can become invalid if the user moves files or revokes access. The app needs an explicit unavailable state and recovery flow rather than silently failing during playback.

**Alternatives considered**:
- Delete inaccessible courses automatically: destructive and surprising.
- Hide failures until playback: creates a poor recovery experience.
