# Diagram Workbench Tasks

## 1. Project Setup

- [ ] Create private Vite React package `packages/diagram-workbench`.
- [ ] Add package scripts: `dev`, `build`, `test`, `e2e`, `lint`, `preview`.
- [ ] Add dependencies: `@vitejs/plugin-react`, `vite`, `typescript`, `react`, `react-dom`, `antd`, `@ant-design/icons`, `mermaid`, `idb`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `playwright`.
- [ ] Add workspace TypeScript and ESLint config aligned with existing monorepo style.

## 2. Core Domain Model

- [ ] Define `DiagramEngine`, `ExportFormat`, `DiagramDocument`, `DiagramSettings`, and `DiagramWorkspace`.
- [ ] Add ID and timestamp helpers.
- [ ] Add default workspace factory with one Mermaid main diagram.
- [ ] Add reducer actions for create, update source, update settings, set main, import, delete, save lifecycle.
- [ ] Add reducer tests for every state transition.

## 3. Local Persistence

- [ ] Implement IndexedDB repository with `getWorkspace`, `saveWorkspace`, `clearWorkspace`.
- [ ] Implement workspace JSON encoder/decoder with schema version `1`.
- [ ] Implement download/import helpers for JSON and source files.
- [ ] Add tests for IndexedDB round trip and workspace JSON round trip.

## 4. Mermaid Adapter

- [ ] Implement Mermaid template creation.
- [ ] Implement `.mmd` and `.mermaid` import detection.
- [ ] Implement Mermaid validation and SVG rendering.
- [ ] Implement source and SVG export.
- [ ] Add tests for import detection, render success, render failure, and export Blob types.

## 5. PlantUML Adapter

- [ ] Implement PlantUML template creation.
- [ ] Implement `.puml` and `.plantuml` import detection.
- [ ] Implement PlantUML text encoding.
- [ ] Implement PlantUML server SVG/PNG fetch.
- [ ] Add tests with mocked fetch for server URL generation, render success, and network failure.

## 6. draw.io Adapter

- [ ] Implement `.drawio` and `.xml` import detection.
- [ ] Implement XML source export.
- [ ] Implement `DrawioFrame` iframe lifecycle.
- [ ] Implement origin allowlist for `postMessage`.
- [ ] Add tests for XML import/export and message origin rejection.

## 7. Workbench UI

- [ ] Build shell layout: sidebar, toolbar, main editor/preview, settings panel, status bar.
- [ ] Build diagram list with main diagram badge.
- [ ] Build source editor for Mermaid and PlantUML.
- [ ] Build preview pane with render errors.
- [ ] Build draw.io iframe pane.
- [ ] Build settings panel for title, theme, background, scale, PlantUML server URL, draw.io URL, and main diagram toggle.

## 8. Import / Export UX

- [ ] Build import dialog for source files and workspace JSON.
- [ ] Build export dialog for source, SVG, PNG, and workspace JSON.
- [ ] Add confirmation when importing workspace JSON replaces current local workspace.
- [ ] Add export default behavior that targets the selected diagram, falling back to main diagram.

## 9. Keyboard and Save UX

- [ ] Add debounced autosave.
- [ ] Add `Cmd/Ctrl+S` save shortcut.
- [ ] Add `Cmd/Ctrl+O` import shortcut.
- [ ] Add `Cmd/Ctrl+E` export shortcut.
- [ ] Add status messages for saved, saving, unsaved, and error states.

## 10. Browser Verification

- [ ] Add Playwright config for `packages/diagram-workbench`.
- [ ] Add smoke test: first load creates default Mermaid diagram.
- [ ] Add smoke test: edit Mermaid source, reload, source persists.
- [ ] Add smoke test: mark second diagram as main, reload, main diagram selected.
- [ ] Add smoke test: import workspace JSON and export workspace JSON.
- [ ] Add smoke test: PlantUML unreachable server shows inline error.

## 11. Documentation

- [ ] Add README for local development.
- [ ] Document PlantUML server configuration and privacy warning.
- [ ] Document supported import/export file types.
- [ ] Document browser support and File System Access fallback.

## 12. Release Readiness

- [ ] Run `pnpm --filter @zddi/diagram-workbench lint`.
- [ ] Run `pnpm --filter @zddi/diagram-workbench test`.
- [ ] Run `pnpm --filter @zddi/diagram-workbench build`.
- [ ] Run `pnpm --filter @zddi/diagram-workbench e2e`.
- [ ] Confirm no changes to published `@zddi/components` output unless explicitly requested.
