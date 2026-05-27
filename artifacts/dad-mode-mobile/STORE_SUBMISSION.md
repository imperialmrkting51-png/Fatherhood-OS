# App Store Submission Guide — Dad Mode

Bundle ID: `com.imperialmarketing.dados`

---

## Step 1 — Create accounts (if not done)

- **Apple Developer Program**: https://developer.apple.com/programs — $99/year
- **Google Play Console**: https://play.google.com/console — $25 one-time
- **Expo account** (free): https://expo.dev/signup

---

## Step 2 — Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

---

## Step 3 — Link this project to Expo

Inside `artifacts/dad-mode-mobile/`:

```bash
eas init
```

This generates a real `projectId`. Replace `REPLACE_WITH_EAS_PROJECT_ID` in `app.json` with the value it gives you.

---

## Step 4 — Add your icon

Drop your icon image (1024×1024 px, PNG, no transparency) at:
- `assets/images/icon.png` — used for iOS
- `assets/images/adaptive-icon.png` — used for Android (foreground layer, safe zone in center 66%)
- `assets/images/splash.png` — splash screen (1284×2778 px recommended)

---

## Step 5 — Set environment secrets in EAS

```bash
eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "pk_live_YOUR_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_DOMAIN --value "fatherhood-os.replit.app"
```

Use your **live** Clerk key (starts with `pk_live_`) for production — not the test key.

---

## Step 6 — Build for production

```bash
# From inside artifacts/dad-mode-mobile/
eas build --platform all --profile production
```

EAS will:
- Ask to set up iOS credentials (handles signing certs + provisioning automatically)
- Ask to set up Android keystore (generates and stores it securely)
- Run cloud builds (~15–30 min)
- Give you download links for the `.ipa` (iOS) and `.aab` (Android)

---

## Step 7 — Submit to stores

```bash
# Fill in eas.json submit section first (Apple ID, team ID, etc.)
eas submit --platform all --profile production
```

### iOS — extra steps before submit:
1. Go to https://appstoreconnect.apple.com → My Apps → New App
2. Fill in name ("Dad Mode"), bundle ID (`com.imperialmarketing.dados`), SKU, language
3. Copy the numeric App ID from the URL → paste into `eas.json` as `ascAppId`
4. Fill in your Apple team ID (found at developer.apple.com → Account → Membership)

### Android — extra steps before submit:
1. Go to https://play.google.com/console → Create app
2. Create a Service Account in Google Cloud Console with Play Developer API access
3. Download the JSON key → save as `google-service-account.json` (do NOT commit this file)

---

## Step 8 — App Store listing content

**Short description (30 chars):** Quest log for fatherhood

**Full description:**
Dad Mode turns fatherhood into an adventure. Track quality time with your kids, log memories that matter, plan weekly activities, and earn XP for showing up consistently. Built for dads who want to be present — and have a record to prove it.

**Keywords (iOS):** dad, parenting, kids, family, journal, activities, fatherhood, children, memories, tracker

**Category:** Lifestyle (primary), Health & Fitness (secondary)

**Age rating:** 4+ (no objectionable content)

---

## Clerk — switch to production instance

Before submitting, create a **production** Clerk instance at https://dashboard.clerk.com:
1. Create a new application (or promote dev to prod)
2. Add `fatherhood-os.replit.app` as an allowed domain
3. Copy the `pk_live_...` publishable key
4. Use that key in Step 5 above
