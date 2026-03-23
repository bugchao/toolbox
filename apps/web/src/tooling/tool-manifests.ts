/**
 * 工具 manifest 注册中心
 * 当前采用手动导入方式（稳定可靠）
 * 后续工具多了再考虑自动扫描
 */

import type { ToolManifest } from '@toolbox/tool-registry'

// ==================== 手动导入 manifest ====================
// 新工具在这里导入
import weatherToolManifest from '@toolbox/tool-weather/tool.manifest'
import todoListToolManifest from '@toolbox/tool-todo-list/tool.manifest'

// 老工具继续用懒加载，不需要 manifest

const toolManifests: ToolManifest[] = [
  weatherToolManifest,
  todoListToolManifest,
]

// 按 path 索引，方便查找
export const toolManifestByPath = new Map(
  toolManifests.map((manifest) => [manifest.path, manifest])
)

/** 根据路径获取 manifest */
export function getToolManifestByPath(path: string): ToolManifest | undefined {
  return toolManifestByPath.get(path)
}

/** 根据路径获取 manifest meta（支持多语言） */
export function getToolManifestMetaByPath(
  path: string,
  language?: string
): { title: string; description: string } | null {
  const manifest = getToolManifestByPath(path)
  if (!manifest) return null

  const lang = language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  return manifest.meta[lang] || manifest.meta.zh || manifest.meta.en || null
}
