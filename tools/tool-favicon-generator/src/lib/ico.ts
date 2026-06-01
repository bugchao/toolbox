/**
 * ICO 容器编码：PNG-in-ICO 方案
 *
 * Reference (Microsoft ICO format):
 *   ICONDIR        : 6 bytes  (reserved=0, type=1 icon, count=N)
 *   ICONDIRENTRY   : 16 bytes * N
 *     width        : 1 byte  (0 表示 256)
 *     height       : 1 byte  (0 表示 256)
 *     colorCount   : 1 byte  (0)
 *     reserved     : 1 byte  (0)
 *     planes       : 2 bytes (1)
 *     bitCount     : 2 bytes (32)
 *     bytesInRes   : 4 bytes (PNG 字节数)
 *     offset       : 4 bytes (从文件头偏移)
 *   Image data : 直接拼接 N 段 PNG 二进制
 */

export interface IcoEntry {
  size: number
  png: Uint8Array
}

const ICONDIR_SIZE = 6
const ICONDIRENTRY_SIZE = 16

export function encodeIco(entries: IcoEntry[]): Uint8Array {
  if (entries.length === 0) {
    throw new Error('encodeIco: at least one entry is required')
  }

  const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * entries.length
  let pngTotal = 0
  for (const e of entries) pngTotal += e.png.byteLength

  const out = new Uint8Array(headerSize + pngTotal)
  const view = new DataView(out.buffer)

  // ICONDIR
  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type = 1 (icon)
  view.setUint16(4, entries.length, true) // count

  let offset = headerSize
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const entryOffset = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE
    // width / height (0 means 256)
    out[entryOffset + 0] = e.size >= 256 ? 0 : e.size
    out[entryOffset + 1] = e.size >= 256 ? 0 : e.size
    out[entryOffset + 2] = 0 // colorCount
    out[entryOffset + 3] = 0 // reserved
    view.setUint16(entryOffset + 4, 1, true) // planes
    view.setUint16(entryOffset + 6, 32, true) // bitCount
    view.setUint32(entryOffset + 8, e.png.byteLength, true) // bytesInRes
    view.setUint32(entryOffset + 12, offset, true) // offset
    out.set(e.png, offset)
    offset += e.png.byteLength
  }

  return out
}

export const ICO_HEADER_SIZE = ICONDIR_SIZE
export const ICO_ENTRY_SIZE = ICONDIRENTRY_SIZE
