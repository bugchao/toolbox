// @vitest-environment node
/**
 * 网关级集成测试：真起一台 SSH 服务 + 真起 http.Server 挂上 WS 网关，
 * 走完 TOFU → 建连 → 双向数据 的整条链路。
 *
 * 单测覆盖的是各模块自己的逻辑，这里覆盖的是它们接在一起还能不能用。
 */
import crypto from 'node:crypto';
import http from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import ssh2 from 'ssh2';
import WebSocket from 'ws';
import { readGateConfig } from '../server/gate.js';
import { createRemoteShellApiMiddleware } from '../server/remote-shell-api.js';
import { attachRemoteShellWebSocket } from '../server/ws-gateway.js';

const USER = 'demo';
const PASSWORD = 'pw-correct';

let sshServer: import('ssh2').Server;
let sshPort = 0;

beforeAll(async () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  sshServer = new ssh2.Server({ hostKeys: [privateKey] }, (client) => {
    client.on('error', () => {});
    client.on('authentication', (ctx) => {
      if (ctx.method === 'password' && ctx.username === USER && ctx.password === PASSWORD) ctx.accept();
      else ctx.reject(['password']);
    });
    client.on('ready', () => {
      client.on('session', (accept) => {
        const session = accept();
        session.on('pty', (a) => a?.());
        session.on('shell', (acceptShell) => {
          const stream = acceptShell();
          stream.write('welcome-banner\r\n');
          stream.on('data', (chunk: Buffer) => stream.write(`you-typed:${chunk.toString().trim()}\r\n`));
        });
      });
    });
  });
  sshServer.on('error', () => {});

  await new Promise<void>((resolve) => {
    sshServer.listen(0, '127.0.0.1', () => {
      sshPort = (sshServer.address() as { port: number }).port;
      resolve();
    });
  });
}, 30_000);

afterAll(() => sshServer?.close());

/** 起一台挂了网关的 http 服务，返回端口与关闭函数 */
async function startGateway(env: Record<string, string>) {
  const config = readGateConfig(env);
  const middleware = createRemoteShellApiMiddleware({ config });
  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
  });
  attachRemoteShellWebSocket(server, { config });

  const port = await new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port));
  });
  return { port, close: () => new Promise<void>((r) => server.close(() => r())) };
}

interface SessionResult {
  hostkey?: string;
  ready?: boolean;
  out?: string;
  error?: string;
}

/** 发一次 connect，跑到「拿到回显」或「收到终止帧」为止 */
function runSession(
  url: string,
  { knownFingerprint = null as string | null, password = PASSWORD } = {},
): Promise<SessionResult> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const out: string[] = [];
    let ready = false;
    const timer = setTimeout(() => reject(new Error('会话超时')), 15_000);
    const done = (value: SessionResult) => {
      clearTimeout(timer);
      ws.close();
      resolve(value);
    };

    ws.on('open', () =>
      ws.send(JSON.stringify({
        t: 'connect', host: '127.0.0.1', port: sshPort, user: USER,
        auth: { type: 'password', password }, knownFingerprint, cols: 80, rows: 24,
      })),
    );
    ws.on('message', (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        out.push(data.toString());
        if (out.join('').includes('you-typed:hello-ssh')) done({ ready, out: out.join('') });
        return;
      }
      const msg = JSON.parse(data.toString());
      if (msg.t === 'hostkey') done({ hostkey: msg.fingerprint });
      if (msg.t === 'error') done({ error: msg.code });
      if (msg.t === 'ready') {
        ready = true;
        ws.send(Buffer.from('hello-ssh\n')); // 二进制帧 = stdin
      }
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/** 只看 upgrade 握手结果，不建会话 */
function handshake(url: string): Promise<string> {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    ws.on('open', () => { ws.close(); resolve('opened'); });
    ws.on('unexpected-response', (_req, res) => resolve(`http-${res.statusCode}`));
    ws.on('error', () => resolve('error'));
    setTimeout(() => resolve('hang'), 3000);
  });
}

describe('零配置：一个环境变量都不设也能连', () => {
  let gateway: Awaited<ReturnType<typeof startGateway>>;

  beforeAll(async () => {
    gateway = await startGateway({});
  });
  afterAll(() => gateway?.close());

  it('status 只报 requiresToken 与 wsPath', async () => {
    const status = await fetch(`http://127.0.0.1:${gateway.port}/api/remote-shell/status`).then((r) => r.json());
    expect(status).toEqual({ requiresToken: false, wsPath: '/api/remote-shell/ws' });
  });

  it('不带口令即可完成握手', async () => {
    await expect(handshake(`ws://127.0.0.1:${gateway.port}/api/remote-shell/ws`)).resolves.toBe('opened');
  });

  it('首连交出指纹，确认后连上并打通 stdin/stdout', async () => {
    const url = `ws://127.0.0.1:${gateway.port}/api/remote-shell/ws`;

    const first = await runSession(url);
    expect(first.hostkey).toMatch(/^SHA256:/);

    const session = await runSession(url, { knownFingerprint: first.hostkey as string });
    expect(session.ready).toBe(true);
    expect(session.out).toContain('welcome-banner');
    expect(session.out).toContain('you-typed:hello-ssh');
  }, 30_000);

  it('连内网地址（127.0.0.1）不再被拦', async () => {
    const url = `ws://127.0.0.1:${gateway.port}/api/remote-shell/ws`;
    const first = await runSession(url);
    const session = await runSession(url, { knownFingerprint: first.hostkey as string });
    expect(session.error).toBeUndefined();
  }, 30_000);
});

describe('设了 REMOTE_SHELL_TOKEN：陌生人进不来', () => {
  let gateway: Awaited<ReturnType<typeof startGateway>>;
  const base = () => `ws://127.0.0.1:${gateway.port}/api/remote-shell/ws`;

  beforeAll(async () => {
    gateway = await startGateway({ REMOTE_SHELL_TOKEN: 'integration-token' });
  });
  afterAll(() => gateway?.close());

  it('status 报告 requiresToken:true 且不泄漏口令本身', async () => {
    const status = await fetch(`http://127.0.0.1:${gateway.port}/api/remote-shell/status`).then((r) => r.json());
    expect(status.requiresToken).toBe(true);
    expect(JSON.stringify(status)).not.toContain('integration-token');
  });

  it('口令错误或缺失一律 403', async () => {
    await expect(handshake(`${base()}?token=wrong`)).resolves.toBe('http-403');
    await expect(handshake(base())).resolves.toBe('http-403');
  });

  it('口令正确可以正常建会话', async () => {
    const url = `${base()}?token=integration-token`;
    const first = await runSession(url);
    const session = await runSession(url, { knownFingerprint: first.hostkey as string });
    expect(session.ready).toBe(true);
  }, 30_000);

  it('密码错误归类为 auth_failed', async () => {
    const url = `${base()}?token=integration-token`;
    const first = await runSession(url);
    const failed = await runSession(url, {
      knownFingerprint: first.hostkey as string,
      password: 'wrong-password',
    });
    expect(failed.error).toBe('auth_failed');
  }, 30_000);
});
