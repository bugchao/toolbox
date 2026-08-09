# doh-config 实现计划

> 按任务顺序执行，独立子任务可并行；每个含逻辑的模块 TDD（先测后码）。

**Goal:** 纯前端 DoH 配置助手：常用 DoH 提供商列表 + 连通性/延迟测试 + Firefox/Chrome-Edge/Windows/Linux 配置片段一键复制。

**Architecture:** 静态数据（DoH 列表）+ 纯函数（配置片段生成，可脱离网络单测）+ 一个瘦的延迟测试模块（复用 `tool-dns-config/src/lib/latency.ts` 的模式，浏览器 fetch，不做单测）+ 主组件（Tab 切换：列表/测速/复制片段）。

**Tech Stack:** React 18 + TS、`@toolbox/ui-kit`（PageHero/CopyButton/Spinner/StatusBadge）、vitest（node 环境测纯函数）、零新依赖。

## Global Constraints

- 目录 `tools/tool-doh-config/`，路由 `/doh-config`，namespace `toolDohConfig`，组件 `DohConfig`
- `categoryKey: 'network'`，icon 用 lucide `ShieldCheck`（或 `Lock`）
- 不改后端；不改 `apps/web/src/config/a-*.ts`（manifest 自动发现）；不加新依赖
- i18n zh/en 同步，全部文案走 `t()`
- commit 时使用 `GIT_AUTHOR_EMAIL=dengyongchao1@gmail.com GIT_COMMITTER_EMAIL=dengyongchao1@gmail.com`，不修改 git config

---

## 并行组 1（基础设施，串行）

- [ ] 1.1 `pnpm create:tool doh-config && pnpm install`
- [ ] 1.2 改 manifest：`categoryKey:'network'`、icon、keywords（DoH/DNS-over-HTTPS/配置/延迟/firefox/chrome/windows/linux）、meta zh「DoH 配置助手」/en「DoH Config Assistant」
- [ ] 1.3 `src/lib/types.ts`：`DohProvider {id,name,url,description}`、`ConfigTarget='firefox'|'chrome-edge'|'windows'|'linux'`、`LatencyResult`（同 dns-config 结构）
- [ ] 1.4 Commit `feat(tool-doh-config): scaffold + manifest + types`

## 并行组 2（独立子任务 — 可并行）

- [ ] 2.1 `src/lib/providers.ts`：预置 DoH 列表数据（Cloudflare/Google/Quad9/AdGuard/阿里/腾讯，含 endpoint URL/简介）
- [ ] 2.2 `src/lib/scriptGen.ts`（+ 单测）：纯函数 `genFirefoxConfig(url)`、`genChromeEdgeConfig(url)`、`genWindowsConfig(url)`、`genLinuxConfig(url)`，输出对应配置片段文本；单测覆盖不同 URL 输入
- [ ] 2.3 `src/lib/latency.ts`：`measureProvider(doHUrl): Promise<LatencyResult>`，直接复用 `tool-dns-config/src/lib/latency.ts` 的实现模式（同目录内联一份，不跨包依赖），不做单测（网络依赖）
- [ ] 2.4 `src/locales/zh.json` + `en.json`：标题、DoH 列表表头、测速按钮/结果、配置目标 Tab（Firefox/Chrome-Edge/Windows/Linux）、复制按钮/复制成功提示
- [ ] 2.5 Commit 各子任务

## 并行组 3（集成 — 依赖组 2）

- [ ] 3.1 `src/DohConfig.tsx`：
  - 列表区：展示 `providers.ts` 数据，勾选框
  - 测速区：对勾选项调用 `measureProvider`，展示 loading/结果并按延迟排序，失败项用 `StatusBadge`
  - 配置区：选中一个 DoH（或自定义输入 URL）后，Tab 切换 Firefox/Chrome-Edge/Windows/Linux，调用 `scriptGen.ts` 生成文本，`CopyButton` 复制
- [ ] 3.2 `src/index.tsx` 导出
- [ ] 3.3 Commit `feat(tool-doh-config): main component integration`

## 并行组 4（质量关卡 + 收尾）

- [ ] 4.1 `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [ ] 4.2 手工验收：`pnpm dev` 打开 `/doh-config`，勾选多个 DoH 测速有结果、切换配置目标片段内容正确、复制按钮生效
- [ ] 4.3 `docs/TOOLS_ROADMAP.md`：新增一行「DoH 配置助手」到「二、已开发」→ 网络工具
