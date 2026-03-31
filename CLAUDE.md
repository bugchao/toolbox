# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands must be run from the repo root using pnpm.

```bash
pnpm install          # Install all workspace dependencies
pnpm dev              # Dev server at http://localhost:3000 (hot-reloads tools/* too)
pnpm build            # Production build → apps/web/dist
pnpm preview          # Preview production build locally
pnpm start            # Serve production build (requires build first)
pnpm lint             # ESLint on web app
pnpm test             # Vitest unit tests (single run via apps/web test:run)
pnpm -C apps/web test # Vitest unit tests (watch mode)
pnpm test:e2e         # Playwright E2E tests (chromium)
pnpm test:e2e:ui      # Playwright E2E with UI mode
pnpm crawl:news       # Scrape news → apps/web/public/news.json
pnpm create:tool <name>  # Scaffold a new tool package under tools/
```

## Architecture

This is a **pnpm monorepo** (workspaces: `apps/*`, `packages/*`, `services/*`, `tools/*`) built with React 18 + TypeScript + Vite + Tailwind CSS.

### Key layers

- **`apps/web/`** — Main SPA. Entry point for dev and build. Contains routing (`App.tsx`), layout/nav (`components/Layout.tsx`), pages not yet extracted (`src/pages/`), i18n config (`src/i18n.ts`), and locale files (`src/locales/zh.json`, `en.json`).
- **`apps/api-gateway/`** — Express API backend (security, domain-suite, ip-ops tools).
- **`packages/core/`** — Shared types and `ToolLoader` interface.
- **`packages/ui-kit/`** — Shared React components (Button, Card, Input, etc.) with Tailwind dark-mode support. Prefer these over custom components.
- **`tools/tool-xxx/`** — 163 independent tool packages, each with their own `package.json` and `src/index.tsx`. Heavy/unique dependencies live here, not in `apps/web`.

### Tool loading

Tools are lazy-loaded in `apps/web/src/App.tsx`:
```tsx
const MyTool = lazy(() => import('@toolbox/tool-xxx'))
```
Vite resolves `@toolbox/*` aliases by auto-scanning the `tools/` directory (configured in `apps/web/vite.config.ts`). Every new tool package must also be added to `optimizeDeps.exclude` in that config.

### Adding a new tool

Navigation and homepage cards are driven by `apps/web/src/config/tools.ts`, which aggregates per-category files (`a-travel-tools.ts`, `a-dev-tools.ts`, etc.). Do **not** edit `Layout.tsx` or `Home.tsx` directly for tool entries.

**Method A — simple page (no unique deps):**
1. Add component to `apps/web/src/pages/MyTool.tsx`
2. Register route in `apps/web/src/App.tsx`
3. Add an entry to the relevant `apps/web/src/config/a-*.ts` category file (`{ path, nameKey, icon, categoryKey, keywords, i18nNamespace }`)
4. Update `TOOLS_LIST.md`

**Method B — independent package (unique deps):**
1. `pnpm create:tool <name>` → creates `tools/tool-xxx/`
2. Add `"@toolbox/tool-xxx": "workspace:*"` to `apps/web/package.json` dependencies
3. Register lazy route in `apps/web/src/App.tsx`
4. Add `'@toolbox/tool-xxx'` to `optimizeDeps.exclude` in `apps/web/vite.config.ts`
5. Add an entry to the relevant `apps/web/src/config/a-*.ts` category file
6. If the tool includes a `tool.manifest.ts`, import and register it in `apps/web/src/tooling/tool-manifests.ts`
7. `pnpm install` then update `TOOLS_LIST.md`

### Dependency rules

- `apps/web/package.json` — only main app and non-extracted page deps (no jspdf, qrcode, pdf-lib, etc.)
- `tools/tool-xxx/package.json` — all deps specific to that tool
- Root `package.json` — only scripts, `express` (for `server.js`), and `@playwright/test`

### i18n

Uses i18next with namespaces. All user-facing strings go in `apps/web/src/locales/zh.json` and `en.json`. Namespaces must be registered in `apps/web/src/i18n.ts`. In components: `const { t } = useTranslation('namespace')`.

### Theme

`packages/ui-kit` components use Tailwind `dark:` classes. The app toggles `dark` class on `document.documentElement` via `ThemeContext`. User preference is persisted in localStorage.

## Key files

| File | Purpose |
|------|---------|
| `apps/web/src/App.tsx` | All routes + lazy imports |
| `apps/web/src/config/tools.ts` | Aggregates all tool entries from `a-*.ts` category files |
| `apps/web/src/config/a-*.ts` | Per-category tool entry lists (add new tools here) |
| `apps/web/src/tooling/tool-manifests.ts` | Manifest registry for tools with `tool.manifest.ts` |
| `apps/web/src/i18n.ts` | i18n initialization and namespace registry |
| `apps/web/vite.config.ts` | Aliases, API middleware, `optimizeDeps.exclude` |
| `server.js` | Production static + API server |
| `docs/refactor-structure.md` | Detailed developer guide |
| `docs/TOOLS_ROADMAP.md` | Tool planning and implementation status |
| `TOOLS_LIST.md` | Complete tool inventory (keep in sync) |
