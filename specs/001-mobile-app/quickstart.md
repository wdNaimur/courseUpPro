# Quickstart: CourseUp Mobile App

## Goal

Run the planned mobile version locally with Expo and validate the core offline course workflow.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI available through `npx expo`
- Android Studio emulator or Expo Go on a physical device
- Xcode for iOS simulator work on macOS

## Workspace Layout

- `web/` contains the preserved browser app
- `mobile/` contains the Expo mobile app
- repository root contains workspace scripts

## Initial Setup

1. Install dependencies:

```bash
npm install
```

2. Install web dependencies if needed and confirm the preserved browser app still builds:

```bash
cmd /c npm --prefix web run build
```

3. Install mobile dependencies inside the new workspace:

```bash
cd mobile
npm install
```

4. Start the Expo development server:

```bash
cd mobile
npx expo start
```

## Manual Validation Flow

1. Launch the app on Android or iOS from the `mobile/` workspace.
2. Import a local course that contains nested lesson videos.
3. Confirm the course appears in the library with lesson count and metadata.
4. Open a lesson and confirm local video playback starts.
5. Pause mid-lesson, close the app, reopen it, and confirm resume state is restored.
6. Open the metadata management screen, edit course title, priority, and thumbnail, then confirm the library reflects the changes after restart.
7. Revoke or break access to imported files and confirm the course shows an unavailable or recovery state instead of failing silently.

## Notes

- The current mobile code assumes Expo dependencies are installed inside `mobile/`.
- The preserved web app builds independently from `web/` and should remain untouched by mobile-specific dependency changes.
