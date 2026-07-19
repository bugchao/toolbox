# https-inspector Specification

## Purpose
TBD - created by archiving change add-https-inspector-tool. Update Purpose after archive.
## Requirements
### Requirement: 综合评级报告

工具 SHALL 接受一个域名（可选端口，默认 443），一次检测返回一份聚合六大模块的结构化报告，并给出 A+~T 区间的综合评级；任一模块检测失败 SHALL 局部降级（标注该模块错误），不影响其他模块与报告返回。

#### Scenario: 检测公网 HTTPS 站点

- **WHEN** 用户输入一个可访问的 HTTPS 域名并点击检测
- **THEN** 报告显示顶部综合评级徽章，以及 HTTPS 评级、IPv6、CDN、邮件服务器、国密、后量子六个模块的结果卡片

#### Scenario: 单模块失败不影响整体

- **WHEN** 某个模块（如邮件服务器）检测超时或无数据
- **THEN** 该模块卡片显示错误/无数据提示，其余模块正常展示，报告整体仍返回

### Requirement: HTTPS 评级检测

工具 SHALL 通过 TLS 握手获取证书链、协商到的协议版本与加密套件，并分别探测 TLS 1.0/1.1/1.2/1.3 各版本的支持情况，据此按规则计算综合评级并列出扣分原因与修复建议。

#### Scenario: 展示协议与套件

- **WHEN** 站点支持 TLS 1.3 与 TLS 1.2、不支持 1.0/1.1
- **THEN** 报告标注 1.3/1.2 为支持、1.1/1.0 为不支持，并显示协商到的加密套件与证书链

#### Scenario: 低版本协议扣分

- **WHEN** 站点仍支持 TLS 1.0 或 1.1
- **THEN** 评级下调并在修复建议中提示关闭老旧协议

### Requirement: IPv6 检测

工具 SHALL 查询域名 AAAA 记录；若存在 SHALL 尝试对 IPv6 地址做 HTTPS 握手，判断 IPv6 下 HTTPS 是否可用；无 AAAA 记录时明确标注未部署 IPv6。

#### Scenario: 已部署 IPv6

- **WHEN** 域名有 AAAA 记录且 IPv6 上 HTTPS 握手成功
- **THEN** 报告标注 IPv6 已部署且可用，并列出 IPv6 地址

#### Scenario: 未部署 IPv6

- **WHEN** 域名无 AAAA 记录
- **THEN** 报告标注未部署 IPv6

### Requirement: CDN 检测

工具 SHALL 解析域名的 CNAME 链与出口 IP，并对照内置 CDN 特征库判断是否使用 CDN 及可能的厂商；SHALL 在报告中注明结论基于单一探测点。

#### Scenario: 命中已知 CDN

- **WHEN** 域名 CNAME 或出口 IP 命中特征库中的某 CDN 厂商
- **THEN** 报告标注使用了 CDN 并给出厂商名与判定依据

#### Scenario: 未命中

- **WHEN** 未匹配任何已知 CDN 特征
- **THEN** 报告标注未检测到 CDN（不代表一定未使用）

### Requirement: 邮件服务器检测

工具 SHALL 查询域名 MX 记录，对首选 MX 主机发起 SMTP 连接并尝试 STARTTLS，读取邮件服务器证书与 TLS 支持情况；无 MX 记录时标注未配置邮件服务。

#### Scenario: 邮件服务器支持 STARTTLS

- **WHEN** 首选 MX 支持 STARTTLS
- **THEN** 报告显示 MX 主机、STARTTLS 可用及其证书主体/有效期

#### Scenario: 无 MX 记录

- **WHEN** 域名无 MX 记录
- **THEN** 报告标注该域名未配置邮件服务器

### Requirement: 国密 HTTPS 检测

工具 SHALL 通过手写原始 TLS/TLCP ClientHello（携带 SM2 系列国密加密套件）并解析 ServerHello，判断服务端是否支持国密（TLCP/GM）HTTPS，输出「支持/不支持」结论及依据（服务端选中的套件）。

#### Scenario: 支持国密

- **WHEN** 服务端在 ServerHello 中选中某个国密加密套件
- **THEN** 报告标注支持国密 HTTPS 并显示选中的套件

#### Scenario: 不支持国密

- **WHEN** 服务端拒绝握手或未选中任何国密套件
- **THEN** 报告标注不支持国密 HTTPS

### Requirement: 后量子 HTTPS 检测

工具 SHALL 通过手写 TLS 1.3 ClientHello（在 supported_groups/key_share 中携带 X25519MLKEM768 等混合后量子组）并解析 ServerHello，判断服务端是否支持后量子密钥交换，输出「支持/不支持」结论及依据（服务端选中的组）。

#### Scenario: 支持后量子

- **WHEN** 服务端在 ServerHello 中选中后量子混合组
- **THEN** 报告标注支持后量子 HTTPS 并显示选中的组

#### Scenario: 不支持后量子

- **WHEN** 服务端未选中后量子组或回退到传统组
- **THEN** 报告标注不支持后量子 HTTPS

### Requirement: 概述区块

工具 SHALL 在报告顶部展示概述区块，包含综合评级、出口 IP 与端口、IP 地理位置（尽力而为，失败时仅显示 IP）、检测时间。

#### Scenario: 展示概述

- **WHEN** 检测完成
- **THEN** 报告顶部显示评级、`IP:端口`、地理位置（国家/地区）与检测时间戳

#### Scenario: IP 地理位置查询失败

- **WHEN** 地理位置查询服务不可用
- **THEN** 概述区块仍显示 IP、端口、评级与时间，地理位置字段留空且不报错阻塞整体报告

### Requirement: 证书信息扩展字段

工具 SHALL 在证书信息中补充签名算法、公钥算法与位数、证书品牌（根 CA）、CT 合规（SCT 扩展是否存在）、OCSP 装订状态；这些字段通过调用系统 `openssl` 二进制解析证书文本获得，`openssl` 不可用时该子区块局部降级并说明原因，不影响证书信息其余基础字段（主体/颁发者/有效期等）。

#### Scenario: 展示扩展证书字段

- **WHEN** 系统存在 `openssl` 二进制且证书可正常获取
- **THEN** 证书信息区块显示签名算法、公钥算法与位数、证书品牌、CT 合规状态、OCSP 装订状态

#### Scenario: openssl 缺失时降级

- **WHEN** 系统未安装 `openssl` 二进制
- **THEN** 扩展字段标注"不可用"，基础证书信息（主体/颁发者/有效期/指纹）仍正常展示

### Requirement: 协议与加密套件枚举

工具 SHALL 对 TLS 1.0~1.3 每个协议版本枚举服务端实际支持的加密套件列表。

#### Scenario: 展示各版本支持的套件

- **WHEN** 服务端支持 TLS 1.2 与 TLS 1.3
- **THEN** 报告分别列出这两个版本下服务端接受的加密套件名称列表

### Requirement: 协议详情

工具 SHALL 检测并展示：HTTP/2（ALPN 协商）、HSTS（响应头）、OCSP 装订、正向保密（协商套件是否为 ECDHE/DHE）、CAA 记录。

#### Scenario: 展示协议详情

- **WHEN** 检测完成
- **THEN** 报告显示 HTTP/2、HSTS、OCSP 装订、正向保密、CAA 五项的支持情况

### Requirement: SSL 漏洞检测

工具 SHALL 通过主动探测检测 DROWN（SSLv2）、POODLE（SSLv3+CBC）、FREAK（EXPORT 弱套件）、Heartbleed（心跳扩展畸形请求）四项漏洞，探测方式为只读、非破坏性、不发送超出判定所需的最小请求量。Heartbleed 检测 SHALL NOT 在报告中展示或持久化服务端实际泄露的内存字节内容，只允许输出布尔结论与泄露字节数。CCS 注入与 ROBOT 因可靠探测成本过高、易生成误报，工具 SHALL 明确标注为"未实现"而非返回猜测结论。

#### Scenario: 检测到 Heartbleed 风险

- **WHEN** 服务端对畸形心跳请求返回超出请求负载长度的数据
- **THEN** 报告标注该站点存在 Heartbleed 风险，并显示泄露字节数，但不显示任何实际内存内容

#### Scenario: 未发现已探测漏洞

- **WHEN** 四项主动探测均未触发漏洞特征
- **THEN** 报告对应项标注"未发现风险"

#### Scenario: 明确标注未实现的检测项

- **WHEN** 用户查看 SSL 漏洞区块
- **THEN** CCS 注入与 ROBOT 两项显示"暂未支持精确探测"，不返回误导性的是/否结论

### Requirement: 客户端握手模拟

工具 SHALL 内置至少 12 个常见客户端画像（浏览器/操作系统/运行时组合），基于各画像的协议与套件优先级发送对应 ClientHello，判定该画像下握手是否成功；结果 SHALL 标注为近似模拟，非真实客户端库回放。

#### Scenario: 展示客户端兼容性列表

- **WHEN** 检测完成
- **THEN** 报告列出各内置客户端画像的握手成功/失败结果

### Requirement: 证书兼容性测试

工具 SHALL 基于证书的根 CA、签名算法与公钥强度，对照内置的平台信任规则推断证书在主流平台（Android/iOS/macOS/Windows/主流浏览器/Java）上的兼容性；结果 SHALL 标注为推断结果，非真实多平台验证。

#### Scenario: 展示证书兼容性推断

- **WHEN** 检测完成且证书信息可用
- **THEN** 报告列出各平台的兼容性推断结果（可信/不可信/未知）及推断依据

