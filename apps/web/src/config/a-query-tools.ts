// 查询工具配置 - Query Tools
// 包含：天气/邮编/新闻/IP 等查询工具

import type { ToolEntry } from './tools'
import {
  CloudSun, MailOpen, Newspaper
} from 'lucide-react'

export const QUERY_TOOLS: ToolEntry[] = [
  { path: '/weather', nameKey: 'tools.weather', icon: CloudSun, categoryKey: 'query', keywords: ['天气', 'weather', 'forecast'], i18nNamespace: 'toolWeather', mode: 'hybrid' },
  { path: '/zipcode', nameKey: 'tools.zipcode', icon: MailOpen, categoryKey: 'query', keywords: ['邮编', 'zip'], mode: 'server' },
  { path: '/news', nameKey: 'tools.news', icon: Newspaper, categoryKey: 'news', keywords: ['热点', '新闻'], mode: 'server' },
]
