import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NoticeCard, PageHero, Spinner } from '@toolbox/ui-kit';
import { Maximize2, Minimize2, Plus, Terminal as TerminalIcon, X } from 'lucide-react';
import ConnectPanel, { type ConnectDraft } from './ConnectPanel';
import TerminalTab, { type TabPhase } from './TerminalTab';
import {
  clearVault,
  decryptVault,
  encryptVault,
  hasVault,
  loadVaultBlob,
  saveVaultBlob,
  type HostEntry,
} from './vault';

interface GateStatus {
  requiresToken: boolean;
  wsPath: string;
}

const DEFAULT_STATUS: GateStatus = { requiresToken: false, wsPath: '/api/remote-shell/ws' };

type VaultState = 'absent' | 'locked' | 'unlocked' | 'skipped';

interface Tab {
  id: string;
  title: string;
  draft: ConnectDraft;
  phase: TabPhase;
  /** 服务端下发的会话 id，刷新后靠它挂回来 */
  sessionId?: string;
  /** 本次是从存档恢复出来的，挂载时应当 attach 而不是新建 */
  resumeSessionId?: string;
}

/**
 * 标签页存档。
 *
 * 用 sessionStorage 而不是 localStorage：刷新要留，关掉浏览器标签就该清掉——
 * 那时服务端的寄存会话也会到期。存档里**只有主机信息和会话 id，没有任何密钥**，
 * 恢复靠的是服务端还留着那条 SSH 连接，不是靠重新认证。
 */
let tabSeq = 0;

const TABS_KEY = 'toolbox.remote-shell.tabs.v1';

interface StoredTab {
  id: string;
  title: string;
  host: string;
  port: number;
  user: string;
  alias: string;
  sessionId: string;
}

function loadStoredTabs(): Tab[] {
  try {
    const raw = sessionStorage.getItem(TABS_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredTab[];
    if (!Array.isArray(stored)) return [];
    // 新标签页的序号必须跳过存档里已用掉的，否则 id 会撞、React key 也会重
    for (const item of stored) {
      const n = Number(String(item?.id ?? '').replace('tab-', ''));
      if (Number.isFinite(n)) tabSeq = Math.max(tabSeq, n);
    }
    return stored
      .filter((item) => item?.sessionId && item?.host)
      .map((item) => ({
        id: item.id,
        title: item.title,
        phase: 'connecting' as TabPhase,
        sessionId: item.sessionId,
        resumeSessionId: item.sessionId,
        draft: {
          alias: item.alias ?? '',
          host: item.host,
          port: item.port,
          user: item.user,
          authType: 'password',
          secret: '', // 密钥不进存档
          passphrase: '',
          remember: false,
        },
      }));
  } catch {
    return [];
  }
}

function saveStoredTabs(tabs: Tab[]): void {
  try {
    const stored: StoredTab[] = tabs
      .filter((tab) => tab.sessionId)
      .map((tab) => ({
        id: tab.id,
        title: tab.title,
        host: tab.draft.host,
        port: tab.draft.port,
        user: tab.draft.user,
        alias: tab.draft.alias,
        sessionId: tab.sessionId as string,
      }));
    if (stored.length) sessionStorage.setItem(TABS_KEY, JSON.stringify(stored));
    else sessionStorage.removeItem(TABS_KEY);
  } catch {
    /* 隐私模式下存不住，退化为「刷新后不恢复」 */
  }
}

const PHASE_DOT: Record<TabPhase, string> = {
  connecting: 'bg-amber-400',
  connected: 'bg-emerald-500',
  closed: 'bg-slate-400',
};

const NOTICE_KEY = 'toolbox.remote-shell.notice-dismissed.v1';

function noticeDismissed(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return false;
  }
}

const RemoteShell: React.FC = () => {
  const { t } = useTranslation('toolRemoteShell');

  // 默认就是可连的：状态接口只用来告诉前端「要不要口令」
  const [status, setStatus] = useState<GateStatus>(DEFAULT_STATUS);
  const [statusLoading, setStatusLoading] = useState(true);
  const [vaultState, setVaultState] = useState<VaultState>(() =>
    hasVault() ? 'locked' : 'absent',
  );
  const [entries, setEntries] = useState<HostEntry[]>([]);
  const [token, setToken] = useState('');
  const [vaultError, setVaultError] = useState<string | null>(null);

  // 刷新后先把存档里的标签页拉起来，它们会 attach 回寄存中的会话
  const [tabs, setTabs] = useState<Tab[]>(loadStoredTabs);
  // null 表示停在「新建连接」面板上
  const [activeId, setActiveId] = useState<string | null>(() => loadStoredTabs()[0]?.id ?? null);
  const [fullscreen, setFullscreen] = useState(false);
  const [hideNotice, setHideNotice] = useState(noticeDismissed);

  // 主密码只放在 ref 里：不进 state 就不会随渲染快照被 React DevTools 抓到，
  // 也不会意外出现在依赖数组里被闭包捕获多份
  const masterRef = useRef<string>('');

  useEffect(() => {
    let alive = true;
    fetch('/api/remote-shell/status')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('status failed'))))
      .then((data: GateStatus) => {
        if (alive) setStatus(data);
      })
      .catch(() => {
        // 状态接口拿不到也不拦人：按「不需要口令」继续，连不上会在连接时报明确错误
        if (alive) setStatus(DEFAULT_STATUS);
      })
      .finally(() => {
        if (alive) setStatusLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 全屏时 Esc 退出。终端本身也吃 Esc，但那是 xterm 内部的按键处理，
  // 这里挂在 document 上走捕获阶段，两者不冲突。
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [fullscreen]);

  const dismissNotice = useCallback(() => {
    setHideNotice(true);
    try {
      localStorage.setItem(NOTICE_KEY, '1');
    } catch {
      /* 隐私模式下存不住，本次会话内隐藏即可 */
    }
  }, []);

  const persistEntries = useCallback(async (next: HostEntry[]) => {
    setEntries(next);
    if (!masterRef.current) return;
    saveVaultBlob(await encryptVault(next, masterRef.current));
  }, []);

  const handleUnlock = useCallback(
    async (masterPassword: string) => {
      setVaultError(null);
      const blob = loadVaultBlob();
      if (!blob) {
        // 首次创建：空金库先落一份，后面存条目直接增量加密
        masterRef.current = masterPassword;
        saveVaultBlob(await encryptVault([], masterPassword));
        setEntries([]);
        setVaultState('unlocked');
        return;
      }
      try {
        const decrypted = await decryptVault(blob, masterPassword);
        masterRef.current = masterPassword;
        setEntries(decrypted);
        setVaultState('unlocked');
      } catch {
        setVaultError(t('vault.wrongPassword'));
      }
    },
    [t],
  );

  const openTab = useCallback((draft: ConnectDraft) => {
    tabSeq += 1;
    const id = `tab-${tabSeq}`;
    const title = draft.alias.trim() || `${draft.user}@${draft.host}`;
    setTabs((prev) => [...prev, { id, title, draft, phase: 'connecting' }]);
    setActiveId(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const index = prev.findIndex((tab) => tab.id === id);
      const next = prev.filter((tab) => tab.id !== id);
      setActiveId((current) => {
        if (current !== id) return current;
        // 关掉当前页就落到相邻的一页，没有相邻页就回到新建面板
        const neighbour = next[index] ?? next[index - 1];
        return neighbour?.id ?? null;
      });
      return next;
    });
  }, []);

  const setTabPhase = useCallback((id: string, phase: TabPhase) => {
    setTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, phase } : tab)));
  }, []);

  const setTabSessionId = useCallback((id: string, sessionId: string) => {
    setTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, sessionId } : tab)));
  }, []);

  // 存档随标签页变化即时落盘，刷新前不需要额外的收尾动作
  useEffect(() => {
    saveStoredTabs(tabs);
  }, [tabs]);

  // 某个标签页连上了：需要的话把凭据写进金库
  const rememberIfAsked = useCallback(
    (draft: ConnectDraft) => {
      if (!draft.remember || !masterRef.current) return;
      const entry: HostEntry = {
        id: `${draft.user}@${draft.host}:${draft.port}`,
        alias: draft.alias,
        host: draft.host,
        port: draft.port,
        user: draft.user,
        authType: draft.authType,
        secret: draft.secret,
        passphrase: draft.passphrase || undefined,
      };
      setEntries((prev) => {
        const next = [...prev.filter((item) => item.id !== entry.id), entry];
        if (masterRef.current) void encryptVault(next, masterRef.current).then(saveVaultBlob);
        return next;
      });
    },
    [],
  );

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col gap-2 bg-white dark:bg-slate-900 p-3'
          : 'space-y-6'
      }
    >
      {/* 全屏时标题和提示都让位给终端 */}
      {fullscreen ? null : (
        <>
          <PageHero title={t('title')} description={t('description')} />
          {hideNotice ? null : (
            <NoticeCard
              tone="info"
              title={t('privacy.title')}
              description={t('privacy.description')}
              onDismiss={dismissNotice}
              dismissLabel={t('privacy.dismiss')}
            />
          )}
        </>
      )}

      {tabs.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-1 shrink-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={[
                'group flex items-center gap-2 rounded-t-md px-3 py-2 text-sm',
                tab.id === activeId
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50',
              ].join(' ')}
            >
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={() => setActiveId(tab.id)}
                aria-current={tab.id === activeId ? 'page' : undefined}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${PHASE_DOT[tab.phase]}`}
                  aria-hidden="true"
                />
                {tab.title}
              </button>
              <button
                type="button"
                aria-label={t('tabs.close', { title: tab.title })}
                className="opacity-40 hover:opacity-100 hover:text-red-600"
                onClick={() => closeTab(tab.id)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            aria-label={t('tabs.new')}
            className={[
              'flex items-center gap-1 rounded-t-md px-3 py-2 text-sm',
              activeId === null
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50',
            ].join(' ')}
            onClick={() => setActiveId(null)}
          >
            <Plus className="w-4 h-4" />
            {t('tabs.new')}
          </button>

          <button
            type="button"
            aria-label={fullscreen ? t('tabs.exitFullscreen') : t('tabs.fullscreen')}
            title={fullscreen ? t('tabs.exitFullscreen') : t('tabs.fullscreen')}
            className="ml-auto flex items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            onClick={() => setFullscreen((prev) => !prev)}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {fullscreen ? t('tabs.exitFullscreen') : t('tabs.fullscreen')}
          </button>
        </div>
      ) : null}

      {activeId === null ? (
        <>
          {tabs.length > 0 ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <TerminalIcon className="w-4 h-4" />
              {t('tabs.openCount', { count: tabs.length })}
            </p>
          ) : null}
          <ConnectPanel
            vaultState={vaultState}
            entries={entries}
            busy={false}
            error={vaultError}
            requiresToken={status.requiresToken}
            token={token}
            onTokenChange={setToken}
            onUnlock={handleUnlock}
            onSkipVault={() => {
              masterRef.current = '';
              setVaultState('skipped');
            }}
            onDeleteEntry={(id) => void persistEntries(entries.filter((entry) => entry.id !== id))}
            onConnect={openTab}
          />
        </>
      ) : null}

      {/* 所有标签页都保持挂载：卸载会丢掉滚动缓冲和正在跑的会话 */}
      {tabs.map((tab) => (
        <TerminalTab
          key={tab.id}
          wsPath={status.wsPath}
          token={token}
          draft={tab.draft}
          resumeSessionId={tab.resumeSessionId}
          active={tab.id === activeId}
          fullscreen={fullscreen}
          onPhaseChange={(phase) => setTabPhase(tab.id, phase)}
          onSessionId={(sessionId) => setTabSessionId(tab.id, sessionId)}
          onExpired={() => closeTab(tab.id)}
          onConnected={rememberIfAsked}
        />
      ))}

      {vaultState === 'unlocked' && !fullscreen ? (
        <button
          type="button"
          className="text-xs text-slate-500 hover:text-red-600 underline"
          onClick={() => {
            clearVault();
            masterRef.current = '';
            setEntries([]);
            setVaultState('absent');
          }}
        >
          {t('vault.destroy')}
        </button>
      ) : null}
    </div>
  );
};

export default RemoteShell;
