# Tasks: CourseUp Mobile App

**Input**: Design documents from `/specs/001-mobile-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mobile-library-contract.md, quickstart.md

**Tests**: No dedicated TDD task set was requested in the feature specification, so this plan focuses on implementation tasks plus quickstart/manual validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when dependencies are satisfied and files do not overlap
- **[Story]**: Maps the task to a specific user story (`[US1]`, `[US2]`, `[US3]`)
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Reshape the repository into separate web and mobile projects without losing the current web app.

- [X] T001 Create a workspace root `package.json` and update root scripts in `C:\Naimur\Projects\courseUpPro\package.json`
- [X] T002 Move the current Vite web app into `C:\Naimur\Projects\courseUpPro\web\package.json`, `C:\Naimur\Projects\courseUpPro\web\src\`, `C:\Naimur\Projects\courseUpPro\web\public\`, `C:\Naimur\Projects\courseUpPro\web\index.html`, `C:\Naimur\Projects\courseUpPro\web\vite.config.ts`, `C:\Naimur\Projects\courseUpPro\web\tsconfig.json`, `C:\Naimur\Projects\courseUpPro\web\tsconfig.app.json`, `C:\Naimur\Projects\courseUpPro\web\tsconfig.node.json`, and `C:\Naimur\Projects\courseUpPro\web\eslint.config.js`
- [X] T003 [P] Update repository ignore rules for the split workspace in `C:\Naimur\Projects\courseUpPro\.gitignore`
- [X] T004 [P] Create Expo mobile workspace configuration in `C:\Naimur\Projects\courseUpPro\mobile\package.json`, `C:\Naimur\Projects\courseUpPro\mobile\app.json`, `C:\Naimur\Projects\courseUpPro\mobile\tsconfig.json`, `C:\Naimur\Projects\courseUpPro\mobile\babel.config.js`, and `C:\Naimur\Projects\courseUpPro\mobile\metro.config.js`
- [X] T005 [P] Create the initial Expo route shell in `C:\Naimur\Projects\courseUpPro\mobile\app\_layout.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\app\index.tsx`
- [X] T006 [P] Create the mobile source directories with starter modules in `C:\Naimur\Projects\courseUpPro\mobile\src\components\`, `C:\Naimur\Projects\courseUpPro\mobile\src\features\`, `C:\Naimur\Projects\courseUpPro\mobile\src\services\`, `C:\Naimur\Projects\courseUpPro\mobile\src\storage\`, `C:\Naimur\Projects\courseUpPro\mobile\src\types\`, and `C:\Naimur\Projects\courseUpPro\mobile\src\utils\`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared mobile foundation required by all stories.

- [X] T007 Create shared mobile domain types in `C:\Naimur\Projects\courseUpPro\mobile\src\types\course.ts` and `C:\Naimur\Projects\courseUpPro\mobile\src\types\progress.ts`
- [X] T008 [P] Port framework-agnostic lesson normalization helpers from the web app into `C:\Naimur\Projects\courseUpPro\mobile\src\utils\course-helpers.ts`
- [X] T009 [P] Port framework-agnostic progress helpers into `C:\Naimur\Projects\courseUpPro\mobile\src\utils\course-progress.ts`
- [X] T010 Create the SQLite bootstrap and schema setup in `C:\Naimur\Projects\courseUpPro\mobile\src\storage\database.ts`
- [X] T011 [P] Implement course repository persistence in `C:\Naimur\Projects\courseUpPro\mobile\src\storage\course-repository.ts`
- [X] T012 [P] Implement progress repository persistence in `C:\Naimur\Projects\courseUpPro\mobile\src\storage\progress-repository.ts`
- [X] T013 [P] Implement device file access helpers in `C:\Naimur\Projects\courseUpPro\mobile\src\services\file-access.ts`
- [X] T014 Create app-level providers and navigation state wiring in `C:\Naimur\Projects\courseUpPro\mobile\app\_layout.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\services\app-provider.tsx`
- [X] T015 Create base mobile UI primitives and theme tokens in `C:\Naimur\Projects\courseUpPro\mobile\src\components\ui\Screen.tsx`, `C:\Naimur\Projects\courseUpPro\mobile\src\components\ui\EmptyState.tsx`, and `C:\Naimur\Projects\courseUpPro\mobile\src\theme\tokens.ts`

**Checkpoint**: Repository split is complete and the mobile app can boot with local storage, file access, shared types, and app providers in place.

---

## Phase 3: User Story 1 - Import and play an offline course (Priority: P1)

**Goal**: Let a user import a local course into the mobile app and play lesson videos offline.

**Independent Test**: Import a local course folder or file batch on a device, see the course in the library, open it, and start playing a lesson with the network disabled.

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement import parsing and lesson normalization service in `C:\Naimur\Projects\courseUpPro\mobile\src\features\import\import-course.ts`
- [X] T017 [P] [US1] Implement import source validation and duplicate-course detection in `C:\Naimur\Projects\courseUpPro\mobile\src\features\import\validate-import.ts`
- [X] T018 [P] [US1] Implement the import picker flow using native document APIs in `C:\Naimur\Projects\courseUpPro\mobile\src\features\import\pick-course-source.ts`
- [X] T019 [US1] Implement course creation and persistence orchestration in `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\create-course.ts`
- [X] T020 [P] [US1] Build the mobile library screen for imported courses in `C:\Naimur\Projects\courseUpPro\mobile\app\index.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseLibraryScreen.tsx`
- [X] T021 [P] [US1] Build reusable course-card and import-empty-state components in `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseCard.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\ImportEmptyState.tsx`
- [X] T022 [P] [US1] Implement the course detail and lesson list route in `C:\Naimur\Projects\courseUpPro\mobile\app\course\[courseId].tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\LessonList.tsx`
- [X] T023 [P] [US1] Implement local video playback with native controls in `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\VideoPlayer.tsx`
- [X] T024 [US1] Connect library selection to the player flow in `C:\Naimur\Projects\courseUpPro\mobile\src\features\player\open-course.ts`
- [X] T025 [US1] Add import, empty-state, and inaccessible-source error messaging in `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\ImportStatusBanner.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\features\import\import-errors.ts`

**Checkpoint**: User Story 1 is complete when a user can import a course, see it in the library, open it, and play local lessons offline.

---

## Phase 4: User Story 2 - Resume progress across sessions (Priority: P2)

**Goal**: Restore the last lesson, saved playback position, and completion state after the app is closed and reopened.

**Independent Test**: Watch part of a lesson, background or close the app, reopen it, and verify the course reopens with the correct lesson and saved progress.

### Implementation for User Story 2

- [X] T026 [P] [US2] Implement progress write operations for playback time and completion state in `C:\Naimur\Projects\courseUpPro\mobile\src\features\player\save-progress.ts`
- [X] T027 [P] [US2] Implement progress hydration for course reopen in `C:\Naimur\Projects\courseUpPro\mobile\src\features\player\load-progress.ts`
- [X] T028 [P] [US2] Add lesson completion controls and progress summary UI in `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\ProgressHeader.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\LessonProgressToggle.tsx`
- [X] T029 [US2] Integrate periodic save, pause save, and restore-on-open behavior in `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\VideoPlayer.tsx`
- [X] T030 [US2] Restore last-opened lesson selection in `C:\Naimur\Projects\courseUpPro\mobile\app\course\[courseId].tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\features\player\open-course.ts`
- [X] T031 [US2] Update library recency and resume metadata in `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\list-courses.ts` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseCard.tsx`
- [X] T032 [US2] Handle invalid or revoked course sources during resume in `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\validate-course-access.ts` and `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseRecoveryNotice.tsx`

**Checkpoint**: User Story 2 is complete when progress survives app restarts and invalid file access produces a recoverable state instead of a silent failure.

---

## Phase 5: User Story 3 - Manage course metadata on mobile (Priority: P3)

**Goal**: Let users edit course title, priority, and thumbnail from the mobile app and persist those changes locally.

**Independent Test**: Edit a course title, priority label, and thumbnail, restart the app, and verify the library still shows the updated metadata.

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement metadata update persistence in `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\update-course-metadata.ts`
- [X] T034 [P] [US3] Implement thumbnail import and app-local asset storage in `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\store-thumbnail.ts`
- [X] T035 [P] [US3] Build the management route shell in `C:\Naimur\Projects\courseUpPro\mobile\app\settings\courses.tsx`
- [X] T036 [P] [US3] Build the metadata edit form UI in `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseMetadataForm.tsx`
- [X] T037 [P] [US3] Build the course management list UI in `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseManagementScreen.tsx`
- [X] T038 [US3] Connect metadata edit actions to persistence in `C:\Naimur\Projects\courseUpPro\mobile\app\settings\courses.tsx` and `C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\update-course-metadata.ts`
- [X] T039 [US3] Reflect updated metadata across the library and player header in `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseCard.tsx`, `C:\Naimur\Projects\courseUpPro\mobile\src\components\player\ProgressHeader.tsx`, and `C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseLibraryScreen.tsx`

**Checkpoint**: User Story 3 is complete when course metadata can be edited locally and those changes remain visible after restarting the app.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish workspace quality, docs, and validation across both projects.

- [X] T040 [P] Update repository-level developer documentation for `web/` and `mobile/` in `C:\Naimur\Projects\courseUpPro\README.md`
- [X] T041 [P] Update mobile run and validation steps in `C:\Naimur\Projects\courseUpPro\specs\001-mobile-app\quickstart.md`
- [X] T042 Verify the moved web app still builds from `C:\Naimur\Projects\courseUpPro\web\package.json` and fix any path regressions in `C:\Naimur\Projects\courseUpPro\web\vite.config.ts`
- [ ] T043 Run the mobile validation flow from `C:\Naimur\Projects\courseUpPro\specs\001-mobile-app\quickstart.md` and record any required follow-up notes in `C:\Naimur\Projects\courseUpPro\README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** must complete first because it establishes the `web/` and `mobile/` workspace structure.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user stories.
- **Phase 3: User Story 1** depends on Phase 2 and delivers the MVP.
- **Phase 4: User Story 2** depends on the playback flow from User Story 1.
- **Phase 5: User Story 3** depends on the course persistence foundation from Phases 2 and 3.
- **Phase 6: Polish** depends on the stories the team chooses to complete.

### User Story Dependencies

- **US1** has no dependency on other user stories after Foundational is complete.
- **US2** depends on US1 because progress restore requires a working import and playback flow.
- **US3** depends on US1 because metadata editing requires imported persisted courses.

### Within Each User Story

- Services and persistence helpers come before screen wiring.
- Reusable components can be built in parallel when they target separate files.
- Screen integration tasks come after the underlying services exist.

### Parallel Opportunities

- Setup tasks `T003`, `T004`, `T005`, and `T006` can run in parallel after `T001` and `T002`.
- Foundational tasks `T008`, `T009`, `T011`, `T012`, and `T013` can run in parallel after `T007` and `T010`.
- In US1, `T016`, `T017`, `T018`, `T020`, `T021`, `T022`, and `T023` can be split across multiple contributors once the foundation is ready.
- In US2, `T026`, `T027`, and `T028` can run in parallel before integration tasks `T029` through `T032`.
- In US3, `T033`, `T034`, `T035`, `T036`, and `T037` can run in parallel before integration tasks `T038` and `T039`.

---

## Parallel Example: User Story 1

```text
Task: "Implement import parsing and lesson normalization service in C:\Naimur\Projects\courseUpPro\mobile\src\features\import\import-course.ts"
Task: "Implement import source validation and duplicate-course detection in C:\Naimur\Projects\courseUpPro\mobile\src\features\import\validate-import.ts"
Task: "Build reusable course-card and import-empty-state components in C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseCard.tsx and C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\ImportEmptyState.tsx"
Task: "Implement local video playback with native controls in C:\Naimur\Projects\courseUpPro\mobile\src\components\player\VideoPlayer.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Implement progress write operations for playback time and completion state in C:\Naimur\Projects\courseUpPro\mobile\src\features\player\save-progress.ts"
Task: "Implement progress hydration for course reopen in C:\Naimur\Projects\courseUpPro\mobile\src\features\player\load-progress.ts"
Task: "Add lesson completion controls and progress summary UI in C:\Naimur\Projects\courseUpPro\mobile\src\components\player\ProgressHeader.tsx and C:\Naimur\Projects\courseUpPro\mobile\src\components\player\LessonProgressToggle.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Implement metadata update persistence in C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\update-course-metadata.ts"
Task: "Implement thumbnail import and app-local asset storage in C:\Naimur\Projects\courseUpPro\mobile\src\features\courses\store-thumbnail.ts"
Task: "Build the metadata edit form UI in C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseMetadataForm.tsx"
Task: "Build the course management list UI in C:\Naimur\Projects\courseUpPro\mobile\src\components\courses\CourseManagementScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 to preserve the current web app and establish the `mobile/` workspace.
2. Complete Phase 2 to create the shared mobile storage, file access, and provider foundation.
3. Complete Phase 3 to ship offline import and playback on mobile.
4. Stop and validate the User Story 1 independent test on a device.

### Incremental Delivery

1. Deliver the workspace split and mobile foundation.
2. Deliver US1 for import and playback.
3. Deliver US2 for resume and progress persistence.
4. Deliver US3 for metadata management.
5. Finish with validation and documentation updates.

### Suggested MVP Scope

User Story 1 only. It delivers the smallest useful mobile outcome while preserving the existing web app under `web/`.

---

## Notes

- All tasks use the required checklist format.
- Total task count: 43
- Task count by story: US1 = 10, US2 = 7, US3 = 7
- Setup/Foundation tasks: 15
- Polish tasks: 4
