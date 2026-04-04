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
| `life`    | 生活工具       | 效率习惯、财务消费、健康生活、日常工具等 |
| `travel`  | 旅游工具       | 行程规划、预算成本、导航信息、旅行实用等 |
| `learn`   | 学习工具       | 学习效率、内容处理、知识理解、编程学习、语言学习等 |

新增规划时，**必须**指定上述其一作为「分类」。

---

## 二、已开发工具（代码落位）

以下工具已上线，**不要再重复立项**。新增需求请在「三、待开发/调研」中登记。

### 实用工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 二维码生成 | `/qrcode/generate` | `tools/tool-qrcode` → QrCodeGenerator |
| 二维码解析 | `/qrcode/read` | `tools/tool-qrcode` → QrCodeReader |
| 二维码美化 | `/qrcode/beautifier` | `tools/tool-qrcode` → QrCodeBeautifier |
| 图片压缩/格式转换 | `/image-compressor` | `apps/web/src/pages/ImageCompressor.tsx` |
| 图片去背景 | `/image-background-remover` | `apps/web/src/pages/ImageBackgroundRemover.tsx` |
| 图片水印 | `/image-watermark` | `tools/tool-image-watermark` → ImageWatermark |
| 图片裁剪 | `/image-cropper` | `tools/tool-image-cropper` → ImageCropper |
| 图片旋转/翻转 | `/image-rotator` | `tools/tool-image-rotator` → ImageRotator |
| 图片滤镜 | `/image-filter` | `tools/tool-image-filter` → ImageFilter |
| 图片拼接 | `/image-stitcher` | `tools/tool-image-stitcher` → ImageStitcher |
| 图片去水印 | `/image-watermark-remover` | `tools/tool-image-watermark-remover` → ImageWatermarkRemover |
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
| 翻译工作台 | `/translation-hub` | `tools/tool-translation-hub` → TranslationHub |
| 图像本地加载预览基座 | `/image-local-preview` | `tools/tool-image-local-preview` → ImageLocalPreview |

### 研发工具

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
| GraphQL Playground | `/graphql-playground` | `tools/tool-graphql-playground` → GraphQLPlayground |
| Postman Lite | `/postman-lite` | `tools/tool-postman-lite` → PostmanLite |
| Rapid Tables 计算器 | `/rapid-tables` | `tools/tool-rapid-tables` → RapidTables |
| 文本加密解密 | `/text-cipher` | `tools/tool-text-cipher` → TextCipher |
| 文本统计 | `/text-stats` | `tools/tool-text-stats` → TextStats |
| GitHub 信息读取 | `/github-info` | `tools/tool-github-info` → GithubInfo |
| GitHub 仓库分析 | `/github-repo` | `tools/tool-github-repo` → GithubRepo |
| GitHub 用户分析 | `/github-user` | `tools/tool-github-user` → GithubUser |

### 查询工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 邮政编码查询 | `/zipcode` | `apps/web/src/pages/ZipCode.tsx` |
| 天气查询 | `/weather` | `tools/tool-weather` → Weather |
| IP 地址查询 | `/ip-query` | `apps/web/src/pages/IpQuery.tsx` |
| 颜色拾取/调色板 | `/color-picker` | `apps/web/src/pages/ColorPicker.tsx` |

### AI 工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| AI 会议纪要生成器 | `/meeting-minutes` | `apps/web/src/pages/MeetingMinutes.tsx` |
| AI UI 设计生成器 | `/ui-generator` | `apps/web/src/pages/UIGenerator.tsx` |
| AI PPT 生成器 | `/ppt-generator` | `tools/tool-ppt-generator` → PptGenerator |

### 网络工具

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
| DHCP Lease 分析 | `/dhcp-lease-analysis` | `tools/tool-dhcp-lease-analysis` → DhcpLeaseAnalysis |
| IP 资源可视化 | `/ipam-visualize` | `tools/tool-ipam-visualize` → IpamVisualize |
| GSLB 策略模拟 | `/gslb-policy-sim` | `tools/tool-gslb-policy-sim` → GslbPolicySim |
| GSLB 规则验证 | `/gslb-rule-validate` | `tools/tool-gslb-rule-validate` → GslbRuleValidate |
| API 可用性测试 | `/api-availability` | `tools/tool-api-availability` → ApiAvailability |
| 运营商解析模拟 | `/gslb-isp-sim` | `tools/tool-gslb-isp-sim` → GslbIspSim |
| 多节点流量预测 | `/gslb-traffic-predict` | `tools/tool-gslb-traffic-predict` → GslbTrafficPredict |
| 解析命中预测 | `/gslb-hit-predict` | `tools/tool-gslb-hit-predict` → GslbHitPredict |
| IP 地址回收分析 | `/ipam-reclaim` | `tools/tool-ipam-reclaim` → IpamReclaim |
| 域名劫持检测 | `/security-domain-hijack` | `tools/tool-security-domain-hijack` → SecurityDomainHijack |
| DHCP 日志分析 | `/dhcp-log-analysis` | `tools/tool-dhcp-log-analysis` → DhcpLogAnalysis |
| DHCP 网络扫描 | `/dhcp-scan` | `tools/tool-dhcp-scan` → DhcpScan |
| IP 地址变更记录 | `/ipam-changelog` | `tools/tool-ipam-changelog` → IpamChangelog |
| IP 地址扫描 | `/ipam-scan` | `tools/tool-ipam-scan` → IpamScan |

### 资讯工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 每日热点新闻 | `/news` | `apps/web/src/pages/HotNews.tsx` |

### 生活工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 番茄钟 | `/pomodoro` | `tools/tool-pomodoro` → Pomodoro |
| 习惯打卡 | `/habit-tracker` | `tools/tool-habit-tracker` → HabitTracker |
| OKR 规划器 | `/okr-planner` | `tools/tool-okr-planner` → OkrPlanner |
| 记账工具 | `/expense-tracker` | `tools/tool-expense-tracker` → ExpenseTracker |
| 订阅费用管理 | `/subscription-manager` | `tools/tool-subscription-manager` → SubscriptionManager |
| 分期计算器 | `/installment-calc` | `tools/tool-installment-calc` → InstallmentCalc |
| 工资税后计算器 | `/salary-calc` | `tools/tool-salary-calc` → SalaryCalc |
| 汇率换算工具 | `/currency-converter` | `tools/tool-currency-converter` → CurrencyConverter |
| 卡路里估算工具 | `/calorie-calc` | `tools/tool-calorie-calc` → CalorieCalc |
| 菜谱推荐 | `/recipe-finder` | `tools/tool-recipe-finder` → RecipeFinder |
| 随机菜单生成器 | `/random-menu` | `tools/tool-random-menu` → RandomMenu |
| curl 转 fetch | `/curl-to-fetch` | `tools/tool-curl-to-fetch` → CurlToFetch |
| JWT 解析工具 | `/jwt-decoder` | `tools/tool-jwt-decoder` → JwtDecoder |
| 旅行 Checklist 生成 | `/travel-checklist` | `tools/tool-travel-checklist` → TravelChecklist |
| 旅行预算计算器 | `/travel-budget` | `tools/tool-travel-budget` → TravelBudget |
| AA 分摊工具 | `/split-bill` | `tools/tool-split-bill` → SplitBill |
| 时差计算器 | `/timezone-calc` | `tools/tool-timezone-calc` → TimezoneCalc |
| 地图距离计算 | `/distance-calc` | `tools/tool-distance-calc` → DistanceCalc |
| 行李清单生成器 | `/packing-list` | `tools/tool-packing-list` → PackingList |
| 学习时长统计 | `/study-timer` | `tools/tool-study-timer` → StudyTimer |
| 拖延症评估 + 改进建议 | `/procrastination-test` | `tools/tool-procrastination-test` → ProcrastinationTest |
| 每日复盘生成器 | `/daily-review` | `tools/tool-daily-review` → DailyReview |
| 理财收益模拟器 | `/investment-sim` | `tools/tool-investment-sim` → InvestmentSim |
| 冰箱库存管理 | `/fridge-inventory` | `tools/tool-fridge-inventory` → FridgeInventory |
| 保质期提醒 | `/expiry-reminder` | `tools/tool-expiry-reminder` → ExpiryReminder |
| 家庭任务分配工具 | `/family-tasks` | `tools/tool-family-tasks` → FamilyTasks |
| 时间日志分析 | `/time-logger` | `tools/tool-time-logger` → TimeLogger |

### 旅游工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| AI 行程规划器 | `/trip-planner` | `tools/tool-trip-planner` → TripPlanner |
| 一日游智能推荐 | `/day-trip` | `tools/tool-day-trip` → DayTrip |
| 多城市路线优化 | `/multi-city-route` | `tools/tool-multi-city-route` → MultiCityRoute |
| 旅行 Checklist 生成 | `/travel-checklist` | `tools/tool-travel-checklist` → TravelChecklist |
| 旅行预算计算器 | `/travel-budget` | `tools/tool-travel-budget` → TravelBudget |
| AA 分摊工具 | `/split-bill` | `tools/tool-split-bill` → SplitBill |
| 汇率 + 消费估算 | `/travel-cost-estimate` | `tools/tool-travel-cost-estimate` → TravelCostEstimate |
| 时差计算器 | `/timezone-calc` | `tools/tool-timezone-calc` → TimezoneCalc |
| 地图距离计算 | `/distance-calc` | `tools/tool-distance-calc` → DistanceCalc |
| 行李清单生成器 | `/packing-list` | `tools/tool-packing-list` → PackingList |
| 签证信息助手 | `/visa-info` | `tools/tool-visa-info` → VisaInfo |
| 语言翻译助手（旅行场景） | `/travel-translator` | `tools/tool-travel-translator` → TravelTranslator |
| 旅行成本对比工具 | `/travel-cost-compare` | `tools/tool-travel-cost-compare` → TravelCostCompare |
| 航班信息查询 | `/flight-search` | `tools/tool-flight-search` → FlightSearch |
| 网红景点生成器 | `/trending-spots` | `tools/tool-trending-spots` → TrendingSpots |
| 旅行故事生成 | `/travel-story` | `tools/tool-travel-story` → TravelStory |
| 餐厅推荐 | `/restaurant-finder` | `tools/tool-restaurant-finder` → RestaurantFinder |
| 旅行对话模拟 | `/travel-conversation` | `tools/tool-travel-conversation` → TravelConversation |
| 旅行攻略总结器 | `/travel-guide-summary` | `tools/tool-travel-guide-summary` → TravelGuideSummary |
| 游记自动生成 | `/travel-journal` | `tools/tool-travel-journal` → TravelJournal |
| 酒店价格趋势 | `/hotel-trend` | `tools/tool-hotel-trend` → HotelTrend |
| 景点热度分析 | `/attraction-heatmap` | `tools/tool-attraction-heatmap` → AttractionHeatmap |
| 人流预测工具 | `/crowd-forecast` | `tools/tool-crowd-forecast` → CrowdForecast |
| 天气 + 穿搭建议 | `/weather-outfit` | `tools/tool-weather-outfit` → WeatherOutfit |
| 旅行风险提醒 | `/travel-risk` | `tools/tool-travel-risk` → TravelRisk |
| 拍照点推荐 | `/photo-spots` | `tools/tool-photo-spots` → PhotoSpots |
| 路线地图可视化 | `/route-map` | `tools/tool-route-map` → RouteMap |

### 学习工具

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 学习计划生成器 | `/study-planner` | `tools/tool-study-planner` → StudyPlanner |
| 记忆曲线复习提醒 | `/spaced-repetition` | `tools/tool-spaced-repetition` → SpacedRepetition |
| 专注模式 | `/focus-mode` | `tools/tool-focus-mode` → FocusMode |
| 学习时长统计 | `/study-timer` | `tools/tool-study-timer` → StudyTimer |
| 单词记忆工具 | `/vocab-trainer` | `tools/tool-vocab-trainer` → VocabTrainer |
| 错题本系统 | `/mistake-book` | `tools/tool-mistake-book` → MistakeBook |
| 自动出题工具 | `/quiz-gen` | `tools/tool-quiz-gen` → QuizGen |
| 选择题生成器 | `/mcq-gen` | `tools/tool-mcq-gen` → McqGen |
| 知识对比工具 | `/knowledge-compare` | `tools/tool-knowledge-compare` → KnowledgeCompare |
| 一句话讲清工具 | `/one-liner` | `tools/tool-one-liner` → OneLiner |
| "像5岁小孩解释"工具 | `/eli5` | `tools/tool-eli5` → Eli5 |
| 多角度解释 | `/multi-perspective` | `tools/tool-multi-perspective` → MultiPerspective |
| 网页内容提取 | `/web-extractor` | `tools/tool-web-extractor` → WebExtractor |
| 笔记整理助手 | `/note-organizer` | `tools/tool-note-organizer` → NoteOrganizer |
| 术语词典生成 | `/glossary-gen` | `tools/tool-glossary-gen` → GlossaryGen |
| 知识图谱生成 | `/knowledge-graph` | `tools/tool-knowledge-graph` → KnowledgeGraph |
| 编程题生成 | `/coding-challenge` | `tools/tool-coding-challenge` → CodingChallenge |
| 前端面试题生成 | `/frontend-interview` | `tools/tool-frontend-interview` → FrontendInterview |
| 系统设计练习工具 | `/system-design` | `tools/tool-system-design` → SystemDesign |
| AI 对话练习 | `/conversation-practice` | `tools/tool-conversation-practice` → ConversationPractice |
| 学习路径规划 | `/learning-path` | `tools/tool-learning-path` → LearningPath |
| 问答 + 深挖 | `/deep-dive-qa` | `tools/tool-deep-dive-qa` → DeepDiveQa |
| 发音评估工具 | `/pronunciation-eval` | `tools/tool-pronunciation-eval` → PronunciationEval |

---

## 三、待开发 / 调研工具

**新增规划时**：在本节按分类添加一行，填写「工具名称、分类、路由（建议）、状态、优先级、备注」。  
**上线后**：把该行移到「二、已开发」对应分类表，并补上「代码位置」和路由。

### 当前待办（第二阶段）

| 工具名称 | 分类 | 建议路径 | 状态 | 优先级 | 备注 |
|----------|------|----------|------|--------|------|
| **── 生活：效率 & 习惯 ──** | | | | | |
| ~~番茄钟 + 数据统计~~ | life | `/pomodoro` | **已上线** | - | 番茄工作法 + 专注时长统计 |
| ~~习惯打卡 + 连续记录~~ | life | `/habit-tracker` | **已上线** | - | 习惯追踪 + 连续天数 |
| ~~目标拆解工具（OKR mini）~~ | life | `/okr-planner` | **已上线** | - | OKR 目标拆解与追踪 |
| 今日计划自动生成器 | life | `/daily-planner` | **已上线** | P2 | AI 生成每日计划 |
| ~~时间日志分析~~ | life | `/time-logger` | **已上线** | - | 时间花费分析「时间去哪了」 |
| ~~拖延症评估 + 改进建议~~ | life | `/procrastination-test` | **已上线** | - | 拖延评估 + AI 建议 |
| ~~每日复盘生成器~~ | life | `/daily-review` | **已上线** | - | AI 辅助每日复盘 |
| **── 生活：财务 & 消费 ──** | | | | | |
| ~~记账工具~~ | life | `/expense-tracker` | **已上线** | - | 支持标签统计 |
| ~~订阅费用管理~~ | life | `/subscription-manager` | **已上线** | - | Netflix/AI 等订阅管理 |
| ~~分期计算器~~ | life | `/installment-calc` | **已上线** | - | 分期还款计算 |
| ~~工资税后计算器~~ | life | `/salary-calc` | **已上线** | - | 五险一金 + 税后工资 |
| ~~汇率换算工具~~ | life | `/currency-converter` | **已上线** | - | 实时汇率换算 |
| ~~理财收益模拟器~~ | life | `/investment-sim` | **已上线** | - | 收益率模拟 |
| **── 生活：健康 & 生活 ──** | | | | | |
| ~~卡路里估算工具~~ | life | `/calorie-calc` | **已上线** | - | 食物热量估算 |
| 睡眠质量记录 | life | `/sleep-tracker` | **已上线** | P2 | 睡眠时长 + 质量评分 |
| 饮水提醒工具 | life | `/water-reminder` | **已上线** | P2 | 每日饮水量追踪 |
| 跑步数据分析 | life | `/running-tracker` | **已上线** | P2 | 配速/里程/趋势分析 |
| 久坐提醒工具 | life | `/sedentary-reminder` | **已上线** | P2 | 久坐提醒 + 拉伸建议 |
| **── 生活：日常工具 ──** | | | | | |
| ~~菜谱推荐（根据食材）~~ | life | `/recipe-finder` | **已上线** | - | 输入食材推荐菜谱 |
| ~~冰箱库存管理~~ | life | `/fridge-inventory` | **已上线** | - | 食材库存管理 |
| ~~保质期提醒~~ | life | `/expiry-reminder` | **已上线** | - | 食品/药品过期提醒 |
| ~~随机菜单生成器~~ | life | `/random-menu` | **已上线** | - | 今天吃什么 |
| ~~家庭任务分配工具~~ | life | `/family-tasks` | **已上线** | - | 家务分配与追踪 |
| **── 生活：实用补充 ──** | | | | | |
| 条形码识别 | utils | `/barcode-reader` | **已上线** | P1 | 条形码扫描与解析 |
| **── 实用：图像处理（已完成 6 个）──** | | | | | |
| ~~图片水印~~ | utils | `/image-watermark` | **已上线** | - | 文字/Logo 水印，5 种位置，批量处理 |
| ~~图片裁剪~~ | utils | `/image-cropper` | **已上线** | - | 自由裁剪 +7 种预设比例，旋转翻转 |
| ~~图片旋转/翻转~~ | utils | `/image-rotator` | **已上线** | - | 任意角度旋转，水平垂直翻转 |
| ~~图片滤镜~~ | utils | `/image-filter` | **已上线** | - | 12 种预设滤镜，8 个高级参数 |
| ~~图片拼接~~ | utils | `/image-stitcher` | **已上线** | - | 横向/纵向拼接，自定义间距 |
| ~~图片去水印~~ | utils | `/image-watermark-remover` | **已上线** | - | 手动涂抹，AI 智能修复 |
| **── 实用：图像处理（后续补充）──** | | | | | |
| Canvas 图像工作台 | utils | `/image-canvas-lab` | **已上线** | P1 | 水印合成、多图层叠图、`getImageData`/`putImageData` 像素处理、透明度与混合模式；纯前端，无上传 |
| 证件照工具（标准尺寸 + 换底） | utils | `/id-photo` | **已上线** | P2 | 对标证件照场景；可与 `/image-background-remover` 能力衔接；AI 换底可选 |
| ~~图像本地加载预览基座~~ | utils | `/image-local-preview` | **已上线** | - | `FileReader.readAsDataURL`；大图预览、元信息；可拆为组件供 `image-canvas-lab` 复用 |
| 图像处理实验工作台 | utils | `/image-pipeline-lab` | 调研中 | P3 | 对标责任链式流程：效果叠加、参数调节、撤销/重做、流程保存；可选轻后端（Flask 类）或纯前端栈 |
| **── 生活：开发者友好 ──** | | | | | |
| ~~curl 转 fetch~~ | dev | `/curl-to-fetch` | **已上线** | - | curl 命令转 JS fetch 代码 |
| ~~JWT 解析工具~~ | dev | `/jwt-decoder` | **已上线** | - | JWT Token 解码与验证 |
| HTTP 请求调试器 | dev | `/http-debugger` | **已上线** | P2 | 在线发送 HTTP 请求调试 |
| **── 旅游：行程规划 ──** | | | | | |
| AI 行程规划器 | travel | `/trip-planner` | **已上线** | P1 | 输入预算+天数 AI 生成行程 |
| 城市游玩路线生成 | travel | `/city-route` | **已上线** | P2 | 单城市景点路线规划 |
| 一日游智能推荐 | travel | `/day-trip` | **已上线** | P1 | 一日游方案推荐（含"东京一天怎么玩"场景） |
| 多城市路线优化 | travel | `/multi-city-route` | **已上线** | P2 | 多城市最优路线（TSP） |
| ~~旅行 Checklist 生成~~ | travel | `/travel-checklist` | **已上线** | - | 根据目的地生成准备清单 |
| **── 旅游：预算 & 成本 ──** | | | | | |
| ~~旅行预算计算器~~ | travel | `/travel-budget` | **已上线** | - | 交通/住宿/餐饮预算 |
| ~~AA 分摊工具~~ | travel | `/split-bill` | **已上线** | - | 多人费用分摊 |
| 汇率 + 消费估算 | travel | `/travel-cost-estimate` | **已上线** | P2 | 目的地消费水平 + 汇率 |
| ~~旅行成本对比工具~~ | travel | `/travel-cost-compare` | **已上线** | - | 多目的地成本对比 |
| **── 旅游：导航 & 信息 ──** | | | | | |
| ~~景点热度分析~~ | travel | `/attraction-heatmap` | **已上线** | - | 按时间段分析热度 |
| ~~人流预测工具~~ | travel | `/crowd-forecast` | **已上线** | - | 简易人流预测 |
| ~~天气 + 穿搭建议~~ | travel | `/weather-outfit` | **已上线** | - | 目的地天气 + 穿衣建议 |
| ~~时差计算器~~ | travel | `/timezone-calc` | **已上线** | - | 多时区时差换算 |
| ~~地图距离计算~~ | travel | `/distance-calc` | **已上线** | - | 两点间距离计算 |
| **── 旅游：实用工具 ──** | | | | | |
| ~~行李清单生成器~~ | travel | `/packing-list` | **已上线** | - | AI 生成行李清单 |
| ~~航班信息查询聚合~~ | travel | `/flight-search` | **已上线** | - | 航班信息聚合查询 |
| ~~酒店价格趋势~~ | travel | `/hotel-trend` | **已上线** | - | 酒店历史价格趋势 |
| 签证信息助手 | travel | `/visa-info` | **已上线** | P2 | 各国签证要求查询 |
| ~~旅行风险提醒~~ | travel | `/travel-risk` | **已上线** | - | 目的地安全/健康风险 |
| **── 旅游：体验增强 ──** | | | | | |
| ~~拍照点推荐~~ | travel | `/photo-spots` | **已上线** | - | 热门拍照机位推荐 |
| ~~网红景点生成器~~ | travel | `/trending-spots` | **已上线** | - | 热门打卡点发现 |
| ~~旅行故事生成~~ | travel | `/travel-story` | **已上线** | - | AI 生成旅行故事 |
| ~~路线地图可视化~~ | travel | `/route-map` | **已上线** | - | 路线地图可视化展示 |
| **── 旅游：AI 增强 ──** | | | | | |
| ~~餐厅推荐~~ | travel | `/restaurant-finder` | **已上线** | - | 结合时间/预算推荐餐厅 |
| 语言翻译助手（旅行场景） | travel | `/travel-translator` | **已上线** | P1 | 旅行常用语翻译 |
| ~~旅行对话模拟~~ | travel | `/travel-conversation` | **已上线** | - | 旅行口语练习 |
| ~~旅行攻略总结器~~ | travel | `/travel-guide-summary` | **已上线** | - | AI 总结旅行攻略 |
| ~~游记自动生成~~ | travel | `/travel-journal` | **已上线** | - | AI 生成游记文章 |
| **── 学习：学习效率 ──** | | | | | |
| 学习计划生成器 | learn | `/study-planner` | **已上线** | P1 | AI 生成学习计划 |
| 记忆曲线复习提醒 | learn | `/spaced-repetition` | **已上线** | P1 | Anki lite 版 |
| 专注模式 | learn | `/focus-mode` | **已上线** | P2 | 屏蔽干扰专注学习 |
| ~~学习时长统计~~ | learn | `/study-timer` | **已上线** | - | 学习时间记录与统计 |
| **── 学习：内容处理 ──** | | | | | |
| 文本摘要工具 | learn | `/text-summary` | **已上线** | P1 | AI 文本自动摘要 |
| PDF 总结工具 | learn | `/pdf-summary` | **已上线** | P1 | AI 总结 PDF 内容 |
| ~~网页内容提取~~ | learn | `/web-extractor` | **已上线** | - | 提取网页正文内容 |
| ~~笔记整理助手~~ | learn | `/note-organizer` | **已上线** | - | AI 辅助笔记整理 |
| **── 学习：知识理解 ──** | | | | | |
| 概念解释工具 | learn | `/concept-explainer` | **已上线** | P1 | AI 解释任意概念 |
| 一句话讲清工具 | learn | `/one-liner` | **已上线** | P1 | 用一句话解释复杂概念 |
| ~~术语词典生成~~ | learn | `/glossary-gen` | **已上线** | - | 自动生成术语词典 |
| ~~知识图谱生成~~ | learn | `/knowledge-graph` | **已上线** | - | 可视化知识关系图 |
| **── 学习：练习 & 测试 ──** | | | | | |
| 自动出题工具 | learn | `/quiz-gen` | **已上线** | P1 | AI 根据内容自动出题 |
| 选择题生成器 | learn | `/mcq-gen` | **已上线** | P1 | 生成选择题 |
| ~~编程题生成~~ | learn | `/coding-challenge` | **已上线** | - | AI 生成编程练习题 |
| 错题本系统 | learn | `/mistake-book` | **已上线** | P2 | 错题收集与复习 |
| **── 学习：编程学习 ──** | | | | | |
| 代码解释器 | learn | `/code-explainer` | **已上线** | P1 | 输入代码 AI 逐行解释 |
| Bug 分析工具 | learn | `/bug-analyzer` | **已上线** | P1 | AI 分析代码 Bug |
| 项目结构生成器 | learn | `/project-scaffold` | **已上线** | P1 | 生成项目目录结构（Nx） |
| ~~前端面试题生成~~ | learn | `/frontend-interview` | **已上线** | - | 前端面试题库 + 生成 |
| ~~系统设计练习工具~~ | learn | `/system-design` | **已上线** | - | 系统设计题练习 |
| **── 学习：语言学习 ──** | | | | | |
| 单词记忆工具 | learn | `/vocab-trainer` | **已上线** | P1 | 单词记忆 + 复习 |
| 句子改写工具 | learn | `/sentence-rewriter` | **已上线** | P1 | AI 句子改写/润色 |
| ~~AI 对话练习~~ | learn | `/conversation-practice` | **已上线** | - | AI 口语对话练习 |
| ~~发音评估工具~~ | learn | `/pronunciation-eval` | **已上线** | - | 语音发音评估 |
| **── 学习：AI 增强学习 ──** | | | | | |
| "像5岁小孩解释"工具 | learn | `/eli5` | **已上线** | P1 | ELI5 简化解释 |
| 多角度解释 | learn | `/multi-perspective` | **已上线** | P1 | 专家/小白多角度解释 |
| 知识对比工具 | learn | `/knowledge-compare` | **已上线** | P1 | 概念/技术对比分析 |
| ~~学习路径规划~~ | learn | `/learning-path` | **已上线** | - | 从0到专家的学习路径 |
| ~~问答 + 深挖~~ | learn | `/deep-dive-qa` | **已上线** | - | 递进式深度学习问答 |

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

### 后续计划：图像处理工具集（调研表，陆续实现）

以下内容来自**图像处理工具/技术调研**（Canvas API、改图宝/PhotoGrid 类能力对标、FileReader、React+Flask 实验平台范式等），映射为本站可落地工具。实现顺序建议：**Canvas 工作台** → **图片套件扩展** → **证件照** → **实验工作台**；`FileReader` 能力优先作为前两者公共模块。

**已有关联（勿重复造轮子）**：`/image-compressor`（压缩/格式）、`/image-background-remover`（去底）。新工具与之互补或内链跳转即可。

#### 调研对照表

| 参考对象 | 主要功能 | 核心实现 | 支持输入（参考） | 支持输出（参考） | 特色 / 隐私 | Toolbox 落位 |
|----------|----------|----------|------------------|------------------|-------------|----------------|
| **Canvas API** | 水印合成、背景合并、像素级处理、透明度与混合模式 | `drawImage`、`getImageData`、`putImageData` | 浏览器可解码图（JPG/PNG/Base64 等） | PNG（`toDataURL` 等）、画布内容 | 纯前端、可自研滤镜/混合算法 | → **`/image-canvas-lab`**（当前待办） |
| **图片处理** | 改像素/尺寸、裁剪、压缩、水印、格式转换、证件照换背景色、改 DPI | 典型为 Web + 服务端处理；本站可先做纯前端子集 | JPG/JPEG/GIF/PNG/BMP/WebP/TIFF/HEIC/PSD 等（参考） | JPG/JPEG/PNG/GIF/BMP/WebP 等（参考） | 参考亮点：免安装、标准证件照模板、磨皮/印章等（实现时选做）；第三方「约 30 分钟删图」——**本站优先本地处理、不上传** | → **`/image-toolkit`** + 已有 `/image-compressor` 扩展 |
| **PhotoGrid 类证件照（能力对标）** | 证件照换背景、在线换底 | AI 抠图/增强类能力（可衔接现有去背景） | （依产品） | （依产品） | 参考亮点：免费入口、AI 模板、证件照场景优化；隐私以最终实现与文案为准 | → **`/id-photo`**（当前待办） |
| **FileReader** | 本地预览、读取文件为 Data URL | `readAsDataURL` | 用户选择的本地图片 | Base64 字符串 | 不上传、仅客户端 | → **`/image-local-preview`** 或并入画布/套件 |
| **图像处理实验平台**（React + Flask 参考） | 自定义处理流、效果叠加、参数调节、撤销重做、保存流程 | 前端 React + 后端 Flask；责任链模式 | 图片上传（通用） | 导出处理后图 | 私有部署场景友好 | → **`/image-pipeline-lab`**（调研中，可后期再接 API） |

#### 适用场景速记

- **Canvas 工作台**：验证码/多图层合成、像素级编辑、前端图像小工具内核。
- **图片套件**：网页配图优化、报名/证件照预处理、批量裁剪与 DPI。
- **证件照**：考试报名、简历照换底色与标准比例。
- **FileReader 基座**：一切「先选图再处理」流程的第一步。
- **实验工作台**：教学演示、算法参数对比、可复现处理链（偏进阶）。

---

### 后续计划：网络与 DNS 工具集

**上述工具已完成立项，且已有相当一部分上线。** 分类 `network`，实际开发状态以上方「二、已开发」与「三、当前待办」为准。下表保留作分类对照。

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

### 后续计划：生活工具集

**已完成立项，且已有部分上线。** 分类 `life`（部分归入 `utils`/`dev`），实际开发状态以上方「二、已开发」与「三、当前待办」为准。下表保留作分类对照。

#### 一、效率 & 习惯（7）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 番茄钟 + 数据统计 | `/pomodoro` | 番茄工作法 + 专注时长统计 |
| 2 | 习惯打卡 + 连续记录 | `/habit-tracker` | 习惯追踪 + 连续天数 |
| 3 | 目标拆解工具（OKR mini） | `/okr-planner` | OKR 目标拆解与追踪 |
| 4 | 今日计划自动生成器 | `/daily-planner` | AI 生成每日计划 |
| 5 | 时间日志分析 | `/time-logger` | 时间花费分析 |
| 6 | 拖延症评估 + 改进建议 | `/procrastination-test` | 拖延评估 + AI 建议 |
| 7 | 每日复盘生成器 | `/daily-review` | AI 辅助每日复盘 |

#### 二、财务 & 消费（6）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 记账工具 | `/expense-tracker` | 支持标签统计 |
| 2 | 订阅费用管理 | `/subscription-manager` | Netflix/AI 等订阅管理 |
| 3 | 分期计算器 | `/installment-calc` | 分期还款计算 |
| 4 | 工资税后计算器 | `/salary-calc` | 五险一金 + 税后工资 |
| 5 | 汇率换算工具 | `/currency-converter` | 实时汇率换算 |
| 6 | 理财收益模拟器 | `/investment-sim` | 收益率模拟 |

#### 三、健康 & 生活（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 卡路里估算工具 | `/calorie-calc` | 食物热量估算 |
| 2 | 睡眠质量记录 | `/sleep-tracker` | 睡眠时长 + 质量评分 |
| 3 | 饮水提醒工具 | `/water-reminder` | 每日饮水量追踪 |
| 4 | 跑步数据分析 | `/running-tracker` | 配速/里程/趋势分析 |
| 5 | 久坐提醒工具 | `/sedentary-reminder` | 久坐提醒 + 拉伸建议 |

#### 四、日常工具（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 菜谱推荐（根据食材） | `/recipe-finder` | 输入食材推荐菜谱 |
| 2 | 冰箱库存管理 | `/fridge-inventory` | 食材库存管理 |
| 3 | 保质期提醒 | `/expiry-reminder` | 食品/药品过期提醒 |
| 4 | 随机菜单生成器 | `/random-menu` | 今天吃什么 |
| 5 | 家庭任务分配工具 | `/family-tasks` | 家务分配与追踪 |

#### 五、实用补充 + 开发者友好（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 条形码识别 | `/barcode-reader` | 条形码扫描与解析（分类 `utils`） |
| 2 | curl 转 fetch | `/curl-to-fetch` | curl 转 JS fetch（分类 `dev`） |
| 3 | JWT 解析工具 | `/jwt-decoder` | JWT Token 解码验证（分类 `dev`） |
| 4 | HTTP 请求调试器 | `/http-debugger` | 在线 HTTP 请求调试（分类 `dev`） |

---

### 后续计划：旅游工具集

**已完成立项，且已有部分上线。** 分类 `travel`，实际开发状态以上方「二、已开发」与「三、当前待办」为准。下表保留作分类对照。

#### 一、行程规划（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | AI 行程规划器 | `/trip-planner` | 输入预算+天数 AI 生成行程 |
| 2 | 城市游玩路线生成 | `/city-route` | 单城市景点路线规划 |
| 3 | 一日游智能推荐 | `/day-trip` | 一日游方案（含"东京一天怎么玩"） |
| 4 | 多城市路线优化 | `/multi-city-route` | 多城市最优路线（TSP） |
| 5 | 旅行 Checklist 生成 | `/travel-checklist` | 根据目的地生成准备清单 |

#### 二、预算 & 成本（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 旅行预算计算器 | `/travel-budget` | 交通/住宿/餐饮预算 |
| 2 | AA 分摊工具 | `/split-bill` | 多人费用分摊 |
| 3 | 汇率 + 消费估算 | `/travel-cost-estimate` | 目的地消费水平 + 汇率 |
| 4 | 旅行成本对比工具 | `/travel-cost-compare` | 多目的地成本对比 |

#### 三、导航 & 信息（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 景点热度分析 | `/attraction-heatmap` | 按时间段分析热度 |
| 2 | 人流预测工具 | `/crowd-forecast` | 简易人流预测 |
| 3 | 天气 + 穿搭建议 | `/weather-outfit` | 目的地天气 + 穿衣建议 |
| 4 | 时差计算器 | `/timezone-calc` | 多时区时差换算 |
| 5 | 地图距离计算 | `/distance-calc` | 两点间距离计算 |

#### 四、旅行实用工具（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 行李清单生成器 | `/packing-list` | AI 生成行李清单 |
| 2 | 航班信息查询聚合 | `/flight-search` | 航班信息聚合查询 |
| 3 | 酒店价格趋势 | `/hotel-trend` | 酒店历史价格趋势 |
| 4 | 签证信息助手 | `/visa-info` | 各国签证要求查询 |
| 5 | 旅行风险提醒 | `/travel-risk` | 目的地安全/健康风险 |

#### 五、体验增强（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 拍照点推荐 | `/photo-spots` | 热门拍照机位推荐 |
| 2 | 网红景点生成器 | `/trending-spots` | 热门打卡点发现 |
| 3 | 旅行故事生成 | `/travel-story` | AI 生成旅行故事 |
| 4 | 路线地图可视化 | `/route-map` | 路线地图可视化展示 |

#### 六、AI 增强（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 餐厅推荐 | `/restaurant-finder` | 结合时间/预算推荐餐厅 |
| 2 | 语言翻译助手（旅行场景） | `/travel-translator` | 旅行常用语翻译 |
| 3 | 旅行对话模拟 | `/travel-conversation` | 旅行口语练习 |
| 4 | 旅行攻略总结器 | `/travel-guide-summary` | AI 总结旅行攻略 |
| 5 | 游记自动生成 | `/travel-journal` | AI 生成游记文章 |

---

### 后续计划：学习工具集

**已完成立项，且已有部分上线。** 分类 `learn`，实际开发状态以上方「二、已开发」与「三、当前待办」为准。下表保留作分类对照。

#### 一、学习效率（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 学习计划生成器 | `/study-planner` | AI 生成学习计划 |
| 2 | 记忆曲线复习提醒 | `/spaced-repetition` | Anki lite 版 |
| 3 | 专注模式 | `/focus-mode` | 屏蔽干扰专注学习 |
| 4 | 学习时长统计 | `/study-timer` | 学习时间记录与统计 |

#### 二、内容处理（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 文本摘要工具 | `/text-summary` | AI 文本自动摘要 |
| 2 | PDF 总结工具 | `/pdf-summary` | AI 总结 PDF 内容 |
| 3 | 网页内容提取 | `/web-extractor` | 提取网页正文内容 |
| 4 | 笔记整理助手 | `/note-organizer` | AI 辅助笔记整理 |

#### 三、知识理解（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 概念解释工具 | `/concept-explainer` | AI 解释任意概念 |
| 2 | 一句话讲清工具 | `/one-liner` | 用一句话解释复杂概念 |
| 3 | 术语词典生成 | `/glossary-gen` | 自动生成术语词典 |
| 4 | 知识图谱生成 | `/knowledge-graph` | 可视化知识关系图 |

#### 四、练习 & 测试（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 自动出题工具 | `/quiz-gen` | AI 根据内容自动出题 |
| 2 | 选择题生成器 | `/mcq-gen` | 生成选择题 |
| 3 | 编程题生成 | `/coding-challenge` | AI 生成编程练习题 |
| 4 | 错题本系统 | `/mistake-book` | 错题收集与复习 |

#### 五、编程学习（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 代码解释器 | `/code-explainer` | 输入代码 AI 逐行解释 |
| 2 | Bug 分析工具 | `/bug-analyzer` | AI 分析代码 Bug |
| 3 | 项目结构生成器 | `/project-scaffold` | 生成项目目录结构（Nx） |
| 4 | 前端面试题生成 | `/frontend-interview` | 前端面试题库 + 生成 |
| 5 | 系统设计练习工具 | `/system-design` | 系统设计题练习 |

#### 六、语言学习（4）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | 单词记忆工具 | `/vocab-trainer` | 单词记忆 + 复习 |
| 2 | 句子改写工具 | `/sentence-rewriter` | AI 句子改写/润色 |
| 3 | AI 对话练习 | `/conversation-practice` | AI 口语对话练习 |
| 4 | 发音评估工具 | `/pronunciation-eval` | 语音发音评估 |

#### 七、AI 增强学习（5）

| 序号 | 工具名称 | 建议路径 | 备注 |
|------|----------|----------|------|
| 1 | "像5岁小孩解释"工具 | `/eli5` | ELI5 简化解释 |
| 2 | 多角度解释 | `/multi-perspective` | 专家/小白多角度解释 |
| 3 | 知识对比工具 | `/knowledge-compare` | 概念/技术对比分析 |
| 4 | 学习路径规划 | `/learning-path` | 从0到专家的学习路径 |
| 5 | 问答 + 深挖 | `/deep-dive-qa` | 递进式深度学习问答 |

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
