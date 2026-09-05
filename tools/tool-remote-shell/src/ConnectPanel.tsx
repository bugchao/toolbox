import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, NoticeCard, TextArea } from '@toolbox/ui-kit';
import { KeyRound, Lock, Plug, Server, Trash2, Unlock } from 'lucide-react';
import type { AuthType, HostEntry } from './vault';

export interface ConnectDraft {
  alias: string;
  host: string;
  port: number;
  user: string;
  authType: AuthType;
  secret: string;
  passphrase: string;
  remember: boolean;
}

const EMPTY_DRAFT: ConnectDraft = {
  alias: '',
  host: '',
  port: 22,
  user: '',
  authType: 'password',
  secret: '',
  passphrase: '',
  remember: false,
};

// ui-kit 的 Input/TextArea 是裸控件，不带 label，这里补一层，省得同样的
// label 结构在下面重复八遍
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    {children}
  </label>
);

interface ConnectPanelProps {
  vaultState: 'absent' | 'locked' | 'unlocked' | 'skipped';
  entries: HostEntry[];
  busy: boolean;
  error: string | null;
  requiresToken: boolean;
  token: string;
  onTokenChange(value: string): void;
  onUnlock(masterPassword: string): void;
  onSkipVault(): void;
  onDeleteEntry(id: string): void;
  onConnect(draft: ConnectDraft): void;
}

const ConnectPanel: React.FC<ConnectPanelProps> = ({
  vaultState,
  entries,
  busy,
  error,
  requiresToken,
  token,
  onTokenChange,
  onUnlock,
  onSkipVault,
  onDeleteEntry,
  onConnect,
}) => {
  const { t } = useTranslation('toolRemoteShell');
  const [draft, setDraft] = useState<ConnectDraft>(EMPTY_DRAFT);
  const [masterPassword, setMasterPassword] = useState('');

  const set = <K extends keyof ConnectDraft>(key: K, value: ConnectDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const fillFrom = (entry: HostEntry) =>
    setDraft({
      alias: entry.alias,
      host: entry.host,
      port: entry.port,
      user: entry.user,
      authType: entry.authType,
      secret: entry.secret,
      passphrase: entry.passphrase ?? '',
      remember: true,
    });

  const canConnect = Boolean(draft.host.trim() && draft.user.trim() && draft.secret) && !busy;

  if (vaultState === 'locked' || vaultState === 'absent') {
    const locked = vaultState === 'locked';
    return (
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Lock className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {locked ? t('vault.unlockTitle') : t('vault.createTitle')}
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {locked ? t('vault.unlockHint') : t('vault.createHint')}
        </p>
        <Input
          type="password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          placeholder={t('vault.masterPlaceholder')}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && masterPassword) onUnlock(masterPassword);
          }}
        />
        {error ? <NoticeCard tone="danger" title={error} /> : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onUnlock(masterPassword)} disabled={!masterPassword}>
            <Unlock className="w-4 h-4 mr-1 inline" />
            {locked ? t('vault.unlock') : t('vault.create')}
          </Button>
          <Button variant="secondary" onClick={onSkipVault}>
            {t('vault.skip')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.length > 0 ? (
        <Card className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t('saved.title')}
          </h3>
          <ul className="space-y-1">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fillFrom(entry)}
                  className="flex-1 text-left px-3 py-2 rounded-md text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <Server className="inline w-4 h-4 mr-2 opacity-60" />
                  <span className="font-medium">{entry.alias || entry.host}</span>
                  <span className="ml-2 opacity-60">
                    {entry.user}@{entry.host}:{entry.port}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => onDeleteEntry(entry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">{t('saved.delete')}</span>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('form.host')}>
            <Input
              value={draft.host}
              onChange={(e) => set('host', e.target.value)}
              placeholder="example.com"
            />
          </Field>
          <Field label={t('form.port')}>
            <Input
              type="number"
              value={String(draft.port)}
              onChange={(e) => set('port', Number(e.target.value) || 22)}
            />
          </Field>
          <Field label={t('form.user')}>
            <Input
              value={draft.user}
              onChange={(e) => set('user', e.target.value)}
              placeholder="root"
              autoComplete="off"
            />
          </Field>
          <Field label={t('form.alias')}>
            <Input
              value={draft.alias}
              onChange={(e) => set('alias', e.target.value)}
              placeholder={t('form.aliasPlaceholder')}
            />
          </Field>
        </div>

        <div className="flex gap-2">
          {(['password', 'key'] as AuthType[]).map((type) => (
            <Button
              key={type}
              variant={draft.authType === type ? 'primary' : 'secondary'}
              onClick={() => set('authType', type)}
            >
              {type === 'password' ? (
                <Lock className="w-4 h-4 mr-1 inline" />
              ) : (
                <KeyRound className="w-4 h-4 mr-1 inline" />
              )}
              {t(`form.auth_${type}`)}
            </Button>
          ))}
        </div>

        {draft.authType === 'password' ? (
          <Field label={t('form.password')}>
            <Input
              type="password"
              value={draft.secret}
              onChange={(e) => set('secret', e.target.value)}
              autoComplete="off"
            />
          </Field>
        ) : (
          <>
            <Field label={t('form.privateKey')}>
              <TextArea
                value={draft.secret}
                onChange={(e) => set('secret', e.target.value)}
                rows={6}
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                spellCheck={false}
              />
            </Field>
            <Field label={t('form.passphrase')}>
              <Input
                type="password"
                value={draft.passphrase}
                onChange={(e) => set('passphrase', e.target.value)}
                autoComplete="off"
              />
            </Field>
          </>
        )}

        {requiresToken ? (
          <Field label={t('form.token')}>
            <Input
              type="password"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              autoComplete="off"
            />
          </Field>
        ) : null}

        {vaultState === 'unlocked' ? (
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={draft.remember}
              onChange={(e) => set('remember', e.target.checked)}
            />
            {t('form.remember')}
          </label>
        ) : null}

        {error ? <NoticeCard tone="danger" title={error} /> : null}

        <Button onClick={() => onConnect(draft)} disabled={!canConnect} loading={busy}>
          <Plug className="w-4 h-4 mr-1 inline" />
          {busy ? t('form.connecting') : t('form.connect')}
        </Button>
      </Card>
    </div>
  );
};

export default ConnectPanel;
