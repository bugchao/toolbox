import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import zh from './locales/zh.json';

interface FakeTerminal {
  writes: string[];
  write(text: string): void;
  focus(): void;
  fit(): void;
  size(): { cols: number; rows: number };
}

// 每个终端实例各自记账，才能验出多标签页之间有没有串线
const { terminals } = vi.hoisted(() => ({ terminals: [] as FakeTerminal[] }));

// xterm 需要真实的 DOM 测量，jsdom 撑不住，换成能观察 write 的桩件
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

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  OPEN = 1;
  readyState = 0;
  binaryType = '';
  sent: unknown[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: unknown) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
    this.closed = true;
  }

  /* --- 测试驱动用。WS 回调发生在 React 事件循环之外，包 act 避免 act(...) 警告 --- */
  fireOpen() {
    this.readyState = 1;
    act(() => this.onopen?.());
  }

  fireJson(payload: unknown) {
    act(() => this.onmessage?.({ data: JSON.stringify(payload) }));
  }

  fireBinary(text: string) {
    act(() => this.onmessage?.({ data: new TextEncoder().encode(text).buffer }));
  }

  fireClose() {
    this.readyState = 3;
    act(() => this.onclose?.());
  }

  /** 网关收到的 connect 帧 */
  connectFrame() {
    for (const raw of this.sent) {
      if (typeof raw === 'string') {
        const msg = JSON.parse(raw);
        if (msg.t === 'connect') return msg;
      }
    }
    return null;
  }
}

const i18n = createInstance();
void i18n.init({
  lng: 'zh',
  fallbackLng: 'zh',
  resources: { zh: { toolRemoteShell: zh } },
  interpolation: { escapeValue: false },
  initImmediate: false,
});

const renderTool = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <RemoteShell />
    </I18nextProvider>,
  );

/** 应用真实入口 apps/web/src/main.tsx 是包在 StrictMode 里的，这里对齐它 */
const renderToolStrict = () =>
  render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <RemoteShell />
      </I18nextProvider>
    </React.StrictMode>,
  );

/** 填表并点连接。第一次调用时顺手跳过金库。 */
async function connectTo(host: string, { skipVault = false } = {}) {
  if (skipVault) {
    fireEvent.click(await screen.findByText('跳过，不保存凭据'));
  }
  fireEvent.change(await screen.findByPlaceholderText('example.com'), {
    target: { value: host },
  });
  fireEvent.change(screen.getByPlaceholderText('root'), { target: { value: 'demo' } });
  const password = document.querySelectorAll('input[type="password"]');
  fireEvent.change(password[password.length - 1], { target: { value: 'pw' } });

  const before = FakeWebSocket.instances.length;
  fireEvent.click(screen.getByText('连接'));
  await waitFor(() => expect(FakeWebSocket.instances.length).toBe(before + 1));
  return FakeWebSocket.instances[before];
}

/** 走完 TOFU，返回已连上的那条 socket */
async function connectAndTrust(host: string, opts?: { skipVault?: boolean }) {
  const first = await connectTo(host, opts);
  first.fireOpen();
  first.fireJson({ t: 'hostkey', fingerprint: `SHA256:${host}`, host, port: 22 });
  fireEvent.click(await screen.findByText('指纹一致，信任并连接'));

  await waitFor(() => expect(FakeWebSocket.instances.length).toBeGreaterThan(1));
  const live = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  live.fireOpen();
  live.fireJson({ t: 'ready', fingerprint: `SHA256:${host}`, sessionId: `sid-${host}` });
  return live;
}

describe('RemoteShell 首次连接（TOFU）', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    terminals.length = 0;
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('WebSocket', FakeWebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requiresToken: false, wsPath: '/api/remote-shell/ws' }),
      }),
    );
  });

  it('状态接口挂了也照样能连——默认可用，不因为拿不到状态就把功能锁死', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderTool();
    const ws = await connectTo('example.com', { skipVault: true });
    expect(ws.url).toContain('/api/remote-shell/ws');
  });

  it('未记录过的主机：弹出指纹确认，且首帧不带 knownFingerprint', async () => {
    renderTool();
    const ws = await connectTo('example.com', { skipVault: true });
    ws.fireOpen();
    expect(ws.connectFrame()?.knownFingerprint ?? null).toBeNull();

    ws.fireJson({ t: 'hostkey', fingerprint: 'SHA256:abc123', host: 'example.com', port: 22 });

    expect(await screen.findByText('确认主机指纹')).toBeInTheDocument();
    expect(screen.getByText('SHA256:abc123')).toBeInTheDocument();
  });

  it('确认指纹后重连，旧连接的 close 不能把新会话打掉', async () => {
    renderTool();
    const first = await connectTo('example.com', { skipVault: true });
    first.fireOpen();
    first.fireJson({ t: 'hostkey', fingerprint: 'SHA256:abc123', host: 'example.com', port: 22 });

    fireEvent.click(await screen.findByText('指纹一致，信任并连接'));

    await waitFor(() => expect(FakeWebSocket.instances.length).toBe(2));
    const second = FakeWebSocket.instances[1];
    second.fireOpen();
    expect(second.connectFrame()?.knownFingerprint).toBe('SHA256:abc123');

    second.fireJson({ t: 'ready', fingerprint: 'SHA256:abc123' });

    // 关键：旧 socket 的 onclose 现在才异步到达。不做身份判断的话，
    // 它会把新会话置空，终端从此收不到数据。
    first.fireClose();

    second.fireBinary('hello-from-server');
    await waitFor(() => expect(terminals[0].writes.join('')).toContain('hello-from-server'));
  });

  it('已记录过指纹的主机直接带着它发起连接', async () => {
    localStorage.setItem(
      'toolbox.remote-shell.hostkeys.v1',
      JSON.stringify({ 'example.com:22': 'SHA256:known' }),
    );
    renderTool();
    const ws = await connectTo('example.com', { skipVault: true });
    ws.fireOpen();
    expect(ws.connectFrame()?.knownFingerprint).toBe('SHA256:known');
  });

  it('StrictMode 下点连接必须真的连上，而不是要手动重连一次', async () => {
    // StrictMode 会 挂载 → 清理 → 再挂载。清理关掉了第一次建的会话，
    // 如果第二次挂载不重新建连，标签页就没有会话，界面永远停在「连接中」，
    // 只有手动点「重新连接」才好——这正是线上报的现象。
    renderToolStrict();

    fireEvent.click(await screen.findByText('跳过，不保存凭据'));
    fireEvent.change(await screen.findByPlaceholderText('example.com'), {
      target: { value: 'example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('root'), { target: { value: 'demo' } });
    const password = document.querySelectorAll('input[type="password"]');
    fireEvent.change(password[password.length - 1], { target: { value: 'pw' } });
    fireEvent.click(screen.getByText('连接'));

    await waitFor(() => expect(FakeWebSocket.instances.length).toBeGreaterThan(0));

    // 挂载完成后必须恰好留下一条活着的连接
    const live = FakeWebSocket.instances.filter((ws) => !ws.closed);
    expect(live).toHaveLength(1);

    // 而且这条连接确实把 connect 帧发出去了
    live[0].fireOpen();
    expect(live[0].connectFrame()).toMatchObject({ t: 'connect', host: 'example.com' });
  });

  it('隐私提示可以关掉，并且下次进来不再出现', async () => {
    const { unmount } = renderTool();
    expect(await screen.findByText('凭据不会离开你的浏览器与目标主机之间')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '不再显示' }));
    await waitFor(() =>
      expect(screen.queryByText('凭据不会离开你的浏览器与目标主机之间')).not.toBeInTheDocument(),
    );

    unmount();
    renderTool();
    await screen.findByText('跳过，不保存凭据');
    expect(screen.queryByText('凭据不会离开你的浏览器与目标主机之间')).not.toBeInTheDocument();
  });

  it('连接失败时把错误码翻成用户文案', async () => {
    renderTool();
    const ws = await connectTo('example.com', { skipVault: true });
    ws.fireOpen();
    ws.fireJson({ t: 'error', code: 'auth_failed' });
    expect(await screen.findByText('认证失败，请检查用户名、密码或私钥')).toBeInTheDocument();
  });
});

describe('多终端标签页', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    terminals.length = 0;
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('WebSocket', FakeWebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requiresToken: false, wsPath: '/api/remote-shell/ws' }),
      }),
    );
  });

  it('可以开出多个终端，每个是独立的连接与终端实例', async () => {
    renderTool();
    await connectAndTrust('alpha.test', { skipVault: true });

    fireEvent.click(screen.getByText('新建连接'));
    await connectAndTrust('beta.test');

    expect(screen.getByText('demo@alpha.test')).toBeInTheDocument();
    expect(screen.getByText('demo@beta.test')).toBeInTheDocument();
    expect(terminals).toHaveLength(2);
  });

  it('数据只写进它自己那个终端，不会串到别的标签页', async () => {
    renderTool();
    const alpha = await connectAndTrust('alpha.test', { skipVault: true });

    fireEvent.click(screen.getByText('新建连接'));
    const beta = await connectAndTrust('beta.test');

    alpha.fireBinary('from-alpha');
    beta.fireBinary('from-beta');

    await waitFor(() => expect(terminals[0].writes.join('')).toContain('from-alpha'));
    expect(terminals[0].writes.join('')).not.toContain('from-beta');
    expect(terminals[1].writes.join('')).toContain('from-beta');
    expect(terminals[1].writes.join('')).not.toContain('from-alpha');
  });

  it('关掉一个标签页只断它自己的连接，另一个照常收数据', async () => {
    renderTool();
    const alpha = await connectAndTrust('alpha.test', { skipVault: true });

    fireEvent.click(screen.getByText('新建连接'));
    const beta = await connectAndTrust('beta.test');
    expect(beta.closed).toBe(false);

    const betaTab = screen.getByText('demo@beta.test').closest('div') as HTMLElement;
    fireEvent.click(within(betaTab).getByLabelText('关闭 demo@beta.test'));

    await waitFor(() => expect(beta.closed).toBe(true));
    expect(screen.queryByText('demo@beta.test')).not.toBeInTheDocument();
    expect(alpha.closed).toBe(false);

    alpha.fireBinary('still-alive');
    await waitFor(() => expect(terminals[0].writes.join('')).toContain('still-alive'));
  });

  it('全屏时隐藏标题与提示，Esc 退出后恢复', async () => {
    renderTool();
    await connectAndTrust('alpha.test', { skipVault: true });

    expect(screen.getByText('Web SSH 终端')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    await waitFor(() => expect(screen.queryByText('Web SSH 终端')).not.toBeInTheDocument());
    // 标签栏必须留着，否则全屏后没法切终端
    expect(screen.getByText('demo@alpha.test')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.getByText('Web SSH 终端')).toBeInTheDocument());
  });

  it('全屏不会重建连接，终端实例保持不变', async () => {
    renderTool();
    const alpha = await connectAndTrust('alpha.test', { skipVault: true });
    const socketCount = FakeWebSocket.instances.length;
    const terminalCount = terminals.length;

    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    await waitFor(() => expect(screen.queryByText('Web SSH 终端')).not.toBeInTheDocument());

    expect(FakeWebSocket.instances.length).toBe(socketCount);
    expect(terminals.length).toBe(terminalCount);

    alpha.fireBinary('still-alive-in-fullscreen');
    await waitFor(() => expect(terminals[0].writes.join('')).toContain('still-alive-in-fullscreen'));
  });

  it('刷新后自动挂回寄存的会话，不再要求输密码', async () => {
    const { unmount } = renderTool();
    await connectAndTrust('alpha.test', { skipVault: true });

    // 存档里只该有主机信息与会话 id，绝不能有密钥
    const raw = sessionStorage.getItem('toolbox.remote-shell.tabs.v1') as string;
    expect(raw).toBeTruthy();
    expect(raw).toContain('sid-alpha.test');
    expect(raw).not.toContain('pw');

    // 刷新：整棵树重来，但 sessionStorage 还在
    unmount();
    FakeWebSocket.instances = [];
    terminals.length = 0;
    renderTool();

    // 直接进终端，不是「新建连接」表单
    expect(await screen.findByText('demo@alpha.test')).toBeInTheDocument();
    expect(screen.queryByText('跳过，不保存凭据')).not.toBeInTheDocument();

    await waitFor(() => expect(FakeWebSocket.instances.length).toBe(1));
    const ws = FakeWebSocket.instances[0];
    ws.fireOpen();

    // 发的是 attach 而不是 connect——没有任何凭据参与
    const frames = ws.sent.filter((s): s is string => typeof s === 'string').map((s) => JSON.parse(s));
    expect(frames[0]).toEqual({ t: 'attach', sessionId: 'sid-alpha.test' });
    expect(frames.some((f) => f.t === 'connect')).toBe(false);

    ws.fireJson({ t: 'ready', resumed: true, sessionId: 'sid-alpha.test' });
    ws.fireBinary('back-from-refresh');
    await waitFor(() => expect(terminals[0].writes.join('')).toContain('back-from-refresh'));
  });

  it('寄存会话已过期时收掉标签页，退回新建连接', async () => {
    const { unmount } = renderTool();
    await connectAndTrust('alpha.test', { skipVault: true });

    unmount();
    FakeWebSocket.instances = [];
    terminals.length = 0;
    renderTool();

    await waitFor(() => expect(FakeWebSocket.instances.length).toBe(1));
    FakeWebSocket.instances[0].fireOpen();
    FakeWebSocket.instances[0].fireJson({ t: 'error', code: 'session_expired' });

    await waitFor(() => expect(screen.queryByText('demo@alpha.test')).not.toBeInTheDocument());
    // 标签页没了，存档也该清干净
    expect(sessionStorage.getItem('toolbox.remote-shell.tabs.v1')).toBeNull();
  });

  it('切换标签页不会重建连接', async () => {
    renderTool();
    await connectAndTrust('alpha.test', { skipVault: true });
    fireEvent.click(screen.getByText('新建连接'));
    await connectAndTrust('beta.test');

    const socketCount = FakeWebSocket.instances.length;
    fireEvent.click(screen.getByText('demo@alpha.test'));
    fireEvent.click(screen.getByText('demo@beta.test'));

    expect(FakeWebSocket.instances.length).toBe(socketCount);
  });
});
