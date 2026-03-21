import type { LucideIcon } from 'lucide-react'
import {
  Home, Star, QrCode, Newspaper, MapPin, Cloud, Code, FileCode, Clock, Link2,
  Shuffle, Calendar, Key, Fingerprint, Braces, Hash, Image, FileText, Heart, Mail, XCircle,
  AlertTriangle, RefreshCw,
  Palette, Wand2, Eraser, Ruler, Search, File, Globe, Server, Route,
  Presentation, ShieldCheck, Activity, ShieldAlert, ShieldBan, Radar, FileSearch,
  Boxes, GitCompareArrows, PlayCircle, Wifi, Radio, GitBranch, Shield, Network, Database,
  BarChart2, Sliders, Zap, CheckCircle, TrendingUp, Target, Trash2,
  Timer, CheckSquare, DollarSign, ArrowLeftRight, KeyRound,
  Receipt, CreditCard, Flame, UtensilsCrossed, ArrowRightLeft
} from 'lucide-react'

export type ToolMode = 'client' | 'server' | 'hybrid'

export interface ToolEntry {
  path: string
  nameKey: string
  icon: LucideIcon
  categoryKey?: string
  mode?: ToolMode  // 默认 'client'；server=需要后端；hybrid=前端可降级
  /** 搜索用关键词（当前语言外的拼音/英文等），可选 */
  keywords?: string[]
  /** 独立工具包自带 i18n 时的 namespace，用于导航/首页标题与描述（如 toolJson） */
  i18nNamespace?: string
}

export const TOOLS: ToolEntry[] = [
  { path: '/', nameKey: 'home', icon: Home },
  { path: '/favorites', nameKey: 'favorites', icon: Star },
  { path: '/qrcode/generate', nameKey: 'tools.qrcode_generate', icon: QrCode, categoryKey: 'qrcode', keywords: ['qr', '二维码'] },
  { path: '/qrcode/read', nameKey: 'tools.qrcode_read', icon: QrCode, categoryKey: 'qrcode', keywords: ['qr', '解析'] },
  { path: '/qrcode/beautifier', nameKey: 'tools.qrcode_beautifier', icon: Wand2, categoryKey: 'qrcode', keywords: ['qr', '美化'] },
  { path: '/news', nameKey: 'tools.news', icon: Newspaper, categoryKey: 'news', keywords: ['热点', '新闻'] , mode: 'server'},
  { path: '/zipcode', nameKey: 'tools.zipcode', icon: MapPin, categoryKey: 'query', keywords: ['邮编', 'zip'] , mode: 'server'},
  { path: '/weather', nameKey: 'tools.weather', icon: Cloud, categoryKey: 'query', keywords: ['天气'] , mode: 'server'},
  { path: '/github-info', nameKey: 'tools.github_info', icon: FileSearch, categoryKey: 'dev', keywords: ['github', 'token', 'repo', 'user'], i18nNamespace: 'toolGithubInfo' , mode: 'server'},
  { path: '/ip-query', nameKey: 'tools.ip_query', icon: Globe, categoryKey: 'ip', keywords: ['ip'], i18nNamespace: 'toolIpQuery' , mode: 'server'},
  { path: '/ip-asn', nameKey: 'tools.ip_asn', icon: Globe, categoryKey: 'ip', keywords: ['asn', 'as', '归属'], i18nNamespace: 'toolIpAsn' , mode: 'server'},
  { path: '/dns-query', nameKey: 'tools.dns_query', icon: Server, categoryKey: 'dns', keywords: ['dns', '域名', '解析'] , mode: 'server'},
  { path: '/dns-trace', nameKey: 'tools.dns_trace', icon: Route, categoryKey: 'dns', keywords: ['dns', 'trace', '递归', '追踪'], i18nNamespace: 'toolDnsTrace' , mode: 'server'},
  { path: '/dns-propagation', nameKey: 'tools.dns_propagation', icon: Globe, categoryKey: 'dns', keywords: ['dns', 'propagation', '传播', '检测'], i18nNamespace: 'toolDnsPropagation' , mode: 'server'},
  { path: '/dns-global-check', nameKey: 'tools.dns_global_check', icon: Globe, categoryKey: 'dns', keywords: ['dns', '全球', '解析', '检测'], i18nNamespace: 'toolDnsGlobalCheck' , mode: 'server'},
  { path: '/dnssec-check', nameKey: 'tools.dnssec_check', icon: ShieldCheck, categoryKey: 'dns', keywords: ['dns', 'dnssec', '签名', '校验'], i18nNamespace: 'toolDnssecCheck' , mode: 'server'},
  { path: '/dns-performance', nameKey: 'tools.dns_performance', icon: Activity, categoryKey: 'dns', keywords: ['dns', '性能', '响应', '可用性'], i18nNamespace: 'toolDnsPerformance' , mode: 'server'},
  { path: '/dns-ttl', nameKey: 'tools.dns_ttl', icon: Clock, categoryKey: 'dns', keywords: ['dns', 'ttl', '缓存'], i18nNamespace: 'toolDnsTtl' , mode: 'server'},
  { path: '/dns-soa', nameKey: 'tools.dns_soa', icon: Server, categoryKey: 'dns', keywords: ['dns', 'soa', '解析'], i18nNamespace: 'toolDnsSoa' , mode: 'server'},
  { path: '/dns-diagnose', nameKey: 'tools.dns_diagnose', icon: ShieldAlert, categoryKey: 'dns', keywords: ['dns', 'diagnose', '诊断', '失败'], i18nNamespace: 'toolDnsDiagnose' , mode: 'server'},
  { path: '/dns-pollution-check', nameKey: 'tools.dns_pollution_check', icon: AlertTriangle, categoryKey: 'dns', keywords: ['dns', 'pollution', '污染', '检测'], i18nNamespace: 'toolDnsPollutionCheck' , mode: 'server'},
  { path: '/dns-hijack-check', nameKey: 'tools.dns_hijack_check', icon: ShieldCheck, categoryKey: 'dns', keywords: ['dns', 'hijack', '劫持', '检测'], i18nNamespace: 'toolDnsHijackCheck' , mode: 'server'},
  { path: '/dns-cache-check', nameKey: 'tools.dns_cache_check', icon: Clock, categoryKey: 'dns', keywords: ['dns', 'cache', '缓存', 'ttl'], i18nNamespace: 'toolDnsCacheCheck' , mode: 'server'},
  { path: '/dns-loop-check', nameKey: 'tools.dns_loop_check', icon: RefreshCw, categoryKey: 'dns', keywords: ['dns', 'loop', '循环', 'cname'], i18nNamespace: 'toolDnsLoopCheck' , mode: 'server'},
  { path: '/dns-ns', nameKey: 'tools.dns_ns', icon: Server, categoryKey: 'dns', keywords: ['dns', 'ns', '名称服务器', 'nameserver'], i18nNamespace: 'toolDnsNs' , mode: 'server'},
  { path: '/dns-cname-chain', nameKey: 'tools.dns_cname_chain', icon: Link2, categoryKey: 'dns', keywords: ['dns', 'cname', '链', 'chain', '循环'], i18nNamespace: 'toolDnsCnameChain' , mode: 'server'},
  { path: '/dns-nxdomain', nameKey: 'tools.dns_nxdomain', icon: XCircle, categoryKey: 'dns', keywords: ['dns', 'nxdomain', '域名', '不存在'], i18nNamespace: 'toolDnsNxdomain' , mode: 'server'},
  { path: '/domain-mx', nameKey: 'tools.domain_mx', icon: Mail, categoryKey: 'domain', keywords: ['mx', '邮件', 'mail', '邮箱'], i18nNamespace: 'toolDomainMx' , mode: 'server'},
  { path: '/domain-txt', nameKey: 'tools.domain_txt', icon: FileText, categoryKey: 'domain', keywords: ['txt', 'spf', 'dkim', 'dmarc', '记录'], i18nNamespace: 'toolDomainTxt' , mode: 'server'},
  { path: '/http-headers', nameKey: 'tools.http_headers', icon: Globe, categoryKey: 'network', keywords: ['http', 'header', '响应头', '安全'], i18nNamespace: 'toolHttpHeaders' , mode: 'server'},
  { path: '/ssl-cert', nameKey: 'tools.ssl_cert', icon: ShieldCheck, categoryKey: 'network', keywords: ['ssl', 'tls', '证书', 'https'], i18nNamespace: 'toolSslCert' , mode: 'server'},
  { path: '/http-status', nameKey: 'tools.http_status', icon: Activity, categoryKey: 'network', keywords: ['http', 'status', '状态码', '可用性'], i18nNamespace: 'toolHttpStatus' , mode: 'server'},
  { path: '/tcp-port-check', nameKey: 'tools.tcp_port_check', icon: Wifi, categoryKey: 'network', keywords: ['tcp', 'port', '端口', '连通性'], i18nNamespace: 'toolTcpPort' , mode: 'server'},
  { path: '/ping', nameKey: 'tools.ping', icon: Radio, categoryKey: 'network', keywords: ['ping', '延迟', '可达性'], i18nNamespace: 'toolPing' , mode: 'server'},
  { path: '/dns-latency', nameKey: 'tools.dns_latency', icon: Activity, categoryKey: 'dns', keywords: ['dns', '延迟', '速度', '响应'], i18nNamespace: 'toolDnsLatency' , mode: 'server'},
  { path: '/dns-authoritative', nameKey: 'tools.dns_authoritative', icon: Server, categoryKey: 'dns', keywords: ['dns', '权威', 'ns', '一致性'], i18nNamespace: 'toolDnsAuthoritative' , mode: 'server'},
  { path: '/dns-recursive', nameKey: 'tools.dns_recursive', icon: Shield, categoryKey: 'dns', keywords: ['dns', '递归', '开放', 'amplification'], i18nNamespace: 'toolDnsRecursive' , mode: 'server'},
  { path: '/dns-path-viz', nameKey: 'tools.dns_path_viz', icon: GitBranch, categoryKey: 'dns', keywords: ['dns', '路径', '可视化', '递归'], i18nNamespace: 'toolDnsPathViz' , mode: 'server'},
  { path: '/dns-tunnel', nameKey: 'tools.dns_tunnel', icon: ShieldAlert, categoryKey: 'dns', keywords: ['dns', '隧道', '检测', '安全'], i18nNamespace: 'toolDnsTunnel' , mode: 'server'},
  { path: '/dhcp-pool-calc', nameKey: 'tools.dhcp_pool_calc', icon: Database, categoryKey: 'ipam', keywords: ['dhcp', '地址池', '计算', 'ip'], i18nNamespace: 'toolDhcpPoolCalc' },
  { path: '/dhcp-option', nameKey: 'tools.dhcp_option', icon: FileText, categoryKey: 'ipam', keywords: ['dhcp', 'option', '选项', '查询'], i18nNamespace: 'toolDhcpOption' },
  { path: '/dhcp-mac-binding', nameKey: 'tools.dhcp_mac_binding', icon: Link2, categoryKey: 'ipam', keywords: ['dhcp', 'mac', '绑定', '静态'], i18nNamespace: 'toolDhcpMacBinding' },
  { path: '/dhcp-config-gen', nameKey: 'tools.dhcp_config_gen', icon: FileCode, categoryKey: 'ipam', keywords: ['dhcp', '配置', '生成', 'isc', 'dnsmasq'], i18nNamespace: 'toolDhcpConfigGen' },
  { path: '/traceroute', nameKey: 'tools.traceroute', icon: Network, categoryKey: 'network', keywords: ['traceroute', '路由', '追踪', '网络'], i18nNamespace: 'toolTraceroute', mode: 'server' },
  { path: '/dhcp-utilization', nameKey: 'tools.dhcp_utilization', icon: BarChart2, categoryKey: 'ipam', keywords: ['dhcp', '利用率', '地址池', '统计'], i18nNamespace: 'toolDhcpUtilization' },
  { path: '/dhcp-conflict', nameKey: 'tools.dhcp_conflict', icon: AlertTriangle, categoryKey: 'ipam', keywords: ['dhcp', '冲突', '重复', 'ip'], i18nNamespace: 'toolDhcpConflict' },
  { path: '/gslb-weight-calc', nameKey: 'tools.gslb_weight_calc', icon: Sliders, categoryKey: 'network', keywords: ['gslb', '权重', '负载均衡', '流量'], i18nNamespace: 'toolGslbWeightCalc' },
  { path: '/web-availability', nameKey: 'tools.web_availability', icon: Globe, categoryKey: 'network', keywords: ['http', '可用性', '监控', '状态'], i18nNamespace: 'toolWebAvailability', mode: 'server' },
  { path: '/security-domain-score', nameKey: 'tools.security_domain_score', icon: ShieldCheck, categoryKey: 'security', keywords: ['安全', '评分', 'dnssec', 'spf', 'dmarc'], i18nNamespace: 'toolSecurityDomainScore', mode: 'server' },
  { path: '/gslb-failover-sim', nameKey: 'tools.gslb_failover_sim', icon: Zap, categoryKey: 'network', keywords: ['gslb', '故障', '切换', '模拟', 'failover'], i18nNamespace: 'toolGslbFailoverSim' },
  { path: '/gslb-geo-sim', nameKey: 'tools.gslb_geo_sim', icon: MapPin, categoryKey: 'network', keywords: ['gslb', 'geo', '地理', '解析', '模拟'], i18nNamespace: 'toolGslbGeoSim' },
  { path: '/security-dnssec-verify', nameKey: 'tools.security_dnssec_verify', icon: ShieldCheck, categoryKey: 'security', keywords: ['dnssec', '签名', '验证', '信任链'], i18nNamespace: 'toolSecurityDnssecVerify', mode: 'server' },
  { path: '/security-dns-ddos', nameKey: 'tools.security_dns_ddos', icon: ShieldAlert, categoryKey: 'security', keywords: ['ddos', 'dns', '放大', '攻击', '风险'], i18nNamespace: 'toolSecurityDnsDdos', mode: 'server' },
  { path: '/cdn-check', nameKey: 'tools.cdn_check', icon: Globe, categoryKey: 'network', keywords: ['cdn', '检测', 'cloudflare', '阿里云'], i18nNamespace: 'toolCdnCheck', mode: 'server' },
  { path: '/dhcp-discover-sim', nameKey: 'tools.dhcp_discover_sim', icon: Wifi, categoryKey: 'network', keywords: ['dhcp', 'discover', '握手', '模拟'], i18nNamespace: 'toolDhcpDiscoverSim' },
  { path: '/ipam-subnet-util', nameKey: 'tools.ipam_subnet_util', icon: BarChart2, categoryKey: 'ipam', keywords: ['子网', '利用率', 'cidr', 'ip'], i18nNamespace: 'toolIpamSubnetUtil' },
  { path: '/gslb-health-sim', nameKey: 'tools.gslb_health_sim', icon: Heart, categoryKey: 'network', keywords: ['gslb', '健康', '检查', '模拟'], i18nNamespace: 'toolGslbHealthSim' },
  { path: '/gslb-latency-sim', nameKey: 'tools.gslb_latency_sim', icon: Zap, categoryKey: 'network', keywords: ['gslb', '延迟', '调度', '模拟'], i18nNamespace: 'toolGslbLatencySim' },
  { path: '/server-latency', nameKey: 'tools.server_latency', icon: Activity, categoryKey: 'network', keywords: ['延迟', '测速', '服务器', 'ping'], i18nNamespace: 'toolServerLatency', mode: 'server' },
  { path: '/dhcp-lease-analysis', nameKey: 'tools.dhcp_lease_analysis', icon: FileText, categoryKey: 'network', keywords: ['dhcp', 'lease', '租约', '分析'], i18nNamespace: 'toolDhcpLeaseAnalysis' },
  { path: '/ipam-visualize', nameKey: 'tools.ipam_visualize', icon: Boxes, categoryKey: 'ipam', keywords: ['ip', '可视化', '子网', '树状图'], i18nNamespace: 'toolIpamVisualize' },
  { path: '/gslb-policy-sim', nameKey: 'tools.gslb_policy_sim', icon: Sliders, categoryKey: 'network', keywords: ['gslb', '策略', '轮询', '权重'], i18nNamespace: 'toolGslbPolicySim' },
  { path: '/gslb-rule-validate', nameKey: 'tools.gslb_rule_validate', icon: CheckCircle, categoryKey: 'network', keywords: ['gslb', '规则', '验证', '校验'], i18nNamespace: 'toolGslbRuleValidate' },
  { path: '/api-availability', nameKey: 'tools.api_availability', icon: Activity, categoryKey: 'network', keywords: ['api', '可用性', '健康检查', 'http'], i18nNamespace: 'toolApiAvailability', mode: 'server' },
  { path: '/gslb-isp-sim', nameKey: 'tools.gslb_isp_sim', icon: Radio, categoryKey: 'network', keywords: ['gslb', '运营商', 'isp', '移动', '联通'], i18nNamespace: 'toolGslbIspSim' },
  { path: '/gslb-traffic-predict', nameKey: 'tools.gslb_traffic_predict', icon: TrendingUp, categoryKey: 'network', keywords: ['gslb', '流量', '预测', '容量', 'qps'], i18nNamespace: 'toolGslbTrafficPredict' },
  { path: '/gslb-hit-predict', nameKey: 'tools.gslb_hit_predict', icon: Target, categoryKey: 'network', keywords: ['gslb', '命中', '预测', 'dns', '解析'], i18nNamespace: 'toolGslbHitPredict' },
  { path: '/ipam-reclaim', nameKey: 'tools.ipam_reclaim', icon: Trash2, categoryKey: 'ipam', keywords: ['ip', '回收', '闲置', 'ipam'], i18nNamespace: 'toolIpamReclaim' },
  { path: '/security-domain-hijack', nameKey: 'tools.security_domain_hijack', icon: ShieldAlert, categoryKey: 'security', keywords: ['劫持', 'dns', '安全', '域名'], i18nNamespace: 'toolSecurityDomainHijack', mode: 'server' },
  { path: '/dhcp-log-analysis', nameKey: 'tools.dhcp_log_analysis', icon: FileText, categoryKey: 'network', keywords: ['dhcp', '日志', '分析', 'syslog'], i18nNamespace: 'toolDhcpLogAnalysis' },
  { path: '/dhcp-scan', nameKey: 'tools.dhcp_scan', icon: Radar, categoryKey: 'network', keywords: ['dhcp', '扫描', '发现', 'rogue'], i18nNamespace: 'toolDhcpScan' },
  { path: '/ipam-changelog', nameKey: 'tools.ipam_changelog', icon: Clock, categoryKey: 'ipam', keywords: ['ip', '变更', '记录', '审计'], i18nNamespace: 'toolIpamChangelog' },
  { path: '/ipam-scan', nameKey: 'tools.ipam_scan', icon: Search, categoryKey: 'ipam', keywords: ['ip', '扫描', '存活', 'ping'], i18nNamespace: 'toolIpamScan' },
  { path: '/pomodoro', nameKey: 'tools.pomodoro', icon: Timer, categoryKey: 'life', keywords: ['番茄钟', '专注', '计时', 'pomodoro'], i18nNamespace: 'toolPomodoro' },
  { path: '/habit-tracker', nameKey: 'tools.habit_tracker', icon: CheckSquare, categoryKey: 'life', keywords: ['习惯', '打卡', '连续', '追踪'], i18nNamespace: 'toolHabitTracker' },
  { path: '/salary-calc', nameKey: 'tools.salary_calc', icon: DollarSign, categoryKey: 'life', keywords: ['工资', '税后', '五险一金', '个税'], i18nNamespace: 'toolSalaryCalc' },
  { path: '/currency-converter', nameKey: 'tools.currency_converter', icon: ArrowLeftRight, categoryKey: 'life', keywords: ['汇率', '换算', '货币', '外汇'], i18nNamespace: 'toolCurrencyConverter' },
  { path: '/jwt-decoder', nameKey: 'tools.jwt_decoder', icon: KeyRound, categoryKey: 'dev', keywords: ['jwt', 'token', '解析', '解码'], i18nNamespace: 'toolJwtDecoder' },
  { path: '/expense-tracker', nameKey: 'tools.expense_tracker', icon: Receipt, categoryKey: 'life', keywords: ['记账', '支出', '消费', '财务'], i18nNamespace: 'toolExpenseTracker' },
  { path: '/subscription-manager', nameKey: 'tools.subscription_manager', icon: CreditCard, categoryKey: 'life', keywords: ['订阅', 'netflix', 'ai', '费用'], i18nNamespace: 'toolSubscriptionManager' },
  { path: '/calorie-calc', nameKey: 'tools.calorie_calc', icon: Flame, categoryKey: 'life', keywords: ['卡路里', '热量', '饮食', '营养'], i18nNamespace: 'toolCalorieCalc' },
  { path: '/random-menu', nameKey: 'tools.random_menu', icon: UtensilsCrossed, categoryKey: 'life', keywords: ['菜单', '吃什么', '随机', '美食'], i18nNamespace: 'toolRandomMenu' },
  { path: '/curl-to-fetch', nameKey: 'tools.curl_to_fetch', icon: ArrowRightLeft, categoryKey: 'dev', keywords: ['curl', 'fetch', 'http', '转换'], i18nNamespace: 'toolCurlToFetch' },
  { path: '/domain-spf', nameKey: 'tools.domain_spf', icon: ShieldCheck, categoryKey: 'domain', keywords: ['spf', 'mail', 'policy', '邮件'], i18nNamespace: 'toolDomainSpf' , mode: 'server'},
  { path: '/domain-dkim', nameKey: 'tools.domain_dkim', icon: Key, categoryKey: 'domain', keywords: ['dkim', 'selector', 'mail', '签名'], i18nNamespace: 'toolDomainDkim' , mode: 'server'},
  { path: '/domain-dmarc', nameKey: 'tools.domain_dmarc', icon: FileSearch, categoryKey: 'domain', keywords: ['dmarc', 'mail', 'policy', '报告'], i18nNamespace: 'toolDomainDmarc' , mode: 'server'},
  { path: '/domain-ttl-advice', nameKey: 'tools.domain_ttl_advice', icon: Clock, categoryKey: 'domain', keywords: ['ttl', 'domain', '缓存', '优化'], i18nNamespace: 'toolDomainTtlAdvice' , mode: 'server'},
  { path: '/domain-ns-check', nameKey: 'tools.domain_ns_check', icon: Server, categoryKey: 'domain', keywords: ['ns', 'nameserver', '权威'], i18nNamespace: 'toolDomainNsCheck' , mode: 'server'},
  { path: '/domain-subdomain-scan', nameKey: 'tools.domain_subdomain_scan', icon: Search, categoryKey: 'domain', keywords: ['subdomain', 'scan', '子域'], i18nNamespace: 'toolDomainSubdomainScan' , mode: 'server'},
  { path: '/domain-wildcard', nameKey: 'tools.domain_wildcard', icon: Route, categoryKey: 'domain', keywords: ['wildcard', 'dns', '泛解析'], i18nNamespace: 'toolDomainWildcard' , mode: 'server'},
  { path: '/domain-health-score', nameKey: 'tools.domain_health_score', icon: Activity, categoryKey: 'domain', keywords: ['health', 'score', 'domain', '健康'], i18nNamespace: 'toolDomainHealthScore' , mode: 'server'},
  { path: '/ip-geo', nameKey: 'tools.ip_geo', icon: Globe, categoryKey: 'ip', keywords: ['geo', 'ip', 'location', '地理'], i18nNamespace: 'toolIpGeo' , mode: 'server'},
  { path: '/ip-ptr', nameKey: 'tools.ip_ptr', icon: Fingerprint, categoryKey: 'ip', keywords: ['ptr', 'reverse', 'rdns'], i18nNamespace: 'toolIpPtr' , mode: 'server'},
  { path: '/ip-v4-to-v6', nameKey: 'tools.ip_v4_to_v6', icon: RefreshCw, categoryKey: 'ip', keywords: ['ipv4', 'ipv6', '转换'], i18nNamespace: 'toolIpV4ToV6' },
  { path: '/ip-binary-hex', nameKey: 'tools.ip_binary_hex', icon: Hash, categoryKey: 'ip', keywords: ['binary', 'hex', 'ip', '转换'], i18nNamespace: 'toolIpBinaryHex' },
  { path: '/ip-class', nameKey: 'tools.ip_class', icon: ShieldCheck, categoryKey: 'ip', keywords: ['class', 'private', 'public', '分类'], i18nNamespace: 'toolIpClass' },
  { path: '/ip-public', nameKey: 'tools.ip_public', icon: Cloud, categoryKey: 'ip', keywords: ['public', '出口', '公网'], i18nNamespace: 'toolIpPublic' },
  { path: '/ip-cdn-check', nameKey: 'tools.ip_cdn_check', icon: Radar, categoryKey: 'ip', keywords: ['cdn', 'edge', 'ip', '节点'], i18nNamespace: 'toolIpCdnCheck' , mode: 'server'},
  { path: '/ip-blacklist', nameKey: 'tools.ip_blacklist', icon: ShieldBan, categoryKey: 'ip', keywords: ['ip', 'blacklist', 'dnsbl', '黑名单'], i18nNamespace: 'toolIpBlacklist' , mode: 'server'},
  { path: '/security-ip-score', nameKey: 'tools.security_ip_score', icon: ShieldAlert, categoryKey: 'security', keywords: ['security', 'ip', 'risk', '安全', '评分'], i18nNamespace: 'toolSecurityIpScore' , mode: 'server'},
  { path: '/security-domain-blacklist', nameKey: 'tools.security_domain_blacklist', icon: ShieldBan, categoryKey: 'security', keywords: ['security', 'domain', 'blacklist', '域名', '黑名单'], i18nNamespace: 'toolSecurityDomainBlacklist' , mode: 'server'},
  { path: '/security-port-scan', nameKey: 'tools.security_port_scan', icon: Radar, categoryKey: 'security', keywords: ['security', 'port', 'scan', '端口', '扫描'], i18nNamespace: 'toolSecurityPortScan' , mode: 'server'},
  { path: '/security-dns-vuln', nameKey: 'tools.security_dns_vuln', icon: ShieldCheck, categoryKey: 'security', keywords: ['security', 'dns', 'vuln', '漏洞', '配置'], i18nNamespace: 'toolSecurityDnsVuln' , mode: 'server'},
  { path: '/security-report-gen', nameKey: 'tools.security_report_gen', icon: FileSearch, categoryKey: 'security', keywords: ['security', 'report', '网络', '报告'], i18nNamespace: 'toolSecurityReportGen' , mode: 'server'},
  { path: '/ipam-plan', nameKey: 'tools.ipam_plan', icon: Boxes, categoryKey: 'ipam', keywords: ['ipam', 'plan', 'vlsm', '规划'], i18nNamespace: 'toolIpamPlan' , mode: 'server'},
  { path: '/ipam-inventory', nameKey: 'tools.ipam_inventory', icon: Boxes, categoryKey: 'ipam', keywords: ['ipam', 'inventory', '库存'], i18nNamespace: 'toolIpamInventory' , mode: 'server'},
  { path: '/ipam-usage', nameKey: 'tools.ipam_usage', icon: Activity, categoryKey: 'ipam', keywords: ['ipam', 'usage', 'utilization', '使用率'], i18nNamespace: 'toolIpamUsage' , mode: 'server'},
  { path: '/ipam-conflict', nameKey: 'tools.ipam_conflict', icon: GitCompareArrows, categoryKey: 'ipam', keywords: ['ipam', 'conflict', 'overlap', '冲突'], i18nNamespace: 'toolIpamConflict' , mode: 'server'},
  { path: '/ipam-allocation-sim', nameKey: 'tools.ipam_allocation_sim', icon: PlayCircle, categoryKey: 'ipam', keywords: ['ipam', 'allocation', 'simulation', '分配'], i18nNamespace: 'toolIpamAllocationSim' , mode: 'server'},
  { path: '/cidr-calculator', nameKey: 'tools.cidr_calculator', icon: Ruler, categoryKey: 'ipam', keywords: ['cidr', '子网', '范围'], i18nNamespace: 'toolCidrCalculator' },
  { path: '/subnet-divide', nameKey: 'tools.subnet_divide', icon: GitCompareArrows, categoryKey: 'ipam', keywords: ['subnet', 'divide', '划分'], i18nNamespace: 'toolSubnetDivide' },
  { path: '/subnet-network-addr', nameKey: 'tools.subnet_network_addr', icon: Route, categoryKey: 'ipam', keywords: ['network', 'address', '网络号'], i18nNamespace: 'toolSubnetNetworkAddr' },
  { path: '/subnet-broadcast', nameKey: 'tools.subnet_broadcast', icon: AlertTriangle, categoryKey: 'ipam', keywords: ['broadcast', '广播地址'], i18nNamespace: 'toolSubnetBroadcast' },
  { path: '/subnet-mask', nameKey: 'tools.subnet_mask', icon: Ruler, categoryKey: 'ipam', keywords: ['mask', 'prefix', '掩码'], i18nNamespace: 'toolSubnetMask' },
  { path: '/ip-range', nameKey: 'tools.ip_range', icon: Link2, categoryKey: 'ipam', keywords: ['range', 'ip', '范围'], i18nNamespace: 'toolIpRange' },
  { path: '/subnet-capacity', nameKey: 'tools.subnet_capacity', icon: Boxes, categoryKey: 'ipam', keywords: ['capacity', 'usable', '容量'], i18nNamespace: 'toolSubnetCapacity' },
  { path: '/ipv6-cidr', nameKey: 'tools.ipv6_cidr', icon: Hash, categoryKey: 'ipam', keywords: ['ipv6', 'cidr', '前缀'], i18nNamespace: 'toolIpv6Cidr' },
  { path: '/vlsm', nameKey: 'tools.vlsm', icon: Boxes, categoryKey: 'ipam', keywords: ['vlsm', '规划', '子网'], i18nNamespace: 'toolVlsm' },
  { path: '/network-planner', nameKey: 'tools.network_planner', icon: FileSearch, categoryKey: 'ipam', keywords: ['network', 'planner', '规划'], i18nNamespace: 'toolNetworkPlanner' },
  { path: '/json', nameKey: 'tools.json', icon: Braces, categoryKey: 'dev', keywords: ['json'], i18nNamespace: 'toolJson' },
  { path: '/format-converter', nameKey: 'tools.format_converter', icon: Braces, categoryKey: 'dev', keywords: ['yaml', 'xml', '格式转换'] },
  { path: '/base64', nameKey: 'tools.base64', icon: FileCode, categoryKey: 'dev', keywords: ['base64'] },
  { path: '/timestamp', nameKey: 'tools.timestamp', icon: Clock, categoryKey: 'dev', keywords: ['时间戳'] },
  { path: '/url', nameKey: 'tools.url', icon: Link2, categoryKey: 'dev', keywords: ['url', '编解码'] },
  { path: '/regex', nameKey: 'tools.regex', icon: Shuffle, categoryKey: 'dev', keywords: ['正则'] },
  { path: '/cron', nameKey: 'tools.cron', icon: Calendar, categoryKey: 'dev', keywords: ['cron'] },
  { path: '/password', nameKey: 'tools.password', icon: Key, categoryKey: 'dev', keywords: ['密码'] },
  { path: '/hash', nameKey: 'tools.hash', icon: Fingerprint, categoryKey: 'dev', keywords: ['hash', 'md5', 'sha'] },
  { path: '/code', nameKey: 'tools.code', icon: Code, categoryKey: 'dev', keywords: ['代码', '格式化'] },
  { path: '/uuid', nameKey: 'tools.uuid', icon: Hash, categoryKey: 'dev', keywords: ['uuid'] },
  { path: '/text-comparator', nameKey: 'tools.text_comparator', icon: Shuffle, categoryKey: 'dev', keywords: ['文本对比', 'diff'] },
  { path: '/image-compressor', nameKey: 'tools.image_compressor', icon: Image, categoryKey: 'utils', keywords: ['图片压缩'] },
  { path: '/image-background-remover', nameKey: 'tools.image_bg_remover', icon: Eraser, categoryKey: 'utils', keywords: ['去背景'] },
  { path: '/markdown', nameKey: 'tools.markdown', icon: FileText, categoryKey: 'utils', keywords: ['markdown'] },
  { path: '/bmi', nameKey: 'tools.bmi', icon: Heart, categoryKey: 'utils', keywords: ['bmi'] },
  { path: '/color-picker', nameKey: 'tools.color_picker', icon: Palette, categoryKey: 'utils', keywords: ['颜色'] },
  { path: '/unit-converter', nameKey: 'tools.unit_converter', icon: Ruler, categoryKey: 'utils', keywords: ['单位换算'] },
  { path: '/pdf-tools', nameKey: 'tools.pdf_tools', icon: File, categoryKey: 'utils', keywords: ['pdf'] },
  { path: '/sheet-editor', nameKey: 'tools.sheet_editor', icon: FileText, categoryKey: 'utils', keywords: ['csv', 'excel', '表格'] },
  { path: '/short-link', nameKey: 'tools.short_link', icon: Link2, categoryKey: 'utils', keywords: ['短链接'] },
  { path: '/resume-generator', nameKey: 'tools.resume', icon: FileText, categoryKey: 'utils', keywords: ['简历'] },
  { path: '/color-generator', nameKey: 'tools.color_generator', icon: Palette, categoryKey: 'utils', keywords: ['配色'] },
  { path: '/meme-generator', nameKey: 'tools.meme_generator', icon: Wand2, categoryKey: 'utils', keywords: ['表情包'] },
  { path: '/copywriting-generator', nameKey: 'tools.copywriting_generator', icon: FileText, categoryKey: 'utils', keywords: ['文案'] },
  { path: '/wooden-fish', nameKey: 'tools.wooden_fish', icon: Heart, categoryKey: 'utils', keywords: ['木鱼'] },
  { path: '/life-progress', nameKey: 'tools.life_progress', icon: Clock, categoryKey: 'utils', keywords: ['人生进度'] },
  { path: '/meeting-minutes', nameKey: 'tools.meeting_minutes', icon: FileText, categoryKey: 'ai', keywords: ['会议纪要', 'transcript', 'minutes'] },
  { path: '/ui-generator', nameKey: 'tools.ui_generator', icon: Wand2, categoryKey: 'ai', keywords: ['ui', 'wireframe', '设计生成'] },
  { path: '/ppt-generator', nameKey: 'tools.ppt_generator', icon: Presentation, categoryKey: 'ai', keywords: ['ppt', '演示', '幻灯片', 'ai'], i18nNamespace: 'toolPptGenerator' },
]

export const TOOLS_BY_PATH = new Map(TOOLS.map((t) => [t.path, t]))

export function getToolsForNav() {
  return TOOLS.filter((t) => t.path !== '/')
}

export function getToolByPath(path: string): ToolEntry | undefined {
  return TOOLS_BY_PATH.get(path)
}

/** 工具展示标题：优先使用工具自带 i18n namespace 的 title，否则用 nav.nameKey */
export function getToolTitle(
  tool: ToolEntry,
  t: (key: string) => string
): string {
  if (tool.i18nNamespace) return t(`${tool.i18nNamespace}:title`)
  return t(tool.nameKey)
}

/** 工具展示描述：优先使用工具自带 i18n namespace 的 description，否则用 home.toolDesc.* */
export function getToolDescription(
  tool: ToolEntry,
  t: (key: string) => string,
  tHome: (key: string) => string
): string {
  if (tool.i18nNamespace) return t(`${tool.i18nNamespace}:description`)
  const descKey = tool.nameKey.replace('tools.', '')
  return tHome(`toolDesc.${descKey}`)
}
