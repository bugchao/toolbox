export interface ToolConfig {
  /** 工具唯一ID */
  id: string
  /** 工具名称 */
  name: string
  /** 工具描述 */
  description: string
  /** 工具分类 */
  category: string
  /** 工具图标 */
  icon: string
  /** 版本号 */
  version: string
  /** 作者 */
  author?: string
  /** 主页 */
  homepage?: string
  /** 能力声明 */
  capabilities?: {
    /** 是否需要后端支持 */
    needBackend?: boolean
    /** 是否支持离线使用 */
    supportOffline?: boolean
    /** 需要的权限 */
    requiredPermissions?: string[]
  }
}

export interface ToolPlugin extends ToolConfig {
  /**
   * 挂载工具到容器
   * @param container 挂载容器
   * @param config 配置参数
   */
  mount: (container: HTMLElement, config?: Record<string, any>) => Promise<void>
  
  /**
   * 卸载工具
   */
  unmount: () => Promise<void>
  
  /**
   * 更新工具配置
   * @param config 新的配置
   */
  update?: (config: Record<string, any>) => Promise<void>
}

export interface ToolManifest {
  schemaVersion: string
  tool: ToolConfig
  entry: string
  css?: string
  dependencies?: Record<string, string>
}
