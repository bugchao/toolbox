# 开发与扩展说明（重构后）

本文档是**后续开发时直接可用的操作指南**：如何跑起来、目录含义、如何加新工具/新工具包、常见命令与问题。

---

## 一、快速开始（克隆后直接开发）

```bash
# 1. 安装依赖（必须用 pnpm，在仓库根执行）
pnpm install

# 2. 启动开发
pnpm dev
```

浏览器打开 **http://localhost:3000**。修改 `apps/web` 或任意 `tools/*` 下的代码会热更新。

---

## 二、目录结构

```
toolbox/                        # 仓库根（所有命令默认在根执行）
├── apps/web/                   # 主应用 = 开发/构建入口
│   ├── src/
│   │   ├── main.tsx            # 入口
│   │   ├── App.tsx             # 路由 + 懒加载工具包
│   │   ├── pages/              # 未拆出去的页面（如 Home、JsonFormatter）
│   │   ├── components/         # Layout、公共组件
│   │   ├── i18n.ts             # 国际化配置（架构层）
│   │   ├── locales/            # zh.json、en.json（common / nav / footer 等 namespace）
│   │   ├── contexts/           # ThemeContext（主题切换）
│   │   ├── index.css
│   │   └── types/              # 全局类型、模块声明
│   ├── public/                 # 静态资源、news.json 等
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json            # 主应用依赖（不含工具专属库）
│
├── packages/
│   ├── core/                   # 工具类型、ToolLoader（按 manifest 动态加载）
│   └── ui-kit/                 # 通用 UI 组件
│
├── tools/                      # 独立工具包（各自依赖独立）
│   ├── tool-resume/            # 简历生成器 → jspdf, html2canvas
│   │   ├── src/
│   │   │   ├── index.tsx       # 导出组件
│   │   │   └── ResumeGenerator.tsx
│   │   └── package.json
│   ├── tool-pdf/               # PDF 工具集 → pdf-lib, jszip
│   └── tool-qrcode/            # 二维码生成/解析/美化 → qrcode, jsqr
│
├── package.json                # 根：仅脚本 + express(server) + playwright
├── server.js                   # 生产环境：静态 + API
├── crawler/                    # 新闻爬虫等
└── docs/                       # 本文档等
```

- **开发/构建入口**：都在根通过 `pnpm dev` / `pnpm build` 转调 `apps/web`，不要单独在 `apps/web` 下长期开发（除非只改主应用且确认不需要工具包）。
- **工具专属依赖**：只写在对应 `tools/tool-xxx/package.json`，主应用不直接依赖 jspdf、qrcode 等。
- **公共组件与主题**：`packages/ui-kit` 提供 Button、Card、Input 等，**统一浅色/暗色主题**（组件内用 Tailwind `dark:`，应用层通过 `html.dark` 切换）。新页面优先使用 `@toolbox/ui-kit`；主应用 `tailwind.config.js` 的 `content` 需包含 `../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}`。

---

## 三、常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装全 workspace 依赖（根执行） |
| `pnpm dev` | 启动开发（端口 3000） |
| `pnpm build` | 构建主应用，产出在 `apps/web/dist` |
| `pnpm preview` | 本地预览构建结果 |
| `pnpm start` | 生产运行（需先 build；用 `server.js` 提供静态与 API） |
| `pnpm crawl:news` | 爬取新闻到 `apps/web/public/news.json` |
| `pnpm test:e2e` | Playwright E2E（会先执行 `pnpm dev`） |
| `pnpm test:e2e:ui` | E2E UI 模式 |
| `pnpm -C apps/web build` | 仅构建主应用（与 `pnpm build` 等价） |

---

## 四、添加新工具（两种方式）

### 方式 A：在主应用内新增页面（无重依赖、快速上线）

适用于：无额外 npm 依赖或仅用主应用已有依赖的小工具。

1. **新建页面**  
   在 `apps/web/src/pages/` 下新建组件，例如 `MyTool.tsx`。

2. **注册路由**  
   在 `apps/web/src/App.tsx` 中：
   - 顶部增加：`import MyTool from './pages/MyTool'`
   - `<Routes>` 内增加：`<Route path="/my-tool" element={<MyTool />} />`

3. **导航与首页**  
   - 在 `apps/web/src/components/Layout.tsx` 的 `navigation` 中增加一项（name、href、icon、category）。
   - 在 `apps/web/src/pages/Home.tsx` 中增加对应工具卡片（标题、描述、链接）。

4. **清单**  
   在 `TOOLS_LIST.md` 中补充工具名称、路径、描述。

### 方式 B：新增独立工具包（有专属依赖、可独立开发）

适用于：需要单独依赖（如某个 npm 库只给这个工具用）、希望工具可独立迭代的场景。**落地规范详见 [TOOL_LANDING.md](TOOL_LANDING.md)**。

1. **创建包（推荐用脚手架）**
   ```bash
   pnpm create:tool <name>   # 如 dns-query → tools/tool-dns-query/
   ```
   或手动创建目录：
   ```bash
   mkdir -p tools/tool-xxx/src
   ```

2. **`tools/tool-xxx/package.json`**（示例）
   ```json
   {
     "name": "@toolbox/tool-xxx",
     "version": "1.0.0",
     "type": "module",
     "main": "src/index.tsx",
     "types": "src/index.tsx",
     "dependencies": {
       "react": "^18.3.1",
       "react-dom": "^18.3.1",
       "lucide-react": "^0.577.0",
       "你的专属依赖": "^x.x.x"
     },
     "peerDependencies": {
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     }
   }
   ```

3. **实现并导出组件**  
   - 在 `tools/tool-xxx/src/` 下写页面组件（如 `XxxTool.tsx`）。  
   - 在 `tools/tool-xxx/src/index.tsx` 中导出：
     - 单组件：`export { default } from './XxxTool'`
     - 多组件：`export { default as XxxA } from './XxxA'` 等。

4. **主应用依赖**  
   在 `apps/web/package.json` 的 `dependencies` 中增加：
   ```json
   "@toolbox/tool-xxx": "workspace:*"
   ```

5. **主应用路由**  
   在 `apps/web/src/App.tsx` 中：
   - 单组件：  
     `const XxxTool = lazy(() => import('@toolbox/tool-xxx'))`  
     然后：`<Route path="/xxx" element={<XxxTool />} />`
   - 多组件：  
     `const XxxA = lazy(() => import('@toolbox/tool-xxx').then(m => ({ default: m.XxxA })))`  
     再挂对应路由。

6. **Vite 排除预构建**  
   在 `apps/web/vite.config.ts` 的 `optimizeDeps.exclude` 中增加 `'@toolbox/tool-xxx'`。

7. **安装并验证**
   ```bash
   pnpm install
   pnpm dev
   ```
   再在 Layout 和 Home 中加上导航与首页卡片，并更新 `TOOLS_LIST.md`。

---

## 五、国际化与主题（架构层）

- **国际化**：`src/i18n.ts` 初始化 i18next，`src/locales/zh.json`、`en.json` 按 **namespace** 管理文案。
  - **已有 namespace**：`common`（appName、loading、theme、lang_zh/lang_en）、`nav`（home、favorites、category_*、tools.*）、`footer`、`commandPalette`、`favorites`、`home`（欢迎区、平台特性、toolDesc.*）、`colorPicker`（颜色拾取页全部文案）。
  - **用法**：组件内 `const { t } = useTranslation('namespace')`，文案用 `t('key')`；带插值用 `t('key', { n: 1 })`。
  - **为新页面做 i18n**：  
    1. 在 `zh.json` / `en.json` 中新增或复用 namespace（如 `unitConverter`）；  
    2. 在 `i18n.ts` 的 `resources.zh` / `resources.en` 中注册该 namespace；  
    3. 页面内 `useTranslation('unitConverter')`，所有面向用户的字符串改为 `t('xxx')`。  
  - 新增语言：在 `locales/` 增加语言文件并在 `i18n.ts` 的 `resources` 中注册。工具包内如需 i18n，可依赖主应用传入的 `t` 或共享 i18n 实例。
- **主题**：`src/contexts/ThemeContext.tsx` 提供 `useTheme()`，在 `document.documentElement` 上切换 `light` / `dark` class，Tailwind 使用 `darkMode: 'class'`。导航栏有主题切换按钮与语言切换（中/英），偏好持久化在 localStorage。

## 六、依赖归属原则

- **主应用 `apps/web`**：只放主应用和「未拆出去页面」用到的依赖；不直接依赖 jspdf、qrcode、pdf-lib、jszip 等工具专属库。
- **工具包 `tools/tool-xxx`**：该工具用到的所有第三方库只写在该包的 `package.json` 中。
- **根 `package.json`**：仅脚本、`express`（给 `server.js`）、`@playwright/test` 等根级用途。

---

## 七、常见问题

**Q: 为什么必须用 pnpm？**  
A: 使用 pnpm workspace 管理 `apps/*`、`packages/*`、`tools/*`，`workspace:*` 依赖需要 pnpm。

**Q: 修改了某个 tool 的代码，主应用没热更新？**  
A: 确认已执行过根目录的 `pnpm install`，且 Vite 的 `optimizeDeps.exclude` 包含该工具包；必要时重启 `pnpm dev`。

**Q: 构建报错找不到 `@toolbox/tool-xxx`？**  
A: 在根执行 `pnpm install`，并确认 `apps/web/package.json` 中有 `"@toolbox/tool-xxx": "workspace:*"`。

**Q: 生产部署时静态资源和 API？**  
A: 先 `pnpm build`，再用根目录 `pnpm start`（即 `node server.js`）。`server.js` 会提供 `dist/` 静态与 `/api/*` 等接口；Docker 镜像会复制 `apps/web/dist` 和 `apps/web/public`。

**Q: 新闻数据从哪里来？**  
A: 运行 `pnpm crawl:news` 会写入 `apps/web/public/news.json`；生产环境也可由后端或定时任务生成该文件。

---

## 八、相关文档

- [README.md](../README.md) - 项目概览与快速开始  
- [TOOLS_ROADMAP.md](TOOLS_ROADMAP.md) - **已开发/待开发/代码落位**（避免重复开发、规划唯一来源）  
- [TOOL_LANDING.md](TOOL_LANDING.md) - **工具规划落地目录与 Monorepo 规范**（落位目录、独立开发/部署、dev 流程、create:tool）  
- [ROADMAP_CONVENTION.md](ROADMAP_CONVENTION.md) - 规划约定（怎么提、分类、怎么给 AI）  
- [TOOLS_LIST.md](../TOOLS_LIST.md) - 完整工具清单与统计  
- [ARCHITECTURE.md](../ARCHITECTURE.md) - 架构规划  
- [monorepo-tools-split-analysis.md](monorepo-tools-split-analysis.md) - Monorepo 拆分分析  
