import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@toolbox/ui-kit';
import { Unplug } from 'lucide-react';
import type { ConnectDraft } from './ConnectPanel';
import TerminalView, { type TerminalHandle } from './TerminalView';
import { openSession, type ConnectAuth, type SessionHandle } from './session';
import { getKnownHostKey, rememberHostKey } from './vault';

export type TabPhase = 'connecting' | 'connected' | 'closed';

interface PendingHostKey {
  fingerprint: string;
  host: string;
  port: number;
}

interface TerminalTabProps {
  wsPath: string;
  token: string;
  draft: ConnectDraft;
  /** 刷新后恢复用：有它就直接挂回寄存中的会话，不重新认证 */
  resumeSessionId?: string | null;
  active: boolean;
  fullscreen: boolean;
  onPhaseChange(phase: TabPhase): void;
  /** 把服务端下发的会话 id 交给外壳去存，刷新后才能找回来 */
  onSessionId(sessionId: string): void;
  /** 寄存的会话已经过期，外壳应当把这个标签页收掉 */
  onExpired(): void;
  /** 连上之后通知父组件，由它决定要不要写进凭据金库 */
  onConnected(draft: ConnectDraft): void;
}

function draftToAuth(draft: ConnectDraft): ConnectAuth {
  return draft.authType === 'key'
    ? { type: 'key', privateKey: draft.secret, passphrase: draft.passphrase || undefined }
    : { type: 'password', password: draft.secret };
}

/**
 * 一个标签页 = 一条独立的 WS 连接 + 一个 xterm 实例。
 *
 * 会话状态放在组件实例里而不是父组件的 Map<id, ...>：React 的组件实例本来就
 * 提供了按 key 隔离的状态，多开一个 tab 就是多挂一个实例，父组件不用管。
 */
const TerminalTab: React.FC<TerminalTabProps> = ({
  wsPath,
  token,
  draft,
  resumeSessionId,
  active,
  fullscreen,
  onPhaseChange,
  onSessionId,
  onExpired,
  onConnected,
}) => {
  const { t } = useTranslation('toolRemoteShell');
  const [phase, setPhase] = useState<TabPhase>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [pendingHostKey, setPendingHostKey] = useState<PendingHostKey | null>(null);
  const [resumed, setResumed] = useState(false);

  const sessionRef = useRef<SessionHandle | null>(null);
  const terminalRef = useRef<TerminalHandle | null>(null);

  // 回调放 ref：父组件每次渲染都会给新函数，不能因此重连
  const callbacksRef = useRef({ onPhaseChange, onSessionId, onExpired, onConnected });
  callbacksRef.current = { onPhaseChange, onSessionId, onExpired, onConnected };

  const updatePhase = useCallback((next: TabPhase) => {
    setPhase(next);
    callbacksRef.current.onPhaseChange(next);
  }, []);

  /**
   * 开一条 WS 并把事件接好，具体是新建会话还是挂回旧会话由 run 决定。
   */
  const runSession = useCallback(
    (run: (handle: SessionHandle) => void) => {
      updatePhase('connecting');
      setError(null);

      const size = terminalRef.current?.size() ?? { cols: 80, rows: 24 };

      // 接受 host key 后会立刻关掉旧会话再开一个新的。旧 socket 的 onclose 是异步
      // 来的，那时 sessionRef 里装的已经是新会话了——不认身份就会把新会话误置空，
      // 终端从此收不到输入。所有回调都先比对身份再动状态。
      let handle: SessionHandle | null = null;
      const isCurrent = () => sessionRef.current === handle;

      const session = openSession({
        wsPath,
        token: token || undefined,
        onData: (text) => {
          if (isCurrent()) terminalRef.current?.write(text);
        },
        onSocketClose: () => {
          if (!isCurrent()) return;
          sessionRef.current = null;
          updatePhase('closed');
        },
        onEvent: (event) => {
          if (!isCurrent()) return;
          if (event.t === 'ready') {
            updatePhase('connected');
            setResumed(Boolean(event.resumed));
            if (event.sessionId) callbacksRef.current.onSessionId(event.sessionId);
            if (event.fingerprint) rememberHostKey(draft.host, draft.port, event.fingerprint);
            if (!event.resumed) callbacksRef.current.onConnected(draft);
            setTimeout(() => {
              terminalRef.current?.fit();
              terminalRef.current?.focus();
            }, 0);
            return;
          }
          if (event.t === 'hostkey') {
            setPendingHostKey({ fingerprint: event.fingerprint, host: event.host, port: event.port });
            return;
          }
          if (event.t === 'error') {
            // 寄存的会话过期了：这个标签页已经没有可恢复的东西，交给外壳收掉
            if (event.code === 'session_expired') {
              callbacksRef.current.onExpired();
              return;
            }
            setError(t(`errors.${event.code}`, { defaultValue: t('errors.connect_failed') }));
            updatePhase('closed');
            return;
          }
          if (event.t === 'closed') {
            terminalRef.current?.write(
              `\r\n\x1b[33m[${t(`closed.${event.code}`, { defaultValue: event.code })}]\x1b[0m\r\n`,
            );
            updatePhase('closed');
          }
        },
      });

      // 先认领身份再发帧：晚一步的话首帧回调会被自己的身份检查挡掉
      handle = session;
      sessionRef.current = session;
      run(session);
      return { session, size };
    },
    [draft, t, token, updatePhase, wsPath],
  );

  const startSession = useCallback(
    (fingerprint: string | null) => {
      runSession((handle) => {
        const size = terminalRef.current?.size() ?? { cols: 80, rows: 24 };
        handle.connect({
          host: draft.host.trim(),
          port: draft.port,
          user: draft.user.trim(),
          auth: draftToAuth(draft),
          knownFingerprint: fingerprint,
          cols: size.cols,
          rows: size.rows,
        });
      });
    },
    [draft, runSession],
  );

  // 通过 ref 调用，effect 就不必依赖这些函数的身份，
  // 也就不会因为父组件重渲染而重连
  const bootRef = useRef({ startSession, runSession, resumeSessionId });
  bootRef.current = { startSession, runSession, resumeSessionId };

  /**
   * 连接的生命周期 == 标签页的生命周期：在同一个 effect 里建、在它的清理里收。
   *
   * 千万别拆成两个 effect，也别加「只跑一次」的守卫：StrictMode 会走
   * 挂载 → 清理 → 再挂载，守卫会让第二次挂载直接跳过建连，而清理已经把
   * 第一次的会话关掉了——结果标签页没有会话，界面永远停在「连接中」。
   */
  useEffect(() => {
    const { startSession: start, runSession: run, resumeSessionId: resumeId } = bootRef.current;
    if (resumeId) run((handle) => handle.attach(resumeId));
    else start(getKnownHostKey(draft.host, draft.port));

    return () => {
      // 关标签页是明确要断开，发 disconnect 让服务端真的销毁会话；
      // 刷新走的不是这条路——页面卸载时 React 不跑清理，WS 直接断，服务端会寄存。
      sessionRef.current?.close();
      sessionRef.current = null;
    };
  }, [draft.host, draft.port]);

  // 隐藏期间 xterm 量到的容器尺寸是 0，切回来要重测；进出全屏同理
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      terminalRef.current?.fit();
      terminalRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [active, phase, fullscreen]);

  const acceptHostKey = useCallback(() => {
    if (!pendingHostKey) return;
    const { host, port, fingerprint } = pendingHostKey;
    rememberHostKey(host, port, fingerprint);
    setPendingHostKey(null);
    sessionRef.current?.close();
    sessionRef.current = null;
    startSession(fingerprint);
  }, [pendingHostKey, startSession]);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    updatePhase('closed');
  }, [updatePhase]);

  // 非活动页只是隐藏，绝不能卸载：卸载会销毁 xterm 实例、丢掉滚动缓冲和会话
  const wrapperClass = !active
    ? 'hidden'
    : fullscreen
      ? 'flex-1 min-h-0 flex flex-col gap-2'
      : 'space-y-3';

  const canReconnect = Boolean(draft.secret);

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {draft.user}@{draft.host}:{draft.port}
          {phase === 'connecting' ? ` · ${t('terminal.connecting')}` : ''}
          {phase === 'connected' && resumed ? ` · ${t('terminal.resumed')}` : ''}
          {phase === 'closed' ? ` · ${t('terminal.closed')}` : ''}
        </span>
        <div className="flex gap-2">
          {phase === 'closed' ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={!canReconnect}
              title={canReconnect ? undefined : t('terminal.needCredentials')}
              onClick={() => startSession(getKnownHostKey(draft.host, draft.port))}
            >
              {t('terminal.reconnect')}
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={disconnect}>
              <Unplug className="w-4 h-4 mr-1 inline" />
              {t('terminal.disconnect')}
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <TerminalView
        ref={terminalRef}
        className={
          fullscreen
            ? 'flex-1 min-h-0 rounded-lg overflow-hidden'
            : 'h-[60vh] rounded-lg overflow-hidden'
        }
        onData={(data) => sessionRef.current?.write(data)}
        onResize={(cols, rows) => sessionRef.current?.resize(cols, rows)}
      />

      {pendingHostKey && active ? (
        <Modal onClose={() => setPendingHostKey(null)} className="max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {t('hostkey.title')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('hostkey.description', {
                host: pendingHostKey.host,
                port: pendingHostKey.port,
              })}
            </p>
            <code className="block px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-sm break-all">
              {pendingHostKey.fingerprint}
            </code>
            <p className="text-xs text-slate-500">{t('hostkey.verifyHint')}</p>
            <div className="flex gap-3">
              <Button onClick={acceptHostKey}>{t('hostkey.trust')}</Button>
              <Button variant="secondary" onClick={() => setPendingHostKey(null)}>
                {t('hostkey.cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default TerminalTab;
