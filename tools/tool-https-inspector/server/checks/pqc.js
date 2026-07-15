import { buildPqcClientHello, parseServerHello, probeRaw, isPqcGroup, PQC_GROUP_NAMES, classifyProbeError } from '../tls-raw.js';

/**
 * 后量子 HTTPS 检测：ClientHello advertise X25519MLKEM768 但只带 x25519 key_share。
 * 若服务端支持并偏好后量子组，会回 HelloRetryRequest 索要该组 → 判定支持。
 */
export async function checkPqc(host, port = 443, timeout = 8000) {
  try {
    const raw = await probeRaw(host, port, buildPqcClientHello(host), timeout);
    const hello = parseServerHello(raw);

    if (hello.type === 'server_hello' && isPqcGroup(hello.selectedGroup)) {
      return {
        ok: true,
        supported: true,
        group: PQC_GROUP_NAMES[hello.selectedGroup] || `0x${hello.selectedGroup.toString(16)}`,
        viaHelloRetry: Boolean(hello.isHRR),
      };
    }
    return { ok: true, supported: false };
  } catch (err) {
    if (classifyProbeError(err) === 'not-supported') return { ok: true, supported: false };
    return { ok: false, error: err.message || '检测失败' };
  }
}
