# Change: 新增全方位 HTTPS 检测工具（https-inspector）

## Why

对标 myssl.com，把「一次输入域名 → 拿到 HTTPS 站点的全面体检报告」做成一个工具。现有 `tool-ssl-cert` 只回证书基础信息、`tool-cdn-check` 只查 CDN、`tool-domain-mx` 只列 MX 记录，用户要评估一个站点得跳三四个工具且没有评级、没有协议/套件明细、没有 IPv6/国密/后量子这类前沿检测。本工具把六大维度聚合到一份带综合评级的报告里：HTTPS 评级、IPv6 检测、CDN 检测、邮件服务器检测、国密（TLCP/GM）HTTPS 检测、后量子（PQC）HTTPS 检测。

## What Changes

新增工具 `tools/tool-https-inspector/`，路由 `/https-inspector`，分类 `network`，`mode: 'server'`（需要后端做 TLS 握手与 DNS 查询）。与 `tool-ssl-cert`/`tool-cdn-check`/`tool-domain-mx` **并存**，不改动或下线旧工具。

后端新增探测服务 `tools/tool-https-inspector/server/`，暴露 `POST /api/https-inspector/check`，输入 `{ domain, port? }`，一次串/并行完成六大模块，返回结构化报告。按现有约定双注册：`apps/web/vite.config.ts`（dev 中间件）+ `services/security-service`（生产 service 模块）。

六大模块（Node 标准库可达能力，诚实标注）：

1. **HTTPS 评级**：`tls.connect` 拿证书链、协议版本、协商到的加密套件；探测各 TLS 版本支持情况（对 TLS1.0/1.1/1.2/1.3 分别尝试握手）；据此按 A+~T 规则算综合评级并给出扣分原因与修复建议。
2. **IPv6 检测**：`dns.resolve6` 查 AAAA；若有则尝试对 IPv6 地址做 TLS 握手，判断 IPv6 下 HTTPS 是否可用。
3. **CDN 检测**：`dns.resolveCname` + `dns.resolve4/6`，把 CNAME 链与出口 IP 归属对照内置 CDN 特征库（cloudflare/akamai/阿里云/腾讯云/fastly 等），判断是否使用 CDN 及厂商。单一探测点，报告注明。
4. **邮件服务器检测**：`dns.resolveMx` 取 MX，按优先级对首选 MX 走 SMTP + STARTTLS，读取邮件服务器证书与 TLS 支持情况。
5. **国密 HTTPS 检测（TLCP/GM）**：Node TLS 不支持 SM2 套件，改为手写原始 TLS/TLCP ClientHello（advertise ECC-SM4-CBC/ECDHE-SM4 等 GM 套件），解析 ServerHello 判断服务端是否选中国密套件，输出「支持/不支持国密」级别结论。
6. **后量子 HTTPS 检测（PQC）**：手写 TLS 1.3 ClientHello，key_share/supported_groups 里 advertise `X25519MLKEM768`(0x11ec) 等混合组，解析 ServerHello 的 selected group / HelloRetryRequest，输出「支持/不支持后量子密钥交换」结论。

前端 `HttpsInspector.tsx`：单输入框（域名+可选端口）+ 检测按钮，报告分区展示——顶部综合评级徽章 + 六个模块卡片（复用 `@toolbox/ui-kit`）。i18n zh/en 内置。不新增第三方依赖。

## Acceptance Criteria

- 输入一个公网 HTTPS 域名（如 `www.microsoft.com`）能返回：综合评级 + 证书链 + 各 TLS 版本支持 + 协商套件 + IPv6 可用性 + CDN 判定 + 邮件服务器 TLS + 国密结论 + 后量子结论，各模块任一失败不影响其他模块（局部降级，标注错误）。
- 国密/后量子模块对已知支持的站点返回「支持」、对普通站点返回「不支持」，并有原始握手依据（选中的套件/组）。
- 后端探测有超时保护（单模块 ≤8s），不因单个域名不可达而挂起。
- 纯函数（评级规则、CDN 特征匹配、ClientHello 构造/ServerHello 解析）有单测覆盖。
- `pnpm check:consistency`、`pnpm lint`、`pnpm test`、`pnpm -C apps/web build` 全部通过。
