# 工具盒子 - 完整工具路由映射（2026-03-30）

## 📊 统计

- **工具总数**: 155 个（今日新增）
- **网络工具**: 85 个
- **开发工具**: 35 个
- **生活工具**: 20 个
- **实用工具**: 10 个
- **AI 工具**: 3 个
- **查询工具**: 2 个

---

## 🌐 网络工具（85 个）

### DNS 工具（20 个）
```
/dns-query → DnsQuery (apps/web/src/pages/DnsQuery.tsx)
/dns-trace → DnsTrace (tools/tool-dns-trace)
/dns-propagation → DnsPropagation (tools/tool-dns-propagation)
/dns-global-check → DnsGlobalCheck (tools/tool-dns-global-check)
/dnssec-check → DnssecCheck (tools/tool-dnssec-check)
/dns-performance → DnsPerformance (tools/tool-dns-performance)
/dns-ttl → DnsTtl (tools/tool-dns-ttl)
/dns-ns → DnsNs (tools/tool-dns-ns)
/dns-soa → DnsSoa (tools/tool-dns-soa)
/dns-diagnose → DnsDiagnose (tools/tool-dns-diagnose)
/dns-pollution-check → DnsPollutionCheck (tools/tool-dns-pollution-check)
/dns-hijack-check → DnsHijackCheck (tools/tool-dns-hijack-check)
/dns-cache-check → DnsCacheCheck (tools/tool-dns-cache-check)
/dns-loop-check → DnsLoopCheck (tools/tool-dns-loop-check)
/dns-cname-chain → DnsCnameChain (tools/tool-dns-cname-chain)
/dns-nxdomain → DnsNxdomain (tools/tool-dns-nxdomain)
/dns-latency → DnsLatency (tools/tool-dns-latency)
/dns-authoritative → DnsAuthoritative (tools/tool-dns-authoritative)
/dns-recursive → DnsRecursive (tools/tool-dns-recursive)
/dns-path-viz → DnsPathViz (tools/tool-dns-path-viz)
/dns-tunnel → DnsTunnel (tools/tool-dns-tunnel)
```

### IP 工具（15 个）
```
/ip-query → IpQuery (tools/tool-ip-query)
/ip-asn → IpAsn (tools/tool-ip-asn)
/ip-geo → IpGeo (tools/tool-ip-ops-suite)
/ip-ptr → IpPtr (tools/tool-ip-ops-suite)
/ip-v4-to-v6 → IpV4ToV6 (tools/tool-ip-ops-suite)
/ip-binary-hex → IpBinaryHex (tools/tool-ip-ops-suite)
/ip-class → IpClass (tools/tool-ip-ops-suite)
/ip-public → IpPublic (tools/tool-ip-ops-suite)
/ip-cdn-check → IpCdnCheck (tools/tool-ip-ops-suite)
/ip-blacklist → IpBlacklist (tools/tool-ip-ops-suite)
/subnet-calculator → SubnetCalculator (tools/tool-subnet-calculator)
/ip-batch-lookup → IpBatchLookup (tools/tool-ip-batch-lookup)
/ip-range → IpRange (tools/tool-subnet-suite)
/ipv6-toolkit → Ipv6Toolkit (tools/tool-ipv6-toolkit)
```

### DHCP 工具（12 个）
```
/dhcp-pool-calc → DhcpPoolCalc (tools/tool-dhcp-pool-calc)
/dhcp-option → DhcpOption (tools/tool-dhcp-option)
/dhcp-mac-binding → DhcpMacBinding (tools/tool-dhcp-mac-binding)
/dhcp-config-gen → DhcpConfigGen (tools/tool-dhcp-config-gen)
/dhcp-utilization → DhcpUtilization (tools/tool-dhcp-utilization)
/dhcp-conflict → DhcpConflict (tools/tool-dhcp-conflict)
/dhcp-discover-sim → DhcpDiscoverSim (tools/tool-dhcp-discover-sim)
/dhcp-lease-analysis → DhcpLeaseAnalysis (tools/tool-dhcp-lease-analysis)
/dhcp-log-analysis → DhcpLogAnalysis (tools/tool-dhcp-log-analysis)
/dhcp-scan → DhcpScan (tools/tool-dhcp-scan)
```

### GSLB 工具（12 个）
```
/gslb-weight-calc → GslbWeightCalc (tools/tool-gslb-weight-calc)
/gslb-failover-sim → GslbFailoverSim (tools/tool-gslb-failover-sim)
/gslb-geo-sim → GslbGeoSim (tools/tool-gslb-geo-sim)
/gslb-health-sim → GslbHealthSim (tools/tool-gslb-health-sim)
/gslb-latency-sim → GslbLatencySim (tools/tool-gslb-latency-sim)
/gslb-policy-sim → GslbPolicySim (tools/tool-gslb-policy-sim)
/gslb-rule-validate → GslbRuleValidate (tools/tool-gslb-rule-validate)
/gslb-isp-sim → GslbIspSim (tools/tool-gslb-isp-sim)
/gslb-traffic-predict → GslbTrafficPredict (tools/tool-gslb-traffic-predict)
/gslb-hit-predict → GslbHitPredict (tools/tool-gslb-hit-predict)
```

### IPAM 工具（10 个）
```
/ipam-plan → IpamPlan (tools/tool-ipam-suite)
/ipam-inventory → IpamInventory (tools/tool-ipam-suite)
/ipam-usage → IpamUsage (tools/tool-ipam-suite)
/ipam-conflict → IpamConflict (tools/tool-ipam-suite)
/ipam-allocation-sim → IpamAllocationSim (tools/tool-ipam-suite)
/ipam-subnet-util → IpamSubnetUtil (tools/tool-ipam-subnet-util)
/ipam-visualize → IpamVisualize (tools/tool-ipam-visualize)
/ipam-reclaim → IpamReclaim (tools/tool-ipam-reclaim)
/ipam-changelog → IpamChangelog (tools/tool-ipam-changelog)
/ipam-scan → IpamScan (tools/tool-ipam-scan)
```

### 安全工具（10 个）
```
/security-ip-score → SecurityIpScore (tools/tool-security-suite)
/security-domain-blacklist → SecurityDomainBlacklist (tools/tool-security-suite)
/security-port-scan → SecurityPortScan (tools/tool-security-suite)
/security-dns-vuln → SecurityDnsVuln (tools/tool-security-suite)
/security-report-gen → SecurityReportGen (tools/tool-security-suite)
/security-domain-score → SecurityDomainScore (tools/tool-security-domain-score)
/security-dnssec-verify → SecurityDnssecVerify (tools/tool-security-dnssec-verify)
/security-dns-ddos → SecurityDnsDdos (tools/tool-security-dns-ddos)
/security-domain-hijack → SecurityDomainHijack (tools/tool-security-domain-hijack)
/ssl-cert → SslCert (tools/tool-ssl-cert)
```

### HTTP/TCP/Ping 工具（6 个）
```
/http-headers → HttpHeaders (tools/tool-http-headers)
/http-status → HttpStatus (tools/tool-http-status)
/tcp-port-check → TcpPort (tools/tool-tcp-port)
/ping → Ping (tools/tool-ping)
/traceroute → Traceroute (tools/tool-traceroute)
/server-latency → ServerLatency (tools/tool-server-latency)
/web-availability → WebAvailability (tools/tool-web-availability)
/api-availability → ApiAvailability (tools/tool-api-availability)
/cdn-check → CdnCheck (tools/tool-cdn-check)
```

---

## 💻 开发工具（35 个）

### 编解码（4 个）
```
/base64 → Base64 (apps/web/src/pages/Base64.tsx)
/url → UrlEncoder (apps/web/src/pages/UrlEncoder.tsx)
/jwt-decoder → JwtDecoder (tools/tool-jwt-decoder)
/hash → HashGenerator (apps/web/src/pages/HashGenerator.tsx)
```

### 格式化（5 个）
```
/json → JsonFormatter (apps/web/src/pages/JsonFormatter.tsx)
/format-converter → FormatConverter (apps/web/src/pages/FormatConverter.tsx)
/code → CodeFormatter (apps/web/src/pages/CodeFormatter.tsx)
/timestamp → Timestamp (apps/web/src/pages/Timestamp.tsx)
/text-stats → TextStats (tools/tool-text-stats)
```

### 生成器（6 个）
```
/uuid → UuidGenerator (apps/web/src/pages/UuidGenerator.tsx)
/password → PasswordGenerator (apps/web/src/pages/PasswordGenerator.tsx)
/cron → CronGenerator (apps/web/src/pages/CronGenerator.tsx)
/regex → RegexTester (apps/web/src/pages/RegexTester.tsx)
/graphql-playground → GraphqlPlayground (tools/tool-graphql-playground)
/postman-lite → PostmanLite (tools/tool-postman-lite)
```

### 测试工具（3 个）
```
/text-cipher → TextCipher (tools/tool-text-cipher)
/text-comparator → TextComparator (apps/web/src/pages/TextComparator.tsx)
/timezone-converter → TimezoneConverter (tools/tool-timezone-converter)
```

---

## 🏠 生活工具（20 个）

### 健康生活（4 个）
```
/wooden-fish → ElectronicWoodenFish (apps/web/src/pages/ElectronicWoodenFish.tsx)
/life-progress → LifeProgressBar (apps/web/src/pages/LifeProgressBar.tsx)
/calorie-calc → CalorieCalc (tools/tool-calorie-calc)
/water-reminder → WaterReminder (tools/tool-water-reminder)
```

### 效率（5 个）
```
/pomodoro → Pomodoro (tools/tool-pomodoro)
/habit-tracker → HabitTracker (tools/tool-habit-tracker)
/split-bill → SplitBill (tools/tool-split-bill)
/packing-list → PackingList (tools/tool-packing-list)
/timezone-calc → TimezoneCalc (tools/tool-timezone-calc)
```

### 创意（4 个）
```
/color-picker → ColorPicker (apps/web/src/pages/ColorPicker.tsx)
/unit-converter → UnitConverter (apps/web/src/pages/UnitConverter.tsx)
/short-link → ShortLinkGenerator (apps/web/src/pages/ShortLinkGenerator.tsx)
/meme-generator → MemeGenerator (apps/web/src/pages/MemeGenerator.tsx)
```

### 实用（7 个）
```
/resume-generator → ResumeGenerator (tools/tool-resume)
/copywriting-generator → CopywritingGenerator (apps/web/src/pages/CopywritingGenerator.tsx)
/weather → Weather (apps/web/src/pages/Weather.tsx)
/zipcode → ZipCode (apps/web/src/pages/ZipCode.tsx)
/random-menu → RandomMenu (tools/tool-random-menu)
/travel-checklist → TravelChecklist (tools/tool-travel-checklist)
/travel-budget → TravelBudget (tools/tool-travel-budget)
```

---

## 🖼️ 图片工具（9 个）

```
/image-watermark → ImageWatermark (tools/tool-image-watermark)
/image-cropper → ImageCropper (tools/tool-image-cropper)
/image-rotator → ImageRotator (tools/tool-image-rotator)
/image-filter → ImageFilter (tools/tool-image-filter)
/image-stitcher → ImageStitcher (tools/tool-image-stitcher)
/image-watermark-remover → ImageWatermarkRemover (tools/tool-image-watermark-remover)
/image-background-remover → ImageBackgroundRemover (apps/web/src/pages/ImageBackgroundRemover.tsx)
/image-compressor → ImageCompressor (apps/web/src/pages/ImageCompressor.tsx)
```

---

## 📱 二维码工具（3 个）

```
/qrcode/generate → QrCodeGenerator (tools/tool-qrcode)
/qrcode/read → QrCodeReader (tools/tool-qrcode)
/qrcode/beautifier → QrCodeBeautifier (tools/tool-qrcode)
```

---

## 📄 文档工具（2 个）

```
/markdown → MarkdownConverter (apps/web/src/pages/MarkdownConverter.tsx)
/pdf-tools → PdfTools (tools/tool-pdf)
```

---

## 🤖 AI 工具（3 个）

```
/meeting-minutes → MeetingMinutes (apps/web/src/pages/MeetingMinutes.tsx)
/ui-generator → UIGenerator (apps/web/src/pages/UIGenerator.tsx)
/ppt-generator → PptGenerator (tools/tool-ppt-generator)
```

---

## 📊 查询工具（2 个）

```
/news → HotNews (apps/web/src/pages/HotNews.tsx)
```

---

**生成时间**: 2026-03-30 06:35 AM
**总计**: 155 个工具路由映射
