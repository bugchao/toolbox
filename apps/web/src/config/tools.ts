import type { LucideIcon } from 'lucide-react'
import {
  Home, Star, QrCode, Newspaper, MapPin, Cloud, Code, FileCode, Clock, Link2,
  Shuffle, Calendar, Key, Fingerprint, Braces, Hash, Image, FileText, Heart,
  AlertTriangle, RefreshCw,
  Palette, Wand2, Eraser, Ruler, Search, File, Globe, Server, Route,
  Presentation, ShieldCheck, Activity, ShieldAlert, ShieldBan, Radar, FileSearch
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
  { path: '/security-ip-score', nameKey: 'tools.security_ip_score', icon: ShieldAlert, categoryKey: 'network', keywords: ['security', 'ip', 'risk', '安全', '评分'], i18nNamespace: 'toolSecurityIpScore' },
  { path: '/security-domain-blacklist', nameKey: 'tools.security_domain_blacklist', icon: ShieldBan, categoryKey: 'network', keywords: ['security', 'domain', 'blacklist', '域名', '黑名单'], i18nNamespace: 'toolSecurityDomainBlacklist' },
  { path: '/security-port-scan', nameKey: 'tools.security_port_scan', icon: Radar, categoryKey: 'network', keywords: ['security', 'port', 'scan', '端口', '扫描'], i18nNamespace: 'toolSecurityPortScan' },
  { path: '/security-dns-vuln', nameKey: 'tools.security_dns_vuln', icon: ShieldCheck, categoryKey: 'network', keywords: ['security', 'dns', 'vuln', '漏洞', '配置'], i18nNamespace: 'toolSecurityDnsVuln' },
  { path: '/security-report-gen', nameKey: 'tools.security_report_gen', icon: FileSearch, categoryKey: 'network', keywords: ['security', 'report', '网络', '报告'], i18nNamespace: 'toolSecurityReportGen' },
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
