const CHUNK_FOURCC = [0x50, 0x41, 0x44, 0x20] // 'PAD ' — 未知 FourCC，RIFF 解析器按声明大小安全跳过
const CHUNK_HEADER = 8 // FourCC(4) + size(4)

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0
}

function writeUint32LE(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
  target[offset + 2] = (value >>> 16) & 0xff
  target[offset + 3] = (value >>> 24) & 0xff
}

/**
 * 追加一个新的 RIFF 子块（未知 FourCC，遵守偶数字节对齐）到文件末尾，并更新外层 RIFF
 * 长度字段。标准解码器按各子块自身声明的大小顺序解析，遇到不认识的 FourCC 会直接跳过。
 */
export function padWebp(bytes: Uint8Array, targetSize: number): Uint8Array {
  const isRiff = bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
  const isWebp = isRiff && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  if (!isWebp) throw new Error('Not a valid WEBP (bad RIFF/WEBP header)')
  if (targetSize <= bytes.length) throw new Error('Target size must be greater than the current size')

  const remaining = targetSize - bytes.length - CHUNK_HEADER
  if (remaining < 0) {
    // 剩余空间连一个最小子块头都放不下：直接在声明的 RIFF 大小之外追加原始字节，
    // 解码器只读到声明大小为止，这部分会被忽略（与 JPEG EOI 后追加字节同理）。
    const result = new Uint8Array(targetSize)
    result.set(bytes, 0)
    return result
  }

  // RIFF 要求子块数据长度为偶数（奇数需补 1 字节对齐）；固定选偶数 dataLen 避免这一额外处理，
  // 若差值为奇数，剩下 1 字节作为块外的原始尾随字节补足（数组默认零填充，无需显式写入）。
  const dataLen = remaining % 2 === 0 ? remaining : remaining - 1

  const chunk = new Uint8Array(CHUNK_HEADER + dataLen)
  chunk.set(CHUNK_FOURCC, 0)
  writeUint32LE(chunk, 4, dataLen)

  const originalRiffSize = readUint32LE(bytes, 4)
  const newRiffSize = originalRiffSize + CHUNK_HEADER + dataLen

  const result = new Uint8Array(targetSize)
  result.set(bytes.subarray(0, 4), 0) // 'RIFF'
  writeUint32LE(result, 4, newRiffSize)
  result.set(bytes.subarray(8), 8) // 'WEBP' + 原有子块
  result.set(chunk, bytes.length)
  return result
}
