/** 适配器统一契约：每个 engine 都实现这套接口。 */
import type { DiagramEngine } from '../domain/types'

export type AdapterValidation = { ok: true } | { ok: false; message: string; line?: number }
export type AdapterRender = { ok: true; svg: string } | { ok: false; message: string }

/** 渲染选项基础类型；各 adapter 可声明自己的扩展接口（如 PlantUml 加 serverUrl）。 */
export type RenderOptions = Record<string, unknown>

export interface DiagramAdapter {
  engine: DiagramEngine
  /** 文件扩展名匹配（小写，含点） */
  fileExtensions: readonly string[]
  /** 默认源模板 */
  template(): string
  /** 静态校验源码（不需要 DOM）；mermaid 复用 parse 接口 */
  validate(source: string): Promise<AdapterValidation>
  /** 渲染源码到 SVG 字符串；options 形态由具体 adapter 决定 */
  render(source: string, options?: RenderOptions): Promise<AdapterRender>
  /** source 文件名（导出时用） */
  defaultSourceName(title: string): string
}
