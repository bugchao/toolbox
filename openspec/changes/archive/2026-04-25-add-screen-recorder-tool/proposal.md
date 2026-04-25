# Change: Add Screen Recorder tool (`tool-screen-recorder`)

## Why

Users need a quick way to record their screen for demos, bug reports, and tutorials without installing software (OBS/Loom) or sending data to the cloud (privacy-sensitive contexts). The browser already exposes `getDisplayMedia` + `MediaRecorder`; this tool wraps those APIs into a manifest-first tool so the existing toolbox stays the single entry point.

## What Changes

- New tool package `tools/tool-screen-recorder/` (manifest-first, `mode: 'client'`)
- Adds capability `screen-recorder` to the spec set
- Routes `/screen-recorder` via the existing manifest discovery pipeline (no static config edits)
- Tool-local i18n: `zh.json` + `en.json` under `src/locales/`
- E2E smoke test: `tests/screen-recorder.spec.ts` (idle-panel render only — recording itself needs user interaction)

No backend, no new package dependencies, no shared module changes. If a `Switch` primitive is needed and missing from `@toolbox/ui-kit`, it gets added there first.

## Impact

- **Affected specs:** `screen-recorder` (NEW capability)
- **Affected code:**
  - `tools/tool-screen-recorder/` (new package)
  - `tests/screen-recorder.spec.ts` (new e2e)
  - `packages/ui-kit/` (only if `Switch` primitive needs adding)
  - `docs/tools/screen-recorder/` (PRD + screenshots, already partially exists)
- **Affected users:** All toolbox users gain a new utility under the `utility` category
- **Privacy:** Tool is local-only; design.md formalizes the no-network-traffic invariant
