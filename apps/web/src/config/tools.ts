// 工具盒子 - 主配置文件
// 引入各类型工具配置，合并为统一的 TOOLS 数组

import type { ToolEntry } from './tools'
import i18n from '../i18n'
import { getToolManifestMetaByPath } from '../tooling/tool-manifests'
import { Home, Star } from 'lucide-react'

// 引入分类型工具配置
import { NETWORK_TOOLS } from './a-network-tools'
import { DEV_TOOLS } from './a-dev-tools'
import { LIFE_TOOLS } from './a-life-tools'
import { TRAVEL_TOOLS } from './a-travel-tools'
import { UTILITY_TOOLS } from './a-utility-tools'
import { AI_TOOLS } from './a-ai-tools'
import { QUERY_TOOLS } from './a-query-tools'
import { LEARNING_TOOLS } from './a-learning-tools'

// 合并所有工具配置
export const TOOLS: ToolEntry[] = [
  // 基础导航（2 个）
  { path: '/', nameKey: 'home', icon: Home },
  { path: '/favorites', nameKey: 'favorites', icon: Star },
  
  // 各类型工具
  ...NETWORK_TOOLS,
  ...DEV_TOOLS,
  ...LIFE_TOOLS,
  ...TRAVEL_TOOLS,
  ...UTILITY_TOOLS,
  ...AI_TOOLS,
  ...QUERY_TOOLS,
  ...LEARNING_TOOLS,
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
