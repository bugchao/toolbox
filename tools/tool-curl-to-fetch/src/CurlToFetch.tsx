import React, { useState, useMemo } from 'react'
import { Copy, CheckCircle, ArrowRight } from 'lucide-react'

function parseCurl(curl: string): {
  method: string; url: string; headers: Record<string, string>;
  body: string | null; error?: string
} {
  try {
    const lines = curl.replace(/\\\n/g, ' ').trim()
    if (!lines.startsWith('curl')) return { method: 'GET', url: '', headers: {}, body: null, error: '请以 curl 开头' }

    const tokens = lines.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
    let method = 'GET'
    let url = ''
    const headers: Record<string, string> = {}
    let body: string | null = null
    let i = 1

    while (i < tokens.length) {
      const t = tokens[i]
      if (t === '-X' || t === '--request') {
        method = tokens[++i]
      } else if (t === '-H' || t === '--header') {
        const h = tokens[++i].replace(/^"|"$|^'|'$/g, '')
        const idx = h.indexOf(':')
        if (idx > 0) headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim()
      } else if (t === '-d' || t === '--data' || t === '--data-raw') {
        body = tokens[++i].replace(/^"|"$|^'|'$/g, '')
        if (method === 'GET') method = 'POST'
      } else if (t === '--data-urlencode') {
        body = tokens[++i].replace(/^"|"$|^'|'$/g, '')
        if (method === 'GET') method = 'POST'
      } else if (!t.startsWith('-') && !url) {
        url = t.replace(/^"|"$|^'|'$/g, '')
      }
      i++
    }
    if (!url) return { method, url, headers, body, error: '未找到 URL' }
    return { method, url, headers, body }
  } catch (e) {
    return { method: 'GET', url: '', headers: {}, body: null, error: '解析失败: ' + String(e) }
  }
}

function toFetch(parsed: ReturnType<typeof parseCurl>): string {
  if (parsed.error || !parsed.url) return '// 解析失败\n// ' + (parsed.error || '未找到 URL')

  const { method, url, headers, body } = parsed
  const lines: string[] = [`const response = await fetch('${url}', {`]

  if (method !== 'GET') lines.push(`  method: '${method}',`)

  if (Object.keys(headers).length > 0) {
    lines.push('  headers: {')
    for (const [k, v] of Object.entries(headers)) {
      lines.push(`    '${k}': '${v}',`)
    }
    lines.push('  },')
  }

  if (body) {
    try {
      JSON.parse(body)
      lines.push(`  body: JSON.stringify(${body}),`)
    } catch {
      lines.push(`  body: '${body}',`)
    }
  }

  lines.push('})')
  lines.push('')
  lines.push('const data = await response.json()')
  lines.push('console.log(data)')

  return lines.join('\n')
}

const SAMPLE = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your-token' \\
  -d '{ "name": "John", "email": "john@example.com" }'`

export function CurlToFetch() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => input.trim() ? parseCurl(input) : null, [input])
  const output = useMemo(() => parsed ? toFetch(parsed) : '', [parsed])

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">curl 转 fetch</h1>
      <p className="text-gray-500 dark:text-gray-400">将 curl 命令转换为 JavaScript fetch 代码</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 输入 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">curl 命令</label>
            <button onClick={() => setInput(SAMPLE)} className="text-xs text-indigo-500 hover:underline">加载示例</button>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={10}
            placeholder="curl https://api.example.com ..."
            className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        {/* 输出 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ArrowRight className="w-4 h-4 text-indigo-400" />fetch 代码
            </div>
            {output && (
              <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <div className="w-full h-[242px] px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre">
            {output || <span className="text-gray-400">转换结果将显示在这里</span>}
          </div>
        </div>
      </div>

      {/* 解析结果摘要 */}
      {parsed && !parsed.error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><div className="text-xs text-gray-400">Method</div><div className="font-mono font-bold text-indigo-500">{parsed.method}</div></div>
            <div className="sm:col-span-3"><div className="text-xs text-gray-400">URL</div><div className="font-mono text-gray-700 dark:text-gray-300 break-all">{parsed.url}</div></div>
            {Object.keys(parsed.headers).length > 0 && (
              <div className="col-span-2 sm:col-span-4">
                <div className="text-xs text-gray-400 mb-1">Headers ({Object.keys(parsed.headers).length})</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(parsed.headers).map(([k]) => (
                    <span key={k} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {parsed.body && (
              <div className="col-span-2 sm:col-span-4">
                <div className="text-xs text-gray-400 mb-1">Body</div>
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">{parsed.body.slice(0, 100)}{parsed.body.length > 100 ? '...' : ''}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {parsed?.error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-xl p-3">{parsed.error}</div>
      )}
    </div>
  )
}
