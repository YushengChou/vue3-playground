# Vue 3 Tools

## Web development

```bash
npm install
npm run dev
```

## Android

This Vue app is packaged for Android with Capacitor. Build the web bundle and copy it into the native Android project:

```bash
npm run cap:sync
```

Then open `android/` in Android Studio, select a device or emulator, and run the app. If Android Studio is already installed, this also opens the project:

```bash
npm run cap:open:android
```

`npm run build` keeps the GitHub Pages base path. `npm run cap:build` uses a relative base path required by Capacitor's native WebView.

The package currently wraps the existing tools as an Android app. Any content-filtering feature needs native implementation and must remain within Android and YouTube policy requirements.
