---
name: Duplicate @types/react in RN+web monorepo
description: Why a global @types/react override is unsafe here, and how to fix the shadcn ref-type errors instead.
---

# Duplicate @types/react (RN + web monorepo)

Two `@types/react` versions coexist in the tree: the catalog web version (e.g. 19.2.x)
and **19.1.17, pinned as a peer by `react-native` (0.81.5) / `@react-native/virtualized-lists`**
(also pulled by `zustand` via `@base-org/account`). This produces TS2322 "two different
types with this name exist" errors on refs — notably in shadcn `calendar.tsx`
(`rootRef`) and `spinner.tsx` (lucide icon ref).

**Rule:** Do NOT add a global `pnpm.overrides` for `@types/react` to dedupe.

**Why:** the Expo/React-Native mobile app typechecks clean *against* 19.1.17; forcing a
single web version can break the mobile typecheck/build. The duplication is types-only
(no runtime impact).

**How to apply:** fix the affected components surgically and per-artifact instead:
- spinner: type props as `React.ComponentProps<typeof Loader2Icon>` (not `<"svg">`).
- calendar: cast `ref={rootRef as React.Ref<HTMLDivElement>}`.
Apply the same fix in every artifact that vendors these shadcn components (dad-os AND mockup-sandbox).
