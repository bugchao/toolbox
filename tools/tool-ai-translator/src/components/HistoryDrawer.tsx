import React, { useMemo, useState } from 'react'
import { Button } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Eraser, History, RotateCcw, Trash2, X } from 'lucide-react'
import {
  CAP_OPTIONS,
  capacityHint,
  clearAll,
  readHistory,
  readSettings,
  removeEntry,
  writeHistory,
  writeSettings,
  type HistoryEntry,
  type HistorySettings,
  type RollingStrategy,
} from '../lib/history'
import { getProvider } from '../lib/providers'
import { getLang, type LangCode } from '../lib/languages'

type Props = {
  open: boolean
  onClose: () => void
  onRestore: (entry: HistoryEntry) => void
  /** 父组件触发刷新的 tick；变化时本组件重新读取 history（保证 add 后能看到） */
  refreshKey: number
}

const HistoryDrawer: React.FC<Props> = ({ open, onClose, onRestore, refreshKey }) => {
  const { t, i18n } = useTranslation('toolAiTranslator')
  const [version, setVersion] = useState(0)
  const entries = useMemo(
    () => readHistory(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, refreshKey, open],
  )
  const settings = useMemo(
    () => readSettings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, open],
  )
  const hint = capacityHint(entries, settings)

  if (!open) return null

  const tick = () => setVersion((v) => v + 1)

  const updateSettings = (next: HistorySettings) => {
    writeSettings(next)
    // 切换策略时按新规则裁剪一次
    if (next.strategy === 'cap' && entries.length > next.cap) {
      writeHistory(entries.slice(0, next.cap))
    }
    tick()
  }

  const handleRemove = (id: string) => {
    writeHistory(removeEntry(entries, id))
    tick()
  }

  const handleClearAll = () => {
    if (typeof window === 'undefined' || window.confirm(t('history.confirmClearAll'))) {
      writeHistory(clearAll())
      tick()
    }
  }

  const formatTime = (ms: number) => {
    try {
      return new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }).format(new Date(ms))
    } catch {
      return new Date(ms).toISOString().slice(0, 16).replace('T', ' ')
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="close history" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-gray-900">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-900 dark:text-gray-100">
            <History className="h-4 w-4" />
            {t('history.heading')}
            <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {hint.cap == null ? hint.count : `${hint.count} / ${hint.cap}`}
            </span>
            {hint.nearLimit && (
              <span className="text-xs text-amber-600 dark:text-amber-400">{t('history.nearLimit')}</span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* 策略配置 */}
        <section className="space-y-2 border-b border-gray-200 px-4 py-3 text-xs dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t('history.strategyTitle')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={settings.strategy}
              onChange={(e) => updateSettings({ ...settings, strategy: e.target.value as RollingStrategy })}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="cap">{t('history.strategyCap')}</option>
              <option value="manual">{t('history.strategyManual')}</option>
            </select>
            {settings.strategy === 'cap' && (
              <label className="inline-flex items-center gap-1.5">
                <span className="text-gray-600 dark:text-gray-400">{t('history.capLabel')}</span>
                <select
                  value={settings.cap}
                  onChange={(e) => updateSettings({ ...settings, cap: Number(e.target.value) as 20 | 50 | 100 | 200 })}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {CAP_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={handleClearAll} disabled={entries.length === 0}>
              <span className="inline-flex items-center gap-1.5">
                <Eraser className="h-3.5 w-3.5" />
                {t('history.clearAll')}
              </span>
            </Button>
          </div>
        </section>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t('history.empty')}
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="group rounded-lg border border-gray-200 p-3 transition hover:border-indigo-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-indigo-700"
                >
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span>{formatTime(e.ts)}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-800">
                        {t(getLang(e.source as LangCode).i18nKey)} → {t(getLang(e.target as LangCode).i18nKey)}
                      </span>
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {getProvider(e.providerId)?.label ?? e.providerId}
                      </span>
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title={t('history.restore')}
                        onClick={() => { onRestore(e); onClose() }}
                        className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title={t('history.delete')}
                        onClick={() => handleRemove(e.id)}
                        className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-1 text-xs">
                    <p className="line-clamp-2 text-gray-700 dark:text-gray-200">{e.input}</p>
                    <p className="line-clamp-2 text-gray-500 dark:text-gray-400">→ {e.output}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 text-right dark:border-gray-700">
          <Button onClick={onClose}>{t('history.done')}</Button>
        </footer>
      </div>
    </div>
  )
}

export default HistoryDrawer
