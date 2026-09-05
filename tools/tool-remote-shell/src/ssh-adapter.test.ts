// @vitest-environment node
import crypto from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import ssh2 from 'ssh2';
import { classifyConnectError, connectSsh, openShell } from '../server/ssh-adapter.js';

const USER = 'demo';
const PASSWORD = 'pw-correct';

let server: import('ssh2').Server;
let port = 0;
let realFingerprint = '';

// 起一台真的 SSH 服务，验的是 TOFU 这条最容易写错的路径：
// 首连必须中断并交出指纹，而不是静默信任。
beforeAll(async () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  server = new ssh2.Server({ hostKeys: [privateKey] }, (client) => {
    // TOFU 用例里客户端会主动中断密钥交换，服务端因此收到 KEY_EXCHANGE_FAILED。
    // 这是被测行为的正常结果，不吞掉的话会变成进程级未捕获异常。
    client.on('error', () => {});
    client.on('authentication', (ctx) => {
      if (ctx.method === 'password' && ctx.username === USER && ctx.password === PASSWORD) {
        ctx.accept();
      } else {
        ctx.reject(['password']);
      }
    });
    client.on('ready', () => {
      client.on('session', (accept) => {
        const session = accept();
        session.on('pty', (a) => a?.());
        session.on('shell', (acceptShell) => {
          const stream = acceptShell();
          stream.write('READY\r\n');
        });
      });
    });
  });

  server.on('error', () => {});

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = (server.address() as { port: number }).port;
      resolve();
    });
  });
}, 30_000);

afterAll(() => {
  server?.close();
});

const baseArgs = () => ({
  host: '127.0.0.1',
  port,
  username: USER,
  auth: { type: 'password' as const, password: PASSWORD },
});

describe('SSH host key TOFU', () => {
  it('首次连接不静默信任：中断握手并交出指纹', async () => {
    const error = await connectSsh({ ...baseArgs(), expectedFingerprint: null }).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('EHOSTKEY_UNKNOWN');
    expect(error.fingerprint).toMatch(/^SHA256:/);
    expect(classifyConnectError(error)).toBe('hostkey_unknown');
    realFingerprint = error.fingerprint;
  }, 20_000);

  it('指纹确认后可以连上并开出 shell', async () => {
    const { client, fingerprint } = await connectSsh({
      ...baseArgs(),
      expectedFingerprint: realFingerprint,
    });
    expect(fingerprint).toBe(realFingerprint);

    const stream = await openShell(client, { cols: 80, rows: 24 });
    const first = await new Promise<string>((resolve) => {
      stream.once('data', (chunk: Buffer) => resolve(chunk.toString()));
    });
    expect(first).toContain('READY');
    client.end();
  }, 20_000);

  it('指纹对不上时报 mismatch，不是普通连接失败', async () => {
    const error = await connectSsh({
      ...baseArgs(),
      expectedFingerprint: 'SHA256:definitely-not-the-right-one',
    }).catch((e) => e);
    expect(error.code).toBe('EHOSTKEY_MISMATCH');
    expect(classifyConnectError(error)).toBe('hostkey_mismatch');
  }, 20_000);

  it('密码错误归类为 auth_failed', async () => {
    const error = await connectSsh({
      ...baseArgs(),
      auth: { type: 'password', password: 'wrong' },
      expectedFingerprint: realFingerprint,
    }).catch((e) => e);
    expect(classifyConnectError(error)).toBe('auth_failed');
  }, 20_000);
});

describe('错误归类', () => {
  it('把底层错误码收敛成前端可查的稳定文案键', () => {
    expect(classifyConnectError({ code: 'ECONNREFUSED' })).toBe('refused');
    expect(classifyConnectError({ code: 'ENOTFOUND' })).toBe('dns_failed');
    expect(classifyConnectError({ code: 'ETIMEDOUT' })).toBe('timeout');
    expect(classifyConnectError({ message: 'Timed out while waiting' })).toBe('timeout');
    expect(classifyConnectError({})).toBe('connect_failed');
  });
});
