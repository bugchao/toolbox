# CLAUDE.md

This file gives collaboration guidance to Claude Code and similar coding agents working in this repository.

## Core Commands

Run all commands from the repo root with `pnpm`.

```bash
pnpm install              # Install workspace dependencies
pnpm dev                  # Start the web app only
pnpm dev:api              # Start api-gateway only
pnpm dev:full             # Start web + api-gateway together
pnpm build                # Build apps/web
pnpm build:backend        # Build apps/api-gateway
pnpm preview              # Preview the web build locally
pnpm start                # Start production server.js compatibility entry
pnpm start:api            # Start the api-gateway runtime
pnpm create:tool <name>   # Scaffold a new manifest-first tool package
pnpm lint                 # Lint apps/web
pnpm test                 # Run web unit tests once
pnpm test:e2e             # Run Playwright E2E tests
```

## Current Architecture

This repository is a `pnpm` monorepo. The current architecture is:

- `apps/web/`
  - Main SPA shell
  - Owns layout, route shell, theme, favorites, homepage, and shell i18n
- `apps/api-gateway/`
  - Backend gateway entry
  - Receives `/api/*` requests in the new architecture
- `tools/tool-*/`
  - Independent tools
  - New tools should default to this structure
- `packages/ui-kit/`
  - Shared UI components
  - External UI libraries should be wrapped here before tool usage
- `packages/tool-registry/`
  - Tool manifest types and helpers
- `packages/i18n-runtime/`
  - Tool-level lazy i18n loading support
- `packages/service-core/`
  - Shared backend service abstractions
- `services/legacy-tools-service/`
  - Compatibility bridge for older server-side tool handlers

`server.js` still exists as a compatibility entry, but new backend work should align with `apps/api-gateway/` and service modules.

## Tool Development Standard

### Default rule

New tools should follow the current standard:

1. `pnpm create:tool <name>`
2. Implement inside `tools/tool-<name>/`
3. Keep tool i18n inside the tool package
4. Reuse `@toolbox/ui-kit` before adding custom shared UI
5. Let routing/nav come from tool manifests and tool config integration

### Tool package expectations

Each new tool should normally include:

- `tools/tool-<name>/package.json`
- `tools/tool-<name>/tool.manifest.ts`
- `tools/tool-<name>/src/index.tsx`
- `tools/tool-<name>/src/<Component>.tsx`
- `tools/tool-<name>/src/locales/zh.json`
- `tools/tool-<name>/src/locales/en.json`

### Routing and registration

- Manifest-based tools are discovered through the Vite manifest pipeline and loaded via `apps/web/src/tooling/ManifestToolRoute.tsx`.
- Navigation and homepage metadata still need the appropriate entry in `apps/web/src/config/a-*.ts`.
- Do not manually edit layout rendering for tool entries.

### Internationalization

- Shell-level text lives in `apps/web/src/locales/`.
- Tool-specific text should live inside the tool package.
- Avoid pushing new tool-specific UI copy into the shell locale files unless the shell itself needs it.

### Shared UI

- Prefer `@toolbox/ui-kit`.
- If you need a third-party UI primitive, wrap it in `packages/ui-kit` first.
- Do not import external UI libraries directly into many tools unless there is a strong reason.

## Documentation Rules

Use the current document hierarchy consistently:

- [README.md](README.md)
  - Project entry and command overview
- [docs/README.md](docs/README.md)
  - Documentation index and active-vs-archive boundaries
- [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md)
  - Authoritative developed / planned tool list
- [docs/ROADMAP_CONVENTION.md](docs/ROADMAP_CONVENTION.md)
  - How to add or update planning items
- [docs/TOOL_LANDING.md](docs/TOOL_LANDING.md)
  - New tool landing standard
- [docs/refactor-structure.md](docs/refactor-structure.md)
  - Current dev workflow and directory responsibilities

Do not treat `TOOLS_LIST.md` as an exact inventory document. It is now only a high-level product-facing entry page.

Temporary reports, snapshots, and dated one-off notes should go to `docs/archive/`, not the active docs root.

## Practical Guardrails

- Do not add new long-lived process docs at the repo root unless they are true entry documents.
- Do not maintain duplicated “exact counts” across multiple markdown files.
- When a tool ships, update `docs/TOOLS_ROADMAP.md` first.
- When a doc becomes a dated snapshot or a one-off report, archive it instead of keeping it in active docs.
