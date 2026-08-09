# dns-config 实现计划

> 按任务顺序执行，独立子任务可并行；每个含逻辑的模块 TDD（先测后码）。

**Goal:** 纯前端 DNS 配置助手：常用公共 DNS 列表 + 多 DNS 延迟测试 + Mac/Linux/Windows 配置脚本一键复制。

**Architecture:** 静态数据（DNS 列表）+ 纯函数（脚本生成，可脱离网络单测）+ 一个瘦的延迟测试模块（浏览器 `fetch` DoH endpoint，网络依赖，不做单测，复用 `tool-dns-performance` 的 `measureOne` 模式）+ 主组件（Tab 切换：列表/测速/复制脚本）。

**Tech Stack:** React 18 + TS、`@toolbox/ui-kit`（PageHero/CopyButton/Spinner）、vitest（node 环境测纯函数）、零新依赖。

## Global Constraints

- 目录 `tools/tool-dns-config/`，路由 `/dns-config`，namespace `toolDnsConfig`，组件 `DnsConfig`
- `categoryKey: 'network'`，icon 用 lucide `Server`（或 `Settings2`）
- 不改后端；不改 `apps/web/src/config/a-*.ts`（manifest 自动发现）；不加新依赖
- i18n zh/en 同步，全部文案走 `t()`
- commit 时使用 `GIT_AUTHOR_EMAIL=dengyongchao1@gmail.com GIT_COMMITTER_EMAIL=dengyongchao1@gmail.com`，不修改 git config

---

## 并行组 1（基础设施，串行）

- [x] 1.1 `pnpm create:tool dns-config && pnpm install`
- [x] 1.2 改 manifest：`categoryKey:'network'`、icon、keywords（DNS/配置/延迟/脚本/mac/linux/windows）、meta zh「DNS 配置助手」/en「DNS Config Assistant」
- [x] 1.3 `src/lib/types.ts`：`DnsProvider {id,name,ipv4:string[],ipv6?:string[],description}`、`LinuxVariant='nmcli'|'netplan'|'resolv-conf'`、`LatencyResult {id,name,avg,min,max,ok}`
- [x] 1.4 Commit `feat(tool-dns-config): scaffold + manifest + types`

## 并行组 2（独立子任务 — 可并行）

- [x] 2.1 `src/lib/providers.ts`：预置 DNS 列表数据（阿里/腾讯/114DNS/Google/Cloudflare/Quad9/OpenDNS，含 IPv4/IPv6/简介）+ 对应 DoH endpoint（复用 `tool-dns-performance` 里已验证的 DoH URL）
- [x] 2.2 `src/lib/scriptGen.ts`（+ 单测）：纯函数 `genMacScript(ips)`、`genLinuxScript(ips, variant)`、`genWindowsScript(ips)`，输出对应平台可复制的命令文本；单测覆盖单 IP/多 IP/IPv6 混合、三种 Linux variant 各自的输出格式
- [x] 2.3 `src/lib/latency.ts`：`measureProvider(doHUrl): Promise<number>`，直接复用 `tool-dns-performance` 的 fetch 计时模式（多次采样取 avg/min/max，失败标记 `ok:false`），不做单测（网络依赖）
- [x] 2.4 `src/locales/zh.json` + `en.json`：标题、DNS 列表表头、测速按钮/结果、平台 Tab（macOS/Linux/Windows）、Linux variant 切换、复制按钮/复制成功提示
- [x] 2.5 Commit 各子任务（可分次提交，见下）

## 并行组 3（集成 — 依赖组 2）

- [x] 3.1 `src/DnsConfig.tsx`：
  - 列表区：展示 `providers.ts` 数据，勾选框
  - 测速区：对勾选项调用 `measureProvider`，展示 loading/结果并按延迟排序
  - 脚本区：选中一个 DNS（或自定义输入 IP）后，Tab 切换 macOS/Linux/Windows，Linux 下再切换三种 variant，调用 `scriptGen.ts` 生成文本，`CopyButton` 复制
- [x] 3.2 `src/index.tsx` 导出
- [x] 3.3 Commit `feat(tool-dns-config): main component integration`

## 并行组 4（质量关卡 + 收尾）

- [x] 4.1 `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [x] 4.2 手工验收：`pnpm dev` 打开 `/dns-config`，勾选多个 DNS 测速有结果、切换平台/variant 脚本内容正确、复制按钮生效
- [x] 4.3 `docs/TOOLS_ROADMAP.md`：把「万年历」旁新增一行「DNS 配置助手」到「二、已开发」→ 网络工具（本次一并登记，不再单开 PR）
