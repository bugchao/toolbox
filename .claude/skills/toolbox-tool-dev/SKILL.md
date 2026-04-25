---
name: toolbox-tool-dev
description: Build a new tool inside this monorepo following the manifest-first standard (tools/tool-<name>/, tool.manifest.ts, src/locales zh+en, ui-kit reuse, optional api-gateway backend). Invoke when implementing or modifying any tool under tools/, when scaffolding via pnpm create:tool, or when wiring routing/i18n for a new tool. Skip for shell-only changes (apps/web/src/layout, theme, navigation shell).
---

# toolbox-tool-dev

Sediments how this repo builds new tools so future tool work follows the same shape without re-deriving conventions from scratch.

## When this skill applies

- Implementing a new tool under `tools/tool-<name>/`
- Adding backend capability for a tool (touching `apps/api-gateway/` or `services/*`)
- Wiring i18n / routing / nav for a tool
- Reviewing an existing tool to bring it onto the current standard

Do not use this skill for shell-level work (layout, theme, homepage, favorites) — that lives in `apps/web/src/` and follows different conventions.

## The four invariants

Every new tool must satisfy these four. If any is missing, the tool is not done.

1. **Lives in its own package**: `tools/tool-<name>/` with its own `package.json` named `@toolbox/tool-<name>`.
2. **Has a manifest**: `tools/tool-<name>/tool.manifest.ts` exporting `defineToolManifest({...})` with all required fields (see Manifest section).
3. **Owns its i18n**: `src/locales/zh.json` + `src/locales/en.json`, loaded lazily via the manifest's `loadMessages`. Do NOT push tool-specific copy into `apps/web/src/locales/`.
4. **Reuses ui-kit**: Pull `PageHero`, `ParticlesBackground`, and other primitives from `@toolbox/ui-kit`. If a needed primitive is missing, add it to `packages/ui-kit/` first — never depend on a third-party UI lib directly inside a tool.

## Step-by-step

### 1. Scaffold

```bash
pnpm create:tool <name>     # name is kebab-case: e.g. dns-query
```

This creates the full skeleton (package.json, tool.manifest.ts, src/index.tsx, src/<Pascal>.tsx, src/locales/{zh,en}.json) and prints next-step guidance. Do not hand-roll these files.

After scaffolding:

```bash
pnpm install                # picks up the new workspace package
```

### 2. Fill in the manifest

`tools/tool-<name>/tool.manifest.ts` needs all of these set correctly (the scaffold leaves `TODO` markers):

| Field | Notes |
|-------|-------|
| `id` | `tool-<name>` — must match the directory |
| `path` | URL path, e.g. `/dns-query` — must be unique across all manifests + static config |
| `namespace` | i18n namespace, camelCase, e.g. `toolDnsQuery` — **must match the `useTranslation('...')` call in the component** |
| `mode` | `'client'` (no backend) \| `'server'` (calls `/api/*`) \| `'hybrid'` |
| `categoryKey` | One of: `dns`, `domain`, `ip`, `dhcp`, `gslb`, `ipam`, `network`, `dev`, `life`, `travel`, `utility`, `ai`, `query`, `learning`, `blockchain`. Look at existing tools in `apps/web/src/config/a-*.ts` for examples; pick the closest fit. |
| `icon` | A `lucide-react` icon component. Browse https://lucide.dev/icons/ — pick something semantically meaningful, not a generic `Wrench`. |
| `keywords` | Mixed zh + en search terms. Aim for 6-15. |
| `meta.zh` / `meta.en` | `title` (short) and `description` (one sentence, ≤ 80 chars in display). |
| `loadComponent` | Keep as `() => import('./src/index')` — the dynamic import is what enables code-splitting. |
| `loadMessages` | Keep as the dynamic-import map for `zh` / `en`. |

### 3. Implement the component

The scaffold writes a minimal `src/<Pascal>.tsx` with `PageHero` + `ParticlesBackground`. Replace the `{/* TODO */}` block with the real UI.

Conventions:

- `useTranslation('<namespace>')` — namespace MUST equal `manifest.namespace`.
- Wrap the page in `<div className="relative min-h-[60vh]">` to match the rest of the app's layout.
- Keep `ParticlesBackground` unless the tool's UX is particle-hostile (data-dense tables, canvas tools).
- For form-heavy tools, look at `tools/tool-data-onchain/` for `Card` / form patterns.
- For tools with multiple sub-views, look at `tools/tool-blockchain-transfer/` for tab patterns.

### 4. Locales

`src/locales/zh.json` and `src/locales/en.json` start with just `title` + `description`. Add every UI string as a key as you build — never hardcode user-facing copy in JSX.

Both files MUST stay in sync (same keys, same structure). When you add a key to `zh.json`, add it to `en.json` in the same edit.

### 5. Backend (only if needed)

Skip this section if `mode: 'client'`.

For `mode: 'server'` or `'hybrid'`:

- New endpoints go under `apps/api-gateway/src/` and are registered through `createApiGatewayApp` in `apps/api-gateway/src/create-app.js`.
- Domain logic belongs in a service module under `services/<domain>-service/` (look at `services/security-service/` for shape). Don't put domain logic inline in route handlers.
- For one-off legacy ports, `services/legacy-tools-service/` is the bridge — but new work should target a real service module.
- The frontend calls the backend via `fetch('/api/...')`. The dev server proxies `/api/*` to `api-gateway` when you run `pnpm dev:full`.

### 6. Routing & navigation

Manifest tools are auto-discovered via the Vite manifest pipeline (`apps/web/src/tooling/tool-manifests.ts`) and routed through `ManifestToolRoute`. **You do not edit any routing file by hand for a new manifest tool.**

The static `apps/web/src/config/a-*.ts` files are for legacy tools that haven't been migrated. Don't add new entries there for a manifest tool — `apps/web/src/config/tools.ts` merges manifest tools in automatically (see `_manifestTools`).

### 7. Verify

Before declaring the tool done, run all of:

```bash
pnpm install                  # if package.json changed
pnpm check:consistency        # routing/nav/manifest/roadmap consistency
pnpm lint                     # web lint
pnpm -C apps/web build        # full web build (catches dynamic-import warnings)
pnpm test                     # vitest suite
```

If `pnpm dev` is the first time you run the tool, confirm:

- Tool appears in the relevant category in the sidebar
- Title and description render in both `zh` and `en` (use the language switcher)
- `i18n` keys are not leaking through as raw `tool<Pascal>:something` strings
- Route loads without console errors

## Common pitfalls

- **Namespace mismatch**: `useTranslation('toolFoo')` but `manifest.namespace: 'toolFooBar'` → all copy renders as raw keys. Fix the namespace, not the locale files.
- **Editing static config for a manifest tool**: Adding the tool to `a-utility-tools.ts` when it's already manifest-discovered → duplicate entry in nav. The manifest is the single source.
- **Pushing copy into shell locales**: Adding `tools.fooBar` to `apps/web/src/locales/zh.json` for a new tool → violates the i18n boundary. Tool copy stays in the tool package.
- **Importing a third-party UI lib directly in a tool**: e.g. `import { Modal } from 'antd'`. Wrap it in `packages/ui-kit/` first.
- **Forgetting `pnpm install` after `create:tool`**: the new workspace package needs to be linked before TS resolves imports.
- **Wrong `categoryKey`**: free-form values silently fall through and the tool won't show up in any category. Use one of the documented values above.

## Reference points in the repo

- Scaffolder source: `scripts/create-tool.cjs`
- Manifest type: `packages/tool-registry/src/index.ts`
- Manifest discovery: `apps/web/src/tooling/tool-manifests.ts` + `virtual:toolbox-manifests` (Vite plugin)
- Route loader: `apps/web/src/tooling/ManifestToolRoute.tsx`
- Tool merge: `apps/web/src/config/tools.ts`
- Category configs (legacy + reference): `apps/web/src/config/a-*.ts`
- Standard doc: `docs/TOOL_LANDING.md`
- Dev workflow doc: `docs/refactor-structure.md`
- E2E example: `tests/zipcode.spec.ts` (pattern for screenshot-style smoke tests)
- Backend example: `apps/api-gateway/src/`, `services/security-service/`
- Recent reference tools: `tools/tool-data-onchain/` (form + ethers integration), `tools/tool-blockchain-transfer/` (tabs + multi-chain)
