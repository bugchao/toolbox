# @toolbox/diagram-workbench

Browser-based diagram workbench supporting **Mermaid**, **PlantUML**, and **draw.io** through engine adapters. Local-first: everything runs in the browser, persisted to IndexedDB.

## Status

All 12 OpenSpec sections shipped (see `openspec/changes/add-diagram-workbench/`):

| Section | Scope | Phase |
|---|---|---|
| 1 | Project setup (Vite / React / antd / vitest) | 1 |
| 2 | Domain model (types, factory, reducer) | 1 |
| 3 | IndexedDB persistence + workspace JSON encoder | 1 |
| 4 | Mermaid adapter (lazy import) | 1 |
| 5 | PlantUML adapter (deflate + custom alphabet, mockable fetch) | 2 |
| 6 | draw.io adapter (postMessage bus + iframe component) | 2 / 4 |
| 7 | Workbench UI shell (sidebar / editor / preview / settings / status / toolbar) | 3 |
| 8 | Import / export UX (workspace JSON + single source files + source / SVG) | 3 / 4 |
| 9 | Keyboard: `Cmd/Ctrl+S` save, `Cmd/Ctrl+O` import, `Cmd/Ctrl+E` export | 3 / 4 |
| 10 | Playwright smoke tests | 5 |
| 11 | Documentation (this README) | 5 |
| 12 | Release readiness (lint / test / build / e2e all green) | 5 |

## Conventions

- Package name is **`@toolbox/diagram-workbench`** (deviates from the proposal's `@zddi/diagram-workbench` to match the monorepo).
- Persistence: single IndexedDB store, fixed key `current`. Workspace JSON uses `schemaVersion: 1`.
- All engines implement the same `DiagramAdapter` contract (`adapters/types.ts`): `validate`, `render`, `template`, `defaultSourceName`.

## Develop

```bash
pnpm --filter @toolbox/diagram-workbench dev       # vite dev → http://localhost:5181
pnpm --filter @toolbox/diagram-workbench test      # unit tests
pnpm --filter @toolbox/diagram-workbench build     # tsc + vite build
pnpm --filter @toolbox/diagram-workbench preview   # serve dist
pnpm --filter @toolbox/diagram-workbench e2e       # Playwright smoke
```

First-time Playwright run also needs:
```bash
pnpm --filter @toolbox/diagram-workbench exec playwright install chromium
```

## Supported file types

### Source files (per-document import / export)

| Engine | Import extensions | Export extension |
|---|---|---|
| Mermaid | `.mmd`, `.mermaid` | `.mmd` |
| PlantUML | `.puml`, `.plantuml` | `.puml` |
| draw.io | `.drawio`, `.xml` | `.drawio` |

### Workspace JSON

The full workspace (all diagrams + selection + main badge) round-trips through a single JSON file with `schemaVersion: 1`. Export name: `workspace-YYYY-MM-DD.json`.

### Rendered output

- **SVG export** is available for Mermaid and PlantUML via the Toolbar → Export → SVG menu. The current diagram is re-rendered on demand.
- **PNG export** is not implemented (Section 4 risk note in proposal); SVG is the primary deterministic format.
- draw.io uses its own toolbar to export SVG/PNG from the embedded editor.

## PlantUML server

Sensitive architecture data should not be sent to public servers. The default URL is `http://localhost:8080/plantuml/`. To use a different server:

1. Select a PlantUML diagram in the sidebar.
2. Open the right-hand settings panel.
3. Edit **PlantUML server URL**. A yellow warning labels public URLs as risky.

The URL must end with `/`. Recommended deployment is a containerised PlantUML server reachable only inside your network.

## Browser support

- Modern Chromium, Firefox, and Safari are supported. The app uses `IndexedDB` (universal), `postMessage` (universal), and Mermaid's standard SVG renderer.
- **File System Access API** is not used; downloads go through the standard anchor-element trick.
- **draw.io** integration uses `https://embed.diagrams.net` by default. Override via the per-document `drawioUrl` setting if you host diagrams.net internally; add the corresponding origin to your allowlist in code if it differs from the default pair (`embed.diagrams.net` + `app.diagrams.net`).

## Layout

```
packages/diagram-workbench/
  index.html
  playwright.config.ts
  vite.config.ts (vitest in-config)
  src/
    main.tsx            entry
    App.tsx             Layout + ConfigProvider + StoreProvider + KeyboardShortcuts
    domain/             types / factory / reducer (15 tests)
    storage/            IndexedDB + JSON encoder + source/SVG download (19 tests)
    adapters/           Mermaid / PlantUML / draw.io + registry (60 tests)
    components/         Toolbar / Sidebar / EditorPane / PreviewPane / SettingsPanel / StatusBar / DrawioFrame (3 tests)
    state/store.tsx     useReducer + debounced autosave
    test/setup.ts       jsdom polyfills (matchMedia, ResizeObserver) + fake-indexeddb
  tests/e2e/
    smoke.spec.ts       5 Playwright user flows
```

## Security notes

- **draw.io**: incoming `postMessage` is filtered by strict-equal origin allowlist (`isAllowedOrigin` in `adapters/drawio.ts`). HTTP, subdomain, path-suffix variants are rejected.
- **PlantUML**: empty / non-`/` server URLs fall back to `localhost`; the UI shows a yellow warning when a non-local URL is configured.
- **No telemetry** — there is no analytics or remote logging.

## License

Private package. Not published; not exposed by `@toolbox` public surface.
