declare module 'jspdf' {
  class jsPDF {
    constructor(options?: { orientation?: 'p' | 'l' | 'portrait' | 'landscape'; unit?: string; format?: string | number[] })
    addImage(imgData: string, format: string, x: number, y: number, width: number, height: number): this
    addPage(): this
    save(filename?: string): void
    [key: string]: unknown
  }
  export = jsPDF
}

declare module 'html2canvas' {
  type Options = Partial<{
    allowTaint: boolean
    backgroundColor: string
    imageTimeout: number
    logging: boolean
    scale: number
    useCORS: boolean
    width: number
    height: number
    [key: string]: unknown
  }>
  function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>
  export default html2canvas
}

declare module 'nanoid' {
  export function nanoid(size?: number): string
  export function customAlphabet(alphabet: string, defaultSize?: number): (size?: number) => string
}

declare module 'virtual:toolbox-manifests' {
  import type { ToolManifest } from '@toolbox/tool-registry'
  export const allManifests: ToolManifest[]
}
