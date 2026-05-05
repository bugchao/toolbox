import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileJson, Upload, Copy, Download, Check } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Delimiter = ',' | ';' | '\t' | 'custom'

function detectDelimiter(text: string): ',' | ';' | '\t' {
  const firstLine = text.split('\n')[0] || ''
  const commas = (firstLine.match(/,/g) || []).length
  const semicolons = (firstLine.match(/;/g) || []).length
  const tabs = (firstLine.match(/\t/g) || []).length
  
  if (tabs > commas && tabs > semicolons) return '\t'
  if (semicolons > commas) return ';'
  return ','
}

function parseCSV(text: string, delimiter: string, hasHeader: boolean): any[] {
  const lines = text.trim().split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const rows = lines.map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  })
  
  if (hasHeader && rows.length > 1) {
    const headers = rows[0]
    return rows.slice(1).map(row => {
      const obj: any = {}
      headers.forEach((header, i) => {
        obj[header] = row[i] || ''
      })
      return obj
    })
  } else {
    return rows.map(row => {
      const obj: any = {}
      row.forEach((value, i) => {
        obj[`column_${i + 1}`] = value
      })
      return obj
    })
  }
}

export default function CsvToJson() {
  const { t } = useTranslation('toolCsvToJson')
  const [csvText, setCsvText] = useState('')
  const [delimiterType, setDelimiterType] = useState<Delimiter>(',')
  const [customDelimiter, setCustomDelimiter] = useState('|')
  const [hasHeader, setHasHeader] = useState(true)
  const [prettify, setPrettify] = useState(true)
  const [copied, setCopied] = useState(false)

  const actualDelimiter = useMemo(() => {
    if (delimiterType === 'custom') return customDelimiter
    if (delimiterType === '\t') return '\t'
    return delimiterType
  }, [delimiterType, customDelimiter])

  const jsonResult = useMemo(() => {
    if (!csvText.trim()) return ''
    try {
      const data = parseCSV(csvText, actualDelimiter, hasHeader)
      return prettify ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : 'Parse failed'}`
    }
  }, [csvText, actualDelimiter, hasHeader, prettify])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvText(text)
      const detected = detectDelimiter(text)
      setDelimiterType(detected)
    }
    reader.readAsText(file)
  }

  const handleCopy = async () => {
    if (!jsonResult) return
    await navigator.clipboard.writeText(jsonResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!jsonResult) return
    const blob = new Blob([jsonResult], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={FileJson} />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        
        {/* 配置区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">{t('delimiter')}</label>
              <div className="flex gap-2">
                {[',', ';', '\t', 'custom'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDelimiterType(d as Delimiter)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      delimiterType === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {d === '\t' ? 'Tab' : d === 'custom' ? t('custom') : d}
                  </button>
                ))}
              </div>
              {delimiterType === 'custom' && (
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={e => setCustomDelimiter(e.target.value)}
                  placeholder="|"
                  maxLength={1}
                  className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-2 block">{t('options')}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setHasHeader(!hasHeader)}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    hasHeader
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('firstRowAsKeys')}
                </button>
                <button
                  onClick={() => setPrettify(!prettify)}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    prettify
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('prettify')}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-2 block">{t('uploadFile')}</label>
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">{t('chooseFile')}</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
        
        {/* 输入输出区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('csvInput')}</h3>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={t('csvPlaceholder')}
              className="w-full h-96 px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('jsonOutput')}</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!jsonResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('copied') : t('copy')}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!jsonResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </button>
              </div>
            </div>
            <pre className="w-full h-96 px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 overflow-auto">
              {jsonResult || t('emptyResult')}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
