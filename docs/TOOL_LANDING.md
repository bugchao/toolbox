# 工具规划落地目录与 Monorepo 规范

本文档约定：**工具在仓库中的落位方式、独立开发/独立部署、以及 dev 流程**。与 [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md) 配合使用：规划立项 → 按本规范落地 → 上线后更新 ROADMAP。

---

## 一、Monorepo 与落地目录

### 1.1 仓库结构（pnpm workspace）

```
toolbox/
├── apps/
│   └── web/                 # 主应用：唯一入口，路由、Layout、i18n、主题
├── packages/
│   ├── core/                # 工具类型、Loader 等
│   └── ui-kit/               # 通用 UI（Button/Card/Input/PageHero 等）
├── tools/                   # 独立工具包（规划落地首选）
│   ├── tool-resume/
│   ├── tool-pdf/
│   ├── tool-qrcode/
│   ├── tool-ppt-generator/
│   ├── tool-dns-global-check/
│   ├── tool-dnssec-check/
│   ├── tool-dns-performance/
│   ├── tool-dns-ttl/
│   └── tool-<name>/          # 新工具：与 TOOLS_ROADMAP 建议路径对应
├── docs/
├── package.json             # 根脚本：dev / build / start
└── pnpm-workspace.yaml      # apps/*, packages/*, tools/*
```

### 1.2 工具落地的两种方式

| 方式 | 落位目录 | 适用场景 | 独立开发 | 独立部署 |
|------|----------|----------|----------|----------|
| **独立工具包** | `tools/tool-<name>/` | 有专属依赖、需独立迭代、或规划中明确为「独立包」 | ✅ 可单独改该包，主应用集成调试 | ✅ 可单独 build 该包参与部署 |
| **内嵌页面** | `apps/web/src/pages/<Page>.tsx` | 极简、无额外依赖、不需独立部署 | 随主应用一起 | 随主应用一起 |

**约定**：在 [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md) 立项时，**优先选择「独立工具包」**；仅当工具极简且确定不独立部署时，才落位到 `apps/web/src/pages/`。

### 1.3 命名与路径对应

- **包名**：`@toolbox/tool-<name>`，目录 `tools/tool-<name>/`。  
  `<name>` 建议与 ROADMAP「建议路径」一致并去掉前导斜杠、斜杠改横线，例如：
  - 建议路径 `/dns-query` → 包名 `@toolbox/tool-dns-query`，目录 `tools/tool-dns-query/`
  - 建议路径 `/cidr-calculator` → 包名 `@toolbox/tool-cidr-calculator`，目录 `tools/tool-cidr-calculator/`
- **路由**：与 TOOLS_ROADMAP 中「建议路径」一致，在主应用 `App.tsx` 中注册。

---

## 二、独立工具包标准结构

每个 `tools/tool-<name>/` 保持统一结构，便于独立开发与后续独立部署：

```
tools/tool-<name>/
├── package.json       # name: @toolbox/tool-<name>, main/types 指向 src
├── src/
│   ├── index.tsx      # 导出：export { default } from './Xxx' 或具名导出
│   └── Xxx.tsx        # 主组件（可引用 @toolbox/ui-kit、react-i18next）
└── tsconfig.json      # 可选，与 packages/core 或 root 对齐
```

### 2.1 package.json 要点

- **main / types**：指向 `src/index.tsx`（或构建后的 dist，若后续做独立 build）。
- **dependencies**：该工具专属依赖（如 dns 库、pdf-lib 等）；`@toolbox/ui-kit`、`react`、`react-dom`、`lucide-react` 等。
- **peerDependencies**：`react`、`react-dom`；若用 i18n 则 `react-i18next`。
- **devDependencies**：`typescript`、`@types/react`、`@types/react-dom`；需要时加 `react-i18next` 便于类型。

### 2.2 主应用集成（必做）

1. **依赖**：在 `apps/web/package.json` 的 `dependencies` 增加 `"@toolbox/tool-<name>": "workspace:*"`。
2. **路由**：在 `apps/web/src/App.tsx` 中懒加载并挂载到对应 path。
3. **Vite**：在 `apps/web/vite.config.ts` 的 `optimizeDeps.exclude` 中增加 `'@toolbox/tool-<name>'`。
4. **Tailwind**：主应用 `tailwind.config.js` 的 `content` 已包含 `../../tools/*/src/**/*.{js,ts,jsx,tsx}`，工具内 Tailwind 类会参与主应用构建。
5. **导航与首页**：在 `apps/web/src/config/tools.ts`、`Layout`、`Home` 中登记（与现有工具一致）。

---

## 三、开发流程：整体调试 + 独立开发

### 3.1 整体调试（日常推荐）

在**仓库根**执行：

```bash
pnpm install   # 首次或依赖变更后
pnpm dev       # 启动主应用（默认 3000），所有 tools 通过 workspace 被引用
```

- 修改 **任意** `apps/web` 或 `tools/*` 下代码，主应用热更新。
- 所有已注册工具在同一站点下可测，**整体联调、导航、主题、i18n 一次搞定**。

### 3.2 独立开发（只改一个工具）

- **方式一**：仍用 `pnpm dev`，只编辑目标 `tools/tool-xxx` 下的文件，其他不动；HMR 只重载该包，**足够灵活、简单**。
- **方式二（可选）**：为单个工具起独立预览页（例如仅渲染该工具 + 最小 Layout），后续可加脚本 `pnpm dev:tool <name>`，由各团队按需启用。

当前以**方式一**为主，满足「独立开发、整体可调、dev 灵活简单」。

### 3.3 新增一个工具的步骤（从规划到跑通）

1. **立项**：在 [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md)「当前待办」中已有该工具（名称、建议路径、分类等）。
2. **创建包**：在 `tools/` 下新建 `tool-<name>`，使用标准结构；可用根目录脚本 `pnpm create:tool <name>` 生成脚手架（见下节）。
3. **实现**：在 `src/` 下写主组件，按需使用 `@toolbox/ui-kit`（如 PageHero）、`react-i18next`（与主应用共用 namespace）。
4. **集成**：按「2.2 主应用集成」完成依赖、路由、Vite、导航与首页。
5. **验证**：根目录 `pnpm dev`，访问对应 path，确认功能与主题/i18n 正常。
6. **上线后**：按 [ROADMAP_CONVENTION.md](ROADMAP_CONVENTION.md) 更新 TOOLS_ROADMAP（移至已开发）、TOOLS_LIST、Layout/Home/App。

---

## 四、独立部署（可选扩展）

### 4.1 当前：单 SPA 整体部署

- 执行 `pnpm build` 产出 `apps/web/dist`，由 `server.js` 或现有部署方式提供静态资源与 API。
- 所有工具包被主应用打包进同一 SPA，**一次构建、一次部署**。

### 4.2 可选：按工具独立构建与部署

若后续需要「只部署某几个工具」或「按工具做 CDN 子路径/子域」：

- 可为每个 `tools/tool-xxx` 增加 **Vite library 构建**（如 `build:lib`），产出独立 bundle（umd/es）。
- 主应用通过动态 import 或配置表按 path 加载对应 chunk；或独立部署为微前端子应用。
- 具体构建配置与部署流程在确定方案后再写入本文档或单独 `docs/DEPLOY.md`。

当前**不要求**每个工具都支持独立部署；先保证「独立开发 + 整体调试 + 单 SPA 部署」即可。

---

## 五、快速创建新工具（脚手架）

在仓库根执行：

```bash
pnpm create:tool <name>
```

- `<name>`：与建议路径对应，如 `dns-query`、`cidr-calculator`（不要带 `tool-` 前缀，脚本会自动加）。
- 脚本会生成 `tools/tool-<name>/` 下的 `package.json`、`src/index.tsx`、`src/<Name>.tsx` 占位，并可选写入 `tsconfig.json`。
- 生成后需**手动**：在 `apps/web` 中加依赖与路由、config、导航与首页（见 2.2、3.3）。

详见根目录 `package.json` 中 `create:tool` 脚本及 `scripts/create-tool.cjs`。

---

## 六、与 TOOLS_ROADMAP 的对应关系

| ROADMAP 状态 | 落位 | 操作 |
|--------------|------|------|
| 当前待办（待开发） | 未落地 | 开发时按「1.2」选独立包或内嵌页，按「二、三」落地 |
| 开发中 | `tools/tool-xxx` 或 `apps/web/src/pages/` | 按「3.3」集成并调试 |
| 已开发 | 同上 | 在 ROADMAP「二、已开发」中写明路由与代码位置 |

**唯一来源**：已开发/待开发清单以 [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md) 为准；落地目录与 dev/deploy 约定以本文档为准。

---

## 七、相关文档

| 文档 | 用途 |
|------|------|
| [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md) | 已开发/待开发清单、分类、建议路径 |
| [UI_KIT_USAGE_BY_TOOL.md](UI_KIT_USAGE_BY_TOOL.md) | **工具 × ui-kit 能力对照**：Motion/Spring/粒子/图表用前先封装再引用 |
| [ROADMAP_CONVENTION.md](ROADMAP_CONVENTION.md) | 立项方式、分类、上线后更新 |
| [refactor-structure.md](refactor-structure.md) | 开发与扩展说明（含添加新工具步骤） |
