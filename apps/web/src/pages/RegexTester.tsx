import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Copy, Check, AlertCircle } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const RegexTester: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const testRegex = () => {
    try {
      setError('')
      if (!pattern.trim()) {
        setError('请输入正则表达式')
        return
      }

      const regex = new RegExp(pattern, flags)
      const found = [...testString.matchAll(regex)]
      setMatches(found)
    } catch (e) {
      setError(`正则表达式错误: ${(e as Error).message}`)
      setMatches([])
    }
  }

  useEffect(() => {
    if (pattern && testString) {
      testRegex()
    } else {
      setMatches([])
      setError('')
    }
  }, [pattern, flags, testString])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setPattern('')
    setFlags('g')
    setTestString('')
    setMatches([])
    setError('')
  }

  // 高亮匹配结果
  const getHighlightedText = () => {
    if (!matches.length || !testString) return testString

    let lastIndex = 0
    const parts = []

    matches.forEach((match, index) => {
      if (match.index !== undefined) {
        if (match.index > lastIndex) {
          parts.push(testString.slice(lastIndex, match.index))
        }
        parts.push(
          <span key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded font-medium">
            {match[0]}
          </span>
        )
        lastIndex = match.index + match[0].length
      }
    })

    if (lastIndex < testString.length) {
      parts.push(testString.slice(lastIndex))
    }

    return parts
  }

  const commonPatterns = [
    { name: '手机号码', pattern: '^1[3-9]\\d{9}$', description: '匹配中国大陆手机号码' },
    { name: '邮箱地址', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: '匹配邮箱地址' },
    { name: 'URL地址', pattern: 'https?://(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)', description: '匹配HTTP/HTTPS URL' },
    { name: 'IP地址', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)', description: '匹配IPv4地址' },
    { name: '身份证号', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$', description: '匹配18位身份证号' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', description: '匹配中文字符' },
  ]

  const loadPattern = (p: string) => {
    setPattern(p)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('tools.regex')} description={tHome('toolDesc.regex')} className="mb-8" />

      <div className="space-y-6">
        {/* 正则输入 */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-edge">
          <h3 className="text-lg font-medium text-ink mb-4">正则表达式</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center border border-edge-strong rounded-md overflow-hidden">
                <span className="px-3 py-3 bg-surface-muted text-ink-muted">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="输入正则表达式，例如: \d+"
                  className="flex-1 px-2 py-3 focus:outline-none font-mono bg-surface text-ink"
                />
                <span className="px-3 py-3 bg-surface-muted text-ink-muted">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="g"
                  className="w-16 px-2 py-3 border-l border-edge-strong focus:outline-none font-mono bg-surface text-ink"
                />
              </div>
            </div>
            <button
              onClick={testRegex}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              测试
            </button>
          </div>

          {/* 标志说明 */}
          <div className="mt-2 text-sm text-ink-muted">
            <p>标志: g(全局) i(忽略大小写) m(多行) s(点匹配换行符) u(Unicode) y(粘性)</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 常用正则 */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-edge">
          <h3 className="text-lg font-medium text-ink mb-4">常用正则表达式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonPatterns.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-edge rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                onClick={() => loadPattern(item.pattern)}
              >
                <div className="font-medium text-ink mb-1">{item.name}</div>
                <div className="text-xs font-mono text-ink-muted mb-1">{item.pattern}</div>
                <div className="text-xs text-ink-muted">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 测试字符串 */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">测试字符串</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="输入要测试的字符串..."
            className="w-full h-48 p-4 border border-edge-strong rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 匹配结果 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-ink">匹配结果</label>
            <span className="text-sm text-ink-muted">找到 {matches.length} 个匹配</span>
          </div>

          {/* 高亮显示 */}
          <div className="p-4 border border-edge-strong rounded-md bg-surface-muted min-h-[100px] whitespace-pre-wrap font-mono text-sm mb-4 text-ink">
            {getHighlightedText()}
          </div>

          {/* 匹配详情 */}
          {matches.length > 0 && (
            <div className="bg-surface border border-edge rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-edge">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">序号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">匹配内容</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">位置</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-edge">
                  {matches.map((match, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-ink">{index + 1}</td>
                      <td className="px-4 py-2 text-sm font-mono text-ink">{match[0]}</td>
                      <td className="px-4 py-2 text-sm text-ink-muted">{match.index}</td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => copyToClipboard(match[0])}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  )
}

export default RegexTester
