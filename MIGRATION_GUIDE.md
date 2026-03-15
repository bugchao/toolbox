# 工具盒子 Monorepo 迁移指南

## 🎯 迁移目标

从「全部工具内嵌在单应用」逐步迁移到 **Monorepo + 独立工具包 + 内嵌页** 混合架构：有专属依赖或需独立迭代的工具落位到 `tools/tool-<name>/`，极简工具可保留在 `apps/web/src/pages/`，支撑规模化与按需加载。

**权威依据**：[TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md)（已开发/待开发清单）、[TOOL_LANDING.md](docs/TOOL_LANDING.md)（落位与开发流程）。

---

## 📁 当前仓库结构

```
toolbox/
├── apps/
│   └── web/                    # 主应用：路由、Layout、i18n、主题、工具注册
├── packages/
│   └── ui-kit/                 # 通用 UI（PageHero、Card、Button、Input、背景等）
├── tools/                      # 独立工具包（已迁移或待迁移目标）
│   ├── tool-qrcode/            # 二维码生成/解析/美化
│   ├── tool-pdf/               # PDF 工具集
│   ├── tool-resume/            # 简历生成器
│   └── tool-<name>/            # 新工具：name 与建议路径对应（见下）
├── scripts/
│   └── create-tool.cjs         # 脚手架：pnpm create:tool <name>
├── docs/
├── package.json                # 根脚本：dev / build / create:tool
└── pnpm-workspace.yaml         # apps/*, packages/*, tools/*
```

**命名约定**：建议路径 `/dns-query` → 包名 `@toolbox/tool-dns-query`，目录 `tools/tool-dns-query/`。路径中斜杠改为横线、去掉前导斜杠即为 `<name>`。

---

## ✅ 已完成迁移（独立工具包）

以下工具已落位到 `tools/`，主应用通过 workspace 依赖 + 懒加载集成：

| 工具 | 路由 | 包名 | 目录 |
|------|------|------|------|
| 二维码生成/解析/美化 | `/qrcode/generate`、`/read`、`/beautifier` | `@toolbox/tool-qrcode` | `tools/tool-qrcode/` |
| PDF 工具集 | `/pdf-tools` | `@toolbox/tool-pdf` | `tools/tool-pdf/` |
| 简历生成器 | `/resume-generator` | `@toolbox/tool-resume` | `tools/tool-resume/` |

其余已上线工具目前均在 `apps/web/src/pages/`（内嵌页），见「待迁移列表」。

---

## 🚀 工具迁移步骤（按标准实现）

### 1. 创建工具包

```bash
pnpm create:tool <name>
```

- `<name>`：小写字母、数字、横线，与建议路径对应。例如 `dns-query`、`short-link`、`json-formatter`。
- 脚本会生成 `tools/tool-<name>/`、`package.json`、`src/index.tsx`、`src/<PascalName>.tsx` 等。

### 2. 迁移代码与国际化

- 将 `apps/web/src/pages/<Page>.tsx` 的逻辑迁移到 `tools/tool-<name>/src/`。
- 替换导入：使用 `@toolbox/ui-kit` 的 `PageHero`、`Card`、`Input` 等；主题随主应用全局控制（CSS 变量 / ThemeProvider）。
- **工具自带国际化（推荐）**：每个工具完全独立包含自己的文案，便于独立部署与全局语言切换统一控制。
  - 在工具包内新增 `src/locales/zh.json`、`src/locales/en.json`，包含该工具所有 UI 文案（至少 `title`、`description`，以及按钮、标签、占位符、错误信息等）。
  - 约定一个固定 namespace，如 `toolJson`（与工具名对应，驼峰）。组件内使用 `useTranslation('toolJson')`，不再依赖 `nav` / `home`。
  - 在组件中导出常量 `I18N_NAMESPACE = 'toolJson'`，主应用用其注册与配置。
- 导出方式：在 `src/index.tsx` 中 `export { Xxx } from './Xxx'`，与主应用懒加载约定一致。

### 3. 主应用集成（必做）

1. **依赖**：在 `apps/web/package.json` 的 `dependencies` 中增加 `"@toolbox/tool-<name>": "workspace:*"`。
2. **路由**：在 `apps/web/src/App.tsx` 中懒加载并挂载到对应 path。
3. **Vite**：在 `apps/web/vite.config.ts` 的 `optimizeDeps.exclude` 中增加 `'@toolbox/tool-<name>'`。
4. **导航与首页**：在 `apps/web/src/config/tools.ts` 中登记 path、nameKey、icon、categoryKey、keywords；若工具自带 i18n，增加 **`i18nNamespace: 'toolXxx'`**（与工具内 namespace 一致）。主应用通过 `getToolTitle` / `getToolDescription` 自动用该 namespace 的 `title`、`description` 展示在导航与首页，无需再写 `nav.tools.*`。
5. **注册工具文案**：在 `apps/web/src/i18n.ts` 中引入该工具的 zh/en 文案并合并进 `resources`，例如：
   ```ts
   import toolJsonZh from '@toolbox/tool-json/src/locales/zh.json'
   import toolJsonEn from '@toolbox/tool-json/src/locales/en.json'
   // 在 resources.zh / resources.en 中增加 toolJson: toolJsonZh / toolJsonEn
   ```
   语言切换由主应用统一控制，工具只消费当前语言。

### 4. 更新规划文档

- 在 [TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 的「二、已开发工具」对应分类表中，将「代码位置」改为 `tools/tool-<name>` → 导出组件名。
- 若该工具曾在「三、当前待办」中，删除该行（已上线）。

---

## 📋 待迁移工具列表

以下工具当前在 `apps/web/src/pages/`，可按优先级逐步迁到 `tools/tool-<name>/`。路径与 `tool-<name>` 对应关系见 [TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 与 [TOOL_LANDING.md](docs/TOOL_LANDING.md)。

### 实用工具（内嵌页 → 可迁为独立包）

- [ ] **tool-image-compressor** - 图片压缩（`/image-compressor`）
- [ ] **tool-image-background-remover** - 图片去背景（`/image-background-remover`）
- [ ] **tool-markdown** - Markdown 转换（`/markdown`）
- [ ] **tool-bmi** - BMI 计算器（`/bmi`）
- [ ] **tool-unit-converter** - 单位换算（`/unit-converter`）
- [ ] **tool-short-link** - 短链接生成（`/short-link`）
- [ ] **tool-color-generator** - AI 配色（`/color-generator`）
- [ ] **tool-meme-generator** - 表情包生成（`/meme-generator`）
- [ ] **tool-copywriting-generator** - AI 文案（`/copywriting-generator`）
- [ ] **tool-wooden-fish** - 电子木鱼（`/wooden-fish`）
- [ ] **tool-life-progress** - 人生进度条（`/life-progress`）

### 研发工具

- [ ] **tool-json** - JSON 格式化（`/json`）
- [ ] **tool-base64** - Base64 编解码（`/base64`）
- [ ] **tool-timestamp** - 时间戳转换（`/timestamp`）
- [ ] **tool-url** - URL 编解码（`/url`）
- [ ] **tool-regex** - 正则测试（`/regex`）
- [ ] **tool-cron** - Cron 生成（`/cron`）
- [ ] **tool-password** - 密码生成（`/password`）
- [ ] **tool-hash** - 哈希计算（`/hash`）
- [ ] **tool-code** - 代码美化（`/code`）
- [ ] **tool-uuid** - UUID 生成（`/uuid`）
- [ ] **tool-text-comparator** - 文本对比（`/text-comparator`）

### 查询工具

- [ ] **tool-zipcode** - 邮编查询（`/zipcode`）
- [ ] **tool-weather** - 天气查询（`/weather`）
- [ ] **tool-ip-query** - IP 查询（`/ip-query`）
- [ ] **tool-color-picker** - 颜色拾取（`/color-picker`）

### 网络工具

- [ ] **tool-dns-query** - DNS 查询（`/dns-query`）

### 资讯工具

- [ ] **tool-news** - 每日热点（`/news`）

迁移时：`pnpm create:tool <name>` 中的 `<name>` 取上表 `tool-` 后缀部分，例如 `dns-query`、`short-link`、`json-formatter`（若路径为 `/json` 可保持 `json` 或与团队约定）。

---

## 🔧 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖（含 workspace） |
| `pnpm dev` | 启动主应用 `apps/web`（默认端口 3000），所有工具通过 workspace 引用，支持 HMR |
| `pnpm build` | 构建主应用（会拉入 tools 源码） |
| `pnpm create:tool <name>` | 新建工具包 `tools/tool-<name>/` |

日常开发：在根目录 `pnpm dev`，修改任意 `apps/web` 或 `tools/*` 下代码即可联调；无需单独「迁移完成」才能跑，迁移的是代码落位与包边界。

---

## 📅 迁移原则

1. **以 TOOLS_ROADMAP 为准**：已开发/待开发清单以 [TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 为准；上线后更新「二、已开发」与代码位置。
2. **优先独立工具包**：有专属依赖、需独立迭代或规划中明确为独立包时，落位到 `tools/tool-<name>/`；极简且不独立部署的可保留在 `apps/web/src/pages/`。
3. **命名与路径一致**：包名 `@toolbox/tool-<name>`，路径与 ROADMAP 建议路径一致，便于导航与文档统一。

---

## ❓ 常见问题

**Q: 如何添加全新工具（未在待迁移列表）？**  
A: 先在 [TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md)「三、当前待办」立项（名称、分类、建议路径）；再用 `pnpm create:tool <name>` 创建，按「迁移步骤」集成到主应用并更新 ROADMAP。

**Q: 工具之间如何通信？**  
A: 尽量通过 URL/路由或主应用提供的上下文；避免工具包之间直接依赖。若有通用逻辑，可抽到 `packages/utils` 或 `packages/core`。

**Q: 工具自带重依赖（如 pdf-lib、dns 库）怎么办？**  
A: 在对应 `tools/tool-<name>/package.json` 的 `dependencies` 中声明，主应用懒加载该包时不会打进首屏；Vite 的 `optimizeDeps.exclude` 已排除这些工具包。

**Q: 迁移后旧页面文件要删吗？**  
A: 迁移完成并确认主应用路由、导航、i18n 均指向新包后，可删除 `apps/web/src/pages/<旧页面>.tsx`，避免重复。
