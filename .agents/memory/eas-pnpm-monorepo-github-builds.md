---
name: EAS GitHub builds for pnpm monorepos
description: Why EAS Build reports the lockfile as missing/incompatible for a pnpm-workspace Expo app, and the full set of fixes.
---

# EAS Build (GitHub-triggered) for a pnpm monorepo Expo app

Symptom seen across several failed builds, in order:
1. `pnpm install --frozen-lockfile exited with non-zero code: 1` (generic EAS wrapper)
2. `ERR_PNPM_NO_LOCKFILE Cannot install with "--frozen-lockfile" because pnpm-lock.yaml is absent`

The lockfile is NOT actually missing — for a pnpm workspace it correctly lives only at the **repo root** (`pnpm-lock.yaml` + `pnpm-workspace.yaml`), never inside the app dir.

## The two real causes (both produce the "absent" message)
- **pnpm version mismatch:** EAS workers run their own bundled pnpm unless told otherwise. An older pnpm prints `WARN Ignoring not compatible lockfile` for a `lockfileVersion: '9.0'` file, then treats it as absent.
- **Wrong base directory:** EAS resolves paths from the app subdir and never walks up to the workspace root, so the root lockfile is out of view.

## Fixes that worked (all required together)
- Root `package.json`: pin `"packageManager": "pnpm@<exact local version>"`.
- Root `package.json` scripts: `"eas-build-pre-install": "corepack enable && corepack prepare pnpm@<version> --activate"`.
  **Why:** the `packageManager` field alone is NOT honored by EAS workers — corepack must be explicitly enabled in this hook or EAS keeps using its bundled pnpm. This is the single most impactful fix.
- `eas.json` production `env`: `"COREPACK_INTEGRITY_KEYS": "0"` so corepack doesn't fail signature verification for a newer pnpm on an older worker.
- `eas.json` production ios/android: `"image": "latest"` (Expo recommends an explicit image for GitHub-triggered builds).
- **Dashboard (user-only, not code):** EAS project → GitHub build trigger → **Base Directory = the app path** (e.g. `artifacts/dad-mode-mobile`). #1 cause of monorepo GitHub build failures; nothing in the repo can set this.

**How to apply:** when an Expo app in this monorepo fails EAS install, don't regenerate the lockfile — verify it's on `origin/main` at the root, then check corepack activation + base directory first.
