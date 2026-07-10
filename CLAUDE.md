<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **toolbox** (23120 symbols, 32780 relationships, 268 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/toolbox/context` | Codebase overview, check index freshness |
| `gitnexus://repo/toolbox/clusters` | All functional areas |
| `gitnexus://repo/toolbox/processes` | All execution flows |
| `gitnexus://repo/toolbox/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
