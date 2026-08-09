# dns-config 查询测试 实现计划

## 1. 纯函数 + 单测

- [ ] 1.1 `src/lib/parseDoh.ts`：`parseDohAnswer(json: unknown): string[]`（同 tool-doh-config 实现）
- [ ] 1.2 单测：正常 A 记录响应、`Status !== 0`、无 `Answer` 字段、多条记录、非法输入

## 2. 集成

- [ ] 2.1 `src/lib/latency.ts`：`measureProvider(provider, domain, type)` 改为同一次 fetch 既计时又解析结果，无 `doHUrl` 时直接返回失败态
- [ ] 2.2 `src/DnsConfig.tsx`：新增域名输入框（默认 `google.com`）+ 记录类型下拉（默认 A），结果表新增"解析结果"列
- [ ] 2.3 i18n zh/en：域名输入、记录类型标签、解析结果列标题、无 DoH 提示
- [ ] 2.4 质量关卡：`pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build`
