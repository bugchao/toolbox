# https-inspector 实现计划

> 按并行组顺序执行；组内任务互相独立可并行；每任务 TDD（先测后码）。

**Goal:** 一份输入域名即出的全方位 HTTPS 体检报告：评级 + IPv6 + CDN + 邮件服务器 + 国密 + 后量子。

**Architecture:** 后端探测按模块拆分为独立文件（`server/checks/*.js`），各自导出一个 `check(domain,port,opts)`；主 service `aggregate` 并行调用并合并，单模块 try/catch 局部降级。评级规则、CDN 特征匹配、TLCP/PQC 的 ClientHello 构造与 ServerHello 解析为**纯函数**，带单测（jsdom 无关，跑在 node）。前端为薄壳，按模块渲染卡片。

**Tech Stack:** Node `tls`/`net`/`dns` 标准库；手写二进制 TLS 报文（Buffer）；React 18 + TS + `@toolbox/ui-kit`；vitest；零新依赖。

## Global Constraints

- 目录 `tools/tool-https-inspector/`，路由 `/https-inspector`，namespace `toolHttpsInspector`，组件 `HttpsInspector`
- `categoryKey: 'network'`，icon 用 lucide `ShieldCheck`（或 `Radar`），`mode: 'server'`
- 后端 `POST /api/https-inspector/check`；双注册 vite.config + security-service
- 不改旧工具；不改 `apps/web/src/config/a-*.ts`（manifest 自动发现）；不加新依赖
- i18n zh/en 同步，全部文案走 `t()`

---

## 并行组 1（基础设施，串行）

### Task 1: 脚手架 + manifest + 共享类型

- [x] `pnpm create:tool https-inspector && pnpm install`
- [x] 改 manifest：`categoryKey:'network'`、`icon: ShieldCheck`、`mode:'server'`、keywords（https/ssl/tls/评级/ipv6/cdn/国密/后量子/pqc/gmssl）、meta zh「全方位 HTTPS 检测」/en「HTTPS Inspector」
- [x] `server/types.js`（JSDoc）+ `src/types.ts`：`InspectorReport { domain, port, grade, modules:{ https, ipv6, cdn, mail, gm, pqc }, timestamp }`，每模块 `{ ok, error?, ... }`
- [x] Commit `feat(tool-https-inspector): scaffold + manifest + types`

## 并行组 2（后端纯函数与探测模块，互相独立，各带测试）

### Task 2: HTTPS 评级 `server/checks/https.js` (+ test)

- [x] `tls.connect` 取证书链/协议/套件；对 TLS1.0~1.3 各版本分别 `tls.connect({minVersion,maxVersion})` 探测支持性
- [x] 纯函数 `computeGrade(facts)` → A+~T + reasons[] + suggestions[]（低版本协议、非 AEAD、证书过期/自签、无 HSTS 等扣分），单测覆盖典型输入
- [x] Commit

### Task 3: IPv6 + CDN `server/checks/ipv6.js`、`server/checks/cdn.js` (+ tests)

- [x] ipv6：`dns.resolve6`，有则对 IPv6 试握手；纯函数判定
- [x] cdn：`dns.resolveCname`+`resolve4`；纯函数 `matchCdn(cname, ips)` 对照内置特征库（cloudflare/akamai/fastly/阿里云/腾讯云/cloudfront 等），单测覆盖命中/未命中
- [x] Commit

### Task 4: 邮件服务器 `server/checks/mail.js` (+ test)

- [x] `dns.resolveMx` 取首选 MX；`net.connect` 25 端口读 banner → `EHLO` → `STARTTLS` → `tls.connect` 读证书
- [x] 纯函数解析 EHLO 响应能力列表；单测覆盖含/不含 STARTTLS
- [x] Commit

### Task 5: 国密 TLCP `server/checks/gm.js` (+ test)

- [x] 纯函数 `buildGmClientHello()` 构造携带 SM2 套件（如 0xe011 ECDHE-SM4-CBC-SM3、0xe013 ECC-SM4-CBC-SM3）的 ClientHello Buffer
- [x] 纯函数 `parseServerHello(buf)` 提取 selected cipher / alert；`check` 用 `net.connect` 收发原始报文
- [x] 单测覆盖 build 输出字节结构 + parse 已知 ServerHello 样本
- [x] Commit

### Task 6: 后量子 PQC `server/checks/pqc.js` (+ test)

- [x] 纯函数 `buildPqcClientHello()`：TLS1.3 ClientHello，supported_groups + key_share 含 X25519MLKEM768(0x11ec)
- [x] 复用/扩展 `parseServerHello`：提取 TLS1.3 selected group（key_share ext / HRR）
- [x] `check` 用 `net.connect` 收发；单测覆盖 build + parse
- [x] Commit

### Task 7: i18n `src/locales/zh.json` + `en.json`

- [x] 六模块标题、字段标签、评级说明、错误/无数据提示、单一探测点注记，zh/en 同步
- [x] Commit

## 并行组 3（集成，依赖组 2）

### Task 8: 聚合 service + API + 路由注册

- [x] `server/https-inspector-service.js`：`Promise.allSettled` 并行调六个 check，超时保护，合并 `InspectorReport`
- [x] `server/https-inspector-api.js`：`createHttpsInspectorApiMiddleware()` + `registerHttpsInspectorApiRoutes(app)`（照 ssl-cert 双形态）
- [x] 注册：`apps/web/vite.config.ts` 加中间件；`services/security-service/src/index.js` 加 register + routePrefix `/api/https-inspector`
- [x] Commit

### Task 9: 前端报告 UI

- [x] `src/HttpsInspector.tsx`：输入框（域名+端口）+ 检测按钮；`fetch('/api/https-inspector/check')`；顶部评级徽章 + 六模块卡片（复用 ui-kit PageHero/Card/Button）；loading/error 态
- [x] `src/index.tsx` 导出
- [x] Commit

## 并行组 4（验收）

### Task 10: 质量关卡

- [x] `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [x] 手工验收：对 microsoft.com 等真实站点跑一次，六模块均返回
