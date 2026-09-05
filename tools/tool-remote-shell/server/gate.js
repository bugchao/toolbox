import crypto from 'node:crypto';

export const GATE_BAD_TOKEN = 'bad_token';

/**
 * 只有一个开关：REMOTE_SHELL_TOKEN。
 *   未设 → 直接可用（本地 / 内网 / 自己的机器，开箱即连）
 *   设了 → 要求访问口令（公网部署时用它把陌生人挡在外面）
 *
 * 无论哪种形态，limits.js 的会话配额与失败锁定都照常生效，那是硬性的。
 */
export function readGateConfig(env = process.env) {
  const token = (env.REMOTE_SHELL_TOKEN || '').trim();
  return { token, requiresToken: token.length > 0 };
}

// 定长比较：用 !== 比 token 会因为提前返回而泄漏公共前缀长度
function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function checkGate(config, providedToken) {
  if (!config.requiresToken) return { ok: true };
  if (!providedToken || !safeEqual(config.token, providedToken)) {
    return { ok: false, code: GATE_BAD_TOKEN };
  }
  return { ok: true };
}
