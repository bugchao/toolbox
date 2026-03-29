// AI 工具配置 - AI Tools
// 包含：会议纪要/UI 设计/PPT 生成等 AI 工具

import type { ToolEntry } from './tools'
import {
  ClipboardList, Paintbrush2, Presentation, Sparkles
} from 'lucide-react'

export const AI_TOOLS: ToolEntry[] = [
  { path: '/meeting-minutes', nameKey: 'tools.meeting_minutes', icon: ClipboardList, categoryKey: 'ai', keywords: ['会议纪要', 'transcript', 'minutes'] },
  { path: '/ui-generator', nameKey: 'tools.ui_generator', icon: Paintbrush2, categoryKey: 'ai', keywords: ['ui', 'wireframe', '设计生成'] },
  { path: '/ppt-generator', nameKey: 'tools.ppt_generator', icon: Presentation, categoryKey: 'ai', keywords: ['ppt', '演示', '幻灯片', 'ai'], i18nNamespace: 'toolPptGenerator' },
]
