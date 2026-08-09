# Change: 新增 DNS 配置助手（dns-config）

## Why

用户换 DNS（阿里/腾讯/Google/Cloudflare/Quad9 等）时，常见的痛点是：不知道该填哪个 IP、不知道 Mac/Linux/Windows 各自怎么改、改完也不确定哪家最快。仓库现有 DNS 类工具（`tool-dns-performance`、`tool-dns-global-check` 等）只做“解析结果/响应时间对比”，都假设用户已经知道要测哪几个 DoH 地址，没有一个工具面向“我该选哪个 DNS、怎么配置到系统里”这个更前置的场景。

## What Changes

新增纯前端工具 `tools/tool-dns-config/`，路由 `/dns-config`，分类 `network`：

- **常用公共 DNS 列表**：预置阿里 DNS、腾讯 DNS、114DNS、Google、Cloudflare、Quad9、OpenDNS 等条目，展示名称、IPv4/IPv6 地址、简介。
- **多 DNS 延迟测试**：与 `tool-dns-performance` 同一技术路线——浏览器 `fetch` 各服务商自带的 DoH endpoint 测响应时间（多次采样取平均/最小/最大），按延迟排序展示，作为“选哪个”的参考依据；不发真实 UDP:53 查询（浏览器无此能力），不新增后端。
- **跨平台配置方法 + 一键复制脚本**：用户选中一个（或自定义）DNS 后，按平台（macOS / Linux / Windows）生成对应的配置命令/脚本文本，提供复制按钮：
  - macOS：`networksetup -setdnsservers <网络服务名> <ip1> <ip2>` shell 片段
  - Linux：`nmcli`、`netplan`、`/etc/resolv.conf` 三种常见方式的片段（用户可切换）
  - Windows：`netsh interface ip set dns` / PowerShell `Set-DnsClientServerAddress` 片段
- 所有 DNS 列表、平台脚本模板均为前端静态数据，不上传、不依赖后端。

## Capabilities

### New Capabilities
- `dns-config`：常用公共 DNS 展示、多 DNS 延迟测试、跨平台配置脚本生成与复制

### Modified Capabilities
（无，不修改任何既有 spec 的需求）

## Impact

- 新增 `tools/tool-dns-config/`（manifest 自动发现，无需手动改 `apps/web/src/config/a-*.ts`）
- 复用 `@toolbox/ui-kit` 的 `CopyButton`、`PageHero`、`Spinner`
- 不涉及 `apps/api-gateway` 或任何后端 service
- `docs/TOOLS_ROADMAP.md` 上线后需补登记到「二、已开发」→ 网络工具
