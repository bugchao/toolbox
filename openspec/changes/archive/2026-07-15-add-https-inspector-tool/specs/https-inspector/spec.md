# https-inspector

## ADDED Requirements

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
