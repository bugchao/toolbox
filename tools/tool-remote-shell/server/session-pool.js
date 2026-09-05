import crypto from 'node:crypto';

/**
 * 会话寄存池。
 *
 * 浏览器刷新会销毁 WebSocket，但 SSH 连接本身没断。这里在 WS 掉线后把会话
 * 寄存一小段时间，前端拿 sessionId 重新挂回来即可——不需要再输一次密码，
 * 因为压根没有重新认证这回事。
 *
 * sessionId 是这条活着的 SSH 会话的凭证，所以：随机 24 字节、只在 ready 帧里
 * 下发一次、寄存有 TTL、并且校验来源 IP。
 */

const DEFAULT_TTL_MS = 3 * 60 * 1000;
// 回放缓冲：够把刷新前最后一屏到几屏内容还原出来，又不至于让长跑任务吃爆内存
const DEFAULT_BUFFER_BYTES = 256 * 1024;
const DEFAULT_MAX_PARKED = 20;

export function createSessionPool({
  ttlMs = DEFAULT_TTL_MS,
  bufferBytes = DEFAULT_BUFFER_BYTES,
  maxParked = DEFAULT_MAX_PARKED,
} = {}) {
  const sessions = new Map();

  function destroy(id, reason = 'destroyed') {
    const session = sessions.get(id);
    if (!session) return;
    sessions.delete(id);
    clearTimeout(session.timer);
    session.timer = null;
    session.ws = null;
    try { session.stream?.end(); } catch { /* 已经断了 */ }
    try { session.client?.end(); } catch { /* 已经断了 */ }
    session.onDestroy?.(reason);
  }

  return {
    /** 已寄存（当前没有 WS 挂着）的会话数 */
    parkedCount() {
      let count = 0;
      for (const session of sessions.values()) if (!session.ws) count += 1;
      return count;
    },

    size: () => sessions.size,

    create({ client, stream, ip, host, port, user, onDestroy }) {
      const id = crypto.randomBytes(24).toString('base64url');
      const session = {
        id,
        ip,
        host,
        port,
        user,
        client,
        stream,
        ws: null,
        chunks: [],
        bytes: 0,
        timer: null,
        onDestroy,
      };

      stream.on('data', (chunk) => {
        // 环形缓冲：始终留着最近的输出，重新挂上来时回放
        session.chunks.push(chunk);
        session.bytes += chunk.length;
        while (session.bytes > bufferBytes && session.chunks.length > 1) {
          session.bytes -= session.chunks.shift().length;
        }
        const ws = session.ws;
        if (ws && ws.readyState === ws.OPEN) ws.send(chunk, { binary: true });
      });

      sessions.set(id, session);
      return session;
    },

    get: (id) => sessions.get(id) ?? null,

    /**
     * 把会话交给一条新的 WS。
     * 旧连接还挂着就直接顶掉——刷新场景下那多半是还没来得及关的同一个人。
     */
    attach(id, ip, ws) {
      const session = sessions.get(id);
      if (!session) return null;
      if (session.ip !== ip) return null;

      if (session.ws && session.ws !== ws && session.ws.readyState === session.ws.OPEN) {
        try { session.ws.close(1000, 'superseded'); } catch { /* 忽略 */ }
      }

      clearTimeout(session.timer);
      session.timer = null;
      session.ws = ws;
      return session;
    },

    /** 回放缓冲里的历史输出，让刷新后的终端不是一片空白 */
    replay(session) {
      const ws = session.ws;
      if (!ws || ws.readyState !== ws.OPEN || !session.chunks.length) return;
      ws.send(Buffer.concat(session.chunks), { binary: true });
    },

    /** WS 掉线：不销毁，寄存起来等人回来挂 */
    park(session) {
      if (!sessions.has(session.id)) return false;
      session.ws = null;
      if (this.parkedCount() > maxParked) {
        destroy(session.id, 'too_many_parked');
        return false;
      }
      clearTimeout(session.timer);
      session.timer = setTimeout(() => destroy(session.id, 'resume_expired'), ttlMs);
      // 定时器不该拖着进程不退出
      session.timer.unref?.();
      return true;
    },

    destroy,
    ttlMs,
  };
}
