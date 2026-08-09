# Change: 新增 DoH 配置助手（doh-config）

## Why

DNS-over-HTTPS（DoH）在浏览器/系统层面的配置方式和普通 DNS IP 完全不同（填的是 URL 而不是 IP，且各浏览器/系统的配置入口分散且不直观）。用户想启用 DoH 时，同样面临"不知道该填哪家 endpoint、不知道怎么配到浏览器/系统里"的问题。`tool-dns-config`（本仓库同批新增）解决的是传统 DNS IP 配置，`tool-dns-performance`/`tool-dns-global-check` 只做延迟/解析对比，都不覆盖"DoH 怎么配置到浏览器/系统"这个场景。

## What Changes

新增纯前端工具 `tools/tool-doh-config/`，路由 `/doh-config`，分类 `network`：

- **常用 DoH 提供商列表**：预置 Cloudflare、Google、Quad9、AdGuard、阿里、腾讯等条目，展示名称、DoH endpoint URL、简介。
- **DoH 连通性/延迟测试**：浏览器 `fetch` 各 DoH endpoint 测响应时间（与 `tool-dns-config`/`tool-dns-performance` 同一技术路线，多次采样取平均/最小/最大），按延迟排序展示；失败的 endpoint 标记为不可用。
- **可直接复制的配置片段**：用户选中一个（或自定义）DoH endpoint 后，生成对应配置片段并提供复制按钮：
  - 浏览器：Firefox `about:config`（`network.trr.mode` / `network.trr.uri`）、Chrome/Edge flags 说明文本
  - Windows：`netsh dns add encryption` DoH 配置片段
  - Linux：`systemd-resolved`（`/etc/systemd/resolved.conf` 的 `DNSOverTLS`/DoH 相关片段，注明 systemd-resolved 原生 DoH 支持的版本限制）
- 所有 DoH 列表、配置模板均为前端静态数据，不上传、不依赖后端。

## Capabilities

### New Capabilities
- `doh-config`：常用 DoH 提供商展示、DoH 连通性/延迟测试、可复制的浏览器/系统配置片段生成

### Modified Capabilities
（无）

## Impact

- 新增 `tools/tool-doh-config/`（manifest 自动发现，无需手动改 `apps/web/src/config/a-*.ts`）
- 复用 `@toolbox/ui-kit` 的 `CopyButton`、`PageHero`、`Spinner`、`StatusBadge`
- 不涉及 `apps/api-gateway` 或任何后端 service
- `docs/TOOLS_ROADMAP.md` 上线后需补登记到「二、已开发」→ 网络工具
