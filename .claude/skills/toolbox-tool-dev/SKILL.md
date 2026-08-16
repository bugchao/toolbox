---
name: toolbox-tool-dev
description: 在此 monorepo 中构建新工具，遵循 manifest-first 标准（tools/tool-<name>/、tool.manifest.ts、src/locales zh+en、ui-kit 复用、可选 api-gateway 后端）。在实现或修改 tools/ 下的任何工具时调用，在通过 pnpm create:tool 搭建脚手架时调用，或在为新工具连接路由/i18n 时调用。对于仅 shell 的更改（apps/web/src/layout、theme、导航 shell）跳过。
---

# toolbox-tool-dev

沉淀此仓库如何构建新工具，以便未来的工具工作遵循相同的形态，而无需从头重新推导约定。

## 何时应用此技能

- 在 `tools/tool-<name>/` 下实现新工具
- 为工具添加后端能力（触及 `apps/api-gateway/` 或 `services/*`）
- 为工具连接 i18n / 路由 / 导航
- 审查现有工具以使其符合当前标准

不要将此技能用于 shell 级工作（布局、主题、主页、收藏夹）— 这些位于 `apps/web/src/` 中并遵循不同的约定。

## 五个不变量

每个新工具必须满足这五个。如果缺少任何一个，工具就没有完成。

1. **位于自己的包中**：`tools/tool-<name>/`，有自己的 `package.json`，名为 `@toolbox/tool-<name>`。
2. **有一个 manifest**：`tools/tool-<name>/tool.manifest.ts` 导出 `defineToolManifest({...})`，包含所有必需字段（参见 Manifest 部分）。
3. **拥有自己的 i18n**：`src/locales/zh.json` + `src/locales/en.json`，通过 manifest 的 `loadMessages` 延迟加载。不要将工具特定的文案推送到 `apps/web/src/locales/`。
4. **复用 ui-kit**：从 `@toolbox/ui-kit` 中提取 `PageHero`、`ParticlesBackground` 和其他原语。如果缺少所需的原语，首先将其添加到 `packages/ui-kit/` — 永远不要在工具内直接依赖第三方 UI 库。
5. **支持暗色主题**：不要写只在浅色模式下能看清的类名。灰阶/背景/边框优先用语义色 token（`bg-surface`/`bg-surface-muted`/`bg-surface-inset`/`text-ink`/`text-ink-muted`/`text-ink-subtle`/`border-edge`/`border-edge-strong`，定义在 `apps/web/src/index.css` + `apps/web/tailwind.config.js`，跟随 `.dark` class 自动切换，无需手写 `dark:`）；token 覆盖不到的强调色横幅/徽章（红/绿/靛蓝等），手动补 `dark:` 变体，如 `bg-red-50 dark:bg-red-900/20`、`text-red-600 dark:text-red-400`。全站曾有 89 个文件完全没做暗色适配，是用户在暗色主题下看到黑字看不清才发现的——参见下面「常见陷阱」，不要重蹈覆辙。

## 分步指南

### 1. 脚手架

```bash
pnpm create:tool <name>     # name 是 kebab-case：例如 dns-query
```

这会创建完整的骨架（package.json、tool.manifest.ts、src/index.tsx、src/<Pascal>.tsx、src/locales/{zh,en}.json）并打印下一步指导。不要手工创建这些文件。

脚手架后：

```bash
pnpm install                # 获取新的工作区包
```

### 2. 填写 manifest

`tools/tool-<name>/tool.manifest.ts` 需要正确设置所有这些（脚手架留下 `TODO` 标记）：

| 字段 | 说明 |
|-------|-------|
| `id` | `tool-<name>` — 必须与目录匹配 |
| `path` | URL 路径，例如 `/dns-query` — 必须在所有 manifest + 静态配置中唯一 |
| `namespace` | i18n 命名空间，驼峰式，例如 `toolDnsQuery` — **必须与组件中的 `useTranslation('...')` 调用匹配** |
| `mode` | `'client'`（无后端）\| `'server'`（调用 `/api/*`）\| `'hybrid'` |
| `categoryKey` | 必须是 `apps/web/src/components/Layout.tsx` 的 `CATEGORIES` 数组里已注册的 id 之一：`qrcode`、`dev`、`ai`、`query`、`utils`、`network`、`dns`、`domain`、`ip`、`ipam`、`security`、`life`、`social_game`、`travel`、`learn`、`news`、`blockchain`。注意是 `utils` 不是 `utility`、`learn` 不是 `learning`——用错的话 `pnpm check:consistency` 会报错（曾经有 14 个工具因为写成 `utility` 而在侧边栏里完全消失，直到这个检查加上才发现）。 |
| `icon` | 一个 `lucide-react` 图标组件。浏览 https://lucide.dev/icons/ — 选择语义上有意义的东西，而不是通用的 `Wrench`。 |
| `keywords` | 混合中英文搜索词。目标 6-15 个。 |
| `meta.zh` / `meta.en` | `title`（简短）和 `description`（一句话，显示时 ≤ 80 字符）。 |
| `loadComponent` | 保持为 `() => import('./src/index')` — 动态导入是启用代码分割的关键。 |
| `loadMessages` | 保持为 `zh` / `en` 的动态导入映射。 |

### 3. 实现组件

脚手架编写了一个最小的 `src/<Pascal>.tsx`，包含 `PageHero` + `ParticlesBackground`。用真实的 UI 替换 `{/* TODO */}` 块。

约定：

- `useTranslation('<namespace>')` — 命名空间必须等于 `manifest.namespace`。
- 将页面包装在 `<div className="relative min-h-[60vh]">` 中以匹配应用程序其余部分的布局。
- 保留 `ParticlesBackground`，除非工具的 UX 对粒子不友好（数据密集表格、画布工具）。
- 对于表单密集型工具，查看 `tools/tool-data-onchain/` 以获取 `Card` / 表单模式。
- 对于具有多个子视图的工具，查看 `tools/tool-blockchain-transfer/` 以获取选项卡模式。

### 4. Locales

`src/locales/zh.json` 和 `src/locales/en.json` 开始时只有 `title` + `description`。在构建时将每个 UI 字符串添加为键 — 永远不要在 JSX 中硬编码面向用户的文案。

两个文件必须保持同步（相同的键，相同的结构）。当你向 `zh.json` 添加键时，在同一次编辑中将其添加到 `en.json`。

### 5. 后端（仅在需要时）

如果 `mode: 'client'`，跳过此部分。

对于 `mode: 'server'` 或 `'hybrid'`：

- 新端点位于 `apps/api-gateway/src/` 下，并通过 `apps/api-gateway/src/create-app.js` 中的 `createApiGatewayApp` 注册。
- 领域逻辑属于 `services/<domain>-service/` 下的服务模块（查看 `services/security-service/` 以获取形态）。不要将领域逻辑内联到路由处理程序中。
- 对于一次性遗留端口，`services/legacy-tools-service/` 是桥梁 — 但新工作应针对真正的服务模块。
- 前端通过 `fetch('/api/...')` 调用后端。当你运行 `pnpm dev:full` 时，开发服务器将 `/api/*` 代理到 `api-gateway`。

### 6. 路由和导航

Manifest 工具通过 Vite manifest 管道（`apps/web/src/tooling/tool-manifests.ts`）自动发现，并通过 `ManifestToolRoute` 路由。**你不需要为新的 manifest 工具手动编辑任何路由文件。**

静态 `apps/web/src/config/a-*.ts` 文件用于尚未迁移的遗留工具。不要为 manifest 工具在那里添加新条目 — `apps/web/src/config/tools.ts` 会自动合并 manifest 工具（参见 `_manifestTools`）。

### 7. 验证

在声明工具完成之前，运行所有这些：

```bash
pnpm install                  # 如果 package.json 更改
pnpm check:consistency        # 路由/导航/manifest/roadmap 一致性
pnpm lint                     # web lint
pnpm -C apps/web build        # 完整的 web 构建（捕获动态导入警告）
pnpm test                     # vitest 套件
```

如果改了任何 `package.json`（新依赖、新 workspace 包），`git status` 里的 `pnpm-lock.yaml` 改动必须和代码一起提交——不要跳过，见下面「常见陷阱」。

如果 `pnpm dev` 是你第一次运行工具，确认：

- 工具出现在侧边栏的相关类别中
- 标题和描述在 `zh` 和 `en` 中都能渲染（使用语言切换器）
- `i18n` 键没有作为原始 `tool<Pascal>:something` 字符串泄漏
- 路由加载时没有控制台错误
- 用右上角主题切换器切到暗色主题看一遍，确认没有黑字/白底之类看不清的地方（这一步经常被跳过，之前就是因为没人做这一步，全站攒了 89 个文件的暗色适配债）

## 常见陷阱

- **命名空间不匹配**：`useTranslation('toolFoo')` 但 `manifest.namespace: 'toolFooBar'` → 所有文案都渲染为原始键。修复命名空间，而不是 locale 文件。
- **为 manifest 工具编辑静态配置**：当工具已经通过 manifest 发现时，将工具添加到 `a-utility-tools.ts` → 导航中出现重复条目。manifest 是单一来源。
- **将文案推送到 shell locales**：为新工具将 `tools.fooBar` 添加到 `apps/web/src/locales/zh.json` → 违反 i18n 边界。工具文案保留在工具包中。
- **在工具中直接导入第三方 UI 库**：例如 `import { Modal } from 'antd'`。首先在 `packages/ui-kit/` 中包装它。
- **在 `create:tool` 后忘记 `pnpm install`**：新的工作区包需要链接，然后 TS 才能解析导入。
- **错误的 `categoryKey`**：写一个 `CATEGORIES` 里没有的 id，工具不会出现在侧边栏任何类别中。使用上面记录的值之一；`pnpm check:consistency` 现在会对此报错，构建前就能发现。
- **写了只在浅色模式下能看清的类名**（`text-gray-900`、`bg-white`、`border-gray-300` 却没有暗色对应）：卡片背景等全局样式会自动跟着 `.dark` class 变暗，但类名里硬编码的文字/背景/边框颜色不会。用语义色 token（见「五个不变量」第 5 条），token 覆盖不到的强调色手动加 `dark:` 变体。
- **把两态按钮的 idle/hover 颜色都换成同一个语义色 token**：`bg-gray-100 hover:bg-gray-200` 这种两级底色按钮，如果不假思索地全换成 `bg-surface-inset`，hover 反馈会消失（两个状态变成同一个颜色）。要保留区分度：`bg-surface-inset hover:bg-gray-200 dark:hover:bg-gray-600`。
- **给 `hover:`/`focus:` 类名加 `dark:` 时忘记带上同样的前缀**：`hover:bg-indigo-50` 需要写成 `dark:hover:bg-indigo-900/30`，不是裸的 `dark:bg-indigo-900/30`（那样暗色样式会无条件生效，而不是只在 hover 时生效）。
- **忘记提交 `pnpm-lock.yaml`**：新增 workspace 包或依赖后跑了 `pnpm install`，提交代码时却没把 lockfile 一起提交。CI 部署用 `pnpm install --frozen-lockfile`，lockfile 跟 package.json 对不上号会直接部署失败（这里吃过亏：连续 10 次部署失败才发现）。看到 `pnpm-lock.yaml` 有改动，先 `git diff pnpm-lock.yaml` 看一眼——出现新的/变化的 `importers:` 条目就是真实更新，不要当成无关噪音跳过不提交。

## 仓库中的参考点

- 脚手架源：`scripts/create-tool.cjs`
- 暗色主题语义色 token：`apps/web/src/index.css`（CSS 变量定义 + `.dark` 覆盖）+ `apps/web/tailwind.config.js`（映射成 `bg-surface`/`text-ink`/`border-edge` 等 Tailwind 类）
- 暗色主题完整适配的参考工具：`tools/tool-dns-config/`、`tools/tool-doh-config/`、`tools/tool-calendar/`、`tools/tool-pdf/`
- Manifest 类型：`packages/tool-registry/src/index.ts`
- Manifest 发现：`apps/web/src/tooling/tool-manifests.ts` + `virtual:toolbox-manifests`（Vite 插件）
- 路由加载器：`apps/web/src/tooling/ManifestToolRoute.tsx`
- 工具合并：`apps/web/src/config/tools.ts`
- 类别配置（遗留 + 参考）：`apps/web/src/config/a-*.ts`
- 标准文档：`docs/TOOL_LANDING.md`
- 开发工作流文档：`docs/refactor-structure.md`
- E2E 示例：`tests/zipcode.spec.ts`（截图式冒烟测试的模式）
- 后端示例：`apps/api-gateway/src/`、`services/security-service/`
- 最近的参考工具：`tools/tool-data-onchain/`（表单 + ethers 集成）、`tools/tool-blockchain-transfer/`（选项卡 + 多链）
