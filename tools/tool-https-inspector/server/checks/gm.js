import { buildGmClientHello, parseServerHello, probeRaw, isGmCipher, GM_CIPHER_NAMES, classifyProbeError } from '../tls-raw.js';

/** 国密 TLCP/GM HTTPS 检测：发送携带 SM2 套件的 ClientHello，看服务端是否选中国密套件。 */
export async function checkGm(host, port = 443, timeout = 8000) {
  try {
    const raw = await probeRaw(host, port, buildGmClientHello(host), timeout);
    const hello = parseServerHello(raw);

    if (hello.type === 'server_hello' && isGmCipher(hello.cipherSuite)) {
      return {
        ok: true,
        supported: true,
        cipherSuite: GM_CIPHER_NAMES[hello.cipherSuite] || `0x${hello.cipherSuite.toString(16)}`,
      };
    }
    // 服务端返回 alert 或选了非国密套件 → 不支持
    return { ok: true, supported: false };
  } catch (err) {
    // 服务端主动重置连接 = 不接受国密 ClientHello = 不支持
    if (classifyProbeError(err) === 'not-supported') return { ok: true, supported: false };
    return { ok: false, error: err.message || '检测失败' };
  }
}
