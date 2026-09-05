/** 浏览器侧的 WS 会话客户端。协议与 endpoint 无关，以后换成本地 agent 只要换 URL。 */

export type SessionEvent =
  | {
      t: 'ready';
      fingerprint?: string;
      /** 刷新后凭它把会话挂回来，不需要重新认证 */
      sessionId?: string;
      /** true 表示这次是挂回了一条还活着的会话，而不是新建的 */
      resumed?: boolean;
      resumeTtlMs?: number;
      host?: string;
      port?: number;
      user?: string;
    }
  | { t: 'hostkey'; fingerprint: string; host: string; port: number }
  | { t: 'error'; code: string; retryAfterMs?: number }
  | { t: 'closed'; code: string };

export type ConnectAuth =
  | { type: 'password'; password: string }
  | { type: 'key'; privateKey: string; passphrase?: string };

export interface ConnectRequest {
  host: string;
  port: number;
  user: string;
  auth: ConnectAuth;
  knownFingerprint?: string | null;
  cols: number;
  rows: number;
}

export interface SessionHandle {
  connect(request: ConnectRequest): void;
  /** 刷新后重新挂上一条寄存中的会话 */
  attach(sessionId: string): void;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  close(): void;
  /** 关掉这条 WS，但让服务端把会话寄存起来（刷新前调用） */
  detach(): void;
}

export interface OpenSessionOptions {
  wsPath: string;
  token?: string;
  onData(text: string): void;
  onEvent(event: SessionEvent): void;
  onSocketClose(): void;
  /** 首次响应的等待上限，超时后报错而不是干等。默认 20 秒 */
  handshakeTimeoutMs?: number;
}

/**
 * 网关自己对 SSH 建连的上限是 15 秒，所以这里给 20 秒的兜底：
 * 正常情况轮不到它，轮到了就说明对面根本没回话。
 */
const DEFAULT_HANDSHAKE_TIMEOUT_MS = 20_000;

function wsUrl(wsPath: string, token?: string): string {
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${scheme}//${window.location.host}${wsPath}${query}`;
}

export function openSession(options: OpenSessionOptions): SessionHandle {
  const ws = new WebSocket(wsUrl(options.wsPath, options.token));
  ws.binaryType = 'arraybuffer';

  // 终端输出按 TCP 分段到达，一个多字节字符（中文、emoji）可能被切在两帧里。
  // 复用同一个 decoder 并开 stream 模式，才不会把它解码成乱码。
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  const queue: string[] = [];
  let open = false;

  const flush = () => {
    while (queue.length) ws.send(queue.shift() as string);
  };

  /**
   * 握手兜底。
   *
   * 升级请求被中途吞掉时（服务端没装 upgrade 监听器、只有静态资源的 preview、
   * 不转发 upgrade 的反向代理），WebSocket 既不 open 也不 error，就那么挂着。
   * 没有这个定时器，界面会永远停在「连接中」而且一句提示都没有。
   */
  let handshakeTimer: ReturnType<typeof setTimeout> | null = null;
  let answered = false;

  const clearHandshakeTimer = () => {
    if (handshakeTimer !== null) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
  };

  const markAnswered = () => {
    answered = true;
    clearHandshakeTimer();
  };

  ws.onopen = () => {
    open = true;
    flush();
  };

  ws.onmessage = (event) => {
    // 控制帧是字符串，数据帧是 ArrayBuffer。按「是不是字符串」分流而不是
    // instanceof ArrayBuffer：后者跨 realm 会失效（测试环境就是这种情况）。
    if (typeof event.data !== 'string') {
      markAnswered();
      options.onData(decoder.decode(event.data as ArrayBuffer, { stream: true }));
      return;
    }
    try {
      const parsed = JSON.parse(event.data) as SessionEvent;
      markAnswered();
      options.onEvent(parsed);
    } catch {
      /* 协议外的帧直接丢弃 */
    }
  };

  ws.onclose = () => {
    clearHandshakeTimer();
    options.onSocketClose();
  };
  ws.onerror = () => {
    clearHandshakeTimer();
    options.onEvent({ t: 'error', code: 'socket_error' });
  };

  const sendJson = (payload: unknown) => {
    const text = JSON.stringify(payload);
    if (open) ws.send(text);
    else queue.push(text); // connect 帧常常早于 onopen，先排队
  };

  const armHandshakeTimer = () => {
    clearHandshakeTimer();
    handshakeTimer = setTimeout(() => {
      if (answered) return;
      // 连 open 都没等到 → 多半是根本没人处理这个升级请求；
      // open 了却不回话 → 对面收下了连接但没按协议应答。
      options.onEvent({ t: 'error', code: open ? 'gateway_timeout' : 'ws_unreachable' });
      try {
        ws.close();
      } catch {
        /* 已经断了就算了 */
      }
    }, options.handshakeTimeoutMs ?? DEFAULT_HANDSHAKE_TIMEOUT_MS);
  };

  return {
    connect(request) {
      sendJson({ t: 'connect', ...request });
      armHandshakeTimer();
    },
    attach(sessionId) {
      sendJson({ t: 'attach', sessionId });
      armHandshakeTimer();
    },
    write(data) {
      if (open) ws.send(encoder.encode(data));
    },
    resize(cols, rows) {
      sendJson({ t: 'resize', cols, rows });
    },
    close() {
      clearHandshakeTimer();
      if (open) sendJson({ t: 'disconnect' });
      ws.close();
    },
    detach() {
      // 不发 disconnect：让服务端把会话寄存起来，刷新后还能挂回去
      clearHandshakeTimer();
      ws.close();
    },
  };
}
