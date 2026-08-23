# Change: Add a global feedback entry

## Why

Bug Tide currently has no consistent, visible way for visitors to report a problem or suggest a new tool. A lightweight global entry can turn feedback into actionable GitHub issues or email messages without introducing a backend or collecting user data in the site.

## What Changes

- Add a persistent “Feedback & ideas” control to the application shell, with a compact top-bar entry and a supporting footer link on desktop and mobile layouts.
- Let visitors choose between reporting a problem and suggesting a tool, then continue through email or GitHub Issues.
- Pre-fill the selected channel with the current page or tool context so submissions are easier to understand and triage.
- Add Chinese and English copy, accessible keyboard/focus behavior, and safe external-link handling.
- Keep standalone tool windows unchanged; they intentionally omit the global application shell.
- Add automated coverage for global visibility, feedback type selection, generated channel links, mobile use, and standalone mode.

## Impact

- Affected specs: `global-feedback` (new capability)
- Affected code: `apps/web/src/components/Layout.tsx`, shell locale resources, and shell/e2e tests
- External integrations: GitHub Issues for `bugchao/toolbox` and `lookdyc@gmail.com`
- Backend/data impact: none; the site does not persist or proxy feedback content

## Resolved Question

- The maintainer approved `lookdyc@gmail.com` as the public feedback mailbox.
