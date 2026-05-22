import React, { useCallback, useMemo, useState } from 'react'
import {
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  addCol,
  addRow,
  emptyTable,
  fromCsv,
  fromJson,
  fromMarkdown,
  moveCol,
  moveRow,
  removeCol,
  removeRow,
  sampleTable,
  setAlignment,
  setCell,
  setHeader,
  toCsv,
  toJson,
  toMarkdown,
  type Alignment,
  type TableData,
} from './tableUtils'

const NAMESPACE = 'toolMdTableGen'

type ImportFormat = 'csv' | 'tsv' | 'json' | 'md'
type ExportFormat = 'md' | 'csv' | 'tsv' | 'json'

interface PersistedState {
  table: TableData
  exportFormat: ExportFormat
}

const DEFAULT_STATE: PersistedState = {
  table: sampleTable(),
  exportFormat: 'md',
}

const MdTableGen: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'md-table-gen',
    'state',
    DEFAULT_STATE,
  )

  const [importOpen, setImportOpen] = useState(false)
  const [importFormat, setImportFormat] = useState<ImportFormat>('csv')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [copied, setCopied] = useState(false)

  const updateTable = useCallback(
    (next: TableData) => {
      void save({ ...data, table: next })
    },
    [data, save],
  )

  const output = useMemo(() => {
    const td = data.table
    switch (data.exportFormat) {
      case 'md':
        return toMarkdown(td)
      case 'csv':
        return toCsv(td, ',')
      case 'tsv':
        return toCsv(td, '\t')
      case 'json':
        return toJson(td)
    }
  }, [data])

  const doImport = () => {
    setImportError('')
    let result: TableData | null = null
    if (importFormat === 'md') result = fromMarkdown(importText)
    else if (importFormat === 'json') result = fromJson(importText)
    else if (importFormat === 'csv') result = fromCsv(importText, ',')
    else if (importFormat === 'tsv') result = fromCsv(importText, '\t')
    if (!result) {
      setImportError(t('import.error'))
      return
    }
    updateTable(result)
    setImportText('')
    setImportOpen(false)
  }

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
    const ext = data.exportFormat === 'md' ? 'md' : data.exportFormat
    const mime =
      data.exportFormat === 'json'
        ? 'application/json'
        : data.exportFormat === 'csv'
          ? 'text/csv'
          : 'text/plain'
    const blob = new Blob([output], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `table-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  const { table } = data

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* 操作栏 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateTable(addRow(table))}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('action.addRow')}
          </button>
          <button
            type="button"
            onClick={() => updateTable(addCol(table))}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('action.addCol')}
          </button>
          <button
            type="button"
            onClick={() => setImportOpen((v) => !v)}
            className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> {t('action.import')}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${importOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => updateTable(sampleTable())}
            className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> {t('action.sample')}
          </button>
          <button
            type="button"
            onClick={() => updateTable(emptyTable())}
            className="ml-auto px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> {t('action.clear')}
          </button>
        </div>

        {importOpen && (
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">{t('import.format')}:</span>
              {(['csv', 'tsv', 'json', 'md'] as ImportFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setImportFormat(f)}
                  className={`px-2 py-0.5 text-xs rounded-full border ${
                    importFormat === f
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError('')
              }}
              placeholder={t(`import.placeholder_${importFormat}`)}
              className="w-full h-32 px-3 py-2 text-xs border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              spellCheck={false}
            />
            {importError && <p className="text-xs text-red-600">{importError}</p>}
            <button
              type="button"
              onClick={doImport}
              disabled={!importText.trim()}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1.5"
            >
              {t('import.confirm')}
            </button>
          </div>
        )}
      </section>

      {/* 可视编辑器 */}
      <section className="rounded-lg border border-gray-200 bg-white p-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="w-8" />
              {table.headers.map((h, ci) => (
                <th key={ci} className="border border-gray-200 p-1 bg-gray-50 align-top min-w-[140px]">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateTable(setHeader(table, ci, e.target.value))}
                      className="w-full px-2 py-1 text-sm font-semibold bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-1">
                      <AlignButton
                        active={table.alignment[ci] === 'left'}
                        onClick={() => updateTable(setAlignment(table, ci, 'left'))}
                        icon={<AlignLeft className="w-3 h-3" />}
                      />
                      <AlignButton
                        active={table.alignment[ci] === 'center'}
                        onClick={() => updateTable(setAlignment(table, ci, 'center'))}
                        icon={<AlignCenter className="w-3 h-3" />}
                      />
                      <AlignButton
                        active={table.alignment[ci] === 'right'}
                        onClick={() => updateTable(setAlignment(table, ci, 'right'))}
                        icon={<AlignRight className="w-3 h-3" />}
                      />
                      <button
                        type="button"
                        onClick={() => updateTable(moveCol(table, ci, -1))}
                        disabled={ci === 0}
                        className="ml-auto p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title={t('action.colLeft')}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTable(moveCol(table, ci, 1))}
                        disabled={ci === table.headers.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title={t('action.colRight')}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTable(removeCol(table, ci))}
                        disabled={table.headers.length <= 1}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                        title={t('action.removeCol')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                <td className="border border-gray-200 p-1 bg-gray-50 text-center align-middle">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => updateTable(moveRow(table, ri, -1))}
                      disabled={ri === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title={t('action.rowUp')}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTable(moveRow(table, ri, 1))}
                      disabled={ri === table.rows.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title={t('action.rowDown')}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTable(removeRow(table, ri))}
                      disabled={table.rows.length <= 1}
                      className="p-0.5 text-gray-400 hover:text-red-500 disabled:opacity-30"
                      title={t('action.removeRow')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-gray-200 p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateTable(setCell(table, ri, ci, e.target.value))}
                      className={`w-full px-2 py-1.5 text-sm bg-white border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 ${
                        table.alignment[ci] === 'center'
                          ? 'text-center'
                          : table.alignment[ci] === 'right'
                            ? 'text-right'
                            : 'text-left'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-gray-400">
          {t('editor.stats', { rows: table.rows.length, cols: table.headers.length })}
        </div>
      </section>

      {/* 输出 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{t('output.title')}</span>
            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
              {(['md', 'csv', 'tsv', 'json'] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => save({ ...data, exportFormat: f })}
                  className={`px-2 py-1 text-xs ${
                    data.exportFormat === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
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
          className="w-full h-64 px-3 py-2 text-xs border border-gray-300 rounded-md font-mono bg-gray-50 resize-none"
          spellCheck={false}
        />
      </section>
    </div>
  )
}

const AlignButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({
  active,
  onClick,
  icon,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1 rounded ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
    }`}
  >
    {icon}
  </button>
)

export default MdTableGen
