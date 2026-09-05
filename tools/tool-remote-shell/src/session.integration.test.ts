// @vitest-environment node
/**
 * 用**真实的浏览器端 session.ts** 打**真实的网关**。
 *
 * 这条缝之前没人管：gateway.integration.test 直接手写协议帧，
 * RemoteShell.test 用的是假 WebSocket——session.ts 自己从没被真连接跑过。
 */
import crypto from 'node:crypto';
import http from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import ssh2 from 'ssh2';
import WebSocketImpl from 'ws';
import { readGateConfig } from '../server/gate.js';
import { attachRemoteShellWebSocket } from '../server/ws-gateway.js';
import { openSession, type SessionEvent } from './session';

const USER = 'demo';
const PASSWORD = 'pw-correct';

let sshServer: import('ssh2').Server;
let sshPort = 0;
let gateway: http.Server;
let gatewayPort = 0;

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

  gateway = http.createServer((_req, res) => {
    res.statusCode = 404;
    res.end();
  });
  attachRemoteShellWebSocket(gateway, { config: readGateConfig({}) });
  await new Promise<void>((resolve) => {
    gateway.listen(0, '127.0.0.1', () => {
      gatewayPort = (gateway.address() as { port: number }).port;
      resolve();
    });
  });
}, 30_000);

afterAll(() => {
  sshServer?.close();
  gateway?.close();
});

// session.ts 是浏览器代码：补上它依赖的两个全局
beforeEach(() => {
  (globalThis as Record<string, unknown>).WebSocket = WebSocketImpl;
  (globalThis as Record<string, unknown>).window = {
    location: { protocol: 'http:', host: `127.0.0.1:${gatewayPort}` },
  };
});

interface Collected {
  events: SessionEvent[];
  data: string;
}

/** 用真实 session.ts 发一次 connect，等到某个终止条件 */
function drive(
  connect: Parameters<ReturnType<typeof openSession>['connect']>[0],
  stopWhen: (c: Collected) => boolean,
  onReady?: (handle: ReturnType<typeof openSession>) => void,
): Promise<Collected> {
  return new Promise((resolve, reject) => {
    const collected: Collected = { events: [], data: '' };
    const timer = setTimeout(
      () => reject(new Error(`超时；已收到事件=${JSON.stringify(collected.events)} 数据=${collected.data}`)),
      15_000,
    );
    const finish = () => {
      clearTimeout(timer);
      handle.close();
      resolve(collected);
    };

    const handle = openSession({
      wsPath: '/api/remote-shell/ws',
      onData: (text) => {
        collected.data += text;
        if (stopWhen(collected)) finish();
      },
      onEvent: (event) => {
        collected.events.push(event);
        if (event.t === 'ready') onReady?.(handle);
        if (stopWhen(collected)) finish();
      },
      onSocketClose: () => {
        if (stopWhen(collected)) finish();
      },
    });

    handle.connect(connect);
  });
}

const base = {
  host: '127.0.0.1',
  user: USER,
  auth: { type: 'password' as const, password: PASSWORD },
  cols: 80,
  rows: 24,
};

describe('session.ts 打真实网关', () => {
  it('首连收到 hostkey 帧——说明 connect 帧确实发出去了', async () => {
    const result = await drive(
      { ...base, port: sshPort, knownFingerprint: null },
      (c) => c.events.some((e) => e.t === 'hostkey' || e.t === 'error'),
    );
    const hostkey = result.events.find((e) => e.t === 'hostkey');
    expect(hostkey).toBeDefined();
    expect((hostkey as { fingerprint: string }).fingerprint).toMatch(/^SHA256:/);
  }, 30_000);

  it('带指纹重连拿到 ready，并且能收发数据', async () => {
    const first = await drive(
      { ...base, port: sshPort, knownFingerprint: null },
      (c) => c.events.some((e) => e.t === 'hostkey'),
    );
    const fingerprint = (first.events.find((e) => e.t === 'hostkey') as { fingerprint: string }).fingerprint;

    const result = await drive(
      { ...base, port: sshPort, knownFingerprint: fingerprint },
      (c) => c.data.includes('you-typed:hello'),
      (handle) => handle.write('hello\n'),
    );
    expect(result.events.some((e) => e.t === 'ready')).toBe(true);
    expect(result.data).toContain('welcome-banner');
    expect(result.data).toContain('you-typed:hello');
  }, 30_000);

  it('刷新（WS 断开但没发 disconnect）后能凭 sessionId 挂回来，且不重新认证', async () => {
    const first = await drive(
      { ...base, port: sshPort, knownFingerprint: null },
      (c) => c.events.some((e) => e.t === 'hostkey'),
    );
    const fingerprint = (first.events.find((e) => e.t === 'hostkey') as { fingerprint: string })
      .fingerprint;

    // 建立会话，拿到 sessionId，然后像刷新那样直接掐断 WS（不发 disconnect）
    const sessionId = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('建立会话超时')), 15_000);
      const handle = openSession({
        wsPath: '/api/remote-shell/ws',
        onData: () => {},
        onEvent: (event) => {
          if (event.t === 'ready') {
            clearTimeout(timer);
            const id = event.sessionId as string;
            handle.detach(); // 刷新的形态：连接没了，但没说要断开会话
            resolve(id);
          }
          if (event.t === 'error') {
            clearTimeout(timer);
            reject(new Error(`收到 error: ${event.code}`));
          }
        },
        onSocketClose: () => {},
      });
      handle.connect({ ...base, port: sshPort, knownFingerprint: fingerprint });
    });

    expect(sessionId).toBeTruthy();

    // 新页面：只带 sessionId，不带任何凭据
    const resumed = await new Promise<{ resumed: boolean; data: string }>((resolve, reject) => {
      let data = '';
      let wasResumed = false;
      const timer = setTimeout(() => reject(new Error(`挂回超时；已收到=${data}`)), 15_000);
      const handle = openSession({
        wsPath: '/api/remote-shell/ws',
        onData: (text) => {
          data += text;
          if (data.includes('welcome-banner')) {
            clearTimeout(timer);
            handle.close();
            resolve({ resumed: wasResumed, data });
          }
        },
        onEvent: (event) => {
          if (event.t === 'ready') wasResumed = Boolean(event.resumed);
          if (event.t === 'error') {
            clearTimeout(timer);
            reject(new Error(`收到 error: ${event.code}`));
          }
        },
        onSocketClose: () => {},
      });
      handle.attach(sessionId);
    });

    expect(resumed.resumed).toBe(true);
    // 回放缓冲把刷新前的输出还原了出来
    expect(resumed.data).toContain('welcome-banner');
  }, 60_000);

  it('明确点了断开的会话不可恢复', async () => {
    const first = await drive(
      { ...base, port: sshPort, knownFingerprint: null },
      (c) => c.events.some((e) => e.t === 'hostkey'),
    );
    const fingerprint = (first.events.find((e) => e.t === 'hostkey') as { fingerprint: string })
      .fingerprint;

    const sessionId = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('建立会话超时')), 15_000);
      const handle = openSession({
        wsPath: '/api/remote-shell/ws',
        onData: () => {},
        onEvent: (event) => {
          if (event.t === 'ready') {
            clearTimeout(timer);
            const id = event.sessionId as string;
            handle.close(); // 明确断开：会发 disconnect
            resolve(id);
          }
        },
        onSocketClose: () => {},
      });
      handle.connect({ ...base, port: sshPort, knownFingerprint: fingerprint });
    });

    const code = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('等待 session_expired 超时')), 15_000);
      const handle = openSession({
        wsPath: '/api/remote-shell/ws',
        onData: () => {},
        onEvent: (event) => {
          if (event.t === 'error') {
            clearTimeout(timer);
            handle.close();
            resolve(event.code);
          }
          if (event.t === 'ready') {
            clearTimeout(timer);
            handle.close();
            reject(new Error('断开过的会话竟然还能挂回来'));
          }
        },
        onSocketClose: () => {},
      });
      handle.attach(sessionId);
    });

    expect(code).toBe('session_expired');
  }, 60_000);

  it('升级请求被吞掉时报 ws_unreachable，不能永远停在连接中', async () => {
    // 复现真实场景：服务端**有** upgrade 监听器但不处理这个路径。
    // Vite 就是这样——它自己的 HMR 监听器在，而我们的网关没挂上时，
    // socket 就那么挂着：不 open、不 error、不 close。
    // （没有任何 upgrade 监听器的话 Node 会直接关连接，反而不会卡。）
    const deaf = http.createServer((_req, res) => {
      res.statusCode = 404;
      res.end();
    });
    deaf.on('upgrade', () => {
      /* 收下就不管了，正是这里把界面挂死的 */
    });
    const deafPort = await new Promise<number>((resolve) => {
      deaf.listen(0, '127.0.0.1', () => resolve((deaf.address() as { port: number }).port));
    });

    (globalThis as Record<string, unknown>).window = {
      location: { protocol: 'http:', host: `127.0.0.1:${deafPort}` },
    };

    const code = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('客户端卡死了：没有在超时内报错')), 5_000);
      const handle = openSession({
        wsPath: '/api/remote-shell/ws',
        handshakeTimeoutMs: 300,
        onData: () => {},
        onEvent: (event) => {
          if (event.t === 'error') {
            clearTimeout(timer);
            handle.close();
            resolve(event.code);
          }
        },
        onSocketClose: () => {},
      });
      handle.connect({ ...base, port: sshPort, knownFingerprint: null });
    });

    expect(code).toBe('ws_unreachable');
    // 挂住的那条 socket 会让 close() 的回调永远等下去，先强制断掉
    deaf.closeAllConnections?.();
    deaf.close();
  }, 20_000);

  it('目标端口没人监听时给出 refused，而不是一直卡在连接中', async () => {
    // 占一个端口再立刻关掉，拿到一个确定没人监听的号
    const probe = http.createServer();
    const deadPort = await new Promise<number>((resolve) => {
      probe.listen(0, '127.0.0.1', () => resolve((probe.address() as { port: number }).port));
    });
    await new Promise<void>((r) => probe.close(() => r()));

    const result = await drive(
      { ...base, port: deadPort, knownFingerprint: null },
      (c) => c.events.some((e) => e.t === 'error'),
    );
    const error = result.events.find((e) => e.t === 'error') as { code: string };
    expect(error.code).toBe('refused');
  }, 30_000);
});
