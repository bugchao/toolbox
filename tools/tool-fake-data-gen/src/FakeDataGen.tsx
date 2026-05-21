import React, { useCallback, useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Play,
  Sparkles,
  GripVertical,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  FIELD_TYPES,
  PRESETS,
  formatOutput,
  generateRows,
  type FieldType,
  type OutputFormat,
  type SchemaField,
  type FieldConfig,
} from './generators'

const NAMESPACE = 'toolFakeDataGen'

interface PersistedState {
  fields: SchemaField[]
  count: number
  format: OutputFormat
  tableName: string
}

const DEFAULT_STATE: PersistedState = {
  fields: PRESETS[0].fields.map((f, i) => ({ ...f, id: `f-${i}` })),
  count: 10,
  format: 'json',
  tableName: 'users',
}

const FORMATS: { id: OutputFormat; label: string }[] = [
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
  { id: 'sql', label: 'SQL Insert' },
  { id: 'ts', label: 'TypeScript' },
]

const FieldTypeGroups: { group: string; labelZh: string; labelEn: string }[] = [
  { group: 'id', labelZh: 'ID', labelEn: 'ID' },
  { group: 'person', labelZh: '个人信息', labelEn: 'Person' },
  { group: 'address', labelZh: '地址', labelEn: 'Address' },
  { group: 'company', labelZh: '公司', labelEn: 'Company' },
  { group: 'web', labelZh: '网络', labelEn: 'Web' },
  { group: 'finance', labelZh: '金融', labelEn: 'Finance' },
  { group: 'numeric', labelZh: '数值', labelEn: 'Numeric' },
  { group: 'text', labelZh: '文本', labelEn: 'Text' },
  { group: 'time', labelZh: '时间', labelEn: 'Time' },
  { group: 'custom', labelZh: '自定义', labelEn: 'Custom' },
]

const FakeDataGen: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  const { data, save, loading } = useToolStorage<PersistedState>(
    'fake-data-gen',
    'state',
    DEFAULT_STATE,
  )

  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  const updateFields = useCallback(
    (next: SchemaField[]) => {
      void save({ ...data, fields: next })
    },
    [data, save],
  )

  const addField = () => {
    const next: SchemaField = {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `field_${data.fields.length + 1}`,
      type: 'word',
    }
    updateFields([...data.fields, next])
  }

  const removeField = (id: string) => {
    updateFields(data.fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, patch: Partial<SchemaField>) => {
    updateFields(data.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const moveField = (id: string, direction: -1 | 1) => {
    const idx = data.fields.findIndex((f) => f.id === id)
    if (idx < 0) return
    const target = idx + direction
    if (target < 0 || target >= data.fields.length) return
    const next = [...data.fields]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    updateFields(next)
  }

  const applyPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId)
    if (!p) return
    const fields: SchemaField[] = p.fields.map((f, i) => ({
      ...f,
      id: `f-preset-${presetId}-${i}-${Date.now()}`,
    }))
    void save({ ...data, fields, tableName: p.id + 's' })
  }

  const onGenerate = useCallback(() => {
    if (data.fields.length === 0) return
    setGenerating(true)
    // 用 setTimeout 让 UI 有机会显示 loading 状态，再做 CPU 密集生成
    setTimeout(() => {
      try {
        const rows = generateRows(data.fields, Math.max(1, Math.min(10000, data.count)))
        const text = formatOutput(rows, data.fields, data.format, data.tableName)
        setOutput(text)
      } finally {
        setGenerating(false)
      }
    }, 0)
  }, [data])

  const copyOutput = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  const downloadOutput = () => {
    const ext =
      data.format === 'json' ? 'json' : data.format === 'csv' ? 'csv' : data.format === 'sql' ? 'sql' : 'ts'
    const blob = new Blob([output], {
      type:
        data.format === 'json'
          ? 'application/json'
          : data.format === 'csv'
            ? 'text/csv'
            : 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fake-data-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const grouped = useMemo(() => {
    const m: Record<string, typeof FIELD_TYPES> = {}
    for (const t of FIELD_TYPES) {
      if (!m[t.group]) m[t.group] = []
      m[t.group].push(t)
    }
    return m
  }, [])

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* 顶部控制 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">{t('control.count')}:</span>
            <input
              type="number"
              min={1}
              max={10000}
              value={data.count}
              onChange={(e) =>
                save({ ...data, count: Math.max(1, Math.min(10000, Number(e.target.value) || 1)) })
              }
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">{t('control.format')}:</span>
            <select
              value={data.format}
              onChange={(e) => save({ ...data, format: e.target.value as OutputFormat })}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          {data.format === 'sql' && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">{t('control.table')}:</span>
              <input
                type="text"
                value={data.tableName}
                onChange={(e) => save({ ...data, tableName: e.target.value })}
                className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          )}
        </div>

        {/* 预设模板 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t('control.preset')}:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 transition-colors"
            >
              {isZh ? p.zh : p.en}
            </button>
          ))}
        </div>
      </section>

      {/* Schema 编辑 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-800">{t('schema.title')} ({data.fields.length})</h3>
          <button
            type="button"
            onClick={addField}
            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> {t('schema.addField')}
          </button>
        </div>
        {data.fields.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">{t('schema.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {data.fields.map((f, idx) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 p-2 bg-gray-50"
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveField(f.id, -1)}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none"
                  >
                    ▲
                  </button>
                  <GripVertical className="w-3 h-3 text-gray-300" />
                  <button
                    type="button"
                    onClick={() => moveField(f.id, 1)}
                    disabled={idx === data.fields.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none"
                  >
                    ▼
                  </button>
                </div>
                <input
                  type="text"
                  value={f.name}
                  onChange={(e) => updateField(f.id, { name: e.target.value })}
                  placeholder={t('schema.fieldName')}
                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={f.type}
                  onChange={(e) => updateField(f.id, { type: e.target.value as FieldType, config: undefined })}
                  className="flex-1 min-w-[180px] px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FieldTypeGroups.map((g) => (
                    <optgroup key={g.group} label={isZh ? g.labelZh : g.labelEn}>
                      {(grouped[g.group] ?? []).map((tp) => (
                        <option key={tp.id} value={tp.id}>
                          {isZh ? tp.zh : tp.en}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* type-specific config */}
                <FieldConfigEditor
                  field={f}
                  onChange={(cfg) => updateField(f.id, { config: cfg })}
                  t={t}
                />

                <button
                  type="button"
                  onClick={() => removeField(f.id)}
                  className="text-gray-400 hover:text-red-500"
                  title={t('schema.removeField')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 输出区 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{t('output.title')}</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={copyOutput}
              disabled={!output}
              className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? t('output.copied') : t('output.copy')}
            </button>
            <button
              type="button"
              onClick={downloadOutput}
              disabled={!output}
              className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> {t('output.download')}
            </button>
          </div>
        </div>
        <textarea
          value={output}
          readOnly
          placeholder={t('output.placeholder')}
          className="w-full h-80 px-3 py-2 text-xs border border-gray-300 rounded-md font-mono bg-gray-50 resize-none"
          spellCheck={false}
        />
      </section>

      <div className="sticky bottom-4 z-10 flex justify-center pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={data.fields.length === 0 || generating}
          className="w-full max-w-md px-6 py-3 text-base font-medium bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Play className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
          {generating ? t('control.generating') : t('control.generate', { count: data.count })}
        </button>
      </div>
    </div>
  )
}

interface FieldConfigEditorProps {
  field: SchemaField
  onChange: (cfg: FieldConfig | undefined) => void
  t: (k: string, opts?: Record<string, unknown>) => string
}
const FieldConfigEditor: React.FC<FieldConfigEditorProps> = ({ field, onChange, t }) => {
  const c = field.config ?? {}
  const numCls =
    'w-16 px-1.5 py-0.5 text-xs border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500'
  if (
    field.type === 'integer' ||
    field.type === 'amount' ||
    field.type === 'float' ||
    field.type === 'age'
  ) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <span>min</span>
        <input
          type="number"
          value={c.min ?? ''}
          onChange={(e) =>
            onChange({ ...c, min: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          className={numCls}
        />
        <span>max</span>
        <input
          type="number"
          value={c.max ?? ''}
          onChange={(e) =>
            onChange({ ...c, max: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          className={numCls}
        />
        {(field.type === 'amount' || field.type === 'float') && (
          <>
            <span>.</span>
            <input
              type="number"
              min={0}
              max={6}
              value={c.precision ?? ''}
              onChange={(e) =>
                onChange({
                  ...c,
                  precision: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className={`${numCls} w-10`}
            />
          </>
        )}
      </div>
    )
  }
  if (field.type === 'date_past' || field.type === 'date_future' || field.type === 'timestamp') {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <span>{t('config.daysRange')}</span>
        <input
          type="number"
          min={1}
          value={c.days ?? ''}
          placeholder="365"
          onChange={(e) =>
            onChange({ ...c, days: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          className={numCls}
        />
      </div>
    )
  }
  if (field.type === 'enum') {
    return (
      <input
        type="text"
        value={(c.options ?? []).join(', ')}
        onChange={(e) =>
          onChange({
            ...c,
            options: e.target.value
              .split(/[,，]/)
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        placeholder={t('config.enumPlaceholder')}
        className="flex-1 min-w-[140px] px-2 py-1 text-xs border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    )
  }
  if (field.type === 'static') {
    return (
      <input
        type="text"
        value={c.value ?? ''}
        onChange={(e) => onChange({ ...c, value: e.target.value })}
        placeholder={t('config.staticPlaceholder')}
        className="flex-1 min-w-[140px] px-2 py-1 text-xs border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    )
  }
  return null
}

export default FakeDataGen
