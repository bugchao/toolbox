# doh-config Specification

## Purpose
TBD - created by archiving change add-doh-config-tool. Update Purpose after archive.
## Requirements
### Requirement: 常用 DoH 提供商列表展示

工具 SHALL 展示一份预置的常用 DoH 提供商列表（至少包含 Cloudflare、Google、Quad9、AdGuard、阿里、腾讯），每条目 SHALL 显示名称、DoH endpoint URL、简介。

#### Scenario: 打开工具查看列表

- **WHEN** 用户打开 DoH 配置助手
- **THEN** 界面展示预置 DoH 提供商列表，每条含名称与 endpoint URL

### Requirement: DoH 连通性/延迟测试

工具 SHALL 支持对列表中任意勾选的多个 DoH 提供商（及用户输入的自定义 endpoint）做连通性与延迟测试：通过浏览器 `fetch` 对应 endpoint 多次采样，计算平均/最小/最大响应时间，并按延迟从低到高排序展示结果；请求失败的 endpoint SHALL 标记为不可用而非影响其余结果。

#### Scenario: 勾选多个 DoH 测速

- **WHEN** 用户勾选 3 个 DoH 提供商并点击"测试延迟"
- **THEN** 界面依次显示这 3 个提供商的平均延迟，并按延迟升序排列

#### Scenario: 单个 endpoint 测试失败

- **WHEN** 某个 DoH endpoint 请求失败或超时
- **THEN** 该提供商的结果标记为不可用，不影响其余提供商的展示

### Requirement: 浏览器/系统配置片段生成与复制

工具 SHALL 支持用户选中一个预置 DoH 提供商（或手动输入 endpoint URL）后，生成 Firefox、Chrome/Edge、Windows、Linux（systemd-resolved）对应的配置片段文本，并提供一键复制。

#### Scenario: 选择 DoH 并切换配置目标

- **WHEN** 用户选中一个 DoH 提供商，并切换到 Firefox / Chrome-Edge / Windows / Linux 任一配置目标 Tab
- **THEN** 界面展示该目标对应的配置片段文本

#### Scenario: 复制配置片段

- **WHEN** 用户点击某配置片段旁的复制按钮
- **THEN** 该片段文本被复制到剪贴板，并给出复制成功的视觉反馈

