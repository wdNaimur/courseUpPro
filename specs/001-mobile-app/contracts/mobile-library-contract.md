# Mobile Library Contract

## Purpose

Defines the expected behavior of the mobile app's primary user-facing flows so implementation and testing stay aligned during the migration from web to native mobile.

## Import Course Flow

**Trigger**: User taps `Import Course`.

**Inputs**:
- Device-selected directory or file batch from native picker

**Behavior**:
- The app validates that at least one supported video file exists.
- The app normalizes lesson ordering and folder grouping.
- The app persists `Course`, `Lesson`, `CourseImportSource`, and initial `CourseProgress` records locally.
- The app navigates to the imported course player or library detail view.

**Failure States**:
- No supported video files found
- Picker cancelled
- Storage write failure
- Source access denied

## Open Course Flow

**Trigger**: User taps a course card from the library.

**Behavior**:
- The app validates the stored source reference.
- If access is valid, the app loads cached lesson metadata and resumes the last lesson when present.
- If access is invalid, the app shows a recovery state with an option to relink or re-import.

## Update Metadata Flow

**Trigger**: User edits course metadata from the management screen.

**Inputs**:
- `title`
- `priority`
- optional `thumbnail`

**Behavior**:
- Changes are validated locally.
- Valid changes are persisted to local storage immediately.
- The library reflects the updated metadata without requiring app restart.

## Playback Progress Flow

**Trigger**: User plays, pauses, completes, or changes lessons.

**Behavior**:
- Playback position is saved periodically and on pause/background.
- Completion state can be toggled manually.
- Last active lesson is updated whenever lesson focus changes.
- Resume state is restored when the course is reopened on the same device.

## Compatibility Notes

- This contract replaces browser-specific assumptions about `showDirectoryPicker`, IndexedDB handles, and DOM video elements.
- Native implementation details may vary by platform, but the user-visible behavior above must remain stable.
