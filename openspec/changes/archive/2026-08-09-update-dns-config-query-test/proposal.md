# Change: DNS 配置助手增加实际查询测试

## Why

与 `tool-doh-config` 增加的能力对齐（同批姊妹工具，见 `update-doh-config-query-test`）：`tool-dns-config` 目前的"测试延迟"只测响应时间，不展示查询解析出的实际记录。浏览器无法对传统 DNS IP（UDP:53）发起真实查询，但每个预置服务商都自带 DoH endpoint（`DnsProvider.doHUrl`，已用于测速），可以复用同一次 fetch 发起真实 DoH 查询并展示解析结果，让"选哪个 DNS"的依据从"纯延迟"变成"延迟 + 真的能查到东西"。

## What Changes

- 在"常用公共 DNS"区新增域名输入框（默认 `google.com`）与记录类型选择（A/AAAA/CNAME/MX/NS/TXT，默认 A）。
- 原"测试延迟"改为对每个勾选的 DNS 服务商（通过其 `doHUrl`）发起真实查询，结果表新增一列展示解析出的记录值；无 `doHUrl`（如 114DNS）或查询失败/解析不到有效记录的标记为不可用。
- 新增纯函数 `parseDohAnswer(json): string[]`（与 `tool-doh-config` 同实现，工具包独立不跨包依赖）。

## Capabilities

### Modified Capabilities
- `dns-config`：「多 DNS 延迟测试」需求扩展为同时展示查询解析结果

## Impact

- 仅影响 `tools/tool-dns-config/`（`lib/latency.ts`、新增 `lib/parseDoh.ts`、`DnsConfig.tsx`、i18n）
- 不涉及后端，不加新依赖
