import React, { useState, useCallback } from 'react'
import { AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react'

function ipToNum(ip: string): number {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return NaN
  return parts.reduce((acc, p) => (acc << 8) + parseInt(p), 0) >>> 0
}

function isValidIp(ip: string): boolean {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(p => { const n = parseInt(p); return !isNaN(n) && n >= 0 && n <= 255 })
}

interface ConflictResult {
  ip: string
  lines: number[]
  count: number
}

export function DhcpConflict() {
  const [input, setInput] = useState('192.168.1.100\n192.168.1.101\n192.168.1.100\n192.168.1.102\n192.168.1.101')
  const [results, setResults] = useState<{ conflicts: ConflictResult[]; invalid: string[]; total: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const analyze = useCallback(() => {
    const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
    const map = new Map<number, { ip: string; lines: number[] }>()
    const invalid: string[] = []

    lines.forEach((line, idx) => {
      // 支持 "hostname IP" 或纯 IP 格式
      const parts = line.split(/\s+/)
      const ip = parts.find(p => isValidIp(p)) || ''
      if (!ip) { invalid.push(line); return }
      const num = ipToNum(ip)
      if (!map.has(num)) map.set(num, { ip, lines: [] })
      map.get(num)!.lines.push(idx + 1)
    })

    const conflicts: ConflictResult[] = []
    map.forEach(({ ip, lines }) => {
      if (lines.length > 1) conflicts.push({ ip, lines, count: lines.length })
    })

    conflicts.sort((a, b) => ipToNum(a.ip) - ipToNum(b.ip))
    setResults({ conflicts, invalid, total: lines.length })
  }, [input])

  const copyConflicts = useCallback(async () => {
    if (!results) return
    const text = results.conflicts.map(c => `${c.ip} (第 ${c.lines.join(', ')} 行)`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [results])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP 地址冲突检测</h1>
      <p className="text-gray-500 dark:text-gray-400">粘贴 DHCP 租约列表或 IP 清单，自动检测重复分配的地址</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IP 地址列表（每行一个，支持纯 IP 或 "主机名 IP" 格式）
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="192.168.1.100&#10;192.168.1.101&#10;192.168.1.100"
          />
        </div>
        <button onClick={analyze}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          检测冲突
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* 统计 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '总条目', value: results.total, color: 'text-gray-700 dark:text-gray-300' },
              { label: '冲突 IP', value: results.conflicts.length, color: results.conflicts.length > 0 ? 'text-red-500' : 'text-green-500' },
              { label: '无效条目', value: results.invalid.length, color: results.invalid.length > 0 ? 'text-orange-500' : 'text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* 冲突列表 */}
          {results.conflicts.length === 0 ? (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-green-700 dark:text-green-400">未发现地址冲突</span>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">发现 {results.conflicts.length} 个冲突 IP</span>
                </div>
                <button onClick={copyConflicts}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.conflicts.map(c => (
                  <div key={c.ip} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{c.ip}</span>
                    <span className="text-xs text-gray-500">重复 {c.count} 次 · 第 {c.lines.join(', ')} 行</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 无效条目 */}
          {results.invalid.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">无法解析的条目：</p>
              {results.invalid.map((line, i) => (
                <p key={i} className="text-xs font-mono text-orange-600 dark:text-orange-300">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
