import React, { useState, useMemo } from 'react'
import { Copy, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react'

function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    return decodeURIComponent(atob(padded).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
  } catch {
    return ''
  }
}

interface JwtParts {
  header: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  signature: string
  valid: boolean
  error?: string
}

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return { header: null, payload: null, signature: '', valid: false, error: 'JWT 格式错误：应包含3段（header.payload.signature）' }
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    return { header, payload, signature: parts[2], valid: true }
  } catch (e) {
    return { header: null, payload: null, signature: '', valid: false, error: '解析失败：' + (e instanceof Error ? e.message : String(e)) }
  }
}

function formatTime(ts: number): string {
  try { return new Date(ts * 1000).toLocaleString('zh-CN') } catch { return String(ts) }
}

function isExpired(payload: Record<string, unknown>): boolean | null {
  if (!payload.exp) return null
  return Date.now() / 1000 > (payload.exp as number)
}

const SAMPLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const JsonBlock = ({ data, title }: { data: Record<string, unknown>; title: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
    </div>
    <div className="p-4">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {Object.entries(data).map(([k, v]) => {
            const isTime = (k === 'exp' || k === 'iat' || k === 'nbf') && typeof v === 'number'
            const expired = k === 'exp' ? isExpired(data) : null
            return (
              <tr key={k}>
                <td className="py-2 pr-4 font-mono text-indigo-500 font-medium whitespace-nowrap w-28">{k}</td>
                <td className="py-2 font-mono text-gray-700 dark:text-gray-300 break-all">
                  {isTime ? (
                    <span>
                      {String(v)}
                      <span className="ml-2 text-gray-400">({formatTime(v as number)})</span>
                      {expired === true && <span className="ml-2 text-red-500 text-xs">已过期</span>}
                      {expired === false && <span className="ml-2 text-green-500 text-xs">有效</span>}
                    </span>
                  ) : String(v)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

export function JwtDecoder() {
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => token.trim() ? parseJwt(token) : null, [token])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const expired = result?.payload ? isExpired(result.payload) : null

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JWT 解析工具</h1>
      <p className="text-gray-500 dark:text-gray-400">解码 JWT Token，查看 Header、Payload 内容及过期状态</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">JWT Token</label>
          <button onClick={() => { setToken(SAMPLE) }} className="text-xs text-indigo-500 hover:underline">加载示例</button>
        </div>
        <textarea value={token} onChange={e => setToken(e.target.value)} rows={4}
          placeholder="粘贴 JWT Token..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      {result && !result.valid && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 shrink-0" /><span className="text-sm">{result.error}</span>
        </div>
      )}

      {result?.valid && (
        <>
          {/* 状态 */}
          <div className={`flex items-center gap-2 rounded-xl p-4 border ${
            expired === true ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-600' :
            expired === false ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-600' :
            'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">
              {expired === true ? 'Token 已过期' : expired === false ? 'Token 有效' : 'Token 格式正确（无过期时间）'}
            </span>
            <span className="ml-auto text-xs">{result.header?.alg as string} / {result.header?.typ as string}</span>
          </div>

          {result.header && <JsonBlock data={result.header} title="Header" />}
          {result.payload && <JsonBlock data={result.payload} title="Payload" />}

          {/* 签名 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Signature</span>
              <button onClick={() => copy(result.signature)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}复制
              </button>
            </div>
            <div className="p-4 font-mono text-xs text-orange-500 break-all">{result.signature}</div>
          </div>
        </>
      )}
    </div>
  )
}
