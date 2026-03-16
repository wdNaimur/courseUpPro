# Run Guide: CourseUp Mobile

This guide covers local running and Android APK builds for the app inside `mobile/`.

## Project Path

```text
C:\Naimur\Projects\courseUpPro\mobile
```

## Prerequisites

- Node.js 20+
- npm 10+
- Android Studio for emulator use
- Expo account for cloud Android builds with EAS

Optional:

- Expo Go on a real Android phone

## 1. Open the Mobile App Folder

```bash
cd C:\Naimur\Projects\courseUpPro\mobile
```

## 2. Install Dependencies

```bash
npm install
```

If you also want Android cloud builds, install EAS CLI:

```bash
npm install -g eas-cli
```

## 3. Run the App Locally

Start Expo:

```bash
npx expo start
```

Then use one of these:

- Press `a` to open Android emulator
- Scan the QR code with Expo Go on Android
- Run `npx expo run:android` for a native Android run

Useful local commands:

```bash
npx expo start
npx expo run:android
npm run lint
```

## 4. Build an Android APK

This is the easiest way to install the app on your own Android phone.

### Step 1: Log in to Expo

```bash
eas login
```

### Step 2: Configure EAS for the project

If this is the first time:

```bash
eas build:configure
```

Important:

- The app config currently contains a placeholder project ID in [app.json](C:\Naimur\Projects\courseUpPro\mobile\app.json)
- Replace `REPLACE_WITH_EXPO_PROJECT_ID` after Expo creates the project

### Step 3: Build the APK

```bash
npm run build:apk
```

This uses [eas.json](C:\Naimur\Projects\courseUpPro\mobile\eas.json) with the `preview` profile and produces an Android `.apk`.

### Step 4: Install on Your Phone

After the build finishes, Expo gives you a download URL.

On your Android phone:

1. Open the download link
2. Download the `.apk`
3. Allow install from unknown sources if Android asks
4. Install the app

## 5. Build for Play Store Later

If you later want Play Store distribution:

```bash
npm run build:aab
```

That produces an Android App Bundle (`.aab`) using the `production` profile.

## 6. Root-Level Shortcuts

From the repository root:

```bash
cd C:\Naimur\Projects\courseUpPro
npm run dev:mobile
npm run android
```

For APK builds, run the commands from `mobile/`.

## 7. Common Problems

### `expo` is not recognized

Run:

```bash
cd C:\Naimur\Projects\courseUpPro\mobile
npm install
```

Then retry:

```bash
npx expo start
```

### `eas` is not recognized

Install it:

```bash
npm install -g eas-cli
```

### Android build fails before upload

Check:

- `npm install` finished successfully in `mobile/`
- you ran `eas login`
- [app.json](C:\Naimur\Projects\courseUpPro\mobile\app.json) has a real Expo project ID
- Android package name `com.courseuppro.mobile` is acceptable for your Expo project

## 8. Current Android Build Files

- Expo app config: [app.json](C:\Naimur\Projects\courseUpPro\mobile\app.json)
- EAS build config: [eas.json](C:\Naimur\Projects\courseUpPro\mobile\eas.json)
- Mobile package scripts: [package.json](C:\Naimur\Projects\courseUpPro\mobile\package.json)

## 9. Current State

- The repo is already split into `web/` and `mobile/`
- The web app build was validated successfully
- The mobile app still needs `npm install` in `mobile/` before Expo commands can run
- The Android APK path is now prepared, but the final device build was not executed in this environment
