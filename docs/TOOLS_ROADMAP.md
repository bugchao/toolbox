# 工具规划与落位一览

本文档是**唯一权威**的「已开发 / 待开发 / 调研中」工具清单。后续规划、调研结果、排期都写在这里，避免重复开发、便于 AI/人 统一查看。

---

## 一、分类目录（固定，后续规划按此填写）

| 分类 ID | 分类名称     | 说明 |
|--------|--------------|------|
| `utils` | 实用工具     | 日常效率：图片/文档/表格/格式转换、生成器等 |
| `dev`   | 研发工具     | 开发调试：编解码、正则、时间戳、哈希、代码格式化等 |
| `query` | 查询工具     | 信息查询：邮编、天气、IP、颜色等 |
| `news`  | 资讯工具     | 资讯聚合、热点等 |
| `ai`    | AI 工具      | 依赖 AI 能力：会议纪要、文案、设计、PPT 等 |
| `network` | 网络与基础设施 | DNS/IP/子网/DHCP/IPAM/GSLB/运维/安全诊断等，见「三、后续计划：网络工具集」 |

新增规划时，**必须**指定上述其一作为「分类」。

---

## 二、已开发工具（代码落位）

以下工具已上线，**不要再重复立项**。新增需求请在「三、待开发/调研」中登记。

### 实用工具（17）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 二维码生成 | `/qrcode/generate` | `tools/tool-qrcode` → QrCodeGenerator |
| 二维码解析 | `/qrcode/read` | `tools/tool-qrcode` → QrCodeReader |
| 二维码美化 | `/qrcode/beautifier` | `tools/tool-qrcode` → QrCodeBeautifier |
| 图片压缩/格式转换 | `/image-compressor` | `apps/web/src/pages/ImageCompressor.tsx` |
| 图片去背景 | `/image-background-remover` | `apps/web/src/pages/ImageBackgroundRemover.tsx` |
| Markdown 转 HTML/公众号 | `/markdown` | `apps/web/src/pages/MarkdownConverter.tsx` |
| BMI 健康计算器 | `/bmi` | `apps/web/src/pages/BMICalculator.tsx` |
| 单位换算器 | `/unit-converter` | `apps/web/src/pages/UnitConverter.tsx` |
| PDF 工具集 | `/pdf-tools` | `tools/tool-pdf` → PdfTools |
| CSV/Excel 在线编辑器 | `/sheet-editor` | `apps/web/src/pages/SheetEditor.tsx` |
| 短链接生成器 | `/short-link` | `apps/web/src/pages/ShortLinkGenerator.tsx` |
| 简历生成器 | `/resume-generator` | `tools/tool-resume` → ResumeGenerator |
| AI 配色生成器 | `/color-generator` | `apps/web/src/pages/ColorGenerator.tsx` |
| 表情包生成器 | `/meme-generator` | `apps/web/src/pages/MemeGenerator.tsx` |
| AI 文案生成器 | `/copywriting-generator` | `apps/web/src/pages/CopywritingGenerator.tsx` |
| 电子木鱼 | `/wooden-fish` | `apps/web/src/pages/ElectronicWoodenFish.tsx` |
| 人生进度条 | `/life-progress` | `apps/web/src/pages/LifeProgressBar.tsx` |

### 研发工具（12）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| JSON 格式化/校验 | `/json` | `apps/web/src/pages/JsonFormatter.tsx` |
| JSON/YAML/XML 格式转换器 | `/format-converter` | `apps/web/src/pages/FormatConverter.tsx` |
| Base64 编解码 | `/base64` | `apps/web/src/pages/Base64.tsx` |
| 时间戳转换 | `/timestamp` | `apps/web/src/pages/Timestamp.tsx` |
| URL 编解码 | `/url` | `apps/web/src/pages/UrlEncoder.tsx` |
| 正则表达式测试 | `/regex` | `apps/web/src/pages/RegexTester.tsx` |
| Cron 表达式生成器 | `/cron` | `apps/web/src/pages/CronGenerator.tsx` |
| 随机密码生成器 | `/password` | `apps/web/src/pages/PasswordGenerator.tsx` |
| 哈希计算 | `/hash` | `apps/web/src/pages/HashGenerator.tsx` |
| 代码美化 | `/code` | `apps/web/src/pages/CodeFormatter.tsx` |
| UUID 生成器 | `/uuid` | `apps/web/src/pages/UuidGenerator.tsx` |
| 文本对比 | `/text-comparator` | `apps/web/src/pages/TextComparator.tsx` |

### 查询工具（4）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 邮政编码查询 | `/zipcode` | `apps/web/src/pages/ZipCode.tsx` |
| 天气查询 | `/weather` | `apps/web/src/pages/Weather.tsx` |
| IP 地址查询 | `/ip-query` | `apps/web/src/pages/IpQuery.tsx` |
| 颜色拾取/调色板 | `/color-picker` | `apps/web/src/pages/ColorPicker.tsx` |

### AI 工具（3）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| AI 会议纪要生成器 | `/meeting-minutes` | `apps/web/src/pages/MeetingMinutes.tsx` |
| AI UI 设计生成器 | `/ui-generator` | `apps/web/src/pages/UIGenerator.tsx` |
| AI PPT 生成器 | `/ppt-generator` | `tools/tool-ppt-generator` → PptGenerator |

### 网络工具（56）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| DNS 查询（A/AAAA/MX/TXT/CNAME/NS/SOA） | `/dns-query` | `apps/web/src/pages/DnsQuery.tsx` |
| IP 地址查询 | `/ip-query` | `tools/tool-ip-query` → IpQuery |
| IP ASN 查询 | `/ip-asn` | `tools/tool-ip-asn` → IpAsn |
| DNS Trace 递归追踪 | `/dns-trace` | `tools/tool-dns-trace` → DnsTrace |
| DNS 传播检测 | `/dns-propagation` | `tools/tool-dns-propagation` → DnsPropagation |
| 全球 DNS 解析检测 | `/dns-global-check` | `tools/tool-dns-global-check` → DnsGlobalCheck |
| DNSSEC 检测 | `/dnssec-check` | `tools/tool-dnssec-check` → DnssecCheck |
| DNS 服务器性能测试 | `/dns-performance` | `tools/tool-dns-performance` → DnsPerformance |
| DNS TTL 查看工具 | `/dns-ttl` | `tools/tool-dns-ttl` → DnsTtl |
| NS 服务器查询 | `/dns-ns` | `tools/tool-dns-ns` → DnsNs |
| CNAME 链检测 | `/dns-cname-chain` | `tools/tool-dns-cname-chain` → DnsCnameChain |
| 域名 NXDOMAIN 检测 | `/dns-nxdomain` | `tools/tool-dns-nxdomain` → DnsNxdomain |
| MX 记录检测 | `/domain-mx` | `tools/tool-domain-mx` → DomainMx |
| TXT 记录解析 | `/domain-txt` | `tools/tool-domain-txt` → DomainTxt |
| SPF 记录解析 | `/domain-spf` | `tools/tool-domain-suite` → DomainSpf |
| DKIM 验证工具 | `/domain-dkim` | `tools/tool-domain-suite` → DomainDkim |
| DMARC 检测 | `/domain-dmarc` | `tools/tool-domain-suite` → DomainDmarc |
| 域名 TTL 优化建议 | `/domain-ttl-advice` | `tools/tool-domain-suite` → DomainTtlAdvice |
| 域名 NS 配置检查 | `/domain-ns-check` | `tools/tool-domain-suite` → DomainNsCheck |
| 子域名扫描 | `/domain-subdomain-scan` | `tools/tool-domain-suite` → DomainSubdomainScan |
| Wildcard 解析检测 | `/domain-wildcard` | `tools/tool-domain-suite` → DomainWildcard |
| 域名健康评分 | `/domain-health-score` | `tools/tool-domain-suite` → DomainHealthScore |
| IP 地理位置查询 | `/ip-geo` | `tools/tool-ip-ops-suite` → IpGeo |
| IP 反向解析（PTR） | `/ip-ptr` | `tools/tool-ip-ops-suite` → IpPtr |
| IPv4 转 IPv6 | `/ip-v4-to-v6` | `tools/tool-ip-ops-suite` → IpV4ToV6 |
| IP Binary/Hex 转换 | `/ip-binary-hex` | `tools/tool-ip-ops-suite` → IpBinaryHex |
| IP 地址分类检测 | `/ip-class` | `tools/tool-ip-ops-suite` → IpClass |
| 公网 IP 查询 | `/ip-public` | `tools/tool-ip-ops-suite` → IpPublic |
| IP 是否 CDN | `/ip-cdn-check` | `tools/tool-ip-ops-suite` → IpCdnCheck |
| IP 黑名单检测 | `/ip-blacklist` | `tools/tool-ip-ops-suite` → IpBlacklist |
| DNS SOA 记录解析 | `/dns-soa` | `tools/tool-dns-soa` → DnsSoa |
| DNS 解析失败诊断 | `/dns-diagnose` | `tools/tool-dns-diagnose` → DnsDiagnose |
| DNS 污染检测 | `/dns-pollution-check` | `tools/tool-dns-pollution-check` → DnsPollutionCheck |
| DNS 劫持检测 | `/dns-hijack-check` | `tools/tool-dns-hijack-check` → DnsHijackCheck |
| DNS 缓存检测 | `/dns-cache-check` | `tools/tool-dns-cache-check` → DnsCacheCheck |
| DNS 循环解析检测 | `/dns-loop-check` | `tools/tool-dns-loop-check` → DnsLoopCheck |
| IP 风险评分 | `/security-ip-score` | `tools/tool-security-suite` → SecurityIpScore |
| 域名黑名单检测 | `/security-domain-blacklist` | `tools/tool-security-suite` → SecurityDomainBlacklist |
| 端口安全扫描 | `/security-port-scan` | `tools/tool-security-suite` → SecurityPortScan |
| DNS 配置漏洞检测 | `/security-dns-vuln` | `tools/tool-security-suite` → SecurityDnsVuln |
| 网络安全报告生成 | `/security-report-gen` | `tools/tool-security-suite` → SecurityReportGen |
| IP 地址规划工具 | `/ipam-plan` | `tools/tool-ipam-suite` → IpamPlan |
| IP 地址库存管理 | `/ipam-inventory` | `tools/tool-ipam-suite` → IpamInventory |
| IP 使用率分析 | `/ipam-usage` | `tools/tool-ipam-suite` → IpamUsage |
| 地址池冲突检测 | `/ipam-conflict` | `tools/tool-ipam-suite` → IpamConflict |
| IP 地址分配模拟 | `/ipam-allocation-sim` | `tools/tool-ipam-suite` → IpamAllocationSim |
| CIDR 计算器 | `/cidr-calculator` | `tools/tool-subnet-suite` → CidrCalculator |
| 子网划分工具 | `/subnet-divide` | `tools/tool-subnet-suite` → SubnetDivide |
| 网络地址计算 | `/subnet-network-addr` | `tools/tool-subnet-suite` → SubnetNetworkAddr |
| 广播地址计算 | `/subnet-broadcast` | `tools/tool-subnet-suite` → SubnetBroadcast |
| 子网掩码转换 | `/subnet-mask` | `tools/tool-subnet-suite` → SubnetMask |
| IP 范围计算 | `/ip-range` | `tools/tool-subnet-suite` → IpRange |
| 子网容量计算 | `/subnet-capacity` | `tools/tool-subnet-suite` → SubnetCapacity |
| IPv6 CIDR 计算 | `/ipv6-cidr` | `tools/tool-subnet-suite` → Ipv6Cidr |
| VLSM 子网规划 | `/vlsm` | `tools/tool-subnet-suite` → Vlsm |
| 网络规划生成器 | `/network-planner` | `tools/tool-subnet-suite` → NetworkPlanner |
| HTTP Header 检测 | `/http-headers` | `tools/tool-http-headers` → HttpHeaders |
| SSL 证书检测 | `/ssl-cert` | `tools/tool-ssl-cert` → SslCert |
| HTTP 状态检测 | `/http-status` | `tools/tool-http-status` → HttpStatus |
| TCP 端口检测 | `/tcp-port-check` | `tools/tool-tcp-port` → TcpPortCheck |
| Ping 测试 | `/ping` | `tools/tool-ping` → Ping |
| DNS 延迟分析 | `/dns-latency` | `tools/tool-dns-latency` → DnsLatency |
| 权威 DNS 检测 | `/dns-authoritative` | `tools/tool-dns-authoritative` → DnsAuthoritative |
| DNS 递归服务器检测 | `/dns-recursive` | `tools/tool-dns-recursive` → DnsRecursive |
| DNS 解析路径可视化 | `/dns-path-viz` | `tools/tool-dns-path-viz` → DnsPathViz |
| DNS 隧道检测 | `/dns-tunnel` | `tools/tool-dns-tunnel` → DnsTunnel |
| DHCP 地址池计算器 | `/dhcp-pool-calc` | `tools/tool-dhcp-pool-calc` → DhcpPoolCalc |
| DHCP Option 查询 | `/dhcp-option` | `tools/tool-dhcp-option` → DhcpOption |
| DHCP MAC 绑定生成 | `/dhcp-mac-binding` | `tools/tool-dhcp-mac-binding` → DhcpMacBinding |
| DHCP 配置生成器 | `/dhcp-config-gen` | `tools/tool-dhcp-config-gen` → DhcpConfigGen |
| Traceroute 路由追踪 | `/traceroute` | `tools/tool-traceroute` → Traceroute |
| DHCP 地址利用率分析 | `/dhcp-utilization` | `tools/tool-dhcp-utilization` → DhcpUtilization |
| DHCP 地址冲突检测 | `/dhcp-conflict` | `tools/tool-dhcp-conflict` → DhcpConflict |
| GSLB 权重分配计算器 | `/gslb-weight-calc` | `tools/tool-gslb-weight-calc` → GslbWeightCalc |
| Web 服务可用性检测 | `/web-availability` | `tools/tool-web-availability` → WebAvailability |
| 域名安全评分 | `/security-domain-score` | `tools/tool-security-domain-score` → SecurityDomainScore |
| GSLB 故障切换模拟 | `/gslb-failover-sim` | `tools/tool-gslb-failover-sim` → GslbFailoverSim |
| GEO 解析模拟 | `/gslb-geo-sim` | `tools/tool-gslb-geo-sim` → GslbGeoSim |
| DNSSEC 签名验证 | `/security-dnssec-verify` | `tools/tool-security-dnssec-verify` → SecurityDnssecVerify |
| DNS DDoS 风险检测 | `/security-dns-ddos` | `tools/tool-security-dns-ddos` → SecurityDnsDdos |
| CDN 检测 | `/cdn-check` | `tools/tool-cdn-check` → CdnCheck |
| DHCP Discover 模拟 | `/dhcp-discover-sim` | `tools/tool-dhcp-discover-sim` → DhcpDiscoverSim |
| 子网利用率统计 | `/ipam-subnet-util` | `tools/tool-ipam-subnet-util` → IpamSubnetUtil |
| GSLB 健康检查模拟 | `/gslb-health-sim` | `tools/tool-gslb-health-sim` → GslbHealthSim |
| GSLB 延迟调度模拟 | `/gslb-latency-sim` | `tools/tool-gslb-latency-sim` → GslbLatencySim |
| 服务器延迟测试 | `/server-latency` | `tools/tool-server-latency` → ServerLatency |

### 资讯工具（1）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 每日热点新闻 | `/news` | `apps/web/src/pages/HotNews.tsx` |

---

## 三、待开发 / 调研工具

**新增规划时**：在本节按分类添加一行，填写「工具名称、分类、路由（建议）、状态、优先级、备注」。  
**上线后**：把该行移到「二、已开发」对应分类表，并补上「代码位置」和路由。

### 当前待办（第二阶段）

| 工具名称 | 分类 | 建议路径 | 状态 | 优先级 | 备注 |
|----------|------|----------|------|--------|------|

| DHCP Lease 分析 | network | `/dhcp-lease-analysis` | 待开发 | P2 | Lease 分析 |
| DHCP 日志分析 | network | `/dhcp-log-analysis` | 待开发 | P2 | 日志解析 |
| DHCP 网络扫描 | network | `/dhcp-scan` | 待开发 | P2 | 发现 DHCP 服务 |
| IP 地址回收分析 | network | `/ipam-reclaim` | 待开发 | P2 | 可回收分析 |
| IP 地址变更记录 | network | `/ipam-changelog` | 待开发 | P2 | 变更记录 |
| IP 地址扫描 | network | `/ipam-scan` | 待开发 | P2 | 存活/占用扫描 |
| IP 资源可视化 | network | `/ipam-visualize` | 待开发 | P2 | 拓扑/树状图 |
| GSLB 策略模拟 | network | `/gslb-policy-sim` | 待开发 | P2 | 策略模拟 |
| 解析命中预测 | network | `/gslb-hit-predict` | 待开发 | P2 | 命中预测 |
| 运营商解析模拟 | network | `/gslb-isp-sim` | 待开发 | P2 | 运营商线路 |
| 多节点流量预测 | network | `/gslb-traffic-predict` | 待开发 | P2 | 流量预测 |
| GSLB 规则验证 | network | `/gslb-rule-validate` | 待开发 | P2 | 规则校验 |
| API 可用性测试 | network | `/api-availability` | 待开发 | P2 | API 可用性 |
| 域名是否被劫持 | network | `/security-domain-hijack` | 待开发 | P2 | 劫持检测 |

**状态约定**：`调研中` | `待开发` | `开发中` | （上线后移入「二、已开发」）

### 后续计划（待立项 / 未命名）

以下来自 [ROADMAP.md](../ROADMAP.md)、[ARCHITECTURE.md](../ARCHITECTURE.md) 的方向性规划，**尚未有正式工具名或路由**，先记在此处作为后续计划；确定名称与路径后请挪到上方「当前待办」表格，避免遗漏。

| 方向/暂定描述 | 分类 | 建议路径（待定） | 备注 |
|---------------|------|------------------|------|
| 工具开发脚手架 | dev | 待定 | 一键生成新工具模板，提升开发效率 |
| PWA / 离线可用 | utils | 待定 | 全站或关键工具离线使用 |
| 移动端适配增强 | - | - | 响应式或独立 H5，非单点工具 |
| 工具协作功能 | utils | 待定 | 多人在线协作使用同一工具（待细化） |
| AI 助手集成 | ai | `/ai-assistant` 或待定 | 站内通用 AI 问答/辅助 |
| 企业版能力 | - | 待定 | 权限、审计、私有部署等（待细化） |
| 工具市场 / 第三方提交 | - | 待定 | 发现与安装第三方工具（平台能力） |
| 用户收藏 / 历史 / 个性化配置 | - | - | 用户系统能力，非单点工具 |

**使用方式**：确定要做成具体「工具」且命名、路径定好后，在本节删掉该行，并在上方「当前待办」表格新增一行。

---

### 后续计划：网络与 DNS 工具集（100 项，已立项）

**上述 100 项已全部立项至上方「当前待办」**，分类 `network`，状态「待开发」，优先级 P2。下表保留作分类对照，开发/上线以「当前待办」行为准。

#### 一、DNS 查询工具（10）

其中 1–3、4–7 已上线；8–10 待开发。

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | DNS 查询工具（A/AAAA/MX/TXT） | `/dns-query` | 多记录类型查询 |
| 2 | DNS Trace 递归追踪 | `/dns-trace` | 递归解析路径 |
| 3 | DNS 传播检测 | `/dns-propagation` | 全球传播状态 |
| 4 | 全球 DNS 解析检测 | `/dns-global-check` | 7 家 DoH 对比（Google/Cloudflare/Quad9/AdGuard/OpenDNS/阿里/腾讯） |
| 5 | DNSSEC 检测 | `/dnssec-check` | 签名与链校验 |
| 6 | DNS 服务器性能测试 | `/dns-performance` | DoH 响应时间/可用性，支持自定义域名与 DoH 地址 |
| 7 | DNS TTL 查看工具 | `/dns-ttl` | TTL 查询与优化建议 |
| 8 | NS 服务器查询 | `/dns-ns` | 权威 NS 列表 |
| 9 | CNAME 链检测 | `/dns-cname-chain` | CNAME 链解析 |
| 10 | DNS SOA 记录解析 | `/dns-soa` | SOA 记录查看 |

#### 二、DNS 故障排查工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | DNS 解析失败诊断 | `/dns-diagnose` | 失败原因分析 |
| 2 | DNS 污染检测 | `/dns-pollution-check` | 污染检测 |
| 3 | DNS 劫持检测 | `/dns-hijack-check` | 劫持检测 |
| 4 | DNS 缓存检测 | `/dns-cache-check` | 缓存状态 |
| 5 | DNS 循环解析检测 | `/dns-loop-check` | 循环 CNAME/NS |
| 6 | 域名 NXDOMAIN 检测 | `/dns-nxdomain` | NXDOMAIN 分析 |
| 7 | DNS 延迟分析 | `/dns-latency` | 延迟分布 |
| 8 | DNS 解析路径可视化 | `/dns-path-viz` | 路径图 |
| 9 | 权威 DNS 检测 | `/dns-authoritative` | 权威服务器检测 |
| 10 | DNS 递归服务器检测 | `/dns-recursive` | 递归服务检测 |

#### 三、域名配置工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | MX 记录检测 | `/domain-mx` | MX 解析与优先级 |
| 2 | SPF 记录解析 | `/domain-spf` | SPF 解析与校验 |
| 3 | DKIM 验证工具 | `/domain-dkim` | DKIM 验证 |
| 4 | DMARC 检测 | `/domain-dmarc` | DMARC 策略 |
| 5 | TXT 记录解析 | `/domain-txt` | TXT 查看与解析 |
| 6 | 域名 TTL 优化建议 | `/domain-ttl-advice` | TTL 建议 |
| 7 | 域名 NS 配置检查 | `/domain-ns-check` | NS 配置合理性 |
| 8 | 子域名扫描 | `/domain-subdomain-scan` | 子域发现 |
| 9 | Wildcard 解析检测 | `/domain-wildcard` | 泛解析检测 |
| 10 | 域名健康评分 | `/domain-health-score` | 综合健康分 |

#### 四、IP 地址工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | IP 地址查询 | `/ip-query` | 与现有 IP 查询可合并或扩展 |
| 2 | IP ASN 查询 | `/ip-asn` | ASN/归属 |
| 3 | IP 地理位置查询 | `/ip-geo` | 地理信息 |
| 4 | IP 反向解析（PTR） | `/ip-ptr` | PTR 记录 |
| 5 | IPv4 转 IPv6 | `/ip-v4-to-v6` | 地址转换 |
| 6 | IP Binary/Hex 转换 | `/ip-binary-hex` | 二进制/十六进制 |
| 7 | IP 地址分类检测 | `/ip-class` | 公网/私网/保留等 |
| 8 | 公网 IP 查询 | `/ip-public` | 出口 IP 等 |
| 9 | IP 是否 CDN | `/ip-cdn-check` | CDN 节点判断 |
| 10 | IP 黑名单检测 | `/ip-blacklist` | 黑名单查询 |

#### 五、子网 / CIDR 工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | CIDR 计算器 | `/cidr-calculator` | CIDR 与范围 |
| 2 | 子网划分工具 | `/subnet-divide` | 子网划分 |
| 3 | 网络地址计算 | `/subnet-network-addr` | 网络号 |
| 4 | 广播地址计算 | `/subnet-broadcast` | 广播地址 |
| 5 | 子网掩码转换 | `/subnet-mask` | 掩码换算 |
| 6 | IP 范围计算 | `/ip-range` | 起止 IP |
| 7 | 子网容量计算 | `/subnet-capacity` | 可用 IP 数 |
| 8 | IPv6 CIDR 计算 | `/ipv6-cidr` | IPv6 CIDR |
| 9 | VLSM 子网规划 | `/vlsm` | VLSM 规划 |
| 10 | 网络规划生成器 | `/network-planner` | 规划输出 |

#### 六、DHCP 工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | DHCP 地址池计算器 | `/dhcp-pool-calc` | 地址池容量等 |
| 2 | DHCP 配置生成器 | `/dhcp-config-gen` | 配置生成 |
| 3 | DHCP Option 查询 | `/dhcp-option` | Option 含义与用法 |
| 4 | DHCP Lease 分析 | `/dhcp-lease-analysis` | Lease 分析 |
| 5 | DHCP MAC 绑定生成 | `/dhcp-mac-binding` | 静态绑定生成 |
| 6 | DHCP 地址冲突检测 | `/dhcp-conflict` | 冲突检测 |
| 7 | DHCP 日志分析 | `/dhcp-log-analysis` | 日志解析 |
| 8 | DHCP Discover 模拟 | `/dhcp-discover-sim` | 抓包/模拟 |
| 9 | DHCP 网络扫描 | `/dhcp-scan` | 发现 DHCP 服务 |
| 10 | DHCP 地址利用率分析 | `/dhcp-utilization` | 使用率统计 |

#### 七、IPAM 工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | IP 地址规划工具 | `/ipam-plan` | 规划与分配 |
| 2 | IP 地址库存管理 | `/ipam-inventory` | 库存视图 |
| 3 | IP 使用率分析 | `/ipam-usage` | 使用率 |
| 4 | 地址池冲突检测 | `/ipam-conflict` | 重叠检测 |
| 5 | IP 地址分配模拟 | `/ipam-allocation-sim` | 分配模拟 |
| 6 | IP 地址回收分析 | `/ipam-reclaim` | 可回收分析 |
| 7 | 子网利用率统计 | `/ipam-subnet-util` | 子网利用率 |
| 8 | IP 地址变更记录 | `/ipam-changelog` | 变更记录 |
| 9 | IP 地址扫描 | `/ipam-scan` | 存活/占用扫描 |
| 10 | IP 资源可视化 | `/ipam-visualize` | 拓扑/树状图 |

#### 八、GSLB 工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | GSLB 策略模拟 | `/gslb-policy-sim` | 策略模拟 |
| 2 | 解析命中预测 | `/gslb-hit-predict` | 命中预测 |
| 3 | 权重分配计算器 | `/gslb-weight-calc` | 权重计算 |
| 4 | 健康检查模拟 | `/gslb-health-sim` | 健康检查模拟 |
| 5 | 故障切换模拟 | `/gslb-failover-sim` | 故障切换 |
| 6 | GEO 解析模拟 | `/gslb-geo-sim` | 地域解析 |
| 7 | 运营商解析模拟 | `/gslb-isp-sim` | 运营商线路 |
| 8 | 延迟调度模拟 | `/gslb-latency-sim` | 延迟调度 |
| 9 | 多节点流量预测 | `/gslb-traffic-predict` | 流量预测 |
| 10 | GSLB 规则验证 | `/gslb-rule-validate` | 规则校验 |

#### 九、网络运维工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | Ping 测试 | `/ping` | ICMP Ping |
| 2 | Traceroute | `/traceroute` | 路由追踪 |
| 3 | TCP 端口检测 | `/tcp-port-check` | 端口连通性 |
| 4 | HTTP Header 检测 | `/http-headers` | 响应头查看 |
| 5 | SSL 证书检测 | `/ssl-cert` | 证书链与有效期 |
| 6 | CDN 检测 | `/cdn-check` | CDN 识别 |
| 7 | HTTP 状态检测 | `/http-status` | 状态码与可用性 |
| 8 | Web 服务可用性检测 | `/web-availability` | 可用性监控 |
| 9 | 服务器延迟测试 | `/server-latency` | 延迟测试 |
| 10 | API 可用性测试 | `/api-availability` | API 可用性 |

#### 十、安全与诊断工具（10）

| 序号 | 工具名称 | 建议路径（待定） | 备注 |
|------|----------|------------------|------|
| 1 | 域名是否被劫持 | `/security-domain-hijack` | 劫持检测 |
| 2 | DNS 隧道检测 | `/security-dns-tunnel` | 隧道检测 |
| 3 | DNS DDoS 风险检测 | `/security-dns-ddos` | 风险评估 |
| 4 | DNSSEC 签名验证 | `/security-dnssec-verify` | 签名验证 |
| 5 | 域名安全评分 | `/security-domain-score` | 安全评分 |
| 6 | IP 风险评分 | `/security-ip-score` | IP 风险分 |
| 7 | 域名黑名单检测 | `/security-domain-blacklist` | 黑名单检测 |
| 8 | 端口安全扫描 | `/security-port-scan` | 端口扫描 |
| 9 | DNS 配置漏洞检测 | `/security-dns-vuln` | 配置漏洞 |
| 10 | 网络安全报告生成 | `/security-report-gen` | 报告生成 |

**使用方式**：从本列表中选定工具后，在「当前待办」表格新增一行（工具名称、分类 `network`、建议路径、状态、优先级、备注），本列表中该条可保留作对照或删除，实现上线后按规范更新「二、已开发工具」。

---

## 四、后续规划怎么发 / 怎么更新

1. **新增「待开发」或「调研」工具**  
   在 **「三、待开发/调研工具」** 的**当前待办表格**中加一行，填齐：工具名称、分类（必填）、建议路径、状态、优先级、备注（可写调研结论或需求要点）。  
   **仅有方向、尚未命名的想法**：先记入「三、后续计划（待立项/未命名）」表格，确定名称和路径后再挪到当前待办。

2. **避免重复**  
   开发前先查 **「二、已开发工具」** 和 **「三、待开发/调研工具」**，确认没有同名或同功能工具再立项。

3. **上线后**  
   - 在「二、已开发」对应分类表里增加一行（路由 + 代码位置）。  
   - 在「三、待开发/调研工具」里删除该行。  
   - 同步更新 [TOOLS_LIST.md](../TOOLS_LIST.md) 的已上线表格与统计，以及 [apps/web 的 Layout/Home](../apps/web/src/components/Layout.tsx)、[App 路由](../apps/web/src/App.tsx)。

4. **给 AI 的说明**  
   后续只需说「按 TOOLS_ROADMAP 规划」或「在 TOOLS_ROADMAP 里加一个待开发：xxx」，即表示以本文档为准；新增/调整规划都改 **docs/TOOLS_ROADMAP.md**，已开发清单也以本文档「二」为准，避免重复开发。

---

## 五、文档索引

| 文档 | 用途 |
|------|------|
| 本文档 `docs/TOOLS_ROADMAP.md` | 已开发落位 + 待开发/调研清单 + 分类与更新规范 |
| [docs/TOOL_LANDING.md](TOOL_LANDING.md) | 工具规划落地目录、Monorepo 规范、独立开发/部署、create:tool |
| [docs/ROADMAP_CONVENTION.md](ROADMAP_CONVENTION.md) | 规划约定（怎么提、怎么填、怎么给 AI） |
| [TOOLS_LIST.md](../TOOLS_LIST.md) | 对外/产品向工具清单与统计（与本文档同步） |
