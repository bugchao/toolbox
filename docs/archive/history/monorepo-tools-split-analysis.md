# Monorepo 工具拆分分析

## 一、当前状态

### 1. 已有拆分

| 位置 | 职责 | 依赖 |
|------|------|------|
| **根目录** | 主应用 (Vite + 所有页面 + 路由) | **全部 30+ 依赖** 堆在根 `package.json` |
| `packages/core` | 工具类型定义 + `ToolLoader`（按 manifest 动态加载） | 仅 react |
| `packages/ui-kit` | 通用 UI 组件 | react, lucide-react, tailwind |

### 2. 问题概览

- **依赖归属不清**：根 `package.json` 同时包含：
  - 应用壳依赖：react、react-router-dom、vite、tailwind
  - 工具专属依赖：jspdf、html2canvas、pdf-lib、jszip、qrcode、jsqr、remark/rehype 全家桶、katex、highlight.js、nanoid 等  
  → 任意一个工具用到的库都会装进主应用，主应用无法“按工具”独立演进。

- **工具与主应用强耦合**：33 个页面在 `src/pages/` 被主应用**静态 import**，路由在 `App.tsx` 手写，没有“配置 + 加载”的扩展点。

- **与 core 设计不一致**：`packages/core` 已提供 `ToolLoader` + `ToolManifest`（按 entry 动态加载），但主应用并未使用，仍是全量静态打包。

- **workspace 未用满**：`pnpm-workspace.yaml` 已声明 `apps/*`、`packages/*`、`tools/*`，目前只有 `packages/*` 在用，没有 `apps/`、`tools/`。

---

## 二、目标形态（是否合理的判断）

目标可以概括为三句话：

1. **工具依赖独立**：每个工具（或工具组）在自己的 package 里声明依赖，不放到根或主应用。
2. **工具可独立开发**：单个工具可在自己的仓库/目录里开发、测试、构建，不依赖“整站跑起来”。
3. **主应用通过配置/加载注入**：主应用只做壳（路由、布局、权限等），通过**配置 + 加载**挂载工具，而不是静态 import 每个页面。

按这个目标，当前“所有东西在根、全量静态 import”的拆法**不合理**；已有的 `packages/core` 设计（ToolLoader + manifest）是**合理**的方向，但尚未落地到主应用和包结构上。

---

## 三、推荐结构

### 1. 目录与职责

```
toolbox/
├── apps/
│   └── web/                    # 主站：壳 + 路由 + 配置驱动加载
│       ├── package.json        # 仅壳依赖：react, react-router, vite, @toolbox/core, @toolbox/ui-kit
│       └── src/
│           ├── App.tsx         # 从配置/registry 生成路由，用 ToolLoader 或 lazy 加载
│           └── tool-registry.ts
├── packages/
│   ├── core/                   # 已有：类型 + ToolLoader
│   └── ui-kit/                 # 已有：通用组件
└── tools/                      # 每个工具（或工具组）一个 package
    ├── tool-qrcode/            # 二维码生成/解析/美化的专属依赖：qrcode, jsqr
    ├── tool-pdf/               # PDF 相关：pdf-lib, jspdf, html2canvas, jszip
    ├── tool-resume/            # 简历：jspdf, html2canvas
    ├── tool-markdown/          # Markdown：remark, rehype, katex, highlight
    ├── tool-color-generator/   # 配色：无额外依赖或仅 chroma
    ├── tool-short-link/        # 短链：无或 nanoid
    ├── tool-json-formatter/    # 仅 prettier 等
    ├── tool-*...
    └── tool-common/            # 可选：多个轻量工具共用的包（如 Base64/Timestamp/UrlEncoder）
```

原则：

- **根目录不再作为“主应用”**，只保留 workspace 配置、脚本、文档等。
- **主应用**搬到 `apps/web`，依赖只包含：运行时框架 + `@toolbox/core` + `@toolbox/ui-kit`，**不**直接依赖任何 `tools/*` 的库（如 jspdf、remark）。
- **每个 tool-xxx** 在自己的 `package.json` 里声明自己需要的依赖；主应用只依赖 `@toolbox/tool-xxx` 的**构建产物**（或通过 manifest 的 entry 加载），不把工具的依赖提升到根或 apps/web。

这样“没给工具的依赖”就不会出现在总 package.json，而是各自独立。

---

## 四、两种注入方式（与 core 的衔接）

`packages/core` 的 `ToolLoader` 是按 **manifest + entry** 动态加载的，主应用可以有两种用法（可二选一或混合）。

### 方案 A：构建时注册（推荐先做）

- 主应用构建时已知要集成的工具列表（例如通过 `apps/web` 的 `tool-registry.ts` 或配置文件）。
- 每个 `tools/tool-xxx` 构建成**可被主应用 import 的包**（如 `dist/index.js`），主应用用 **React.lazy + import()** 按路由加载对应工具包，例如：
  - `route /resume-generator` → `React.lazy(() => import('@toolbox/tool-resume'))`
- 依赖关系：`apps/web` 的 `package.json` 里写 `"@toolbox/tool-resume": "workspace:*"` 等；但 **jspdf、html2canvas 只出现在 `tools/tool-resume` 的 package.json**，不会进主应用依赖树。
- 效果：每个工具具备独立开发、独立依赖、独立构建；主应用通过“配置 + lazy”注入，不手写 30 个静态 import。

### 方案 B：运行时按 manifest 加载（与现有 ToolLoader 一致）

- 每个工具构建成**独立 chunk**（如 CDN 上的 `tool-resume.js`），并提供一个 **manifest.json**（entry、schemaVersion、tool 元信息）。
- 主应用只带 `@toolbox/core`，通过 `ToolLoader.loadTool(manifestUrl)` 拉取 manifest，再 `import(manifest.entry)` 加载脚本，把组件挂到当前路由的容器里。
- 效果：主应用完全不依赖工具的实现和依赖，工具可独立部署、独立版本；适合“第三方/可插拔工具”场景。

当前更贴近“统一站点、统一构建”的是 **方案 A**；若后续要做可插拔、远程加载，再在方案 A 的基础上加方案 B 的 manifest 与 ToolLoader。

---

## 五、依赖归属建议（示例）

| 依赖 | 建议归属 | 说明 |
|------|----------|------|
| react, react-dom, react-router-dom | apps/web | 壳 |
| vite, tailwind, typescript, eslint | apps/web (dev) | 构建与规范 |
| lucide-react | packages/ui-kit 或 apps/web | 通用图标 |
| @toolbox/core, @toolbox/ui-kit | apps/web | 壳依赖 |
| jspdf, html2canvas | tools/tool-resume（或 tool-pdf） | 仅简历/PDF 导出 |
| pdf-lib, jszip | tools/tool-pdf | 仅 PDF 工具 |
| qrcode, jsqr | tools/tool-qrcode | 仅二维码 |
| remark, rehype-*, katex, highlight.js | tools/tool-markdown | 仅 Markdown |
| nanoid | tools/tool-short-link（若仍用） | 仅短链 |
| diff, prettier | tools/tool-json-formatter / tool-text-comparator 等 | 按使用处归属 |
| 其他（crypto-js, uuid, express, wrangler…） | 按实际使用页面归到对应 tools/* 或 apps/web | 避免堆在根 |

这样“没给工具的依赖”就不会出现在总的 package.json，每个工具具备独立依赖、可独立开发，主应用通过配置或加载注入工具。

---

## 六、落地步骤建议

1. **不动现有页面，先收口依赖**  
   - 在根或 `apps/web` 用一张表（如本 doc 的表格）标出每个依赖被哪些页面使用。  
   - 为后续 `tools/*` 的划分和迁移做准备。

2. **确立主应用壳**  
   - 将“主应用”迁到 `apps/web`（或保留根但明确为 app），从根 `package.json` 中**移除**仅被某几个页面使用的依赖，改为占位或注释，确保主应用能 build（例如被移走的页面先 lazy import 一个占位页）。

3. **按工具建 package**  
   - 从依赖最重、最独立的开始（如 tool-resume、tool-pdf、tool-markdown、tool-qrcode），在 `tools/` 下新建 `tool-xxx`，把对应页面（及仅它用的依赖）迁入该 package，导出单一入口组件。

4. **主应用改为配置 + 加载**  
   - 在 apps/web 维护 `tool-registry.ts`（或 JSON）：path → 工具包名或 entry。  
   - 用 `React.lazy(() => import('@toolbox/tool-xxx'))` 或 `ToolLoader.loadTool(manifestUrl)` 生成路由，替换当前 30+ 个静态 import。

5. **根 package.json 瘦身**  
   - 根只保留 workspace 脚本、lint、test 等；所有运行时依赖只存在于 `apps/web` 与各 `tools/*`。

这样拆分后：**工具依赖独立、工具可独立开发、主应用通过配置/加载注入**，与“没给工具的依赖不应该都放到总的 package.json”的目标一致，结构是合理的。
