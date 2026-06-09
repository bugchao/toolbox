# Diagram Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first browser workbench for Mermaid, PlantUML, and draw.io diagrams with visual settings, main diagram selection, import/export, and local persistence.

**Architecture:** Add a new private React/Vite workspace package at `packages/diagram-workbench`. Keep rendering and import/export behavior behind engine adapters, keep local persistence behind a repository interface, and keep UI state in a reducer/store so the app can be tested without browser-only APIs.

**Tech Stack:** React 18, TypeScript, Vite, antd, Mermaid JS, IndexedDB through `idb`, Vitest, Testing Library, Playwright.

---

## File Structure

- Create `packages/diagram-workbench/package.json`: private package metadata, scripts, dependencies.
- Create `packages/diagram-workbench/index.html`: Vite HTML entry.
- Create `packages/diagram-workbench/vite.config.ts`: React/Vite config.
- Create `packages/diagram-workbench/tsconfig.json`: TypeScript config extending repo settings.
- Create `packages/diagram-workbench/src/main.tsx`: React bootstrap.
- Create `packages/diagram-workbench/src/app/App.tsx`: app shell composition.
- Create `packages/diagram-workbench/src/app/app.module.scss`: layout CSS.
- Create `packages/diagram-workbench/src/adapters/types.ts`: adapter interfaces and shared result types.
- Create `packages/diagram-workbench/src/adapters/registry.ts`: adapter lookup.
- Create `packages/diagram-workbench/src/adapters/mermaidAdapter.ts`: Mermaid create/import/render/export.
- Create `packages/diagram-workbench/src/adapters/plantumlAdapter.ts`: PlantUML create/import/render/export.
- Create `packages/diagram-workbench/src/adapters/drawioAdapter.ts`: draw.io XML create/import/export.
- Create `packages/diagram-workbench/src/state/diagramTypes.ts`: document/workspace model.
- Create `packages/diagram-workbench/src/state/diagramReducer.ts`: workspace reducer.
- Create `packages/diagram-workbench/src/state/diagramStore.tsx`: React context/provider.
- Create `packages/diagram-workbench/src/storage/indexedDbDiagramRepository.ts`: IndexedDB persistence.
- Create `packages/diagram-workbench/src/storage/workspaceCodec.ts`: JSON import/export validation.
- Create `packages/diagram-workbench/src/storage/fileAccess.ts`: browser file import/export helpers.
- Create `packages/diagram-workbench/src/components/*.tsx`: UI shell, sidebar, toolbar, settings, editor, preview, draw.io iframe, dialogs, status bar.
- Create `packages/diagram-workbench/src/utils/*.ts`: IDs, Blob download, PlantUML encoding, SVG to PNG.
- Create unit tests under `packages/diagram-workbench/src/__tests__/`.
- Create E2E tests under `packages/diagram-workbench/e2e/`.

---

### Task 1: Package Scaffold

**Files:**

- Create: `packages/diagram-workbench/package.json`
- Create: `packages/diagram-workbench/index.html`
- Create: `packages/diagram-workbench/vite.config.ts`
- Create: `packages/diagram-workbench/tsconfig.json`
- Create: `packages/diagram-workbench/src/main.tsx`
- Create: `packages/diagram-workbench/src/app/App.tsx`
- Create: `packages/diagram-workbench/src/app/app.module.scss`

- [ ] **Step 1: Create package manifest**

Create `packages/diagram-workbench/package.json`:

```json
{
  "name": "@zddi/diagram-workbench",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 8020",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 8021",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@ant-design/icons": "5.6.1",
    "@zddi/components": "workspace:*",
    "antd": ">=5.0.0 <6.0.0",
    "idb": "^8.0.0",
    "mermaid": "^11.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@testing-library/jest-dom": "^6.1.3",
    "@testing-library/react": "^14.0.0",
    "@types/react": "~18.0.21",
    "@types/react-dom": "~18.0.6",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "~4.9.5",
    "vite": "^5.0.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create Vite config**

Create `packages/diagram-workbench/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8020,
    host: '0.0.0.0',
  },
  preview: {
    port: 8021,
    host: '0.0.0.0',
  },
});
```

- [ ] **Step 3: Create TypeScript config**

Create `packages/diagram-workbench/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create HTML entry**

Create `packages/diagram-workbench/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Diagram Workbench</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create React bootstrap**

Create `packages/diagram-workbench/src/main.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Create temporary app shell**

Create `packages/diagram-workbench/src/app/App.tsx`:

```tsx
import styles from './app.module.scss';

export const App = () => (
  <main className={styles.shell}>
    <aside className={styles.sidebar}>Diagrams</aside>
    <section className={styles.workspace}>Diagram Workbench</section>
    <aside className={styles.settings}>Settings</aside>
  </main>
);
```

Create `packages/diagram-workbench/src/app/app.module.scss`:

```scss
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  background: #f5f7fb;
  color: #182033;
}

.sidebar,
.workspace,
.settings {
  min-width: 0;
  padding: 16px;
  border-right: 1px solid #d9deea;
}

.workspace {
  background: #ffffff;
}
```

- [ ] **Step 7: Run scaffold build**

Run: `pnpm --filter @zddi/diagram-workbench build`

Expected: TypeScript and Vite build succeed.

- [ ] **Step 8: Commit scaffold**

```bash
git add packages/diagram-workbench
git commit -m "feat: scaffold diagram workbench"
```

---

### Task 2: Domain Model and Reducer

**Files:**

- Create: `packages/diagram-workbench/src/state/diagramTypes.ts`
- Create: `packages/diagram-workbench/src/state/diagramReducer.ts`
- Create: `packages/diagram-workbench/src/utils/ids.ts`
- Create: `packages/diagram-workbench/src/__tests__/diagramReducer.test.ts`

- [ ] **Step 1: Define model types**

Create `packages/diagram-workbench/src/state/diagramTypes.ts`:

```ts
export type DiagramEngine = 'mermaid' | 'plantuml' | 'drawio';
export type ExportFormat = 'source' | 'svg' | 'png' | 'workspace-json';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface DiagramSettings {
  theme: 'default' | 'dark' | 'neutral' | 'forest';
  background: 'transparent' | 'white' | 'grid';
  scale: number;
  plantumlServerUrl: string;
  drawioEmbedUrl: string;
}

export interface DiagramDocument {
  id: string;
  title: string;
  engine: DiagramEngine;
  source: string;
  settings: DiagramSettings;
  createdAt: number;
  updatedAt: number;
}

export interface DiagramWorkspace {
  schemaVersion: 1;
  workspaceId: string;
  title: string;
  mainDiagramId: string;
  selectedDiagramId: string;
  diagrams: DiagramDocument[];
  updatedAt: number;
  saveStatus: SaveStatus;
  lastError?: string;
}
```

- [ ] **Step 2: Add deterministic ID helper**

Create `packages/diagram-workbench/src/utils/ids.ts`:

```ts
export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};
```

- [ ] **Step 3: Implement reducer**

Create `packages/diagram-workbench/src/state/diagramReducer.ts` with actions for `createDiagram`, `updateSource`, `updateSettings`, `setMainDiagram`, `deleteDiagram`, `selectDiagram`, and `setSaveStatus`. Ensure deleting the main diagram chooses the next available diagram as main.

- [ ] **Step 4: Write reducer tests**

Create tests that assert:

```ts
import { describe, expect, it } from 'vitest';
import { createDefaultWorkspace, diagramReducer } from '../state/diagramReducer';

describe('diagramReducer', () => {
  it('creates a default workspace with one main selected diagram', () => {
    const workspace = createDefaultWorkspace(1000);
    expect(workspace.diagrams).toHaveLength(1);
    expect(workspace.mainDiagramId).toBe(workspace.diagrams[0].id);
    expect(workspace.selectedDiagramId).toBe(workspace.diagrams[0].id);
  });

  it('sets exactly one main diagram', () => {
    const workspace = createDefaultWorkspace(1000);
    const next = diagramReducer(workspace, { type: 'createDiagram', engine: 'plantuml', now: 1001 });
    const created = next.diagrams[1];
    const updated = diagramReducer(next, { type: 'setMainDiagram', diagramId: created.id, now: 1002 });
    expect(updated.mainDiagramId).toBe(created.id);
  });

  it('moves main diagram when deleting the main diagram', () => {
    const workspace = diagramReducer(createDefaultWorkspace(1000), {
      type: 'createDiagram',
      engine: 'plantuml',
      now: 1001,
    });
    const oldMain = workspace.mainDiagramId;
    const updated = diagramReducer(workspace, { type: 'deleteDiagram', diagramId: oldMain, now: 1002 });
    expect(updated.mainDiagramId).toBe(updated.diagrams[0].id);
    expect(updated.selectedDiagramId).toBe(updated.mainDiagramId);
  });
});
```

- [ ] **Step 5: Run reducer tests**

Run: `pnpm --filter @zddi/diagram-workbench test -- diagramReducer`

Expected: reducer tests pass.

- [ ] **Step 6: Commit domain model**

```bash
git add packages/diagram-workbench/src/state packages/diagram-workbench/src/utils packages/diagram-workbench/src/__tests__
git commit -m "feat: add diagram workspace model"
```

---

### Task 3: Storage and Workspace Codec

**Files:**

- Create: `packages/diagram-workbench/src/storage/indexedDbDiagramRepository.ts`
- Create: `packages/diagram-workbench/src/storage/workspaceCodec.ts`
- Create: `packages/diagram-workbench/src/storage/fileAccess.ts`
- Create: `packages/diagram-workbench/src/utils/downloadBlob.ts`
- Create: `packages/diagram-workbench/src/__tests__/workspaceCodec.test.ts`

- [ ] **Step 1: Implement workspace codec**

Implement `encodeWorkspace(workspace)` and `decodeWorkspace(json)` so JSON round trips preserve `schemaVersion`, `workspaceId`, `title`, `mainDiagramId`, `selectedDiagramId`, diagrams, settings, and `updatedAt`.

- [ ] **Step 2: Implement IndexedDB repository**

Use `idb` to create database `diagram-workbench`, object store `workspace`, and key `current`.

- [ ] **Step 3: Implement file helpers**

Implement `readTextFile(file: File)` and `downloadBlob(blob, fileName)` for import/export fallback.

- [ ] **Step 4: Write codec tests**

Assert that:

```ts
const json = encodeWorkspace(workspace);
const decoded = decodeWorkspace(json);
expect(decoded.mainDiagramId).toBe(workspace.mainDiagramId);
expect(decoded.diagrams[0].source).toBe(workspace.diagrams[0].source);
```

Also assert invalid JSON throws `Invalid workspace JSON`.

- [ ] **Step 5: Run storage tests**

Run: `pnpm --filter @zddi/diagram-workbench test -- workspaceCodec`

Expected: workspace codec tests pass.

- [ ] **Step 6: Commit storage**

```bash
git add packages/diagram-workbench/src/storage packages/diagram-workbench/src/utils/downloadBlob.ts packages/diagram-workbench/src/__tests__/workspaceCodec.test.ts
git commit -m "feat: persist diagram workspace locally"
```

---

### Task 4: Engine Adapter Contracts

**Files:**

- Create: `packages/diagram-workbench/src/adapters/types.ts`
- Create: `packages/diagram-workbench/src/adapters/registry.ts`
- Create: `packages/diagram-workbench/src/adapters/mermaidAdapter.ts`
- Create: `packages/diagram-workbench/src/adapters/plantumlAdapter.ts`
- Create: `packages/diagram-workbench/src/adapters/drawioAdapter.ts`
- Create: `packages/diagram-workbench/src/utils/plantumlEncode.ts`
- Create: `packages/diagram-workbench/src/__tests__/plantumlAdapter.test.ts`
- Create: `packages/diagram-workbench/src/__tests__/mermaidAdapter.test.ts`

- [ ] **Step 1: Define adapter interface**

Create an adapter interface with `createTemplate`, `detectImport`, `importDocument`, `validate`, `render`, and `exportDocument`.

- [ ] **Step 2: Implement Mermaid adapter**

Use Mermaid JS for `render`. Export source as `.mmd` text and SVG as `image/svg+xml`.

- [ ] **Step 3: Implement PlantUML encoder**

Implement PlantUML deflate/base64 URL-safe encoding in `plantumlEncode.ts`. Test known input:

```ts
expect(encodePlantuml('@startuml\nAlice -> Bob: Hi\n@enduml')).toMatch(/^[A-Za-z0-9_-]+$/);
```

- [ ] **Step 4: Implement PlantUML adapter**

Build SVG URL as `${plantumlServerUrl.replace(/\/$/, '')}/svg/${encoded}` and PNG URL as `/png/${encoded}`.

- [ ] **Step 5: Implement draw.io XML adapter**

Detect `.drawio` and `.xml`, preserve XML source, export source as `application/xml`.

- [ ] **Step 6: Register adapters**

`registry.ts` exports `getAdapter(engine)` and `detectAdapter(fileName, content)`.

- [ ] **Step 7: Run adapter tests**

Run: `pnpm --filter @zddi/diagram-workbench test -- Adapter`

Expected: all adapter contract tests pass.

- [ ] **Step 8: Commit adapters**

```bash
git add packages/diagram-workbench/src/adapters packages/diagram-workbench/src/utils/plantumlEncode.ts packages/diagram-workbench/src/__tests__
git commit -m "feat: add diagram engine adapters"
```

---

### Task 5: Workbench UI

**Files:**

- Create: `packages/diagram-workbench/src/state/diagramStore.tsx`
- Create: `packages/diagram-workbench/src/components/DiagramShell.tsx`
- Create: `packages/diagram-workbench/src/components/DiagramSidebar.tsx`
- Create: `packages/diagram-workbench/src/components/DiagramToolbar.tsx`
- Create: `packages/diagram-workbench/src/components/DiagramSettingsPanel.tsx`
- Create: `packages/diagram-workbench/src/components/EditorPane.tsx`
- Create: `packages/diagram-workbench/src/components/PreviewPane.tsx`
- Create: `packages/diagram-workbench/src/components/DrawioFrame.tsx`
- Create: `packages/diagram-workbench/src/components/StatusBar.tsx`
- Modify: `packages/diagram-workbench/src/app/App.tsx`

- [ ] **Step 1: Create diagram store provider**

Create React context with workspace state, dispatch, selected diagram, selected adapter, and save status.

- [ ] **Step 2: Build shell layout**

Replace temporary `App` content with `DiagramShell`.

- [ ] **Step 3: Build sidebar**

Render diagram titles, engine labels, selected state, and main badge. Include buttons for new Mermaid, new PlantUML, and new draw.io.

- [ ] **Step 4: Build toolbar**

Add buttons: import, export, save, set main.

- [ ] **Step 5: Build editor and preview panes**

Use `<textarea>` for Mermaid and PlantUML source editor. Use `PreviewPane` for render output and errors. Use `DrawioFrame` for draw.io XML editing.

- [ ] **Step 6: Build settings panel**

Expose title, theme, background, scale, PlantUML server URL, draw.io embed URL, and main diagram toggle.

- [ ] **Step 7: Run build**

Run: `pnpm --filter @zddi/diagram-workbench build`

Expected: build succeeds.

- [ ] **Step 8: Commit UI**

```bash
git add packages/diagram-workbench/src/components packages/diagram-workbench/src/state/diagramStore.tsx packages/diagram-workbench/src/app
git commit -m "feat: build diagram workbench UI"
```

---

### Task 6: Import, Export, Autosave, and Shortcuts

**Files:**

- Create: `packages/diagram-workbench/src/components/ImportDialog.tsx`
- Create: `packages/diagram-workbench/src/components/ExportDialog.tsx`
- Modify: `packages/diagram-workbench/src/components/DiagramToolbar.tsx`
- Modify: `packages/diagram-workbench/src/state/diagramStore.tsx`
- Modify: `packages/diagram-workbench/src/app/App.tsx`

- [ ] **Step 1: Implement import dialog**

Accept `.mmd`, `.mermaid`, `.puml`, `.plantuml`, `.drawio`, `.xml`, and `.json`.

- [ ] **Step 2: Implement export dialog**

Export selected diagram source, SVG, PNG, or full workspace JSON. Fallback to main diagram if no diagram is selected.

- [ ] **Step 3: Implement debounced autosave**

Save workspace to IndexedDB after source/settings/title/main changes. Update status bar from unsaved to saving to saved.

- [ ] **Step 4: Implement keyboard shortcuts**

Add:

```ts
const isMod = event.metaKey || event.ctrlKey;
if (isMod && event.key.toLowerCase() === 's') saveWorkspace();
if (isMod && event.key.toLowerCase() === 'o') openImportDialog();
if (isMod && event.key.toLowerCase() === 'e') openExportDialog();
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
pnpm --filter @zddi/diagram-workbench test
pnpm --filter @zddi/diagram-workbench build
```

Expected: both commands pass.

- [ ] **Step 6: Commit import/export**

```bash
git add packages/diagram-workbench/src
git commit -m "feat: add diagram import export and autosave"
```

---

### Task 7: Browser E2E and Documentation

**Files:**

- Create: `packages/diagram-workbench/playwright.config.ts`
- Create: `packages/diagram-workbench/e2e/diagram-workbench.spec.ts`
- Create: `packages/diagram-workbench/README.md`

- [ ] **Step 1: Add Playwright config**

Configure Playwright web server command `pnpm --filter @zddi/diagram-workbench dev` and base URL `http://127.0.0.1:8020`.

- [ ] **Step 2: Add E2E smoke tests**

Write tests for:

- first load creates Mermaid diagram
- edit source persists after reload
- mark second diagram as main persists after reload
- import/export workspace JSON
- unreachable PlantUML server shows inline error

- [ ] **Step 3: Add README**

Document:

- `pnpm --filter @zddi/diagram-workbench dev`
- supported engines
- supported import/export formats
- PlantUML server privacy warning
- local persistence behavior
- File System Access fallback

- [ ] **Step 4: Run final verification**

Run:

```bash
pnpm --filter @zddi/diagram-workbench lint
pnpm --filter @zddi/diagram-workbench test
pnpm --filter @zddi/diagram-workbench build
pnpm --filter @zddi/diagram-workbench e2e
```

Expected: all commands pass.

- [ ] **Step 5: Commit verification and docs**

```bash
git add packages/diagram-workbench
git commit -m "test: cover diagram workbench flows"
```
