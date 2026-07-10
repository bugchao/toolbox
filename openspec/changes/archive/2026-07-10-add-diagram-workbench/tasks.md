# Diagram Workbench Tasks

## 1. Project Setup

- [x] Create private Vite React package `packages/diagram-workbench`.
- [x] Add package scripts: `dev`, `build`, `test`, `e2e`, `lint`, `preview`.
- [x] Add dependencies: `@vitejs/plugin-react`, `vite`, `typescript`, `react`, `react-dom`, `antd`, `@ant-design/icons`, `mermaid`, `idb`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `playwright`.
- [x] Add workspace TypeScript and ESLint config aligned with existing monorepo style.

## 2. Core Domain Model

- [x] Define `DiagramEngine`, `ExportFormat`, `DiagramDocument`, `DiagramSettings`, and `DiagramWorkspace`.
- [x] Add ID and timestamp helpers.
- [x] Add default workspace factory with one Mermaid main diagram.
- [x] Add reducer actions for create, update source, update settings, set main, import, delete, save lifecycle.
- [x] Add reducer tests for every state transition.

## 3. Local Persistence

- [x] Implement IndexedDB repository with `getWorkspace`, `saveWorkspace`, `clearWorkspace`.
- [x] Implement workspace JSON encoder/decoder with schema version `1`.
- [x] Implement download/import helpers for JSON and source files.
- [x] Add tests for IndexedDB round trip and workspace JSON round trip.

## 4. Mermaid Adapter

- [x] Implement Mermaid template creation.
- [x] Implement `.mmd` and `.mermaid` import detection.
- [x] Implement Mermaid validation and SVG rendering.
- [x] Implement source and SVG export.
- [x] Add tests for import detection, render success, render failure, and export Blob types.

## 5. PlantUML Adapter

- [x] Implement PlantUML template creation.
- [x] Implement `.puml` and `.plantuml` import detection.
- [x] Implement PlantUML text encoding.
- [x] Implement PlantUML server SVG/PNG fetch.
- [x] Add tests with mocked fetch for server URL generation, render success, and network failure.

## 6. draw.io Adapter

- [x] Implement `.drawio` and `.xml` import detection.
- [x] Implement XML source export.
- [x] Implement `DrawioFrame` iframe lifecycle.
- [x] Implement origin allowlist for `postMessage`.
- [x] Add tests for XML import/export and message origin rejection.

## 7. Workbench UI

- [x] Build shell layout: sidebar, toolbar, main editor/preview, settings panel, status bar.
- [x] Build diagram list with main diagram badge.
- [x] Build source editor for Mermaid and PlantUML.
- [x] Build preview pane with render errors.
- [x] Build draw.io iframe pane.
- [x] Build settings panel for title, theme, background, scale, PlantUML server URL, draw.io URL, and main diagram toggle.

## 8. Import / Export UX

- [x] Build import dialog for source files and workspace JSON.
- [x] Build export dialog for source, SVG, PNG, and workspace JSON.
- [x] Add confirmation when importing workspace JSON replaces current local workspace.
- [x] Add export default behavior that targets the selected diagram, falling back to main diagram.

## 9. Keyboard and Save UX

- [x] Add debounced autosave.
- [x] Add `Cmd/Ctrl+S` save shortcut.
- [x] Add `Cmd/Ctrl+O` import shortcut.
- [x] Add `Cmd/Ctrl+E` export shortcut.
- [x] Add status messages for saved, saving, unsaved, and error states.

## 10. Browser Verification

- [x] Add Playwright config for `packages/diagram-workbench`.
- [x] Add smoke test: first load creates default Mermaid diagram.
- [x] Add smoke test: edit Mermaid source, reload, source persists.
- [x] Add smoke test: mark second diagram as main, reload, main diagram selected.
- [x] Add smoke test: import workspace JSON and export workspace JSON.
- [x] Add smoke test: PlantUML unreachable server shows inline error.

## 11. Documentation

- [x] Add README for local development.
- [x] Document PlantUML server configuration and privacy warning.
- [x] Document supported import/export file types.
- [x] Document browser support and File System Access fallback.

## 12. Release Readiness

- [x] Run `pnpm --filter @zddi/diagram-workbench lint`.
- [x] Run `pnpm --filter @zddi/diagram-workbench test`.
- [x] Run `pnpm --filter @zddi/diagram-workbench build`.
- [x] Run `pnpm --filter @zddi/diagram-workbench e2e`.
- [x] Confirm no changes to published `@zddi/components` output unless explicitly requested.
