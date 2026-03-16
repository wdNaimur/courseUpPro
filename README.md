# CourseUp Pro

CourseUp Pro is now organized as a small monorepo with separate web and mobile apps in the same repository.

## Projects

- `web/`: the existing React + Vite local course player for desktop browsers
- `mobile/`: the new Expo + React Native mobile app for offline course import and playback
- `specs/001-mobile-app/`: planning and execution artifacts for the mobile-app feature branch

## Workspace Commands

From the repository root:

```bash
npm run dev:web
npm run build:web
npm run lint:web
npm run dev:mobile
npm run android
npm run ios
```

## Web App

The web app code lives under `web/`. It was moved intact from the original root structure and still builds successfully with:

```bash
cmd /c npm --prefix web run build
```

## Mobile App

The mobile app code lives under `mobile/` and uses Expo Router, Expo SQLite, Expo Document Picker, Expo File System, and Expo Video.

Current mobile implementation areas:

- local course import from device-selected video files
- persisted course and lesson metadata in SQLite
- offline lesson playback route
- resume/progress persistence scaffolding
- metadata management route for title, priority, and thumbnails
- Android EAS build configuration for APK and AAB generation

## Android APK Build

From [mobile](C:\Naimur\Projects\courseUpPro\mobile):

```bash
npm install
npm install -g eas-cli
eas login
eas build:configure
npm run build:apk
```

Detailed Android instructions are in [RUN_MOBILE.md](C:\Naimur\Projects\courseUpPro\mobile\RUN_MOBILE.md).

## Notes

- The sandbox used for this implementation could validate the moved web build, but it could not complete device-level Expo validation without installing mobile dependencies and running on an emulator or physical device.
- Root-level `src/`, `public/`, and Vite config were moved into `web/` as part of the repository split.
