export type OutputFormat = 'same' | 'jpeg' | 'png' | 'webp'

export interface ResizeResult {
  actualSize: number
  blob: Blob
  approximate: boolean
}
