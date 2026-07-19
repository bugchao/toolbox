# Change: 补全 https-inspector 报告区块（对齐 myssl.com 单站报告页）

## Why

当前 `https-inspector` 只有六个粗粒度模块卡片，用户反馈"检测信息较少需要补充"，并给出 myssl.com 单站报告页（`myssl.com/<domain>`）作为参考。该报告页的结构是：**概述、证书信息、协议与套件、协议详情、SSL漏洞、客户端握手模拟、证书兼容性测试**。本变更在现有六模块基础上，新增/加厚这些区块，不改变现有模块的语义。

## What Changes

在 `tools/tool-https-inspector/server/checks/https.js` 拆分 & 新增以下能力（新增文件 `checks/vulnerabilities.js`、`checks/handshake-sim.js`、`checks/cert-compat.js`，扩展 `checks/https.js`、`tls-raw.js`）：

1. **概述**：综合评级 + ATS/PCI 合规占位（沿用现有 `computeGrade` 的扣分口径，不新造合规体系）+ 出口 IP:端口 + IP 地理位置（复用 `tool-ip-query` 已用的 `ip-api.com` 免费接口，失败时只显示 IP，不阻塞报告）+ 检测时间。
2. **证书信息扩展**：签名算法、公钥算法与位数、证书品牌（根 CA 名）、CT（Certificate Transparency，检测 SCT 扩展是否存在）、吊销状态占位（OCSP 请求结果）、OCSP 装订状态。签名算法/公钥信息通过 `openssl x509 -text`（复用 `tool-cert-suite-shared` 已验证的 `execFile openssl` 模式，`OPENSSL_BIN` 环境变量可覆盖），若系统无 `openssl` 二进制则该子区块局部降级、不影响其他字段。**同时给生产 Dockerfile 补 `apk add openssl`**，因为 `node:24-alpine` 默认不带 `openssl` CLI，这也修了 `tool-cert-suite-shared` 现有的潜在生产环境缺口。
3. **协议与套件枚举**：对 TLS1.0~1.3 每个版本，用 Node `tls.connect({minVersion,maxVersion,ciphers})` 逐个套件名单探测服务端是否接受，产出该版本下服务端实际支持的加密套件列表（复用 Node 标准库，非原始报文，不新增复杂度）。
4. **协议详情**：HTTP/2（ALPN 协商结果）、HSTS（响应头 `Strict-Transport-Security`）、OCSP 装订（`tls.connect({requestOCSP:true})` 监听 `OCSPResponse` 事件）、正向保密（协商套件是否含 ECDHE/DHE，复用已有判断）、CAA（`dns.resolveCaa`，Node 标准库自带）。
5. **SSL 漏洞（主动探测，只读不破坏）**：
   - **DROWN**：发送 SSLv2 格式 ClientHello（原始报文，扩展 `tls-raw.js`），服务端若回应 SSLv2 ServerHello 则判定存在风险。
   - **POODLE**：发送 record version 0x0300（SSLv3）+ CBC 套件的 ClientHello，握手成功则判定存在风险。
   - **FREAK**：ClientHello 只带 EXPORT 级弱 RSA 套件，服务端选中则判定存在风险。
   - **Heartbleed**：ClientHello 携带 heartbeat 扩展(0x0f)，收到 ServerHello 后发送畸形 Heartbeat 请求（声明长度大于实际负载）。**安全设计：只统计服务端多回的字节数以判定"存在/不存在"，立即丢弃任何真实泄露的内存内容，绝不落盘或展示**——避免把检测器变成任意第三方站点的内存窃取工具。
   - **CCS 注入、ROBOT**：评估后判定可靠探测成本过高（ROBOT 需要多次畸形 RSA 密钥交换+计时/报错差异分析，CCS 注入需要精确的协议状态注入时机，两者极易产生误报），本次**不实现**，模块返回 `notSupported: true` 并注明原因，不冒充检测结果。
6. **客户端握手模拟**：内置约 15 个客户端画像（Chrome/Firefox/Safari/Edge/IE11/Java8/Android4.4~14/OpenSSL1.0.1 等），每个画像定义协议版本+套件优先级列表；用 `tls-raw.js` 按画像发送对应 ClientHello，得到"握手成功/失败"结果。**标注为近似模拟**（不是 myssl 的 50+ 真实客户端库回放，基于公开的各平台 TLS 能力矩阵）。
7. **证书兼容性测试**：基于根 CA 名称 + 签名算法 + 公钥强度，对照内置的平台信任规则（Android/iOS/macOS/Windows/主流浏览器/Java）推断兼容性，**标注为推断结果**，不是真实多平台验证。

前端 `HttpsInspector.tsx` 新增对应区块渲染；后端聚合 `https-inspector-service.js` 增加三个新 check 调用，沿用现有的"单模块失败局部降级"模式。i18n zh/en 同步补充。不引入新的 npm 依赖（`openssl` 是系统二进制，通过 `execFile` 调用，模式与 `tool-cert-suite-shared` 一致）。

## Acceptance Criteria

- 报告新增概述、协议套件枚举、协议详情、SSL漏洞（DROWN/POODLE/FREAK/Heartbleed 四项真实探测 + CCS注入/ROBOT 明确标注未实现）、客户端握手模拟（≥12 个画像）、证书兼容性推断六个区块，且证书信息区块补齐签名算法/CT/OCSP/证书品牌字段。
- Heartbleed 检测**不得**在报告中展示或记录任何真实泄露的内存字节内容，只输出布尔结论与泄露字节数。
- 任一新区块的探测失败（含 `openssl` 二进制缺失）局部降级，不影响报告整体返回与已有六模块。
- 生产 Dockerfile 安装 `openssl` CLI。
- 纯函数（协议详情判定、握手模拟画像匹配、证书兼容性推断规则、漏洞判定逻辑）有单测覆盖。
- `pnpm check:consistency`、`pnpm lint`、`pnpm test`、`pnpm -C apps/web build` 全部通过。
