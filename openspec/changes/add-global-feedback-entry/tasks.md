## 1. Implementation

- [x] 1.1 Confirm the public feedback mailbox and centralize the email and GitHub Issues destinations.
- [x] 1.2 Add localized Chinese and English feedback copy to the eager-loaded shell resources.
- [x] 1.3 Add the responsive global feedback trigger and footer link to the application layout.
- [x] 1.4 Implement an accessible feedback chooser for problem reports and tool suggestions, with email and GitHub channel actions.
- [x] 1.5 Generate channel URLs with the feedback type and current route/tool context, using safe external navigation.

## 2. Verification

- [x] 2.1 Add component or end-to-end coverage for desktop and mobile visibility and interaction.
- [x] 2.2 Verify generated `mailto:` and GitHub Issue URLs for both feedback types and representative tool routes.
- [x] 2.3 Verify keyboard interaction, focus return, localized labels, dark mode, and standalone-mode exclusion.
- [x] 2.4 Run the web test suite, lint, and production build.
- [x] 2.5 Run GitNexus `detect_changes` against `main` and confirm only the expected shell flows and symbols are affected.
