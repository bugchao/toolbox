import type { ToolPlugin, ToolManifest } from './types'

/**
 * 工具加载器
 * 负责动态加载工具插件
 */
export class ToolLoader {
  private static cache = new Map<string, ToolPlugin>()

  /**
   * 加载工具
   * @param manifestUrl 工具清单URL
   */
  static async loadTool(manifestUrl: string): Promise<ToolPlugin> {
    // 检查缓存
    if (this.cache.has(manifestUrl)) {
      return this.cache.get(manifestUrl)!
    }

    try {
      // 加载清单文件
      const manifestResponse = await fetch(manifestUrl)
      const manifest: ToolManifest = await manifestResponse.json()

      // 加载工具代码
      const module = await import(/* @vite-ignore */ manifest.entry)
      const toolPlugin = module.default as ToolPlugin

      // 验证工具接口
      this.validateToolPlugin(toolPlugin)

      // 缓存
      this.cache.set(manifestUrl, toolPlugin)

      return toolPlugin
    } catch (error) {
      console.error('Failed to load tool:', error)
      throw new Error(`工具加载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 验证工具插件接口
   */
  private static validateToolPlugin(plugin: ToolPlugin): void {
    const requiredFields: Array<keyof ToolPlugin> = ['id', 'name', 'description', 'category', 'icon', 'version', 'mount', 'unmount']
    
    for (const field of requiredFields) {
      if (!plugin[field]) {
        throw new Error(`工具插件缺少必需字段: ${field}`)
      }
    }

    if (typeof plugin.mount !== 'function') {
      throw new Error('mount 必须是函数')
    }

    if (typeof plugin.unmount !== 'function') {
      throw new Error('unmount 必须是函数')
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取已加载的工具
   */
  static getLoadedTools(): ToolPlugin[] {
    return Array.from(this.cache.values())
  }
}
