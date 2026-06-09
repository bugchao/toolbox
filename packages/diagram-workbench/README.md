# @toolbox/diagram-workbench

Browser-based diagram workbench supporting Mermaid, PlantUML, and draw.io through engine adapters.

> Phase 1 scope: domain model, IndexedDB persistence, JSON workspace import/export, Mermaid adapter contract. UI shell, PlantUML / draw.io adapters and Playwright suite ship in subsequent phases (see `openspec/changes/add-diagram-workbench/tasks.md` sections 5-11).

## Conventions

- Package namespace deviates from the proposal's `@zddi/diagram-workbench` to `@toolbox/diagram-workbench` to align with the existing monorepo workspace (`@toolbox/*`).
- All persistence goes through IndexedDB (`storage/indexeddb.ts`); workspace JSON encoding lives in `storage/json.ts` with `schemaVersion: 1`.

## Development

```bash
pnpm --filter @toolbox/diagram-workbench dev
pnpm --filter @toolbox/diagram-workbench test
pnpm --filter @toolbox/diagram-workbench build
```

## Layout

```
src/
  domain/     types, factory, reducer + tests
  storage/    IndexedDB + JSON encode/decode + tests
  adapters/   engine adapters (Mermaid implemented; PlantUML & draw.io pending)
  test/       vitest setup (fake-indexeddb, jest-dom)
  App.tsx     placeholder shell (Section 7 will replace it)
  main.tsx    Vite entry
```
