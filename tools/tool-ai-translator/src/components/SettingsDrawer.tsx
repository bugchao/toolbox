import React, { useState } from 'react'
import { Button, Input } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Cloud, Cpu, Globe, KeyRound, X } from 'lucide-react'
import { PROVIDERS } from '../lib/providers'
import { readProviderConfig, writeProviderConfig } from '../lib/storage'

type Tab = 'cloud' | 'local' | 'webllm'

type DrawerProps = {
  open: boolean
  onClose: () => void
  onChanged: () => void
}

const SettingsDrawer: React.FC<DrawerProps> = ({ open, onClose, onChanged }) => {
  const { t } = useTranslation('toolAiTranslator')
  const [tab, setTab] = useState<Tab>('cloud')

  if (!open) return null

  const cloudProviders = PROVIDERS.filter((p) => p.kind === 'cloud' || p.kind === 'custom')
  const localProviders = PROVIDERS.filter((p) => p.kind === 'local')
  const webllmProviders = PROVIDERS.filter((p) => p.kind === 'webllm')

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="close drawer"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-gray-900">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.heading')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex gap-1 border-b border-gray-200 px-3 pt-3 dark:border-gray-700">
          <TabButton active={tab === 'cloud'} onClick={() => setTab('cloud')} icon={<Cloud className="h-3.5 w-3.5" />}>
            {t('settings.tab.cloud')}
          </TabButton>
          <TabButton active={tab === 'local'} onClick={() => setTab('local')} icon={<Globe className="h-3.5 w-3.5" />}>
            {t('settings.tab.local')}
          </TabButton>
          <TabButton active={tab === 'webllm'} onClick={() => setTab('webllm')} icon={<Cpu className="h-3.5 w-3.5" />}>
            {t('settings.tab.webllm')}
          </TabButton>
        </nav>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'cloud' && (
            <div className="space-y-5">
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {t('settings.tab.cloudNotice')}
              </p>
              {cloudProviders.map((p) => (
                <ProviderEditor key={p.id} providerId={p.id} onChanged={onChanged} />
              ))}
            </div>
          )}
          {tab === 'local' && (
            <div className="space-y-5">
              <p className="rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-900/30 dark:text-sky-200">
                {t('settings.tab.localNotice')}
              </p>
              {localProviders.map((p) => (
                <ProviderEditor key={p.id} providerId={p.id} onChanged={onChanged} hideKey />
              ))}
            </div>
          )}
          {tab === 'webllm' && (
            <div className="space-y-5">
              <p className="rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                {t('settings.tab.webllmNotice')}
              </p>
              {webllmProviders.map((p) => (
                <ProviderEditor key={p.id} providerId={p.id} onChanged={onChanged} hideKey hideBaseUrl />
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 text-right dark:border-gray-700">
          <Button onClick={onClose}>{t('settings.done')}</Button>
        </footer>
      </div>
    </div>
  )
}

const TabButton: React.FC<{
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ active, onClick, icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-1.5 text-xs font-medium transition',
      active
        ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300'
        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
    ].join(' ')}
  >
    {icon}
    {children}
  </button>
)

const ProviderEditor: React.FC<{
  providerId: string
  onChanged: () => void
  hideKey?: boolean
  hideBaseUrl?: boolean
}> = ({ providerId, onChanged, hideKey, hideBaseUrl }) => {
  const { t } = useTranslation('toolAiTranslator')
  const provider = PROVIDERS.find((p) => p.id === providerId)!
  const [cfg, setCfg] = useState(() => readProviderConfig(providerId))

  const persist = (next: typeof cfg) => {
    setCfg(next)
    writeProviderConfig(providerId, next)
    onChanged()
  }

  return (
    <section className="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-gray-800 dark:text-gray-100">{provider.label}</span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {provider.protocol}
        </span>
      </div>

      {!hideKey && (
        <Field label={t('settings.field.apiKey')} icon={<KeyRound className="h-3.5 w-3.5" />}>
          <Input
            type="password"
            value={cfg.apiKey ?? ''}
            placeholder={provider.requiresApiKey ? t('settings.field.apiKeyRequired') : t('settings.field.apiKeyOptional')}
            onChange={(e) => persist({ ...cfg, apiKey: e.target.value })}
            spellCheck={false}
            autoComplete="off"
          />
        </Field>
      )}

      {!hideBaseUrl && (
        <Field label={t('settings.field.baseUrl')}>
          <Input
            value={cfg.baseUrl ?? ''}
            placeholder={provider.defaultBaseUrl}
            onChange={(e) => persist({ ...cfg, baseUrl: e.target.value })}
            spellCheck={false}
            autoComplete="off"
          />
        </Field>
      )}

      <Field label={t('settings.field.model')}>
        <Input
          list={provider.models.length > 0 ? `models-${providerId}` : undefined}
          value={cfg.model ?? ''}
          placeholder={provider.defaultModel || t('settings.field.modelCustomPlaceholder') || 'model name'}
          onChange={(e) => persist({ ...cfg, model: e.target.value })}
          spellCheck={false}
          autoComplete="off"
        />
        {provider.models.length > 0 && (
          <datalist id={`models-${providerId}`}>
            {provider.models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        )}
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {t('settings.field.modelHint')}
        </p>
      </Field>

      {provider.hintKey && (
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t(provider.hintKey)}</p>
      )}
    </section>
  )
}

const Field: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  icon,
  children,
}) => (
  <label className="mb-2 block">
    <span className="mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {icon}
      {label}
    </span>
    {children}
  </label>
)

export default SettingsDrawer
