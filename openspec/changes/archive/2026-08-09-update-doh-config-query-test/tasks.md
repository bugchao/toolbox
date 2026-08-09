# doh-config 查询测试 实现计划

## 1. 纯函数 + 单测

- [x] 1.1 `src/lib/parseDoh.ts`：`parseDohAnswer(json: unknown): string[]`，从 DoH JSON 响应的 `Answer` 数组提取 `data` 字段；`Status !== 0` 或无 `Answer` 时返回空数组
- [x] 1.2 单测：正常 A 记录响应、`Status !== 0`（如 NXDOMAIN）、无 `Answer` 字段、多条记录

## 2. 集成

- [x] 2.1 `src/lib/latency.ts`：`measureProvider(provider, domain, type)` 改为接收域名与记录类型，同一次 fetch 里既计时又调用 `parseDohAnswer` 解析结果，返回值新增 `answers: string[]`
- [x] 2.2 `src/DohConfig.tsx`：新增域名输入框（默认 `google.com`）+ 记录类型下拉（默认 A），结果表新增"解析结果"列
- [x] 2.3 i18n zh/en：域名输入、记录类型标签、解析结果列标题
- [x] 2.4 质量关卡：`pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build`
