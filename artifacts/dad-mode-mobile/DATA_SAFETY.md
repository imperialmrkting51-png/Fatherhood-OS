# Google Play — Data Safety Form Answers (Dad Mode)

Use these answers when filling out the **Data safety** section in Google Play Console
(App content → Data safety). They reflect exactly what the app collects as of this build.

Privacy policy URL to enter: **https://fatherhood-os.replit.app/privacy**

---

## Overview questions

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (all traffic is HTTPS) |
| Do you provide a way for users to request that their data is deleted? | **Yes** (in-app child deletion + email request for full account deletion) |

> Note: Daily quest progress is stored only on the device (AsyncStorage) and never
> leaves the phone, so it is **not** declared as collected data.

---

## Data types collected

For every type below, the answers to the standard sub-questions are the same unless noted:
- **Collected:** Yes · **Shared:** No
- **Processing:** Collected (not ephemeral)
- **Encrypted in transit:** Yes
- **Users can request deletion:** Yes

### 1. Personal info → Name
- **Collected:** Yes — **Shared:** No
- **Required or optional:** Required (part of the sign-in account)
- **Purpose:** App functionality, Account management

### 2. Personal info → Email address
- **Collected:** Yes — **Shared:** No
- **Required or optional:** Required (sign-in)
- **Purpose:** App functionality, Account management

### 3. Personal info → Other info
*(the children's profile data the parent enters: first name, birthdate, notes;
plus activities and memory journal text)*
- **Collected:** Yes — **Shared:** No
- **Required or optional:** Optional (the user chooses what to add)
- **Purpose:** App functionality

### 4. Photos and videos → Photos
*(only if the user attaches a photo to a memory entry)*
- **Collected:** Yes — **Shared:** No
- **Required or optional:** Optional
- **Purpose:** App functionality
- ⚠️ Only declare this if the build actually ships photo attachment. The current
  build stores an optional `imageUrl` on memories but has **no in-app image picker**,
  so if no photo-upload UI is shipped you may leave this **unchecked**. Re-check it
  the moment you add photo upload.

---

## Data types NOT collected (leave unchecked)

- Location (precise or approximate) — removed; app requests no location permission
- Financial info, Health & fitness, Messages, Contacts, Calendar
- App activity / browsing history, Search history
- Device or other IDs, Advertising ID
- Audio, Files & docs

---

## Third parties / "sharing"

- **Clerk (clerk.com)** is the authentication provider. It processes your name and
  email **on your behalf** as a service provider — under Google Play's definitions
  this is **collection via a processor, not "sharing."** So answer **"No"** to data
  sharing. (You may still mention Clerk in your privacy policy, which the page does.)
- The app uses **no advertising, no analytics SDKs, and no tracking.**

---

## Account / Ads / Target audience (related sections)

- **Ads:** App contains no ads → declare "No ads."
- **Target audience & content (separate section):** The app is for **parents/adults**.
  Select an adults (18+) or general audience that excludes children as the target,
  since the app is a tool for parents — it is not directed to children. This keeps
  you out of the Families/Designed-for-Families program requirements.
- **Account deletion URL (if requested):** point to the same privacy page, which
  states full-account deletion is available by emailing privacy@imperialmarketing.com.
  (For a smoother review, consider adding a self-serve "Delete account" button later.)
