import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  Switch,
} from '@toolbox/ui-kit'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eraser,
  Info,
  Link2,
  Plus,
  SortAsc,
  Trash2,
} from 'lucide-react'

import {
  nextParamId,
  parseUrl,
  type ParamRow,
  type ParsedUrlOk,
} from './lib/parse'
import { assembleUrl } from './lib/assemble'

const SAMPLE_URL =
  'https://search.example.com/items?q=hello+world&tag=a&tag=b&page=2&debug#results'

interface BaseState {
  protocol: string
  host: string
  pathname: string
  hash: string
}

const EMPTY_BASE: BaseState = {
  protocol: 'https',
  host: '',
  pathname: '/',
  hash: '',
}

const UrlQuery: React.FC = () => {
  const { t } = useTranslation('toolUrlQuery')

  const [rawInput, setRawInput] = useState<string>(SAMPLE_URL)
  const [base, setBase] = useState<BaseState>(EMPTY_BASE)
  const [params, setParams] = useState<ParamRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const [keepDup, setKeepDup] = useState(true)
  const [showBare, setShowBare] = useState(false)
  const [copied, setCopied] = useState(false)

  /**
   * 用 ref 跟踪「最近一次重组写入的字符串」，避免我们写到 input 后又把它当成
   * 用户输入再解析一遍 → 无限循环。
   */
  const lastAssembledRef = useRef<string | null>(null)

  // 用户改 input → 解析
  useEffect(() => {
    if (lastAssembledRef.current !== null && rawInput === lastAssembledRef.current) {
      // 这次变更是我们自己拼回去的，不要重新解析覆盖状态
      lastAssembledRef.current = null
      return
    }
    const parsed = parseUrl(rawInput)
    if (parsed.ok) {
      const p = parsed as ParsedUrlOk
      setBase({
        protocol: p.base.protocol || 'https',
        host: p.base.host,
        pathname: p.base.pathname,
        hash: p.hash,
      })
      setParams(p.params)
      setParseError(null)
    } else {
      setParseError(parsed.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawInput])

  // 任何结构化字段变化 → 重组 URL
  const outputUrl = useMemo(() => {
    let effectiveParams = params
    if (!keepDup) {
      const seen = new Set<string>()
      const dedup: ParamRow[] = []
      for (const p of params) {
        if (seen.has(p.key)) continue
        seen.add(p.key)
        dedup.push(p)
      }
      effectiveParams = dedup
    }
    return assembleUrl(
      {
        base: {
          protocol: base.protocol,
          host: base.host,
          pathname: base.pathname,
        },
        params: effectiveParams,
        hash: base.hash,
      },
      { showBareKeys: showBare }
    )
  }, [base, params, keepDup, showBare])

  // 结构化字段变化 → 写回 input（避免触发再解析）
  useEffect(() => {
    if (parseError) return
    if (outputUrl === rawInput) return
    lastAssembledRef.current = outputUrl
    setRawInput(outputUrl)
  }, [outputUrl, rawInput, parseError])

  // ───────── 行级编辑 ─────────
  const updateRow = useCallback((id: string, patch: Partial<ParamRow>) => {
    setParams((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const removeRow = useCallback((id: string) => {
    setParams((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const moveRow = useCallback((id: string, dir: -1 | 1) => {
    setParams((prev) => {
      const idx = prev.findIndex((r) => r.id === id)
      if (idx === -1) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = prev.slice()
      const [item] = next.splice(idx, 1)
      next.splice(target, 0, item)
      return next
    })
  }, [])

  const addRow = useCallback(() => {
    setParams((prev) => [
      ...prev,
      { id: nextParamId(), key: '', value: '', wasBare: false },
    ])
  }, [])

  const sortRows = useCallback(() => {
    setParams((prev) => prev.slice().sort((a, b) => a.key.localeCompare(b.key)))
  }, [])

  const encodeAllValues = useCallback(() => {
    setParams((prev) =>
      prev.map((r) => {
        try {
          return { ...r, value: encodeURIComponent(r.value) }
        } catch {
          return r
        }
      })
    )
  }, [])

  const decodeAllValues = useCallback(() => {
    setParams((prev) =>
      prev.map((r) => {
        try {
          return { ...r, value: decodeURIComponent(r.value) }
        } catch {
          return r
        }
      })
    )
  }, [])

  const clearQuery = useCallback(() => {
    setParams([])
  }, [])

  const loadSample = useCallback(() => {
    setRawInput(SAMPLE_URL)
  }, [])

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }, [outputUrl])

  // ───────── render ─────────
  const chip = (label: string, value: string) => (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
      <span className="font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <span className="break-all font-mono">{value || '—'}</span>
    </span>
  )

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6 px-2 sm:px-4">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          icon={Info}
          title={t('notice.title')}
          description={t('notice.description')}
        />

        <Card>
          <div className="space-y-5">
            {/* URL 输入 */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200">
                <span className="inline-flex items-center gap-1.5">
                  <Link2 className="h-4 w-4" />
                  {t('input.label')}
                </span>
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  {t('input.sample')}
                </Button>
              </label>
              <Input
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={t('input.placeholder')}
                error={Boolean(parseError)}
                className="font-mono text-sm"
              />
              {parseError ? (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {t('parsed.invalid')}: {parseError}
                </p>
              ) : null}
            </div>

            {/* 解析展示 */}
            <div className="flex flex-wrap gap-2">
              {chip(t('parsed.protocol'), base.protocol)}
              {chip(t('parsed.host'), base.host)}
              {chip(t('parsed.path'), base.pathname)}
              {chip(t('parsed.hash'), base.hash)}
            </div>

            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mr-auto text-sm font-semibold text-gray-800 dark:text-gray-100">
                {t('params.title')}
              </h3>
              <Button variant="ghost" size="sm" onClick={sortRows}>
                <span className="inline-flex items-center gap-1.5">
                  <SortAsc className="h-4 w-4" />
                  {t('actions.sort')}
                </span>
              </Button>
              <Button variant="ghost" size="sm" onClick={encodeAllValues}>
                {t('actions.encodeAll')}
              </Button>
              <Button variant="ghost" size="sm" onClick={decodeAllValues}>
                {t('actions.decodeAll')}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearQuery}>
                <span className="inline-flex items-center gap-1.5">
                  <Eraser className="h-4 w-4" />
                  {t('actions.clear')}
                </span>
              </Button>
            </div>

            {/* 参数表 */}
            <div className="max-h-[420px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-medium" style={{ width: '32%' }}>
                      {t('params.col.key')}
                    </th>
                    <th className="px-3 py-2 font-medium">{t('params.col.value')}</th>
                    <th className="px-3 py-2 font-medium" style={{ width: 120 }}>
                      {t('params.col.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {params.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {t('params.empty')}
                      </td>
                    </tr>
                  ) : (
                    params.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                      >
                        <td className="px-3 py-2 align-top">
                          <Input
                            size="sm"
                            value={row.key}
                            onChange={(e) => updateRow(row.id, { key: e.target.value })}
                            className="font-mono"
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Input
                            size="sm"
                            value={row.value}
                            onChange={(e) =>
                              updateRow(row.id, {
                                value: e.target.value,
                                wasBare:
                                  e.target.value.length === 0 ? row.wasBare : false,
                              })
                            }
                            className="font-mono"
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={t('params.moveUp')}
                              onClick={() => moveRow(row.id, -1)}
                              disabled={idx === 0}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={t('params.moveDown')}
                              onClick={() => moveRow(row.id, 1)}
                              disabled={idx === params.length - 1}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={t('params.remove')}
                              onClick={() => removeRow(row.id)}
                              className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <Button variant="secondary" size="sm" onClick={addRow}>
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t('params.add')}
                </span>
              </Button>
            </div>

            {/* 选项 */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Switch
                checked={keepDup}
                onChange={setKeepDup}
                label={t('options.keepDup')}
              />
              <Switch
                checked={showBare}
                onChange={setShowBare}
                label={t('options.showBare')}
              />
            </div>

            {/* 输出 */}
            <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('output.label')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('output.length', { count: outputUrl.length })}
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyOutput}>
                    <span className="inline-flex items-center gap-1.5">
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? t('output.copied') : t('output.copy')}
                    </span>
                  </Button>
                </div>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 font-mono text-xs leading-6 text-gray-800 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100">
                {outputUrl || ' '}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default UrlQuery
