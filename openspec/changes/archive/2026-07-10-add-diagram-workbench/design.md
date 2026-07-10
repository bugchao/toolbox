# Diagram Workbench Design

## Context

The monorepo currently contains reusable packages under `packages/*` and no full frontend application package. The workbench should therefore be added as a new private package rather than folded into `@zddi/components`. That keeps app-specific dependencies such as Mermaid, diagrams.net embedding, editor libraries, and storage code out of the public component package.

## Package Layout

```text
packages/diagram-workbench/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    app/App.tsx
    app/app.module.scss
    adapters/
      types.ts
      registry.ts
      mermaidAdapter.ts
      plantumlAdapter.ts
      drawioAdapter.ts
    components/
      DiagramShell.tsx
      DiagramSidebar.tsx
      DiagramToolbar.tsx
      DiagramSettingsPanel.tsx
      EditorPane.tsx
      PreviewPane.tsx
      DrawioFrame.tsx
      ImportDialog.tsx
      ExportDialog.tsx
      StatusBar.tsx
    state/
      diagramReducer.ts
      diagramStore.tsx
      actions.ts
    storage/
      indexedDbDiagramRepository.ts
      workspaceCodec.ts
      fileAccess.ts
    utils/
      ids.ts
      downloadBlob.ts
      plantumlEncode.ts
      svgToPng.ts
    __tests__/
      mermaidAdapter.test.ts
      plantumlAdapter.test.ts
      workspaceCodec.test.ts
      diagramReducer.test.ts
    e2e/
      diagram-workbench.spec.ts
```

## Data Model

```ts
export type DiagramEngine = 'mermaid' | 'plantuml' | 'drawio';
export type ExportFormat = 'source' | 'svg' | 'png' | 'workspace-json';

export interface DiagramDocument {
  id: string;
  title: string;
  engine: DiagramEngine;
  source: string;
  settings: DiagramSettings;
  createdAt: number;
  updatedAt: number;
}

export interface DiagramSettings {
  theme: 'default' | 'dark' | 'neutral' | 'forest';
  background: 'transparent' | 'white' | 'grid';
  scale: number;
  plantumlServerUrl: string;
  drawioEmbedUrl: string;
}

export interface DiagramWorkspace {
  schemaVersion: 1;
  workspaceId: string;
  title: string;
  mainDiagramId: string;
  diagrams: DiagramDocument[];
  updatedAt: number;
}
```

Main diagram is workspace metadata, not a separate file. The main diagram controls initial selection, export defaults, and visual badge in the sidebar.

## Adapter Contract

```ts
export interface DiagramAdapter {
  engine: DiagramEngine;
  createTemplate(): string;
  detectImport(fileName: string, content: string): boolean;
  importDocument(fileName: string, content: string): DiagramDocumentDraft;
  validate(document: DiagramDocument): Promise<ValidationResult>;
  render(document: DiagramDocument): Promise<RenderResult>;
  exportDocument(document: DiagramDocument, format: ExportFormat): Promise<Blob>;
}
```

Mermaid renders in the browser. PlantUML builds encoded server URLs and fetches SVG/PNG from the configured server. draw.io does not use the normal render function for editing; the adapter handles XML import/export and the `DrawioFrame` handles iframe lifecycle.

## UI Behavior

- The app opens directly to the workbench.
- If IndexedDB contains a workspace, load it and select `mainDiagramId`.
- If no workspace exists, create a default Mermaid sequence diagram and mark it main.
- Autosave runs after debounced edits and updates `updatedAt`.
- The status bar shows `Saved`, `Saving`, `Unsaved`, or `Error`.
- Import accepts multiple files and creates one diagram per file, except workspace JSON, which replaces the current workspace after confirmation.
- Export defaults to the selected main diagram if no diagram is selected.
- Keyboard shortcuts:
  - `Cmd/Ctrl+S`: save local workspace.
  - `Cmd/Ctrl+O`: open import dialog.
  - `Cmd/Ctrl+E`: open export dialog.

## Storage Strategy

IndexedDB is the source of truth for browser-local persistence. File System Access API is optional enhancement:

- Supported browser: open/save a workspace JSON file handle.
- Unsupported browser: import from file input and export through Blob download.

No backend storage is required.

## Engine Details

### Mermaid

- Use Mermaid JS for rendering.
- Wrap render calls with validation/error capture.
- SVG export returns Mermaid SVG.
- PNG export converts SVG to canvas when possible.

### PlantUML

- Use a client-side encoder for PlantUML server path generation.
- Default server URL is `http://localhost:8080`.
- Rendering fails with a clear error if the server is unreachable.
- SVG and PNG export fetch from the configured server.

### draw.io

- Embed diagrams.net with iframe.
- Parent sends XML to iframe when the editor is ready.
- Parent receives save/export XML through `postMessage`.
- The app rejects messages whose origin does not match the configured draw.io origin.
- Source export is draw.io XML.

## Error Handling

- Invalid Mermaid/PlantUML source shows an inline preview error without losing source text.
- PlantUML network failure shows server URL and retry action.
- draw.io iframe timeout shows a reload editor action.
- IndexedDB failure falls back to workspace JSON download with an explicit warning.
- Import errors are per-file; one bad file does not cancel other imports.

## Testing Strategy

- Unit tests for adapter detection, document import, validation, and export Blob types.
- Unit tests for workspace codec schema validation and round trip.
- Reducer tests for main diagram selection, delete behavior, dirty state, and autosave state.
- Playwright smoke tests for create/edit/save/reload/import/export flows.
- No external PlantUML server dependency in unit tests; mock fetch for adapter tests.
