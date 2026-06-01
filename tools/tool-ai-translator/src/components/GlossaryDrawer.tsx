import React, { useMemo, useRef, useState } from 'react'
import { Button, Input } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { BookMarked, Download, Eraser, Plus, Trash2, Upload, X } from 'lucide-react'
import {
  addEntry,
  applicable,
  exportJson,
  importJson,
  readGlossary,
  removeEntry,
  updateEntry,
  writeGlossary,
  type GlossaryEntry,
} from '../lib/glossary'
import { LANGUAGES, type LangCode } from '../lib/languages'

type Props = {
  open: boolean
  onClose: () => void
  /** 主编辑器中的当前文本 + 语向，用于在抽屉里高亮「当前生效」的条目 */
  contextText?: string
  contextSource: LangCode
  contextTarget: LangCode
  /** 父组件用 tick 强制刷新；保存/删除时调用 */
  onChanged: () => void
}

const ANY = '__any__'

const GlossaryDrawer: React.FC<Props> = ({
  open,
  onClose,
  contextText = '',
  contextSource,
  contextTarget,
  onChanged,
}) => {
  const { t } = useTranslation('toolAiTranslator')
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const entries = useMemo(
    () => readGlossary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, open],
  )
  const active = useMemo(
    () => applicable(entries, contextSource, contextTarget, contextText),
    [entries, contextSource, contextTarget, contextText],
  )

  if (!open) return null

  const tick = () => {
    setVersion((v) => v + 1)
    onChanged()
  }

  const persist = (next: GlossaryEntry[]) => {
    writeGlossary(next)
    tick()
  }

  const onAdd = () => persist(addEntry(entries, {}))
  const onRemoveOne = (id: string) => persist(removeEntry(entries, id))
  const onPatch = (id: string, patch: Partial<GlossaryEntry>) => persist(updateEntry(entries, id, patch))
  const onClear = () => {
    if (typeof window === 'undefined' || window.confirm(t('glossary.confirmClear'))) {
      persist([])
    }
  }

  const onExport = () => {
    const blob = new Blob([exportJson(entries)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `glossary-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const onImportClick = () => fileRef.current?.click()
  const onImportFile = async (file: File) => {
    const text = await file.text()
    const imported = importJson(text)
    if (imported.length === 0) return
    persist([...imported, ...entries])
  }

  const filtered = filter
    ? entries.filter((e) =>
        (e.source + ' ' + e.target + ' ' + (e.note ?? ''))
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : entries

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="close glossary" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-xl dark:bg-gray-900">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-900 dark:text-gray-100">
            <BookMarked className="h-4 w-4" />
            {t('glossary.heading')}
            <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {entries.length}
            </span>
            {active.length > 0 && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                {t('glossary.activeBadge', { n: active.length })}
              </span>
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

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3 text-xs dark:border-gray-700">
          <Input
            placeholder={t('glossary.searchPlaceholder') ?? 'Search…'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            spellCheck={false}
            size="sm"
          />
          <span className="flex-1" />
          <Button type="button" variant="ghost" onClick={onAdd}>
            <span className="inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t('glossary.add')}
            </span>
          </Button>
          <Button type="button" variant="ghost" onClick={onImportClick}>
            <span className="inline-flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {t('glossary.import')}
            </span>
          </Button>
          <Button type="button" variant="ghost" onClick={onExport} disabled={entries.length === 0}>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              {t('glossary.export')}
            </span>
          </Button>
          <Button type="button" variant="ghost" onClick={onClear} disabled={entries.length === 0}>
            <span className="inline-flex items-center gap-1.5">
              <Eraser className="h-3.5 w-3.5" />
              {t('glossary.clearAll')}
            </span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImportFile(f)
              if (fileRef.current) fileRef.current.value = ''
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {entries.length === 0 ? t('glossary.empty') : t('glossary.emptySearch')}
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((e) => {
                const isActive = active.some((a) => a.id === e.id)
                return (
                  <li
                    key={e.id}
                    className={[
                      'rounded-lg border p-3 transition',
                      isActive
                        ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-900/10'
                        : 'border-gray-200 dark:border-gray-700',
                    ].join(' ')}
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('glossary.source')}
                        </span>
                        <Input
                          value={e.source}
                          onChange={(ev) => onPatch(e.id, { source: ev.target.value })}
                          size="sm"
                          spellCheck={false}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('glossary.target')}
                        </span>
                        <Input
                          value={e.target}
                          onChange={(ev) => onPatch(e.id, { target: ev.target.value })}
                          size="sm"
                          spellCheck={false}
                        />
                      </label>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <label className="inline-flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">{t('glossary.langPair')}:</span>
                        <select
                          value={e.langPair?.source ?? ANY}
                          onChange={(ev) => {
                            const v = ev.target.value
                            if (v === ANY) onPatch(e.id, { langPair: undefined })
                            else onPatch(e.id, {
                              langPair: { source: v as LangCode, target: e.langPair?.target ?? 'en' },
                            })
                          }}
                          className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value={ANY}>{t('glossary.anyLang')}</option>
                          {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                            <option key={l.code} value={l.code}>{t(l.i18nKey)}</option>
                          ))}
                        </select>
                        <span className="text-gray-500">→</span>
                        <select
                          value={e.langPair?.target ?? ANY}
                          disabled={!e.langPair}
                          onChange={(ev) => {
                            const v = ev.target.value
                            if (v === ANY) onPatch(e.id, { langPair: undefined })
                            else if (e.langPair) {
                              onPatch(e.id, { langPair: { source: e.langPair.source, target: v as LangCode } })
                            }
                          }}
                          className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value={ANY}>{t('glossary.anyLang')}</option>
                          {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                            <option key={l.code} value={l.code}>{t(l.i18nKey)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={e.caseSensitive ?? false}
                          onChange={(ev) => onPatch(e.id, { caseSensitive: ev.target.checked })}
                        />
                        <span className="text-gray-500 dark:text-gray-400">{t('glossary.caseSensitive')}</span>
                      </label>
                      <span className="flex-1" />
                      <button
                        type="button"
                        onClick={() => onRemoveOne(e.id)}
                        title={t('glossary.delete')}
                        className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 text-right dark:border-gray-700">
          <Button onClick={onClose}>{t('glossary.done')}</Button>
        </footer>
      </div>
    </div>
  )
}

export default GlossaryDrawer
