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

## "projectId does not match the current project id" — verify the id EXISTS, don't eyeball it
A persistent EAS projectId mismatch that survives every config edit is usually a **wrong/typo'd `extra.eas.projectId`**, not a missing field. A single mistyped character points `app.json` at a *phantom experience*, so every build (GitHub and CLI) fails identically and visual comparison of two long UUIDs hides the diff.
- **Authoritative check:** `eas project:info` (in the app dir, with `EXPO_TOKEN`). It either prints `fullName`/`ID` for the real project, or errors `Experience with id '…' does not exist.` — the latter proves the id is wrong.
- **Find the real id:** query Expo GraphQL `account.byName(accountName).apps(limit<=50){ id slug fullName }` with `Authorization: Bearer $EXPO_TOKEN` (limit must be ≤50). The app's `id` IS the projectId. Match by `slug`.
- **Why:** EAS resolves "current project" from the project the build is attached to (looked up by id/owner/slug on Expo's servers), not from the file. If the id doesn't exist there, nothing in the repo can ever match.

## Running `eas build` from the main agent (sandboxed git)
- `eas build` git-archives the repo; with a **dirty** working tree it tries to stash/commit and hits the sandbox git guard (`.git/index.lock` → "Destructive git operations are not allowed").
- Workaround: `EAS_NO_VCS=1 eas build -p android --profile production --non-interactive --no-wait` archives the working tree directly (includes uncommitted edits, skips all git writes). Run from the app dir; it still uploads the whole tree and uses remote credentials.
- A clean (committed) tree also works without the flag, since `git archive` is read-only.
