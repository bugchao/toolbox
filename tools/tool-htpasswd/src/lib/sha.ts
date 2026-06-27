// {SHA} 方案：base64(sha1(password))，兼容 Apache/Nginx 的 -s（SHA1）选项。
// 使用 WebCrypto（异步），因此该函数返回 Promise。

const encoder = new TextEncoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // btoa 在浏览器与 Node（globalThis.btoa）均可用
  return btoa(binary)
}

/** 计算 {SHA}base64(sha1(password)) 形式的哈希。 */
export async function shaHash(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', encoder.encode(password))
  return `{SHA}${bytesToBase64(new Uint8Array(digest))}`
}
