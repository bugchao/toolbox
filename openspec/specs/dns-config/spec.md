# dns-config Specification

## Purpose
TBD - created by archiving change add-dns-config-tool. Update Purpose after archive.
## Requirements
### Requirement: 常用公共 DNS 列表展示

工具 SHALL 展示一份预置的常用公共 DNS 服务商列表（至少包含阿里 DNS、腾讯 DNS、114DNS、Google、Cloudflare、Quad9、OpenDNS），每条目 SHALL 显示名称、IPv4 地址（有 IPv6 时一并显示）、简介。

#### Scenario: 打开工具查看列表

- **WHEN** 用户打开 DNS 配置助手
- **THEN** 界面展示预置 DNS 服务商列表，每条含名称与 IP 地址

### Requirement: 多 DNS 延迟测试

工具 SHALL 支持对列表中任意勾选的多个 DNS 服务商（及用户输入的自定义 DoH 地址）做延迟测试：通过浏览器 `fetch` 对应服务商的 DoH endpoint 多次采样，计算平均/最小/最大响应时间，并按延迟从低到高排序展示结果。

#### Scenario: 勾选多个 DNS 测速

- **WHEN** 用户勾选 3 个 DNS 服务商并点击“测试延迟”
- **THEN** 界面依次显示这 3 个服务商的平均延迟，并按延迟升序排列

#### Scenario: 单个服务商测试失败

- **WHEN** 某个 DoH endpoint 请求失败或超时
- **THEN** 该服务商的结果标记为失败，不影响其余服务商的展示

### Requirement: 跨平台配置脚本生成与复制

工具 SHALL 支持用户选中一个预置 DNS（或手动输入 DNS 地址）后，为 macOS、Linux、Windows 三个平台分别生成对应的配置命令/脚本文本，并提供一键复制。Linux 平台 SHALL 支持在 `nmcli`、`netplan`、`/etc/resolv.conf` 三种常见配置方式之间切换。

#### Scenario: 选择 DNS 并切换平台

- **WHEN** 用户选中一个 DNS 服务商，并切换到 macOS / Linux / Windows 任一平台 Tab
- **THEN** 界面展示该平台对应的配置命令/脚本文本

#### Scenario: 复制配置脚本

- **WHEN** 用户点击某平台脚本旁的复制按钮
- **THEN** 该脚本文本被复制到剪贴板，并给出复制成功的视觉反馈

#### Scenario: Linux 配置方式切换

- **WHEN** 用户在 Linux 平台下切换 `nmcli` / `netplan` / `resolv.conf` 选项
- **THEN** 对应的脚本文本随之更新

