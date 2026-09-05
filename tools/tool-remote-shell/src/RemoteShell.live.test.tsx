import React from 'react';
import crypto from 'node:crypto';
import http from 'node:http';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import ssh2 from 'ssh2';
import WebSocketImpl from 'ws';
import zh from './locales/zh.json';
import { readGateConfig } from '../server/gate.js';
import { attachRemoteShellWebSocket } from '../server/ws-gateway.js';

interface FakeTerminal {
  writes: string[];
  write(text: string): void;
  focus(): void;
  fit(): void;
  size(): { cols: number; rows: number };
}

const { terminals } = vi.hoisted(() => ({ terminals: [] as FakeTerminal[] }));

// 只桩掉 xterm（jsdom 量不了尺寸），其余全部走真货
vi.mock('./TerminalView', async () => {
  const react = await import('react');
  return {
    default: react.forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      const self = react.useRef<FakeTerminal | null>(null);
      if (!self.current) {
        self.current = {
          writes: [],
          write(text: string) {
            this.writes.push(text);
          },
          focus() {},
          fit() {},
          size: () => ({ cols: 80, rows: 24 }),
        };
        terminals.push(self.current);
      }
      react.useImperativeHandle(ref, () => self.current);
      return react.createElement('div', { 'data-testid': 'terminal' });
    }),
  };
});

import RemoteShell from './RemoteShell';

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

  gateway = http.createServer((req, res) => {
    if (req.url === '/api/remote-shell/status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ requiresToken: false, wsPath: '/api/remote-shell/ws' }));
      return;
    }
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

  // session.ts 走 window.location 拼 WS 地址，指到真网关上
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { protocol: 'http:', host: `127.0.0.1:${gatewayPort}` },
  });
  (globalThis as Record<string, unknown>).WebSocket = WebSocketImpl;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requiresToken: false, wsPath: '/api/remote-shell/ws' }),
    }),
  );
}, 30_000);

afterAll(() => {
  sshServer?.close();
  gateway?.close();
});

const i18n = createInstance();
void i18n.init({
  lng: 'zh',
  fallbackLng: 'zh',
  resources: { zh: { toolRemoteShell: zh } },
  interpolation: { escapeValue: false },
  initImmediate: false,
});

describe('整条链路：真 UI → 真 session.ts → 真网关 → 真 SSH', () => {
  it('填表连接，确认指纹后应当真正连上并收到 banner', async () => {
    terminals.length = 0;
    localStorage.clear();

    // 包 StrictMode，和应用真实入口 apps/web/src/main.tsx 一致：
    // 挂载 → 清理 → 再挂载这条路径必须也能真正连上
    render(
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <RemoteShell />
        </I18nextProvider>
      </React.StrictMode>,
    );

    fireEvent.click(await screen.findByText('跳过，不保存凭据'));
    fireEvent.change(screen.getByPlaceholderText('example.com'), { target: { value: '127.0.0.1' } });
    fireEvent.change(screen.getByPlaceholderText('root'), { target: { value: USER } });
    const portInput = screen.getByDisplayValue('22');
    fireEvent.change(portInput, { target: { value: String(sshPort) } });
    const passwords = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passwords[passwords.length - 1], { target: { value: PASSWORD } });

    fireEvent.click(screen.getByText('连接'));

    // 首连必须弹出指纹确认，而不是一直卡在「连接中」
    const trust = await screen.findByText('指纹一致，信任并连接', {}, { timeout: 10_000 });
    fireEvent.click(trust);

    // StrictMode 会双跑渲染函数，桩件数组里可能混进一个被丢弃的实例，
    // 下标不可靠——只要有一个终端收到 banner 就说明链路通了
    await waitFor(
      () =>
        expect(terminals.some((term) => term.writes.join('').includes('welcome-banner'))).toBe(
          true,
        ),
      { timeout: 10_000 },
    );
  }, 40_000);
});
