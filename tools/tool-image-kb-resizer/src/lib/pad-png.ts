import { crc32 } from './crc32'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
// "paDd"：首字母小写=ancillary（解码器可跳过未识别块）、末字母小写=safe-to-copy，第三字母按规范保持大写（reserved bit）
const CHUNK_TYPE = [0x70, 0x61, 0x44, 0x64]
const CHUNK_OVERHEAD = 12 // 4(length) + 4(type) + 4(crc)

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] * 0x1000000 + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]
}

function writeUint32BE(target: Uint8Array, offset: number, value: number) {
  target[offset] = (value >>> 24) & 0xff
  target[offset + 1] = (value >>> 16) & 0xff
  target[offset + 2] = (value >>> 8) & 0xff
  target[offset + 3] = value & 0xff
}

function findIendOffset(bytes: Uint8Array): number {
  let offset = 8 // 跳过 PNG 签名
  while (offset + 8 <= bytes.length) {
    const length = readUint32BE(bytes, offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    if (type === 'IEND') return offset
    offset += 8 + length + 4 // length字段 + type + data + crc
  }
  return -1
}

/** 在 IEND 块之前插入一个自定义 ancillary+safe-to-copy 私有块，使总长度精确等于目标大小。 */
export function padPng(bytes: Uint8Array, targetSize: number): Uint8Array {
  if (bytes.length < 8 || !PNG_SIGNATURE.every((b, i) => bytes[i] === b)) {
    throw new Error('Not a valid PNG (bad signature)')
  }
  if (targetSize <= bytes.length) {
    throw new Error('Target size must be greater than the current size')
  }
  const iendOffset = findIendOffset(bytes)
  if (iendOffset === -1) throw new Error('Not a valid PNG (missing IEND chunk)')

  const dataLen = targetSize - bytes.length - CHUNK_OVERHEAD
  if (dataLen < 0) throw new Error('Target size too small to insert a padding chunk')

  const chunk = new Uint8Array(CHUNK_OVERHEAD + dataLen)
  writeUint32BE(chunk, 0, dataLen)
  chunk.set(CHUNK_TYPE, 4)
  // data 部分保持全零即可（Uint8Array 默认零填充）

  const crc = crc32(chunk.subarray(4, 8 + dataLen)) // CRC 覆盖 type + data，不含 length 字段
  writeUint32BE(chunk, 8 + dataLen, crc)

  const result = new Uint8Array(targetSize)
  result.set(bytes.subarray(0, iendOffset), 0)
  result.set(chunk, iendOffset)
  result.set(bytes.subarray(iendOffset), iendOffset + chunk.length)
  return result
}
