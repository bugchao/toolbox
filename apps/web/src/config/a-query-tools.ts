// 查询工具配置 - Query Tools
// 包含：天气/邮编/新闻/IP 等查询工具

import type { ToolEntry } from './tools'
import {
  CloudSun, MailOpen, Newspaper, MapPin, Network, Search
} from 'lucide-react'

export const QUERY_TOOLS: ToolEntry[] = [
  { path: '/weather', nameKey: 'tools.weather', icon: CloudSun, categoryKey: 'query', keywords: ['天气', 'weather', 'forecast'], i18nNamespace: 'toolWeather', mode: 'hybrid' },
  { path: '/zipcode', nameKey: 'tools.zipcode', icon: MailOpen, categoryKey: 'query', keywords: ['邮编', 'zip'], mode: 'server' },
  { path: '/news', nameKey: 'tools.news', icon: Newspaper, categoryKey: 'news', keywords: ['热点', '新闻'], mode: 'server' },
  { path: '/ip-query', nameKey: 'tools.ip_query', icon: MapPin, categoryKey: 'ip', keywords: ['ip'], i18nNamespace: 'toolIpQuery', mode: 'server' },
  { path: '/ip-asn', nameKey: 'tools.ip_asn', icon: Network, categoryKey: 'ip', keywords: ['asn', 'as', '归属'], i18nNamespace: 'toolIpAsn', mode: 'server' },
]
