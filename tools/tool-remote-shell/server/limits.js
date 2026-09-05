/**
 * 会话配额与认证失败锁定。
 *
 * 这是公网形态下唯一挡在「别人拿你的服务器爆破第三方主机」前面的东西，
 * 所以默认值取得比较紧，放宽要显式传参。
 */
export function createLimiter({
  // 一个标签页占一条会话，多开几个终端是正常用法，3 会挡到自己人。
  // 8 仍然是个有效的滥用上限：爆破需要的是成百上千条并发，不是 8 条。
  maxPerIp = 8,
  maxTotal = 40,
  maxFails = 5,
  failWindowMs = 60_000,
  lockoutMs = 10 * 60_000,
} = {}) {
  const perIp = new Map(); // ip -> 活跃会话数
  const fails = new Map(); // ip -> { count, first, until }
  let total = 0;

  function currentLock(ip, now) {
    const record = fails.get(ip);
    if (!record) return null;
    if (record.until > now) return record;
    // 锁定已过期，或计数窗口已滑走：直接清掉重新计
    if (record.until > 0 || now - record.first > failWindowMs) {
      fails.delete(ip);
      return null;
    }
    return record;
  }

  return {
    acquire(ip, now = Date.now()) {
      const lock = currentLock(ip, now);
      if (lock && lock.until > now) {
        return { ok: false, code: 'locked_out', retryAfterMs: lock.until - now };
      }
      if (total >= maxTotal) return { ok: false, code: 'server_busy' };
      const current = perIp.get(ip) || 0;
      if (current >= maxPerIp) return { ok: false, code: 'too_many_sessions' };
      perIp.set(ip, current + 1);
      total += 1;
      return { ok: true };
    },

    release(ip) {
      const current = perIp.get(ip) || 0;
      if (current <= 1) perIp.delete(ip);
      else perIp.set(ip, current - 1);
      if (total > 0) total -= 1;
    },

    recordFailure(ip, now = Date.now()) {
      const record = fails.get(ip);
      if (!record || now - record.first > failWindowMs) {
        fails.set(ip, { count: 1, first: now, until: 0 });
        return;
      }
      record.count += 1;
      if (record.count >= maxFails) record.until = now + lockoutMs;
    },

    recordSuccess(ip) {
      fails.delete(ip);
    },

    stats() {
      return { total, activeIps: perIp.size, lockedIps: fails.size };
    },
  };
}
