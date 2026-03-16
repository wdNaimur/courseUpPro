# Feature Specification: CourseUp Mobile App

**Feature Branch**: `[001-mobile-app]`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "I just want to make this project for mobile app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import and play an offline course (Priority: P1)

As a learner, I can import a downloaded course folder into the mobile app and immediately play lessons offline from my phone.

**Why this priority**: Offline playback is the project's core value. Without this, the mobile app is only a visual shell.

**Independent Test**: Import a folder that contains lesson videos and optional metadata, then start playback of any lesson without network access.

**Acceptance Scenarios**:

1. **Given** the user has a course folder on their device, **When** they import it from the mobile app, **Then** the app indexes the lesson videos and shows the course in the library.
2. **Given** a course has been imported, **When** the user opens a lesson while offline, **Then** the lesson starts playing from the local device file.

---

### User Story 2 - Resume progress across sessions (Priority: P2)

As a learner, I can leave a lesson and come back later on the same device without losing playback position or completion progress.

**Why this priority**: Mobile usage is interruption-heavy, so resume state is essential for real use.

**Independent Test**: Play part of a lesson, close the app, reopen it, and confirm the lesson resumes from saved progress.

**Acceptance Scenarios**:

1. **Given** a learner has watched part of a lesson, **When** they reopen that course later, **Then** the app restores the last active lesson and saved playback position.
2. **Given** a learner marks a lesson complete, **When** they revisit the course later, **Then** the completion state remains visible in the course outline.

---

### User Story 3 - Manage course metadata on mobile (Priority: P3)

As a learner, I can edit the course title, priority label, and thumbnail from the mobile app so the library stays organized on a small screen.

**Why this priority**: Metadata management supports long-term library use but is secondary to import and playback.

**Independent Test**: Change a course title, priority, and thumbnail, then verify the updated metadata appears in the library after app restart.

**Acceptance Scenarios**:

1. **Given** an imported course exists, **When** the user edits its title or priority, **Then** the library updates immediately and persists the changes locally.
2. **Given** an imported course exists, **When** the user sets or removes a thumbnail, **Then** the course card reflects the new artwork consistently.

### Edge Cases

- What happens when the user imports a folder that contains no supported video files?
- How does the system handle a course whose files were moved, renamed, or deleted outside the app after import?
- What happens when local device storage is low or metadata persistence fails?
- How does the system handle very large course folders with deeply nested lesson structures?
- What happens when the same course folder is imported more than once?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a native mobile application experience for Android and iOS using a shared cross-platform codebase.
- **FR-002**: The system MUST allow users to import locally stored course content from device-accessible storage.
- **FR-003**: The system MUST detect supported lesson video files within imported course folders and build a navigable lesson structure.
- **FR-004**: The system MUST support offline playback of imported lesson videos without requiring a network connection.
- **FR-005**: The system MUST persist course library metadata locally on the device, including title, priority, thumbnail, lesson count, and last opened timestamp.
- **FR-006**: The system MUST persist learner progress locally on the device, including last active lesson, lesson completion state, and playback position.
- **FR-007**: The system MUST let users reopen previously imported courses without re-importing them when file references remain valid.
- **FR-008**: The system MUST clearly notify users when a previously imported course can no longer be accessed because files were moved, deleted, or permission was revoked.
- **FR-009**: The system MUST allow users to edit course metadata from the app and persist those edits locally.
- **FR-010**: The system MUST preserve the existing concepts of library view, player view, and management view in a mobile-appropriate navigation model.
- **FR-011**: The system MUST provide a responsive mobile UI that supports one-handed use on common phone screen sizes.
- **FR-012**: The system MUST handle at least 500 lessons in a single course without making the app unusable during browsing or playback.
- **FR-013**: The system MUST avoid dependence on browser-only APIs such as IndexedDB and the File System Access API in the mobile implementation.
- **FR-014**: The system MUST preserve the existing web application as a separate project in the same repository rather than replacing it in place.
- **FR-015**: The system MUST organize the repository so the current web app lives under `web/` and the new mobile app lives under `mobile/`.

### Key Entities *(include if feature involves data)*

- **Course**: A locally imported learning package identified by a stable device-local key, with title, priority, thumbnail, source URI, lesson count, availability state, and last activity metadata.
- **Lesson**: A playable video item within a course, with a unique path-based identifier, normalized title, ordering index, folder grouping, and device-local media URI.
- **Course Progress**: Per-course learner state that tracks the last active lesson and lesson-level playback/completion data.
- **Course Import Source**: The persisted reference to the device folder or document location from which a course was imported, including access status and sync metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can import a valid local course and start the first lesson within 2 minutes on a mid-range mobile device.
- **SC-002**: After force-closing and reopening the app, the last active lesson and playback position are restored correctly in at least 95% of manual validation runs.
- **SC-003**: For a course containing 500 lessons, the course outline becomes interactive within 3 seconds after import on a representative Android test device.
- **SC-004**: At least 90% of imported courses with unchanged local files reopen successfully without requiring a full re-import.
