# https-inspector

## ADDED Requirements

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
