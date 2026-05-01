import React, { useState, useMemo } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Copy, Download, RefreshCw, Check, ChevronDown, ChevronRight } from 'lucide-react'
import DiffMatchPatch from 'diff-match-patch'

interface DiffLine {
  type: 'equal' | 'insert' | 'delete'
  content: string
  lineNumber: { left?: number; right?: number }
}

const CodeDiff: React.FC = () => {
  const { t } = useTranslation('toolCodeDiff')
  const [leftCode, setLeftCode] = useState('')
  const [rightCode, setRightCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [collapseUnchanged, setCollapseUnchanged] = useState(false)
  const [copied, setCopied] = useState(false)

  const dmp = useMemo(() => new DiffMatchPatch(), [])

  const diffLines = useMemo(() => {
    if (!leftCode && !rightCode) return []

    const diffs = dmp.diff_main(leftCode, rightCode)
    dmp.diff_cleanupSemantic(diffs)

    const lines: DiffLine[] = []
    let leftLineNum = 1
    let rightLineNum = 1

    diffs.forEach(([type, text]) => {
      const textLines = text.split('\n')
      
      textLines.forEach((line, index) => {
        // 跳过最后一个空行（split 产生的）
        if (index === textLines.length - 1 && line === '') return

        if (type === 0) { // equal
          lines.push({
            type: 'equal',
            content: line,
            lineNumber: { left: leftLineNum++, right: rightLineNum++ }
          })
        } else if (type === 1) { // insert
          lines.push({
            type: 'insert',
            content: line,
            lineNumber: { right: rightLineNum++ }
          })
        } else { // delete
          lines.push({
            type: 'delete',
            content: line,
            lineNumber: { left: leftLineNum++ }
          })
        }
      })
    })

    return lines
  }, [leftCode, rightCode, dmp])

  const displayLines = useMemo(() => {
    if (!collapseUnchanged) return diffLines

    const result: (DiffLine | { type: 'collapsed'; count: number })[] = []
    let unchangedCount = 0
    let unchangedBuffer: DiffLine[] = []

    diffLines.forEach((line, index) => {
      if (line.type === 'equal') {
        unchangedCount++
        unchangedBuffer.push(line)
      } else {
        // 遇到变化行，处理之前的未变化行
        if (unchangedCount > 6) {
          // 显示前3行
          result.push(...unchangedBuffer.slice(0, 3))
          // 折叠中间部分
          result.push({ type: 'collapsed', count: unchangedCount - 6 })
          // 显示后3行
          result.push(...unchangedBuffer.slice(-3))
        } else {
          result.push(...unchangedBuffer)
        }
        
        unchangedCount = 0
        unchangedBuffer = []
        result.push(line)
      }
    })

    // 处理最后的未变化行
    if (unchangedCount > 6) {
      result.push(...unchangedBuffer.slice(0, 3))
      result.push({ type: 'collapsed', count: unchangedCount - 6 })
      result.push(...unchangedBuffer.slice(-3))
    } else {
      result.push(...unchangedBuffer)
    }

    return result
  }, [diffLines, collapseUnchanged])

  const stats = useMemo(() => {
    const additions = diffLines.filter(l => l.type === 'insert').length
    const deletions = diffLines.filter(l => l.type === 'delete').length
    const unchanged = diffLines.filter(l => l.type === 'equal').length
    return { additions, deletions, unchanged, total: diffLines.length }
  }, [diffLines])

  const copyDiff = async () => {
    const diffText = diffLines.map(line => {
      const prefix = line.type === 'insert' ? '+ ' : line.type === 'delete' ? '- ' : '  '
      return prefix + line.content
    }).join('\n')
    
    await navigator.clipboard.writeText(diffText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadDiff = () => {
    const diffText = diffLines.map(line => {
      const prefix = line.type === 'insert' ? '+ ' : line.type === 'delete' ? '- ' : '  '
      return prefix + line.content
    }).join('\n')
    
    const blob = new Blob([diffText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code-diff.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setLeftCode('')
    setRightCode('')
  }

  const getLineClass = (type: string) => {
    switch (type) {
      case 'insert':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'delete':
        return 'bg-red-50 border-l-4 border-red-500'
      default:
        return 'bg-white'
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero
          title={t('title')}
          description={t('description')}
        />

        {/* 控制栏 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('language')}:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('showLineNumbers')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={collapseUnchanged}
                onChange={(e) => setCollapseUnchanged(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('collapseUnchanged')}</span>
            </label>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={copyDiff}
                disabled={!diffLines.length}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('copied') : t('copy')}
              </button>

              <button
                onClick={downloadDiff}
                disabled={!diffLines.length}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {t('download')}
              </button>

              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('clear')}
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          {diffLines.length > 0 && (
            <div className="flex gap-6 text-sm">
              <span className="text-green-600 font-medium">
                +{stats.additions} {t('additions')}
              </span>
              <span className="text-red-600 font-medium">
                -{stats.deletions} {t('deletions')}
              </span>
              <span className="text-gray-600">
                {stats.unchanged} {t('unchanged')}
              </span>
              <span className="text-gray-500">
                {t('total')}: {stats.total}
              </span>
            </div>
          )}
        </div>

        {/* 编辑器区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{t('original')}</h3>
            </div>
            <textarea
              value={leftCode}
              onChange={(e) => setLeftCode(e.target.value)}
              placeholder={t('pasteOriginal')}
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck={false}
            />
          </div>

          {/* 右侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{t('modified')}</h3>
            </div>
            <textarea
              value={rightCode}
              onChange={(e) => setRightCode(e.target.value)}
              placeholder={t('pasteModified')}
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck={false}
            />
          </div>
        </div>

        {/* 差异显示区域 */}
        {diffLines.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{t('diffResult')}</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="font-mono text-sm">
                {displayLines.map((item, index) => {
                  if ('count' in item) {
                    return (
                      <div
                        key={`collapsed-${index}`}
                        className="bg-gray-50 border-y border-gray-200 px-4 py-2 text-gray-500 text-center cursor-pointer hover:bg-gray-100"
                        onClick={() => setCollapseUnchanged(false)}
                      >
                        <ChevronDown className="w-4 h-4 inline mr-2" />
                        {t('expandLines', { count: item.count })}
                      </div>
                    )
                  }

                  const line = item as DiffLine
                  return (
                    <div
                      key={index}
                      className={`flex ${getLineClass(line.type)} hover:bg-opacity-80`}
                    >
                      {showLineNumbers && (
                        <div className="flex-shrink-0 w-24 px-2 py-1 text-gray-500 text-right select-none border-r border-gray-200">
                          <span className="inline-block w-10">{line.lineNumber.left || ''}</span>
                          <span className="inline-block w-10 ml-2">{line.lineNumber.right || ''}</span>
                        </div>
                      )}
                      <div className="flex-1 px-4 py-1 overflow-x-auto">
                        <span className={`inline-block w-4 ${
                          line.type === 'insert' ? 'text-green-600' : 
                          line.type === 'delete' ? 'text-red-600' : 
                          'text-gray-400'
                        }`}>
                          {line.type === 'insert' ? '+' : line.type === 'delete' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre">{line.content || ' '}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeDiff
