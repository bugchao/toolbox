# Change: DoH 配置助手增加实际查询测试

## Why

`tool-doh-config` 目前的"测试延迟"只测响应时间，不展示 DoH 查询解析出的实际记录，用户没法验证这个 DoH endpoint 是否真的能正常解析域名（只测速不测通）。用户要求"输入域名，能通过 DoH 实际查询"，即需要展示查询结果本身，而不只是耗时。

## What Changes

- 在"常用 DoH 提供商"区新增域名输入框（默认 `google.com`）与记录类型选择（A/AAAA/CNAME/MX/TXT/NS，默认 A）。
- 原"测试延迟"改为对每个勾选的 DoH endpoint 发起真实 DoH 查询（复用同一次 fetch，不额外增加请求数），结果表新增一列展示解析出的记录值（如 A 记录的 IP 列表）；解析失败或返回非 0 状态码时该行标记失败（复用现有 `StatusBadge`）。
- 新增纯函数 `parseDohAnswer(json): string[]`，从 DoH JSON 响应的 `Answer` 数组提取记录值，可脱离网络单测。

## Capabilities

### Modified Capabilities
- `doh-config`：「DoH 连通性/延迟测试」需求扩展为同时展示查询解析结果

## Impact

- 仅影响 `tools/tool-doh-config/`（`lib/latency.ts`、新增 `lib/parseDoh.ts`、`DohConfig.tsx`、i18n）
- 不涉及后端，不加新依赖
