import type { LucideIcon } from 'lucide-react'
import {
  Home, Star, QrCode, Newspaper, MapPin, Cloud, Code, FileCode, Clock, Link2,
  Shuffle, Calendar, Key, Fingerprint, Braces, Hash, Image, FileText, Heart,
  Palette, Wand2, Eraser, Ruler, Search, File, Globe
} from 'lucide-react'

export interface ToolEntry {
  path: string
  nameKey: string
  icon: LucideIcon
  categoryKey?: string
  /** 搜索用关键词（当前语言外的拼音/英文等），可选 */
  keywords?: string[]
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
  { path: '/ip-query', nameKey: 'tools.ip_query', icon: Globe, categoryKey: 'query', keywords: ['ip'] },
  { path: '/json', nameKey: 'tools.json', icon: Braces, categoryKey: 'dev', keywords: ['json'] },
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
  { path: '/short-link', nameKey: 'tools.short_link', icon: Link2, categoryKey: 'utils', keywords: ['短链接'] },
  { path: '/resume-generator', nameKey: 'tools.resume', icon: FileText, categoryKey: 'utils', keywords: ['简历'] },
  { path: '/color-generator', nameKey: 'tools.color_generator', icon: Palette, categoryKey: 'utils', keywords: ['配色'] },
  { path: '/meme-generator', nameKey: 'tools.meme_generator', icon: Wand2, categoryKey: 'utils', keywords: ['表情包'] },
  { path: '/copywriting-generator', nameKey: 'tools.copywriting_generator', icon: FileText, categoryKey: 'utils', keywords: ['文案'] },
  { path: '/wooden-fish', nameKey: 'tools.wooden_fish', icon: Heart, categoryKey: 'utils', keywords: ['木鱼'] },
  { path: '/life-progress', nameKey: 'tools.life_progress', icon: Clock, categoryKey: 'utils', keywords: ['人生进度'] },
]

export const TOOLS_BY_PATH = new Map(TOOLS.map((t) => [t.path, t]))

export function getToolsForNav() {
  return TOOLS.filter((t) => t.path !== '/')
}

export function getToolByPath(path: string): ToolEntry | undefined {
  return TOOLS_BY_PATH.get(path)
}
