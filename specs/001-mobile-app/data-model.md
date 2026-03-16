# Data Model: CourseUp Mobile App

## Course

**Purpose**: Represents a locally imported course shown in the mobile library.

**Fields**:
- `id`: string, stable primary key derived from import source and normalized lesson structure
- `title`: string, 1-120 characters
- `priority`: string, 1-40 characters, default `Standard`
- `thumbnailUri`: string nullable, app-local URI for preview artwork
- `sourceUri`: string, persistent device URI for the imported root
- `sourceType`: enum `directory | document-tree | file-batch`
- `accessStatus`: enum `available | unavailable | permission_required`
- `lessonCount`: integer, minimum 1
- `lastPlayedAt`: integer timestamp nullable
- `createdAt`: integer timestamp
- `updatedAt`: integer timestamp

**Relationships**:
- One `Course` has many `Lesson` records.
- One `Course` has one `CourseProgress` record.
- One `Course` has one `CourseImportSource` record.

**Validation Rules**:
- `title` must trim to a non-empty string.
- `priority` falls back to `Standard` when blank.
- `lessonCount` must match the number of persisted lessons for the course.

## Lesson

**Purpose**: Represents a playable video item within a course.

**Fields**:
- `id`: string, path-based stable identifier within a course
- `courseId`: string, foreign key to `Course.id`
- `title`: string, normalized lesson title
- `displayIndex`: integer, sequential order starting at 1
- `relativePath`: string, normalized path inside the course
- `mediaUri`: string, device-local URI to the video file
- `folderLabel`: string, readable grouping label
- `folderPath`: string, slash-delimited folder grouping path
- `durationSeconds`: number nullable
- `createdAt`: integer timestamp

**Relationships**:
- Many `Lesson` records belong to one `Course`.

**Validation Rules**:
- `displayIndex` must be unique within a course.
- `relativePath` must be unique within a course.
- `mediaUri` must use a device-supported local URI scheme.

## CourseProgress

**Purpose**: Tracks learner progress for a course.

**Fields**:
- `courseId`: string, primary key and foreign key
- `lastLessonId`: string nullable
- `completedLessonCount`: integer, default `0`
- `lastOpenedAt`: integer timestamp nullable
- `updatedAt`: integer timestamp

**Relationships**:
- One `CourseProgress` belongs to one `Course`.
- One `CourseProgress` has many `LessonProgress` records.

**Validation Rules**:
- `completedLessonCount` must equal the number of completed `LessonProgress` records for the course.

## LessonProgress

**Purpose**: Stores playback and completion state for a single lesson.

**Fields**:
- `courseId`: string, foreign key
- `lessonId`: string, foreign key-like reference to `Lesson.id`
- `playbackPositionSeconds`: number, default `0`
- `durationSeconds`: number, default `0`
- `completed`: boolean, default `false`
- `updatedAt`: integer timestamp

**Relationships**:
- Many `LessonProgress` records belong to one `CourseProgress`.

**Validation Rules**:
- `playbackPositionSeconds` cannot be negative.
- `durationSeconds` cannot be negative.
- `playbackPositionSeconds` cannot exceed `durationSeconds + tolerance` when duration is known.

## CourseImportSource

**Purpose**: Tracks how the course was imported and whether the original content is still reachable.

**Fields**:
- `courseId`: string, primary key and foreign key
- `rootUri`: string, persistent source URI
- `sourceType`: enum `directory | document-tree | file-batch`
- `persistedAccessGranted`: boolean
- `lastValidatedAt`: integer timestamp nullable
- `lastValidationResult`: enum `available | unavailable | permission_required`

**Relationships**:
- One `CourseImportSource` belongs to one `Course`.

## State Transitions

- `Course.accessStatus`: `available -> permission_required` when the app loses access but recovery is possible.
- `Course.accessStatus`: `available -> unavailable` when the source no longer exists or no lesson URIs are valid.
- `Course.accessStatus`: `permission_required -> available` when the user reauthorizes access.
- `LessonProgress.completed`: `false -> true` when the user marks complete or reaches completion threshold.
- `LessonProgress.completed`: `true -> false` when the user manually unmarks completion.
