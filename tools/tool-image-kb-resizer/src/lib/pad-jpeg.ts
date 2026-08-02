// JPEG 解码器读到 EOI (FFD9) 即停止解码；EOI 之后追加任意字节不影响图片内容或可解码性。
export function padJpeg(bytes: Uint8Array, targetSize: number): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Not a valid JPEG (missing SOI marker)')
  }
  if (targetSize <= bytes.length) {
    throw new Error('Target size must be greater than the current size')
  }

  // 定位最后一个 EOI 标记；正常情况下就是文件末尾两字节，忽略其后任何已有的尾随数据
  let eoiEnd = -1
  for (let i = bytes.length - 2; i >= 2; i--) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
      eoiEnd = i + 2
      break
    }
  }
  if (eoiEnd === -1) throw new Error('Not a valid JPEG (missing EOI marker)')

  const result = new Uint8Array(targetSize)
  result.set(bytes.subarray(0, eoiEnd), 0)
  return result
}
