import type { LucideIcon } from 'lucide-react'
import {
  Home, Star, QrCode, Newspaper, MapPin, Cloud, Code, FileCode, Clock, Link2,
  Shuffle, Calendar, Key, Fingerprint, Braces, Hash, Image, FileText, Heart, Mail, XCircle,
  AlertTriangle, RefreshCw,
  Palette, Wand2, Eraser, Ruler, Search, File, Globe, Server, Route,
  Presentation, ShieldCheck, Activity, ShieldAlert, ShieldBan, Radar, FileSearch,
  Boxes, GitCompareArrows, PlayCircle, Wifi, Radio
} from 'lucide-react'

export interface ToolEntry {
  path: string
  nameKey: string
  icon: LucideIcon
  categoryKey?: string
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
  { path: '/news', nameKey: 'tools.news', icon: Newspaper, categoryKey: 'news', keywords: ['热点', '新闻'] },
  { path: '/zipcode', nameKey: 'tools.zipcode', icon: MapPin, categoryKey: 'query', keywords: ['邮编', 'zip'] },
  { path: '/weather', nameKey: 'tools.weather', icon: Cloud, categoryKey: 'query', keywords: ['天气'] },
  { path: '/github-info', nameKey: 'tools.github_info', icon: FileSearch, categoryKey: 'dev', keywords: ['github', 'token', 'repo', 'user'], i18nNamespace: 'toolGithubInfo' },
  { path: '/ip-query', nameKey: 'tools.ip_query', icon: Globe, categoryKey: 'network', keywords: ['ip'], i18nNamespace: 'toolIpQuery' },
  { path: '/ip-asn', nameKey: 'tools.ip_asn', icon: Globe, categoryKey: 'network', keywords: ['asn', 'as', '归属'], i18nNamespace: 'toolIpAsn' },
  { path: '/dns-query', nameKey: 'tools.dns_query', icon: Server, categoryKey: 'network', keywords: ['dns', '域名', '解析'] },
  { path: '/dns-trace', nameKey: 'tools.dns_trace', icon: Route, categoryKey: 'network', keywords: ['dns', 'trace', '递归', '追踪'], i18nNamespace: 'toolDnsTrace' },
  { path: '/dns-propagation', nameKey: 'tools.dns_propagation', icon: Globe, categoryKey: 'network', keywords: ['dns', 'propagation', '传播', '检测'], i18nNamespace: 'toolDnsPropagation' },
  { path: '/dns-global-check', nameKey: 'tools.dns_global_check', icon: Globe, categoryKey: 'network', keywords: ['dns', '全球', '解析', '检测'], i18nNamespace: 'toolDnsGlobalCheck' },
  { path: '/dnssec-check', nameKey: 'tools.dnssec_check', icon: ShieldCheck, categoryKey: 'network', keywords: ['dns', 'dnssec', '签名', '校验'], i18nNamespace: 'toolDnssecCheck' },
  { path: '/dns-performance', nameKey: 'tools.dns_performance', icon: Activity, categoryKey: 'network', keywords: ['dns', '性能', '响应', '可用性'], i18nNamespace: 'toolDnsPerformance' },
  { path: '/dns-ttl', nameKey: 'tools.dns_ttl', icon: Clock, categoryKey: 'network', keywords: ['dns', 'ttl', '缓存'], i18nNamespace: 'toolDnsTtl' },
  { path: '/dns-soa', nameKey: 'tools.dns_soa', icon: Server, categoryKey: 'network', keywords: ['dns', 'soa', '解析'], i18nNamespace: 'toolDnsSoa' },
  { path: '/dns-diagnose', nameKey: 'tools.dns_diagnose', icon: ShieldAlert, categoryKey: 'network', keywords: ['dns', 'diagnose', '诊断', '失败'], i18nNamespace: 'toolDnsDiagnose' },
  { path: '/dns-pollution-check', nameKey: 'tools.dns_pollution_check', icon: AlertTriangle, categoryKey: 'network', keywords: ['dns', 'pollution', '污染', '检测'], i18nNamespace: 'toolDnsPollutionCheck' },
  { path: '/dns-hijack-check', nameKey: 'tools.dns_hijack_check', icon: ShieldCheck, categoryKey: 'network', keywords: ['dns', 'hijack', '劫持', '检测'], i18nNamespace: 'toolDnsHijackCheck' },
  { path: '/dns-cache-check', nameKey: 'tools.dns_cache_check', icon: Clock, categoryKey: 'network', keywords: ['dns', 'cache', '缓存', 'ttl'], i18nNamespace: 'toolDnsCacheCheck' },
  { path: '/dns-loop-check', nameKey: 'tools.dns_loop_check', icon: RefreshCw, categoryKey: 'network', keywords: ['dns', 'loop', '循环', 'cname'], i18nNamespace: 'toolDnsLoopCheck' },
  { path: '/dns-ns', nameKey: 'tools.dns_ns', icon: Server, categoryKey: 'network', keywords: ['dns', 'ns', '名称服务器', 'nameserver'], i18nNamespace: 'toolDnsNs' },
  { path: '/dns-cname-chain', nameKey: 'tools.dns_cname_chain', icon: Link2, categoryKey: 'network', keywords: ['dns', 'cname', '链', 'chain', '循环'], i18nNamespace: 'toolDnsCnameChain' },
  { path: '/dns-nxdomain', nameKey: 'tools.dns_nxdomain', icon: XCircle, categoryKey: 'network', keywords: ['dns', 'nxdomain', '域名', '不存在'], i18nNamespace: 'toolDnsNxdomain' },
  { path: '/domain-mx', nameKey: 'tools.domain_mx', icon: Mail, categoryKey: 'network', keywords: ['mx', '邮件', 'mail', '邮箱'], i18nNamespace: 'toolDomainMx' },
  { path: '/domain-txt', nameKey: 'tools.domain_txt', icon: FileText, categoryKey: 'network', keywords: ['txt', 'spf', 'dkim', 'dmarc', '记录'], i18nNamespace: 'toolDomainTxt' }
  { path: '/http-headers', nameKey: 'tools.http_headers', icon: Globe, categoryKey: 'network', keywords: ['http', 'header', '响应头', '安全'], i18nNamespace: 'toolHttpHeaders' },
  { path: '/ssl-cert', nameKey: 'tools.ssl_cert', icon: ShieldCheck, categoryKey: 'network', keywords: ['ssl', 'tls', '证书', 'https'], i18nNamespace: 'toolSslCert' },
  { path: '/http-status', nameKey: 'tools.http_status', icon: Activity, categoryKey: 'network', keywords: ['http', 'status', '状态码', '可用性'], i18nNamespace: 'toolHttpStatus' },
  { path: '/tcp-port-check', nameKey: 'tools.tcp_port_check', icon: Wifi, categoryKey: 'network', keywords: ['tcp', 'port', '端口', '连通性'], i18nNamespace: 'toolTcpPort' },
  { path: '/ping', nameKey: 'tools.ping', icon: Radio, categoryKey: 'network', keywords: ['ping', '延迟', '可达性'], i18nNamespace: 'toolPing' },,
  { path: '/domain-spf', nameKey: 'tools.domain_spf', icon: ShieldCheck, categoryKey: 'network', keywords: ['spf', 'mail', 'policy', '邮件'], i18nNamespace: 'toolDomainSpf' },
  { path: '/domain-dkim', nameKey: 'tools.domain_dkim', icon: Key, categoryKey: 'network', keywords: ['dkim', 'selector', 'mail', '签名'], i18nNamespace: 'toolDomainDkim' },
  { path: '/domain-dmarc', nameKey: 'tools.domain_dmarc', icon: FileSearch, categoryKey: 'network', keywords: ['dmarc', 'mail', 'policy', '报告'], i18nNamespace: 'toolDomainDmarc' },
  { path: '/domain-ttl-advice', nameKey: 'tools.domain_ttl_advice', icon: Clock, categoryKey: 'network', keywords: ['ttl', 'domain', '缓存', '优化'], i18nNamespace: 'toolDomainTtlAdvice' },
  { path: '/domain-ns-check', nameKey: 'tools.domain_ns_check', icon: Server, categoryKey: 'network', keywords: ['ns', 'nameserver', '权威'], i18nNamespace: 'toolDomainNsCheck' },
  { path: '/domain-subdomain-scan', nameKey: 'tools.domain_subdomain_scan', icon: Search, categoryKey: 'network', keywords: ['subdomain', 'scan', '子域'], i18nNamespace: 'toolDomainSubdomainScan' },
  { path: '/domain-wildcard', nameKey: 'tools.domain_wildcard', icon: Route, categoryKey: 'network', keywords: ['wildcard', 'dns', '泛解析'], i18nNamespace: 'toolDomainWildcard' },
  { path: '/domain-health-score', nameKey: 'tools.domain_health_score', icon: Activity, categoryKey: 'network', keywords: ['health', 'score', 'domain', '健康'], i18nNamespace: 'toolDomainHealthScore' },
  { path: '/ip-geo', nameKey: 'tools.ip_geo', icon: Globe, categoryKey: 'network', keywords: ['geo', 'ip', 'location', '地理'], i18nNamespace: 'toolIpGeo' },
  { path: '/ip-ptr', nameKey: 'tools.ip_ptr', icon: Fingerprint, categoryKey: 'network', keywords: ['ptr', 'reverse', 'rdns'], i18nNamespace: 'toolIpPtr' },
  { path: '/ip-v4-to-v6', nameKey: 'tools.ip_v4_to_v6', icon: RefreshCw, categoryKey: 'network', keywords: ['ipv4', 'ipv6', '转换'], i18nNamespace: 'toolIpV4ToV6' },
  { path: '/ip-binary-hex', nameKey: 'tools.ip_binary_hex', icon: Hash, categoryKey: 'network', keywords: ['binary', 'hex', 'ip', '转换'], i18nNamespace: 'toolIpBinaryHex' },
  { path: '/ip-class', nameKey: 'tools.ip_class', icon: ShieldCheck, categoryKey: 'network', keywords: ['class', 'private', 'public', '分类'], i18nNamespace: 'toolIpClass' },
  { path: '/ip-public', nameKey: 'tools.ip_public', icon: Cloud, categoryKey: 'network', keywords: ['public', '出口', '公网'], i18nNamespace: 'toolIpPublic' },
  { path: '/ip-cdn-check', nameKey: 'tools.ip_cdn_check', icon: Radar, categoryKey: 'network', keywords: ['cdn', 'edge', 'ip', '节点'], i18nNamespace: 'toolIpCdnCheck' },
  { path: '/ip-blacklist', nameKey: 'tools.ip_blacklist', icon: ShieldBan, categoryKey: 'network', keywords: ['ip', 'blacklist', 'dnsbl', '黑名单'], i18nNamespace: 'toolIpBlacklist' },
  { path: '/security-ip-score', nameKey: 'tools.security_ip_score', icon: ShieldAlert, categoryKey: 'network', keywords: ['security', 'ip', 'risk', '安全', '评分'], i18nNamespace: 'toolSecurityIpScore' },
  { path: '/security-domain-blacklist', nameKey: 'tools.security_domain_blacklist', icon: ShieldBan, categoryKey: 'network', keywords: ['security', 'domain', 'blacklist', '域名', '黑名单'], i18nNamespace: 'toolSecurityDomainBlacklist' },
  { path: '/security-port-scan', nameKey: 'tools.security_port_scan', icon: Radar, categoryKey: 'network', keywords: ['security', 'port', 'scan', '端口', '扫描'], i18nNamespace: 'toolSecurityPortScan' },
  { path: '/security-dns-vuln', nameKey: 'tools.security_dns_vuln', icon: ShieldCheck, categoryKey: 'network', keywords: ['security', 'dns', 'vuln', '漏洞', '配置'], i18nNamespace: 'toolSecurityDnsVuln' },
  { path: '/security-report-gen', nameKey: 'tools.security_report_gen', icon: FileSearch, categoryKey: 'network', keywords: ['security', 'report', '网络', '报告'], i18nNamespace: 'toolSecurityReportGen' },
  { path: '/ipam-plan', nameKey: 'tools.ipam_plan', icon: Boxes, categoryKey: 'network', keywords: ['ipam', 'plan', 'vlsm', '规划'], i18nNamespace: 'toolIpamPlan' },
  { path: '/ipam-inventory', nameKey: 'tools.ipam_inventory', icon: Boxes, categoryKey: 'network', keywords: ['ipam', 'inventory', '库存'], i18nNamespace: 'toolIpamInventory' },
  { path: '/ipam-usage', nameKey: 'tools.ipam_usage', icon: Activity, categoryKey: 'network', keywords: ['ipam', 'usage', 'utilization', '使用率'], i18nNamespace: 'toolIpamUsage' },
  { path: '/ipam-conflict', nameKey: 'tools.ipam_conflict', icon: GitCompareArrows, categoryKey: 'network', keywords: ['ipam', 'conflict', 'overlap', '冲突'], i18nNamespace: 'toolIpamConflict' },
  { path: '/ipam-allocation-sim', nameKey: 'tools.ipam_allocation_sim', icon: PlayCircle, categoryKey: 'network', keywords: ['ipam', 'allocation', 'simulation', '分配'], i18nNamespace: 'toolIpamAllocationSim' },
  { path: '/cidr-calculator', nameKey: 'tools.cidr_calculator', icon: Ruler, categoryKey: 'network', keywords: ['cidr', '子网', '范围'], i18nNamespace: 'toolCidrCalculator' },
  { path: '/subnet-divide', nameKey: 'tools.subnet_divide', icon: GitCompareArrows, categoryKey: 'network', keywords: ['subnet', 'divide', '划分'], i18nNamespace: 'toolSubnetDivide' },
  { path: '/subnet-network-addr', nameKey: 'tools.subnet_network_addr', icon: Route, categoryKey: 'network', keywords: ['network', 'address', '网络号'], i18nNamespace: 'toolSubnetNetworkAddr' },
  { path: '/subnet-broadcast', nameKey: 'tools.subnet_broadcast', icon: AlertTriangle, categoryKey: 'network', keywords: ['broadcast', '广播地址'], i18nNamespace: 'toolSubnetBroadcast' },
  { path: '/subnet-mask', nameKey: 'tools.subnet_mask', icon: Ruler, categoryKey: 'network', keywords: ['mask', 'prefix', '掩码'], i18nNamespace: 'toolSubnetMask' },
  { path: '/ip-range', nameKey: 'tools.ip_range', icon: Link2, categoryKey: 'network', keywords: ['range', 'ip', '范围'], i18nNamespace: 'toolIpRange' },
  { path: '/subnet-capacity', nameKey: 'tools.subnet_capacity', icon: Boxes, categoryKey: 'network', keywords: ['capacity', 'usable', '容量'], i18nNamespace: 'toolSubnetCapacity' },
  { path: '/ipv6-cidr', nameKey: 'tools.ipv6_cidr', icon: Hash, categoryKey: 'network', keywords: ['ipv6', 'cidr', '前缀'], i18nNamespace: 'toolIpv6Cidr' },
  { path: '/vlsm', nameKey: 'tools.vlsm', icon: Boxes, categoryKey: 'network', keywords: ['vlsm', '规划', '子网'], i18nNamespace: 'toolVlsm' },
  { path: '/network-planner', nameKey: 'tools.network_planner', icon: FileSearch, categoryKey: 'network', keywords: ['network', 'planner', '规划'], i18nNamespace: 'toolNetworkPlanner' },
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
