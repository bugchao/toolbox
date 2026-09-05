import { WebSocketServer } from 'ws';
import { checkGate, readGateConfig } from './gate.js';
import { createLimiter } from './limits.js';
import { createSessionPool } from './session-pool.js';
import { classifyConnectError, connectSsh, openShell } from './ssh-adapter.js';

export const WS_PATH = '/api/remote-shell/ws';

const IDLE_MS = 15 * 60 * 1000;
const CONNECT_WAIT_MS = 30 * 1000;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function send(ws, payload) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

// 只记路由信息，凭据一个字节都不进日志
function logSession({ ip, host, port, ok, code }) {
  const status = ok ? 'ok' : `fail(${code})`;
  console.log(`[remote-shell] ${status} from=${ip} target=${host}:${port}`);
}

export function attachRemoteShellWebSocket(server, options = {}) {
  const config = options.config ?? readGateConfig();
  const limiter = options.limiter ?? createLimiter(options.limits);
  const pool = options.pool ?? createSessionPool(options.resume);
  const wss = new WebSocketServer({ noServer: true });

  function onUpgrade(req, socket, head) {
    let url;
    try {
      url = new URL(req.url ?? '', 'http://localhost');
    } catch {
      return;
    }
    // 不是我们的路径就原样放过，交给别的 upgrade 监听器（dev 下是 Vite 的 HMR）
    if (url.pathname !== WS_PATH) return;

    const gate = checkGate(config, url.searchParams.get('token'));
    if (!gate.ok) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      handleConnection(ws, req, { limiter, pool });
    });
  }

  server.on('upgrade', onUpgrade);

  return {
    wss,
    pool,
    close() {
      server.off('upgrade', onUpgrade);
      wss.close();
    },
  };
}

function handleConnection(ws, req, { limiter, pool }) {
  const ip = clientIp(req);
  const lease = limiter.acquire(ip);
  if (!lease.ok) {
    send(ws, { t: 'error', code: lease.code, retryAfterMs: lease.retryAfterMs });
    ws.close(1013, lease.code);
    return;
  }

  /** 池里的会话；一条 WS 最多绑一个 */
  let session = null;
  let connecting = false;
  let released = false;
  let idleTimer = null;
  let connectTimer = null;

  function release() {
    if (released) return;
    released = true;
    limiter.release(ip);
  }

  function armConnectDeadline() {
    clearTimeout(connectTimer);
    connectTimer = setTimeout(() => {
      if (!session) {
        send(ws, { t: 'error', code: 'connect_timeout' });
        ws.close(1002, 'no connect frame');
      }
    }, CONNECT_WAIT_MS);
  }

  function bumpIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      send(ws, { t: 'closed', code: 'idle_timeout' });
      // 真闲置就直接销毁，不进寄存池
      if (session) pool.destroy(session.id, 'idle_timeout');
      session = null;
      ws.close(1000, 'idle timeout');
    }, IDLE_MS);
  }

  function wireLifecycle(created) {
    // 用 created.ws 而不是闭包里的 ws：会话可能已经被挪到刷新后的新连接上了
    created.stream.on('close', () => {
      send(created.ws, { t: 'closed', code: 'remote_closed' });
      const live = created.ws;
      pool.destroy(created.id, 'remote_closed');
      if (live && live.readyState === live.OPEN) live.close(1000, 'remote closed');
    });
    created.client.on('close', () => {
      const live = created.ws;
      pool.destroy(created.id, 'ssh_closed');
      if (live && live.readyState === live.OPEN) live.close(1000, 'ssh closed');
    });
  }

  async function doConnect(msg) {
    if (session || connecting) return;
    connecting = true;
    clearTimeout(connectTimer);

    const host = String(msg.host ?? '').trim();
    const port = Number(msg.port) || 22;
    const username = String(msg.user ?? '').trim();

    if (!host || !username) {
      connecting = false;
      send(ws, { t: 'error', code: 'bad_request' });
      armConnectDeadline();
      return;
    }

    try {
      const { client, fingerprint } = await connectSsh({
        host,
        port,
        username,
        auth: msg.auth,
        expectedFingerprint: msg.knownFingerprint || null,
      });

      const stream = await openShell(client, { cols: msg.cols, rows: msg.rows });
      connecting = false;

      const created = pool.create({ client, stream, ip, host, port, user: username });
      pool.attach(created.id, ip, ws);
      session = created;
      wireLifecycle(created);

      limiter.recordSuccess(ip);
      send(ws, {
        t: 'ready',
        fingerprint,
        sessionId: created.id,
        resumeTtlMs: pool.ttlMs,
        host,
        port,
        user: username,
      });
      logSession({ ip, host, port, ok: true });
    } catch (error) {
      connecting = false;
      const code = classifyConnectError(error);
      logSession({ ip, host, port, ok: false, code });

      if (code === 'hostkey_unknown') {
        // 首次连接不算失败：把指纹交给前端确认，连接保持着等用户点「信任」后重发 connect
        send(ws, { t: 'hostkey', fingerprint: error.fingerprint, host, port });
        armConnectDeadline();
        return;
      }

      limiter.recordFailure(ip);
      send(ws, { t: 'error', code, fingerprint: error.fingerprint });
      ws.close(1000, code);
    }
  }

  /** 刷新后凭 sessionId 把寄存的会话挂回来，不重新认证 */
  function doAttach(msg) {
    if (session) return;
    const found = pool.attach(String(msg.sessionId ?? ''), ip, ws);
    if (!found) {
      send(ws, { t: 'error', code: 'session_expired' });
      ws.close(1000, 'session expired');
      return;
    }

    clearTimeout(connectTimer);
    session = found;
    send(ws, {
      t: 'ready',
      resumed: true,
      sessionId: found.id,
      resumeTtlMs: pool.ttlMs,
      host: found.host,
      port: found.port,
      user: found.user,
    });
    pool.replay(found);
    logSession({ ip, host: found.host, port: found.port, ok: true, code: 'resumed' });
  }

  ws.on('message', (data, isBinary) => {
    bumpIdle();

    if (isBinary) {
      session?.stream?.write(data);
      return;
    }

    let msg;
    try {
      msg = JSON.parse(data.toString('utf8'));
    } catch {
      return;
    }

    if (msg.t === 'connect') {
      void doConnect(msg);
      return;
    }
    if (msg.t === 'attach') {
      doAttach(msg);
      return;
    }
    if (msg.t === 'resize' && session?.stream) {
      session.stream.setWindow(Number(msg.rows) || 24, Number(msg.cols) || 80, 0, 0);
      return;
    }
    if (msg.t === 'disconnect') {
      // 明确要断就真断，不留寄存
      if (session) pool.destroy(session.id, 'client_disconnect');
      session = null;
      ws.close(1000, 'client disconnect');
    }
  });

  function onSocketGone() {
    clearTimeout(idleTimer);
    clearTimeout(connectTimer);
    release();
    // 关键：连接没了不等于会话结束。寄存起来，等刷新后的页面拿 sessionId 回来挂。
    if (session) pool.park(session);
    session = null;
  }

  ws.on('close', onSocketGone);
  ws.on('error', onSocketGone);

  armConnectDeadline();
  bumpIdle();
}
