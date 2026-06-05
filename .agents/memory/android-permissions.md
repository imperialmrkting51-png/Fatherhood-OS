---
name: Android permission stripping in Expo
description: Why android.permissions:[] is not enough to keep an Expo Android build's manifest clean for Google Play
---

# Empty `android.permissions` does NOT strip autolinked-module permissions

Setting `"android.permissions": []` in `app.json` only controls the *extra* permissions Expo adds — it does **not** remove permissions injected by installed/autolinked native modules. Modules like `expo-image-picker` (CAMERA, RECORD_AUDIO, READ/WRITE storage, READ_MEDIA_*) and `expo-location` (ACCESS_COARSE/FINE_LOCATION) still inject their permissions into the final merged AndroidManifest even when the array is empty.

**Why:** Google Play rejects apps that declare permissions they don't use, so the resolved manifest must match actual app behavior.

**How to apply:** To get a clean manifest:
1. Remove genuinely-unused native deps from package.json (grep the whole artifact for any import first), AND/OR
2. Add `android.blockedPermissions` in app.json listing the unwanted permissions as an explicit guard.
3. Verify the *resolved* result, not the source: `NODE_ENV=production pnpm --filter <pkg> exec expo config --type introspect --json` and check `android.permissions`. A clean API-only app should resolve to just `["android.permission.INTERNET"]`.

`expo config --type introspect` is read-only and safe to run (unlike `expo start`, which the expo skill forbids running directly).
