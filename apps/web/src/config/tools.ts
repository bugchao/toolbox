import type { LucideIcon } from 'lucide-react'
import i18n from '../i18n'
import { getToolManifestMetaByPath } from '../tooling/tool-manifests'
import {
  Home, Star, QrCode, Newspaper, MapPin, Cloud, Code, FileCode, Clock, Link2,
  Shuffle, Calendar, Key, Fingerprint, Braces, Hash, Image, FileText, Heart, Mail, MailOpen, XCircle,
  AlertTriangle, RefreshCw,
  Palette, Wand2, Eraser, Ruler, Search, File, Globe, Server, Route,
  Presentation, ShieldCheck, Activity, ShieldAlert, ShieldBan, Radar, FileSearch,
  Boxes, GitCompareArrows, PlayCircle, Wifi, Radio, GitBranch, Shield, Network, Database,
  BarChart2, Sliders, Zap, CheckCircle, TrendingUp, Target, Trash2,
  Timer, CheckSquare, DollarSign, ArrowLeftRight, KeyRound,
  Receipt, CreditCard, Flame, UtensilsCrossed, ArrowRightLeft,
  Calculator, ListChecks, PlaneTakeoff, SplitSquareHorizontal,
  Luggage, ChefHat, BookOpen, BookMarked, CalendarDays, ShoppingBag,
  Bell, Users, ScanLine, Brain, Compass,
  RotateCcw, Languages, FolderTree, Eye, Volume2,
  Lightbulb, Baby, Telescope, Type,
  Moon, Droplets, AlarmClock, Terminal, Navigation,
  Cpu, Webhook, CircuitBoard, Binary, Layers, Tv2, Thermometer,
  FileCog, FileJson, FileSpreadsheet, FileVideo, FileBadge, FileBarChart,
  FileLock, FileDiff, FileDigit, FileKey, FileWarning, FileType,
  Dna, Dices, Package, Tag, Tags, Barcode, ScanSearch, Award,
  FolderOpen, FolderSync, FolderCheck, BookCopy, BookKey, BookLock,
  ClipboardList, ClipboardCheck, ClipboardEdit, NotepadText, NotebookPen, StickyNote,
  ListTodo, ListOrdered, LayoutList, LayoutDashboard, LayoutGrid,
  MapPinned, Map as MapIcon, Milestone, Flag, Signpost, Waypoints,
  Glasses, Microscope, FlaskConical, TestTube, Atom, Beaker,
  Bike, Car, Train, Bus, Plane,
  Coffee, Cookie, Pizza, Soup, Apple, Carrot,
  Bed, Bath, Home as HomeIcon, Building, Building2, Hotel,
  Sun, CloudRain, Wind, Snowflake, Umbrella,
  Music, Music2, Mic, Headphones, Speaker, Radio as RadioIcon,
  Camera, Film, Clapperboard, Projector, Monitor, Tablet,
  Watch, Hourglass, CalendarClock, CalendarCheck,
  Wallet, PiggyBank, Banknote, Coins, CreditCard as CardIcon,
  HeartPulse, Stethoscope, Pill, Syringe, Ambulance, Weight,
  Dumbbell, Footprints, Flame as FireIcon, Wind as WindIcon, Trophy,
  MessageSquare, MessageCircle, MessagesSquare, AtSign, Send,
  UserCheck, UserPlus, UserX, Users2, Contact,
  Lock, LockOpen, Unlock, ShieldOff, EyeOff,
  Settings, Settings2, Cog, Wrench, Hammer,
  Plug, Power, Battery, BatteryCharging, Zap as ZapIcon,
  HardDrive, MemoryStick, Usb, MonitorSmartphone, Smartphone,
  Github, GitPullRequest, GitCommit, GitMerge, GitFork,
  Download, Upload, Share, Share2, ExternalLink, Rss,
  Minus, Plus, Divide, Equal, Percent, Sigma,
  SquareCode, SquareDashedBottom, SquareTerminal, Brackets, Parentheses,
  AlignLeft, AlignCenter, Bold, Italic, Underline, Strikethrough,
  Superscript, Subscript, Highlighter, SpellCheck, Languages as Lang2,
  ChevronRight, ChevronDown, ArrowUp, ArrowDown, TrendingDown,
  Expand, Shrink, ZoomIn, ZoomOut, Fullscreen,
  Crosshair, Anchor, Locate, LocateFixed,
  BarChart, BarChart3, BarChart4, LineChart, PieChart, AreaChart, ScatterChart,
  CloudSun, SearchCode, Landmark, Bug, CloudOff, Gauge, Crown, Cable, Scale,
  MonitorCheck, Siren, ShieldHalf, Bomb, SlidersHorizontal, BadgeCheck, Signal,
  Skull, ScrollText, Scan, History, TimerOff, GraduationCap, MailCheck, MailWarning,
  Asterisk, Repeat2, Globe2, CircleOff, OctagonX, TriangleAlert, AlertOctagon,
  Split, Antenna, ToggleLeft, ChevronsLeftRight, TreePine, LockKeyhole, Repeat,
  Scissors, Pipette, Laugh, Waves, Sparkles, Paintbrush2, BookA, Backpack,
  Binoculars, PersonStanding, Stamp,
  CalendarRange, Code2
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
  { path: '/qrcode/read', nameKey: 'tools.qrcode_read', icon: ScanLine, categoryKey: 'qrcode', keywords: ['qr', '解析'] },
  { path: '/qrcode/beautifier', nameKey: 'tools.qrcode_beautifier', icon: Wand2, categoryKey: 'qrcode', keywords: ['qr', '美化'] },
  { path: '/news', nameKey: 'tools.news', icon: Newspaper, categoryKey: 'news', keywords: ['热点', '新闻'] , mode: 'server'},
  { path: '/zipcode', nameKey: 'tools.zipcode', icon: MailOpen, categoryKey: 'query', keywords: ['邮编', 'zip'] , mode: 'server'},
  { path: '/weather', nameKey: 'tools.weather', icon: CloudSun, categoryKey: 'query', keywords: ['天气', 'weather', 'forecast'], i18nNamespace: 'toolWeather', mode: 'hybrid' },
  { path: '/todo-list', nameKey: 'tools.todo_list', icon: ListChecks, categoryKey: 'life', keywords: ['待办', '任务', '清单', 'todo'], i18nNamespace: 'toolTodoList', mode: 'client' },
  { path: '/github-info', nameKey: 'tools.github_info', icon: FileSearch, categoryKey: 'dev', keywords: ['github', 'token', 'repo', 'user'], i18nNamespace: 'toolGithubInfo' , mode: 'server'},
  { path: '/ip-query', nameKey: 'tools.ip_query', icon: MapPin, categoryKey: 'ip', keywords: ['ip'], i18nNamespace: 'toolIpQuery' , mode: 'server'},
  { path: '/ip-asn', nameKey: 'tools.ip_asn', icon: Network, categoryKey: 'ip', keywords: ['asn', 'as', '归属'], i18nNamespace: 'toolIpAsn' , mode: 'server'},
  { path: '/dns-query', nameKey: 'tools.dns_query', icon: SearchCode, categoryKey: 'dns', keywords: ['dns', '域名', '解析'] , mode: 'server'},
  { path: '/dns-trace', nameKey: 'tools.dns_trace', icon: Route, categoryKey: 'dns', keywords: ['dns', 'trace', '递归', '追踪'], i18nNamespace: 'toolDnsTrace' , mode: 'server'},
  { path: '/dns-propagation', nameKey: 'tools.dns_propagation', icon: Waypoints, categoryKey: 'dns', keywords: ['dns', 'propagation', '传播', '检测'], i18nNamespace: 'toolDnsPropagation' , mode: 'server'},
  { path: '/dns-global-check', nameKey: 'tools.dns_global_check', icon: MapIcon, categoryKey: 'dns', keywords: ['dns', '全球', '解析', '检测'], i18nNamespace: 'toolDnsGlobalCheck' , mode: 'server'},
  { path: '/dnssec-check', nameKey: 'tools.dnssec_check', icon: ShieldAlert, categoryKey: 'dns', keywords: ['dns', 'dnssec', '签名', '校验'], i18nNamespace: 'toolDnssecCheck' , mode: 'server'},
  { path: '/dns-performance', nameKey: 'tools.dns_performance', icon: BarChart3, categoryKey: 'dns', keywords: ['dns', '性能', '响应', '可用性'], i18nNamespace: 'toolDnsPerformance' , mode: 'server'},
  { path: '/dns-ttl', nameKey: 'tools.dns_ttl', icon: AlarmClock, categoryKey: 'dns', keywords: ['dns', 'ttl', '缓存'], i18nNamespace: 'toolDnsTtl' , mode: 'server'},
  { path: '/dns-soa', nameKey: 'tools.dns_soa', icon: Landmark, categoryKey: 'dns', keywords: ['dns', 'soa', '解析'], i18nNamespace: 'toolDnsSoa' , mode: 'server'},
  { path: '/dns-diagnose', nameKey: 'tools.dns_diagnose', icon: Bug, categoryKey: 'dns', keywords: ['dns', 'diagnose', '诊断', '失败'], i18nNamespace: 'toolDnsDiagnose' , mode: 'server'},
  { path: '/dns-pollution-check', nameKey: 'tools.dns_pollution_check', icon: CloudOff, categoryKey: 'dns', keywords: ['dns', 'pollution', '污染', '检测'], i18nNamespace: 'toolDnsPollutionCheck' , mode: 'server'},
  { path: '/dns-hijack-check', nameKey: 'tools.dns_hijack_check', icon: EyeOff, categoryKey: 'dns', keywords: ['dns', 'hijack', '劫持', '检测'], i18nNamespace: 'toolDnsHijackCheck' , mode: 'server'},
  { path: '/dns-cache-check', nameKey: 'tools.dns_cache_check', icon: HardDrive, categoryKey: 'dns', keywords: ['dns', 'cache', '缓存', 'ttl'], i18nNamespace: 'toolDnsCacheCheck' , mode: 'server'},
  { path: '/dns-loop-check', nameKey: 'tools.dns_loop_check', icon: RefreshCw, categoryKey: 'dns', keywords: ['dns', 'loop', '循环', 'cname'], i18nNamespace: 'toolDnsLoopCheck' , mode: 'server'},
  { path: '/dns-ns', nameKey: 'tools.dns_ns', icon: Server, categoryKey: 'dns', keywords: ['dns', 'ns', '名称服务器', 'nameserver'], i18nNamespace: 'toolDnsNs' , mode: 'server'},
  { path: '/dns-cname-chain', nameKey: 'tools.dns_cname_chain', icon: Link2, categoryKey: 'dns', keywords: ['dns', 'cname', '链', 'chain', '循环'], i18nNamespace: 'toolDnsCnameChain' , mode: 'server'},
  { path: '/dns-nxdomain', nameKey: 'tools.dns_nxdomain', icon: XCircle, categoryKey: 'dns', keywords: ['dns', 'nxdomain', '域名', '不存在'], i18nNamespace: 'toolDnsNxdomain' , mode: 'server'},
  { path: '/domain-mx', nameKey: 'tools.domain_mx', icon: Mail, categoryKey: 'domain', keywords: ['mx', '邮件', 'mail', '邮箱'], i18nNamespace: 'toolDomainMx' , mode: 'server'},
  { path: '/domain-txt', nameKey: 'tools.domain_txt', icon: FileType, categoryKey: 'domain', keywords: ['txt', 'spf', 'dkim', 'dmarc', '记录'], i18nNamespace: 'toolDomainTxt' , mode: 'server'},
  { path: '/http-headers', nameKey: 'tools.http_headers', icon: Webhook, categoryKey: 'network', keywords: ['http', 'header', '响应头', '安全'], i18nNamespace: 'toolHttpHeaders' , mode: 'server'},
  { path: '/ssl-cert', nameKey: 'tools.ssl_cert', icon: ShieldCheck, categoryKey: 'network', keywords: ['ssl', 'tls', '证书', 'https'], i18nNamespace: 'toolSslCert' , mode: 'server'},
  { path: '/http-status', nameKey: 'tools.http_status', icon: CheckCircle, categoryKey: 'network', keywords: ['http', 'status', '状态码', '可用性'], i18nNamespace: 'toolHttpStatus' , mode: 'server'},
  { path: '/tcp-port-check', nameKey: 'tools.tcp_port_check', icon: Power, categoryKey: 'network', keywords: ['tcp', 'port', '端口', '连通性'], i18nNamespace: 'toolTcpPort' , mode: 'server'},
  { path: '/ping', nameKey: 'tools.ping', icon: Radar, categoryKey: 'network', keywords: ['ping', '延迟', '可达性'], i18nNamespace: 'toolPing' , mode: 'server'},
  { path: '/dns-latency', nameKey: 'tools.dns_latency', icon: Gauge, categoryKey: 'dns', keywords: ['dns', '延迟', '速度', '响应'], i18nNamespace: 'toolDnsLatency' , mode: 'server'},
  { path: '/dns-authoritative', nameKey: 'tools.dns_authoritative', icon: Crown, categoryKey: 'dns', keywords: ['dns', '权威', 'ns', '一致性'], i18nNamespace: 'toolDnsAuthoritative' , mode: 'server'},
  { path: '/dns-recursive', nameKey: 'tools.dns_recursive', icon: Shield, categoryKey: 'dns', keywords: ['dns', '递归', '开放', 'amplification'], i18nNamespace: 'toolDnsRecursive' , mode: 'server'},
  { path: '/dns-path-viz', nameKey: 'tools.dns_path_viz', icon: GitBranch, categoryKey: 'dns', keywords: ['dns', '路径', '可视化', '递归'], i18nNamespace: 'toolDnsPathViz' , mode: 'server'},
  { path: '/dns-tunnel', nameKey: 'tools.dns_tunnel', icon: Lock, categoryKey: 'dns', keywords: ['dns', '隧道', '检测', '安全'], i18nNamespace: 'toolDnsTunnel' , mode: 'server'},
  { path: '/dhcp-pool-calc', nameKey: 'tools.dhcp_pool_calc', icon: Database, categoryKey: 'ipam', keywords: ['dhcp', '地址池', '计算', 'ip'], i18nNamespace: 'toolDhcpPoolCalc' },
  { path: '/dhcp-option', nameKey: 'tools.dhcp_option', icon: Settings, categoryKey: 'ipam', keywords: ['dhcp', 'option', '选项', '查询'], i18nNamespace: 'toolDhcpOption' },
  { path: '/dhcp-mac-binding', nameKey: 'tools.dhcp_mac_binding', icon: Cable, categoryKey: 'ipam', keywords: ['dhcp', 'mac', '绑定', '静态'], i18nNamespace: 'toolDhcpMacBinding' },
  { path: '/dhcp-config-gen', nameKey: 'tools.dhcp_config_gen', icon: FileCog, categoryKey: 'ipam', keywords: ['dhcp', '配置', '生成', 'isc', 'dnsmasq'], i18nNamespace: 'toolDhcpConfigGen' },
  { path: '/traceroute', nameKey: 'tools.traceroute', icon: GitFork, categoryKey: 'network', keywords: ['traceroute', '路由', '追踪', '网络'], i18nNamespace: 'toolTraceroute', mode: 'server' },
  { path: '/dhcp-utilization', nameKey: 'tools.dhcp_utilization', icon: BarChart2, categoryKey: 'ipam', keywords: ['dhcp', '利用率', '地址池', '统计'], i18nNamespace: 'toolDhcpUtilization' },
  { path: '/dhcp-conflict', nameKey: 'tools.dhcp_conflict', icon: AlertTriangle, categoryKey: 'ipam', keywords: ['dhcp', '冲突', '重复', 'ip'], i18nNamespace: 'toolDhcpConflict' },
  { path: '/gslb-weight-calc', nameKey: 'tools.gslb_weight_calc', icon: Scale, categoryKey: 'network', keywords: ['gslb', '权重', '负载均衡', '流量'], i18nNamespace: 'toolGslbWeightCalc' },
  { path: '/web-availability', nameKey: 'tools.web_availability', icon: MonitorCheck, categoryKey: 'network', keywords: ['http', '可用性', '监控', '状态'], i18nNamespace: 'toolWebAvailability', mode: 'server' },
  { path: '/security-domain-score', nameKey: 'tools.security_domain_score', icon: Award, categoryKey: 'security', keywords: ['安全', '评分', 'dnssec', 'spf', 'dmarc'], i18nNamespace: 'toolSecurityDomainScore', mode: 'server' },
  { path: '/gslb-failover-sim', nameKey: 'tools.gslb_failover_sim', icon: Siren, categoryKey: 'network', keywords: ['gslb', '故障', '切换', '模拟', 'failover'], i18nNamespace: 'toolGslbFailoverSim' },
  { path: '/gslb-geo-sim', nameKey: 'tools.gslb_geo_sim', icon: Globe, categoryKey: 'network', keywords: ['gslb', 'geo', '地理', '解析', '模拟'], i18nNamespace: 'toolGslbGeoSim' },
  { path: '/security-dnssec-verify', nameKey: 'tools.security_dnssec_verify', icon: ShieldHalf, categoryKey: 'security', keywords: ['dnssec', '签名', '验证', '信任链'], i18nNamespace: 'toolSecurityDnssecVerify', mode: 'server' },
  { path: '/security-dns-ddos', nameKey: 'tools.security_dns_ddos', icon: Bomb, categoryKey: 'security', keywords: ['ddos', 'dns', '放大', '攻击', '风险'], i18nNamespace: 'toolSecurityDnsDdos', mode: 'server' },
  { path: '/cdn-check', nameKey: 'tools.cdn_check', icon: Cloud, categoryKey: 'network', keywords: ['cdn', '检测', 'cloudflare', '阿里云'], i18nNamespace: 'toolCdnCheck', mode: 'server' },
  { path: '/dhcp-discover-sim', nameKey: 'tools.dhcp_discover_sim', icon: Wifi, categoryKey: 'network', keywords: ['dhcp', 'discover', '握手', '模拟'], i18nNamespace: 'toolDhcpDiscoverSim' },
  { path: '/ipam-subnet-util', nameKey: 'tools.ipam_subnet_util', icon: BarChart4, categoryKey: 'ipam', keywords: ['子网', '利用率', 'cidr', 'ip'], i18nNamespace: 'toolIpamSubnetUtil' },
  { path: '/gslb-health-sim', nameKey: 'tools.gslb_health_sim', icon: Activity, categoryKey: 'network', keywords: ['gslb', '健康', '检查', '模拟'], i18nNamespace: 'toolGslbHealthSim' },
  { path: '/gslb-latency-sim', nameKey: 'tools.gslb_latency_sim', icon: Activity, categoryKey: 'network', keywords: ['gslb', '延迟', '调度', '模拟'], i18nNamespace: 'toolGslbLatencySim' },
  { path: '/server-latency', nameKey: 'tools.server_latency', icon: Timer, categoryKey: 'network', keywords: ['延迟', '测速', '服务器', 'ping'], i18nNamespace: 'toolServerLatency', mode: 'server' },
  { path: '/dhcp-lease-analysis', nameKey: 'tools.dhcp_lease_analysis', icon: FileBarChart, categoryKey: 'network', keywords: ['dhcp', 'lease', '租约', '分析'], i18nNamespace: 'toolDhcpLeaseAnalysis' },
  { path: '/ipam-visualize', nameKey: 'tools.ipam_visualize', icon: Boxes, categoryKey: 'ipam', keywords: ['ip', '可视化', '子网', '树状图'], i18nNamespace: 'toolIpamVisualize' },
  { path: '/gslb-policy-sim', nameKey: 'tools.gslb_policy_sim', icon: SlidersHorizontal, categoryKey: 'network', keywords: ['gslb', '策略', '轮询', '权重'], i18nNamespace: 'toolGslbPolicySim' },
  { path: '/gslb-rule-validate', nameKey: 'tools.gslb_rule_validate', icon: BadgeCheck, categoryKey: 'network', keywords: ['gslb', '规则', '验证', '校验'], i18nNamespace: 'toolGslbRuleValidate' },
  { path: '/api-availability', nameKey: 'tools.api_availability', icon: Plug, categoryKey: 'network', keywords: ['api', '可用性', '健康检查', 'http'], i18nNamespace: 'toolApiAvailability', mode: 'server' },
  { path: '/gslb-isp-sim', nameKey: 'tools.gslb_isp_sim', icon: Signal, categoryKey: 'network', keywords: ['gslb', '运营商', 'isp', '移动', '联通'], i18nNamespace: 'toolGslbIspSim' },
  { path: '/gslb-traffic-predict', nameKey: 'tools.gslb_traffic_predict', icon: LineChart, categoryKey: 'network', keywords: ['gslb', '流量', '预测', '容量', 'qps'], i18nNamespace: 'toolGslbTrafficPredict' },
  { path: '/gslb-hit-predict', nameKey: 'tools.gslb_hit_predict', icon: Target, categoryKey: 'network', keywords: ['gslb', '命中', '预测', 'dns', '解析'], i18nNamespace: 'toolGslbHitPredict' },
  { path: '/ipam-reclaim', nameKey: 'tools.ipam_reclaim', icon: Trash2, categoryKey: 'ipam', keywords: ['ip', '回收', '闲置', 'ipam'], i18nNamespace: 'toolIpamReclaim' },
  { path: '/security-domain-hijack', nameKey: 'tools.security_domain_hijack', icon: Skull, categoryKey: 'security', keywords: ['劫持', 'dns', '安全', '域名'], i18nNamespace: 'toolSecurityDomainHijack', mode: 'server' },
  { path: '/dhcp-log-analysis', nameKey: 'tools.dhcp_log_analysis', icon: ScrollText, categoryKey: 'network', keywords: ['dhcp', '日志', '分析', 'syslog'], i18nNamespace: 'toolDhcpLogAnalysis' },
  { path: '/dhcp-scan', nameKey: 'tools.dhcp_scan', icon: Scan, categoryKey: 'network', keywords: ['dhcp', '扫描', '发现', 'rogue'], i18nNamespace: 'toolDhcpScan' },
  { path: '/ipam-changelog', nameKey: 'tools.ipam_changelog', icon: History, categoryKey: 'ipam', keywords: ['ip', '变更', '记录', '审计'], i18nNamespace: 'toolIpamChangelog' },
  { path: '/ipam-scan', nameKey: 'tools.ipam_scan', icon: ScanSearch, categoryKey: 'ipam', keywords: ['ip', '扫描', '存活', 'ping'], i18nNamespace: 'toolIpamScan' },
  { path: '/pomodoro', nameKey: 'tools.pomodoro', icon: TimerOff, categoryKey: 'life', keywords: ['番茄钟', '专注', '计时', 'pomodoro'], i18nNamespace: 'toolPomodoro' },
  { path: '/habit-tracker', nameKey: 'tools.habit_tracker', icon: CalendarCheck, categoryKey: 'life', keywords: ['习惯', '打卡', '连续', '追踪'], i18nNamespace: 'toolHabitTracker' },
  { path: '/salary-calc', nameKey: 'tools.salary_calc', icon: DollarSign, categoryKey: 'life', keywords: ['工资', '税后', '五险一金', '个税'], i18nNamespace: 'toolSalaryCalc' },
  { path: '/currency-converter', nameKey: 'tools.currency_converter', icon: ArrowLeftRight, categoryKey: 'life', keywords: ['汇率', '换算', '货币', '外汇'], i18nNamespace: 'toolCurrencyConverter' },
  { path: '/jwt-decoder', nameKey: 'tools.jwt_decoder', icon: KeyRound, categoryKey: 'dev', keywords: ['jwt', 'token', '解析', '解码'], i18nNamespace: 'toolJwtDecoder' },
  { path: '/expense-tracker', nameKey: 'tools.expense_tracker', icon: Receipt, categoryKey: 'life', keywords: ['记账', '支出', '消费', '财务'], i18nNamespace: 'toolExpenseTracker' },
  { path: '/subscription-manager', nameKey: 'tools.subscription_manager', icon: CreditCard, categoryKey: 'life', keywords: ['订阅', 'netflix', 'ai', '费用'], i18nNamespace: 'toolSubscriptionManager' },
  { path: '/calorie-calc', nameKey: 'tools.calorie_calc', icon: Flame, categoryKey: 'life', keywords: ['卡路里', '热量', '饮食', '营养'], i18nNamespace: 'toolCalorieCalc' },
  { path: '/random-menu', nameKey: 'tools.random_menu', icon: UtensilsCrossed, categoryKey: 'life', keywords: ['菜单', '吃什么', '随机', '美食'], i18nNamespace: 'toolRandomMenu' },
  { path: '/curl-to-fetch', nameKey: 'tools.curl_to_fetch', icon: ArrowRightLeft, categoryKey: 'dev', keywords: ['curl', 'fetch', 'http', '转换'], i18nNamespace: 'toolCurlToFetch' },
  { path: '/installment-calc', nameKey: 'tools.installment_calc', icon: Coins, categoryKey: 'life', keywords: ['分期', '贷款', '还款', '利率'], i18nNamespace: 'toolInstallmentCalc' },
  { path: '/okr-planner', nameKey: 'tools.okr_planner', icon: Flag, categoryKey: 'life', keywords: ['okr', '目标', '计划', '季度'], i18nNamespace: 'toolOkrPlanner' },
  { path: '/travel-checklist', nameKey: 'tools.travel_checklist', icon: ClipboardCheck, categoryKey: 'travel', keywords: ['旅行', 'checklist', '清单', '出行'], i18nNamespace: 'toolTravelChecklist' },
  { path: '/travel-budget', nameKey: 'tools.travel_budget', icon: PlaneTakeoff, categoryKey: 'travel', keywords: ['旅行', '预算', '费用', '旅游'], i18nNamespace: 'toolTravelBudget' },
  { path: '/split-bill', nameKey: 'tools.split_bill', icon: Percent, categoryKey: 'travel', keywords: ['aa', '分摊', '账单', '聚餐'], i18nNamespace: 'toolSplitBill' },
  { path: '/timezone-calc', nameKey: 'tools.timezone_calc', icon: Watch, categoryKey: 'travel', keywords: ['时差', '时区', '换算', '时间'], i18nNamespace: 'toolTimezoneCalc' },
  { path: '/distance-calc', nameKey: 'tools.distance_calc', icon: Milestone, categoryKey: 'travel', keywords: ['距离', '地图', '城市', '经纬度'], i18nNamespace: 'toolDistanceCalc' },
  { path: '/packing-list', nameKey: 'tools.packing_list', icon: Luggage, categoryKey: 'travel', keywords: ['行李', '清单', '打包', '出行'], i18nNamespace: 'toolPackingList' },
  { path: '/recipe-finder', nameKey: 'tools.recipe_finder', icon: ChefHat, categoryKey: 'life', keywords: ['菜谱', '食材', '烹饪', '推荐'], i18nNamespace: 'toolRecipeFinder' },
  { path: '/study-timer', nameKey: 'tools.study_timer', icon: GraduationCap, categoryKey: 'learn', keywords: ['学习', '计时', '专注', '统计'], i18nNamespace: 'toolStudyTimer' },
  { path: '/study-planner', nameKey: 'tools.study_planner', icon: CalendarDays, categoryKey: 'learn', keywords: ['学习', '计划', 'AI', '复习', '备考'], i18nNamespace: 'toolStudyPlanner' },
  { path: '/focus-mode', nameKey: 'tools.focus_mode', icon: Crosshair, categoryKey: 'learn', keywords: ['专注', '番茄钟', '计时', '白噪音', '沉浸'], i18nNamespace: 'toolFocusMode' },
  { path: '/domain-spf', nameKey: 'tools.domain_spf', icon: MailCheck, categoryKey: 'domain', keywords: ['spf', 'mail', 'policy', '邮件'], i18nNamespace: 'toolDomainSpf' , mode: 'server'},
  { path: '/domain-dkim', nameKey: 'tools.domain_dkim', icon: Key, categoryKey: 'domain', keywords: ['dkim', 'selector', 'mail', '签名'], i18nNamespace: 'toolDomainDkim' , mode: 'server'},
  { path: '/domain-dmarc', nameKey: 'tools.domain_dmarc', icon: MailWarning, categoryKey: 'domain', keywords: ['dmarc', 'mail', 'policy', '报告'], i18nNamespace: 'toolDomainDmarc' , mode: 'server'},
  { path: '/domain-ttl-advice', nameKey: 'tools.domain_ttl_advice', icon: Hourglass, categoryKey: 'domain', keywords: ['ttl', 'domain', '缓存', '优化'], i18nNamespace: 'toolDomainTtlAdvice' , mode: 'server'},
  { path: '/domain-ns-check', nameKey: 'tools.domain_ns_check', icon: Signpost, categoryKey: 'domain', keywords: ['ns', 'nameserver', '权威'], i18nNamespace: 'toolDomainNsCheck' , mode: 'server'},
  { path: '/domain-subdomain-scan', nameKey: 'tools.domain_subdomain_scan', icon: Telescope, categoryKey: 'domain', keywords: ['subdomain', 'scan', '子域'], i18nNamespace: 'toolDomainSubdomainScan' , mode: 'server'},
  { path: '/domain-wildcard', nameKey: 'tools.domain_wildcard', icon: Asterisk, categoryKey: 'domain', keywords: ['wildcard', 'dns', '泛解析'], i18nNamespace: 'toolDomainWildcard' , mode: 'server'},
  { path: '/domain-health-score', nameKey: 'tools.domain_health_score', icon: HeartPulse, categoryKey: 'domain', keywords: ['health', 'score', 'domain', '健康'], i18nNamespace: 'toolDomainHealthScore' , mode: 'server'},
  { path: '/ip-geo', nameKey: 'tools.ip_geo', icon: MapPinned, categoryKey: 'ip', keywords: ['geo', 'ip', 'location', '地理'], i18nNamespace: 'toolIpGeo' , mode: 'server'},
  { path: '/ip-ptr', nameKey: 'tools.ip_ptr', icon: LocateFixed, categoryKey: 'ip', keywords: ['ptr', 'reverse', 'rdns'], i18nNamespace: 'toolIpPtr' , mode: 'server'},
  { path: '/ip-v4-to-v6', nameKey: 'tools.ip_v4_to_v6', icon: Repeat2, categoryKey: 'ip', keywords: ['ipv4', 'ipv6', '转换'], i18nNamespace: 'toolIpV4ToV6' },
  { path: '/ip-binary-hex', nameKey: 'tools.ip_binary_hex', icon: Cpu, categoryKey: 'ip', keywords: ['binary', 'hex', 'ip', '转换'], i18nNamespace: 'toolIpBinaryHex' },
  { path: '/ip-class', nameKey: 'tools.ip_class', icon: Tag, categoryKey: 'ip', keywords: ['class', 'private', 'public', '分类'], i18nNamespace: 'toolIpClass' },
  { path: '/ip-public', nameKey: 'tools.ip_public', icon: Locate, categoryKey: 'ip', keywords: ['public', '出口', '公网'], i18nNamespace: 'toolIpPublic' },
  { path: '/ip-cdn-check', nameKey: 'tools.ip_cdn_check', icon: Globe2, categoryKey: 'ip', keywords: ['cdn', 'edge', 'ip', '节点'], i18nNamespace: 'toolIpCdnCheck' , mode: 'server'},
  { path: '/ip-blacklist', nameKey: 'tools.ip_blacklist', icon: CircleOff, categoryKey: 'ip', keywords: ['ip', 'blacklist', 'dnsbl', '黑名单'], i18nNamespace: 'toolIpBlacklist' , mode: 'server'},
  { path: '/security-ip-score', nameKey: 'tools.security_ip_score', icon: Trophy, categoryKey: 'security', keywords: ['security', 'ip', 'risk', '安全', '评分'], i18nNamespace: 'toolSecurityIpScore' , mode: 'server'},
  { path: '/security-domain-blacklist', nameKey: 'tools.security_domain_blacklist', icon: OctagonX, categoryKey: 'security', keywords: ['security', 'domain', 'blacklist', '域名', '黑名单'], i18nNamespace: 'toolSecurityDomainBlacklist' , mode: 'server'},
  { path: '/security-port-scan', nameKey: 'tools.security_port_scan', icon: Network, categoryKey: 'security', keywords: ['security', 'port', 'scan', '端口', '扫描'], i18nNamespace: 'toolSecurityPortScan' , mode: 'server'},
  { path: '/security-dns-vuln', nameKey: 'tools.security_dns_vuln', icon: TriangleAlert, categoryKey: 'security', keywords: ['security', 'dns', 'vuln', '漏洞', '配置'], i18nNamespace: 'toolSecurityDnsVuln' , mode: 'server'},
  { path: '/security-report-gen', nameKey: 'tools.security_report_gen', icon: FileWarning, categoryKey: 'security', keywords: ['security', 'report', '网络', '报告'], i18nNamespace: 'toolSecurityReportGen' , mode: 'server'},
  { path: '/ipam-plan', nameKey: 'tools.ipam_plan', icon: LayoutGrid, categoryKey: 'ipam', keywords: ['ipam', 'plan', 'vlsm', '规划'], i18nNamespace: 'toolIpamPlan' , mode: 'server'},
  { path: '/ipam-inventory', nameKey: 'tools.ipam_inventory', icon: Package, categoryKey: 'ipam', keywords: ['ipam', 'inventory', '库存'], i18nNamespace: 'toolIpamInventory' , mode: 'server'},
  { path: '/ipam-usage', nameKey: 'tools.ipam_usage', icon: PieChart, categoryKey: 'ipam', keywords: ['ipam', 'usage', 'utilization', '使用率'], i18nNamespace: 'toolIpamUsage' , mode: 'server'},
  { path: '/ipam-conflict', nameKey: 'tools.ipam_conflict', icon: AlertOctagon, categoryKey: 'ipam', keywords: ['ipam', 'conflict', 'overlap', '冲突'], i18nNamespace: 'toolIpamConflict' , mode: 'server'},
  { path: '/ipam-allocation-sim', nameKey: 'tools.ipam_allocation_sim', icon: MemoryStick, categoryKey: 'ipam', keywords: ['ipam', 'allocation', 'simulation', '分配'], i18nNamespace: 'toolIpamAllocationSim' , mode: 'server'},
  { path: '/cidr-calculator', nameKey: 'tools.cidr_calculator', icon: Calculator, categoryKey: 'ipam', keywords: ['cidr', '子网', '范围'], i18nNamespace: 'toolCidrCalculator' },
  { path: '/subnet-divide', nameKey: 'tools.subnet_divide', icon: Split, categoryKey: 'ipam', keywords: ['subnet', 'divide', '划分'], i18nNamespace: 'toolSubnetDivide' },
  { path: '/subnet-network-addr', nameKey: 'tools.subnet_network_addr', icon: CircuitBoard, categoryKey: 'ipam', keywords: ['network', 'address', '网络号'], i18nNamespace: 'toolSubnetNetworkAddr' },
  { path: '/subnet-broadcast', nameKey: 'tools.subnet_broadcast', icon: Antenna, categoryKey: 'ipam', keywords: ['broadcast', '广播地址'], i18nNamespace: 'toolSubnetBroadcast' },
  { path: '/subnet-mask', nameKey: 'tools.subnet_mask', icon: ToggleLeft, categoryKey: 'ipam', keywords: ['mask', 'prefix', '掩码'], i18nNamespace: 'toolSubnetMask' },
  { path: '/ip-range', nameKey: 'tools.ip_range', icon: ChevronsLeftRight, categoryKey: 'ipam', keywords: ['range', 'ip', '范围'], i18nNamespace: 'toolIpRange' },
  { path: '/subnet-capacity', nameKey: 'tools.subnet_capacity', icon: Expand, categoryKey: 'ipam', keywords: ['capacity', 'usable', '容量'], i18nNamespace: 'toolSubnetCapacity' },
  { path: '/ipv6-cidr', nameKey: 'tools.ipv6_cidr', icon: Sigma, categoryKey: 'ipam', keywords: ['ipv6', 'cidr', '前缀'], i18nNamespace: 'toolIpv6Cidr' },
  { path: '/vlsm', nameKey: 'tools.vlsm', icon: TreePine, categoryKey: 'ipam', keywords: ['vlsm', '规划', '子网'], i18nNamespace: 'toolVlsm' },
  { path: '/network-planner', nameKey: 'tools.network_planner', icon: LayoutDashboard, categoryKey: 'ipam', keywords: ['network', 'planner', '规划'], i18nNamespace: 'toolNetworkPlanner' },
  { path: '/json', nameKey: 'tools.json', icon: FileJson, categoryKey: 'dev', keywords: ['json'], i18nNamespace: 'toolJson' },
  { path: '/format-converter', nameKey: 'tools.format_converter', icon: Braces, categoryKey: 'dev', keywords: ['yaml', 'xml', '格式转换'] },
  { path: '/base64', nameKey: 'tools.base64', icon: Code, categoryKey: 'dev', keywords: ['base64'] },
  { path: '/timestamp', nameKey: 'tools.timestamp', icon: CalendarClock, categoryKey: 'dev', keywords: ['时间戳'] },
  { path: '/url', nameKey: 'tools.url', icon: ExternalLink, categoryKey: 'dev', keywords: ['url', '编解码'] },
  { path: '/regex', nameKey: 'tools.regex', icon: Shuffle, categoryKey: 'dev', keywords: ['正则'] },
  { path: '/cron', nameKey: 'tools.cron', icon: Calendar, categoryKey: 'dev', keywords: ['cron'] },
  { path: '/password', nameKey: 'tools.password', icon: LockKeyhole, categoryKey: 'dev', keywords: ['密码'] },
  { path: '/hash', nameKey: 'tools.hash', icon: Binary, categoryKey: 'dev', keywords: ['hash', 'md5', 'sha'] },
  { path: '/code', nameKey: 'tools.code', icon: Terminal, categoryKey: 'dev', keywords: ['代码', '格式化'] },
  { path: '/uuid', nameKey: 'tools.uuid', icon: Dices, categoryKey: 'dev', keywords: ['uuid'] },
  { path: '/text-comparator', nameKey: 'tools.text_comparator', icon: SplitSquareHorizontal, categoryKey: 'dev', keywords: ['文本对比', 'diff'] },
  { path: '/image-compressor', nameKey: 'tools.image_compressor', icon: Image, categoryKey: 'utils', keywords: ['图片压缩'] },
  { path: '/image-background-remover', nameKey: 'tools.image_bg_remover', icon: Eraser, categoryKey: 'utils', keywords: ['去背景'] },
  { path: '/markdown', nameKey: 'tools.markdown', icon: FileCode, categoryKey: 'utils', keywords: ['markdown'] },
  { path: '/bmi', nameKey: 'tools.bmi', icon: Heart, categoryKey: 'utils', keywords: ['bmi'] },
  { path: '/color-picker', nameKey: 'tools.color_picker', icon: Palette, categoryKey: 'utils', keywords: ['颜色'] },
  { path: '/unit-converter', nameKey: 'tools.unit_converter', icon: Repeat, categoryKey: 'utils', keywords: ['单位换算'] },
  { path: '/pdf-tools', nameKey: 'tools.pdf_tools', icon: File, categoryKey: 'utils', keywords: ['pdf'] },
  { path: '/sheet-editor', nameKey: 'tools.sheet_editor', icon: FileSpreadsheet, categoryKey: 'utils', keywords: ['csv', 'excel', '表格'] },
  { path: '/short-link', nameKey: 'tools.short_link', icon: Scissors, categoryKey: 'utils', keywords: ['短链接'] },
  { path: '/resume-generator', nameKey: 'tools.resume', icon: FileBadge, categoryKey: 'utils', keywords: ['简历'] },
  { path: '/color-generator', nameKey: 'tools.color_generator', icon: Pipette, categoryKey: 'utils', keywords: ['配色'] },
  { path: '/meme-generator', nameKey: 'tools.meme_generator', icon: Laugh, categoryKey: 'utils', keywords: ['表情包'] },
  { path: '/copywriting-generator', nameKey: 'tools.copywriting_generator', icon: NotebookPen, categoryKey: 'utils', keywords: ['文案'] },
  { path: '/wooden-fish', nameKey: 'tools.wooden_fish', icon: Waves, categoryKey: 'utils', keywords: ['木鱼'] },
  { path: '/life-progress', nameKey: 'tools.life_progress', icon: Sparkles, categoryKey: 'utils', keywords: ['人生进度'] },
  { path: '/meeting-minutes', nameKey: 'tools.meeting_minutes', icon: ClipboardList, categoryKey: 'ai', keywords: ['会议纪要', 'transcript', 'minutes'] },
  { path: '/ui-generator', nameKey: 'tools.ui_generator', icon: Paintbrush2, categoryKey: 'ai', keywords: ['ui', 'wireframe', '设计生成'] },
  { path: '/ppt-generator', nameKey: 'tools.ppt_generator', icon: Presentation, categoryKey: 'ai', keywords: ['ppt', '演示', '幻灯片', 'ai'], i18nNamespace: 'toolPptGenerator' },
  { path: '/vocab-trainer', nameKey: 'tools.vocab_trainer', icon: BookA, categoryKey: 'learn', keywords: ['单词', 'vocabulary', '记忆', 'flashcard'], i18nNamespace: 'toolVocabTrainer' },
  { path: '/mistake-book', nameKey: 'tools.mistake_book', icon: BookMarked, categoryKey: 'learn', keywords: ['错题', '题本', '复习'], i18nNamespace: 'toolMistakeBook' },
  { path: '/daily-planner', nameKey: 'tools.daily_planner', icon: CheckSquare, categoryKey: 'life', keywords: ['计划', '时间块', '日程', 'planner'], i18nNamespace: 'toolDailyPlanner' },
  { path: '/fridge-inventory', nameKey: 'tools.fridge_inventory', icon: ShoppingBag, categoryKey: 'life', keywords: ['冰箱', '库存', '食材', 'fridge'], i18nNamespace: 'toolFridgeInventory' },
  { path: '/expiry-reminder', nameKey: 'tools.expiry_reminder', icon: Bell, categoryKey: 'life', keywords: ['保质期', '过期', '提醒', 'expiry'], i18nNamespace: 'toolExpiryReminder' },
  { path: '/family-tasks', nameKey: 'tools.family_tasks', icon: Users, categoryKey: 'life', keywords: ['家庭', '任务', '家务', 'family'], i18nNamespace: 'toolFamilyTasks' },
  { path: '/barcode-reader', nameKey: 'tools.barcode_reader', icon: Barcode, categoryKey: 'utils', keywords: ['条形码', '二维码', 'barcode', 'qr', '扫码'], i18nNamespace: 'toolBarcodeReader' },
  { path: '/quiz-gen', nameKey: 'tools.quiz_gen', icon: Brain, categoryKey: 'learn', keywords: ['出题', '竞答', '知识', 'quiz'], i18nNamespace: 'toolQuizGen' },
  { path: '/trip-planner', nameKey: 'tools.trip_planner', icon: Backpack, categoryKey: 'travel', keywords: ['行程', '旅行', '规划', 'trip'], i18nNamespace: 'toolTripPlanner' },
  { path: '/day-trip', nameKey: 'tools.day_trip', icon: Compass, categoryKey: 'travel', keywords: ['一日游', '城市', '景点', 'day trip'], i18nNamespace: 'toolDayTrip' },
  { path: '/spaced-repetition', nameKey: 'tools.spaced_repetition', icon: BookOpen, categoryKey: 'learn', keywords: ['间隔重复', 'anki', '记忆', 'spaced repetition'], i18nNamespace: 'toolSpacedRepetition' },
  { path: '/travel-translator', nameKey: 'tools.travel_translator', icon: Languages, categoryKey: 'travel', keywords: ['翻译', '旅行', '短语', 'translator'], i18nNamespace: 'toolTravelTranslator' },
  { path: '/project-scaffold', nameKey: 'tools.project_scaffold', icon: FolderTree, categoryKey: 'dev', keywords: ['项目结构', '脚手架', 'scaffold', '目录树'], i18nNamespace: 'toolProjectScaffold' },
  { path: '/knowledge-compare', nameKey: 'tools.knowledge_compare', icon: GitCompareArrows, categoryKey: 'learn', keywords: ['对比', '比较', 'compare', '技术选型'], i18nNamespace: 'toolKnowledgeCompare' },
  { path: '/loan-calc', nameKey: 'tools.loan_calc', icon: Banknote, categoryKey: 'life', keywords: ['贷款', '房贷', '月供', 'loan', '等额本息'], i18nNamespace: 'toolLoanCalc' },
  { path: '/id-card-parser', nameKey: 'tools.id_card_parser', icon: Fingerprint, categoryKey: 'utils', keywords: ['身份证', '解析', 'id card', '籍贯', '生日'], i18nNamespace: 'toolIdCardParser' },
  { path: '/color-blind-sim', nameKey: 'tools.color_blind_sim', icon: Eye, categoryKey: 'utils', keywords: ['色盲', '无障碍', 'color blind', 'accessibility'], i18nNamespace: 'toolColorBlindSim' },
  { path: '/text-to-speech', nameKey: 'tools.text_to_speech', icon: Volume2, categoryKey: 'utils', keywords: ['语音', 'tts', '朗读', 'text to speech'], i18nNamespace: 'toolTextToSpeech' },
  { path: '/currency-history', nameKey: 'tools.currency_history', icon: TrendingUp, categoryKey: 'utils', keywords: ['汇率', '历史', 'exchange rate', '外汇'], i18nNamespace: 'toolCurrencyHistory' },
  { path: '/one-liner', nameKey: 'tools.one_liner', icon: Lightbulb, categoryKey: 'learn', keywords: ['一句话', '解释', 'one liner', '概念'], i18nNamespace: 'toolOneLiner' },
  { path: '/eli5', nameKey: 'tools.eli5', icon: Baby, categoryKey: 'learn', keywords: ['ELI5', '简单解释', '5岁', '类比'], i18nNamespace: 'toolEli5' },
  { path: '/multi-perspective', nameKey: 'tools.multi_perspective', icon: Binoculars, categoryKey: 'learn', keywords: ['多角度', '视角', '专家', '类比'], i18nNamespace: 'toolMultiPerspective' },
  { path: '/mcq-gen', nameKey: 'tools.mcq_gen', icon: LayoutList, categoryKey: 'learn', keywords: ['选择题', '出题', 'quiz', '测验'], i18nNamespace: 'toolMcqGen' },
  { path: '/morse-code', nameKey: 'tools.morse_code', icon: Mic, categoryKey: 'utils', keywords: ['摩斯', '密码', 'morse', '电报'], i18nNamespace: 'toolMorseCode' },
  { path: '/ascii-art', nameKey: 'tools.ascii_art', icon: Type, categoryKey: 'utils', keywords: ['ASCII', '艺术字', 'art', '字体'], i18nNamespace: 'toolAsciiArt' },
  { path: '/password-strength', nameKey: 'tools.password_strength', icon: ShieldCheck, categoryKey: 'utils', keywords: ['密码', '强度', 'password', '安全'], i18nNamespace: 'toolPasswordStrength' },
  { path: '/base-converter', nameKey: 'tools.base_converter', icon: Hash, categoryKey: 'dev', keywords: ['进制', '二进制', '十六进制', 'base'], i18nNamespace: 'toolBaseConverter' },
  { path: '/word-count', nameKey: 'tools.word_count', icon: AlignLeft, categoryKey: 'utils', keywords: ['字数', '统计', 'word count', '文本'], i18nNamespace: 'toolWordCount' },
  { path: '/pomodoro-pro', nameKey: 'tools.pomodoro_pro', icon: Timer, categoryKey: 'life', keywords: ['番茄钟', '专注', 'pomodoro', '计时'], i18nNamespace: 'toolPomodoroPro' },
  { path: '/time-logger', nameKey: 'tools.time_logger', icon: ClipboardEdit, categoryKey: 'life', keywords: ['时间', '日志', '记录', 'time log'], i18nNamespace: 'toolTimeLogger' },
  { path: '/investment-sim', nameKey: 'tools.investment_sim', icon: PiggyBank, categoryKey: 'finance', keywords: ['理财', '复利', '定投', '收益模拟'], i18nNamespace: 'toolInvestmentSim' },
  { path: '/sleep-tracker', nameKey: 'tools.sleep_tracker', icon: Moon, categoryKey: 'life', keywords: ['睡眠', '记录', '健康', 'sleep'], i18nNamespace: 'toolSleepTracker' },
  { path: '/water-reminder', nameKey: 'tools.water_reminder', icon: Droplets, categoryKey: 'life', keywords: ['饮水', '喝水', '健康', 'water'], i18nNamespace: 'toolWaterReminder' },
  { path: '/running-tracker', nameKey: 'tools.running_tracker', icon: Footprints, categoryKey: 'life', keywords: ['跑步', '运动', '里程', 'running'], i18nNamespace: 'toolRunningTracker' },
  { path: '/sedentary-reminder', nameKey: 'tools.sedentary_reminder', icon: PersonStanding, categoryKey: 'life', keywords: ['久坐', '提醒', '拉伸', '健康'], i18nNamespace: 'toolSedentaryReminder' },
  { path: '/http-debugger', nameKey: 'tools.http_debugger', icon: Wrench, categoryKey: 'dev', keywords: ['HTTP', 'API', '调试', 'request'], i18nNamespace: 'toolHttpDebugger' },
  { path: '/travel-cost-estimate', nameKey: 'tools.travel_cost_estimate', icon: Wallet, categoryKey: 'travel', keywords: ['旅行', '消费', '预算', '估算'], i18nNamespace: 'toolTravelCostEstimate' },
  { path: '/multi-city-route', nameKey: 'tools.multi_city_route', icon: Navigation, categoryKey: 'travel', keywords: ['路线', '城市', '行程', '优化'], i18nNamespace: 'toolMultiCityRoute' },
  { path: '/visa-info', nameKey: 'tools.visa_info', icon: Stamp, categoryKey: 'travel', keywords: ['签证', '免签', '出行', 'visa'], i18nNamespace: 'toolVisaInfo' },
  { path: '/fitness-planner', nameKey: 'tools.fitness_planner', icon: Dumbbell, categoryKey: 'life', keywords: ['健身', '训练', '计划', 'fitness'], i18nNamespace: 'toolFitnessPlanner' },
  { path: '/meeting-scheduler', nameKey: 'tools.meeting_scheduler', icon: CalendarRange, categoryKey: 'life', keywords: ['会议', '时区', '时间', 'meeting'], i18nNamespace: 'toolMeetingScheduler' },
  { path: '/color-system', nameKey: 'tools.color_system', icon: Palette, categoryKey: 'design', keywords: ['色彩', '设计', '品牌', 'color'], i18nNamespace: 'toolColorSystem' },
  { path: '/graphql-builder', nameKey: 'tools.graphql_builder', icon: Code2, categoryKey: 'dev', keywords: ['graphql', '查询', 'api', 'builder'], i18nNamespace: 'toolGraphqlBuilder' },
  { path: '/habit-tracker', nameKey: 'tools.habit_tracker', icon: CheckSquare, categoryKey: 'life', keywords: ['习惯', '打卡', '追踪', 'habit'], i18nNamespace: 'toolHabitTracker' },
]

export const TOOLS_BY_PATH = new Map(TOOLS.map((t) => [t.path, t]))

export function getToolsForNav() {
  return TOOLS.filter((t) => t.path !== '/')
}

export function getToolByPath(path: string): ToolEntry | undefined {
  return TOOLS_BY_PATH.get(path)
}

/** 工具展示标题：优先使用 manifest meta（立即可用），回退到 i18n namespace，最后用 nav.nameKey */
export function getToolTitle(
  tool: ToolEntry,
  t: (key: string) => string
): string {
  // 1. 优先使用 manifest meta（立即可用，无需等待 i18n namespace 加载）
  const manifestMeta = getToolManifestMetaByPath(tool.path, i18n.resolvedLanguage || i18n.language)
  if (manifestMeta?.title) return manifestMeta.title
  
  // 2. 回退到 i18n namespace（如果已加载）
  if (tool.i18nNamespace) {
    const translated = t(`${tool.i18nNamespace}:title`)
    if (translated !== `${tool.i18nNamespace}:title`) return translated
  }
  
  // 3. 最终回退到 nav.nameKey
  return t(tool.nameKey)
}

/** 工具展示描述：优先使用 manifest meta，回退到 i18n namespace，最后用 home.toolDesc.* */
export function getToolDescription(
  tool: ToolEntry,
  t: (key: string) => string,
  tHome: (key: string) => string
): string {
  // 1. 优先使用 manifest meta（立即可用）
  const manifestMeta = getToolManifestMetaByPath(tool.path, i18n.resolvedLanguage || i18n.language)
  if (manifestMeta?.description) return manifestMeta.description
  
  // 2. 回退到 i18n namespace（如果已加载）
  if (tool.i18nNamespace) {
    const translated = t(`${tool.i18nNamespace}:description`)
    if (translated !== `${tool.i18nNamespace}:description`) return translated
  }
  
  // 3. 最终回退到 home.toolDesc.*
  const descKey = tool.nameKey.replace('tools.', '')
  return tHome(`toolDesc.${descKey}`)
}







