# Add Diagram Workbench

## Summary

Build a browser-based diagram workbench that supports Mermaid, PlantUML, and draw.io/diagrams.net diagrams through open-source tooling and adapter boundaries. Users can create or import diagrams, visually configure the main diagram, preview/edit it on the page, export it in common formats, and persist work locally.

## Motivation

Teams need a local-first diagram tool for architecture and operations diagrams without switching between multiple websites or losing files in browser tabs. Mermaid and PlantUML are text-first and version-control friendly, while draw.io is visual-first and better for freeform diagrams. A unified workbench can cover all three workflows with consistent project management, import/export, and local persistence.

## Scope

### In Scope

- New private workspace package `packages/diagram-workbench` built as a React/Vite app.
- Diagram workspace UI with a project sidebar, main editor/preview area, settings panel, and import/export toolbar.
- Local persistence through IndexedDB with JSON project export/import fallback.
- Mermaid adapter using Mermaid JS in-browser rendering.
- PlantUML adapter using a configurable PlantUML server URL and client-side URL encoding.
- draw.io adapter using diagrams.net embed mode iframe and `postMessage` XML load/save.
- Main diagram designation: one diagram per workspace can be marked as the default/main diagram and is selected on app load and project export.
- Unit tests for adapter contracts and storage behavior.
- Browser smoke tests for create, edit, save, reload, import, export, and main diagram selection.

### Out of Scope

- Multi-user collaboration.
- Server-side storage or user accounts.
- Backend PlantUML rendering service implementation.
- Full draw.io feature reimplementation.
- Cloud sync.
- Authentication or permissions.
- Publishing this workbench as part of `@zddi/components`.

## Proposed User Experience

- The first screen is the workbench itself, not a landing page.
- The left rail lists diagrams in the local workspace and marks the current main diagram.
- The center area edits and previews the selected diagram:
  - Mermaid and PlantUML use a source editor with live preview.
  - draw.io uses the diagrams.net embedded editor.
- The right panel exposes diagram settings:
  - title, engine, theme, background, preview scale, PlantUML server URL, export format, and main diagram toggle.
- The toolbar exposes new, import, export, save, save as local file, and open local file actions.
- Unsaved changes are visible in the status area and saved automatically to IndexedDB.

## Architecture

The workbench will be a private package in the monorepo. The app layer owns layout and routing. Core diagram behavior is isolated into engine adapters so Mermaid, PlantUML, and draw.io can evolve independently.

Key boundaries:

- `storage/`: IndexedDB repository and workspace JSON import/export.
- `adapters/`: engine-specific import, render, validate, and export logic.
- `components/`: shell, sidebar, toolbar, editor panes, preview panes, and settings panel.
- `state/`: reducer or store for selected document, dirty status, local save lifecycle, and main diagram selection.

## Risks

- PlantUML source may contain sensitive architecture data if rendered through a public server. Mitigation: default to a configurable local/internal server and show a clear warning when using a non-local URL.
- draw.io embed integration depends on cross-origin `postMessage`. Mitigation: allowlist the diagrams.net origin and reject all other messages.
- File System Access API has limited browser support. Mitigation: implement IndexedDB first and fallback import/download paths for file operations.
- PNG export may differ across engines due to font and SVG-to-canvas behavior. Mitigation: make SVG export the primary deterministic format and treat PNG as best-effort with tests for basic output.

## Acceptance Criteria

- A user can create Mermaid, PlantUML, and draw.io diagrams from the workbench.
- A user can mark one diagram as the main diagram and the app restores it after reload.
- A user can import Mermaid, PlantUML, draw.io XML, and workspace JSON files.
- A user can export the current diagram source and SVG where supported.
- A user can export and re-import the entire workspace without losing diagram titles, engine types, source, settings, or main diagram state.
- The app works without a backend for Mermaid, draw.io XML editing, local saves, and workspace import/export.
- PlantUML rendering works when a reachable PlantUML server URL is configured.
- Tests cover adapter contracts, storage round trips, and core browser workflows.
