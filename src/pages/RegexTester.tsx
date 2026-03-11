import React, { useState, useEffect } from 'react'
import { Search, Copy, Check, AlertCircle } from 'lucide-react'

const RegexTester: React.FC = () => {
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
          <span key={index} className="bg-yellow-200 px-1 rounded font-medium">
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">正则表达式测试工具</h2>
        <p className="text-gray-600">在线测试正则表达式，支持匹配结果高亮、分组显示</p>
      </div>

      <div className="space-y-6">
        {/* 正则输入 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">正则表达式</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-3 bg-gray-50 text-gray-500">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="输入正则表达式，例如: \d+"
                  className="flex-1 px-2 py-3 focus:outline-none font-mono"
                />
                <span className="px-3 py-3 bg-gray-50 text-gray-500">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="g"
                  className="w-16 px-2 py-3 border-l border-gray-300 focus:outline-none font-mono"
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
          <div className="mt-2 text-sm text-gray-600">
            <p>标志: g(全局) i(忽略大小写) m(多行) s(点匹配换行符) u(Unicode) y(粘性)</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 常用正则 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">常用正则表达式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonPatterns.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-md hover:border-indigo-300 cursor-pointer transition-colors"
                onClick={() => loadPattern(item.pattern)}
              >
                <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                <div className="text-xs font-mono text-gray-600 mb-1">{item.pattern}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 测试字符串 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">测试字符串</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="输入要测试的字符串..."
            className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 匹配结果 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">匹配结果</label>
            <span className="text-sm text-gray-500">找到 {matches.length} 个匹配</span>
          </div>

          {/* 高亮显示 */}
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap font-mono text-sm mb-4">
            {getHighlightedText()}
          </div>

          {/* 匹配详情 */}
          {matches.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">匹配内容</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{match[0]}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{match.index}</td>
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
