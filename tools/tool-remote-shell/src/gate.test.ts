// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GATE_BAD_TOKEN, checkGate, readGateConfig } from '../server/gate.js';
import { createLimiter } from '../server/limits.js';

describe('访问门禁', () => {
  it('未设 TOKEN：开箱即用，不拦任何人', () => {
    const config = readGateConfig({});
    expect(config.requiresToken).toBe(false);
    expect(checkGate(config, undefined)).toEqual({ ok: true });
    expect(checkGate(config, 'whatever')).toEqual({ ok: true });
  });

  it('设了 TOKEN：口令对才放行', () => {
    const config = readGateConfig({ REMOTE_SHELL_TOKEN: 's3cret' });
    expect(config.requiresToken).toBe(true);
    expect(checkGate(config, 's3cret')).toEqual({ ok: true });
    expect(checkGate(config, 'nope')).toMatchObject({ ok: false, code: GATE_BAD_TOKEN });
    expect(checkGate(config, '')).toMatchObject({ ok: false, code: GATE_BAD_TOKEN });
    expect(checkGate(config, undefined)).toMatchObject({ ok: false, code: GATE_BAD_TOKEN });
  });

  it('只有空白的 TOKEN 等于没设，不会变成「口令是空格」这种半开状态', () => {
    const config = readGateConfig({ REMOTE_SHELL_TOKEN: '   ' });
    expect(config.requiresToken).toBe(false);
    expect(checkGate(config, undefined)).toEqual({ ok: true });
  });

  it('长度不同的 token 不会让定长比较抛错', () => {
    const config = readGateConfig({ REMOTE_SHELL_TOKEN: 'abc' });
    expect(() => checkGate(config, 'abcdefghijkl')).not.toThrow();
    expect(checkGate(config, 'abcdefghijkl').ok).toBe(false);
  });
});

describe('会话配额与锁定', () => {
  it('单 IP 超过上限后拒绝，释放后恢复', () => {
    const limiter = createLimiter({ maxPerIp: 2, maxTotal: 10 });
    expect(limiter.acquire('1.1.1.1').ok).toBe(true);
    expect(limiter.acquire('1.1.1.1').ok).toBe(true);
    expect(limiter.acquire('1.1.1.1')).toMatchObject({ ok: false, code: 'too_many_sessions' });
    limiter.release('1.1.1.1');
    expect(limiter.acquire('1.1.1.1').ok).toBe(true);
  });

  it('全局上限独立于单 IP 上限', () => {
    const limiter = createLimiter({ maxPerIp: 5, maxTotal: 2 });
    limiter.acquire('1.1.1.1');
    limiter.acquire('2.2.2.2');
    expect(limiter.acquire('3.3.3.3')).toMatchObject({ ok: false, code: 'server_busy' });
  });

  it('连续认证失败达阈值后锁定该 IP', () => {
    const limiter = createLimiter({ maxFails: 3, lockoutMs: 60_000 });
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) limiter.recordFailure('9.9.9.9', now);
    const result = limiter.acquire('9.9.9.9', now);
    expect(result).toMatchObject({ ok: false, code: 'locked_out' });
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('锁定期满后自动放行', () => {
    const limiter = createLimiter({ maxFails: 2, lockoutMs: 1000 });
    const now = 1_000_000;
    limiter.recordFailure('9.9.9.9', now);
    limiter.recordFailure('9.9.9.9', now);
    expect(limiter.acquire('9.9.9.9', now).ok).toBe(false);
    expect(limiter.acquire('9.9.9.9', now + 2000).ok).toBe(true);
  });

  it('失败计数窗口滑走后重新计', () => {
    const limiter = createLimiter({ maxFails: 2, failWindowMs: 1000, lockoutMs: 60_000 });
    const now = 1_000_000;
    limiter.recordFailure('9.9.9.9', now);
    limiter.recordFailure('9.9.9.9', now + 5000); // 超出窗口，算新的一次
    expect(limiter.acquire('9.9.9.9', now + 5000).ok).toBe(true);
  });

  it('认证成功清空失败计数', () => {
    const limiter = createLimiter({ maxFails: 2 });
    const now = 1_000_000;
    limiter.recordFailure('9.9.9.9', now);
    limiter.recordSuccess('9.9.9.9');
    limiter.recordFailure('9.9.9.9', now);
    expect(limiter.acquire('9.9.9.9', now).ok).toBe(true);
  });
});
