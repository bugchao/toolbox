import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  LineChart as LineChartIcon,
  Plus,
  RefreshCw,
  Upload,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Card,
  CartesianGrid,
  ChartContainer,
  FadeIn,
  Line,
  LineChart,
  PageHero,
  StaggerChildren,
  Tooltip,
  XAxis,
  YAxis,
} from '@toolbox/ui-kit'
import {
  detectDelimiter,
  parseDelimitedText,
  stringifyDelimited,
  tableToJsonRecords,
  tableToMarkdown,
} from '../utils/dataTransform'

const SAMPLE_ROWS = [
  ['Month', 'Revenue', 'Users', 'Region'],
  ['Jan', '120000', '860', 'Shanghai'],
  ['Feb', '145000', '920', 'Beijing'],
  ['Mar', '162000', '980', 'Shenzhen'],
  ['Apr', '171000', '1040', 'Hangzhou'],
  ['May', '193000', '1180', 'Chengdu'],
]

type ExportFormat = 'csv' | 'tsv' | 'markdown' | 'json'
type ChartKind = 'bar' | 'line'

const SheetEditor: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<string[][]>(SAMPLE_ROWS)
  const [importText, setImportText] = useState(stringifyDelimited(SAMPLE_ROWS))
  const [search, setSearch] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [chartType, setChartType] = useState<ChartKind>('bar')
  const [labelColumn, setLabelColumn] = useState(0)
  const [valueColumn, setValueColumn] = useState(1)
  const [status, setStatus] = useState('支持 CSV / TSV 文件与从 Excel 直接复制粘贴')

  const header = rows[0] ?? []
  const bodyRows = rows.slice(1)

  const filteredRows = useMemo(() => {
    if (!search.trim()) return bodyRows
    const keyword = search.toLowerCase()
    return bodyRows.filter((row) => row.some((cell) => cell.toLowerCase().includes(keyword)))
  }, [bodyRows, search])

  const exportText = useMemo(() => {
    const filteredTable = [header, ...filteredRows]
    if (exportFormat === 'tsv') return stringifyDelimited(filteredTable, '\t')
    if (exportFormat === 'markdown') return tableToMarkdown(filteredTable)
    if (exportFormat === 'json') return JSON.stringify(tableToJsonRecords(filteredTable), null, 2)
    return stringifyDelimited(filteredTable, ',')
  }, [exportFormat, filteredRows, header])

  const chartData = useMemo(() => {
    return filteredRows
      .map((row) => ({
        label: row[labelColumn] || `Row ${row}`,
        value: Number(row[valueColumn]),
      }))
      .filter((item) => Number.isFinite(item.value))
  }, [filteredRows, labelColumn, valueColumn])

  const importTable = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      setStatus('请输入 CSV / TSV 内容后再导入')
      return
    }

    const delimiter = detectDelimiter(trimmed)
    const parsedRows = parseDelimitedText(trimmed, delimiter)
    const width = Math.max(...parsedRows.map((row) => row.length))
    const normalizedRows = parsedRows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''))
    setRows(normalizedRows)
    setImportText(trimmed)
    setLabelColumn(0)
    setValueColumn(Math.min(1, Math.max(0, width - 1)))
    setStatus(`已导入 ${normalizedRows.length - 1} 行数据，分隔符为 ${delimiter === '\t' ? 'Tab' : delimiter}`)
  }

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    setRows((currentRows) =>
      currentRows.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentCellIndex) => (currentCellIndex === cellIndex ? value : cell))
          : row
      )
    )
  }

  const addRow = () => {
    setRows((currentRows) => {
      const columnCount = currentRows[0]?.length || 4
      return [...currentRows, Array.from({ length: columnCount }, () => '')]
    })
  }

  const addColumn = () => {
    setRows((currentRows) =>
      currentRows.map((row, rowIndex) => [...row, rowIndex === 0 ? `Column ${row.length + 1}` : ''])
    )
  }

  const loadSample = () => {
    setRows(SAMPLE_ROWS)
    setImportText(stringifyDelimited(SAMPLE_ROWS))
    setSearch('')
    setLabelColumn(0)
    setValueColumn(1)
    setStatus('已加载示例销售表，可继续编辑、筛选或导出')
  }

  const downloadExport = () => {
    const mimeType =
      exportFormat === 'json'
        ? 'application/json'
        : exportFormat === 'markdown'
          ? 'text/markdown'
          : 'text/plain'
    const extension =
      exportFormat === 'csv' ? 'csv' : exportFormat === 'tsv' ? 'tsv' : exportFormat === 'markdown' ? 'md' : 'json'
    const blob = new Blob([exportText], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sheet-export.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setStatus('当前 MVP 支持 CSV / TSV / TXT 文件，Excel 请直接复制表格内容粘贴进来')
      return
    }

    const text = await file.text()
    importTable(text)
    event.target.value = ''
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHero title={t('tools.sheet_editor')} description={tHome('toolDesc.sheet_editor')} className="mb-4" />

      <FadeIn>
        <Card className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">导入与编辑</h2>
              </div>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="粘贴 CSV / TSV，或直接从 Excel 复制多行单元格内容"
                className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-white/90 p-4 font-mono text-sm text-slate-800 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => importTable(importText)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  导入表格
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Upload className="w-4 h-4" />
                  上传文件
                </button>
                <button
                  type="button"
                  onClick={loadSample}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  加载示例
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300">{status}</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-white/90 dark:bg-slate-900/70" padded>
                  <div className="text-sm text-slate-500 dark:text-slate-400">总行数</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{rows.length - 1}</div>
                </Card>
                <Card className="bg-white/90 dark:bg-slate-900/70" padded>
                  <div className="text-sm text-slate-500 dark:text-slate-400">列数</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{header.length}</div>
                </Card>
                <Card className="bg-white/90 dark:bg-slate-900/70" padded>
                  <div className="text-sm text-slate-500 dark:text-slate-400">筛选后</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{filteredRows.length}</div>
                </Card>
              </div>

              <Card className="bg-slate-950 text-slate-50 dark:bg-slate-900" padded>
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <Filter className="w-4 h-4" />
                  在线筛选与格式转换
                </div>
                <div className="mt-4 space-y-3">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索任意单元格内容"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                  />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select
                      value={exportFormat}
                      onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                    >
                      <option value="csv">导出 CSV</option>
                      <option value="tsv">导出 TSV</option>
                      <option value="markdown">导出 Markdown</option>
                      <option value="json">导出 JSON</option>
                    </select>
                    <button
                      type="button"
                      onClick={downloadExport}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </FadeIn>

      <StaggerChildren className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">在线表格</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">支持直接修改单元格、追加行列，适合快速清洗与整理数据。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-100"
              >
                <Plus className="w-4 h-4" />
                新增行
              </button>
              <button
                type="button"
                onClick={addColumn}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-100"
              >
                <Plus className="w-4 h-4" />
                新增列
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {header.map((cell, cellIndex) => (
                    <th key={`header-${cellIndex}`} className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
                      <input
                        value={cell}
                        onChange={(event) => handleCellChange(0, cellIndex, event.target.value)}
                        className="w-full rounded-md bg-transparent outline-none"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => {
                  const sourceIndex = bodyRows.indexOf(row) + 1
                  return (
                    <tr key={`row-${sourceIndex}`} className="even:bg-slate-50/70 dark:even:bg-slate-900/40">
                      {header.map((_, cellIndex) => (
                        <td key={`cell-${sourceIndex}-${cellIndex}`} className="border-t border-slate-200 px-3 py-2 align-top dark:border-slate-700">
                          <input
                            value={row[cellIndex] ?? ''}
                            onChange={(event) => handleCellChange(sourceIndex, cellIndex, event.target.value)}
                            className="w-full rounded-md bg-transparent py-1 text-sm text-slate-700 outline-none transition focus:bg-indigo-50 dark:text-slate-100 dark:focus:bg-slate-800"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <Card>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
              {chartType === 'bar' ? <BarChart3 className="w-5 h-5 text-indigo-500" /> : <LineChartIcon className="w-5 h-5 text-indigo-500" />}
              <h2 className="text-xl font-semibold">图表预览</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <select
                value={chartType}
                onChange={(event) => setChartType(event.target.value as ChartKind)}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="bar">柱状图</option>
                <option value="line">折线图</option>
              </select>
              <select
                value={labelColumn}
                onChange={(event) => setLabelColumn(Number(event.target.value))}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {header.map((cell, index) => (
                  <option key={`label-${cell}-${index}`} value={index}>
                    标签列: {cell || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
              <select
                value={valueColumn}
                onChange={(event) => setValueColumn(Number(event.target.value))}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {header.map((cell, index) => (
                  <option key={`value-${cell}-${index}`} value={index}>
                    数值列: {cell || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 h-[260px]">
              <ChartContainer height={260}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="label" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="label" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ChartContainer>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">格式转换结果</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">当前基于筛选后的结果导出，适合把清洗后的数据直接投给接口、Markdown 文档或脚本。</p>
            <textarea
              readOnly
              value={exportText}
              className="mt-4 min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-emerald-300 outline-none dark:border-slate-700"
            />
          </Card>
        </div>
      </StaggerChildren>
    </div>
  )
}

export default SheetEditor
