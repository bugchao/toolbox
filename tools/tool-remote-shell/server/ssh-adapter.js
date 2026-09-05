import crypto from 'node:crypto';
import { Client } from 'ssh2';

/** OpenSSH 风格指纹，和 `ssh-keyscan | ssh-keygen -lf -` 的输出一致，便于用户比对 */
export function fingerprintOf(key) {
  const digest = crypto.createHash('sha256').update(key).digest('base64').replace(/=+$/, '');
  return `SHA256:${digest}`;
}

/**
 * 建立 SSH 连接。
 *
 * Host key 走 TOFU：调用方没传 expectedFingerprint 时**主动中断握手**，
 * 把指纹通过 error.fingerprint 带出去让前端弹确认框，而不是静默信任。
 * 静默信任等于把中间人攻击的门开着还挂个「已加密」的牌子。
 */
export function connectSsh({
  host,
  port = 22,
  username,
  auth,
  expectedFingerprint = null,
  timeoutMs = 15_000,
}) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    let seenFingerprint = null;
    let hostKeyAccepted = false;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      error.fingerprint = seenFingerprint;
      if (seenFingerprint && !hostKeyAccepted) {
        error.code = expectedFingerprint ? 'EHOSTKEY_MISMATCH' : 'EHOSTKEY_UNKNOWN';
      } else if (error.level === 'client-authentication') {
        error.code = 'EAUTH';
      }
      try { client.end(); } catch { /* 已经断了就算了 */ }
      reject(error);
    };

    client.on('ready', () => {
      if (settled) return;
      settled = true;
      resolve({ client, fingerprint: seenFingerprint });
    });
    client.on('error', fail);

    const config = {
      host,
      port,
      username,
      readyTimeout: timeoutMs,
      keepaliveInterval: 20_000,
      hostVerifier: (key) => {
        seenFingerprint = fingerprintOf(key);
        if (!expectedFingerprint) return false; // 首连：中断，交给前端确认
        hostKeyAccepted = seenFingerprint === expectedFingerprint;
        return hostKeyAccepted;
      },
    };

    if (auth?.type === 'key') {
      config.privateKey = auth.privateKey;
      if (auth.passphrase) config.passphrase = auth.passphrase;
    } else {
      config.password = auth?.password ?? '';
    }

    try {
      client.connect(config);
    } catch (error) {
      fail(error);
    }
  });
}

export function openShell(client, { cols = 80, rows = 24, term = 'xterm-256color' } = {}) {
  return new Promise((resolve, reject) => {
    client.shell({ term, cols, rows }, (error, stream) => {
      if (error) reject(error);
      else resolve(stream);
    });
  });
}

/** 把底层报错收敛成前端能直接查文案的稳定错误码，不把 stack 吐给用户 */
export function classifyConnectError(error) {
  const code = error?.code;
  if (code === 'EHOSTKEY_UNKNOWN') return 'hostkey_unknown';
  if (code === 'EHOSTKEY_MISMATCH') return 'hostkey_mismatch';
  if (code === 'EDNS' || code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'dns_failed';
  if (code === 'ECONNREFUSED') return 'refused';
  if (code === 'ETIMEDOUT' || code === 'EHOSTUNREACH' || code === 'ENETUNREACH') return 'timeout';
  if (code === 'EAUTH' || error?.level === 'client-authentication') return 'auth_failed';
  if (/timed? ?out/i.test(error?.message || '')) return 'timeout';
  return 'connect_failed';
}
