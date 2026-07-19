# https-inspector 全量报告 实现计划

> 按顺序执行；组内任务互相独立可并行；纯函数带单测。

**Architecture:** 延续现有 `checks/*.js` 按模块拆分的模式。新增 `checks/overview.js`（IP geo）、`checks/protocol-details.js`（HTTP2/HSTS/OCSP装订/PFS/CAA）、`checks/cipher-matrix.js`（逐版本套件枚举）、`checks/vulnerabilities.js`（DROWN/POODLE/FREAK/Heartbleed）、`checks/handshake-sim.js`（客户端画像模拟）、`checks/cert-compat.js`（平台兼容性推断）、`checks/openssl-cert.js`（openssl 扩展字段）。`tls-raw.js` 扩展支持 SSLv2 ClientHello、心跳扩展、EXPORT 套件。

## Global Constraints

- 不引入新 npm 依赖；openssl 通过 `execFile`（复用 cert-suite-shared 的 `OPENSSL_BIN` 环境变量模式）
- Heartbleed 检测绝不展示/存储真实泄露内存内容，只出布尔+字节数
- CCS 注入、ROBOT 明确标注未实现，不允许返回猜测性是/否结论
- 每个新 check 独立 try/catch，失败局部降级，不阻塞聚合报告
- i18n zh/en 同步

## 并行组 1（基础设施）

### Task 1: Dockerfile 补 openssl + openssl-cert.js

- [x] `Dockerfile` 生产阶段加 `RUN apk add --no-cache openssl`
- [x] `server/checks/openssl-cert.js`：`execFile openssl x509 -text` 解析签名算法/公钥算法位数/证书品牌/SCT/OCSP 装订；`openssl` 缺失时 `ok:false` 局部降级
- [x] 单测：解析一段已知 `openssl x509 -text` 输出样本，校验字段提取

## 并行组 2（独立探测模块，各带测试）

### Task 2: 概述 `checks/overview.js`

- [x] 复用 `tool-ip-query` 已验证的 `ip-api.com` 免费接口查 IP 地理位置；失败降级为仅显示 IP
- [x] 单测：mock fetch 成功/失败两种路径

### Task 3: 协议详情 `checks/protocol-details.js`

- [x] HTTP/2：`tls.connect({ALPNProtocols:['h2','http/1.1']})` 读协商结果
- [x] HSTS：发一次 HTTPS GET 读 `Strict-Transport-Security` 头
- [x] OCSP 装订：`tls.connect({requestOCSP:true})` 监听 `OCSPResponse`
- [x] 正向保密：判断协商套件名是否含 `ECDHE`/`DHE`（纯函数，单测）
- [x] CAA：`dns.resolveCaa`
- [x] 单测覆盖正向保密判定纯函数

### Task 4: 套件枚举 `checks/cipher-matrix.js`

- [x] 内置各 TLS 版本候选套件名单（OpenSSL 命名）；逐个 `tls.connect({minVersion,maxVersion,ciphers})` 探测是否被接受
- [x] 纯函数 `buildCandidateList(version)` 单测覆盖返回非空列表

### Task 5: SSL 漏洞 `checks/vulnerabilities.js` + `tls-raw.js` 扩展

- [x] `tls-raw.js` 新增：`buildSslv2ClientHello()`、`buildPoodleClientHello(host)`（record version 0x0300 + CBC 套件）、`buildFreakClientHello(host)`（仅 EXPORT 套件）、`buildHeartbeatClientHello(host)` + `buildHeartbeatRequest(payloadLen, declaredLen)`
- [x] DROWN/POODLE/FREAK：发送对应 ClientHello，解析响应判定
- [x] Heartbleed：握手后发送畸形心跳请求，纯函数 `evaluateHeartbeatResponse(sentLen, receivedLen)` 只返回 `{vulnerable, leakedBytes}`，**调用方立即丢弃原始响应 Buffer**
- [x] CCS注入、ROBOT：固定返回 `{ok:true, notSupported:true, reason:'...'}`
- [x] 单测：`evaluateHeartbeatResponse` 覆盖泄露/未泄露两种输入；`buildSslv2ClientHello`/`buildFreakClientHello` 字节结构断言

### Task 6: 客户端握手模拟 `checks/handshake-sim.js`

- [x] 内置 ≥12 个客户端画像（Chrome/Firefox/Safari/Edge/IE11/Java8/Java11/Android4.4/Android7/Android14/OpenSSL1.0.1/OpenSSL1.1.1），每个画像 `{name, protocols, ciphers}`
- [x] 用 `tls-raw.js` 按画像 ClientHello 探测握手成功与否
- [x] 单测：画像数据结构完整性（每个画像字段齐全）

### Task 7: 证书兼容性推断 `checks/cert-compat.js`

- [x] 纯函数 `inferCompatibility({rootCA, sigAlg, keyBits})` → 各平台（Android/iOS/macOS/Windows/主流浏览器/Java）兼容性推断 + 依据
- [x] 单测覆盖常见根 CA（如 ISRG Root X1）与弱签名算法（SHA1）两种典型输入

### Task 8: i18n zh/en 补充

- [x] 补充七个新区块的标题/字段标签/未实现提示文案，zh/en 同步

## 并行组 3（集成，依赖组 1-2）

### Task 9: 聚合 + 前端渲染

- [x] `https-inspector-service.js` 增加七个新 check 的并行调用（`Promise.allSettled` 局部降级）
- [x] `HttpsInspector.tsx` 新增七个区块的卡片渲染，复用现有 `ModuleCard`/`Row`/`StatusBadge` 模式
- [x] Commit

## 并行组 4（验收）

### Task 10: 质量关卡 + 真实域名冒烟

- [x] `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [x] 对 www.microsoft.com 等真实站点跑一次，确认新区块均返回且 Heartbleed 检测不泄露任何内存内容到日志或响应体
